# 🚀 ELIZAOS + SOLANA SWAP - VERCEL DEPLOYMENT GUIDE

**Status:** ✅ Ready for Production Deployment

---

## 📋 What's Included

Your elizaOS agent now has complete Solana swap functionality:

✅ Natural language token swapping
✅ Support for token names (SOL, USDC, WSOL)
✅ Support for mint addresses (43-44 chars)
✅ Pump token support
✅ Balance checking
✅ Real-time transaction execution

---

## 🔧 Setup Instructions

### Step 1: Copy Files to Your elizaOS Project

```bash
# Copy the plugin
cp src/plugins/solana-swap-elizaos.ts <your-elizaos>/src/plugins/

# Copy character config
cp ELIZAOS_CHARACTER_CONFIG.ts <your-elizaos>/character.config.ts
```

### Step 2: Update .env File

```env
# Solana Configuration
SOLANA_PUBLIC_KEY=CMVrzdso4SShQm2irrc7jMCN9Vw5QxXvrZKB79cYPPJT
SOLANA_PRIVATE_KEY=42ALEQhrLMzsWXhNZDtRCjALJwS61MpfcJHBopGycsaN...
SOLANA_RPC_URL=https://solana-mainnet.g.alchemy.com/v2/YOUR_KEY
JUPITER_API_KEY=your-jupiter-api-key

# elizaOS Configuration
MODEL_PROVIDER=anthropic
ANTHROPIC_API_KEY=your-anthropic-key
```

### Step 3: Install Dependencies

```bash
cd your-elizaos-project
npm install @solana/web3.js bs58 @elizaos/core
```

### Step 4: Register Plugin in elizaOS

In your main agent initialization file:

```typescript
import solanaSwapPlugin from './src/plugins/solana-swap-elizaos.ts';

const agent = new Agent({
  character: characterConfig,
  plugins: [
    // ... other plugins
    solanaSwapPlugin,
  ],
});
```

---

## 🎯 Using the Swap Commands

### Natural Language Examples

```
User: "swap 0.1 USDC for SOL"
Agent: ✅ Swapped 0.1 USDC for 0.000784 WSOL
       TX: https://solscan.io/tx/...

User: "buy 0.001 HdZh from Sol"
Agent: ✅ Bought 1023.662891 HdZh tokens with 0.001 SOL
       TX: https://solscan.io/tx/...

User: "how much USDC do I have?"
Agent: 💰 You have 0.128522 USDC

User: "sell 0.1 USDC for SOL"
Agent: ✅ Swapped 0.1 USDC for 0.000784 SOL
       TX: https://solscan.io/tx/...
```

---

## 🌐 Vercel Deployment
- Output directory set to `dist`
- API functions with 60 second timeout
- Environment variables reference

## Step 2: Push to GitHub

### Step 1: Push to GitHub

```bash
git add .
git commit -m "Add Solana swap plugin"
git push origin main
```

### Step 2: Connect to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Click "Import Git Repository"
4. Select your elizaOS GitHub repository
5. Click "Import"

### Step 3: Add Environment Variables

In Vercel dashboard Settings → Environment Variables, add:

```
SOLANA_PUBLIC_KEY=CMVrzdso4SShQm2irrc7jMCN9Vw5QxXvrZKB79cYPPJT
SOLANA_PRIVATE_KEY=42ALEQhrLMzsWXhNZDtRCjALJwS61MpfcJHBopGycsaN...
SOLANA_RPC_URL=https://solana-mainnet.g.alchemy.com/v2/YOUR_KEY
JUPITER_API_KEY=your-jupiter-api-key
ANTHROPIC_API_KEY=your-anthropic-key
```

### Step 4: Deploy

1. Click "Deploy"
2. Wait 2-3 minutes for build
3. Your elizaOS agent is now live! 🎉

Your live URL: `https://your-project.vercel.app`

---

## 💬 Example Conversations

Your deployed agent responds naturally:

```
User: "I want to swap USDC to SOL"
Agent: I'll help you swap USDC to SOL. How much USDC would you like to swap?

User: "0.1 USDC"
Agent: ✅ Swapped 0.1 USDC for 0.000784 SOL
       Transaction: https://solscan.io/tx/...
       Confirmed on mainnet!

User: "Show me my balance"
Agent: 💰 Your wallet balance:
       - SOL: 0.022
       - USDC: 0.128522

User: "Buy HdZh tokens with SOL"
Agent: Which HdZh token? Please provide the mint address or I can try the popular one.

User: "The pump token HdZh1mUvCVJzHfTFaJJxZJFENhiFAkyiXLA5iZZTpump"
Agent: ✅ Bought 1023.662891 HdZh tokens with 0.001 SOL
       Transaction: https://solscan.io/tx/...
```

---

## ✨ Features on Vercel

✅ **Always On** - Your agent runs 24/7
✅ **Scalable** - Auto-scales with traffic
✅ **Secure** - Environment variables encrypted
✅ **Fast** - Global CDN
✅ **Real Transactions** - Mainnet execution
✅ **User Friendly** - Natural language commands

---

## 🔒 Security Checklist

- [x] Private keys in environment variables only
- [x] .env file in .gitignore
- [x] Never commit secrets to GitHub
- [x] Rotate keys every 90 days
- [x] Use strong RPC endpoint
- [x] Monitor wallet on Solscan
- [x] Test on devnet first (optional)
- [x] Validate all transactions

---

## 📊 Monitoring Your Agent

### Check Logs
```bash
vercel logs your-project
```

### Monitor Transactions
Visit Solscan: `https://solscan.io/account/CMVrzdso4...`

### Check Wallet Balance
```bash
# Via API
curl https://your-project.vercel.app/api/balance

# Response
{
  "sol": 0.022,
  "usdc": 0.128522
}
```

---

## 🚀 That's It!
| `JUPITER_API_KEY` | Jupiter API key | From your account |
| `JUPITER_API_URL` | Jupiter API endpoint | `https://api.jup.ag/swap/v1/quote` |

## Step 6: Monitoring & Debugging

### View Logs
1. Go to your Vercel project dashboard
2. Click "Deployments"
3. Click on the latest deployment
4. View logs in real-time

### Common Issues

**Build fails:**
- Check if all dependencies are installed
- Verify Node.js version compatibility
- Check `.env` variables are set

**API timeouts:**
- Vercel serverless functions timeout after 60s
- Consider using background jobs for long operations

**Memory issues:**
- Increase function memory in `vercel.json`
- Optimize your code

## Step 7: Custom Domain (Optional)

1. In Vercel dashboard, go to "Settings" → "Domains"
2. Add your custom domain
3. Update DNS records as shown by Vercel
4. Wait for DNS propagation (5-30 minutes)

## Step 8: Enable Preview URLs

By default, Vercel creates preview URLs for pull requests. You can test changes before merging:
- Every PR gets a unique preview URL
- Share with team members
- Test integrations with v0.dev before production

## Troubleshooting

### Issue: "npm: command not found"
**Solution:** Add Node.js to your build environment or use Bun runtime.

### Issue: Deployment times out
**Solution:** Optimize your build process or increase function timeout in `vercel.json`.

### Issue: Environment variables not working
**Solution:** 
- Verify they're added in Vercel dashboard
- Redeploy after adding variables
- Check variable names match exactly

## Next Steps

1. ✅ Deploy to Vercel
2. ✅ Test API endpoints
3. ✅ Connect to v0.dev
4. ✅ Set up monitoring
5. ✅ Configure custom domain
6. ✅ Set up CI/CD workflows

## Support Resources

- [Vercel Documentation](https://vercel.com/docs)
- [ElizaOS Documentation](https://docs.elizaos.ai)
- [Solana RPC Guide](https://docs.solana.com/rpc)
- [Jupiter API Docs](https://docs.jup.ag)

---

For questions or issues, check the logs in your Vercel dashboard or contact Vercel support.
