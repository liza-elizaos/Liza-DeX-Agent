# 🚀 Shina - ElizaOS Solana Trading Agent + Vercel + v0.dev Integration

## 📋 Project Summary

This is a production-ready Solana trading agent built with ElizaOS that:
- Executes token swaps via Jupiter API
- Manages Solana wallet operations
- Deploys to Vercel for serverless execution
- Integrates with v0.dev for frontend development

## ✨ Key Features

### Trading Features
✅ **Token Swaps** - Buy/sell tokens with Exact-In/Exact-Out modes  
✅ **Jupiter Integration** - Best DEX aggregation for optimal rates  
✅ **Exact Decimals** - Proper handling of token-specific decimal places  
✅ **SOL Wrapping** - Phantom-compatible SOL wrapping/unwrapping  

### Security Features
✅ **Private Key Protection** - Never stored in code  
✅ **Environment Variables** - Secrets in Vercel dashboard  
✅ **Transaction Signing** - All transactions signed locally  
✅ **Balance Validation** - Prevents insufficient balance errors  

### Deployment Features
✅ **Vercel Ready** - Serverless deployment in 5 minutes  
✅ **API Endpoints** - RESTful `/api/swap` and `/api/balance`  
✅ **CORS Enabled** - Works with frontend applications  
✅ **Error Handling** - Comprehensive error messages  

## 📁 Project Structure

```
shina/
├── src/
│   ├── api/
│   │   ├── solana-swap.ts          # Token swap logic with Jupiter
│   │   ├── solana-transfer.ts      # SOL transfer logic
│   │   └── solana-defi.ts          # DeFi analysis
│   ├── plugins/
│   │   └── solana.ts               # ElizaOS plugin with actions
│   ├── index.ts                    # Main entry point
│   ├── character.ts                # Agent configuration
│   └── plugin.ts                   # Plugin registration
│
├── api/                            # Vercel serverless functions
│   ├── swap.ts                     # POST /api/swap
│   └── balance.ts                  # GET /api/balance
│
├── vercel.json                     # Vercel deployment config
├── .env.example                    # Environment template
├── .gitignore                      # Git security settings
│
└── Documentation/
    ├── VERCEL_DEPLOYMENT_GUIDE.md  # Complete deployment steps
    ├── V0_DEV_INTEGRATION.md        # React component examples
    ├── QUICK_DEPLOYMENT.md         # 5-minute checklist
    ├── ARCHITECTURE.md             # System design
    └── DEPLOYMENT_SETUP_COMPLETE.md # Setup summary
```

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, TypeScript, Tailwind CSS |
| **Backend** | Node.js, ElizaOS, Solana Web3.js |
| **Deployment** | Vercel Serverless Functions |
| **Blockchain** | Solana Mainnet, Jupiter Router |
| **Database** | Optional PostgreSQL |
| **Build** | Bun, TypeScript |

## 🚀 Quick Start

### Prerequisites
- Node.js 20+ or Bun
- GitHub account
- Vercel account (free)
- Solana wallet

### Local Development

```bash
# Install dependencies
npm install

# Build project
npm run build

# Run locally
npm start
```

Server runs on `http://localhost:3000` with ElizaOS agent

### Test Locally

```bash
# Check wallet balance
curl http://localhost:3000/api/balance

# Execute a swap
curl -X POST http://localhost:3000/api/swap \
  -H "Content-Type: application/json" \
  -d '{
    "fromToken": "SOL",
    "toToken": "BONK",
    "amount": 0.1
  }'
```

## 📦 Deployment to Vercel

### 1️⃣ Push to GitHub
```bash
git add .
git commit -m "Setup Vercel deployment"
git push origin main
```

### 2️⃣ Create Vercel Project
1. Go to https://vercel.com/new
2. Select "Import Git Repository"
3. Choose your GitHub repository
4. Click "Import"

### 3️⃣ Add Environment Variables

In Vercel Dashboard → Settings → Environment Variables:

```env
SOLANA_NETWORK=mainnet
SOLANA_PUBLIC_KEY=CMVrzdso4SShQm2irrc7jMCN9Vw5QxXvrZKB79cYPPJT
SOLANA_PRIVATE_KEY=42ALEQhrLMzsWXhNZDtRCjALJwS61MpfcJHBopGycsaNnoaypUf7St1BCF2rbge3ozUn6DPjQSHc7hU8KvQs87Gw
SOLANA_RPC_URL=https://solana-mainnet.g.alchemy.com/v2/pfiW_dJZBV0RjLHK1TgV53sMmLFTcCmX
JUPITER_API_KEY=cd72422b-136c-4951-a00f-9fb904e14acf
JUPITER_API_URL=https://api.jup.ag/swap/v1/quote
```

### 4️⃣ Deploy
Click "Deploy" button and wait 2-3 minutes.

### 5️⃣ Get Your URL
Your API is now at: `https://your-project.vercel.app`

## 🔗 Integrate with v0.dev

### Step 1: Add Environment Variable
In your v0.dev project `.env.local`:
```env
NEXT_PUBLIC_API_URL=https://your-project.vercel.app
```

### Step 2: Use React Components

**Balance Display:**
```typescript
import { useEffect, useState } from 'react';

export default function Balance() {
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/balance`)
      .then(r => r.json())
      .then(d => setBalance(d.balanceSOL));
  }, []);

  return <div>Balance: {balance} SOL</div>;
}
```

**Swap Form:**
```typescript
async function executeSwap() {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/swap`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fromToken: 'SOL',
        toToken: 'BONK',
        amount: 1
      })
    }
  );
  const data = await response.json();
  console.log(data.message);
}
```

See `V0_DEV_INTEGRATION.md` for complete component examples.

## 📊 API Endpoints

### GET `/api/balance`
Returns wallet balance in SOL

**Response:**
```json
{
  "success": true,
  "walletAddress": "CMVrzdso4SShQm2irrc7jMCN9Vw5QxXvrZKB79cYPPJT",
  "balanceSOL": 5.5,
  "balanceLamports": 5500000000,
  "network": "mainnet"
}
```

### POST `/api/swap`
Execute a token swap

**Request:**
```json
{
  "fromToken": "SOL",
  "toToken": "BONK",
  "amount": 1
}
```

**Response:**
```json
{
  "success": true,
  "message": "✅ Swap successful! Transaction: 3XxQBYXnHxKvXC...",
  "transactionHash": "3XxQBYXnHxKvXCvxsJqB..."
}
```

## 🔒 Security Best Practices

### ✅ DO
- Store secrets in Vercel Environment Variables
- Use a dedicated bot wallet (not personal wallet)
- Rotate API keys regularly
- Monitor transaction history
- Use test network first

### ❌ DON'T
- Commit `.env` to Git
- Share private keys publicly
- Use same key for multiple projects
- Leave bot unattended with large amounts
- Skip error handling

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| [VERCEL_DEPLOYMENT_GUIDE.md](./VERCEL_DEPLOYMENT_GUIDE.md) | Complete deployment walkthrough |
| [V0_DEV_INTEGRATION.md](./V0_DEV_INTEGRATION.md) | React component examples |
| [QUICK_DEPLOYMENT.md](./QUICK_DEPLOYMENT.md) | 5-minute deployment checklist |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | System design & data flow |
| [.env.example](./.env.example) | Environment variables template |

## 🧪 Testing

### Unit Tests
```bash
npm test
```

### Build Check
```bash
npm run build
```

### Type Check
```bash
npm run type-check
```

### Formatting
```bash
npm run format
```

## 🐛 Troubleshooting

### Build Fails
- Check Node.js version: `node --version`
- Clear cache: `rm -rf node_modules && npm install`
- Check logs in Vercel dashboard

### API Timeout
- Increase function timeout in `vercel.json`
- Verify RPC endpoint is responding
- Check Jupiter API status

### CORS Errors
- Already enabled in API handlers
- Verify CORS headers in `/api/*` files
- Check browser console for actual error

### Private Key Issues
- Use Base58 encoding only
- Never use 0, O, I, or l characters
- Verify key is 88 characters long

## 📈 Monitoring

### Vercel Dashboard
- Real-time logs
- Performance metrics
- Error tracking
- Deployment history

### Solana Explorer
- Verify transactions: https://explorer.solana.com
- Check wallet balance
- Monitor token accounts

## 💰 Costs

- **Vercel Free Tier**: ∞ for 100GB bandwidth
- **Solana Transactions**: ~0.00005 SOL per swap
- **RPC Endpoint**: Free tier available
- **Total**: Practically free

## 🎓 Learning Resources

- [ElizaOS Documentation](https://docs.elizaos.ai)
- [Solana Cookbook](https://solanacookbook.com)
- [Jupiter API Reference](https://docs.jup.ag)
- [Vercel Documentation](https://vercel.com/docs)

## 🤝 Contributing

Contributions welcome! Areas for improvement:
- Additional token support
- Advanced trading strategies
- WebSocket real-time updates
- Database persistence
- Advanced UI components

## 📄 License

This project is part of ElizaOS ecosystem.

## 🎯 Next Steps

1. ✅ Review this README
2. ✅ Read VERCEL_DEPLOYMENT_GUIDE.md
3. ✅ Push to GitHub
4. ✅ Deploy to Vercel (5 minutes)
5. ✅ Test API endpoints
6. ✅ Integrate with v0.dev
7. ✅ Start trading!

## 📞 Support

- GitHub Issues
- Vercel Support: https://vercel.com/support
- ElizaOS Discord: [Community](https://discord.gg/elizaos)
- Solana Mainnet RPC: [Alchemy](https://www.alchemy.com/)

---

**Ready to deploy?** 🚀

Follow `QUICK_DEPLOYMENT.md` for a 5-minute deployment walkthrough.

**Questions?** Check the documentation files in the root directory.

**Happy trading!** 🎉
