import "jsr:@supabase/functionsjs/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const HF_EMBED_URL =
  "https://api-inference.huggingface.co/pipeline/feature-extraction/sentence-transformers/all-MiniLM-L6-v2";
const CHUNK_SIZE = 500;
const OVERLAP = 50;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function chunkText(text: string): string[] {
  const chunks: string[] = [];
  let start = 0;
  while (start < text.length) {
    let end = Math.min(start + CHUNK_SIZE, text.length);
    if (end < text.length) {
      const lastSpace = text.lastIndexOf(" ", end);
      if (lastSpace > start) end = lastSpace;
    }
    chunks.push(text.slice(start, end).trim());
    start = end - OVERLAP;
    if (start >= text.length) break;
  }
  return chunks.filter((c) => c.length > 0);
}

async function getEmbedding(input: string, apiKey: string): Promise<number[]> {
  const res = await fetch(HF_EMBED_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ inputs: input, options: { wait_for_model: true } }),
  });
  if (!res.ok) throw new Error(await res.text());
  return (await res.json()) as number[];
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
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser(
      authHeader.replace("Bearer ", "")
    );
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { bookId } = (await req.json()) as { bookId: string };
    if (!bookId) {
      return new Response(
        JSON.stringify({ error: "bookId is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const hfKey = Deno.env.get("HUGGINGFACE_API_KEY");
    if (!hfKey) {
      return new Response(
        JSON.stringify({ error: "HUGGINGFACE_API_KEY not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: book } = await supabase
      .from("books")
      .select("id, title, author, description, summary")
      .eq("id", bookId)
      .single();

    if (!book) {
      return new Response(
        JSON.stringify({ error: "Book not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const fullText = [book.title, book.author, book.description, book.summary]
      .filter(Boolean)
      .join("\n\n");
    const chunks = chunkText(fullText);

    await supabase.from("embeddings").delete().eq("book_id", bookId);

    for (let i = 0; i < chunks.length; i++) {
      const embedding = await getEmbedding(chunks[i], hfKey);
      await supabase.from("embeddings").insert({
        book_id: bookId,
        chunk_index: i,
        content: chunks[i],
        embedding,
      });
    }

    return new Response(
      JSON.stringify({ success: true, chunks: chunks.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
