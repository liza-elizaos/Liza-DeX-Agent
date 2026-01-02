# Quick Deployment Checklist

## Pre-Deployment Checklist

- [ ] Project builds successfully: `npm run build`
- [ ] No errors in console
- [ ] `.env` file is NOT committed to Git (check `.gitignore`)
- [ ] All dependencies are listed in `package.json`
- [ ] `vercel.json` is properly configured
- [ ] GitHub repository is created and code is pushed

## Deployment Steps (5 minutes)

### 1. Login to Vercel
```bash
npm i -g vercel
vercel login
```

### 2. Connect GitHub Repository
- Go to https://vercel.com/new
- Select "Import Git Repository"
- Choose your GitHub repo
- Click "Import"

### 3. Configure Environment Variables
In Vercel Dashboard → Settings → Environment Variables, add:

```
SOLANA_NETWORK=mainnet
SOLANA_PUBLIC_KEY=CMVrzdso4SShQm2irrc7jMCN9Vw5QxXvrZKB79cYPPJT
SOLANA_PRIVATE_KEY=[Your key]
SOLANA_RPC_URL=[Your RPC URL]
JUPITER_API_KEY=cd72422b-136c-4951-a00f-9fb904e14acf
JUPITER_API_URL=https://api.jup.ag/swap/v1/quote
```

### 4. Deploy
Click "Deploy" and wait 2-3 minutes.

### 5. Get Your URL
After deployment, your API is at:
```
https://[project-name].vercel.app
```

## Test Your Deployment

### Test Balance API
```bash
curl https://[project-name].vercel.app/api/balance
```

### Test Swap API
```bash
curl -X POST https://[project-name].vercel.app/api/swap \
  -H "Content-Type: application/json" \
  -d '{"fromToken":"SOL","toToken":"BONK","amount":0.1}'
```

## Connect to v0.dev

1. Get your Vercel URL from step 5
2. In your v0.dev `.env.local`:
   ```
   NEXT_PUBLIC_API_URL=https://[project-name].vercel.app
   ```
3. Import the React components from `V0_DEV_INTEGRATION.md`
4. Done! 🎉

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Build fails | Check build logs in Vercel dashboard |
| API returns 500 | Check env variables are set in Vercel |
| Timeout errors | Increase function timeout in `vercel.json` |
| CORS errors | Already configured in API files |

## Important Security Notes

⚠️ **NEVER:**
- Commit `.env` to GitHub
- Share private keys publicly
- Use the same key in multiple projects

✅ **DO:**
- Store secrets only in Vercel dashboard
- Rotate keys regularly
- Use dedicated wallet for bot
- Monitor transaction history

## Monitoring Your Deployment

1. Vercel Dashboard → Deployments
2. View logs in real-time
3. Check function duration and errors
4. Monitor costs (free tier includes generous limits)

## Scale Your Deployment

As you grow:

1. **Upgrade Vercel Plan** - Get more function resources
2. **Database** - Add PostgreSQL for persistent storage
3. **Caching** - Implement Redis for faster responses
4. **Monitoring** - Set up error tracking with Sentry
5. **Analytics** - Track swap volumes and success rates

## Quick Commands

```bash
# Deploy directly from CLI
vercel --prod

# Deploy with environment variables
vercel --prod --env-file=.env

# Preview deployment (non-production)
vercel

# View deployment logs
vercel logs --follow

# List all deployments
vercel list

# Delete a deployment
vercel remove [deployment-url]
```

---

**Happy Deploying!** 🚀

For detailed guides, see:
- [VERCEL_DEPLOYMENT_GUIDE.md](./VERCEL_DEPLOYMENT_GUIDE.md)
- [V0_DEV_INTEGRATION.md](./V0_DEV_INTEGRATION.md)
