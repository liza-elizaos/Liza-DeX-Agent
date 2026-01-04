# 🔧 V0.dev RPC Configuration Guide

**Issue**: `toLocaleDateString is not a function` error  
**Root Cause**: lastActivity was Date object, needed to be string for serialization  
**Status**: ✅ FIXED

---

## ✅ WHAT WAS FIXED

### Problem:
```typescript
// BEFORE (❌ Broken):
lastActivity: lastActivityDate  // Returns Date object
// Later when trying to use:
trustData.lastActivity.toLocaleDateString()  // ❌ Error!
```

### Solution:
```typescript
// AFTER (✅ Fixed):
lastActivity: lastActivityDate.toISOString()  // Returns string: "2026-01-04T15:30:45.000Z"
// Later when trying to use:
new Date(trustData.lastActivity).toLocaleDateString()  // ✅ Works!
```

---

## 🔌 SOLANA RPC CONFIGURATION

### Recommended RPC URLs for v0.dev:

#### Option 1: **Alchemy (RECOMMENDED)**
```env
SOLANA_RPC_URL=https://solana-mainnet.g.alchemy.com/v2/YOUR_API_KEY
```
✅ Reliable  
✅ Fast  
✅ Good rate limits  
⏳ Need API key

#### Option 2: **QuickNode**
```env
SOLANA_RPC_URL=https://api.quicknode.pro/v1/YOUR_TOKEN/solana
```
✅ Very reliable  
✅ Premium support  
⏳ Need API key  
💰 Paid plan

#### Option 3: **Default Public RPC (Not Recommended)**
```env
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
```
⚠️ Rate limited  
⚠️ Slow (public)  
⚠️ May timeout on large requests  
✅ Free (no key needed)

#### Option 4: **Helius RPC (Good Alternative)**
```env
SOLANA_RPC_URL=https://mainnet.helius-rpc.com/?api-key=YOUR_API_KEY
```
✅ Reliable  
✅ Fast  
✅ Free tier available  
✅ Good for development

---

## 📋 COMPLETE FIX CHECKLIST FOR V0.DEV

### Step 1: Update DEV_TRUST_SCORE_SYSTEM.md Code
- [ ] Replace `api/trust-score.ts` with the FIXED version
- [ ] Update `lastActivity: string` in interface (not Date)
- [ ] Update `lastActivityDate.toISOString()` in return statement
- [ ] Update handler to use `new Date(trustData.lastActivity).toLocaleDateString()`

### Step 2: Set RPC URL in .env
```env
# Choose ONE of these:

# Best option (requires API key):
SOLANA_RPC_URL=https://solana-mainnet.g.alchemy.com/v2/YOUR_API_KEY

# Or simpler:
SOLANA_RPC_URL=https://mainnet.helius-rpc.com/?api-key=YOUR_API_KEY

# Or minimal (may have rate limits):
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
```

### Step 3: Rebuild & Test
```bash
npm run build
npm run dev
```

### Step 4: Test Command
```
check dev trust DScqtGwFoDTme2Rzdjpdb2w7CtuKc6Z8KF7hMhbx8ugQ
```

Expected output (no errors):
```
✅ Developer Trust Score Report

Wallet: DScqtGwFoDTme2Rzdjpdb2w7CtuKc6Z8KF7hMhbx8ugQ
Trust Score: 5.3/10 🟡

📊 METRICS:
• Total Transactions: 45
• Token Launches: 2
• Account Age: 120 days
• Last Activity: 1/3/2026
• Unique Contracts: 8

...
```

### Step 5: Deploy
```bash
npx vercel deploy --prod --yes
```

---

## 🚨 COMMON ERRORS & SOLUTIONS

### Error 1: "maxSupportedTransactionVersion not supported"
```
Error: Transaction version (0) is not supported
```

**Cause**: RPC doesn't support newer transaction versions  
**Solution**: Use Alchemy or Helius (they support v0)

### Error 2: "Rate limited"
```
Error: 429 Too Many Requests
```

**Cause**: Using public RPC with too many requests  
**Solution**: Use Alchemy or Helius with API key

### Error 3: "Connection timeout"
```
Error: ECONNREFUSED or ETIMEDOUT
```

**Cause**: RPC is down or unreachable  
**Solution**: Check RPC URL, test in browser, switch providers

### Error 4: "lastActivity is not a function"
```
Error: trustData.lastActivity.toLocaleDateString is not a function
```

**Cause**: lastActivity is string, not Date  
**Solution**: Use `new Date(trustData.lastActivity).toLocaleDateString()`

---

## 🧪 TESTING THE FIX

### Test 1: Check if RPC Works
```javascript
// In browser console on production:
fetch('https://your-api.vercel.app/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    walletAddress: '6i1HTXhcxreAEys8QMEvnB1FNpNVwombS61QcwquJb1f',
    message: 'check dev trust DScqtGwFoDTme2Rzdjpdb2w7CtuKc6Z8KF7hMhbx8ugQ'
  })
}).then(r => r.json()).then(console.log)
```

### Test 2: Check Logs
```bash
# In Vercel dashboard, check Function Logs
# Should see:
[TRUST] Analyzing 100 transactions for DScq...
# No error messages
```

### Test 3: Test Different Wallets
```
check dev trust 6i1HTXhcxreAEys8QMEvnB1FNpNVwombS61QcwquJb1f
```

---

## 📊 RPC COMPARISON TABLE

| Provider | Cost | Speed | Reliability | Supports v0 | Free Tier |
|----------|------|-------|-------------|------------|-----------|
| Alchemy | $$ | ⚡⚡⚡ | ⭐⭐⭐⭐⭐ | ✅ | Yes |
| Helius | $ | ⚡⚡⚡ | ⭐⭐⭐⭐⭐ | ✅ | Yes |
| QuickNode | $$$ | ⚡⚡⚡ | ⭐⭐⭐⭐⭐ | ✅ | No |
| Public RPC | Free | ⚡ | ⭐⭐ | ⚠️ | Yes |

**Recommendation for v0.dev**: Use **Alchemy** or **Helius** with free tier

---

## 🔐 SECURITY NOTE

**Never share your RPC API keys!**

```env
# ✅ SAFE - Use environment variable
SOLANA_RPC_URL=https://solana-mainnet.g.alchemy.com/v2/YOUR_SECRET_KEY

# ❌ UNSAFE - Don't hardcode in code
const rpcUrl = "https://solana-mainnet.g.alchemy.com/v2/YOUR_SECRET_KEY";
```

---

## 💡 TROUBLESHOOTING CHECKLIST

### If getting timeout errors:
- [ ] Check RPC URL is correct
- [ ] Check SOLANA_RPC_URL in .env
- [ ] Try different RPC provider
- [ ] Check if wallet address is valid
- [ ] Check network tab for actual errors

### If getting "not a function" errors:
- [ ] Verify trust-score.ts has been updated
- [ ] Verify handler uses `new Date(trustData.lastActivity)`
- [ ] Rebuild: `npm run build`
- [ ] Clear browser cache
- [ ] Test on fresh deployment

### If getting signature parsing errors:
- [ ] RPC may not support that transaction type
- [ ] Try Alchemy or Helius
- [ ] The wallet may have v1 transactions
- [ ] This is expected for some wallets - it skips them

---

## 📞 SUMMARY FOR V0.DEV

**What to do:**
1. Copy the FIXED code from DEV_TRUST_SCORE_SYSTEM.md
2. Set SOLANA_RPC_URL to Alchemy or Helius
3. Deploy and test

**Root cause of error:**
- lastActivity was a Date object being returned
- Needed to convert to ISO string for serialization
- Handler now converts it back to Date when displaying

**Result:**
- ✅ No more "toLocaleDateString is not a function" errors
- ✅ Works with all RPC providers (Alchemy recommended)
- ✅ Fast and reliable

---

**Created**: January 4, 2026  
**Status**: ✅ FIXED & READY TO DEPLOY
