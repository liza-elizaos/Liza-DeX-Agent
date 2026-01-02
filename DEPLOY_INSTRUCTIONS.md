# 🚀 SHINA - Vercel Deployment Instructions

## Quick Deploy (3 Steps)

### Step 1: Install Vercel CLI
```bash
npm i -g vercel
```

### Step 2: Login & Deploy
```bash
vercel login
vercel
```

### Step 3: Set Environment Variables

Go to: **Vercel Dashboard → Your Project → Settings → Environment Variables**

Add these variables:
```
SOLANA_RPC_URL = https://api.mainnet-beta.solana.com
SOLANA_NETWORK = mainnet
JUPITER_API_URL = https://api.jup.ag/swap/v1/quote
JUPITER_API_KEY = cd72422b-136c-4951-a00f-9fb904e14acf
```

**Optional** (for server-side swaps):
```
SOLANA_PUBLIC_KEY = your_wallet_address
SOLANA_PRIVATE_KEY = your_private_key_base58
```

### Step 4: Redeploy
```bash
vercel --prod
```

## ✅ After Deployment

Your app will be live at:
```
https://your-project-name.vercel.app
```

## 🧪 Test Your Deployment

1. **Open the URL** in your browser
2. **Connect Phantom Wallet** - Click the "Connect Phantom Wallet" button
3. **Test Swap** - Type: `swap 1 SOL for USDC`
4. **Check Balance** - Type: `check my balance`

## 🎯 Quick Action Buttons

After connecting wallet, you'll see:
- 💰 **Balance** - Check wallet balance
- 🔀 **Swap SOL→USDC** - Quick swap
- 🔀 **Swap SOL→USDT** - Quick swap
- ❓ **Help** - Show help

## 📱 Features

✅ Wallet Connection (Phantom)
✅ Token Swaps (Jupiter Aggregator)
✅ Balance Checking
✅ Quick Actions
✅ User-Friendly UI
✅ Real-time Updates

## 🐛 Troubleshooting

**Build Fails?**
- Check Node.js version (18+)
- Verify all dependencies installed
- Check Vercel build logs

**API Not Working?**
- Verify environment variables set
- Check API route logs in Vercel
- Ensure `/api` folder exists

**Frontend Not Loading?**
- Check `dist/frontend` exists after build
- Verify `vercel.json` configuration
- Check browser console for errors

## 📞 Support

If you face any issues:
1. Check Vercel deployment logs
2. Verify environment variables
3. Test API endpoints directly
4. Check browser console for errors

---

**Made with ❤️ for Solana DeFi**

