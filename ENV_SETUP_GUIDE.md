# 🔧 Environment Setup Guide

Complete guide to configure Liza for local development and production deployment.

## ⚡ Quick Start (5 minutes)

### 1. Copy Template
```bash
cp .env.example .env.local
```

### 2. Generate Solana Wallet (if you don't have one)
```bash
# Install Solana CLI
npm install -g @solana-labs/cli

# Generate new keypair
solana-keygen new --no-passphrase

# Get your wallet address
solana address

# Get private key (base58)
solana config get
cat ~/.config/solana/id.json  # Shows your keypair
```

### 3. Get API Keys
- **OpenRouter**: https://openrouter.ai (Sign up → API Keys)
- **Anthropic**: https://console.anthropic.com (Alternative AI provider)

### 4. Fill `.env.local`
Required variables (blocking):
```env
SOLANA_PUBLIC_KEY=YOUR_WALLET_ADDRESS
SOLANA_PRIVATE_KEY=YOUR_BASE58_PRIVATE_KEY
OPENROUTER_API_KEY=YOUR_KEY_HERE
```

### 5. Start Local Server
```bash
npm install
npm run dev
```

## 📁 Environment Files

### `.env.local` (Production)
- **Used by**: Vercel deployment, production builds
- **Purpose**: Mainnet trading with real SOL
- **Create**: `cp .env.example .env.local`
- **Deploy**: Add variables to Vercel environment settings

### `.env.development` (Local Testing)
- **Used by**: `npm run dev` on your machine
- **Purpose**: Local testing on devnet (fake SOL)
- **Difference from production**: Devnet RPC, debug mode
- **File should exist at**: root directory

### `.env.example` (Reference)
- **Used by**: Documentation
- **Purpose**: Shows all available variables
- **Do NOT use directly**: Copy and customize

## 🔑 Required Variables Explained

### Solana Blockchain
```env
SOLANA_PUBLIC_KEY=9x1y2z3a4b5c6d7e8f9g0h1i2j3k4l5m6n  # Your wallet address
SOLANA_PRIVATE_KEY=YOUR_BASE58_ENCODED_KEY           # From solana-keygen
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com   # Primary RPC
SOLANA_RPC_URL_BACKUP=https://solana-mainnet.rpc...  # Fallback RPC
```

### AI/LLM (Choose ONE)
```env
# Option 1: OpenRouter (Recommended)
OPENROUTER_API_KEY=sk-or-v1-xxxxx
OPENROUTER_MODEL=meta-llama/llama-2-7b-chat

# Option 2: Anthropic Claude
ANTHROPIC_API_KEY=sk-ant-xxxxx
ANTHROPIC_MODEL=claude-3-5-sonnet-20241022
```

### Token Mints
Pre-configured in `.env.local` - DO NOT CHANGE:
- SOL, USDC, USDT, mSOL, BONK, JUP

## ✅ Verification Checklist

After setting up .env.local, test each component:

### Test Balance Check
```bash
curl "https://shina-ten.vercel.app/api/balance?wallet=YOUR_WALLET_ADDRESS"
```

### Test Portfolio
```bash
curl "https://shina-ten.vercel.app/api/portfolio?wallet=YOUR_WALLET_ADDRESS"
```

### Test Swap Quote
```bash
curl "https://shina-ten.vercel.app/api/swap?inputMint=So11111111111111111111111111111111111111112&outputMint=EPjFWaLb3crJC2z8rxVmE4Gnjg1d4PjNiYq4a8JqkEH&amount=1000000000"
```

### Test Chat
```bash
curl -X POST "https://shina-ten.vercel.app/api/chat" \
  -H "Content-Type: application/json" \
  -d '{"message": "what is my balance?", "sessionId": "test123"}'
```

## 🚀 Deployment Steps

### To Vercel
1. Fill `.env.local` with your credentials
2. Go to vercel.com dashboard
3. Select your project
4. Settings → Environment Variables
5. Add each variable from `.env.local`
6. Run: `vercel --prod`
7. Check: https://shina-ten.vercel.app

### To Docker (if using)
```bash
# Copy environment to container
docker run --env-file .env.local -p 3000:3000 liza:latest
```

## 🔒 Security Notes

⚠️ **CRITICAL**:
- Never commit `.env.local` to git (already in .gitignore)
- Never share SOLANA_PRIVATE_KEY
- Keep OPENROUTER_API_KEY private
- Use different keys for dev/prod if possible
- Rotate keys if compromised

✅ **Best Practices**:
- Use minimal permissions for API keys
- Enable rate limiting (already configured)
- Monitor transaction activity
- Test on devnet first (use .env.development)

## 🐛 Troubleshooting

### "Cannot find module 'dotenv'"
```bash
npm install dotenv
```

### "Invalid Solana wallet"
Check SOLANA_PUBLIC_KEY format:
- Should be 44 characters
- Only base58 characters (no 0, O, I, l)

### "RPC request failed"
- Verify SOLANA_RPC_URL is accessible
- Check rate limits on Solana RPC
- Fallback RPC will activate automatically

### "Invalid API key"
- Verify key format (sk-or- for OpenRouter)
- Check key hasn't been revoked
- Verify account has available credits

### "Transaction simulation failed"
- Insufficient SOL for gas
- Bad slippage settings (default 50bps)
- Token mint not recognized

## 📊 Configuration Summary

### For Local Development
```bash
npm run dev
# Uses .env.development
# Connects to devnet
# API at localhost:3000
# Debug mode enabled
```

### For Production
```bash
npm run build
vercel --prod
# Uses .env.local (from Vercel env vars)
# Connects to mainnet-beta
# API at shina-ten.vercel.app
# Debug mode disabled
```

## 🎯 Next Steps

1. ✅ Copy `.env.example` → `.env.local`
2. ✅ Generate Solana wallet
3. ✅ Get OpenRouter API key
4. ✅ Fill SOLANA_PUBLIC_KEY, SOLANA_PRIVATE_KEY, OPENROUTER_API_KEY
5. ✅ Test locally: `npm run dev`
6. ✅ Test chat, swap, balance, portfolio
7. ✅ Deploy to Vercel: `vercel --prod`

---

**Need help?** Check API responses for detailed error messages. All endpoints log to console for debugging.
