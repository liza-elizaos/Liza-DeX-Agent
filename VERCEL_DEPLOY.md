# Vercel Deployment Guide for SHINA

## 🚀 Quick Deploy to Vercel

### Step 1: Install Vercel CLI (if not installed)
```bash
npm i -g vercel
```

### Step 2: Login to Vercel
```bash
vercel login
```

### Step 3: Deploy
```bash
vercel
```

Follow the prompts:
- Set up and deploy? **Yes**
- Which scope? **Your account**
- Link to existing project? **No** (first time) or **Yes** (if redeploying)
- Project name? **shina** (or your preferred name)
- Directory? **./** (current directory)
- Override settings? **No**

### Step 4: Set Environment Variables

Go to your Vercel project dashboard → Settings → Environment Variables and add:

#### Required Variables:
```
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
SOLANA_NETWORK=mainnet
JUPITER_API_URL=https://api.jup.ag/swap/v1/quote
JUPITER_API_KEY=cd72422b-136c-4951-a00f-9fb904e14acf
```

#### Optional (for server-side swaps):
```
SOLANA_PUBLIC_KEY=your_wallet_address
SOLANA_PRIVATE_KEY=your_private_key_base58
```

⚠️ **Note**: For production, it's recommended to use wallet-based signing (Phantom wallet) instead of server-side private keys.

### Step 5: Redeploy
After setting environment variables, redeploy:
```bash
vercel --prod
```

## 📋 Build Configuration

The project is configured with:
- **Build Command**: `npm run build`
- **Output Directory**: `dist/frontend`
- **Framework**: Vite + React
- **Runtime**: Node.js 18+ (for API routes)

## 🔧 API Routes

All API routes are in the `/api` folder:
- `/api/chat` - Main chat endpoint
- `/api/balance` - Wallet balance check
- `/api/swap` - Token swap execution
- `/api/wallet-connect` - Wallet connection

## 🌐 Production URL

After deployment, you'll get a URL like:
```
https://your-project-name.vercel.app
```

## 🧪 Testing

1. **Connect Wallet**: Click "Connect Phantom Wallet" button
2. **Check Balance**: Type "check my balance" or click "💰 Balance" button
3. **Swap Tokens**: Type "swap 1 SOL for USDC" or use quick action buttons
4. **Get Help**: Type "help" for available commands

## 🐛 Troubleshooting

### Build Fails
- Check Node.js version (should be 18+)
- Ensure all dependencies are in `package.json`
- Check build logs in Vercel dashboard

### API Not Working
- Verify environment variables are set
- Check API route logs in Vercel dashboard
- Ensure API routes are in `/api` folder

### Frontend Not Loading
- Check `outputDirectory` in `vercel.json`
- Verify build completed successfully
- Check browser console for errors

## 📝 Notes

- The app uses relative API paths in production (`/api/chat`)
- Localhost is used automatically in development
- Wallet connection requires Phantom extension
- All swaps require wallet signature (or server-side key if configured)

## 🔗 Quick Links

- Vercel Dashboard: https://vercel.com/dashboard
- Project Settings: https://vercel.com/your-project/settings
- Environment Variables: https://vercel.com/your-project/settings/environment-variables

