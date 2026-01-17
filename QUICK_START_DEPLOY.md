# 🧪 Liza API Test Dashboard - Quick Reference

## What You Get

✅ **Wallet Balance Check** - Real-time SOL balance lookup
✅ **Portfolio Analysis** - Complete wallet holdings with USD values  
✅ **Swap Quotes** - Jupiter DEX integration for token swaps
✅ **Web UI** - Easy-to-use testing dashboard

---

## 🚀 Deploy in 3 Steps

### Step 1: Run Deploy Script
```powershell
cd d:\Liza
.\deploy-vercel.ps1
```

### Step 2: Add Environment Variables
In Vercel Dashboard → Project Settings → Environment Variables:
```
SOLANA_RPC_URL = https://api.mainnet-beta.solana.com
BACKUP_RPC_URL = https://solana-api.projectserum.com
OPENROUTER_API_KEY = your_key_here
JUPITER_API_URL = https://api.jup.ag/swap/v1/quote
SOLANA_NETWORK = mainnet
```

### Step 3: Test
Visit: `https://your-project.vercel.app/test`

---

## 🧪 Test the Dashboard

### 1. Connect Wallet
- Click "Select Wallet"
- Choose Phantom or Solflare
- Approve connection

### 2. Check Balance
- Click "Check Balance"
- See SOL amount in wallet
- View lamports equivalent

### 3. Check Portfolio
- Click "Check Portfolio"
- See all tokens held
- View USD value
- See portfolio composition

### 4. Get Swap Quote
- Select token pair (SOL → USDC)
- Enter amount
- Click "Get Swap Quote"
- See estimated output from Jupiter

---

## 📡 API Endpoints (POST)

| Endpoint | Use Case | Example |
|----------|----------|---------|
| `/api/balance` | Get wallet SOL balance | `{"userPublicKey":"..."}` |
| `/api/portfolio` | Get complete portfolio | `{"walletAddress":"..."}` |
| `/api/swap` | Get swap quote | `{"fromToken":"sol","toToken":"usdc","amount":1,"userPublicKey":"..."}` |

---

## 🔗 URLs

- **Dashboard**: `https://your-project.vercel.app/test`
- **Main Page**: `https://your-project.vercel.app`
- **Vercel Dashboard**: `https://vercel.com/dashboard`
- **GitHub Repo**: `https://github.com/your-username/Liza`

---

## ⚙️ Local Testing

```bash
# Build locally
npm run build

# Run server
npm run dev

# Test endpoint
curl -X POST http://localhost:3000/api/balance \
  -H "Content-Type: application/json" \
  -d '{"userPublicKey":"YOUR_WALLET"}'
```

---

## 📋 Environment Variables Explained

| Variable | Purpose | Default |
|----------|---------|---------|
| `SOLANA_RPC_URL` | Primary RPC endpoint | `https://api.mainnet-beta.solana.com` |
| `BACKUP_RPC_URL` | Fallback RPC endpoint | `https://solana-api.projectserum.com` |
| `OPENROUTER_API_KEY` | AI Chat API key | - (optional) |
| `JUPITER_API_URL` | Swap quote API | `https://api.jup.ag/swap/v1/quote` |
| `SOLANA_NETWORK` | Network (mainnet/devnet) | `mainnet` |

---

## 🐛 Troubleshooting

### Wallet won't connect
- Use supported wallet (Phantom, Solflare)
- Check browser extension is installed
- Try incognito mode

### API returns 503
- RPC endpoint down (fallback kicks in)
- Check internet connection
- Wait 30 seconds and retry

### Portfolio shows only SOL
- Wallet may have no other tokens
- Network may have no token data
- Try wallet with known tokens

### Swap fails
- Need SOL for gas fees
- Token pair may not exist
- Jupiter API may be rate limiting

---

## ✨ Features

### Balance Check
- Real-time SOL balance
- Lamports conversion
- Multiple RPC fallbacks
- 8-second timeout protection

### Portfolio Analysis
- Complete asset breakdown
- USD value calculation
- Token price lookup
- 5-minute price caching

### Swap Functionality
- Jupiter DEX integration
- Multiple token support
- Slippage estimation
- Estimated output calculation

---

## 📞 Support

| Issue | Solution |
|-------|----------|
| Build fails | Run `npm install` then `npm run build` |
| Deployment fails | Check Vercel logs in dashboard |
| API 404 | Ensure endpoints are in `/api/` folder |
| CORS errors | Endpoints have CORS headers enabled |

---

## 🎯 Deployment Checklist

- [ ] Run `npm install`
- [ ] Run `npm run build`
- [ ] Run `./deploy-vercel.ps1`
- [ ] Add env vars to Vercel
- [ ] Visit `/test` page
- [ ] Test all three APIs
- [ ] Share URL with team

---

**Version**: 1.0
**Last Updated**: Jan 14, 2026
**Status**: ✅ Ready to Deploy
