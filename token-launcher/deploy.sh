#!/bin/bash
# LIZA Token Launcher - Production Deployment Script

echo "🚀 LIZA Token Launcher - Vercel Deployment"
echo "==========================================="
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not installed"
    echo "📥 Installing: npm install -g vercel"
    npm install -g vercel
fi

# Build the project
echo ""
echo "📦 Building project..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed"
    exit 1
fi

echo "✅ Build successful"

# Check environment variables
echo ""
echo "🔐 Checking environment variables..."

if [ -z "$SOLANA_RPC_URL" ]; then
    echo "⚠️  SOLANA_RPC_URL not set"
fi

if [ -z "$PUMPPORTAL_API_KEY" ]; then
    echo "⚠️  PUMPPORTAL_API_KEY not set"
fi

if [ -z "$OPENROUTER_API_KEY" ]; then
    echo "⚠️  OPENROUTER_API_KEY not set"
fi

# Deploy to Vercel
echo ""
echo "🚀 Deploying to Vercel..."
vercel --prod

echo ""
echo "✨ Deployment complete!"
echo ""
echo "📊 Next steps:"
echo "1. Visit your Vercel deployment URL"
echo "2. Test the chat interface"
echo "3. Create a test token"
echo "4. Share with your team!"
