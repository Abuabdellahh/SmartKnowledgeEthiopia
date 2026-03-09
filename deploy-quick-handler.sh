#!/bin/bash

# Deploy quick-handler edge function to Supabase
# Usage: ./deploy-quick-handler.sh

echo "🚀 Deploying quick-handler edge function..."

supabase functions deploy quick-handler --no-verify-jwt

if [ $? -eq 0 ]; then
    echo "✅ quick-handler deployed successfully!"
    echo ""
    echo "📝 Next steps:"
    echo "1. Set GROQ_API_KEY secret: supabase secrets set GROQ_API_KEY=your_key_here"
    echo "2. Test the function in your app"
else
    echo "❌ Deployment failed. Check your Supabase CLI setup."
    exit 1
fi
