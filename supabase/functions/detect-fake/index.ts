import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { text, type } = await req.json(); // type: "review" | "news"
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are an expert misinformation and fake content detector. Analyze the provided ${type === "news" ? "news article" : "review"} text for authenticity.

Look for:
- Exaggerated or sensational language
- Logical inconsistencies
- Emotional manipulation tactics
- Repetitive phrases or patterns
- Missing source attribution
- Unverifiable claims
- Bot-like writing patterns
- Clickbait indicators

Provide a thorough analysis using the tool provided.`;

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
          { role: "user", content: `Analyze this ${type === "news" ? "news article" : "review"} for authenticity:\n\n${text.slice(0, 10000)}` },
        ],
        tools: [{
          type: "function",
          function: {
            name: "fake_detection_analysis",
            description: "Return structured fake content detection results",
            parameters: {
              type: "object",
              properties: {
                verdict: { type: "string", enum: ["Likely Genuine", "Suspicious", "Likely Fake"], description: "Overall verdict" },
                confidence_score: { type: "number", description: "Confidence 0-100" },
                authenticity_score: { type: "number", description: "How authentic the content appears, 0-100 (100 = genuine)" },
                suspicious_patterns: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      pattern: { type: "string", description: "Name of the pattern detected" },
                      severity: { type: "string", enum: ["Low", "Medium", "High"] },
                      evidence: { type: "string", description: "Specific text or example" },
                      explanation: { type: "string" },
                    },
                    required: ["pattern", "severity", "explanation"],
                  },
                },
                language_analysis: {
                  type: "object",
                  properties: {
                    tone: { type: "string" },
                    objectivity_score: { type: "number", description: "0-100, 100 = fully objective" },
                    sensationalism_level: { type: "string", enum: ["None", "Low", "Moderate", "High", "Extreme"] },
                  },
                  required: ["tone", "objectivity_score", "sensationalism_level"],
                },
                fact_check_suggestions: { type: "array", items: { type: "string" }, description: "Claims that should be fact-checked" },
                summary: { type: "string", description: "Overall summary of findings" },
              },
              required: ["verdict", "confidence_score", "authenticity_score", "suspicious_patterns", "language_analysis", "summary"],
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "fake_detection_analysis" } },
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
    console.error("detect-fake error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
