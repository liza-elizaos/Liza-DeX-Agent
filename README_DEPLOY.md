# 🚀 SHINA - Solana AI Assistant

## Vercel पर Deploy करें

### तुरंत Deploy (3 Steps)

#### Step 1: Vercel CLI Install करें
```bash
npm i -g vercel
```

#### Step 2: Login करें और Deploy करें
```bash
vercel login
vercel
```

#### Step 3: Environment Variables Set करें

**Vercel Dashboard** में जाएं:
1. Your Project → Settings → Environment Variables
2. ये variables add करें:

```
SOLANA_RPC_URL = https://api.mainnet-beta.solana.com
SOLANA_NETWORK = mainnet
JUPITER_API_URL = https://api.jup.ag/swap/v1/quote
JUPITER_API_KEY = cd72422b-136c-4951-a00f-9fb904e14acf
```

**Optional** (server-side swaps के लिए):
```
SOLANA_PUBLIC_KEY = your_wallet_address
SOLANA_PRIVATE_KEY = your_private_key_base58
```

#### Step 4: Production Deploy
```bash
vercel --prod
```

## ✅ Deploy के बाद

आपकी app live होगी:
```
https://your-project-name.vercel.app
```

## 🧪 Test करें

1. **URL खोलें** browser में
2. **Phantom Wallet Connect करें** - "Connect Phantom Wallet" button click करें
3. **Swap Test करें** - Type करें: `swap 1 SOL for USDC`
4. **Balance Check करें** - Type करें: `check my balance`

## 🎯 Quick Features

- 💰 **Balance Check** - Wallet balance देखें
- 🔀 **Token Swap** - SOL को USDC/USDT में swap करें
- 📊 **Portfolio** - अपने tokens देखें
- 🛡️ **Security** - Safe और secure swaps

## 🎨 UI Features

✅ Modern और User-Friendly Design
✅ Quick Action Buttons
✅ Real-time Updates
✅ Wallet Integration
✅ Responsive Design

## 📱 Commands

```
swap 1 SOL for USDC        - Swap tokens
check my balance           - Check wallet balance
buy 100 BONK from SOL     - Buy tokens
help                       - Show help
```

## 🐛 Problem हो तो?

**Build Fail हो रहा है?**
- Node.js version check करें (18+)
- Dependencies install करें: `npm install`
- Vercel build logs check करें

**API काम नहीं कर रहा?**
- Environment variables check करें
- Vercel में API logs देखें
- `/api` folder exists check करें

**Frontend load नहीं हो रहा?**
- `dist/frontend` folder check करें
- Browser console में errors देखें
- `vercel.json` configuration verify करें

## 🔗 Links

- **Vercel Dashboard**: https://vercel.com/dashboard
- **Project Settings**: https://vercel.com/your-project/settings
- **Environment Variables**: https://vercel.com/your-project/settings/environment-variables

---

**Made with ❤️ for Solana DeFi Community**

