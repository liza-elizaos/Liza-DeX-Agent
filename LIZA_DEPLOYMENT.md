# 🚀 LIZA - Vercel Deployment Guide

## Project Status
✅ **Rebranded**: SHINA → LIZA  
✅ **Built**: Production build complete  
✅ **Ready**: Ready for Vercel deployment  

---

## Pre-Deployment Checklist

- [x] Project renamed from "shina" to "liza" in package.json
- [x] All UI strings updated to "LIZA"
- [x] Character config updated
- [x] Build successful (`npm run build`)
- [x] Dist folder created with all assets
- [x] Environment variables configured

---

## Deployment Options

### Option 1: Using Vercel CLI (Recommended)

**Step 1: Install Vercel CLI**
```bash
npm install -g vercel
```

**Step 2: Login to Vercel**
```bash
vercel login
```

**Step 3: Deploy**
```bash
cd d:\shina
vercel
```

**Step 4: Follow Prompts**
```
? Set up and deploy "D:\shina"? [Y/n] › Yes
? Which scope do you want to deploy to? › [Your account name]
? Link to existing project? [y/N] › No (for first deployment)
? What's your project's name? › liza
? In which directory is your code located? › ./
? Want to modify these settings before deploying? [y/N] › No
```

---

### Option 2: Using GitHub Integration (Automatic)

**Step 1: Push to GitHub**
```bash
git init
git add .
git commit -m "Rebrand SHINA to LIZA - production ready"
git push origin main
```

**Step 2: Connect to Vercel**
- Go to https://vercel.com/new
- Click "Continue with GitHub"
- Select your repository
- Vercel will auto-detect configuration

**Step 3: Configure Environment Variables**
In Vercel Dashboard → Settings → Environment Variables, add:
```
SOLANA_RPC_URL=https://solana-mainnet.g.alchemy.com/v2/YOUR_KEY
SOLANA_PUBLIC_KEY=your_wallet_address
SOLANA_PRIVATE_KEY=your_private_key
SOLANA_NETWORK=mainnet
```

**Step 4: Deploy**
Click "Deploy" button

---

## Environment Variables Setup

After deployment, configure these in Vercel:

```env
# Required - Solana Configuration
SOLANA_RPC_URL=https://solana-mainnet.g.alchemy.com/v2/YOUR_ALCHEMY_KEY
SOLANA_PUBLIC_KEY=your_solana_wallet_address
SOLANA_PRIVATE_KEY=your_private_key_in_base58
SOLANA_NETWORK=mainnet

# Optional - API Keys
OPENAI_API_KEY=your_key_if_using_openai
ANTHROPIC_API_KEY=your_key_if_using_anthropic
```

### How to Add Environment Variables in Vercel:
1. Go to https://vercel.com/dashboard
2. Select your "liza" project
3. Click "Settings"
4. Select "Environment Variables"
5. Add each variable
6. Click "Save"
7. Redeploy to apply changes

---

## Post-Deployment Verification

### Test 1: Check Application is Live
```bash
curl https://liza-YOUR-USERNAME.vercel.app/
# Should return HTML of the LIZA website
```

### Test 2: Test Balance API
```bash
curl -X POST https://liza-YOUR-USERNAME.vercel.app/api/balance \
  -H "Content-Type: application/json" \
  -d '{"userPublicKey":"CMVrzdso4SShQm2irrc7jMCN9Vw5QxXvrZKB79cYPPJT"}'
```

**Expected Response:**
```json
{
  "success": true,
  "walletAddress": "CMVrzdso4SShQm2irrc7jMCN9Vw5QxXvrZKB79cYPPJT",
  "balanceSOL": 0.123456789,
  "network": "mainnet"
}
```

### Test 3: Browser Test
1. Go to https://liza-YOUR-USERNAME.vercel.app/
2. Should see "🚀 LIZA - Solana AI Assistant"
3. Click "🔗 Connect Phantom Wallet"
4. Approve connection
5. Click "💰 Balance" button
6. Should show your wallet balance

---

## Troubleshooting

### Issue: "Environment variables not set"

**Solution:**
1. Go to Vercel dashboard
2. Select "liza" project
3. Click Settings → Environment Variables
4. Ensure all variables are added
5. Redeploy: Click "Deployments" → Select latest → Click "Redeploy"

### Issue: "Balance check returning error"

**Causes:**
- Invalid RPC endpoint
- Missing environment variables
- Rate limit exceeded

**Solution:**
1. Check SOLANA_RPC_URL is valid (test locally first)
2. Verify all env vars are set in Vercel
3. Use different RPC provider if rate limited

### Issue: "Frontend not loading"

**Solution:**
1. Check `npm run build` works locally
2. Verify `dist/` folder exists
3. Check `vercel.json` is correct
4. Try redeploying: `vercel --prod`

### Issue: "Wallet connection not working"

**Solution:**
1. Check browser console (F12) for errors
2. Ensure URL uses HTTPS (not HTTP)
3. Phantom wallet must be installed
4. Try incognito mode

---

## View Deployment

### Vercel Dashboard
https://vercel.com/dashboard/liza

### Your Live App
https://liza-YOUR-USERNAME.vercel.app

### Deployment Logs
```bash
vercel logs
```

### Real-time Logs
```bash
vercel logs --follow
```

---

## Monitoring & Maintenance

### Check Deployment Status
```bash
vercel ls
```

### Redeploy Latest
```bash
vercel --prod
```

### Rollback to Previous
```bash
vercel rollback
```

### View Function Logs
```bash
vercel logs --follow
```

---

## Performance Tips

1. **Fast Deployments**: Vercel deploys in <30 seconds
2. **Auto Scaling**: Handles load automatically
3. **Edge Network**: Content served from nearest region
4. **Caching**: Static assets cached globally
5. **SSL/TLS**: Automatic HTTPS

---

## Custom Domain (Optional)

To add your own domain:

1. Go to Vercel Dashboard → liza → Settings → Domains
2. Enter your domain name
3. Follow DNS configuration instructions
4. Domain will be live in ~5 minutes

Example: `liza.yourdomain.com`

---

## Upgrade to Pro (Optional)

For unlimited serverless functions and storage:
- Go to https://vercel.com/account
- Click "Billing"
- Select "Pro" plan
- $20/month

---

## Support Resources

- **Vercel Docs**: https://vercel.com/docs
- **Community**: https://github.com/vercel/vercel/discussions
- **Status**: https://www.vercelstatus.com
- **Pricing**: https://vercel.com/pricing

---

## Quick Reference

| Command | Purpose |
|---------|---------|
| `vercel` | Deploy to staging |
| `vercel --prod` | Deploy to production |
| `vercel logs` | View deployment logs |
| `vercel rollback` | Rollback to previous version |
| `vercel remove` | Remove deployment |
| `vercel env` | Manage environment variables |
| `vercel secrets` | Manage secret variables |

---

## Deployment Summary

```
┌─────────────────────────────────┐
│      LIZA Deployment Ready      │
├─────────────────────────────────┤
│ Project Name:    liza           │
│ Build Status:    ✅ Complete    │
│ Status:          ✅ Ready       │
│ Environment:     ✅ Configured  │
│ Next Step:       Deploy         │
└─────────────────────────────────┘
```

---

**Last Updated**: January 2, 2026  
**Status**: Ready for Deployment  
**Build**: Production  
**Rebranding**: SHINA → LIZA Complete
