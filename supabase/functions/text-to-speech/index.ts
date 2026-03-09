import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    )

    // Verify user authentication
    const {
      data: { user },
      error: authError,
    } = await supabaseClient.auth.getUser()

    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    // Check user role
    const userRole = user.user_metadata?.role || "guest"
    if (!["student", "teacher", "admin"].includes(userRole)) {
      return new Response(
        JSON.stringify({ error: "Voice reading is only available for students, teachers, and admins" }),
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      )
    }

    const { text, voice = "en-US", rate = 1.0 } = await req.json()

    if (!text) {
      return new Response(JSON.stringify({ error: "Text is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    // Log usage for analytics
    await supabaseClient.from("ai_usage_logs").insert({
      user_id: user.id,
      feature_type: "tts",
      tokens_used: Math.ceil(text.length / 4), // Approximate token count
    })

    // For now, return a success response
    // In production, you would integrate with Google TTS API or similar
    // Example: https://cloud.google.com/text-to-speech/docs/reference/rest
    
    return new Response(
      JSON.stringify({
        success: true,
        message: "TTS request processed. Use browser's native speechSynthesis API for now.",
        textLength: text.length,
        voice,
        rate,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    )
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  }
})
