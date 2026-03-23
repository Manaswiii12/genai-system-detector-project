import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, resumeContext, domain } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const domainPrompts: Record<string, string> = {
      resume: `You are a career advisor AI assistant specializing in resume optimization and job searching.
${resumeContext ? `The user's resume data:\n${JSON.stringify(resumeContext, null, 2)}` : "The user hasn't uploaded a resume yet. Encourage them to upload one for personalized advice."}
Guidelines:
- Be concise, actionable, and encouraging
- Reference specific details from the user's resume when available
- Provide specific examples when suggesting improvements
- Use markdown formatting for readability
- If asked to rewrite something, provide the improved version directly`,

      research: `You are an academic research assistant. Help users with:
- Literature review guidance and methodology
- Research paper structure and writing
- Citation and reference management
- Identifying research gaps and opportunities
- Understanding research methodologies
Be scholarly but accessible. Use markdown formatting.`,

      fake_detection: `You are a misinformation and fake content analysis expert. Help users with:
- Identifying red flags in reviews or news articles
- Understanding propaganda and manipulation techniques
- Fact-checking strategies and resources
- Media literacy and critical thinking
Be objective and evidence-based. Use markdown formatting.`,

      general: `You are a helpful multi-domain AI assistant. You can help with:
- Resume and career advice
- Academic research questions
- Content authenticity analysis
- General knowledge queries
Identify the user's domain of interest and provide focused help. Use markdown formatting.`,
    };

    const detectedDomain = domain || "general";
    const systemPrompt = domainPrompts[detectedDomain] || domainPrompts.general;

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
          ...messages,
        ],
        stream: true,
      }),
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
      console.error("AI chat error:", response.status, t);
      throw new Error("AI gateway error");
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("ai-chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
