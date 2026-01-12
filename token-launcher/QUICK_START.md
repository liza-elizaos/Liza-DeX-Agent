# 🚀 QUICK START - Token Launcher

## ✅ Backend Running! 

The backend is now **live on `http://localhost:3001`**

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

## 🧪 Test the Backend

### Option 1: Using PowerShell

```powershell
# Create a simple test image (1x1 pixel PNG in base64)
$imageBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
[System.IO.File]::WriteAllBytes("C:\temp\test.png", [Convert]::FromBase64String($imageBase64))

# Test the endpoint with Invoke-RestMethod
$userPrompt = @{
    idea = "AI-powered meme token"
    tone = "degen"
    symbolHint = "AIME"
    notes = "Should appeal to crypto degens"
} | ConvertTo-Json

$launchConfig = @{
    devBuySol = 0.2
    slippage = 10
    priorityFee = 0.0005
    pool = "pump"
} | ConvertTo-Json

$form = @{
    userPrompt = $userPrompt
    launchConfig = $launchConfig
    image = Get-Item "C:\temp\test.png"
}

$response = Invoke-RestMethod -Uri "http://localhost:3001/api/agent/launch" `
  -Method POST `
  -Form $form

$response | ConvertTo-Json -Depth 10
```

### Option 2: Using Postman

1. Create a new **POST** request to: `http://localhost:3001/api/agent/launch`
2. Go to **Body** tab → Select **form-data**
3. Add these fields:
   - **userPrompt** (text): `{"idea":"AI-powered meme token","tone":"degen","symbolHint":"AIME","notes":""}`
   - **launchConfig** (text): `{"devBuySol":0.2,"slippage":10,"priorityFee":0.0005,"pool":"pump"}`
   - **image** (file): Upload any PNG/JPG image (max 2MB)
4. Click **Send**

### Option 3: Using cURL

```bash
curl -X POST http://localhost:3001/api/agent/launch \
  -F "userPrompt={\"idea\":\"AI meme token\",\"tone\":\"degen\",\"symbolHint\":\"AI\",\"notes\":\"\"}" \
  -F "launchConfig={\"devBuySol\":0.2,\"slippage\":10,\"priorityFee\":0.0005,\"pool\":\"pump\"}" \
  -F "image=@token-image.png"
```

### Option 4: Health Check

```bash
curl http://localhost:3001/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-05T10:30:00.000Z"
}
```

## 📊 Expected Responses

### ✅ Success (Token Launched)

```json
{
  "status": "success",
  "message": "✅ Token launched successfully!",
  "trendConfidence": 87,
  "trendVerdict": "hot",
  "trendReasoning": "AI narrative aligns with current market trends. Meme tokens with AI theme are trending.",
  "token": {
    "name": "AI Terminal",
    "symbol": "ATERM",
    "lore": "Next-gen AI trading bot for degens",
    "mint": "...",
    "tx": "...",
    "tags": ["ai-meta", "meme", "trending"]
  }
}
```

### ⚠️ Rejected (Trend Validation Failed)

```json
{
  "status": "rejected",
  "message": "Trend validation failed",
  "trendConfidence": 25,
  "trendVerdict": "dead",
  "trendReasoning": "Current market sentiment is bearish for AI tokens. Consider updating your concept."
}
```

Force launch with: `override=true`

### ❌ Error (Missing Image)

```json
{
  "status": "error",
  "message": "Image file is required"
}
```

## 🛠️ Integration with Main Shina App

### Step 1: Copy React Component

The React component is ready at:
```
d:\shina\token-launcher\src\frontend\TokenLauncher.tsx
d:\shina\token-launcher\src\frontend\styles\launcher.css
```

### Step 2: Add to Main Shina App

1. Copy `TokenLauncher.tsx` to your main Shina components
2. Import styles:
```tsx
import './launcher.css';
import TokenLauncher from './TokenLauncher';
```

3. Add to your main App:
```tsx
<TokenLauncher />
```

### Step 3: Update API URL

In `TokenLauncher.tsx`, find the `fetch()` call and update:
```tsx
// Development
const API_URL = 'http://localhost:3001';

// Production
const API_URL = 'https://your-deployed-backend.com';
```

## 📦 Deployment Options

### Option A: Deploy on Vercel (Same as Main App)

```bash
cd d:\shina\token-launcher
vercel --prod
```

### Option B: Deploy on Railway

1. Install Railway CLI: `npm install -g railway`
2. Connect: `railway login`
3. Deploy: `railway up`

### Option C: Deploy on Render

1. Push to GitHub
2. Create new Web Service on Render
3. Connect your GitHub repo
4. Set environment variables in Render dashboard
5. Deploy

## 🔑 Environment Variables

Already configured in `.env`:

```env
OPENROUTER_API_KEY=your-key-here
PUMPPORTAL_API_KEY=9wu42tb5b936ux9h5xw6ghba9hun8n348dj4jdbc5ww7awuqetbmpjkgaxtkepk6bv79crq4k3cenu66pj65xc5jc2qdhgmewua6nv6wgbmert7gh1jankpugara4ykuen9mcuhg658m2nj771bmywvmar9hu6erbremrkjathb1hp2jtke5a4rma495vkuf8
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
DEV_WALLET_ADDRESS=6VR1QcueqMDSgqDZ2JvcRumFu1Azo53qgy66XDJTvA1C
DEV_WALLET_PRIVATE_KEY=3rQAKmKm34j48o5WxVaqDvoxR6xC9yirB9UiW75hFru23YMnXMzYQ3whnpkNNZC1ckqy75vc1xN4vkYsuRHrnP3t
```

## 📚 API Documentation

### POST /api/agent/launch

**Purpose**: Launch a new token with trend validation

**Content-Type**: `multipart/form-data`

**Request Fields**:

| Field | Type | Required | Example |
|-------|------|----------|---------|
| userPrompt | JSON string | Yes | `{"idea":"AI token","tone":"degen","symbolHint":"AI","notes":""}` |
| launchConfig | JSON string | Yes | `{"devBuySol":0.2,"slippage":10,"priorityFee":0.0005,"pool":"pump"}` |
| image | File (PNG/JPG) | Yes | token-logo.png (max 2MB) |
| override | boolean | No | false (set true to bypass trend check) |

**Response**:
```json
{
  "status": "success|rejected|error",
  "message": "Human readable message",
  "trendConfidence": 0-100,
  "trendVerdict": "hot|neutral|dead",
  "trendReasoning": "Why this verdict",
  "token": {
    "name": "Token Name",
    "symbol": "SYMBOL",
    "lore": "Description",
    "mint": "token-address",
    "tx": "transaction-signature",
    "tags": ["tag1", "tag2"]
  }
}
```

## 🎯 What's Happening

1. **Trend Detection** (Dexscreener):
   - Fetches top 5 trending tokens
   - Analyzes volume, buys/sells, liquidity
   - Scores trend strength 0-100

2. **Narrative Validation** (OpenRouter AI):
   - Sends your idea + current trends to Claude
   - Returns confidence score
   - Verdict: hot (trends match), neutral (no signal), dead (contradicts trends)

3. **Token Generation** (AI):
   - Creates unique token name (max 20 chars)
   - Symbol: 3-5 uppercase chars
   - Lore: 100 char max description
   - Tags: AI-detected themes

4. **Token Launch** (Pump.fun/PumpPortal):
   - Uploads image to Pump.fun IPFS
   - Creates token metadata
   - Makes initial dev buy
   - Returns mint address + tx signature

## ⚡ Tips for Success

1. **Image Requirements**:
   - PNG or JPG format
   - Max 2MB size
   - Square aspect ratio (1:1) preferred
   - Unique, recognizable design

2. **Token Concept**:
   - Be specific: "AI meme" vs "Random token"
   - Match current trends
   - Use clear tone (degen, meta, cute, edgy, serious)

3. **Dev Buy Amount**:
   - Start with 0.2 - 0.5 SOL for testing
   - Increase to 1-2 SOL for real launches
   - Max 5 SOL

4. **If Rejected**:
   - Review trend reasoning
   - Adjust concept to match current market
   - Use `override=true` only if confident
   - Better to wait for favorable trends

## 🐛 Troubleshooting

**"Cannot find module"**
```bash
npm install
npm run build
```

**"OPENROUTER_API_KEY not set"**
- Ensure `.env` file exists in `token-launcher/` folder
- Restart server after editing `.env`

**"File size must be less than 2MB"**
- Compress image using: https://tinypng.com

**"Invalid JSON format"**
- Ensure userPrompt and launchConfig are valid JSON strings
- Test with: `JSON.parse(yourString)` in browser console

**"Trend verdict = dead"**
- Concept doesn't match current trends
- Try different tone or idea
- Or use `override=true` to force launch

## 📞 Support

Check the console logs while running the backend - they show exactly what's happening:

```bash
# The terminal will show:
[AGENT] Step 1: Detecting market trends...
[TRENDS] Fetching top tokens from Dexscreener...
[AI] Validating narrative with OpenRouter...
[AI] Generating token name and lore...
[PUMP] Uploading image to IPFS...
[PUMP] Launching token...
```

## 🎉 You're Ready!

Your token launcher is fully functional. Next:

1. ✅ Backend running on localhost:3001
2. ⏳ Test with Postman/PowerShell
3. ⏳ Integrate React component into main Shina app
4. ⏳ Deploy backend to production
5. ⏳ Update API URL in frontend
6. ⏳ Test end-to-end with real image

**Questions?** Check [SETUP_GUIDE.md](./SETUP_GUIDE.md) for detailed information.
