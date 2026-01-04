# 🔍 WALLET CONNECTION DEBUGGING GUIDE

## Production URL (Latest Deployment - UPDATED)
**https://shina-bqx35uu2u-naquibmirza-6034s-projects.vercel.app**

⚠️ **NEW: Enhanced backend logging deployed** - shows wallet detection step-by-step

---

## 🔄 WHAT WAS JUST FIXED (Current Session)

### Backend Changes (api/chat.ts - Just Deployed)
- ✅ **Fixed wallet parameter handling**: Now properly detects if `walletPublicKey` is empty string vs undefined vs valid address
- ✅ **Enhanced logging**: Added `[WALLET DETECTION STEP 1/2/3]` detailed trace logs to show exactly where wallet is lost
- ✅ **Proper fallback**: Only tries to extract wallet from message IF parameter is truly empty
- ✅ **Added `[CHAT] REQUEST RECEIVED` logs**: Shows full wallet data with type, length, isEmpty flag

### Frontend - No Changes Needed
- ✅ Code is correct and already sends `walletPublicKey`
- ✅ localStorage persistence working as designed
- ✅ Auto-reconnection on page load working

---

### Backend (api/chat.ts)
- ✅ Proper wallet detection from `walletPublicKey` parameter
- ✅ Fallback extraction from message
- ✅ Server wallet config support
- ✅ Clear error messages

### Frontend (src/frontend/index.tsx)
- ✅ **localStorage persistence** - wallet survives page reload
- ✅ **Auto-reconnection** - checks Phantom on page load
- ✅ **Always send walletPublicKey** - in every request body
- ✅ **Detailed console logging** - shows wallet being sent
- ✅ **Visual indicator** - green dot shows wallet connected

---

## 🧪 HOW TO DEBUG YOUR USER'S ISSUE

### Step 1: Open DevTools
```
1. Go to: https://shina-bek7en322-naquibmirza-6034s-projects.vercel.app
2. Press F12 (or right-click → Inspect)
3. Go to "Console" tab
4. Clear console (icon in top-left)
```

### Step 2: Connect Wallet
```
1. Click "🔗 Connect Phantom" button
2. Approve in Phantom wallet
3. Watch console - you'll see:
   [WALLET] Connecting to Phantom...
   [WALLET] Connected: CMVrz...PPJT
```

### Step 3: Send Swap Request
```
1. In chat box, type: "swap 0.001 SOL for USDC"
2. Press Enter
3. Check console for these logs:

   [CHAT] Sending request: {
     apiUrl: "/api/chat",
     hasWallet: true,           ← Should be TRUE
     walletPrefix: "CMVrz...",  ← Should show wallet
     message: "swap 0.001 SOL for USDC"
   }

   [CHAT] Request body: {
     walletPublicKey: "CMVrz..." ← Should NOT be "NOT SET"
   }
```

### Step 4: Check Response
```
✅ GOOD RESPONSE:
"Swap instructions ready for client signing"

❌ BAD RESPONSE:
"Wallet not connected. Please connect your Solana wallet..."

If you see ❌ bad response, check:
1. Is `hasWallet: true` in console?
2. Is `walletPublicKey` set in request body?
3. Did wallet actually connect (green indicator)?
```

---

## 🔧 POSSIBLE USER ISSUES & FIXES

### Issue 1: Wallet connects but swap says "not connected"
**Root Cause**: `walletPublicKey` not being sent from frontend
**Check**:
- Open DevTools Console
- Type swap command
- Look for `[CHAT] Request body` log
- Is `walletPublicKey` shown or "NOT SET"?

**Fix If NOT SET**:
1. Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
2. Clear localStorage: 
   - Console: `localStorage.clear()`
   - Reload page
   - Reconnect wallet

### Issue 2: Wallet shows connected but auto-reconnect not working
**Check**:
- Close browser
- Reopen website
- Look for console: `[WALLET] Restored from localStorage`
- If NOT there, localStorage was cleared

**Fix**:
- User must click Connect Phantom again
- System will now remember it (localStorage persists for 30 days)

### Issue 3: Browser cache showing old version
**Fix**:
1. Hard refresh: Ctrl+Shift+R
2. Clear cache: Ctrl+Shift+Delete → "Cached images and files"
3. Reload page
4. Reconnect wallet

---

## 📊 REQUEST/RESPONSE FLOW

### Correct Flow:
```
USER → "swap 0.001 SOL for USDC"
         ↓
FRONTEND (index.tsx):
  - Read walletAddress from state
  - Create request body:
    {
      message: "swap 0.001 SOL for USDC",
      walletPublicKey: "CMVrz...PPJT"  ← KEY PART
    }
  - Log to console for debugging
  - Send to /api/chat
         ↓
BACKEND (api/chat.ts):
  - Receive walletPublicKey from request
  - Log: "[CHAT] Swap wallet detection START"
  - Extract: "CMVrz...PPJT"
  - Validate: Solana address format check ✓
  - Log: "[CHAT] ✅ Using wallet: CMVrz..."
  - Execute swap
         ↓
RESPONSE → "Swap instructions ready..."
```

### What NOT to see:
```
❌ DON'T see: [CHAT] ❌ No wallet address found
❌ DON'T see: "Wallet not connected"
❌ DON'T see: walletPublicKey: "NOT SET" in request
```

---

## 🔐 WALLET PERSISTENCE MECHANISM

### How it works:
```
1. User connects Phantom
   → Address stored in localStorage
   → Browser remembers it for 30 days

2. User visits website again
   → Website loads
   → Auto-checks localStorage
   → Auto-checks Phantom (if connected)
   → If both available, user logged in instantly

3. User types swap
   → walletAddress is in state (from step 2)
   → Automatically sent to backend
```

### localStorage inspection:
```
DevTools Console:
> localStorage.getItem('phantom_wallet')
"CMVrzdso4SShQm2irrc7jMCN9Vw5QxXvrZKB79cYPPJT"

// Clear if corrupt:
> localStorage.removeItem('phantom_wallet')
```

---

## 🎯 QUICK VERIFICATION

**To verify wallet system is working properly:**

### Terminal Command (test endpoint):
```bash
curl -X POST https://shina-bek7en322-naquibmirza-6034s-projects.vercel.app/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "test",
    "message": "swap 0.001 SOL for USDC",
    "walletPublicKey": "CMVrzdso4SShQm2irrc7jMCN9Vw5QxXvrZKB79cYPPJT"
  }'
```

**Expected Response**:
```json
{
  "response": "Swap instructions ready for client signing...",
  "swap": { ... }
}
```

**NOT Expected**:
```json
{
  "response": "Wallet not connected..."
}
```

---

## 📝 SUMMARY

✅ **What's Working**:
- Backend properly detects wallet from `walletPublicKey` parameter
- Frontend captures wallet from Phantom
- Frontend persists wallet to localStorage
- Frontend sends wallet in every request
- All tests pass ✅

✅ **What User Should See**:
1. Green indicator: "✅ CMVrz...PPJT"
2. Can type swap requests
3. Console shows wallet being sent
4. Swap executes (or shows errors from Jupiter API)

❌ **If User Still Gets "Wallet not connected"**:
1. **Check console logs** - is wallet showing in request?
2. **Hard refresh** - Ctrl+Shift+R
3. **Reconnect wallet** - Click button again
4. **Clear cache** - Full browser cache clear
5. **Share console logs** with developer for analysis

---

## 🆘 IF STILL HAVING ISSUES

1. Open DevTools (F12)
2. Go to Console tab
3. Connect wallet
4. Type swap message
5. Copy entire console output (Ctrl+A, Ctrl+C)
6. Share with developer

**Key logs to look for:**
- `[WALLET] Connected: ...`
- `[CHAT] Sending request: ...`
- `[CHAT] Request body: ...`
- Backend response in network tab

---

**Production URL**: https://shina-bek7en322-naquibmirza-6034s-projects.vercel.app
**Last Updated**: January 3, 2026
