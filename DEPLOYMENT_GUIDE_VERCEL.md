# Deployment Guide - Vercel

## Prerequisites
- Vercel Account (free at https://vercel.com)
- Git repository (GitHub, GitLab, or Bitbucket)
- Environment variables configured

## Step 1: Prepare Your Repository

```bash
# Ensure all changes are committed
git add .
git commit -m "Fix balance API and prepare for Vercel deployment"
git push origin main
```

## Step 2: Set Up Environment Variables in Vercel

In your Vercel project settings, add these environment variables:

```
SOLANA_RPC_URL = https://solana-mainnet.g.alchemy.com/v2/YOUR_ALCHEMY_KEY
SOLANA_PUBLIC_KEY = YOUR_WALLET_ADDRESS
SOLANA_PRIVATE_KEY = YOUR_PRIVATE_KEY_BASE58
SOLANA_NETWORK = mainnet
```

## Step 3: Deploy to Vercel

### Option A: Using Vercel CLI

```bash
npm install -g vercel
vercel
```

Follow the prompts to link your Git repository.

### Option B: Using GitHub Integration

1. Go to https://vercel.com/new
2. Connect your GitHub repository
3. Vercel will auto-detect the configuration from `vercel.json`
4. Add environment variables in project settings
5. Deploy!

## Step 4: Configure API Routes

The server uses Bun runtime. Vercel has set up:
- `npm run dev` - Development mode (localhost:3000)
- `npm run build` - Build for production (outputs to `dist/`)

The API routes are handled by our custom server in `server.ts`:
- `/api/balance` - Check wallet balance
- `/api/chat` - Chat interface with AI
- `/api/swap` - Token swaps
- `/api/wallet-connect` - Wallet connection

## Step 5: Test the Deployment

After deployment, test these endpoints:

```bash
# Test balance endpoint
curl -X POST https://your-app.vercel.app/api/balance \
  -H "Content-Type: application/json" \
  -d '{"userPublicKey":"CMVrzdso4SShQm2irrc7jMCN9Vw5QxXvrZKB79cYPPJT"}'

# Test chat endpoint
curl -X POST https://your-app.vercel.app/api/chat \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"test","message":"check my balance","walletPublicKey":"YOUR_WALLET"}'
```

## Troubleshooting

### Error: "HTTP 500 when checking balance"

**Solution**: Ensure environment variables are set correctly:
- `SOLANA_RPC_URL` must be a valid Solana RPC endpoint
- Check Vercel logs: `vercel logs`

### Error: "Cannot find module"

**Solution**: Run locally first:
```bash
npm install
npm run build
npm run dev
```

### Logs and Debugging

View deployment logs:
```bash
vercel logs
```

View real-time logs:
```bash
vercel logs --follow
```

## Local Testing Before Deployment

```bash
# Build locally
npm run build

# Start server
npm run dev

# Test in browser
open http://localhost:3000

# Test API endpoints
curl -X POST http://localhost:3000/api/balance \
  -H "Content-Type: application/json" \
  -d '{"userPublicKey":"CMVrzdso4SShQm2irrc7jMCN9Vw5QxXvrZKB79cYPPJT"}'
```

## Production Checklist

- [ ] Environment variables set in Vercel
- [ ] Git repository connected
- [ ] `vercel.json` configured correctly
- [ ] Local build and server test successful
- [ ] API endpoints tested with curl
- [ ] Frontend loads at root URL
- [ ] Wallet connection works in browser
- [ ] Balance check works end-to-end
- [ ] Swap functionality works (if configured)

## Monitoring

### Real-time Monitoring
- Use Vercel Dashboard: https://vercel.com/dashboard
- View function logs: `vercel logs`
- Check deployment status: `vercel list`

### Performance
- First Contentful Paint: Should be < 2s
- API response time: Should be < 1s
- Overall Lighthouse score: 90+

## Rollback

If something goes wrong:
```bash
vercel rollback
```

## Support

For Vercel-specific issues:
- Documentation: https://vercel.com/docs
- Support: https://vercel.com/support
- Community: https://vercel.com/help/articles

For Solana issues:
- Solana Docs: https://docs.solana.com
- Solana RPC: https://docs.solana.com/developing/clients/jsonrpc-api
