# V0.dev Integration Guide

## Overview
This guide shows how to integrate your deployed ElizaOS Solana trading agent with your v0.dev website.

## API Endpoints

After deploying to Vercel, your ElizaOS agent will have these endpoints:

### 1. Swap Tokens
**Endpoint:** `POST /api/swap`

**Request:**
```json
{
  "fromToken": "SOL",
  "toToken": "BONK",
  "amount": 1
}
```

**Response:**
```json
{
  "success": true,
  "message": "✅ Swap successful! Transaction: xyz...",
  "transactionHash": "xyz..."
}
```

### 2. Get Wallet Balance
**Endpoint:** `GET /api/balance`

**Response:**
```json
{
  "success": true,
  "walletAddress": "CMVrzdso4SShQm2irrc7jMCN9Vw5QxXvrZKB79cYPPJT",
  "balanceSOL": 5.5,
  "balanceLamports": 5500000000,
  "network": "mainnet"
}
```

---

## React Component Examples

### Example 1: Simple Swap Button

```typescript
'use client';

import { useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://your-deployed-url.vercel.app';

export default function SwapComponent() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const executeSwap = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`${API_URL}/api/swap`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fromToken: 'SOL',
          toToken: 'BONK',
          amount: 1
        })
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(data.message);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Solana Swap</h2>
      
      <button
        onClick={executeSwap}
        disabled={loading}
        className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-4 py-2 rounded"
      >
        {loading ? 'Swapping...' : 'Swap 1 SOL for BONK'}
      </button>

      {error && <div className="mt-4 text-red-500">{error}</div>}
      {success && <div className="mt-4 text-green-500">{success}</div>}
    </div>
  );
}
```

### Example 2: Balance Display

```typescript
'use client';

import { useEffect, useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://your-deployed-url.vercel.app';

export default function BalanceDisplay() {
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const response = await fetch(`${API_URL}/api/balance`);
        const data = await response.json();

        if (data.success) {
          setBalance(data.balanceSOL);
        } else {
          setError(data.error);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch balance');
      } finally {
        setLoading(false);
      }
    };

    fetchBalance();
    // Refresh every 30 seconds
    const interval = setInterval(fetchBalance, 30000);

    return () => clearInterval(interval);
  }, []);

  if (loading) return <div>Loading balance...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="p-4 bg-blue-50 rounded-lg">
      <p className="text-sm text-gray-600">Wallet Balance</p>
      <p className="text-3xl font-bold text-blue-600">{balance?.toFixed(4)} SOL</p>
    </div>
  );
}
```

### Example 3: Advanced Swap Form

```typescript
'use client';

import { useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://your-deployed-url.vercel.app';

const POPULAR_TOKENS = ['SOL', 'BONK', 'USDC', 'WSOL'];

export default function SwapForm() {
  const [fromToken, setFromToken] = useState('SOL');
  const [toToken, setToToken] = useState('BONK');
  const [amount, setAmount] = useState('1');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');

  const handleSwap = async () => {
    setLoading(true);
    setResult('');

    try {
      const response = await fetch(`${API_URL}/api/swap`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromToken,
          toToken,
          amount: parseFloat(amount)
        })
      });

      const data = await response.json();
      setResult(data.message || data.error);
    } catch (err) {
      setResult(err instanceof Error ? err.message : 'Error executing swap');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white border rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6">Token Swap</h2>

      <div className="space-y-4">
        {/* From Token */}
        <div>
          <label className="block text-sm font-medium mb-2">From</label>
          <select
            value={fromToken}
            onChange={(e) => setFromToken(e.target.value)}
            className="w-full p-2 border rounded"
          >
            {POPULAR_TOKENS.map((token) => (
              <option key={token} value={token}>
                {token}
              </option>
            ))}
          </select>
        </div>

        {/* Amount */}
        <div>
          <label className="block text-sm font-medium mb-2">Amount</label>
          <input
            type="number"
            step="0.001"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="0.00"
          />
        </div>

        {/* To Token */}
        <div>
          <label className="block text-sm font-medium mb-2">To</label>
          <select
            value={toToken}
            onChange={(e) => setToToken(e.target.value)}
            className="w-full p-2 border rounded"
          >
            {POPULAR_TOKENS.map((token) => (
              <option key={token} value={token}>
                {token}
              </option>
            ))}
          </select>
        </div>

        {/* Swap Button */}
        <button
          onClick={handleSwap}
          disabled={loading || !amount || parseFloat(amount) <= 0}
          className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 disabled:from-gray-400 disabled:to-gray-400 text-white font-bold py-2 rounded-lg transition"
        >
          {loading ? 'Swapping...' : 'Swap'}
        </button>

        {/* Result */}
        {result && (
          <div className={`p-3 rounded text-sm ${result.includes('Error') || result.includes('❌') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
            {result}
          </div>
        )}
      </div>
    </div>
  );
}
```

---

## Environment Setup for v0.dev

### Step 1: Set Your API URL
In your v0.dev environment or Next.js `.env.local`:

```env
NEXT_PUBLIC_API_URL=https://your-deployed-url.vercel.app
```

### Step 2: Import Components
Add these components to your v0.dev website pages:

```typescript
import SwapForm from '@/components/SwapForm';
import BalanceDisplay from '@/components/BalanceDisplay';

export default function Page() {
  return (
    <div className="space-y-8">
      <BalanceDisplay />
      <SwapForm />
    </div>
  );
}
```

---

## Testing

### Test with cURL
```bash
# Test Balance
curl https://your-deployed-url.vercel.app/api/balance

# Test Swap
curl -X POST https://your-deployed-url.vercel.app/api/swap \
  -H "Content-Type: application/json" \
  -d '{
    "fromToken": "SOL",
    "toToken": "BONK",
    "amount": 0.1
  }'
```

### Test in Browser Console
```javascript
// Test Balance
fetch('https://your-deployed-url.vercel.app/api/balance')
  .then(r => r.json())
  .then(d => console.log(d));

// Test Swap
fetch('https://your-deployed-url.vercel.app/api/swap', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    fromToken: 'SOL',
    toToken: 'BONK',
    amount: 0.1
  })
})
.then(r => r.json())
.then(d => console.log(d));
```

---

## Troubleshooting

### CORS Issues
If you see CORS errors, ensure your API has proper headers (already included in api/*.ts files).

### API Timeout
If swaps take too long:
- Check Vercel logs for errors
- Increase timeout in vercel.json (up to 900s for paid plans)
- Verify RPC endpoint is responding

### Wrong Network
Make sure `SOLANA_NETWORK` env variable matches your setup.

---

## Next Steps

1. ✅ Deploy project to Vercel
2. ✅ Test API endpoints
3. ✅ Add components to v0.dev
4. ✅ Test swaps end-to-end
5. ✅ Monitor transaction success rate
6. ✅ Collect user feedback

---

**Need help?** Check [Vercel Docs](https://vercel.com/docs) or [ElizaOS Docs](https://docs.elizaos.ai)
