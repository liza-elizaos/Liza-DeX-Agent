#!/bin/bash

echo "🚀 Pump.fun Dashboard Setup"
echo "============================"
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed"
    echo "Download from: https://nodejs.org"
    exit 1
fi

echo "✅ Node.js: $(node -v)"
echo "✅ npm: $(npm -v)"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -eq 0 ]; then
    echo "✅ Dependencies installed"
else
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "🚀 To start development:"
echo "   npm run dev"
echo ""
echo "📦 To build for production:"
echo "   npm run build"
echo ""
echo "🌐 To deploy to Vercel:"
echo "   npm run deploy"
echo ""
