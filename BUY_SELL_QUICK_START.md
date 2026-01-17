# Buy/Sell Transaction Quick Start

## Endpoints

- **Buy**: `POST /api/buy`
- **Sell**: `POST /api/sell`

## Quick Examples

### Buy 1.5 SOL for USDC (Build Only)

```bash
curl -X POST https://shina-ten.vercel.app/api/buy \
  -H "Content-Type: application/json" \
  -d '{
    "inputMint": "sol",
    "outputMint": "usdc",
    "amount": 1.5,
    "userPublicKey": "9x1y2z3a4b5c6d7e8f9g0h1i2j3k4l5m6n7o8p9q"
  }'
```

### Buy with Execution (Server Signing)

```bash
curl -X POST https://shina-ten.vercel.app/api/buy \
  -H "Content-Type: application/json" \
  -d '{
    "inputMint": "sol",
    "outputMint": "usdc",
    "amount": 1.5,
    "userPublicKey": "9x1y2z3a4b5c6d7e8f9g0h1i2j3k4l5m6n7o8p9q",
    "executeNow": true
  }'
```

### Sell 100 USDC for SOL

```bash
curl -X POST https://shina-ten.vercel.app/api/sell \
  -H "Content-Type: application/json" \
  -d '{
    "inputMint": "usdc",
    "outputMint": "sol",
    "amount": 100,
    "userPublicKey": "9x1y2z3a4b5c6d7e8f9g0h1i2j3k4l5m6n7o8p9q",
    "executeNow": true
  }'
```

## Request Parameters

### Required
- `inputMint` - Token to swap from (symbol or mint address)
- `outputMint` - Token to swap to (symbol or mint address)
- `amount` - Amount to swap (as decimal, e.g., 1.5)
- `userPublicKey` - User's Solana wallet address

### Optional
- `executeNow` - Execute immediately with server signing (default: false)
- `priorityFee` - Custom priority fee in lamports (default: 5000)

## Response

**Success (Status 200):**
```json
{
  "success": true,
  "type": "buy|sell",
  "transactionSignature": "abc123...",
  "inputAmount": 1.5,
  "outputAmount": 123.456,
  "inputToken": "SOL",
  "outputToken": "USDC",
  "priceImpact": 0.12,
  "status": "confirmed|pending",
  "message": "Transaction successful",
  "timestamp": "2026-01-17T12:00:00Z",
  "explorerUrl": "https://solscan.io/tx/..."
}
```

**Error (Status 400/500):**
```json
{
  "success": false,
  "error": "Error description",
  "message": "Detailed error message"
}
```

## Token Symbols

| Symbol | Mint | Decimals |
|--------|------|----------|
| SOL | So11...112 | 9 |
| USDC | EPj...kEH | 6 |
| USDT | Es9...BcJkxN | 6 |
| mSOL | mSo...UCb9 | 9 |
| BONK | DeZ...Zonw1j | 5 |
| JUP | JUP...4S3daM | 6 |

Or use full 44-character mint addresses.

## Features

✅ Real-time Jupiter quotes  
✅ Automatic RPC failover  
✅ Client-side or server-side signing  
✅ Transaction confirmation tracking  
✅ Price impact calculation  
✅ Slippage protection (0.5% default)  
✅ Comprehensive error handling  

## Configuration

`.env.local`:
```env
SOLANA_RPC_URL=https://mainnet.helius-rpc.com/?api-key=...
SOLANA_PRIVATE_KEY=YOUR_KEY (for executeNow)
DEFAULT_SLIPPAGE_BPS=50
DEFAULT_GAS_PRICE=5000
MAX_RETRIES=5
```

## Full Documentation

See `/docs/buy-sell.md` for complete documentation.
