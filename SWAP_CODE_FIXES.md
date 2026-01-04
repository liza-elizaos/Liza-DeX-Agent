# 🔧 SWAP ISSUE - CODE FIXES

## The Problem
Fetching works ✅, but Phantom signing never triggers ❌

## The Solution

---

## FIX #1: Check If signAndSendBase64Tx Is Imported

### File: `src/frontend/index.tsx`

**Location**: Line 1-10 (imports section)

**Current Code** (WRONG):
```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createRoot } from 'react-dom/client';
import './index.css';
import React, { useState, useRef, useEffect } from 'react';
import type { UUID } from '@elizaos/core';
// MISSING: import { signAndSendBase64Tx } from './phantom-sign-and-send';
```

**Fixed Code** (RIGHT):
```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createRoot } from 'react-dom/client';
import './index.css';
import React, { useState, useRef, useEffect } from 'react';
import type { UUID } from '@elizaos/core';
import { signAndSendBase64Tx } from './phantom-sign-and-send';  // ← ADD THIS LINE
```

---

## FIX #2: Add Debug Logging

### File: `src/frontend/index.tsx`

**Location**: Around line 250-270 (after response)

**Current Code** (INCOMPLETE):
```typescript
const data = await response.json();

const assistantMessage: Message = {
  id: `msg_${Date.now()}_assistant`,
  role: 'assistant',
  content: data.response || 'No response received',
  timestamp: new Date(),
};

setMessages((prev) => [...prev, assistantMessage]);

// Handle pending signature swap - automatically trigger Phantom signing
if (data.swap && data.swap.status === 'pending_signature' && data.swap.transactionBase64) {
```

**Fixed Code** (WITH DEBUG LOGS):
```typescript
const data = await response.json();

// ===== ADD THESE DEBUG LOGS =====
console.log('[SWAP_DEBUG] Response received:', data);
console.log('[SWAP_DEBUG] Has swap?', !!data.swap);
console.log('[SWAP_DEBUG] Swap status:', data.swap?.status);
console.log('[SWAP_DEBUG] Has transactionBase64?', !!data.swap?.transactionBase64);
console.log('[SWAP_DEBUG] Function exists?', typeof signAndSendBase64Tx);
// ===== END DEBUG LOGS =====

const assistantMessage: Message = {
  id: `msg_${Date.now()}_assistant`,
  role: 'assistant',
  content: data.response || 'No response received',
  timestamp: new Date(),
};

setMessages((prev) => [...prev, assistantMessage]);

// Handle pending signature swap - automatically trigger Phantom signing
if (data.swap && data.swap.status === 'pending_signature' && data.swap.transactionBase64) {
```

---

## FIX #3: Fix Error Handling in Swap Signing

### File: `src/frontend/index.tsx`

**Location**: Around line 280-310 (Phantom signing block)

**Current Code** (MISSING ERROR HANDLING):
```typescript
if (data.swap && data.swap.status === 'pending_signature' && data.swap.transactionBase64) {
  console.log('[CHAT] Detected pending signature swap, triggering Phantom signing...');
  
  try {
    // Get Phantom wallet
    const phantomWallet = (window as any).solana;
    if (!phantomWallet) {
      throw new Error('Phantom wallet not found. Please install Phantom and connect your wallet.');
    }

    // Call signing helper
    const rpcUrl = 'https://api.mainnet-beta.solana.com';
    const txHash = await signAndSendBase64Tx(data.swap.transactionBase64, phantomWallet, rpcUrl);
    
    // Show success message
    const successMessage: Message = {
      id: `msg_${Date.now()}_success`,
      role: 'assistant',
      content: `✅ Swap completed!\n\nTransaction: ${txHash}\n\n${data.swap.amount} ${data.swap.fromToken} → ${data.swap.estimatedOutput} ${data.swap.toToken}`,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, successMessage]);
  } catch (error) {
    console.error('[CHAT] Swap error:', error);
    // BUG: Error not shown to user!
  }
}
```

**Fixed Code** (WITH PROPER ERROR HANDLING):
```typescript
if (data.swap && data.swap.status === 'pending_signature' && data.swap.transactionBase64) {
  console.log('[CHAT] Detected pending signature swap, triggering Phantom signing...');
  console.log('[CHAT] Transaction base64:', data.swap.transactionBase64.substring(0, 50) + '...');
  
  try {
    // Get Phantom wallet
    const phantomWallet = (window as any).solana;
    console.log('[CHAT] Phantom wallet:', phantomWallet);
    
    if (!phantomWallet) {
      throw new Error('Phantom wallet not found. Please install Phantom and connect your wallet.');
    }

    if (!phantomWallet.isConnected) {
      throw new Error('Phantom wallet not connected. Please connect your wallet first.');
    }

    console.log('[CHAT] Starting transaction signing...');
    
    // Call signing helper
    const rpcUrl = 'https://api.mainnet-beta.solana.com';
    const txHash = await signAndSendBase64Tx(data.swap.transactionBase64, phantomWallet, rpcUrl);
    
    console.log('[CHAT] ✅ Swap succeeded! TxHash:', txHash);
    
    // Show success message
    const successMessage: Message = {
      id: `msg_${Date.now()}_success`,
      role: 'assistant',
      content: `✅ Swap completed!\n\nTransaction: ${txHash}\n\n${data.swap.amount} ${data.swap.fromToken} → ${data.swap.estimatedOutput} ${data.swap.toToken}`,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, successMessage]);
  } catch (error) {
    console.error('[CHAT] ❌ Swap failed:', error);
    
    // ===== SHOW ERROR TO USER (IMPORTANT!) =====
    const errorMessage: Message = {
      id: `msg_${Date.now()}_error`,
      role: 'assistant',
      content: `❌ Swap failed!\n\nError: ${error instanceof Error ? error.message : String(error)}\n\nPlease try again or check console for details.`,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, errorMessage]);
    // ===== END ERROR HANDLING =====
  }
}
```

---

## FIX #4: Check phantom-sign-and-send.ts File

### File: `src/frontend/phantom-sign-and-send.ts`

**This file MUST exist and contain:**

```typescript
import { Transaction } from '@solana/web3.js';
import { Connection } from '@solana/web3.js';

export async function signAndSendBase64Tx(
  transactionBase64: string,
  phantomWallet: any,
  rpcUrl: string
): Promise<string> {
  try {
    console.log('[SIGN] Decoding transaction from base64...');
    
    // Decode base64 to buffer
    const transactionBuffer = Buffer.from(transactionBase64, 'base64');
    console.log('[SIGN] Buffer size:', transactionBuffer.length);
    
    // Create Transaction from buffer
    const transaction = Transaction.from(transactionBuffer);
    console.log('[SIGN] Transaction decoded successfully');
    console.log('[SIGN] Instructions:', transaction.instructions.length);
    
    // Create connection to Solana
    const connection = new Connection(rpcUrl);
    
    // Get latest blockhash
    console.log('[SIGN] Getting latest blockhash...');
    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    
    // Set fee payer
    if (phantomWallet.publicKey) {
      transaction.feePayer = phantomWallet.publicKey;
      console.log('[SIGN] Fee payer set:', phantomWallet.publicKey.toString());
    }
    
    // Sign and send transaction
    console.log('[SIGN] Requesting Phantom to sign and send...');
    const response = await phantomWallet.signAndSendTransaction(transaction);
    
    console.log('[SIGN] ✅ Transaction sent!');
    console.log('[SIGN] Signature:', response.signature);
    
    return response.signature;
  } catch (error) {
    console.error('[SIGN] ❌ Error:', error);
    throw error;
  }
}
```

**If file doesn't exist:**
1. Create it: `src/frontend/phantom-sign-and-send.ts`
2. Copy the code above
3. Save and rebuild

---

## FIX #5: Verify RPC URL (In Backend)

### File: `.env`

**Check these values:**

```env
# Should be MAINNET (not devnet!)
SOLANA_NETWORK=mainnet

# Should have valid Alchemy key
SOLANA_RPC_URL=https://solana-mainnet.g.alchemy.com/v2/pfiW_dJZBV0RjLHK1TgV53sMmLFTcCmX

# Verify wallet has SOL (minimum 0.005 SOL for fees)
SOLANA_PUBLIC_KEY=CMVrzdso4SShQm2irrc7jMCN9Vw5QxXvrZKB79cYPPJT
```

---

## 🚀 HOW TO APPLY FIXES

### Step 1: Apply Fix #1 (Import)
```bash
# Edit: src/frontend/index.tsx
# Add line 7: import { signAndSendBase64Tx } from './phantom-sign-and-send';
```

### Step 2: Apply Fix #2 (Debug Logging)
```bash
# Edit: src/frontend/index.tsx
# Add console.log statements around line 260
```

### Step 3: Apply Fix #3 (Error Handling)
```bash
# Edit: src/frontend/index.tsx
# Improve try-catch block around line 280-310
```

### Step 4: Apply Fix #4 (File Check)
```bash
# Check: src/frontend/phantom-sign-and-send.ts exists
# If not: Create it with the code above
```

### Step 5: Apply Fix #5 (RPC Check)
```bash
# Check: .env has mainnet RPC
# Not devnet!
```

### Step 6: Rebuild & Deploy
```bash
npm run build
npx vercel deploy --prod --yes
```

### Step 7: Test
```
1. Go to: https://shina-bqx35uu2u-naquibmirza-6034s-projects.vercel.app
2. Connect wallet
3. Type: "swap 0.001 SOL for USDC"
4. Phantom popup should appear ✅
5. Approve transaction
6. Success message shown ✅
```

---

## 🔍 WHAT TO CHECK

```bash
# Check if build is successful
npm run build

# Check for TypeScript errors
npm run type-check  # if available

# Check file exists
ls -la src/frontend/phantom-sign-and-send.ts

# Check import in index.tsx
grep "signAndSendBase64Tx" src/frontend/index.tsx
```

---

## ✅ VERIFICATION

After fixes:
- [ ] `src/frontend/phantom-sign-and-send.ts` exists
- [ ] `signAndSendBase64Tx` is imported in `index.tsx`
- [ ] Debug console.logs are present
- [ ] Error handling shows messages to user
- [ ] RPC URL is mainnet (not devnet)
- [ ] Build completes without errors
- [ ] Deploy succeeds
- [ ] Phantom popup appears on swap
- [ ] Transaction can be signed
- [ ] Swap executes successfully

---

## 📞 TELL v0.dev

```
Issue: Phantom signing not triggered

Applied Fixes:
1. Added missing import: signAndSendBase64Tx
2. Added debug logging to track execution
3. Added proper error handling and user messages
4. Verified phantom-sign-and-send.ts exists
5. Verified RPC URL is mainnet

Need help with:
- Why is Phantom not receiving the transaction?
- Should signAndSendBase64Tx be called differently?
- Is the transaction format correct?
```

---

**Status**: 🔴 CRITICAL
**Next Step**: Apply fixes and test
**Then**: Deploy and verify
