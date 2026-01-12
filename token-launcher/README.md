# 🚀 Token Launcher - Backend

Production-ready AI-assisted token launch system for Solana/Pump.fun.

## 🎯 Features

✅ **Trend Detection** - Dexscreener integration for real market data
✅ **AI Validation** - OpenRouter Claude validates narrative against trends
✅ **Smart Naming** - AI generates token name, symbol, and lore
✅ **Image Upload** - Multer handles PNG/JPG uploads (max 2MB)
✅ **Pump.fun Integration** - Full token launch via PumpPortal API
✅ **IPFS Storage** - Metadata uploaded to pump.fun IPFS
✅ **Dev Buy** - Automatic purchase at launch time

## 🏗️ Folder Structure

```
/src
 ├─ agent/
 │   ├─ trendDetector.ts      # Market trend analysis
 │   └─ agentController.ts    # Full orchestration
 ├─ services/
 │   ├─ dexscreener.ts        # DEX data fetching
 │   ├─ openrouter.ts         # AI prompt/validation
 │   └─ pumpfun.ts            # Token launch logic
 ├─ middleware/
 │   └─ upload.ts             # Multer file handling
 ├─ routes/
 │   └─ launch.ts             # POST /api/agent/launch
 ├─ app.ts                    # Express setup
 └─ server.ts                 # Entry point
```

## 📋 Setup

```bash
cd token-launcher
npm install
```

### Environment Variables (.env)

```
OPENROUTER_API_KEY=your-key-here
PUMPPORTAL_API_KEY=9wu42tb5b936ux9h5xw6ghba9hun8n348dj4jdbc5ww7awuqetbmpjkgaxtkepk6bv79crq4k3cenu66pj65xc5jc2qdhgmewua6nv6wgbmert7gh1jankpugara4ykuen9mcuhg658m2nj771bmywvmar9hu6erbremrkjathb1hp2jtke5a4rma495vkuf8
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
DEV_WALLET_ADDRESS=6VR1QcueqMDSgqDZ2JvcRumFu1Azo53qgy66XDJTvA1C
DEV_WALLET_PRIVATE_KEY=3rQAKmKm34j48o5WxVaqDvoxR6xC9yirB9UiW75hFru23YMnXMzYQ3whnpkNNZC1ckqy75vc1xN4vkYsuRHrnP3t
```

## 🚀 Run

```bash
npm run dev
```

Server runs on `http://localhost:3001`

## 📡 API Endpoint

### POST /api/agent/launch

**Request:** multipart/form-data

```json
Fields:
- userPrompt (JSON): {
    "idea": "AI terminal girl meme with cult vibes",
    "tone": "degen",
    "symbolHint": "AI",
    "notes": "Should feel like next Eliza"
  }
- image (File): PNG/JPG (max 2MB)
- launchConfig (JSON): {
    "devBuySol": 1,
    "slippage": 10,
    "priorityFee": 0.0005,
    "pool": "pump"
  }
- override (boolean, optional): Force launch even if trend verdict is dead
```

**Response (Success):**

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
    "lore": "Next-gen AI girl meme",
    "mint": "...",
    "tx": "...",
    "tags": ["ai-meta", "meme", "cult"]
  }
}
```

**Response (Rejected):**

```json
{
  "status": "rejected",
  "message": "Trend validation failed: Market sentiment is bearish for AI tokens",
  "trendConfidence": 25,
  "trendVerdict": "dead",
  "trendReasoning": "Current trends don't support this narrative"
}
```

## 🧪 Test with Postman

1. Create multipart form request
2. Add fields:
   - `userPrompt`: JSON string
   - `image`: PNG/JPG file
   - `launchConfig`: JSON string
3. POST to `http://localhost:3001/api/agent/launch`
4. Check response for mint address and tx signature

## 🔍 Logging

All operations log to console:

```
[AGENT] Starting launch orchestration...
[TREND] Detecting market trends...
[DEX] Fetching trending tokens from Dexscreener...
[AI] Validating narrative with OpenRouter...
[PUMP] Launching token via PumpPortal...
```

## ⚠️ Important Rules

- Image is REQUIRED (reject if missing)
- Only PNG/JPG allowed (max 2MB)
- Format MUST be valid JSON for userPrompt/launchConfig
- Trend verdict "dead" = reject (unless override=true)
- Low confidence (<30%) = reject (unless override=true)

## 📚 Dependencies

- **express** - Web framework
- **axios** - HTTP client
- **multer** - File upload
- **dotenv** - Environment variables
- **@solana/web3.js** - Solana blockchain
- **typescript** - Type safety

## 🚢 Deployment

Ready for Vercel or any Node.js hosting:

```bash
npm run build
npm start
```

---

**Built with ❤️ for Web3 traders**
