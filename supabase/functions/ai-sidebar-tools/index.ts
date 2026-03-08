import "jsr:@supabase/functionsjs/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "llama-3.3-70b-versatile";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type Tool = "chat" | "explain" | "summary" | "questions";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );

    const {
      data: { user },
    } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const role = (user.user_metadata as any)?.role as string | undefined;
    if (!["student", "teacher", "admin"].includes(role ?? "")) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = (await req.json()) as
      | { tool: "chat"; message: string; context?: string }
      | { tool: Exclude<Tool, "chat">; text: string };

    const tool = body.tool;

    if (tool === "chat") {
      const { message, context } = body;
      const systemContent = context
        ? `You are an AI assistant for Smart Knowledge Ethiopia. Use ONLY this context to answer:\n\n${context.slice(
            0,
            6000,
          )}`
        : "You are an AI assistant for Smart Knowledge Ethiopia.";

      const groqKey = Deno.env.get("GROQ_API_KEY");
      if (!groqKey) {
        return new Response(JSON.stringify({ error: "GROQ_API_KEY not configured" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const res = await fetch(GROQ_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${groqKey}`,
        },
        body: JSON.stringify({
          model: MODEL,
          messages: [
            { role: "system", content: systemContent },
            { role: "user", content: message },
          ],
          max_tokens: 1024,
          temperature: 0.3,
        }),
      });

      if (!res.ok) {
        return new Response(JSON.stringify({ error: await res.text() }), {
          status: 502,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const json = await res.json();
      const output = json.choices?.[0]?.message?.content?.trim() ?? "";

      return new Response(JSON.stringify({ output }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const text = (body as any).text as string;
    const geminiKey = Deno.env.get("GEMINI_API_KEY");
    if (!geminiKey) {
      return new Response(JSON.stringify({ error: "GEMINI_API_KEY not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let prompt = "";

    if (tool === "summary") {
      prompt = `Summarize the following content in 3–5 bullet points for Ethiopian students:\n\n${text}`;
    } else if (tool === "explain") {
      prompt = `Explain the following content in simple language suitable for Ethiopian high school students:\n\n${text}`;
    } else if (tool === "questions") {
      prompt = `Generate 3–5 numbered study questions based on this content:\n\n${text}`;
    }

    const res = await fetch(`${GEMINI_URL}?key=${geminiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: 1024, temperature: 0.4 },
      }),
    });

    if (!res.ok) {
      return new Response(JSON.stringify({ error: await res.text() }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const json = await res.json();
    const output = json.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? "";

    return new Response(JSON.stringify({ output }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});

