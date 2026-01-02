#!/bin/bash

echo "🚀 Deploying SHINA to Vercel..."
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found!"
    echo "📦 Installing Vercel CLI..."
    npm i -g vercel
fi

echo "✅ Vercel CLI found"
echo ""

# Check if logged in
echo "🔐 Checking Vercel login status..."
if ! vercel whoami &> /dev/null; then
    echo "⚠️  Not logged in. Please login:"
    vercel login
fi

echo ""
echo "📦 Building project..."
npm run build

echo ""
echo "🚀 Deploying to Vercel..."
vercel --prod

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📝 Don't forget to set environment variables in Vercel dashboard:"
echo "   - SOLANA_RPC_URL"
echo "   - SOLANA_NETWORK"
echo "   - JUPITER_API_URL"
echo "   - JUPITER_API_KEY"
echo ""
echo "🌐 Your app will be live at: https://your-project.vercel.app"

