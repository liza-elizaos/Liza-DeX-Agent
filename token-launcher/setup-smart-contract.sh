#!/bin/bash
# Setup Pump.fun Smart Contract (m4rcu5o repo - Best quality)
# This creates a local Solana smart contract for token creation

set -e

REPO_DIR="/tmp/pumpfun-smartcontract"
NETWORK="devnet" # Test on devnet first

echo "============================================================"
echo "🚀 PUMP.FUN SMART CONTRACT SETUP"
echo "============================================================"
echo ""

# Check requirements
echo "📋 Checking requirements..."
command -v rustc >/dev/null 2>&1 || { echo "❌ Rust not installed. Install from https://rustup.rs/"; exit 1; }
command -v anchor >/dev/null 2>&1 || { echo "❌ Anchor not installed. Run: cargo install --git https://github.com/coral-xyz/anchor avm --locked && avm install latest && avm use latest"; exit 1; }
command -v solana >/dev/null 2>&1 || { echo "❌ Solana CLI not installed. Visit https://docs.solana.com/cli/install-solana-cli-tools"; exit 1; }

echo "✅ All tools installed"
echo ""

# Clone repo
if [ -d "$REPO_DIR" ]; then
    echo "📁 Repository already exists at $REPO_DIR"
    cd "$REPO_DIR"
else
    echo "📥 Cloning m4rcu5o Pump.fun Smart Contract..."
    git clone https://github.com/m4rcu5o/Solana-pumpfun-smart-contract.git "$REPO_DIR"
    cd "$REPO_DIR"
fi

echo ""
echo "📦 Installing dependencies..."
npm install
yarn install 2>/dev/null || true

echo ""
echo "🏗️  Building smart contract..."
anchor build

echo ""
echo "=========================================="
echo "✅ Smart Contract Ready!"
echo "=========================================="
echo ""
echo "📍 Next steps:"
echo "   1. Configure Solana CLI: solana config set --url https://api.devnet.solana.com"
echo "   2. Deploy to devnet: anchor deploy"
echo "   3. Run tests: anchor test"
echo ""
echo "Directory: $REPO_DIR"
echo ""
