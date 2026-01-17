# LIZA - Vercel Deployment

## Prerequisites
- Vercel CLI: `npm i -g vercel`
- Git repository with code committed
- Environment variables ready

## Environment Variables Required

Create a `.env` file or set in Vercel dashboard:

```
# Solana RPC
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
BACKUP_RPC_URL=https://solana-api.projectserum.com
SOLANA_PUBLIC_KEY=<your_solana_wallet_address>
SOLANA_PRIVATE_KEY=<your_private_key_base58>

# AI/Chat
OPENROUTER_API_KEY=<your_api_key>
OPENROUTER_MODEL=meta-llama/llama-2-7b-chat

# Optional: Other LLM providers
ANTHROPIC_API_KEY=<api_key>
OPENAI_API_KEY=<api_key>

# Database (if using)
DATABASE_URL=postgresql://...

# Discord/Telegram (if using)
DISCORD_TOKEN=<token>
TELEGRAM_TOKEN=<token>
```

## Deployment Steps

### 1. Build Locally
```bash
npm run build
```

### 2. Deploy to Vercel

#### Option A: Using Vercel CLI
```bash
vercel --prod
```

#### Option B: GitHub Integration (Recommended)
1. Push code to GitHub
2. Go to https://vercel.com
3. Click "Add New" → "Project"
4. Import your GitHub repository
5. Add environment variables in "Settings" → "Environment Variables"
6. Deploy

### 3. Set Environment Variables in Vercel

Go to your Vercel project → Settings → Environment Variables:

```
SOLANA_RPC_URL = https://api.mainnet-beta.solana.com
OPENROUTER_API_KEY = <your_key>
SOLANA_PUBLIC_KEY = <your_wallet>
```

### 4. Verify Deployment

Test the live API endpoints:

```bash
# Chat
curl -X POST https://your-app.vercel.app/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"hello"}'

# Balance
curl -X POST https://your-app.vercel.app/api/balance \
  -H "Content-Type: application/json" \
  -d '{"userPublicKey":"CMVrzdso4SShQm2irrc7jMCN9Vw5QxXvrZKB79cYPPJT"}'

# Swap
curl -X POST https://your-app.vercel.app/api/swap \
  -H "Content-Type: application/json" \
  -d '{"fromToken":"SOL","toToken":"USDC","amount":1}'

# Portfolio
curl https://your-app.vercel.app/api/portfolio?wallet=CMVrzdso4SShQm2irrc7jMCN9Vw5QxXvrZKB79cYPPJT
```

## Troubleshooting

### API Returns 404
- Verify routes are correctly mapped in `server.ts`
- Check that all handlers are properly imported

### RPC Timeout
- Add backup RPC endpoints
- Increase timeout values in `src/api/balance.ts`

### Import Errors
- Run `npm install` to ensure all deps are installed
- Check that files are in correct directory: `src/api/` not `model/`

## API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/chat` | POST | Chat with AI assistant |
| `/api/balance` | GET/POST | Check SOL balance |
| `/api/portfolio` | GET | Analyze wallet portfolio |
| `/api/swap` | POST | Swap tokens (name or mint) |
| `/api/wallet-connect` | POST | Connect wallet |
| `/health` | GET | Health check |

## Features

✅ Swap tokens by name (SOL, USDC, BONK) or mint address  
✅ Real-time portfolio analysis with USD valuations  
✅ Balance checking with fallback RPC  
✅ AI chat integration (OpenRouter)  
✅ CORS enabled for all endpoints  
✅ Full Vercel serverless support  

## Database (Optional)

If using PostgreSQL:

```bash
npm install pg
```

Set `DATABASE_URL` in Vercel environment variables.

## Support

For issues:
1. Check Vercel deployment logs
2. Test locally with `npm run dev`
3. Verify environment variables are set
4. Check RPC endpoint status
