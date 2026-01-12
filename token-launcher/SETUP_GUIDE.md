# 🚀 Token Launcher - Complete Setup Guide

## 📋 Overview

This is a **production-ready AI-powered token launcher** for Pump.fun with:
- ✅ Dexscreener trend detection
- ✅ OpenRouter AI validation
- ✅ Automatic token name generation
- ✅ Pump.fun integration
- ✅ Image upload handling
- ✅ Full error handling

## 🏗️ Architecture

```
┌─────────────┐
│   Frontend  │ React + TypeScript
│  (Browser)  │
└──────┬──────┘
       │ HTTP
       ▼
┌─────────────────────────────────────┐
│   Backend (Node.js/Express)         │
├─────────────────────────────────────┤
│ /api/agent/launch                   │
│   ├─ Trend Detection (Dexscreener) │
│   ├─ AI Validation (OpenRouter)    │
│   ├─ Name Generation (AI)          │
│   └─ Token Launch (PumpPortal)     │
└─────────────────────────────────────┘
       │
       ├─→ Dexscreener API
       ├─→ OpenRouter API
       ├─→ Pump.fun IPFS
       └─→ PumpPortal API
```

## 🔧 Prerequisites

- **Node.js** 18+ ([Download](https://nodejs.org))
- **npm** 9+ (comes with Node.js)
- **API Keys**:
  - OpenRouter (https://openrouter.ai)
  - PumpPortal (provided)
  - Pump.fun wallet credentials (provided)

## 📦 Installation

### Step 1: Clone/Create Project

```bash
cd token-launcher
```

### Step 2: Install Dependencies

```bash
npm install
```

This installs:
- `express` - Web server
- `axios` - HTTP client
- `multer` - File uploads
- `@solana/web3.js` - Solana blockchain
- `typescript` - Type safety

### Step 3: Configure Environment

Create `.env` file (already provided):

```env
OPENROUTER_API_KEY=your-key-here
PUMPPORTAL_API_KEY=9wu42tb5b936ux9h5xw6ghba9hun8n348dj4jdbc5ww7awuqetbmpjkgaxtkepk6bv79crq4k3cenu66pj65xc5jc2qdhgmewua6nv6wgbmert7gh1jankpugara4ykuen9mcuhg658m2nj771bmywvmar9hu6erbremrkjathb1hp2jtke5a4rma495vkuf8
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
DEV_WALLET_ADDRESS=6VR1QcueqMDSgqDZ2JvcRumFu1Azo53qgy66XDJTvA1C
DEV_WALLET_PRIVATE_KEY=3rQAKmKm34j48o5WxVaqDvoxR6xC9yirB9UiW75hFru23YMnXMzYQ3whnpkNNZC1ckqy75vc1xN4vkYsuRHrnP3t
NODE_ENV=development
PORT=3001
```

## 🚀 Running the Backend

### Development Mode

```bash
npm run dev
```

Output:
```
============================================================
🚀 Token Launcher Backend
📍 Server running on http://localhost:3001
============================================================

✅ Environment loaded:
   - OPENROUTER_API_KEY: ✓
   - PUMPPORTAL_API_KEY: ✓
   - SOLANA_RPC_URL: ✓
   - DEV_WALLET_ADDRESS: ✓

📋 API Endpoints:
   POST /api/agent/launch - Launch a new token
   GET /health - Health check
```

### Build for Production

```bash
npm run build
npm start
```

## 🧪 Testing

### Test 1: Health Check

```bash
curl http://localhost:3001/health
```

Response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-05T10:30:00.000Z"
}
```

### Test 2: Launch Token (Using Postman/cURL)

**Create a test image first**, then:

```bash
curl -X POST http://localhost:3001/api/agent/launch \
  -F "userPrompt={\"idea\":\"AI meme token\",\"tone\":\"degen\",\"symbolHint\":\"AI\",\"notes\":\"\"}" \
  -F "launchConfig={\"devBuySol\":0.5,\"slippage\":10,\"priorityFee\":0.0005,\"pool\":\"pump\"}" \
  -F "image=@token-image.png"
```

**Expected Response (Success):**

```json
{
  "status": "success",
  "message": "✅ Token launched successfully!",
  "trendConfidence": 87,
  "trendVerdict": "hot",
  "trendReasoning": "AI narrative aligns with current market trends",
  "token": {
    "name": "AI Terminal",
    "symbol": "ATERM",
    "lore": "Next-gen AI trading bot",
    "mint": "...",
    "tx": "...",
    "tags": ["ai-meta", "meme", "trending"]
  }
}
```

**Expected Response (Rejected):**

```json
{
  "status": "rejected",
  "message": "Trend validation failed: Market sentiment is bearish for AI tokens",
  "trendConfidence": 25,
  "trendVerdict": "dead",
  "trendReasoning": "Current trends don't support this narrative"
}
```

## 🎨 Using the Frontend Component

The React component is in `src/frontend/TokenLauncher.tsx`

### Integration Example

```tsx
import TokenLauncher from './frontend/TokenLauncher';

export default function App() {
  return <TokenLauncher />;
}
```

### Features

- ✅ Image upload with preview
- ✅ Real-time validation
- ✅ Trend confidence display
- ✅ Auto-generated token preview
- ✅ Transaction links to Solscan
- ✅ Full error handling

## 🔍 How It Works

### Request Flow

```
1. User uploads image + token concept
2. Frontend validates (image required)
3. POST to /api/agent/launch
4. Backend:
   a) Detects market trends (Dexscreener)
   b) Validates narrative (OpenRouter AI)
   c) Generates token name/lore (AI)
   d) Uploads image to Pump.fun IPFS
   e) Launches token (PumpPortal API)
5. Returns mint address + tx signature
```

### Trend Validation

**Hard Data (Dexscreener):**
- Volume (24h, 1h)
- Buy/Sell ratio
- Liquidity
- Boosts
- Newness

**Soft Intelligence (AI):**
- Narrative fit
- Meme pattern recognition
- Market sentiment
- Cultural relevance

## 📊 API Response Fields

### Success

```json
{
  "status": "success",
  "message": "✅ Token launched successfully!",
  "trendConfidence": 0-100,
  "trendVerdict": "hot|neutral|dead",
  "trendReasoning": "Why this verdict",
  "token": {
    "name": "Token Name",
    "symbol": "SYMBOL",
    "lore": "Description",
    "mint": "token-mint-address",
    "tx": "transaction-signature",
    "tags": ["tag1", "tag2"]
  }
}
```

### Rejected

```json
{
  "status": "rejected",
  "message": "Reason for rejection",
  "trendConfidence": 0-100,
  "trendVerdict": "dead",
  "trendReasoning": "Why trend is dead"
}
```

### Error

```json
{
  "status": "error",
  "message": "Error description"
}
```

## ⚠️ Important Rules

1. **Image Required** - Request fails without image
2. **PNG/JPG Only** - Other formats rejected
3. **Max 2MB** - Large images rejected
4. **Valid JSON** - userPrompt and launchConfig must be valid JSON
5. **Trend Dead = Reject** - Unless `override=true`
6. **Low Confidence = Reject** - <30% confidence rejected (unless override)

## 🐛 Troubleshooting

### "OPENROUTER_API_KEY not set"

Solution: Add key to `.env` file and restart server

### "File size must be less than 2MB"

Solution: Compress your image to <2MB

### "Invalid JSON format"

Solution: Ensure userPrompt and launchConfig are valid JSON strings

### "Trend verdict = dead"

Solution: Either improve concept or use `override=true`

### "No trend data available"

This is OK - API falls back to default values

## 📚 File Structure

```
token-launcher/
├── src/
│   ├── agent/
│   │   ├── trendDetector.ts      # Trend analysis
│   │   └── agentController.ts    # Orchestration
│   ├── services/
│   │   ├── dexscreener.ts        # DEX API
│   │   ├── openrouter.ts         # AI API
│   │   └── pumpfun.ts            # Launch logic
│   ├── routes/
│   │   └── launch.ts             # POST endpoint
│   ├── middleware/
│   │   └── upload.ts             # File handling
│   ├── frontend/
│   │   ├── TokenLauncher.tsx     # React component
│   │   └── styles/
│   │       └── launcher.css      # Styling
│   ├── app.ts                    # Express setup
│   └── server.ts                 # Entry point
├── .env                          # Configuration
├── package.json                  # Dependencies
├── tsconfig.json                 # TypeScript config
├── README.md                     # Quick start
└── SETUP_GUIDE.md               # This file
```

## 🚢 Deployment

### To Vercel

1. Create `vercel.json`:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "src/server.ts",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "src/server.ts"
    }
  ],
  "env": {
    "OPENROUTER_API_KEY": "@openrouter_key",
    "PUMPPORTAL_API_KEY": "@pumpportal_key"
  }
}
```

2. Deploy:

```bash
vercel --prod
```

### To Any Node.js Host

```bash
npm run build
npm start
```

## 💡 Tips

- Start with small dev buys (0.2-0.5 SOL) for testing
- Test with non-AI concepts to see trend rejection
- Monitor logs for API call details
- Use override carefully (bypasses safety)
- Keep API keys secret

## 📞 Support

Check logs for detailed error messages:

```bash
npm run dev 2>&1 | grep -i error
```

## ✅ Checklist

Before production:

- [ ] All API keys configured in `.env`
- [ ] Backend starts without errors
- [ ] Health check works
- [ ] Test launch with small amount (0.2 SOL)
- [ ] Verify token appears on Pump.fun
- [ ] Frontend integrated properly
- [ ] Error handling tested
- [ ] Rate limiting considered

## 🎉 You're Ready!

Your token launcher is now fully set up. Start creating tokens! 🚀

---

**Need help?** Check the console logs - they tell you exactly what's happening at each step.
