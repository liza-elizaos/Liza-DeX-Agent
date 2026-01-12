# 🤖 LIZA - Autonomous Solana AI Assistant for elizaOS

> **First Decentralized AI Agent for Solana & Jeju Network Token/Wallet Management & Trading**

<div align="center">

![GitHub](https://img.shields.io/badge/GitHub-liza--elizaos-181717?style=flat-square&logo=github) ![License](https://img.shields.io/badge/License-MIT-green?style=flat-square) ![Status](https://img.shields.io/badge/Status-Active%20Development-FF6B35?style=flat-square) ![ElizaOS](https://img.shields.io/badge/ElizaOS-v1.7.0-purple?style=flat-square&logo=openai) ![Solana](https://img.shields.io/badge/Solana-Web3.js-14F195?style=flat-square&logo=solana) ![Jeju](https://img.shields.io/badge/Jeju%20Network-Ready-0066FF?style=flat-square) ![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?style=flat-square&logo=typescript)

</div>

<div align="center">

### 🔗 **Quick Links**

[![Twitter - Liza](https://img.shields.io/badge/Twitter-@Liza__ElizaOS-1DA1F2?style=flat-square&logo=x)](https://x.com/Liza_ElizaOS) 
[![Twitter - Dev](https://img.shields.io/badge/Twitter-@0xblockXBT-1DA1F2?style=flat-square&logo=x)](https://x.com/0xblockXBT)
[![Website](https://img.shields.io/badge/Website-liza--dexagent.xyz-FF6B00?style=flat-square&logo=world)](https://www.liza-dexagent.xyz/)
[![Discord](https://img.shields.io/badge/Discord-Community-5865F2?style=flat-square&logo=discord)](https://discord.gg/elizaos)

</div>

---

**LIZA** is a production-ready autonomous AI agent that seamlessly integrates with the [ElizaOS](https://github.com/elizaos/eliza) framework to provide comprehensive blockchain capabilities for **Solana** and **Jeju Network**. Features include token launches, real-time trading, portfolio management, creator reward automation, and advanced AI-driven decision making.

### 🚀 **Currently Active Development**
This project is under **active development** with continuous improvements and new features being added with each release. Regular updates are published to the repository with enhanced functionality, bug fixes, and community-requested features.

---

## 📊 Development Status & Release Cycle

| Status | Details |
|--------|---------|
| **Current Version** | v0.1.x (Beta) |
| **Development** | 🟢 Active |
| **Update Frequency** | Weekly commits, bi-weekly releases |
| **Next Release** | v0.2.0 - Jeju Network Support (Q1 2026) |
| **Stability** | Production-ready for Solana, Beta for Jeju |
| **Last Update** | January 13, 2026 |
| **Issue Response** | 24-48 hours |
| **Community** | Growing, contributions welcome |

### **Release Schedule**
- **Weekly Development Builds** - Bug fixes and minor improvements
- **Bi-Weekly Releases** - New features and enhancements
- **Major Releases (Quarterly)** - Significant new functionality
- **Security Patches (As needed)** - Critical fixes deployed immediately

We maintain a transparent roadmap and actively involve the community in feature prioritization.

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

### **Supported Blockchains**
- **Solana** - Primary deployment with full mainnet support
- **Jeju Network** - Next-generation blockchain for scalable DeFi operations

### **Core Technologies**

| Component | Technology | Version |
|-----------|-----------|---------|
| **Framework** | [ElizaOS](https://github.com/elizaos/eliza) | v1.7.0 |
| **Blockchain** | [Solana Web3.js](https://solana-labs.github.io/solana-web3.js/) | v1.98.4+ |
| **Jeju Network** | [Jeju RPC](https://jejunetwork.io) | Latest |
| **Token Standard** | [SPL Token](https://spl.solana.com/token) / Jeju Native | v0.4.14+ |
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
# ===== SOLANA CONFIGURATION =====
# Solana RPC (use mainnet-beta for production)
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
# Or use Helius for faster speeds
HELIUS_RPC_URL=https://mainnet.helius-rpc.com/?api-key=YOUR_KEY

# Your Solana wallet (base58 encoded private key)
SOLANA_PRIVATE_KEY=your_base58_private_key_here

# Your wallet public address
SOLANA_PUBLIC_KEY=your_solana_wallet_address

# ===== JEJU NETWORK CONFIGURATION =====
# Jeju Network RPC endpoint
JEJU_RPC_URL=https://rpc.jejunetwork.io
JEJU_CHAIN_ID=8217
JEJU_PRIVATE_KEY=your_jeju_private_key_here
JEJU_PUBLIC_KEY=your_jeju_wallet_address

# ===== API CONFIGURATION =====
API_BASE_URL=http://localhost:3001
NODE_ENV=development
PORT=3001

# ===== OPTIONAL: BAGS FM API =====
BAGS_FM_API_KEY=your_api_key_here

# ===== NETWORK SELECTION =====
# Choose: 'solana' | 'jeju' | 'both'
ACTIVE_NETWORKS=both
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

## 🌐 Jeju Network Integration

LIZA provides comprehensive support for **Jeju Network**, a next-generation blockchain platform designed for scalable and efficient DeFi operations. 

### **Why Jeju Network?**
- **Lower Fees:** Significantly reduced transaction costs compared to traditional blockchains
- **Higher Speed:** Fast block times for near-instant transactions
- **Scalability:** Built for high-throughput DeFi applications
- **EVM Compatible:** Easy integration with Ethereum ecosystem tools
- **Growing Ecosystem:** Rapidly expanding list of dApps and protocols

### **Jeju Network Features in LIZA**
- ✅ Token creation on Jeju Network
- ✅ Automated token launches
- ✅ Real-time portfolio tracking across Jeju assets
- ✅ Cross-chain token swaps (Solana ↔ Jeju)
- ✅ Creator rewards distribution
- ✅ AI-powered trading strategies
- 🔄 Multi-chain analytics (coming soon)

### **Get Started with Jeju Network**

```env
# Configure Jeju Network in .env.local
JEJU_RPC_URL=https://rpc.jejunetwork.io
JEJU_CHAIN_ID=8217
JEJU_PRIVATE_KEY=your_key_here
JEJU_PUBLIC_KEY=your_address_here
ACTIVE_NETWORKS=both  # Use 'jeju', 'solana', or 'both'
```

**Jeju Network Resources:**
- [Jeju Network Official](https://jejunetwork.io)
- [Jeju Network Docs](https://docs.jejunetwork.io)
- [Jeju Network Explorer](https://explorer.jejunetwork.io)
- [Jeju Network Discord](https://discord.gg/jejunetwork)

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

## 🆘 Support & Community

### **Official Channels**
- **Website:** [liza-dexagent.xyz](https://www.liza-dexagent.xyz/)
- **Twitter - LIZA:** [@Liza_ElizaOS](https://x.com/Liza_ElizaOS)
- **Twitter - Lead:** [@0xblockXBT](https://x.com/0xblockXBT)
- **Discord:** [ElizaOS Community](https://discord.gg/elizaos)

### **Development & Issues**
- **GitHub Issues:** [Report bugs](https://github.com/liza-elizaos/Liza-DeX-Agent/issues)
- **GitHub Discussions:** [Ask questions](https://github.com/liza-elizaos/Liza-DeX-Agent/discussions)
- **Solana Discord:** [Developer community](https://discord.gg/solana)

### **Response Time**
- **Critical Issues:** 4-6 hours
- **Bug Reports:** 24-48 hours
- **Feature Requests:** Reviewed within 1 week

---

## 🗺️ Roadmap

### **Current Version (v0.1.x) - Active Development**
- ✅ Solana mainnet support
- ✅ Token creation and launches
- ✅ Jupiter Protocol integration
- ✅ Portfolio management
- ✅ Creator rewards system
- ✅ ElizaOS AI framework integration
- 🔄 Jeju Network integration (in progress)

### **Upcoming Releases**

**v0.2.0** - Jeju Network Launch (Q1 2026)
- [ ] Full Jeju Network support
- [ ] Cross-chain token management
- [ ] Enhanced AI trading strategies
- [ ] Advanced portfolio rebalancing
- [ ] Multi-chain wallet aggregation

**v0.3.0** - Advanced Features (Q2 2026)
- [ ] Multi-chain support (Ethereum, Base, Arbitrum)
- [ ] Advanced risk assessment
- [ ] Automated market-making strategies
- [ ] Real-time sentiment analysis
- [ ] Enhanced UI/UX improvements

**v0.4.0** - Scaling & Optimization (Q3 2026)
- [ ] Performance optimization
- [ ] Enhanced security audits
- [ ] Advanced portfolio rebalancing
- [ ] Institutional-grade features
- [ ] API rate limiting improvements

**v0.5.0** - Mobile & Social (Q4 2026)
- [ ] Native mobile app (iOS/Android)
- [ ] Social trading features
- [ ] Community governance
- [ ] Advanced Discord/Telegram integration
- [ ] Mobile wallet support

**v1.0.0** - Production Release (Q1 2027)
- [ ] Full production stability
- [ ] Enterprise features
- [ ] Advanced analytics dashboard
- [ ] Institutional partnerships
- [ ] Mainnet stability certification

### **Community-Requested Features**
We actively monitor GitHub Issues and Discussions for feature requests. Popular community requests include:
- Multi-signature wallet support
- NFT portfolio tracking
- Advanced tax reporting
- Yield farming optimization
- Community governance tokens

---

## 🙏 Built With

- [ElizaOS](https://github.com/elizaos/eliza) - AI Framework
- [Solana](https://solana.com) - Blockchain
- [Jeju Network](https://jejunetwork.io) - Next-Gen Blockchain
- [Jupiter](https://jup.ag) - DEX Aggregation
- [Pump.fun](https://pump.fun) - Token Launches

---

<div align="center">

**Made with ❤️ by the LIZA team**

### 🌐 **Official Links**
[🌍 Website](https://www.liza-dexagent.xyz/) • [🐦 Twitter/LIZA](https://x.com/Liza_ElizaOS) • [🐦 Twitter/0xblockXBT](https://x.com/0xblockXBT) • [💬 Discord](https://discord.gg/elizaos) • [📖 Docs](./COMPLETE_IMPLEMENTATION_GUIDE.md)

### 📱 **Community Channels**
[GitHub Issues](https://github.com/liza-elizaos/Liza-DeX-Agent/issues) • [GitHub Discussions](https://github.com/liza-elizaos/Liza-DeX-Agent/discussions) • [ElizaOS Discord](https://discord.gg/elizaos) • [Solana Discord](https://discord.gg/solana)

---

### 💡 **Support & Partnership**
For enterprise support, partnerships, or custom integrations, visit [liza-dexagent.xyz](https://www.liza-dexagent.xyz/) or reach out on Twitter.

---

⭐ **If you find this helpful, please give us a star!** ⭐

</div>
