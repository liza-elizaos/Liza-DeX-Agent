# Architecture

## System Overview

LIZA is built with a modular architecture that separates concerns into distinct layers:

```
┌─────────────────────────────────────────┐
│        User Interface Layer             │
│  (Chat UI, Dashboard, Wallet Connect)   │
└──────────────────┬──────────────────────┘
                   │
┌──────────────────▼──────────────────────┐
│      API Gateway Layer (Next.js)        │
│  - /api/chat                            │
│  - /api/balance                         │
│  - /api/portfolio                       │
│  - /api/swap                            │
│  - /api/execute-swap                    │
│  - /api/launch                          │
└──────────────────┬──────────────────────┘
                   │
┌──────────────────▼──────────────────────┐
│    Business Logic Layer (TypeScript)    │
│  - Chat handler (/model/chat.ts)        │
│  - Token operations (/model/launch.ts)  │
│  - Wallet management                    │
│  - Session persistence                  │
└──────────────────┬──────────────────────┘
                   │
┌──────────────────▼──────────────────────┐
│   External Services Integration         │
│  - Solana RPC (Helius + backup)         │
│  - Jupiter DEX API                      │
│  - Pump.fun SDK                         │
│  - OpenRouter AI                        │
└─────────────────────────────────────────┘
```

## Component Architecture

### Frontend Layer

**UI Components** (`/pages`, `/src/components`)
- Chat interface for user input
- Dashboard for portfolio view
- Wallet connection UI
- Transaction confirmation screens

**State Management**
- Session-based state in memory
- Wallet connection persistence
- User preferences

### API Layer (`/api`)

#### `/api/chat.ts` (Main Conversation Engine)
```typescript
// 422 lines
// Responsibilities:
// - Session management and lifecycle
// - Natural language parsing
// - Command routing (balance, swap, portfolio)
// - AI conversation with OpenRouter
// - Wallet connection handling
```

**Session Management**
- In-memory session store with auto-cleanup
- 1-hour session timeout
- Per-session wallet tracking
- Multiple concurrent sessions support

**Request Flow**
```
User Message
    ↓
Parse Command (regex patterns)
    ↓
Route to Handler
    ├── BALANCE: Check wallet SOL
    ├── PORTFOLIO: Analyze holdings
    ├── SWAP: Get Jupiter quote
    ├── CONFIRM: Execute transaction
    └── AI: Generate response with OpenRouter
    ↓
Return Result
```

#### `/api/balance.ts`
```typescript
// Responsibilities:
// - RPC endpoint fallback logic
// - Balance fetching with retry
// - Error handling and logging
```

**RPC Failover Strategy**
1. Primary: Helius RPC (dedicated API key)
2. Fallback: Standard Solana mainnet-beta
3. Automatic retry with 500ms delay
4. 10-second timeout per endpoint

#### `/api/swap.ts`
```typescript
// Responsibilities:
// - Jupiter quote API integration
// - Token price fetching
// - Slippage calculation
```

**Data Flow**
```
Input Mint + Output Mint + Amount
    ↓
Convert to lamports (decimals)
    ↓
Query Jupiter API
    ↓
Parse response
    ↓
Calculate price impact
    ↓
Return quote with details
```

#### `/api/execute-swap.ts`
```typescript
// 132 lines
// Responsibilities:
// - Transaction building with Jupiter
// - Wallet signing coordination
// - Transaction confirmation
```

**Transaction Lifecycle**
```
Build Quote (Jupiter API)
    ↓
Create Transaction (signed by user)
    ↓
Return base64 encoded
    ↓
User signs with Phantom
    ↓
Broadcast to chain
    ↓
Confirm (3+ signatures)
```

### Business Logic Layer (`/model`)

#### `/model/chat.ts`
```typescript
// Core chat logic
// - Command pattern matching
// - Message formatting
// - Response generation
```

**Command Patterns**
```regex
/balance/i                    → Check balance
/swap\s+([\d.]+)/i           → Get swap quote
/portfolio/i                  → View holdings
/confirm|yes/i               → Execute swap
/launch|create.*token/i      → Token creation
```

#### `/model/launch.ts`
```typescript
// 142 lines - Token Launch System
// Responsibilities:
// - Pump.fun SDK integration
// - Token parameter validation
// - Transaction building
// - Explorer link generation
```

**Token Creation Flow**
```
Validate Input (name, symbol, decimals)
    ↓
Load Keypair
    ↓
Get Connection (with RPC failover)
    ↓
Initialize PumpSdk
    ↓
Create Transaction
    ↓
Sign with Private Key
    ↓
Confirm on chain
    ↓
Return Mint Address + Links
```

### Infrastructure Layer

#### RPC Management
```typescript
const RPC_ENDPOINTS = [
  'https://mainnet.helius-rpc.com/?api-key=...',  // Primary
  'https://api.mainnet-beta.solana.com'           // Fallback
];
```

**Failover Logic**
- Automatic switching on timeout/error
- 500ms delay between retries
- Detailed logging per attempt
- Circuit breaker pattern (max 2 attempts)

#### Database Layer
Currently: In-memory session store
Future: Redis/PostgreSQL for persistence

```typescript
interface SessionData {
  sessionId: string;
  walletAddress?: string;
  pendingSwap?: SwapDetails;
  createdAt: number;
  lastActivity: number;
}
```

#### Blockchain Integration

**Solana Web3.js**
```typescript
import { Connection, PublicKey, Keypair } from '@solana/web3.js';

// Connection pooling with failover
const connection = new Connection(rpcUrl, 'confirmed');

// Transaction signing
const transaction = await buildSwapTransaction();
const signature = await connection.sendTransaction(tx, [keypair]);
```

**Jupiter Integration**
```typescript
// Quote API
GET https://api.jup.ag/quote?inputMint=...&outputMint=...&amount=...

// Response includes:
// - inAmount, outAmount
// - priceImpactPct
// - routePlan (swap path)
```

**Pump.fun SDK**
```typescript
import { PumpSdk } from '@raydium-io/pump-sdk';

const sdk = new PumpSdk();
const tx = await sdk.createTokenTransaction({
  name: 'Token Name',
  symbol: 'SYMBOL',
  decimals: 6,
  initialSupply: 1000000
});
```

#### AI Integration

**OpenRouter API**
```typescript
// Supports multiple models
// Default: meta-llama/llama-2-7b-chat
// Alternative: claude-3-5-sonnet

const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
    'HTTP-Referer': 'https://shina-ten.vercel.app'
  },
  body: JSON.stringify({
    model: 'meta-llama/llama-2-7b-chat',
    messages: [...conversationHistory]
  })
});
```

## Data Flow Examples

### Balance Check Flow
```
User Input: "what is my balance?"
    ↓
/api/chat receives request
    ↓
Parse → BALANCE command detected
    ↓
Extract wallet from session
    ↓
Call /api/balance endpoint
    ↓
RPC Query (with failover)
    ↓
Convert lamports to SOL
    ↓
Return formatted response
    ↓
Display to user
```

### Swap Flow
```
User Input: "swap 1 SOL for USDC"
    ↓
Parse → SWAP command with amounts
    ↓
Get Jupiter quote
    ↓
Display quote & wait for confirmation
    ↓
User Input: "confirm"
    ↓
Build transaction with execute-swap API
    ↓
Sign with Phantom wallet
    ↓
Broadcast to chain
    ↓
Wait for confirmation (3+ signatures)
    ↓
Return success with tx signature
```

### Token Launch Flow
```
User Input: "launch MyToken with symbol MYT"
    ↓
Parse parameters
    ↓
Validate inputs
    ↓
/api/launch receives request
    ↓
Load keypair from .env.local
    ↓
Get Solana connection (with RPC failover)
    ↓
Initialize Pump.fun SDK
    ↓
Build create token transaction
    ↓
Sign transaction
    ↓
Send to chain
    ↓
Confirm on blockchain
    ↓
Extract mint address
    ↓
Generate explorer links
    ↓
Return success with links
```

## Configuration & Deployment

### Environment Variables Architecture

```yaml
Solana Configuration:
  RPC:
    - Primary: Helius with API key
    - Backup: Standard mainnet-beta
  Wallet:
    - Private Key (base58)
    - Public Key (address)
  Token Mints: Pre-configured

Jupiter Configuration:
  - API Key
  - Quote API endpoint
  - Swap API endpoint

AI/LLM Configuration:
  - OpenRouter API key
  - Model selection
  - Anthropic alternative

Transaction Settings:
  - Slippage: 50 bps
  - Gas Price: 5000 lamports
  - Max Retries: 5

Feature Flags:
  - Enable/disable each feature
  - Debug mode toggle
  - Rate limiting config
```

### Deployment Architecture

```
Development
├─ .env.development (devnet)
├─ localhost:3000
└─ npm run dev

Production
├─ .env.local (mainnet)
├─ Vercel serverless functions
├─ CDN for static assets
└─ https://shina-ten.vercel.app
```

## Error Handling Strategy

### Error Propagation
```
API Handler
    ↓
Try Business Logic
    ├─ Validation Error → 400
    ├─ RPC Error → Fallback → 503 if all fail
    ├─ Transaction Error → 400 with details
    └─ Server Error → 500
    ↓
Return standardized error response
```

### Logging Hierarchy
```
ERROR:   Critical failures (RPC down, tx failed)
WARN:    Fallback activations, timeouts
INFO:    Successful operations, transactions
DEBUG:   RPC calls, quote details, parsing (dev only)
```

## Performance Considerations

### Optimization Strategies

**RPC Query Optimization**
- Connection pooling
- Promise.race for timeout handling
- Automatic endpoint fallback

**Transaction Building**
- Pre-computed routes with Jupiter
- Cached token mint information
- Reusable transaction templates

**Session Management**
- In-memory caching (fast lookup)
- Auto-cleanup after 1 hour
- Prevents memory leaks

**API Response Time**
- Balance check: ~1-2s (RPC query)
- Swap quote: ~2-3s (Jupiter API)
- AI response: ~3-5s (LLM inference)

### Scalability

**Current**
- In-memory session store
- Per-request RPC connections

**Future**
- Redis for distributed sessions
- RPC connection pooling
- Database for historical data
- Caching layer for prices

## Security Architecture

### Key Management
- Private keys stored only in environment variables
- Never logged or exposed
- Server-side signing for token launch
- Phantom wallet for user transactions

### API Security
- CORS restrictions
- Rate limiting (100 req/15 min)
- Input validation on all endpoints
- Error messages don't leak secrets

### Transaction Security
- User signature required (Phantom)
- Transaction preview before signing
- Confirmation waiting (3+ signatures)
- Slippage protection

## Monitoring & Observability

### Logging
```typescript
// Per-layer logging
[BALANCE] RPC query to endpoint X
[SWAP] Jupiter quote received
[CHAT] Command parsed: BALANCE
[ERROR] RPC timeout, switching to backup
```

### Future Enhancements
- Sentry integration for error tracking
- Prometheus metrics for performance
- Analytics dashboard
- Transaction history logging

---

See [Roadmap](./roadmap.md) for planned improvements.
