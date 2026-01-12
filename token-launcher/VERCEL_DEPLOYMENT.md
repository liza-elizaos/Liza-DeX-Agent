# 🚀 LIZA Token Launcher - Deployment Guide

## ✅ What We've Built

A complete frontend + backend system for creating and launching Solana tokens with an interactive LIZA chatbot:

### Features
- 💬 **Interactive Chat Interface** - LIZA guides users through token creation
- 🎨 **Logo Upload** - Users can upload custom logos
- 📋 **Token Configuration** - Name, symbol, description, and tone selection
- ⚡ **One-Click Launch** - Deploy tokens to Solana mainnet
- 📊 **Real-time Status** - Track token creation and explorer links

### Tech Stack
- **Frontend:** React + TypeScript + CSS3
- **Backend:** Express.js + Node.js
- **Blockchain:** Solana (via SPL Token Program)
- **Hosting:** Vercel (Serverless)

---

## 📋 Pre-Deployment Checklist

### 1. Local Testing ✅
- [x] Build successful: `npm run build`
- [x] Server running: `npm start`
- [x] Token creation endpoint: `/api/token/create`
- [x] Chat interface rendering

### 2. Environment Variables Setup
Create a `.env` file in the project root:

```env
# Solana Network
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com

# Pump.fun API
PUMPPORTAL_API_KEY=your_pumpportal_api_key_here

# AI Model (OpenRouter)
OPENROUTER_API_KEY=your_openrouter_api_key_here

# Server
NODE_ENV=production
PORT=3001
```

### 3. Vercel Secrets Setup

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Set environment variables
vercel env add SOLANA_RPC_URL
vercel env add PUMPPORTAL_API_KEY
vercel env add OPENROUTER_API_KEY
```

---

## 🚀 Deploy to Vercel

### Option 1: Via CLI (Recommended)

```bash
# From project root
cd d:\shina\token-launcher

# Deploy
vercel --prod

# Follow prompts to set project name and link
```

### Option 2: Via GitHub

1. Push code to GitHub
2. Go to https://vercel.com/new
3. Select your GitHub repo
4. Configure build settings:
   - Build command: `npm run build`
   - Output directory: `dist`
5. Add environment variables
6. Deploy

---

## 📦 Project Structure

```
token-launcher/
├── src/
│   ├── frontend/
│   │   ├── TokenCreationChat.tsx    ← Chat interface
│   │   ├── styles/
│   │   │   └── token-chat.css       ← Chat styles
│   │   └── index.tsx
│   ├── routes/
│   │   ├── launch.ts
│   │   └── token.ts                  ← Token creation API
│   ├── app.ts                        ← Express app
│   └── server.ts                     ← Server entry
├── public/
│   └── token-launcher.html           ← HTML template
├── dist/                             ← Built files
├── package.json
├── tsconfig.json
└── vercel.json                       ← Vercel config
```

---

## 🔌 API Endpoints

### Token Creation
```bash
POST /api/token/create
Content-Type: multipart/form-data

{
  "name": "mem",
  "symbol": "Meme",
  "description": "A community meme token",
  "logo": <file>,
  "tone": "degen"
}

Response:
{
  "success": true,
  "mint": "TokenMintAddress...",
  "tx": "TransactionSignature...",
  "explorer": "https://solscan.io/token/...",
  "pumpfun": "https://pump.fun/..."
}
```

### Token Status
```bash
GET /api/token/status/:mint

Response:
{
  "success": true,
  "mint": "...",
  "status": "active",
  "verified": false
}
```

---

## 🧪 Testing After Deployment

### 1. Test Health Check
```bash
curl https://your-vercel-app.vercel.app/health
```

### 2. Test Token Creation (With Logo)
```bash
curl -X POST https://your-vercel-app.vercel.app/api/token/create \
  -F "name=mem" \
  -F "symbol=Meme" \
  -F "description=Test token" \
  -F "tone=degen" \
  -F "logo=@path/to/logo.png"
```

### 3. Access Chat Interface
```
https://your-vercel-app.vercel.app/
```

---

## 🔒 Security Considerations

1. **API Keys:** Store in Vercel secrets, never commit to repo
2. **File Uploads:** Validate file types and size limits (10MB)
3. **CORS:** Configured for public access
4. **Rate Limiting:** Consider adding for production

---

## 📊 Monitoring & Logs

### Vercel Logs
```bash
# View real-time logs
vercel logs --prod

# Show last 100 lines
vercel logs --prod --follow
```

---

## 🔄 Deployment Workflow

```bash
# 1. Make changes locally
git add .
git commit -m "feat: add token creation feature"

# 2. Test locally
npm run build
npm start

# 3. Deploy to Vercel
vercel --prod

# 4. Verify deployment
curl https://your-vercel-app.vercel.app/health
```

---

## 🐛 Troubleshooting

### Issue: Build fails on Vercel
**Solution:** Check that all TypeScript errors are resolved locally:
```bash
npm run build
```

### Issue: API returns 404
**Solution:** Verify routes are correctly mapped in `vercel.json`

### Issue: Logo upload fails
**Solution:** Check file size (max 10MB) and MIME type

### Issue: Token creation times out
**Solution:** Increase function timeout in `vercel.json` (max 60s)

---

## 📞 Support

For issues or questions:
1. Check build logs: `vercel logs --prod`
2. Review error messages in browser console
3. Verify environment variables are set

---

## ✨ Success Metrics

- ✅ Chat interface loads and responds
- ✅ Users can input token details
- ✅ Logo upload works
- ✅ Token creation API succeeds
- ✅ Explorer links are generated
- ✅ Sub-second response times

---

**Deployment Status:** Ready for production 🚀
**Created:** January 6, 2026
