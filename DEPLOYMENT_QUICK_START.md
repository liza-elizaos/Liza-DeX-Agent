# Quick Deployment Guide

## ✅ What's Ready
- All TypeScript modules compile successfully
- Frontend wallet integration ready
- Backend serverless endpoints defined
- Database schema ready
- Worker script ready for deployment

## 🚀 Deployment Steps (Next 24 Hours)

### Step 1: Database Setup (30 min)

**Option A: Supabase** (Recommended)
```bash
# 1. Go to supabase.com, create a new project
# 2. Once ready, copy the DATABASE_URL from Settings > Database > Connection string
# 3. In your terminal:
psql postgresql://[user]:[password]@[host]:[port]/[database] < sql/init.sql

# 4. Test connection:
psql $DATABASE_URL -c "SELECT * FROM tokens LIMIT 0;"
```

**Option B: Neon**
```bash
# 1. Create project at neon.tech
# 2. Copy PostgreSQL connection string
# 3. Run migrations
psql $DATABASE_URL < sql/init.sql
```

### Step 2: Add Environment Variables

**In Vercel:**
```
Settings > Environment Variables
```

Add these:
```
DATABASE_URL = postgresql://...         # From Step 1
HELIUS_API_KEY = <your_helius_key>      # Get from Helius
NEXT_PUBLIC_SOLANA_RPC_URL = https://api.mainnet-beta.solana.com
```

### Step 3: Deploy Worker

**Option A: Railway** (Simplest)
```bash
# 1. Go to railway.app, connect GitHub
# 2. Deploy this repo
# 3. Create a new service: scripts/worker.ts
# 4. Set environment variables
# 5. Configure cron trigger or run with node-cron
```

**Option B: Cloud Run**
```bash
gcloud run deploy liza-worker \
  --source . \
  --entry-point worker \
  --region us-central1 \
  --set-env-vars DATABASE_URL=$DATABASE_URL,HELIUS_API_KEY=$HELIUS_API_KEY
```

### Step 4: Test Endpoints

Once deployed to Vercel:

```bash
# Test analytics endpoint
curl "https://your-vercel-domain.vercel.app/api/model/onchain-analytics?mint=EPjFWdd5Au74h7n3Nw18KhLwW3MJkQP8PrcajX49z894"

# Test risk check endpoint
curl -X POST "https://your-vercel-domain.vercel.app/api/model/risk-check" \
  -H "Content-Type: application/json" \
  -d '{"mint":"EPjFWdd5Au74h7n3Nw18KhLwW3MJkQP8PrcajX49z894"}'

# Test alerts CRUD
curl "https://your-vercel-domain.vercel.app/api/model/alerts?owner=YOUR_WALLET_ADDRESS"
```

### Step 5: Frontend UI Integration (Next Phase)

Create React components for:
1. **Risk Dashboard Panel**
   - Display RiskScore
   - Show red flags
   - Recommend action

2. **Alert Management Panel**
   - Create/edit/delete alerts
   - Set thresholds
   - View triggered alerts

3. **Watchlist Panel**
   - Add/remove tokens
   - View analytics
   - Show alerts

---

## 📊 Architecture Overview

```
Frontend (Vercel)
├── Chat UI + Wallet Connection
├── Command Parser (balance, watch, swap)
├── Risk Checker Panel (local calculation)
└── Alert Dashboard (fetch from backend)

Backend (Vercel Serverless)
├── /model/onchain-analytics - GET holder distribution
├── /model/risk-check - POST rug-pull scoring
├── /model/holders - GET detailed holder info
├── /model/alerts - GET/POST alert CRUD
└── /model/ingest - POST save token data

Database (PostgreSQL)
├── tokens - Token metadata
├── holders - Holder distribution
├── transfers - Transaction history
├── watchlists - User watchlists
└── alerts - Alert rules

Worker (Railway/Cloud Run)
├── Poll Helius (every 2 min)
├── Update token metadata
├── Check alert triggers
└── Log changes
```

---

## 🔑 Environment Variables Reference

| Variable | Required | Source | Example |
|----------|----------|--------|---------|
| `DATABASE_URL` | ✅ Yes | Supabase/Neon | `postgresql://user:pass@host/db` |
| `HELIUS_API_KEY` | ✅ Yes | Helius dashboard | `your_helius_api_key` |
| `NEXT_PUBLIC_SOLANA_RPC_URL` | ✅ Yes | Public | `https://api.mainnet-beta.solana.com` |
| `HELIUS_RPC` | ⚠️ Optional | Helius | `https://mainnet.helius-rpc.com/?api-key=...` |

---

## ⏱️ Timeline

- **Today:** Database provisioning
- **Day 2:** Deploy worker + endpoints
- **Day 3:** Test endpoints
- **Day 4-5:** Frontend UI panels
- **Day 6:** Integration testing
- **Day 7:** Production launch

---

## 🐛 Troubleshooting

### Database Connection Error
```
Error: connect ECONNREFUSED
```
→ Check DATABASE_URL is correct and database is accepting connections

### Helius API Error
```
401 Unauthorized
```
→ Verify HELIUS_API_KEY is set in Vercel environment

### Worker Not Running
```
timeout or no output
```
→ Check Cloud Run/Railway logs for errors
→ Verify cron schedule is set

---

## 📞 Support

- **TypeScript Errors:** Check `/TESTING_REPORT.md`
- **API Documentation:** Check endpoint comments in `model/` files
- **Database Schema:** See `sql/init.sql`

---

**Status:** Ready for production deployment  
**Last Updated:** January 13, 2026  
**All Modules:** ✅ Compiled & Ready
