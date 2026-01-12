#!/bin/bash

# Token Launcher Setup Script

echo "🚀 Token Launcher - Setup"
echo "========================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js first."
    exit 1
fi

echo "✅ Node.js found: $(node --version)"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found. Creating from template..."
    cp .env.example .env 2>/dev/null || echo "Please create .env file with required variables"
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "📋 Next steps:"
echo "   1. Update .env with your API keys"
echo "   2. Run: npm run dev"
echo "   3. Backend will be at http://localhost:3001"
echo ""
echo "📡 Test endpoint:"
echo "   POST http://localhost:3001/api/agent/launch"
