# Buy/Sell Transaction System

## Overview

LIZA now has a complete, production-ready buy/sell transaction system that enables seamless buying and selling of tokens on Solana through Jupiter DEX.

**Key Features:**
- ✅ Full transaction lifecycle management
- ✅ Client-side and server-side signing options
- ✅ Automatic RPC failover
- ✅ Real-time confirmation tracking
- ✅ Price impact calculation
- ✅ Comprehensive error handling
- ✅ Detailed logging and monitoring

---

## Architecture

### System Flow

```
User Request
    ↓
Validate Input
    ↓
Parse Token Identifiers
    ↓
Get Jupiter Quote
    ├─ Input amount in lamports
    ├─ Output amount calculation
    └─ Price impact analysis
    ↓
Build Transaction
    ├─ Route planning
    ├─ Slippage configuration
    └─ Priority fee setting
    ↓
Sign Transaction
    ├─ Option 1: Client-side (Phantom wallet)
    └─ Option 2: Server-side (private key)
    ↓
Send to Blockchain
    ├─ Connection management
    ├─ Retry logic
    └─ Fallback RPC endpoints
    ↓
Wait for Confirmation
    ├─ Poll transaction status
    ├─ Timeout handling
    └─ Error detection
    ↓
Return Result
    ├─ Success/failure status
    ├─ Transaction signature
    ├─ Amounts and prices
    └─ Explorer link
```

### Core Components

**`/model/buy-sell.ts`** (750+ lines)
- Main transaction logic
- Token parsing and validation
- Jupiter integration
- Transaction signing and sending
- Confirmation tracking

**`/api/buy.ts`** (100+ lines)
- Buy endpoint handler
- Request validation
- Configuration management
- Response formatting

**`/api/sell.ts`** (100+ lines)
- Sell endpoint handler
- Request validation
- Configuration management
- Response formatting

---

## API Endpoints

### POST /api/buy

Execute a buy transaction (swap input token for output token)

**Request:**
```json
{
  "inputMint": "So11111111111111111111111111111111111111112",
  "outputMint": "EPjFWaLb3crJC2z8rxVmE4Gnjg1d4PjNiYq4a8JqkEH",
  "amount": 1.5,
  "userPublicKey": "9x1y2z3a4b5c6d7e8f9g0h1i2j3k4l5m6n7o8p9q",
  "executeNow": false,
  "priorityFee": 5000
}
```

**Response (Pending):**
```json
{
  "success": true,
  "type": "buy",
  "inputAmount": 1.5,
  "outputAmount": 123.456,
  "inputToken": "SOL",
  "outputToken": "USDC",
  "priceImpact": 0.12,
  "status": "pending",
  "message": "Buy transaction ready. Swap 1.5 SOL for 123.456 USDC",
  "timestamp": "2026-01-17T12:00:00.000Z"
}
```

**Response (Confirmed):**
```json
{
  "success": true,
  "type": "buy",
  "transactionSignature": "abc123...xyz789",
  "inputAmount": 1.5,
  "outputAmount": 123.456,
  "inputToken": "SOL",
  "outputToken": "USDC",
  "priceImpact": 0.12,
  "status": "confirmed",
  "message": "Buy transaction confirmed! Swapped 1.5 SOL for 123.456 USDC",
  "timestamp": "2026-01-17T12:00:05.000Z",
  "explorerUrl": "https://solscan.io/tx/abc123...xyz789"
}
```

### POST /api/sell

Execute a sell transaction (swap output token for input token)

**Request:**
```json
{
  "inputMint": "EPjFWaLb3crJC2z8rxVmE4Gnjg1d4PjNiYq4a8JqkEH",
  "outputMint": "So11111111111111111111111111111111111111112",
  "amount": 100,
  "userPublicKey": "9x1y2z3a4b5c6d7e8f9g0h1i2j3k4l5m6n7o8p9q",
  "executeNow": true
}
```

**Response:**
```json
{
  "success": true,
  "type": "sell",
  "transactionSignature": "xyz789...abc123",
  "inputAmount": 100,
  "outputAmount": 1.22,
  "inputToken": "USDC",
  "outputToken": "SOL",
  "priceImpact": 0.05,
  "status": "confirmed",
  "message": "Sell transaction confirmed! Exchanged 100 USDC for 1.22 SOL",
  "timestamp": "2026-01-17T12:00:10.000Z",
  "explorerUrl": "https://solscan.io/tx/xyz789...abc123"
}
```

---

## Usage Examples

### Example 1: Build Buy Transaction (Client-Side Signing)

```bash
curl -X POST https://shina-ten.vercel.app/api/buy \
  -H "Content-Type: application/json" \
  -d '{
    "inputMint": "sol",
    "outputMint": "usdc",
    "amount": 1.5,
    "userPublicKey": "9x1y2z3a4b5c6d7e8f9g0h1i2j3k4l5m6n7o8p9q",
    "executeNow": false
  }'
```

**User Flow:**
1. API returns transaction details and quote
2. User signs with Phantom wallet
3. User sends signed transaction back
4. System confirms on-chain

### Example 2: Execute Buy (Server-Side Signing)

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

**Requirements:**
- `SOLANA_PRIVATE_KEY` configured in `.env.local`

**Process:**
1. Build transaction
2. Server signs with private key
3. Send to blockchain
4. Wait for confirmation
5. Return result with signature

### Example 3: Sell with Custom Priority Fee

```bash
curl -X POST https://shina-ten.vercel.app/api/sell \
  -H "Content-Type: application/json" \
  -d '{
    "inputMint": "usdc",
    "outputMint": "sol",
    "amount": 250,
    "userPublicKey": "9x1y2z3a4b5c6d7e8f9g0h1i2j3k4l5m6n7o8p9q",
    "priorityFee": 10000,
    "executeNow": true
  }'
```

---

## Token Support

The system supports these pre-configured tokens:

| Symbol | Mint Address | Decimals |
|--------|--------------|----------|
| SOL | So11111111111111111111111111111111111111112 | 9 |
| USDC | EPjFWaLb3crJC2z8rxVmE4Gnjg1d4PjNiYq4a8JqkEH | 6 |
| USDT | Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BcJkxN | 6 |
| mSOL | mSoLzYCxHdgfd3DgZjwwzG8DUR6azJstEWQcW2UCb9 | 9 |
| BONK | DezXAZ8z7PnrnRJjoBXwYaKe2XTis3Zonw1j1axNac5 | 5 |
| JUP | JUPyiwrYJFskUPiHa7hkeR8JwF3ttBKqrySAv4S3daM | 6 |

**Can also use:**
- Token symbols (case-insensitive): `"sol"`, `"usdc"`, etc.
- Full mint addresses (44-char base58)

---

## Configuration

### Environment Variables

```env
# RPC Configuration
SOLANA_RPC_URL=https://mainnet.helius-rpc.com/?api-key=...
SOLANA_RPC_URL_BACKUP=https://api.mainnet-beta.solana.com
SOLANA_RPC_COMMITMENT=confirmed

# Jupiter Configuration
JUPITER_API_KEY=458e0881-9e19-45f7-a555-4f12192b8098
JUPITER_QUOTE_API=https://api.jup.ag/quote
JUPITER_SWAP_API=https://api.jup.ag/swap

# Transaction Settings
DEFAULT_SLIPPAGE_BPS=50          # 0.5% slippage
DEFAULT_GAS_PRICE=5000           # Priority fee in lamports
MAX_RETRIES=5                     # Retry attempts

# Optional: Server-side signing
SOLANA_PRIVATE_KEY=YOUR_BASE58_KEY
SOLANA_PUBLIC_KEY=YOUR_WALLET_ADDRESS
```

### Programmatic Configuration

```typescript
import { BuySellConfig } from '@/model/buy-sell';

const config: BuySellConfig = {
  rpcUrl: 'https://mainnet.helius-rpc.com/?api-key=...',
  rpcUrlBackup: 'https://api.mainnet-beta.solana.com',
  slippageBps: 50,              // 50 basis points = 0.5%
  maxRetries: 5,
  timeout: 60000,               // 60 second timeout
  priorityFee: 5000,            // Lamports
};
```

---

## Transaction Flow Details

### Step 1: Request Validation

```typescript
// Must provide:
- inputMint (token to swap from)
- outputMint (token to swap to)
- amount (positive number)
- userPublicKey (valid Solana address)

// Optional:
- executeNow (default: false)
- priorityFee (default: 5000)
```

### Step 2: Quote Fetching

```typescript
// Calls Jupiter API with:
- Input and output mint addresses
- Amount in lamports (accounting for decimals)
- Slippage tolerance (50 bps default)
- API key (if configured)

// Returns:
- Output amount
- Price impact percentage
- Route plan (swap path)
```

### Step 3: Transaction Building

```typescript
// Jupiter builds transaction with:
- Serialized instructions
- User public key
- Wrap/unwrap SOL option
- Priority fee

// Returns:
- Base64-encoded transaction
- Last valid block height
```

### Step 4: Signing

**Option A: Client-Side (Recommended)**
```typescript
// Transaction returned to user
// User signs with Phantom wallet
// User sends signed transaction back
```

**Option B: Server-Side (If private key available)**
```typescript
// Server deserializes transaction
// Signs with keypair from SOLANA_PRIVATE_KEY
// Returns signed transaction
```

### Step 5: Sending

```typescript
// Send signed transaction to Solana blockchain
// Retry logic up to MAX_RETRIES times
// Optional: Wait for confirmation
```

### Step 6: Confirmation

```typescript
// Poll transaction status every 1 second
// Check for:
- Confirmation status (confirmed/finalized)
- Transaction errors
- Timeout (60 seconds default)

// Return result with:
- Signature
- Status
- Explorer link
```

---

## Error Handling

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `Unknown token` | Invalid mint or symbol | Use valid symbol or 44-char mint |
| `All RPC endpoints unavailable` | Both RPC endpoints down | Check internet, try again |
| `Invalid amount` | Amount not positive | Amount must be > 0 |
| `Transaction failed` | On-chain error | Check gas fee, slippage, balance |
| `RPC timeout` | RPC endpoint slow | Retry, increase timeout |
| `Quote error 404` | Jupiter API issue | Check Jupiter status page |

### Error Response Format

```json
{
  "success": false,
  "type": "buy|sell",
  "inputAmount": 1.5,
  "inputToken": "SOL",
  "outputToken": "USDC",
  "status": "failed",
  "message": "Error description here",
  "timestamp": "2026-01-17T12:00:00.000Z",
  "error": "Detailed error message"
}
```

---

## Performance & Limits

### Timing Expectations

| Step | Time |
|------|------|
| Quote fetching | 200-500ms |
| Transaction building | 300-800ms |
| Signing | 100-300ms |
| Sending | 200-500ms |
| Confirmation | 2-10 seconds |
| **Total** | ~4-12 seconds |

### Slippage Protection

Default: 50 basis points (0.5%)

```typescript
// Example:
- Quote: 100 USDC
- Slippage: 50 bps (0.5%)
- Minimum received: 99.5 USDC
- Transaction fails if less received
```

### Rate Limiting

- Per API: 100 requests per 15 minutes
- Per user: Recommended max 10 trades per minute

---

## Security Considerations

### Private Key Management

✅ **Best Practices:**
- Never log private keys
- Store in `.env.local` only (not committed)
- Use different keys for dev/prod
- Rotate keys regularly
- Use server-side signing only when necessary

### Transaction Security

✅ **Built-in Protections:**
- Slippage limits (prevent front-running)
- User signature requirement (for auth)
- Quote expiration (routes change)
- Confirmation waiting (ensure settlement)

### API Security

✅ **Implemented:**
- Input validation on all requests
- Rate limiting per endpoint
- CORS restrictions
- Error messages don't leak secrets
- Comprehensive logging

---

## Monitoring & Logging

### Log Levels

```
ERROR    - Transaction failed, RPC down
WARN     - RPC fallback activated, timeout
INFO     - Transaction sent, confirmed
DEBUG    - Quote details, gas price
```

### Sample Logs

```
60 EXECUTING BUY TRANSACTION
============================================================
Input: 1.5 SOL
Output: USDC
User: 9x1y2z3a...

📊 Getting Jupiter quote: 1500000000 SOL → USDC
✅ Quote received: 1.5 SOL → 123.456 USDC
   Price impact: 0.12%

🔨 Building Jupiter swap transaction for 9x1y2z3a...
✅ Transaction built successfully

🔑 Signing transaction with keypair
✅ Transaction signed successfully

📤 Sending signed transaction to blockchain
📋 Transaction sent. Signature: abc123xyz789

⏳ Waiting for transaction confirmation (timeout: 60000ms)
✅ Transaction confirmed! Status: confirmed

✅ Buy transaction confirmed!
```

---

## Future Enhancements

### Planned Features

- [ ] Multi-route swaps (split across multiple DEXes)
- [ ] Limit orders (buy/sell at specific price)
- [ ] DCA orders (dollar-cost averaging)
- [ ] Stop loss and take profit
- [ ] Order history tracking
- [ ] Transaction analytics
- [ ] Webhook notifications

### Potential Optimizations

- [ ] Connection pooling (reduce RPC latency)
- [ ] Route caching (faster quotes)
- [ ] Batch transactions (multiple swaps)
- [ ] MEV protection (privacy-focused routing)

---

## API Reference

See `/docs/api/buy-sell.md` for complete API documentation with examples.

---

**Status**: ✅ Production Ready  
**Build**: Passing (0 TypeScript errors)  
**Last Updated**: January 2026
