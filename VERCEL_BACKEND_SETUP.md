# 📋 Vercel Deployment - Backend Information & Setup

## What They're Asking For

They want documentation about the backend setup for Vercel deployment. Here's everything they need:

---

## 1️⃣ Backend Environment Configuration (`.env` Structure)

### 🔐 Required Environment Variables

```env
# ===== LLM PROVIDER (REQUIRED) =====
OPENROUTER_API_KEY=sk-or-v1-xxxxxxxxxx          # OpenRouter API key for AI responses
OPENROUTER_MODEL=mistralai/devstral-2512:free   # Free tier model (using cheapest option)
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1

# ===== MODEL CONFIGURATION =====
MODEL_PROVIDER=openrouter     # Which LLM provider to use
LLM_MODEL=mistralai/devstral-2512:free

# ===== SOLANA NETWORK SETUP =====
SOLANA_NETWORK=mainnet        # mainnet, testnet, or devnet
SOLANA_PUBLIC_KEY=CMVrzdso... # Your Solana wallet public key
SOLANA_PRIVATE_KEY=42ALEQ...  # Your Solana private key (for server-side swaps)
SOLANA_RPC_URL=https://solana-mainnet.g.alchemy.com/v2/xxxxx  # RPC endpoint

# ===== BLOCKCHAIN DATA PROVIDERS =====
BIRDEYE_API_KEY=             # For token price/chart data (optional)
JUPITER_API_KEY=cd72422b...  # Jupiter swap quotes API key
JUPITER_API_URL=https://api.jup.ag/swap/v1/quote

# ===== DATABASE CONFIGURATION (Local) =====
PGLITE_DATA_DIR=D:\shina\.eliza\.elizadb

# ===== ELIZAOS CLOUD (Optional) =====
ELIZAOS_CLOUD_API_KEY=       # For elizaOS cloud integration

# ===== PERFORMANCE =====
PRICE_UPDATE_INTERVAL=60000   # How often to update prices (ms)
```

### ✅ What Each Variable Does

| Variable | Purpose | Required | Example |
|----------|---------|----------|---------|
| `OPENROUTER_API_KEY` | AI model provider authentication | ✅ YES | `sk-or-v1-...` |
| `OPENROUTER_MODEL` | Which AI model to use (using free tier) | ✅ YES | `mistralai/devstral-2512:free` |
| `SOLANA_PUBLIC_KEY` | Public address for balance checks | ✅ YES | `CMVrzdso4S...` |
| `SOLANA_PRIVATE_KEY` | Private key for executing swaps | ✅ YES | `42ALEQ...` |
| `SOLANA_RPC_URL` | Solana blockchain connection | ✅ YES | Alchemy/Helius RPC |
| `JUPITER_API_KEY` | Token swap quotes | ✅ YES | `cd72422b...` |
| `BIRDEYE_API_KEY` | Price data (optional) | ❌ NO | Can skip |

---

## 2️⃣ Main Agent Initialization Code

### 📄 File: `api/chat.ts`

This is the **main entry point** for the backend API running on Vercel.

#### A. Agent Character Definition

```typescript
// LIZA_CHARACTER - Defines the AI agent's personality
const LIZA_CHARACTER = {
  name: "Liza",
  role: "Decentralized Infrastructure Architect",
  bio: "Autonomous decentralized agent built on ElizaOS for Jeju network.",
  personality: "Technical, data-driven, transparent, security-conscious",
  network: "Solana Mainnet / Jeju",
};
```

#### B. System Prompt (Instructions to AI)

```typescript
const SYSTEM_PROMPT = `You are Liza, an autonomous decentralized infrastructure agent...

CAPABILITIES:
1. Wallet Management - Check balances, manage keys, track holdings
2. DeFi Strategies - Analyze yield, explain farming, grid trading, DCA
3. Token Swaps - Execute trades, manage orders, track execution
4. Price Monitoring - Real-time data, historical analysis, market trends
5. Risk Assessment - Contract audits, security analysis, trust metrics
6. Order Management - Create, track, cancel orders
7. Trading Strategies - DCA, Momentum, Grid trading
`;
```

#### C. Main API Handler

```typescript
// Located at: api/chat.ts
// Entry point: handler(req: VercelRequest, res: VercelResponse)

// The handler:
// 1. Receives POST requests to /api/chat
// 2. Extracts message, walletPublicKey, sessionId from request body
// 3. Determines if user wants to: chat, check balance, or execute swap
// 4. Calls OpenRouter AI for response
// 5. Executes swap if requested
// 6. Returns result to frontend
```

#### D. OpenRouter AI Integration

```typescript
async function callOpenRouter(
  messages: Array<{ role: string; content: string }>
): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const model = process.env.OPENROUTER_MODEL || "mistralai/devstral-2512:free";
  
  // Calls OpenRouter API to get AI response
  // Using free tier model to minimize costs
}
```

#### E. Wallet Detection (3-Level Priority)

```typescript
// Priority order for finding wallet:
// 1. Check request parameter: walletPublicKey
// 2. Extract from message: "swap 1 SOL for USDC [wallet_address]"
// 3. Fall back to server wallet if configured

let walletAddress = walletPublicKey && walletPublicKey.trim() !== '' 
  ? walletPublicKey.trim() 
  : undefined;

// Try to extract if not provided
if (!walletAddress) {
  const addressMatch = message.match(/([1-9A-HJ-NP-Za-km-z]{43,44})/);
  walletAddress = addressMatch?.[0];
}
```

#### F. Swap Execution

```typescript
// When user says "swap 1 SOL for USDC":
// 1. Parse swap parameters (amount, tokens, direction)
// 2. Get wallet address
// 3. Call executeSwap() from swap-utils.ts
// 4. Return swap instructions or error message

if (msg.includes("swap") || msg.includes("trade")) {
  const result = await executeSwap({
    walletAddress,
    fromToken,
    toToken,
    amount,
    // ...
  });
}
```

---

## 3️⃣ Backend Project Structure

```
d:\shina\
├── api/                          # Vercel serverless functions
│   ├── chat.ts                   # 🔴 MAIN: Chat & swap API (626 lines)
│   ├── swap-utils.ts             # Solana swap execution logic
│   ├── wallet.ts                 # Wallet utilities
│   └── [*.ts files]              # Other API endpoints
│
├── src/                          
│   ├── frontend/                 # React frontend
│   │   ├── index.tsx            # Main chat interface
│   │   ├── phantom-sign-and-send.ts  # Phantom wallet signing
│   │   └── index.css            # Styling
│   └── ...
│
├── .env                          # 🔐 Environment variables (secrets)
├── .env.example                  # Template for developers
├── vercel.json                   # Vercel deployment config
├── package.json                  # Dependencies & scripts
└── README.md                     # Project documentation
```

### Key Backend Files

| File | Purpose | Size |
|------|---------|------|
| `api/chat.ts` | Main chat API + wallet detection + swap orchestration | 626 lines |
| `api/swap-utils.ts` | Solana Jupiter swap execution | ~500 lines |
| `api/wallet.ts` | Wallet balance checking & address validation | ~200 lines |
| `vercel.json` | Vercel deployment settings | 6 lines |

---

## 4️⃣ Vercel Deployment Configuration

### 📁 File: `vercel.json`

```json
{
  "version": 2,
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "public": true
}
```

### What This Does

- **version**: Vercel deployment version
- **buildCommand**: Runs `npm run build` to compile TypeScript
- **devCommand**: Local development command
- **public**: Makes deployment publicly accessible

### Build Process

```bash
# When you deploy to Vercel, it runs:
npm run build

# Which executes:
bun run build.ts

# This:
# 1. Cleans dist directory
# 2. Bundles code with Bun
# 3. Generates TypeScript declarations
# 4. Builds frontend with Vite
# 5. Creates production bundle
```

---

## 5️⃣ API Endpoints (Backend Routes)

### Main Endpoint: `POST /api/chat`

**Request Body:**
```json
{
  "sessionId": "session_123456",
  "message": "swap 1 SOL for USDC",
  "context": "trading",
  "walletPublicKey": "CMVrzdso4S...",
  "config": null
}
```

**Response:**
```json
{
  "response": "Swap instructions ready for client signing...",
  "swap": {
    "status": "pending_signature",
    "transactionBase64": "AZfvKHF7V4k...",
    "fromToken": "SOL",
    "toToken": "USDC",
    "amount": 1
  }
}
```

### What the API Does

1. **Chat Processing**
   - Sends message to OpenRouter AI
   - Returns AI response

2. **Balance Checking**
   - User: "check my balance"
   - Backend: Gets wallet balance from Solana RPC
   - Returns: "Your balance: X SOL, Y USDC, ..."

3. **Swap Execution**
   - User: "swap 1 SOL for USDC"
   - Backend: Gets swap quote from Jupiter
   - Backend: Builds transaction
   - Backend: Returns base64 transaction for frontend signing
   - Frontend: Signs with Phantom wallet
   - Frontend: Sends signed transaction back

---

## 6️⃣ Dependencies & Stack

### Framework
- **ElizaOS** (1.7.0) - AI agent framework
- **Vercel/Node** - Serverless backend

### AI & LLM
- **OpenRouter** - AI provider (free tier: mistralai/devstral-2512)
- **@elizaos/plugin-openrouter** - OpenRouter integration

### Blockchain
- **@solana/web3.js** - Solana blockchain client
- **@elizaos/plugin-solana** - Solana integration
- **@elizaos/plugin-raydium** - DEX integration
- **bs58** - Base58 encoding

### Frontend
- **React** - UI framework
- **@tanstack/react-query** - Data fetching
- **@solana/wallet-adapter-phantom** - Phantom wallet integration

---

## 7️⃣ How It All Works Together

```
┌─────────────────────────────────────────────────────────┐
│                     USER WORKFLOW                       │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  1. User connects Phantom wallet on frontend           │
│  2. User types: "swap 1 SOL for USDC"                 │
│  3. Frontend sends to backend: POST /api/chat          │
│     • Message: "swap 1 SOL for USDC"                  │
│     • WalletPublicKey: "CMVrz..." (from Phantom)      │
│                                                         │
│  4. Backend (api/chat.ts) receives request            │
│  5. Backend calls OpenRouter AI to understand intent   │
│  6. Backend parses swap: 1 SOL → USDC                │
│  7. Backend gets swap quote from Jupiter API          │
│  8. Backend builds transaction (Solana)               │
│  9. Backend returns base64 transaction to frontend     │
│                                                         │
│  10. Frontend detects "pending_signature"             │
│  11. Frontend asks Phantom to sign transaction         │
│  12. Phantom shows transaction to user                │
│  13. User approves in Phantom wallet                  │
│  14. Frontend sends signed tx to Solana RPC           │
│  15. Solana executes swap on-chain                    │
│  16. User gets new tokens in wallet                   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 8️⃣ Environment Setup for Vercel

### Step 1: Set Environment Variables in Vercel Dashboard

```
https://vercel.com/[your-account]/[project]/settings/environment-variables
```

Add these variables:
- `OPENROUTER_API_KEY` = your key
- `OPENROUTER_MODEL` = mistralai/devstral-2512:free
- `SOLANA_PUBLIC_KEY` = your wallet
- `SOLANA_PRIVATE_KEY` = your private key
- `SOLANA_RPC_URL` = your RPC endpoint
- `JUPITER_API_KEY` = your key

### Step 2: Deploy

```bash
npm run build
npx vercel deploy --prod --yes
```

### Step 3: Verify

```bash
# Test the API
curl https://your-deployment.vercel.app/api/chat -X GET

# Should return: "API is working!"
```

---

## 🎯 Current Deployment Status

**Production URL**: https://shina-bqx35uu2u-naquibmirza-6034s-projects.vercel.app

**Features**:
- ✅ AI chat with Liza character (using OpenRouter free tier)
- ✅ Wallet balance checking
- ✅ Solana token swaps (Jupiter)
- ✅ "Swap all" keyword support
- ✅ Multi-chain wallet support (Solana + Jeju Network)
- ✅ Helpful error messages
- ✅ Enhanced wallet detection logging

---

## 📞 Support

If they ask for:

1. **Backend code** → Share `api/chat.ts` (main file)
2. **Deployment config** → Share `vercel.json`
3. **Environment setup** → Share `.env` structure (without secret keys!)
4. **How swaps work** → Share `api/swap-utils.ts`
5. **Wallet handling** → Show the 3-level wallet priority logic
6. **API spec** → POST `/api/chat` with request/response examples

---

**Last Updated**: January 9, 2026
**Status**: Production Ready ✅
