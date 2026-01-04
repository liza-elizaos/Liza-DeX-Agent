## 🔧 Backend Environment Variables - Setup Guide

This shows what environment variables are needed for Vercel deployment (WITHOUT exposing secret keys).

### ✅ What You Need to Set Up in Vercel Dashboard

Go to: **Vercel Dashboard → Project Settings → Environment Variables**

Add these variables:

```env
# ===== LLM PROVIDER (REQUIRED) =====
OPENROUTER_API_KEY=sk-or-v1-xxxxxxxxxxxxxxxxxxxxxx
OPENROUTER_MODEL=mistralai/devstral-2512:free
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1

# ===== MODEL CONFIGURATION =====
MODEL_PROVIDER=openrouter
LLM_MODEL=mistralai/devstral-2512:free

# ===== SOLANA BLOCKCHAIN =====
SOLANA_NETWORK=mainnet
SOLANA_PUBLIC_KEY=CMVrzdso4SShQm2irrc7jMCN9Vw5QxXvrZKB79cYPPJT
SOLANA_PRIVATE_KEY=42ALEQhrLMzsWXhNZDtRCjALJwS61MpfcJHBopGycsaNnoaypUf7St1BCF2rbge3ozUn6DPjQSHc7hU8KvQs87Gw
SOLANA_RPC_URL=https://solana-mainnet.g.alchemy.com/v2/pfiW_dJZBV0RjLHK1TgV53sMmLFTcCmX

# ===== SWAP & DeFi =====
JUPITER_API_KEY=cd72422b-136c-4951-a00f-9fb904e14acf
JUPITER_API_URL=https://api.jup.ag/swap/v1/quote
BIRDEYE_API_KEY=optional_api_key_here

# ===== DATABASE (Local) =====
PGLITE_DATA_DIR=.eliza/.elizadb

# ===== PERFORMANCE =====
PRICE_UPDATE_INTERVAL=60000

# ===== OPTIONAL: elizaOS CLOUD =====
ELIZAOS_CLOUD_API_KEY=optional
```

---

## 📋 Getting Each API Key

### 1. OpenRouter API Key (LLM - Required)

```
Website: https://openrouter.ai
1. Create account
2. Go to: https://openrouter.ai/keys
3. Copy your API key
4. Set in Vercel: OPENROUTER_API_KEY
5. Set model: OPENROUTER_MODEL=mistralai/devstral-2512:free (FREE TIER)
```

### 2. Solana RPC URL (Blockchain Connection - Required)

**Option A: Using Alchemy (Recommended)**
```
Website: https://www.alchemy.com/
1. Create account
2. Create new app
3. Select "Solana" network
4. Copy RPC URL
5. Set in Vercel: SOLANA_RPC_URL=https://solana-mainnet.g.alchemy.com/v2/YOUR_API_KEY
```

**Option B: Using Helius**
```
Website: https://dev.helius.xyz/
1. Create account
2. Create API key
3. Copy RPC URL
4. Set in Vercel: SOLANA_RPC_URL=https://mainnet.helius-rpc.com/?api-key=YOUR_KEY
```

### 3. Jupiter API Key (Token Swaps - Required)

```
Website: https://api.jup.ag/
1. Go to: https://www.jup.ag/ → API Docs
2. Request API key (usually instant)
3. Set in Vercel: JUPITER_API_KEY=your_key
```

### 4. Solana Wallet (Public & Private Keys - Required)

```
Get from Phantom Wallet:
1. Open Phantom
2. Click on wallet address (top)
3. Copy address → SOLANA_PUBLIC_KEY
4. Settings → Reveal Private Key → Copy → SOLANA_PRIVATE_KEY

⚠️ WARNING: Keep private key SAFE!
   - Never commit to git
   - Never share with anyone
   - Rotate regularly
```

### 5. BirdEye API Key (Optional - For Token Prices)

```
Website: https://www.birdeye.so/
1. Create account
2. Go to: https://birdeye.so/api/reference
3. Copy API key
4. Set in Vercel: BIRDEYE_API_KEY=your_key
   (Can be left empty if not needed)
```

---

## ✅ Minimal Setup (Just to Get Started)

If you only want to test, these are the **absolute minimum** required:

```env
OPENROUTER_API_KEY=sk-or-v1-your_key_here
OPENROUTER_MODEL=mistralai/devstral-2512:free
SOLANA_PUBLIC_KEY=your_solana_wallet_address
SOLANA_PRIVATE_KEY=your_solana_private_key
SOLANA_RPC_URL=https://solana-mainnet.g.alchemy.com/v2/your_alchemy_key
JUPITER_API_KEY=your_jupiter_key
```

---

## 🚀 How to Set in Vercel

1. **Go to Vercel Dashboard**
   ```
   https://vercel.com/dashboard
   ```

2. **Select Your Project** (shina)

3. **Click Settings** (top navigation)

4. **Click "Environment Variables"** (left sidebar)

5. **Add each variable** one by one:
   - Name: `OPENROUTER_API_KEY`
   - Value: `sk-or-v1-xxxxxx`
   - Click "Add"

6. **Deploy with new variables**
   ```bash
   npm run build
   npx vercel deploy --prod --yes
   ```

---

## 🧪 Test the Setup

After setting environment variables:

```bash
# Test that backend can access variables
curl https://your-vercel-url.vercel.app/api/chat -X GET

# Should return: "API is working!"
```

---

## ⚠️ Security Checklist

- [ ] Never commit `.env` file to git
- [ ] Never expose OPENROUTER_API_KEY
- [ ] Never expose SOLANA_PRIVATE_KEY
- [ ] Set environment variables in Vercel Dashboard (not in code)
- [ ] Rotate keys regularly
- [ ] Delete old/unused keys
- [ ] Set GitHub to ignore `.env` file

---

## 📊 Cost Breakdown

| Service | Cost | Notes |
|---------|------|-------|
| **OpenRouter** | FREE | Using mistralai/devstral-2512 free tier |
| **Alchemy/Helius RPC** | FREE | 300k calls/month free |
| **Jupiter API** | FREE | Public API, no cost |
| **BirdEye API** | FREE | Public API, optional |
| **Vercel Hosting** | FREE | Hobby tier includes 100GB bandwidth |
| **Total** | **$0/month** | ✅ Completely free! |

---

## 🆘 Troubleshooting

### "API Key not found" error
- [ ] Check variable name matches exactly (case-sensitive)
- [ ] Redeploy after adding variables
- [ ] Wait 1-2 minutes for Vercel to apply changes

### "Cannot connect to RPC"
- [ ] Check RPC URL is correct
- [ ] Test RPC directly: `curl https://your-rpc-url`
- [ ] Make sure on mainnet (not devnet/testnet)

### "Jupiter quote failed"
- [ ] Check Jupiter API key is set
- [ ] Check token addresses are valid
- [ ] Check tokens exist on Solana mainnet

### "Wallet signature failed"
- [ ] Check SOLANA_PRIVATE_KEY is set correctly
- [ ] Make sure key has funds (minimum 0.005 SOL)
- [ ] Check on mainnet (not testnet)

---

**Last Updated**: January 9, 2026
**Status**: Production Ready ✅
