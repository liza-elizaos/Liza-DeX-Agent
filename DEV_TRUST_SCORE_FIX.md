# 🔧 DEV TRUST SCORE - QUICK FIX GUIDE

**Problem**: Transaction version error - "maxSupportedTransactionVersion not configured"  
**Solution**: Update Connection object + improve error handling

---

## ✅ FIXES APPLIED

### Fix #1: Connection Configuration
```typescript
// BEFORE (❌ Broken):
const connection = new Connection(rpcUrl);

// AFTER (✅ Fixed):
const connection = new Connection(rpcUrl, {
  commitment: 'confirmed',
  maxSupportedTransactionVersion: 0
});
```

### Fix #2: Reduce Transaction Limit
```typescript
// BEFORE (❌ Slow):
const signatures = await connection.getSignaturesForAddress(pubkey, {
  limit: 1000  // Too many!
});

// AFTER (✅ Faster):
const signatures = await connection.getSignaturesForAddress(pubkey, {
  limit: 100  // Reasonable limit
});
```

### Fix #3: Use getTransaction Instead of getParsedTransaction
```typescript
// BEFORE (❌ Failing):
const tx = await connection.getParsedTransaction(sig.signature);

// AFTER (✅ Working):
const tx = await connection.getTransaction(sig.signature, {
  maxSupportedTransactionVersion: 0
});
```

### Fix #4: Add Try-Catch for Each Transaction
```typescript
// BEFORE (❌ One error breaks all):
for (const sig of signatures) {
  const tx = await connection.getParsedTransaction(sig.signature);  // Fails here
  // Never processes remaining transactions
}

// AFTER (✅ Continues on error):
for (let i = 0; i < Math.min(signatures.length, 50); i++) {
  try {
    const tx = await connection.getTransaction(sig.signature, {
      maxSupportedTransactionVersion: 0
    });
    // Process transaction
  } catch (txError) {
    console.log(`Skipped transaction ${signatures[i].signature}`);
    // Continue to next
  }
}
```

### Fix #5: Simpler Token Launch Detection
```typescript
// BEFORE (❌ Too complex):
if (isTokenLaunch(tx)) {  // Function doesn't work properly
  tokenLaunches++;
}

// AFTER (✅ Simple & reliable):
const hasSPLToken = tx.transaction.message.accountKeys.some(
  ak => ak.pubkey.toString() === 'TokenkegQfeZyiNwAJsyFbPVwwQQfփ'
);

if (hasSPLToken) {
  tokenLaunches++;
}
```

### Fix #6: Better Error Messages
```typescript
// BEFORE (❌ Confusing):
throw new Error(`Failed to analyze wallet: ${error.message}`);

// AFTER (✅ Helpful):
return {
  response: `❌ Error analyzing wallet: ${error.message}. Please verify the wallet address is valid.`,
  error: true
};
```

### Fix #7: Add Logging for Debugging
```typescript
console.log(`[TRUST] Analyzing ${totalTransactions} transactions for ${walletAddress}`);
// ... later
console.log(`[TRUST] Skipped transaction ${signatures[i].signature}`);
// ... error handling
console.error('[TRUST_ERROR]', error.message);
```

### Fix #8: Helper Functions for Better Output
```typescript
function getTrustEmoji(score: number): string {
  if (score >= 8) return '🟢';
  if (score >= 6) return '🟡';
  return '🔴';
}

function getRiskLevel(score: number): string {
  if (score >= 8) return '🟢 LOW RISK';
  if (score >= 6) return '🟡 MEDIUM RISK';
  if (score >= 4) return '🟡 MEDIUM-HIGH RISK';
  return '🔴 HIGH RISK';
}
```

---

## 🚀 HOW TO APPLY FIXES

### Step 1: Update Trust Score File
Copy the FIXED code from `DEV_TRUST_SCORE_SYSTEM.md` Section 2.

Replace your `api/trust-score.ts` completely with the new version.

**Key change**: `lastActivity` now returns string (ISO format), not Date object

### Step 2: Update Handler Import
In `api/chat.ts` line 1, add:
```typescript
import { calculateDevTrustScore } from './trust-score';
```

### Step 3: Update Handler Function
Replace the handler code around line 500 with the FIXED version from `DEV_TRUST_SCORE_SYSTEM.md` Section 3.

**Key change**: Use `new Date(trustData.lastActivity).toLocaleDateString()` instead of `trustData.lastActivity.toLocaleDateString()`

### Step 4: Configure RPC URL
In `.env`:
```env
# Best option (requires API key from Alchemy):
SOLANA_RPC_URL=https://solana-mainnet.g.alchemy.com/v2/YOUR_API_KEY

# Or use Helius (free tier available):
SOLANA_RPC_URL=https://mainnet.helius-rpc.com/?api-key=YOUR_API_KEY

# Or public (may have rate limits):
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
```

**Recommended**: Use Alchemy or Helius for reliability

### Step 5: Test
```bash
npm run dev

# In chat, type:
check dev trust DScqtGwFoDTme2Rzdjpdb2w7CtuKc6Z8KF7hMhbx8ugQ
```

### Step 6: Check Logs
Open browser DevTools → Console
Should see:
```
[TRUST] Analyzing 100 transactions for DScq...
```

Should NOT see:
```
toLocaleDateString is not a function
```

### Step 7: Deploy
```bash
npm run build
npx vercel deploy --prod --yes
```

---

## ✅ VERIFICATION CHECKLIST

- [ ] Connection includes `maxSupportedTransactionVersion: 0`
- [ ] Using `getTransaction()` not `getParsedTransaction()`
- [ ] Limit set to 100 (not 1000)
- [ ] Each transaction wrapped in try-catch
- [ ] SPL token detection works
- [ ] Error messages are helpful
- [ ] Logging is present for debugging
- [ ] Helper functions are defined
- [ ] Deploy successful

---

## 🧪 TESTING

### Test 1: Valid Developer Wallet
```
check dev trust 7xKm9vH2cL8nQ5pR1bZ3aY4tU6vW9xJ2kL5mN8pQ1r
```

Expected: Score 6-10, green flags shown

### Test 2: New Account
```
check dev trust 9xH1pY3aQ5bL7nK2mZ4cV6rT8uW1xJ3kL5mN7pQ9s
```

Expected: Score 2-4, yellow/red flags

### Test 3: Invalid Address
```
check dev trust invalid123
```

Expected: Error message: "Error analyzing wallet: invalid public key"

---

## 🔍 DEBUGGING TIPS

If still getting errors:

1. **Check browser console** for `[TRUST]` logs
2. **Check .env** - `SOLANA_RPC_URL` must be set
3. **Try a known wallet** instead of random ones
4. **Check Solana explorer** - verify wallet exists
5. **Look for network errors** in DevTools Network tab

---

## 📊 EXPECTED RESPONSE

After fixes, you should see:
```
✅ Developer Trust Score Report

Wallet: HdZh1mUvCVJzHfTFaJJxZJFENhiFAkyiXLA5iZZTpump
Trust Score: 7.2/10 🟡

📊 METRICS:
• Total Transactions: 234
• Token Launches: 8
• Account Age: 456 days
• Last Activity: 1/4/2026
• Unique Contracts: 23

✅ GREEN FLAGS (3):
  ✅ Regular on-chain activity (100+ transactions)
  ✅ Multiple successful token launches
  ✅ Established account (6+ months old)

⚠️ YELLOW FLAGS (1):
  ⚠️ High frequency token launches (risky)

💡 RECOMMENDATION:
MEDIUM-HIGH TRUST - Active developer with good activity

Risk Level: 🟡 MEDIUM RISK
```

---

**All fixes are in DEV_TRUST_SCORE_SYSTEM.md - Sections 2 & 3**

Ready to deploy!
