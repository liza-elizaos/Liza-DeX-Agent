# 🚀 Liza API Test Dashboard - Deployment Guide

## Quick Start - Deploy to Vercel

### Prerequisites
- GitHub account with this repo
- Vercel account (free tier works)
- Node.js 18+ locally

### Step 1: Environment Variables

Add these to your Vercel project settings (Dashboard → Settings → Environment Variables):

```env
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
BACKUP_RPC_URL=https://solana-api.projectserum.com
OPENROUTER_API_KEY=your_openrouter_key_here
JUPITER_API_URL=https://api.jup.ag/swap/v1/quote
SOLANA_NETWORK=mainnet
```

### Step 2: Deploy Option A - Git Integration (Recommended)

1. Push to your GitHub repo
2. Go to [Vercel Dashboard](https://vercel.com/dashboard)
3. Click "Add New Project"
4. Select your GitHub repository
5. Leave build settings as default (Vercel auto-detects)
6. Add environment variables from Step 1
7. Click "Deploy"

### Step 3: Deploy Option B - Vercel CLI

```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel
vercel login

# Deploy from project directory
cd d:\Liza
vercel

# For production deployment
vercel --prod
```

---

## 📊 Testing the APIs

Once deployed, visit your Vercel URL:

### Test Dashboard
- **URL**: `https://your-project.vercel.app/test`
- **Features**:
  - 💰 Check wallet balance
  - 📊 View portfolio analysis
  - 🔄 Get swap quotes via Jupiter

### Connect Wallet
1. Click "Select Wallet" button
2. Choose Phantom, Solflare, or other wallet
3. Approve connection
4. Wallet address auto-fills

### Test Balance Check
```
1. Enter wallet address (or use connected wallet)
2. Click "Check Balance"
3. See SOL balance in lamports and SOL
```

### Test Portfolio Check
```
1. Enter wallet address
2. Click "Check Portfolio"
3. See:
   - Total portfolio value in USD
   - SOL holdings
   - Token count
   - Top holdings
```

### Test Swap
```
1. Select "From Token" (SOL, USDC, USDT)
2. Select "To Token" (USDC, USDT, SOL)
3. Enter amount
4. Click "Get Swap Quote"
5. See estimated output via Jupiter API
```

---

## 📡 API Endpoints

### 1. Balance Check
```bash
POST /api/balance
Content-Type: application/json

{
  "userPublicKey": "Your wallet address"
}

Response:
{
  "success": true,
  "walletAddress": "...",
  "balanceSOL": 0.5,
  "balanceLamports": 500000000,
  "network": "mainnet"
}
```

### 2. Portfolio Analysis
```bash
POST /api/portfolio
Content-Type: application/json

{
  "walletAddress": "Your wallet address"
}

Response:
{
  "success": true,
  "walletAddress": "...",
  "totalValueUSD": 1500.50,
  "solBalance": 0.5,
  "solValueUSD": 98.00,
  "tokenCount": 3,
  "tokens": [
    {
      "mint": "...",
      "symbol": "SOL",
      "balance": 0.5,
      "decimals": 9,
      "valueUSD": 98.00
    }
  ],
  "portfolioComposition": [...]
}
```

### 3. Swap Quote
```bash
POST /api/swap
Content-Type: application/json

{
  "fromToken": "sol",
  "toToken": "usdc",
  "amount": 1,
  "userPublicKey": "Your wallet address"
}

Response:
{
  "success": true,
  "message": "Swap quote received - ready to execute",
  "swap": {
    "fromToken": "sol",
    "toToken": "usdc",
    "amount": 1,
    "estimatedOutput": 195.50,
    "inputAmount": 1,
    "quote": {...},
    "userPublicKey": "...",
    "status": "pending_signature"
  }
}
```

---

## ✅ Verification Checklist

- [ ] Vercel deployment successful
- [ ] Test page loads at `/test`
- [ ] Wallet connection works
- [ ] Balance check returns data
- [ ] Portfolio check returns tokens
- [ ] Swap quote generates successfully
- [ ] All endpoints have CORS enabled
- [ ] No console errors

---

## 🔧 Troubleshooting

### Wallet won't connect
- Ensure you're using a Solana wallet
- Check browser console for errors
- Try different wallet (Phantom, Solflare)

### API returns 503 error
- Check RPC endpoints are accessible
- Verify SOLANA_RPC_URL in env vars
- Fallback endpoints should kick in

### Swap quote fails
- Ensure wallet has SOL for gas fees
- Check Jupiter API is reachable
- Verify token mints are correct

### Portfolio shows only SOL
- May need more tokens in wallet
- Check token account parsing
- Verify RPC supports getProgramAccounts

---

## 📝 Local Testing

```bash
# Install dependencies
npm install

# Build
npm run build

# Run local server
npm run dev

# Test endpoint
curl -X POST http://localhost:3000/api/balance \
  -H "Content-Type: application/json" \
  -d '{"userPublicKey":"YOUR_WALLET_ADDRESS"}'
```

---

## 🎯 Next Steps

1. ✅ Deploy to Vercel
2. ✅ Test all three APIs
3. 📝 Share test link with team
4. 🔒 Add authentication if needed
5. 📊 Monitor usage analytics
6. 🚀 Integrate with AI chat

---

## 📞 Support

- Check logs: Vercel Dashboard → Project → Deployments → Logs
- Review errors in browser console (F12)
- Test with test wallets first
- Use Devnet if testing with small amounts

