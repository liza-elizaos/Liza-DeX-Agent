# Architecture Overview

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                         v0.dev Website                          │
│                    (Your Frontend Application)                  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ React Components                                         │  │
│  │ - SwapForm.tsx                                           │  │
│  │ - BalanceDisplay.tsx                                     │  │
│  │ - SwapButton.tsx                                         │  │
│  └──────────────────────────────────────────────────────────┘  │
│                           ↓ HTTP Requests                       │
└─────────────────────────────────────────────────────────────────┘
                            │
                            │ (HTTPS)
                            │
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│              Vercel Edge Network (Deployed App)                 │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ API Endpoints                                            │  │
│  │ ┌──────────────────────────────────────────────────────┐ │  │
│  │ │ GET /api/balance                                     │ │  │
│  │ │ Returns: { balanceSOL, walletAddress, network }     │ │  │
│  │ └──────────────────────────────────────────────────────┘ │  │
│  │ ┌──────────────────────────────────────────────────────┐ │  │
│  │ │ POST /api/swap                                       │ │  │
│  │ │ Input: { fromToken, toToken, amount }               │ │  │
│  │ │ Output: { success, message, transactionHash }       │ │  │
│  │ └──────────────────────────────────────────────────────┘ │  │
│  └──────────────────────────────────────────────────────────┘  │
│                           ↓                                     │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ ElizaOS Agent Logic                                      │  │
│  │ ├─ Token Validation                                      │  │
│  │ ├─ Amount Conversion (Decimals)                          │  │
│  │ ├─ Exact-In/Exact-Out Detection                          │  │
│  │ └─ Transaction Signing                                   │  │
│  └──────────────────────────────────────────────────────────┘  │
│                           ↓                                     │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Environment Variables (Secure)                           │  │
│  │ ├─ SOLANA_PRIVATE_KEY                                    │  │
│  │ ├─ SOLANA_PUBLIC_KEY                                     │  │
│  │ ├─ JUPITER_API_KEY                                       │  │
│  │ └─ SOLANA_RPC_URL                                        │  │
│  └──────────────────────────────────────────────────────────┘  │
│                           ↓                                     │
└─────────────────────────────────────────────────────────────────┘
                            │
                            │ (RPC + Jupiter API)
                            │
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                    Solana Blockchain                            │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ RPC Endpoint (Alchemy)                                   │  │
│  │ ├─ Query wallet balance                                  │  │
│  │ ├─ Build transactions                                    │  │
│  │ └─ Broadcast transactions                                │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Jupiter Router                                           │  │
│  │ ├─ Find best swap routes                                 │  │
│  │ ├─ Calculate quotes                                      │  │
│  │ └─ Generate swap instructions                            │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Token Programs                                           │  │
│  │ ├─ SOL (Native Token)                                    │  │
│  │ ├─ Token Metadata (Decimals, etc)                        │  │
│  │ ├─ Token Accounts (User Balances)                        │  │
│  │ └─ Swap Pools (Liquidity)                                │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow: Token Swap Example

### Scenario: User swaps 1 SOL for BONK on v0.dev

```
1. User clicks "Swap" button on v0.dev
   └─→ React Component captures: fromToken="SOL", toToken="BONK", amount=1

2. Frontend makes HTTP POST request
   └─→ https://your-project.vercel.app/api/swap
   └─→ Sends: { fromToken, toToken, amount }

3. Vercel API Handler processes request
   ├─→ Validates input parameters
   ├─→ Gets wallet address from env
   └─→ Calls ElizaOS executeSwap() function

4. ElizaOS executeSwap() executes
   ├─→ Resolves token addresses (SOL, BONK contracts)
   ├─→ Detects swap mode (Exact-In for 1 SOL)
   ├─→ Converts amount: 1 SOL = 1,000,000,000 lamports (9 decimals)
   └─→ Prepares Jupiter API request

5. Jupiter API processes swap
   ├─→ Receives: inputMint, outputMint, amount, swapMode
   ├─→ Searches liquidity pools
   ├─→ Calculates best route
   ├─→ Returns quote with rate and output amount
   └─→ Generates swap instructions

6. ElizaOS signs transaction
   ├─→ Gets private key from environment
   ├─→ Decodes from Base58
   ├─→ Creates Keypair
   ├─→ Signs transaction instructions
   └─→ Submits to Solana network

7. Solana validates transaction
   ├─→ Checks signatures
   ├─→ Executes swap instructions
   ├─→ Transfers SOL from user → program
   ├─→ Transfers BONK from program → user
   └─→ Records on blockchain

8. Response returns to frontend
   ├─→ API returns: { success: true, transactionHash }
   └─→ React Component displays confirmation
   └─→ User sees: "✅ Swap successful! TX: abc123..."

9. User can verify on Solana Explorer
   └─→ https://explorer.solana.com/tx/[transactionHash]
```

## Component Communication

```
┌─────────────────────────────────────────────────────────────┐
│ v0.dev Website (React)                                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  State Management                                           │
│  ├─ balance: number (SOL balance)                          │
│  ├─ loading: boolean (API call in progress)                │
│  ├─ error: string (error message)                          │
│  └─ swapResult: string (transaction result)                │
│                                                             │
│  Components                                                 │
│  ├─ BalanceDisplay → Calls /api/balance                    │
│  ├─ SwapForm → Accepts user input                          │
│  └─ TransactionResult → Shows results                      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                         ↓ fetch()
┌─────────────────────────────────────────────────────────────┐
│ Vercel API (Node.js/TypeScript)                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  /api/balance Handler                                       │
│  ├─ Create Solana Connection                               │
│  ├─ Query wallet balance                                   │
│  └─ Return JSON response                                   │
│                                                             │
│  /api/swap Handler                                          │
│  ├─ Validate input                                         │
│  ├─ Call executeSwap()                                     │
│  └─ Return transaction result                              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                         ↓ import
┌─────────────────────────────────────────────────────────────┐
│ ElizaOS Logic (src/api/solana-swap.ts)                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  executeSwap() Function                                     │
│  ├─ Resolve token addresses                                │
│  ├─ Calculate exact amount in smallest units               │
│  ├─ Query Jupiter API for quote                            │
│  ├─ Build transaction instructions                         │
│  ├─ Sign with private key                                  │
│  ├─ Submit to RPC endpoint                                 │
│  └─ Return transaction hash                                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Deployment Regions

```
┌──────────────────────────────────────────┐
│ Your GitHub Repository                   │
│ └─ Code changes trigger deployment       │
└──────────┬─────────────────────────────────┘
           │
           ↓
┌──────────────────────────────────────────┐
│ Vercel CI/CD                             │
│ ├─ Install dependencies                  │
│ ├─ Run build command                     │
│ └─ Deploy to edge network                │
└──────────┬─────────────────────────────────┘
           │
           ↓
┌──────────────────────────────────────────┐
│ Vercel Global Edge Network               │
│ ├─ iad1 (US - Virginia)                  │
│ ├─ Multiple regions for low latency      │
│ └─ CDN for static assets                 │
└──────────────────────────────────────────┘
           ↓
┌──────────────────────────────────────────┐
│ Your Users                               │
│ ├─ Fast API response time                │
│ ├─ Geographic load balancing             │
│ └─ 99.95% uptime SLA                     │
└──────────────────────────────────────────┘
```

## Environment Variables Flow

```
Development (Local)
├─ .env (local file)
└─ npm start reads .env

Production (Vercel)
├─ Vercel Dashboard → Environment Variables
├─ Secrets encrypted at rest
├─ Never exposed in code
└─ Injected at runtime

Security
├─ ❌ Not in git history
├─ ❌ Not in edge functions' memory
├─ ✅ Encrypted in Vercel
├─ ✅ Rotatable on demand
└─ ✅ Auditable access logs
```

---

This architecture ensures:
- ✅ Security (secrets not in code)
- ✅ Scalability (Vercel edge network)
- ✅ Reliability (99.95% uptime)
- ✅ Performance (global CDN)
- ✅ Maintainability (clear separation of concerns)
