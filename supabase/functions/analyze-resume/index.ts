import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { resumeText, action, jobDescription } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    let systemPrompt = "";
    let userPrompt = "";

    if (action === "parse") {
      systemPrompt = `You are a resume parsing expert. Extract structured data from the resume text provided. Return a JSON object using this exact tool call.`;
      userPrompt = `Parse this resume and extract structured data:\n\n${resumeText}`;
    } else if (action === "ats_score") {
      systemPrompt = `You are an ATS (Applicant Tracking System) expert. Analyze the resume for ATS compatibility. Score each section and provide actionable feedback.`;
      userPrompt = `Analyze this resume for ATS compatibility and score it:\n\n${resumeText}${jobDescription ? `\n\nTarget Job Description:\n${jobDescription}` : ""}`;
    } else if (action === "improve") {
      systemPrompt = `You are a professional resume writer. Improve the resume content with stronger action verbs, quantified achievements, and better formatting suggestions.`;
      userPrompt = `Improve this resume content with specific suggestions:\n\n${resumeText}`;
    } else {
      throw new Error("Invalid action: " + action);
    }

    const tools = [];
    let tool_choice: any = undefined;

    if (action === "parse") {
      tools.push({
        type: "function",
        function: {
          name: "extract_resume_data",
          description: "Extract structured resume data",
          parameters: {
            type: "object",
            properties: {
              name: { type: "string", description: "Full name" },
              email: { type: "string", description: "Email address" },
              phone: { type: "string", description: "Phone number" },
              location: { type: "string", description: "Location/city" },
              summary: { type: "string", description: "Professional summary" },
              skills: { type: "array", items: { type: "string" }, description: "List of skills" },
              experience: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    title: { type: "string" },
                    company: { type: "string" },
                    duration: { type: "string" },
                    description: { type: "string" },
                  },
                  required: ["title", "company"],
                  additionalProperties: false,
                },
              },
              education: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    degree: { type: "string" },
                    institution: { type: "string" },
                    year: { type: "string" },
                  },
                  required: ["degree", "institution"],
                  additionalProperties: false,
                },
              },
              projects: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    name: { type: "string" },
                    description: { type: "string" },
                    technologies: { type: "array", items: { type: "string" } },
                  },
                  required: ["name"],
                  additionalProperties: false,
                },
              },
              certifications: { type: "array", items: { type: "string" } },
            },
            required: ["name", "skills", "experience", "education"],
            additionalProperties: false,
          },
        },
      });
      tool_choice = { type: "function", function: { name: "extract_resume_data" } };
    } else if (action === "ats_score") {
      tools.push({
        type: "function",
        function: {
          name: "ats_analysis",
          description: "ATS compatibility analysis",
          parameters: {
            type: "object",
            properties: {
              overall_score: { type: "number", description: "Overall ATS score 0-100" },
              keyword_match_score: { type: "number", description: "Keyword match percentage 0-100" },
              formatting_score: { type: "number", description: "Formatting score 0-100" },
              section_completeness_score: { type: "number", description: "Section completeness 0-100" },
              experience_score: { type: "number", description: "Experience quality 0-100" },
              skills_score: { type: "number", description: "Skills relevance 0-100" },
              missing_keywords: { type: "array", items: { type: "string" } },
              weak_sections: { type: "array", items: { type: "string" } },
              strengths: { type: "array", items: { type: "string" } },
              recommendations: { type: "array", items: { type: "string" } },
            },
            required: ["overall_score", "keyword_match_score", "formatting_score", "section_completeness_score", "missing_keywords", "recommendations"],
            additionalProperties: false,
          },
        },
      });
      tool_choice = { type: "function", function: { name: "ats_analysis" } };
    } else if (action === "improve") {
      tools.push({
        type: "function",
        function: {
          name: "resume_improvements",
          description: "Resume improvement suggestions",
          parameters: {
            type: "object",
            properties: {
              suggestions: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    type: { type: "string", enum: ["bullet_point", "summary", "project", "skill", "general"] },
                    original: { type: "string" },
                    improved: { type: "string" },
                    reason: { type: "string" },
                  },
                  required: ["type", "improved", "reason"],
                  additionalProperties: false,
                },
              },
              summary_suggestion: { type: "string", description: "Optimized professional summary" },
              action_verbs: { type: "array", items: { type: "string" }, description: "Recommended action verbs" },
            },
            required: ["suggestions", "summary_suggestion", "action_verbs"],
            additionalProperties: false,
          },
        },
      });
      tool_choice = { type: "function", function: { name: "resume_improvements" } };
    }

    const body: any = {
      model: "google/gemini-3-flash-preview",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    };

    if (tools.length > 0) {
      body.tools = tools;
      body.tool_choice = tool_choice;
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error("AI gateway error: " + response.status);
    }

    const data = await response.json();
    let result: any;

    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (toolCall) {
      result = JSON.parse(toolCall.function.arguments);
    } else {
      result = { content: data.choices?.[0]?.message?.content || "" };
    }

    return new Response(JSON.stringify({ result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-resume error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
