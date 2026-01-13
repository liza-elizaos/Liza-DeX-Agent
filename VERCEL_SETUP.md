# Vercel Deployment Setup

## Prerequisites
- GitHub repository connected to Vercel
- Vercel CLI installed: `npm install -g vercel`
- PostgreSQL database provisioned (Supabase or Neon)
- Helius API key

## Step 1: Vercel Login & Link Project

```bash
# Login to Vercel
vercel login

# Link project (run from repo root)
vercel link

# Or auto-deploy with git:
# Just push to main, Vercel auto-deploys
git push origin main
```

## Step 2: Set Environment Variables

**Option A: Via Vercel Dashboard**

Go to `Settings > Environment Variables` and add:

```
DATABASE_URL = postgresql://[user]:[password]@[host]:[port]/[database]
HELIUS_API_KEY = [your_helius_api_key]
HELIUS_RPC = https://mainnet.helius-rpc.com/?api-key=[your_helius_api_key]
NEXT_PUBLIC_SOLANA_RPC_URL = https://api.mainnet-beta.solana.com
NEXT_PUBLIC_SOLANA_NETWORK = mainnet-beta
```

**Option B: Via Vercel CLI**

```bash
vercel env add DATABASE_URL
# Paste your database URL

vercel env add HELIUS_API_KEY
# Paste your Helius API key

vercel env add HELIUS_RPC
# Paste: https://mainnet.helius-rpc.com/?api-key=[key]

vercel env add NEXT_PUBLIC_SOLANA_RPC_URL
# Paste: https://api.mainnet-beta.solana.com

vercel env add NEXT_PUBLIC_SOLANA_NETWORK
# Paste: mainnet-beta
```

## Step 3: Database Migration

After setting DATABASE_URL, run migrations:

```bash
# Connect to your database and run migrations
psql $DATABASE_URL < sql/init.sql

# Or if using Supabase:
psql postgresql://[user]:[password]@db.[region].supabase.co:5432/postgres < sql/init.sql
```

## Step 4: Deploy

```bash
# Automatic deploy (via git)
git add .
git commit -m "deploy: prepare for Vercel"
git push origin main

# Or manual deploy
vercel --prod

# Check deployment status
vercel list
```

## Step 5: Verify Deployment

```bash
# Get your Vercel URL
vercel list

# Test health endpoint
curl https://[your-project].vercel.app/api/health

# Test analytics endpoint
curl https://[your-project].vercel.app/api/model/onchain-analytics?mint=EPjFWdd5Au74h7n3Nw18KhLwW3MJkQP8PrcajX49z894
```

## Endpoints Available

Once deployed:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/model/onchain-analytics` | GET | Holder distribution |
| `/api/model/risk-check` | POST | Risk scoring |
| `/api/model/holders` | GET | Detailed holders |
| `/api/model/alerts` | GET/POST | Alert CRUD |
| `/api/model/ingest` | POST | Save token data |

## Troubleshooting

### Build fails
```bash
# Check build logs
vercel logs --follow

# Rebuild
vercel --prod --force
```

### Database connection error
```bash
# Verify DATABASE_URL is set
vercel env list

# Test connection locally
psql $DATABASE_URL -c "SELECT version();"
```

### Endpoint not found (404)
```bash
# Verify model/ files are in dist/
ls -la dist/model/

# Rebuild if needed
vercel --prod --force
```

## Auto-Deployment

Once linked to GitHub:
1. Any push to `main` automatically deploys
2. Pull requests create preview deployments
3. Check deployment status in GitHub

No manual `vercel` commands needed after initial setup!

---

**After deployment:** 
- Update frontend to use deployed API
- Deploy worker to Cloud Run/Railway
- Test all endpoints with real data
