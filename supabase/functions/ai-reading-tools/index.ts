import "jsr:@supabase/functionsjs/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type ToolKind =
  | "summary"
  | "explanation"
  | "questions"
  | "notes"
  | "translate";

function buildPrompt(kind: ToolKind, text: string, targetLanguage?: string): string {
  switch (kind) {
    case "summary":
      return `You are an AI reading assistant for Ethiopian students.\n\nSummarize the following page in 3-5 concise sentences.\nFocus on the main ideas only.\n\nText:\n${text}`;
    case "explanation":
      return `Explain the following page in simple language for a high school student in Ethiopia.\nAvoid jargon and be very clear.\n\nText:\n${text}`;
    case "questions":
      return `Generate 3-5 study questions based only on the following page.\nMix factual and conceptual questions and number them.\n\nText:\n${text}`;
    case "notes":
      return `Create structured bullet-point study notes from the following page.\nUse nested bullets for sub-points.\n\nText:\n${text}`;
    case "translate": {
      const lang = targetLanguage ?? "Amharic";
      return `Translate the following explanation into ${lang} for Ethiopian students. Keep it clear and natural.\n\nText:\n${text}`;
    }
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const body = (await req.json()) as {
      documentId: string;
      chunkIndex: number;
      tool: ToolKind;
      targetLanguage?: string;
    };

    const { documentId, chunkIndex, tool, targetLanguage } = body;

    if (!documentId || typeof chunkIndex !== "number" || !tool) {
      return new Response(
        JSON.stringify({ error: "documentId, chunkIndex and tool are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const { data: doc, error: docError } = await supabase
      .from("reading_documents")
      .select("id, user_id")
      .eq("id", documentId)
      .single();

    if (docError || !doc || doc.user_id !== user.id) {
      return new Response(
        JSON.stringify({ error: "Document not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const { data: chunk, error: chunkError } = await supabase
      .from("reading_chunks")
      .select("content")
      .eq("document_id", documentId)
      .eq("chunk_index", chunkIndex)
      .single();

    if (chunkError || !chunk) {
      return new Response(
        JSON.stringify({ error: "Chunk not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const geminiKey = Deno.env.get("GEMINI_API_KEY");
    if (!geminiKey) {
      return new Response(
        JSON.stringify({ error: "GEMINI_API_KEY not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const prompt = buildPrompt(tool, chunk.content, targetLanguage);

    const res = await fetch(`${GEMINI_URL}?key=${geminiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: 1024, temperature: 0.4 },
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      return new Response(
        JSON.stringify({ error: err || res.statusText }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const json = await res.json();
    const output = json.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? "";

    return new Response(
      JSON.stringify({ output }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});

