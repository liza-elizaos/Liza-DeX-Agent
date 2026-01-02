# 🎯 LIZA - Quick Deployment (5 Minutes)

## Status: ✅ READY TO DEPLOY

Build is complete. Your app is ready to go live!

---

## Fastest Route: Vercel CLI

### Step 1: Install Vercel (1 minute)
```bash
npm install -g vercel
```

### Step 2: Deploy (2 minutes)
```bash
cd d:\shina
vercel
```

### Step 3: Answer Questions
```
✓ Set up and deploy? Yes
✓ Which scope? Your-Account-Name
✓ Link to existing project? No
✓ Project name? liza
✓ Code location? ./
✓ Modify settings? No
```

### Step 4: Done! 🎉
Your app is now live at: **https://liza-XXXX.vercel.app**

---

## Add Environment Variables (IMPORTANT!)

After deployment, you must set environment variables:

### In Terminal:
```bash
vercel env add
# Answer prompts for:
# - SOLANA_RPC_URL
# - SOLANA_PUBLIC_KEY
# - SOLANA_PRIVATE_KEY
# - SOLANA_NETWORK (set to: mainnet)
```

### OR in Browser:
1. Go to https://vercel.com/dashboard
2. Click "liza" project
3. Click "Settings"
4. Click "Environment Variables"
5. Add:
   - `SOLANA_RPC_URL` = `https://solana-mainnet.g.alchemy.com/v2/YOUR_KEY`
   - `SOLANA_PUBLIC_KEY` = your wallet address
   - `SOLANA_PRIVATE_KEY` = your private key
   - `SOLANA_NETWORK` = `mainnet`
6. Redeploy: `vercel --prod`

---

## Verify Deployment

### Test 1: Visit Your App
https://liza-XXXX.vercel.app

You should see: **🚀 LIZA - Solana AI Assistant**

### Test 2: Test API
```bash
curl https://liza-XXXX.vercel.app/api/balance \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"userPublicKey":"CMVrzdso4SShQm2irrc7jMCN9Vw5QxXvrZKB79cYPPJT"}'
```

Should return wallet balance.

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| "Command not found: vercel" | Run: `npm install -g vercel` |
| "Environment variables not working" | Redeploy after adding: `vercel --prod` |
| "Balance returns error" | Check SOLANA_RPC_URL is correct |
| "Can't connect wallet" | Make sure using HTTPS, not HTTP |

---

## What You'll Get

✅ Live LIZA app on Vercel  
✅ Automatic HTTPS/SSL  
✅ Global CDN for fast loading  
✅ Auto-scaling for traffic  
✅ Instant deploys on updates  

---

## Next Steps

1. Run: `vercel`
2. Wait for deployment (2 minutes)
3. Get your URL: `https://liza-XXXX.vercel.app`
4. Add environment variables in Vercel dashboard
5. Redeploy: `vercel --prod`
6. Share your app! 🚀

---

## Example Deployment Flow

```
Terminal:
$ cd d:\shina
$ vercel

✔ Linked to your account
✔ Created production build
✔ Files uploaded
✔ Build complete
✔ Deployment complete

Your deployment is ready at:
https://liza-abc123.vercel.app
```

---

## More Info

- Full guide: [LIZA_DEPLOYMENT.md](LIZA_DEPLOYMENT.md)
- View logs: `vercel logs`
- Manage project: https://vercel.com/dashboard

---

**Ready?** Run: `vercel` 🚀
