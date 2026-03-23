import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { resumeSkills, resumeText, jobDescription } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: "You are a job matching expert. Compare the candidate's resume against the job description. Provide detailed skill matching analysis.",
          },
          {
            role: "user",
            content: `Resume Skills: ${JSON.stringify(resumeSkills)}\n\nResume Text:\n${resumeText}\n\nJob Description:\n${jobDescription}\n\nAnalyze the match between this resume and job description.`,
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "job_match_analysis",
              description: "Job match analysis result",
              parameters: {
                type: "object",
                properties: {
                  match_score: { type: "number", description: "Overall match percentage 0-100" },
                  matched_skills: { type: "array", items: { type: "string" } },
                  missing_skills: { type: "array", items: { type: "string" } },
                  recommended_skills: { type: "array", items: { type: "string" }, description: "Skills to learn to improve match" },
                  job_required_skills: { type: "array", items: { type: "string" } },
                  skill_gap_priority: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        skill: { type: "string" },
                        priority: { type: "string", enum: ["high", "medium", "low"] },
                        reason: { type: "string" },
                      },
                      required: ["skill", "priority"],
                      additionalProperties: false,
                    },
                  },
                  resume_tips: { type: "array", items: { type: "string" }, description: "Tips to tailor resume for this job" },
                },
                required: ["match_score", "matched_skills", "missing_skills", "recommended_skills", "job_required_skills"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "job_match_analysis" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error("AI gateway error: " + response.status);
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    const result = toolCall ? JSON.parse(toolCall.function.arguments) : {};

    return new Response(JSON.stringify({ result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("match-job error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
