#!/bin/bash

# Deploy edge function to Supabase
echo "Deploying book-ai-tools edge function..."

supabase functions deploy book-ai-tools --no-verify-jwt

echo "Deployment complete!"
echo ""
echo "Make sure to set these secrets in Supabase:"
echo "  supabase secrets set GROQ_API_KEY=your_groq_api_key"
