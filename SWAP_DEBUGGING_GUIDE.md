# 🔧 SWAP ISSUE - STEP-BY-STEP DEBUGGING GUIDE

**Issue**: Fetching works ✅, but swap signing doesn't reach Phantom ❌

---

## 🎯 QUICK DIAGNOSIS

### What's Working ✅
- Wallet connects
- Messages reach backend
- Backend returns swap data
- Frontend receives response

### What's Broken ❌
- Phantom signing popup never appears
- Transaction never gets signed
- Swap never executes
- No error message shown

---

## 🧪 DEBUG STEP-BY-STEP

### STEP 1: Check Browser Console
```
1. Open website: https://shina-bqx35uu2u-naquibmirza-6034s-projects.vercel.app
2. Press F12 (open DevTools)
3. Go to "Console" tab
4. Type swap: "swap 0.001 SOL for USDC"
5. Watch the console
```

**You should see:**
```
✅ GOOD:
[CHAT] Sending request: { hasWallet: true, message: "swap..." }
[CHAT] Request body: { walletPublicKey: "9B5X6q78..." }
✅ Response received

(Then) Phantom popup should appear here
❌ But: Nothing happens after "Response received"
```

---

### STEP 2: Check What Backend Is Sending

**Look for in browser console:**
```javascript
// Copy this and run it in browser console:
fetch('/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    sessionId: 'test_123',
    message: 'swap 0.001 SOL for USDC',
    walletPublicKey: 'YOUR_WALLET_ADDRESS',
    context: 'trading',
    config: null
  })
})
.then(r => r.json())
.then(data => console.log(JSON.stringify(data, null, 2)))
```

**Should show:**
```json
{
  "response": "Swap instructions ready...",
  "swap": {
    "status": "pending_signature",
    "transactionBase64": "AZfvKHF7V4k...",
    "fromToken": "SOL",
    "toToken": "USDC",
    "amount": 0.001,
    "estimatedOutput": 0.095
  }
}
```

**If you see this** ✅ → Backend is working, problem is frontend

---

### STEP 3: Check if Code Is Even Running

Add this debugging to `src/frontend/index.tsx` around line 260:

```typescript
// ADD THESE LOGS - Line 260, right after: const data = await response.json();

console.log('[DEBUG] === SWAP RESPONSE DEBUG ===');
console.log('[DEBUG] Full data:', data);
console.log('[DEBUG] data.swap exists?', !!data.swap);
console.log('[DEBUG] data.swap:', data.swap);
console.log('[DEBUG] Has transactionBase64?', !!data.swap?.transactionBase64);
console.log('[DEBUG] Status:', data.swap?.status);
console.log('[DEBUG] Status === pending_signature?', data.swap?.status === 'pending_signature');
console.log('[DEBUG] === END DEBUG ===');

// THEN the existing code:
if (data.swap && data.swap.status === "pending_signature" && data.swap.transactionBase64) {
  console.log('[CHAT] Detected pending signature swap, triggering Phantom signing...');
  // ... rest of code
}
```

**Rebuild and test:**
```bash
npm run build
npx vercel deploy --prod --yes
```

Then try swap again and check console output.

---

### STEP 4: Check If Phantom Is Connected

**Run in browser console:**
```javascript
console.log('window.solana:', window.solana);
console.log('Is connected?', window.solana?.isConnected);
console.log('Public key:', window.solana?.publicKey?.toString());
```

**Should show:**
```
window.solana: { isConnected: true, publicKey: PublicKey {...} }
Is connected? true
Public key: 9B5X6q78YZA9BQ5X6q78YZA9BQ5X6q78YZA9BQ5X6qW
```

**If shows `undefined` or `null`** ❌
- Phantom not connected
- Or wrong window object

---

### STEP 5: Check If Function Exists

**In browser console:**
```javascript
// Check if the signing function is available
console.log('signAndSendBase64Tx:', typeof signAndSendBase64Tx);

// If shows: "undefined"
// → Function is not imported or not accessible
```

**To fix** - Check `src/frontend/index.tsx` line 7:
```typescript
import { signAndSendBase64Tx } from './phantom-sign-and-send';
```

**If this line is missing** ❌ → Add it

---

### STEP 6: Test Phantom Signing Directly

**Run in browser console:**
```javascript
// Get base64 string from backend response (from STEP 2)
const base64 = "AZfvKHF7V4k2hQ5vE8Z9p1lN3mQ7rS5tU2vW4xY6zZ1..."; // Use actual from response

// Import Solana web3
const { Transaction } = await import('https://unpkg.com/@solana/web3.js@latest');

// Decode transaction
const transaction = Transaction.from(Buffer.from(base64, 'base64'));
console.log('Transaction decoded:', transaction);

// Try to sign
try {
  const result = await window.solana.signAndSendTransaction(transaction);
  console.log('✅ SUCCESS! Signed tx:', result.signature);
} catch (error) {
  console.log('❌ ERROR:', error.message);
}
```

**This will tell you if**:
- Phantom can decode the transaction
- Phantom can sign
- Or where exactly it's failing

---

## 🔴 COMMON ISSUES & FIXES

### Issue 1: Function Not Imported
```typescript
// WRONG - Line 7 of index.tsx:
// import { signAndSendBase64Tx } from './phantom-sign-and-send';  (commented out)

// RIGHT:
import { signAndSendBase64Tx } from './phantom-sign-and-send';
```

### Issue 2: RPC URL Wrong
```typescript
// WRONG:
const rpcUrl = 'https://api.devnet.solana.com';

// RIGHT (for mainnet):
const rpcUrl = 'https://api.mainnet-beta.solana.com';
```

### Issue 3: Response Check Too Strict
```typescript
// WRONG (might not match):
if (data.swap.status === 'pending_signature') { }

// RIGHT (with safety):
if (data?.swap?.status === 'pending_signature' && data?.swap?.transactionBase64) { }
```

### Issue 4: Error Not Being Shown
```typescript
// WRONG (silent fail):
try {
  await signAndSendBase64Tx(...);
} catch (error) {
  // Nothing - user never sees error
}

// RIGHT (show error to user):
try {
  await signAndSendBase64Tx(...);
} catch (error) {
  console.error('[SWAP] Error:', error);
  setMessages(prev => [...prev, {
    id: `error_${Date.now()}`,
    role: 'assistant',
    content: `❌ Swap failed: ${error.message}`,
    timestamp: new Date(),
  }]);
}
```

### Issue 5: Phantom API Wrong
```typescript
// OLD API (doesn't work):
const result = await window.solana.send(transaction);

// NEW API (correct):
const result = await window.solana.signAndSendTransaction(transaction);
```

---

## 📋 VERIFICATION CHECKLIST

### Frontend Code Checklist:
- [ ] `signAndSendBase64Tx` is imported from `./phantom-sign-and-send`
- [ ] Code checks for `data.swap.status === 'pending_signature'`
- [ ] Code checks for `data.swap.transactionBase64`
- [ ] Phantom wallet is obtained: `window.solana`
- [ ] Error messages are shown to user
- [ ] RPC URL is mainnet (not devnet)
- [ ] Try-catch block exists with proper error handling

### File Checks:
- [ ] `src/frontend/index.tsx` exists
- [ ] `src/frontend/phantom-sign-and-send.ts` exists
- [ ] Both files are imported correctly
- [ ] No syntax errors in either file

### Environment Checks:
- [ ] Running on Solana Mainnet (not devnet)
- [ ] SOLANA_RPC_URL is mainnet in .env
- [ ] Phantom wallet is connected before swap
- [ ] Wallet has SOL for transaction fees (min 0.005 SOL)

---

## 🚀 QUICK FIXES (Try These First)

### Fix #1: Add Missing Import
```typescript
// In src/frontend/index.tsx, line 7:
import { signAndSendBase64Tx } from './phantom-sign-and-send';
```

### Fix #2: Add Debug Logging
```typescript
// Around line 260 in src/frontend/index.tsx:
console.log('[DEBUG] Response:', data);
if (data.swap && data.swap.status === 'pending_signature') {
  console.log('[DEBUG] Starting Phantom signing...');
  try {
    const phantomWallet = (window as any).solana;
    console.log('[DEBUG] Phantom wallet:', phantomWallet);
    // ... rest of code
  } catch (e) {
    console.error('[DEBUG] Error:', e);
  }
}
```

### Fix #3: Fix RPC URL
```typescript
// In src/frontend/phantom-sign-and-send.ts:
// Change from:
// const rpcUrl = 'https://api.devnet.solana.com';
// To:
const rpcUrl = 'https://api.mainnet-beta.solana.com';
```

### Fix #4: Rebuild & Deploy
```bash
npm run build
npx vercel deploy --prod --yes
```

---

## 📤 HOW TO REPORT TO v0.dev

**Send them this:**

```
BUG: Swap signing not reaching Phantom

ISSUE:
- Fetching works ✅
- Backend builds transaction ✅
- Frontend receives response ✅
- Phantom.signAndSendTransaction() never called ❌

DEBUG OUTPUT:
(Paste console logs from STEP 1-3 above)

FILES:
- src/frontend/index.tsx (lines 260-300)
- src/frontend/phantom-sign-and-send.ts

BACKEND RESPONSE (Working):
{
  "swap": {
    "status": "pending_signature",
    "transactionBase64": "AZfv..."
  }
}

WHAT WE NEED:
1. Why isn't signAndSendBase64Tx being called?
2. Is the import correct?
3. Is the Phantom API call correct?
4. Why no error messages?

Can you help debug this?
```

---

## ✅ RESOLUTION VERIFICATION

After fixes, verify by:
1. ✅ Connect Phantom wallet
2. ✅ Type swap: "swap 0.001 SOL for USDC"
3. ✅ Phantom popup appears
4. ✅ See transaction in Phantom
5. ✅ Click approve
6. ✅ Transaction signature appears
7. ✅ Chat shows: "✅ Swap completed!"
8. ✅ Tokens appear in wallet

---

**Issue Priority**: 🔴 CRITICAL - Core feature broken
**Needs Help From**: v0.dev team
**Share This File**: Yes, send to v0.dev
