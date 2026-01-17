# LIZA - Solana AI Trading Assistant

## Overview

LIZA is a powerful AI-driven trading assistant for Solana blockchain. It combines natural language processing with real-time blockchain integration to provide seamless trading, portfolio management, and token launching capabilities.

**Live Demo**: https://shina-ten.vercel.app

## Key Features

### 💬 AI-Powered Chat Interface
- Natural language commands for trading operations
- Context-aware conversations with wallet integration
- Multi-turn dialogue support with session management

### 💰 Wallet Integration
- Connect Phantom wallet directly
- Check real-time SOL balance
- View complete token portfolio

### 🔄 DEX Trading (Jupiter)
- Real-time token swap quotes
- One-click execution with Phantom
- Support for 6 major tokens (SOL, USDC, USDT, mSOL, BONK, JUP)
- Configurable slippage settings

### 🚀 Token Launch (Pump.fun)
- Create and launch new tokens
- Configure token parameters
- Get instant explorer links

### 📊 Portfolio Analytics
- View all token holdings
- Real-time balance updates
- Consolidated portfolio view

## Tech Stack

### Blockchain
- **Solana** - Layer 1 blockchain
- **Helius RPC** - Primary RPC endpoint with API key
- **Jupiter DEX** - Token swapping
- **Pump.fun SDK** - Token creation

### Backend
- **Next.js** - React framework
- **TypeScript** - Type-safe code
- **Vercel** - Production hosting
- **@solana/web3.js** - Solana integration

### AI/LLM
- **OpenRouter** - Multi-model AI support
- **Anthropic Claude** - Alternative model
- **Meta Llama** - Default model

## Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Solana CLI (for wallet generation)
- Phantom Wallet browser extension

### Installation

```bash
# Clone and install
git clone <repo-url>
cd Liza
npm install

# Copy and fill environment file
cp .env.example .env.local

# Add your credentials:
# - SOLANA_PRIVATE_KEY (from solana-keygen)
# - SOLANA_PUBLIC_KEY (your wallet address)
# - OPENROUTER_API_KEY (from openrouter.ai)

# Start development server
npm run dev
# Visit http://localhost:3000
```

### Deploy to Production

```bash
# Build TypeScript
npm run build

# Deploy to Vercel
vercel --prod
```

## API Endpoints

### Chat
**POST** `/api/chat`
- Conversation with AI assistant
- Wallet-aware commands

### Balance
**GET** `/api/balance?wallet=ADDRESS`
- Check wallet balance in SOL

### Portfolio
**GET** `/api/portfolio?wallet=ADDRESS`
- View token holdings

### Swap
**GET** `/api/swap?inputMint=MINT&outputMint=MINT&amount=AMOUNT`
- Get swap quotes from Jupiter

### Execute Swap
**POST** `/api/execute-swap`
- Build and sign swap transactions

### Launch Token
**POST** `/api/launch`
- Create new token on Pump.fun

## Environment Variables

### Required
```env
SOLANA_RPC_URL=https://mainnet.helius-rpc.com/?api-key=YOUR_KEY
SOLANA_PUBLIC_KEY=YOUR_WALLET_ADDRESS
SOLANA_PRIVATE_KEY=YOUR_BASE58_KEY

OPENROUTER_API_KEY=sk-or-v1-YOUR_KEY
```

### Pre-Configured
```env
JUPITER_API_KEY=458e0881-9e19-45f7-a555-4f12192b8098
JUPITER_QUOTE_API=https://api.jup.ag/quote
PUMP_FUN_PROGRAM=6EF8rZkuitQVLNtnYoMTRUY56DJRNm5DQFFLqJEd9QJ
```

## Configuration

### RPC Endpoints
- **Primary**: Helius RPC with dedicated API key
- **Fallback**: Standard Solana mainnet-beta RPC
- **Auto-failover**: Automatic fallback if primary fails

### Transaction Settings
- **Slippage**: 50 basis points (0.5%)
- **Gas Price**: 5000 lamports
- **Retries**: 5 attempts

### Token Mints
- SOL: `So11111111111111111111111111111111111111112`
- USDC: `EPjFWaLb3crJC2z8rxVmE4Gnjg1d4PjNiYq4a8JqkEH`
- USDT: `Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BcJkxN`
- mSOL: `mSoLzYCxHdgfd3DgZjwwzG8DUR6azJstEWQcW2UCb9`
- BONK: `DezXAZ8z7PnrnRJjoBXwYaKe2XTis3Zonw1j1axNac5`
- JUP: `JUPyiwrYJFskUPiHa7hkeR8JwF3ttBKqrySAv4S3daM`

## Usage Examples

### Check Balance
```bash
curl "https://shina-ten.vercel.app/api/balance?wallet=9x1y2z3a4b..."
```

### Get Swap Quote
```bash
curl "https://shina-ten.vercel.app/api/swap?inputMint=So11...&outputMint=EPj...&amount=1000000000"
```

### Chat with AI
```bash
curl -X POST "https://shina-ten.vercel.app/api/chat" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "what is my balance?",
    "sessionId": "user123"
  }'
```

## Security

✅ Private keys stored only in `.env.local`  
✅ API keys secured in environment variables  
✅ Rate limiting enabled (100 req/15 min)  
✅ CORS properly configured  
✅ Transaction signing with Phantom wallet  
✅ No sensitive data in logs  

**Best Practices**:
- Never commit `.env.local` to git
- Rotate API keys regularly
- Monitor transaction activity
- Test on devnet first

## Support

- **Documentation**: See `/docs` folder
- **GitHub Issues**: Report bugs and features
- **External Docs**:
  - [Solana Docs](https://docs.solana.com)
  - [Jupiter API](https://station.jup.ag/docs)
  - [Pump.fun SDK](https://docs.pump.fun)

## License

MIT License - see LICENSE file for details

## Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

---

**Questions?** Check the [Architecture](./architecture.md) or [Roadmap](./roadmap.md) docs.
