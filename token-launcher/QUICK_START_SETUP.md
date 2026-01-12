# 🚀 PUMP.FUN + CLAUDE'S PROTOCOL - SETUP & LAUNCH GUIDE

## Quick Start (5 minutes)

### 1. Install Dependencies
```bash
cd d:\shina\token-launcher
npm install @pump-fun/pump-sdk @pump-fun/pump-swap-sdk @solana/web3.js bs58 dotenv
```

### 2. Create .env File

Create `d:\shina\token-launcher\.env`:

```env
# SOLANA NETWORK
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com

# WALLET - Get this from your wallet export
SOLANA_PRIVATE_KEY=your_base58_private_key_here

# TOKEN DETAILS
TOKEN_NAME=My Amazing Token
TOKEN_SYMBOL=MAT
TOKEN_DESCRIPTION=The best token on Solana
INITIAL_LIQUIDITY=0.5

# OPTIONAL
DEMO_RUNTIME_SECONDS=60
```

### 3. Get Your Private Key

**Option A: Export from Phantom Wallet**
1. Open Phantom wallet
2. Settings → Security & Privacy → Show private key
3. Copy the base58-encoded key
4. Paste into `.env` as `SOLANA_PRIVATE_KEY`

**Option B: Use Solana CLI**
```bash
# Generate new keypair
solana-keygen new -o my-wallet.json

# View private key (base58)
solana-keygen show -o my-wallet.json --pubkey
```

### 4. Fund Your Wallet

You need SOL for transaction fees:

- **Devnet**: Use faucet (free) - https://faucet.solana.com
- **Mainnet**: Buy from exchange (~$50 = 2.5 SOL)

### 5. Launch!

**Test on Devnet (Safe):**
```bash
export SOLANA_RPC_URL=https://api.devnet.solana.com
bun test-pumpfun-claude.ts
```

**Launch on Mainnet (Real tokens!):**
```bash
bun test-pumpfun-claude.ts
```

---

## 📋 What Each File Does

### `test-pumpfun-claude.ts`
**Full integration with market making**
- Creates real token via Pump.fun SDK
- Adds initial liquidity on bonding curve
- Simulates market making with buy/sell
- Executes price corrections (Claude's Protocol)
- Reports all transactions

### `quick-launch.ts`
**Simple one-command token launch**
```bash
bun quick-launch.ts --name "My Token" --symbol "MYT" --liquidity 0.5
```

### `PUMPFUN_INTEGRATION_GUIDE.md`
Complete documentation with:
- Architecture explanation
- API references
- Cost breakdown
- Troubleshooting guide
- Production checklist

---

## 🎯 Three Scenarios

### Scenario 1: Test on Devnet (RECOMMENDED FIRST)

```bash
# Set devnet RPC
export SOLANA_RPC_URL=https://api.devnet.solana.com

# Get free devnet SOL
open https://faucet.solana.com
# Paste your wallet address, claim 2 SOL

# Run test
bun test-pumpfun-claude.ts

# Check result
# https://devnet.solscan.io/token/YOUR_MINT
```

**Cost**: FREE (devnet SOL)  
**Risk**: NONE (not real money)  
**Duration**: 1-2 minutes

### Scenario 2: Real Launch with Market Making

```bash
# Make sure mainnet is set
export SOLANA_RPC_URL=https://api.mainnet-beta.solana.com

# Verify you have SOL
echo $SOLANA_PRIVATE_KEY | bun -c "
  import bs58 from 'bs58';
  const key = bs58.decode(process.stdin.toString());
  // Check balance via CLI
"

# Launch!
bun test-pumpfun-claude.ts
```

**Cost**: 0.6-0.8 SOL (~$20-30)  
**Risk**: Real money spent  
**Benefit**: Live token on Solana with price support

### Scenario 3: Simple Launch (No Market Making)

```bash
bun quick-launch.ts --name "My Token" --symbol "MYT" --liquidity 0.5
```

**Cost**: 0.6 SOL (~$20)  
**Result**: Token created, bonding curve active  
**Manual**: Can trade manually after

---

## 💰 Cost Breakdown

| Component | Cost | Notes |
|-----------|------|-------|
| Token Mint | 0.002 SOL | One-time |
| Metadata | 0.005 SOL | One-time |
| Initial Liquidity | 0.5 SOL | Your choice (example) |
| Transaction Fees | 0.003 SOL | ~3 buys/sells |
| **Total** | **~0.51 SOL** | ~$17 at $33/SOL |

---

## 🔐 Security Checklist

- [ ] **Never commit .env** - Add to .gitignore
- [ ] **Use new wallet** - Or test wallet only
- [ ] **Start small** - Begin with 0.1 SOL tests
- [ ] **Verify address** - Double-check before confirming
- [ ] **Save mint address** - You'll need it to trade
- [ ] **Monitor transactions** - Check Solscan after launch

---

## 🔍 Monitoring Transactions

After launching, check:

```bash
# View in Solscan
https://solscan.io/tx/YOUR_TX_HASH

# View token details
https://solscan.io/token/YOUR_MINT

# Trade on Pump.fun
https://pump.fun/YOUR_MINT
```

---

## 🛠️ Troubleshooting

### "Cannot find module '@pump-fun/pump-sdk'"
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### "Invalid wallet private key"
- Check if key is base58 encoded
- Try exporting from wallet again
- Verify no extra spaces/newlines

### "Insufficient balance"
- Fund wallet with more SOL
- Check current balance in explorer
- For devnet: use airdrop faucet

### "Transaction timeout"
- Network is congested
- Wait 30 seconds, try again
- Or use different RPC endpoint

### "Token not appearing on Pump.fun"
- Takes 60+ seconds to confirm
- Refresh browser cache
- Check Solscan for confirmation

---

## 📊 Expected Output

```
╔════════════════════════════════════════════════════════════╗
║   🚀 PUMP.FUN + CLAUDE'S PROTOCOL INTEGRATION             ║
║   Real Token Launch with Automated Market Making          ║
╚════════════════════════════════════════════════════════════╝

[PUMP.FUN] Initialized
  Wallet: CMVrz...
  RPC: https://api.mainnet-beta.solana.com

══════════════════════════════════════════════════════════════
STEP 1: CREATE TOKEN
══════════════════════════════════════════════════════════════

📋 Token Configuration:
  Name: My Amazing Token
  Symbol: MAT
  Initial Liquidity: 0.5 SOL

💰 Wallet Balance: 2.5 SOL
🚀 Launching token on Pump.fun...
✅ Token created! TX: 5DMGCunW...

══════════════════════════════════════════════════════════════
STEP 2: CHECK INITIAL PRICE
══════════════════════════════════════════════════════════════

💹 Initial Price: 0.00000050 SOL per token

═══════════════════════════════════════════════════════════════
✅ LAUNCH COMPLETE
═══════════════════════════════════════════════════════════════

📊 Token Details:
   Mint: CLAUDEo...
   Pool: P00LAd...

🔗 Links:
   Solscan: https://solscan.io/token/CLAUDE...
   Pump.fun: https://pump.fun/CLAUDE...

✨ Status: LIVE ON MAINNET
```

---

## 📚 Next Steps

### After Token Launch:

1. **Share with Community**
   - Tweet your launch
   - Post in Discord servers
   - Add to token lists

2. **Add Liquidity**
   - Use provided API to add more SOL
   - Increases token supply
   - Grows market cap

3. **Run Market Maker Continuously**
   - Deploy on VPS/server
   - Monitor 24/7
   - Collect profits from spreads

4. **Integrate with Bot**
   - Discord trading bot
   - Telegram notifications
   - Real-time monitoring

---

## 🚀 Production Deployment

To run continuously:

```bash
# Option 1: Screen session (Linux/Mac)
screen -S market-maker
bun test-pumpfun-claude.ts
# Ctrl+A then D to detach

# Option 2: PM2 (Linux/Mac)
npm install -g pm2
pm2 start quick-launch.ts --name "token-launcher"
pm2 save
pm2 startup

# Option 3: Docker (All platforms)
docker build -t token-launcher .
docker run -d --env-file .env token-launcher
```

---

## 📞 Support

- **Pump.fun Docs**: https://docs.pump.fun
- **Solana Web3**: https://solana-labs.github.io/solana-web3.js/
- **Solscan**: https://solscan.io
- **Discord**: https://discord.gg/solana

---

**Ready to launch? Start with devnet first, then go mainnet! 🚀**
