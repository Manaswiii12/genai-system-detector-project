import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { text } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are an expert academic document analyzer. Analyze the provided document text and determine:

1. Whether it is a literature survey/review paper
2. Extract key sections: references, methodologies, and summarized works
3. Assess coverage, relevance, and gaps

Return a JSON response using the tool provided.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Analyze this document:\n\n${text.slice(0, 15000)}` },
        ],
        tools: [{
          type: "function",
          function: {
            name: "literature_analysis",
            description: "Return structured analysis of an academic document",
            parameters: {
              type: "object",
              properties: {
                is_literature_survey: { type: "boolean", description: "Whether the document is a literature survey/review" },
                confidence: { type: "number", description: "Confidence score 0-100" },
                document_type: { type: "string", description: "Type of document (e.g., Literature Survey, Research Paper, Thesis, Report, Other)" },
                title: { type: "string", description: "Detected or inferred title" },
                summary: { type: "string", description: "Brief summary of the document" },
                key_sections: {
                  type: "object",
                  properties: {
                    methodologies: { type: "array", items: { type: "string" }, description: "Methodologies identified" },
                    references_found: { type: "number", description: "Approximate number of references" },
                    summarized_works: { type: "array", items: { type: "object", properties: { author: { type: "string" }, topic: { type: "string" } }, required: ["topic"] }, description: "Key works summarized in the document" },
                  },
                  required: ["methodologies", "references_found", "summarized_works"],
                },
                coverage_analysis: {
                  type: "object",
                  properties: {
                    topics_covered: { type: "array", items: { type: "string" } },
                    depth_rating: { type: "string", enum: ["Shallow", "Moderate", "Deep", "Comprehensive"] },
                    relevance_score: { type: "number", description: "0-100" },
                  },
                  required: ["topics_covered", "depth_rating", "relevance_score"],
                },
                gaps: { type: "array", items: { type: "string" }, description: "Identified gaps in the survey" },
                recommendations: { type: "array", items: { type: "string" }, description: "Suggestions for improvement" },
              },
              required: ["is_literature_survey", "confidence", "document_type", "summary", "key_sections", "coverage_analysis", "gaps", "recommendations"],
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "literature_analysis" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) return new Response(JSON.stringify({ error: "Rate limit exceeded." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (response.status === 402) return new Response(JSON.stringify({ error: "AI credits exhausted." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("No analysis returned");

    const analysis = JSON.parse(toolCall.function.arguments);
    return new Response(JSON.stringify(analysis), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("analyze-literature error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
