# 🤖 LIZA - Autonomous Solana AI Assistant for elizaOS

> **Enterprise-Grade AI Agent for Solana Token Management & Trading**

![GitHub](https://img.shields.io/badge/GitHub-liza--elizaos-blue?logo=github&style=flat-square) 
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)
![ElizaOS](https://img.shields.io/badge/ElizaOS-v1.7.0-purple?style=flat-square)
![Solana](https://img.shields.io/badge/Solana-Web3.js-14F195?style=flat-square)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?style=flat-square)

LIZA is a production-ready autonomous AI agent that seamlessly integrates with the [ElizaOS](https://github.com/elizaos/eliza) framework to provide comprehensive Solana blockchain capabilities including token launches, real-time trading, portfolio management, and creator reward automation.

---

## ✨ Core Features

### 🚀 **Token Launch & Management**
- Launch SPL tokens with automated bonding curve mechanics
- AutoFun integration for smooth Raydium graduation
- Real-time token creation with customizable parameters
- Creator fee configuration and automated distribution

### 💱 **Intelligent Trading**
- Multi-hop swaps via [Jupiter Protocol](https://jup.ag)
- Real-time price aggregation and slippage protection
- Support for 1000+ SPL tokens on Solana
- Advanced order routing and execution

### 📊 **Portfolio Analytics**
- Real-time wallet analysis across all token holdings
- Multi-token valuations with SOL pricing
- Portfolio rebalancing recommendations
- Historical performance tracking

### 👥 **Creator Rewards System**
- Automated fee collection from token launches
- Wallet aggregation and reward distribution
- Real-time reward tracking and claiming
- Multi-wallet support

### 🧠 **AI Intelligence**
- Natural language token management commands
- Market trend analysis and predictions
- Automated trading strategies
- Risk assessment and portfolio optimization

---

## 🛠️ Technology Stack

| Component | Technology | Version |
|-----------|-----------|---------|
| **Framework** | [ElizaOS](https://github.com/elizaos/eliza) | v1.7.0 |
| **Blockchain** | [Solana Web3.js](https://solana-labs.github.io/solana-web3.js/) | v1.98.4+ |
| **Token Standard** | [SPL Token](https://spl.solana.com/token) | v0.4.14+ |
| **DEX Integration** | [Jupiter Protocol](https://jup.ag) | Latest |
| **Language** | [TypeScript](https://www.typescriptlang.org/) | 5.0+ |
| **Runtime** | [Node.js](https://nodejs.org/) / [Bun](https://bun.sh/) | 18+ / Latest |
| **API Backend** | [Vercel Serverless](https://vercel.com) | Latest |
| **Frontend** | [React](https://react.dev) + [Tailwind CSS](https://tailwindcss.com) | 18+ |
| **Database** | [PostgreSQL](https://www.postgresql.org/) (optional) | 12+ |

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **Bun** (Optional, recommended runtime - [Install](https://bun.sh/))
- **Git** ([Download](https://git-scm.com/))
- Solana wallet with devnet/mainnet SOL

### Installation (5 minutes)

```bash
# 1. Clone the repository
git clone https://github.com/liza-elizaos/Liza-DeX-Agent.git
cd Liza-DeX-Agent

# 2. Install dependencies
npm install
# OR with Bun
bun install

# 3. Build the project
npm run build

# 4. Start development server (runs on http://localhost:3001)
npm run dev
```

### Environment Configuration

Create `.env.local` in the project root:

```env
# Solana RPC (use mainnet-beta for production)
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
# Or use Helius for faster speeds
HELIUS_RPC_URL=https://mainnet.helius-rpc.com/?api-key=YOUR_KEY

# Your Solana wallet (base58 encoded private key)
SOLANA_PRIVATE_KEY=your_base58_private_key_here

# Your wallet public address
SOLANA_PUBLIC_KEY=your_solana_wallet_address

# Optional: API configuration
API_BASE_URL=http://localhost:3001
NODE_ENV=development
PORT=3001

# Optional: Bags FM API (for token launches)
BAGS_FM_API_KEY=your_api_key_here
```

**🔐 Security Note:** Never commit `.env.local` to version control. Use `.env.example` for team sharing.

---

## 📚 API Reference

### Base URL
- **Development:** `http://localhost:3001`
- **Production:** Your deployed URL on [Vercel](https://vercel.com)

### Token Management APIs

#### Create SPL Token
```bash
POST /model/token-create
Content-Type: application/json

{
  "name": "MyToken",
  "symbol": "MTK",
  "decimals": 6,
  "initialSupply": 1000000,
  "imageUrl": "https://example.com/logo.png"
}
```
**Response:** `{ mint: "...", tx: "...", wallet: "..." }`

#### Launch Token on AutoFun
```bash
POST /model/token-launch
Content-Type: application/json

{
  "mint": "token_mint_address",
  "initialBuyLamports": 1000000,
  "wallet": "creator_wallet_address"
}
```
**Response:** `{ tokenMint: "...", bondingCurve: "...", creatorRewarded: true }`

#### Buy Token via Jupiter Swap
```bash
POST /model/token-buy
Content-Type: application/json

{
  "mint": "token_mint_address",
  "amountInLamports": 5000000,
  "wallet": "buyer_wallet_address"
}
```
**Response:** `{ tx: "...", amountOut: "...", price: 0.00123 }`

### Portfolio APIs

#### Get Wallet Portfolio
```bash
GET /model/portfolio?wallet=wallet_address
```

**Response:**
```json
{
  "wallet": "...",
  "totalSOL": 10.5,
  "totalUSD": 1512.75,
  "tokens": [
    {
      "mint": "...",
      "symbol": "USDC",
      "amount": 1000,
      "priceUSD": 1.0,
      "valueUSD": 1000
    }
  ]
}
```

#### Portfolio Analytics
```bash
POST /model/portfolio-analytics
Content-Type: application/json

{
  "wallet": "wallet_address",
  "timeframe": "30d"
}
```

### Creator APIs

#### Get Creator Rewards
```bash
GET /model/creator-rewards?wallet=wallet_address
```

**Response:**
```json
{
  "wallet": "...",
  "totalRewards": 2.5,
  "pendingClaims": 0.75,
  "claimedRewards": 1.75,
  "launches": 3
}
```

#### Claim Rewards
```bash
POST /model/claim-rewards
Content-Type: application/json

{
  "wallet": "creator_wallet_address"
}
```

### Chat & AI APIs

#### Chat Endpoint
```bash
POST /model/chat
Content-Type: application/json

{
  "message": "Launch a token called MyToken",
  "wallet": "wallet_address",
  "context": "optional_context"
}
```

**See [Complete API Documentation](./COMPLETE_IMPLEMENTATION_GUIDE.md) for all endpoints**

---

## 📖 Guides & Documentation

- **[Token Creation Guide](./TOKEN_CREATION_GUIDE.md)** - Creating SPL tokens
- **[Trading Integration](./TRADING_INTEGRATION_GUIDE.md)** - Jupiter swaps
- **[Portfolio Management](./PORTFOLIO_MANAGEMENT_GUIDE.md)** - Portfolio analysis
- **[Creator Rewards](./CREATOR_REWARDS_SETUP.md)** - Creator setup
- **[Deployment](./DEPLOYMENT.md)** - Deploying to production

---

## 🏗️ Project Structure

```
Liza-DeX-Agent/
├── model/                          # API handlers (25+ files)
│   ├── chat.ts, balance.ts
│   ├── token-create.ts, token-launch.ts, token-buy.ts
│   ├── swap.ts, wallet-connect.ts
│   ├── portfolio.ts, portfolio-inline.ts
│   ├── creator-rewards.ts, bags-api.ts
│   └── ...more
├── src/
│   ├── index.ts, character.ts, plugin.ts
│   ├── frontend/, plugins/, characters/
│   └── __tests__/
├── components/
│   ├── CreatorDashboard.tsx, TokenLaunchApp.tsx
│   └── ...
├── server.ts, package.json, tsconfig.json
└── tailwind.config.js, README.md
```

---

## 💻 Development Commands

```bash
npm install              # Install dependencies
npm run dev             # Start dev server (port 3001)
npm run build           # Build for production
npm run type-check      # TypeScript checking
npm run format          # Format code
npm run lint            # Run ESLint
npm run test            # Run tests
```

---

## 🚀 Deployment

### Deploy to Vercel

```bash
npm i -g vercel
npm run build
vercel deploy --prod
```

Set environment variables in Vercel dashboard.

### Deploy to Docker

```bash
docker build -t liza-agent .
docker run -p 3001:3001 -e SOLANA_RPC_URL=... liza-agent
```

---

## 🔗 Real-World Examples

### Create & Launch Token
```typescript
const createRes = await fetch('http://localhost:3001/model/token-create', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'MyToken',
    symbol: 'MTK',
    decimals: 6,
    initialSupply: 1000000
  })
});

const { mint } = await createRes.json();
console.log(`✅ Token: https://solscan.io/token/${mint}`);
```

### Get Portfolio
```typescript
const res = await fetch(
  `http://localhost:3001/model/portfolio?wallet=YOUR_WALLET`
);
const portfolio = await res.json();
console.log(`Total: $${portfolio.totalUSD}`);
```

### Swap Tokens
```typescript
const res = await fetch('http://localhost:3001/model/swap', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    fromMint: 'So11111111111111111111111111111111111111112',
    toMint: 'EPjFWaLb3odcccccccccccccccccccccccccccccccccc',
    amountIn: 1000000000,
    wallet: 'YOUR_WALLET'
  })
});
```

---

## 📚 Resources

### Solana
- [Solana Docs](https://docs.solana.com)
- [Web3.js API](https://solana-labs.github.io/solana-web3.js/)
- [SPL Token](https://spl.solana.com/token)
- [Solscan](https://solscan.io)

### ElizaOS
- [ElizaOS GitHub](https://github.com/elizaos/eliza)
- [ElizaOS Docs](https://elizaos.ai)
- [ElizaOS Plugins](https://github.com/elizaos/eliza/tree/main/packages)

### DeFi
- [Jupiter Protocol](https://jup.ag)
- [Pump.fun](https://pump.fun)
- [Raydium](https://raydium.io)

### Tools
- [Node.js](https://nodejs.org/)
- [Bun](https://bun.sh/)
- [TypeScript](https://www.typescriptlang.org/)
- [Vercel](https://vercel.com)

---

## 🤝 Contributing

1. Fork the [repository](https://github.com/liza-elizaos/Liza-DeX-Agent)
2. Create branch: `git checkout -b feature/your-feature`
3. Commit: `git commit -m "feat: Your feature"`
4. Push: `git push origin feature/your-feature`
5. Open Pull Request

---

## 📝 License

MIT License - see [LICENSE](./LICENSE)

---

## 🆘 Support

- [GitHub Issues](https://github.com/liza-elizaos/Liza-DeX-Agent/issues)
- [GitHub Discussions](https://github.com/liza-elizaos/Liza-DeX-Agent/discussions)
- [ElizaOS Discord](https://discord.gg/elizaos)
- [Solana Discord](https://discord.gg/solana)

---

## 🗺️ Roadmap

- [ ] v0.2.0 - Advanced AI trading
- [ ] v0.3.0 - Multi-chain support
- [ ] v0.4.0 - Portfolio rebalancing
- [ ] v0.5.0 - Mobile app
- [ ] v1.0.0 - Production release

---

## 🙏 Built With

- [ElizaOS](https://github.com/elizaos/eliza) - AI Framework
- [Solana](https://solana.com) - Blockchain
- [Jupiter](https://jup.ag) - DEX Aggregation
- [Pump.fun](https://pump.fun) - Token Launches

---

<div align="center">

**Made with ❤️ by the LIZA team**

[GitHub](https://github.com/liza-elizaos/Liza-DeX-Agent) • [Docs](./COMPLETE_IMPLEMENTATION_GUIDE.md) • [Twitter](https://twitter.com/elizaos)

⭐ If you find this helpful, please give us a star! ⭐

</div>
