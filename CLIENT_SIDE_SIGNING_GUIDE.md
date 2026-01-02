# 🔐 Client-Side Wallet Signing Integration Guide

## Overview

**Problem:** The previous setup used server private keys for signing transactions, which is insecure. 

**Solution:** Users now sign transactions with their own Phantom wallet. The server returns an **unsigned base64 VersionedTransaction** that the frontend signs and broadcasts.

---

## Architecture

```
Flow:
1. Frontend → User connects Phantom wallet
2. User types: "swap 0.01 USDC for SOL"
3. Frontend calls /api/chat with userWalletAddress
4. Backend checks if walletAddress !== server key
5. Backend returns: { swap: { transactionBase64: "..." } }
6. Frontend: decode base64 → sign with Phantom → broadcast to RPC
```

---

## Files Added

### 1. `src/frontend/phantom-sign-and-send.ts`
- Converts base64 → VersionedTransaction
- Signs with Phantom/wallet-adapter
- Broadcasts to Solana RPC

**Usage:**
```typescript
import { signAndSendBase64Tx } from './src/frontend/phantom-sign-and-send';

const txHash = await signAndSendBase64Tx(base64Tx, wallet);
console.log('Signed & sent:', txHash);
```

### 2. `src/frontend/SwapComponentExample.tsx`
- React component example
- Shows how to integrate with swap API
- Demonstrates error handling

### 3. `api/swap-utils.ts` (Modified)
- Now checks: `walletAddress === process.env.SOLANA_PUBLIC_KEY`
- If YES → Server signs (for server wallet only)
- If NO → Returns unsigned base64 for client signing

---

## Backend Changes

### In `api/swap-utils.ts` (line ~640):

```typescript
const shouldServerSign = !!privateKeyStr && serverPublicKey && walletAddress === serverPublicKey;

if (shouldServerSign) {
  // Auto-sign server transactions only
  transaction.sign([signer]);
  const txHash = await connection.sendRawTransaction(...);
  return { success: true, txHash };
} else {
  // Return unsigned transaction for client
  return {
    success: true,
    swap: {
      transactionBase64: Buffer.from(transaction.serialize()).toString('base64'),
      // ... other fields
    }
  };
}
```

---

## Frontend Integration Steps

### Step 1: Install Dependencies (already in package.json)
```bash
npm install @solana/wallet-adapter-react @solana/wallet-adapter-phantom @solana/web3.js
```

### Step 2: Import & Use Helper

```typescript
import { signAndSendBase64Tx } from './src/frontend/phantom-sign-and-send';
import { useWallet } from '@solana/wallet-adapter-react';

export function MySwapUI() {
  const wallet = useWallet();
  
  async function handleSwap() {
    // 1. Call swap API with user's wallet
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'swap 0.01 USDC for SOL',
        walletPublicKey: wallet.publicKey.toBase58(), // ← USER'S wallet
      }),
    });

    const data = await response.json();

    // 2. Check if transaction needs client signing
    if (data.swap?.transactionBase64) {
      // 3. Sign & send with Phantom
      const txHash = await signAndSendBase64Tx(
        data.swap.transactionBase64,
        wallet
      );
      console.log('✅ Swap confirmed:', txHash);
    }
  }

  return <button onClick={handleSwap}>Swap</button>;
}
```

---

## Vercel Environment Variables

**KEEP:** (safe to store)
- `SOLANA_RPC_URL` ← RPC endpoint
- `JUPITER_API_URL` ← Jupiter API
- `JUPITER_API_KEY` ← Jupiter key
- `SOLANA_NETWORK` ← "mainnet" or "devnet"

**REMOVE:** (never store in Vercel)
- `SOLANA_PRIVATE_KEY` ❌ Already removed
- `SOLANA_PUBLIC_KEY` (optional; only if you need server wallet for other functions)

**Set via Vercel Dashboard or CLI:**
```bash
vercel env add SOLANA_RPC_URL https://solana-mainnet.g.alchemy.com/v2/...
vercel env add JUPITER_API_KEY <your-key>
vercel env add JUPITER_API_URL https://api.jup.ag/swap/v1/quote
```

---

## Testing Flow

### Local Testing:
```bash
# 1. Start dev server
npm run dev

# 2. Open browser, connect Phantom to TESTNET
# 3. Try swap: "swap 0.01 SOL for USDC"
# 4. Check console for transactionBase64
```

### Production (Vercel):
```
1. User connects Phantom → mainnet
2. User: "swap 0.12 USDC for SOL"
3. API returns unsigned tx in base64
4. Frontend signs with Phantom
5. Frontend broadcasts to RPC
6. ✅ Confirmed on-chain
```

---

## Security Checklist

- ✅ Private keys NEVER sent to Vercel
- ✅ Private keys NEVER exposed to frontend
- ✅ User wallet signs all transactions
- ✅ Server only validates, never holds keys (except for server operations)
- ✅ Base64 tx is just data; cannot execute without user signature

---

## Troubleshooting

### "Wallet not connected"
→ User hasn't connected Phantom yet. Check `wallet.connected` in frontend.

### "No compatible wallet signing method found"
→ Phantom not available. Check `(window as any).solana` exists.

### "Invalid transactionBase64"
→ Base64 decode failed. Check response format from API.

### "Transaction failed on-chain"
→ Check Solana explorer for actual error. Often: slippage, amount mismatch.

---

## Next Steps

1. ✅ Deploy to Vercel (done)
2. ✅ Remove private key from Vercel (already done)
3. ✅ Frontend signing helper added (phantom-sign-and-send.ts)
4. Integrate SwapComponentExample.tsx into your React app
5. Test with real Phantom wallet on mainnet
6. Monitor Vercel logs for any issues
