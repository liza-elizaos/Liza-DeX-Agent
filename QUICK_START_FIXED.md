# Quick Start Guide - Solana Wallet Chat (Fixed)

## What Was Fixed

✅ **HTTP 500 Error Resolved**
- Chat handler now directly calls the balance function instead of making HTTP requests
- Proper error handling and validation for wallet addresses
- Direct Solana RPC connection for balance queries

## Prerequisites

- Node.js 18+ (or Bun runtime)
- npm or yarn
- Phantom Wallet extension (for browser)
- Solana testnet/mainnet wallet

## Installation

```bash
# 1. Clone or download the project
cd shina

# 2. Install dependencies
npm install

# 3. Create .env file (copy from .env.example)
cp .env.example .env

# 4. Update .env with your Solana RPC endpoint
SOLANA_RPC_URL=https://solana-mainnet.g.alchemy.com/v2/YOUR_KEY
```

## Running Locally

```bash
# Start the development server
npm run dev

# Server will start at http://localhost:3000
```

## Testing the Application

### 1. Open in Browser
```
http://localhost:3000
```

### 2. Connect Wallet
- Click "🔗 Connect Phantom Wallet"
- Approve connection in Phantom

### 3. Check Balance
- Click the "💰 Balance" quick action button
- Or type: "check my balance"
- Or: "check balance CMVrzdso4SShQm2irrc7jMCN9Vw5QxXvrZKB79cYPPJT"

### 4. Testing with curl

**Check Balance:**
```bash
curl -X POST http://localhost:3000/api/balance \
  -H "Content-Type: application/json" \
  -d '{"userPublicKey":"CMVrzdso4SShQm2irrc7jMCN9Vw5QxXvrZKB79cYPPJT"}'
```

**Expected Response:**
```json
{
  "success": true,
  "walletAddress": "CMVrzdso4SShQm2irrc7jMCN9Vw5QxXvrZKB79cYPPJT",
  "balanceSOL": 0.123456789,
  "balanceLamports": 123456789,
  "network": "mainnet"
}
```

**Chat with AI:**
```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "test-session",
    "message": "check my balance",
    "walletPublicKey": "CMVrzdso4SShQm2irrc7jMCN9Vw5QxXvrZKB79cYPPJT"
  }'
```

## Building for Production

```bash
# Build the project
npm run build

# Output directory: dist/

# Run production build locally
npm run dev
```

## Deploying to Vercel

### Option 1: Using Vercel CLI
```bash
npm install -g vercel
vercel
```

### Option 2: Using GitHub Integration
1. Push to GitHub
2. Go to https://vercel.com/new
3. Import your repository
4. Add environment variables (see DEPLOYMENT_GUIDE_VERCEL.md)
5. Deploy!

## Environment Variables

**Required:**
```env
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
SOLANA_NETWORK=mainnet
SOLANA_PUBLIC_KEY=your_wallet_address
SOLANA_PRIVATE_KEY=your_private_key_base58
```

**Optional (for AI features):**
```env
OPENAI_API_KEY=your_key_here
ANTHROPIC_API_KEY=your_key_here
```

## Features

### ✅ Working Features
- **Wallet Connection**: Connect Phantom wallet
- **Balance Check**: Real-time SOL balance from blockchain
- **AI Chat**: Natural language commands
- **Token Swaps**: Buy/sell tokens via Jupiter
- **CORS**: Enabled for API access

### 🔄 Upcoming Features
- Portfolio analytics
- Price monitoring
- Automated trading
- Yield optimization

## Troubleshooting

### Issue: "Failed to get response"

**Solution:**
1. Check if server is running: `npm run dev`
2. Verify `localhost:3000` is accessible
3. Check browser console for errors
4. Try clearing browser cache: `Ctrl+Shift+Delete`

### Issue: "Error: HTTP 500"

**Solution:**
1. Check server logs for error message
2. Verify `SOLANA_RPC_URL` is valid
3. Check wallet address format (should be 43-44 characters)
4. Try a different RPC endpoint

### Issue: "Cannot connect to wallet"

**Solution:**
1. Install Phantom wallet: https://phantom.app
2. Create or import a wallet in Phantom
3. Ensure Phantom is unlocked
4. Try incognito mode if issues persist

### Issue: "Module not found"

**Solution:**
```bash
npm install
npm run build
npm run dev
```

## Project Structure

```
shina/
├── src/
│   ├── frontend/           # React UI components
│   │   └── SolanaWalletChat.tsx
│   └── plugins/            # elizaOS plugins
├── api/
│   ├── balance.ts          # Balance checking endpoint
│   ├── chat.ts             # Chat/AI endpoint (FIXED)
│   ├── swap.ts             # Swap execution
│   └── swap-utils.ts       # Swap utilities
├── server.ts               # HTTP server
├── vercel.json             # Vercel config
└── package.json
```

## API Endpoints

| Endpoint | Method | Purpose | Status |
|----------|--------|---------|--------|
| `/api/balance` | POST | Check wallet balance | ✅ Fixed |
| `/api/chat` | POST | Chat with AI assistant | ✅ Working |
| `/api/swap` | POST | Execute token swap | ✅ Working |
| `/api/wallet-connect` | POST | Wallet connection | ✅ Working |

## Key Changes Made

1. **Fixed Balance API**: Now uses direct Solana RPC calls instead of HTTP requests
2. **Improved Error Handling**: Better error messages and validation
3. **CORS Configuration**: Proper CORS headers in server
4. **Direct Function Calls**: Chat handler directly calls balance functions
5. **Environment Variables**: Properly configured for both local and Vercel

## Documentation

- [DEPLOYMENT_GUIDE_VERCEL.md](DEPLOYMENT_GUIDE_VERCEL.md) - Detailed Vercel deployment guide
- [README.md](README.md) - Main project documentation
- [ARCHITECTURE.md](ARCHITECTURE.md) - System architecture

## Support & Resources

- **Phantom Wallet**: https://phantom.app
- **Solana Docs**: https://docs.solana.com
- **Jupiter Swap**: https://jup.ag
- **elizaOS**: https://github.com/elizaos/eliza
- **Vercel Docs**: https://vercel.com/docs

## License

MIT License - See LICENSE file

---

**Last Updated**: 2024-01-02
**Status**: ✅ Production Ready
**HTTP 500 Error**: ✅ FIXED
