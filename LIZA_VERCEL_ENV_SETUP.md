# 🚀 LIZA - Vercel Deployment Complete Guide

## Current Status
✅ Application deployed to Vercel  
⚠️ Environment variables not set (causing HTTP 500)  
🔧 Need to configure RPC endpoint  

---

## Fix: Add Environment Variables to Vercel

### Step 1: Open Vercel Dashboard
Go to: **https://vercel.com/dashboard**

### Step 2: Select Your Project
- Click on **"shina"** or **"liza"** project

### Step 3: Go to Settings
- Click **Settings** tab

### Step 4: Environment Variables
- Click **Environment Variables** (left sidebar)

### Step 5: Add Each Variable

**Add SOLANA_RPC_URL:**
- Name: `SOLANA_RPC_URL`
- Value: `https://api.mainnet-beta.solana.com`
- Click **Add**

**Add SOLANA_NETWORK:**
- Name: `SOLANA_NETWORK`
- Value: `mainnet`
- Click **Add**

**Add SOLANA_PUBLIC_KEY (Optional):**
- Name: `SOLANA_PUBLIC_KEY`
- Value: `CMVrzdso4SShQm2irrc7jMCN9Vw5QxXvrZKB79cYPPJT`
- Click **Add**

### Step 6: Redeploy
- Go back to **Deployments**
- Click the latest deployment
- Click **Redeploy** button
- Wait 30 seconds for redeployment

---

## Via Terminal (Faster)

### Option 1: Using Vercel CLI

```powershell
cd d:\shina

# Add environment variables
vercel env add SOLANA_RPC_URL
# Paste: https://api.mainnet-beta.solana.com

vercel env add SOLANA_NETWORK  
# Paste: mainnet

# Redeploy with new env vars
vercel --prod
```

### Option 2: Direct Command

```powershell
cd d:\shina

# Add all at once
vercel env add SOLANA_RPC_URL "https://api.mainnet-beta.solana.com"
vercel env add SOLANA_NETWORK "mainnet"

# Deploy
vercel --prod
```

---

## Environment Variables Explained

| Variable | Value | Purpose |
|----------|-------|---------|
| `SOLANA_RPC_URL` | `https://api.mainnet-beta.solana.com` | Blockchain connection |
| `SOLANA_NETWORK` | `mainnet` | Solana network |
| `SOLANA_PUBLIC_KEY` | Your wallet address | Optional - server wallet |
| `SOLANA_PRIVATE_KEY` | Your private key | Optional - server signing |

---

## Complete Deployment Flow

```
1. Deploy to Vercel ✅
2. Add Environment Variables ⏭️ (DO THIS NOW)
3. Redeploy with Env Vars ⏭️ (DO THIS AFTER)
4. Test Balance Check ⏭️ (FINAL)
```

---

## Test After Deployment

### Test 1: Visit Your App
```
https://shina-6rz9nyvj7-naquibmirza-6034s-projects.vercel.app
```

Should show: **LIZA - Autonomous Agent**

### Test 2: Check Balance
1. Click "Connect Phantom Wallet"
2. Click "Balance" button
3. Should see SOL balance ✅ (not HTTP 500)

### Test 3: API Direct Test
```powershell
$url = "https://shina-6rz9nyvj7-naquibmirza-6034s-projects.vercel.app/api/balance"
$body = @{userPublicKey = "CMVrzdso4SShQm2irrc7jMCN9Vw5QxXvrZKB79cYPPJT"} | ConvertTo-Json
Invoke-WebRequest -Uri $url -Method POST -ContentType "application/json" -Body $body
```

Should return balance, NOT HTTP 500 ✅

---

## Why HTTP 500 Error?

**Cause:** `SOLANA_RPC_URL` environment variable not set  
**Result:** Chat handler tries to use `undefined` RPC URL  
**Fix:** Add environment variable to Vercel  

```
Missing Env Var → RPC URL undefined → Connection fails → HTTP 500 Error
```

---

## Quick Fix (Fastest Path)

### In PowerShell:

```powershell
cd d:\shina

# Step 1: Add RPC URL
vercel env add SOLANA_RPC_URL "https://api.mainnet-beta.solana.com"

# Step 2: Add Network
vercel env add SOLANA_NETWORK "mainnet"

# Step 3: Redeploy
vercel --prod

# Done! Your app is live with env vars set ✅
```

---

## Verify Deployment

After redeployment:

1. Wait 30-60 seconds
2. Open your Vercel app
3. Connect wallet
4. Click "Balance" button
5. Should work now! ✅

---

## Troubleshooting

### Still getting HTTP 500?

**Check 1:** Verify env vars are set
```powershell
vercel env ls
# Should show SOLANA_RPC_URL and SOLANA_NETWORK
```

**Check 2:** Verify redeployment completed
```powershell
vercel ls
# Latest deployment should show "READY"
```

**Check 3:** Clear browser cache
- Press `Ctrl+Shift+Delete`
- Clear cache
- Refresh app

**Check 4:** Check server logs
```powershell
vercel logs
# Look for errors in output
```

---

## Your Deployment URL

```
https://shina-6rz9nyvj7-naquibmirza-6034s-projects.vercel.app
```

**Inspect/Manage:**
https://vercel.com/naquibmirza-6034s-projects/shina

---

## Next Steps

1. ✅ Deployment done
2. ⏭️ **Add environment variables** (DO NOW)
3. ⏭️ Redeploy
4. ⏭️ Test balance check
5. ✅ Done!

---

**Do this now to fix HTTP 500:**

```powershell
cd d:\shina
vercel env add SOLANA_RPC_URL "https://api.mainnet-beta.solana.com"
vercel env add SOLANA_NETWORK "mainnet"
vercel --prod
```

Then wait 30 seconds and test your app! 🚀
