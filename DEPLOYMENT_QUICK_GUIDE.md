# 🚀 Quick Deployment Guide - Portfolio Analytics Ready

## Current Status
✅ Portfolio analytics improved with real-time pricing  
✅ Build successful (42.28s)  
✅ Git commit complete (hash: 70d56e8)  
✅ **Ready to deploy to Vercel**

## Three Deployment Options

### Option 1: Vercel Web UI (Easiest)

1. **Go to https://vercel.com/dashboard**
2. **Click "+ New Project"**
3. **Connect GitHub Repository**
   - Authorize Vercel to access GitHub
   - Select your repo `YOUR_USERNAME/shina`
4. **Configure Environment:**
   ```
   SOLANA_RPC_URL = https://solana-mainnet.g.alchemy.com/v2/pfiW_dJZBV0RjLHK1TgV53sMmLFTcCmX
   SOLANA_PUBLIC_KEY = CMVrzdso4SShQm2irrc7jMCN9Vw5QxXvrZKB79cYPPJT
   OPENROUTER_API_KEY = sk-or-v1-...
   JUPITER_API_URL = https://api.jup.ag/swap/v1/quote
   ```
5. **Click "Deploy"**
6. **Wait 2-3 minutes for deployment**

### Option 2: Vercel CLI

```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Login
vercel login

# 3. Deploy
cd d:\shina
vercel --prod

# 4. Select:
# - Project name: shina
# - Directory: dist (or leave blank)
# - Environment: Use settings from .env file
```

### Option 3: Git Push (If Remote Configured)

```bash
# 1. Add GitHub remote
git remote add origin https://github.com/YOUR_USERNAME/shina.git

# 2. Push to GitHub
git push -u origin master

# 3. Vercel auto-deploys on push (if connected)
# or manually trigger deploy from Vercel dashboard
```

## Verify Deployment

After deployment, test at: `https://YOUR-PROJECT.vercel.app`

1. **Check Portfolio Works:**
   - Connect Phantom wallet
   - Portfolio should display correctly
   - Prices should update in real-time

2. **Test API Endpoint:**
   ```
   GET /api/portfolio?wallet=CMVrzdso4SShQm2irrc7jMCN9Vw5QxXvrZKB79cYPPJT
   ```

3. **Check Console for Errors:**
   - No "Invalid base58" errors
   - No "Failed to fetch" errors
   - Prices loading correctly

## What Was Deployed

**Latest Commit: 70d56e8**

**Changes:**
- ✅ `src/api/portfolio-analytics.ts` - Improved with real-time pricing
- ✅ Better token account fetching with fallbacks
- ✅ Enhanced error handling and logging
- ✅ 21 files total (includes solution docs & tests)

**Build Output:**
- ✅ dist/ folder (production ready)
- ✅ All TypeScript compiled
- ✅ Vite frontend bundled (3.41MB)

## Environment Variables Needed

Copy from `.env` file to Vercel:

```
SOLANA_RPC_URL=https://solana-mainnet.g.alchemy.com/v2/pfiW_dJZBV0RjLHK1TgV53sMmLFTcCmX
SOLANA_PUBLIC_KEY=CMVrzdso4SShQm2irrc7jMCN9Vw5QxXvrZKB79cYPPJT
OPENROUTER_API_KEY=sk-or-v1-...
JUPITER_API_URL=https://api.jup.ag/swap/v1/quote
```

## Troubleshooting

**Issue: "Invalid base58 wallet address"**
- Solution: Use the fixed API route from `API_PORTFOLIO_ROUTE_FIXED.ts`
- It cleans wallet addresses automatically

**Issue: "Portfolio shows $0"**
- Expected for empty wallets
- Connect a wallet with SOL/tokens to see real portfolio

**Issue: "Prices not loading"**
- Check Jupiter API: `https://api.jup.ag/price?ids=So11111111111111111111111111111111111111112`
- Fallback to Birdeye if needed

## Post-Deployment Tasks

1. **Implement LIZA Integration**
   - Edit `src/characters/liza.character.json`
   - Add portfolio topics
   - User can ask: "show my portfolio"

2. **Implement Phantom Wallet Fix**
   - Update API with address cleaning
   - Update v0.dev component
   - Test with actual Phantom connection

3. **Test Full Flow**
   - Deploy → Connect Wallet → Show Portfolio → See Holdings

## Need Help?

**Deployment Issues:** Check Vercel logs in dashboard
**Portfolio Not Working:** See `PORTFOLIO_IMPROVEMENTS_COMPLETE.md`
**LIZA Integration:** See `START_HERE_PORTFOLIO_FIX.md`
**Phantom Wallet:** See `QUICK_FIX_PHANTOM_WALLET.md`

---

**Status:** ✅ Ready to Deploy  
**Last Updated:** 2026-01-05  
**Build Hash:** 70d56e8  
**Commit Message:** "Improve: Portfolio Analytics with real-time Jupiter/Birdeye pricing"
