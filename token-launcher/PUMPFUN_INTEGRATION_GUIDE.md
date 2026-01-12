# 🚀 Pump.fun + Claude's Protocol Integration

**Status**: ✅ Ready for Real Blockchain Testing  
**Network**: Solana Mainnet  
**Integration**: Official Pump.fun SDK + Claude's Protocol Market Maker

---

## 📋 What This Does

Combines:
1. **Pump.fun Official SDK** - Create real tokens, provide liquidity on bonding curve
2. **Claude's Protocol** - Automatic market making to support price and quell negative action

### Workflow:
```
Token Launch → Initial Liquidity → Monitor Price → Execute Corrections
     ↓              ↓                    ↓               ↓
  Create Mint   Add to Pool         Detect Pressure   Buy to Support
   1 TX         1 TX                Real-time         Automatic
```

---

## 🔧 Installation

### 1. Install Dependencies

```bash
cd d:\shina\token-launcher

npm install @pump-fun/pump-sdk @pump-fun/pump-swap-sdk
npm install @solana/web3.js bs58 dotenv
```

### 2. Setup Environment

Create `.env`:
```bash
# Solana Network
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com

# Your Wallet (NEVER commit this!)
SOLANA_PRIVATE_KEY=your_base58_encoded_private_key

# Token Details
TOKEN_NAME=Claude Protocol Token
TOKEN_SYMBOL=CLAUDE
TOKEN_DESCRIPTION=Algorithmic market maker with automatic price support
INITIAL_LIQUIDITY=0.5
```

### 3. Get Wallet Private Key

```bash
# From existing Phantom/Solflare wallet:
# 1. Export private key from wallet
# 2. Copy the base58-encoded string
# 3. Add to .env as SOLANA_PRIVATE_KEY

# Or use Solana CLI:
solana-keygen new -o my-wallet.json
cat my-wallet.json | jq -r '.[0:32] | @base64d' | base58
```

---

## 🚀 Running the Integration

### Test on Devnet (Safe - No Real Money)

```bash
export SOLANA_RPC_URL=https://api.devnet.solana.com
bun test-pumpfun-claude.ts
```

### Run on Mainnet (Real Tokens!)

```bash
# Make sure you have SOL in your wallet first!
# Get from: https://www.coinbase.com or https://www.kraken.com

bun test-pumpfun-claude.ts
```

---

## 📊 Expected Output

```
╔════════════════════════════════════════════════════════════╗
║   🚀 PUMP.FUN + CLAUDE'S PROTOCOL INTEGRATION             ║
║   Real Token Launch with Automated Market Making          ║
╚════════════════════════════════════════════════════════════╝

[PUMP.FUN] Initialized
  Wallet: CMVrzdso4SHhQm2irrc7jMCN9Vw5QxXvrZKB79cYPPJT
  RPC: https://api.mainnet-beta.solana.com

══════════════════════════════════════════════════════════════
STEP 1: CREATE TOKEN
══════════════════════════════════════════════════════════════

📋 Token Configuration:
  Name: Claude Protocol Token
  Symbol: CLAUDE
  Description: Algorithmic market maker with automatic price support
  Initial Liquidity: 0.5 SOL

💰 Wallet Balance: 2.5432 SOL
🔑 Step 1: Creating token mint...
✅ Mint generated: CLAUDEoKyPqZ6xk2QkJ8Xs7Yw1u8vE9fH3qR4sT5uV6wX

📝 Step 2: Creating on-chain metadata...
✅ Metadata prepared

🚀 Step 3: Launching token on Pump.fun...
✅ Token created! TX: 5DMGCunW...

💧 Step 4: Adding liquidity via bonding curve...
✅ Liquidity added! Pool created

🏊 Step 5: Retrieving pool information...
✅ Pool Address: P00LAd...

══════════════════════════════════════════════════════════════
STEP 2: CHECK INITIAL PRICE
══════════════════════════════════════════════════════════════

💹 Initial Price: 0.00000050 SOL per token

══════════════════════════════════════════════════════════════
STEP 3: SIMULATE MARKET MAKING
══════════════════════════════════════════════════════════════

📈 Market Maker: Buying tokens...
  Amount: 0.1 SOL
  Token: CLAUDEoKyPqZ6xk2QkJ8Xs7Yw1u8vE9fH3qR4sT5uV6wX

✅ Buy executed! TX: 249GtvX5...
💹 Price after buy: 0.00000065 SOL per token

📉 Market Maker: Selling tokens...
✅ Sell executed! TX: hcW7yZNP...
💹 Price after sell: 0.00000042 SOL per token

══════════════════════════════════════════════════════════════
STEP 4: CLAUDE'S PROTOCOL - PRICE CORRECTION
══════════════════════════════════════════════════════════════

🤖 Detecting sell pressure and executing correction...
   Current price: 0.00000042 SOL
   Target: Restore to 0.00000050 SOL

✅ Correction executed!
💹 Final price: 0.00000055 SOL per token

══════════════════════════════════════════════════════════════
✅ LAUNCH COMPLETE
══════════════════════════════════════════════════════════════

📊 Token Details:
   Name: Claude Protocol Token
   Symbol: CLAUDE
   Mint: CLAUDEoKyPqZ6xk2QkJ8Xs7Yw1u8vE9fH3qR4sT5uV6wX
   Pool: P00LAd...

🔗 Links:
   Solscan: https://solscan.io/token/CLAUDEoKyPqZ6xk2QkJ8Xs7Yw1u8vE9fH3qR4sT5uV6wX
   Pump.fun: https://pump.fun/CLAUDEoKyPqZ6xk2QkJ8Xs7Yw1u8vE9fH3qR4sT5uV6wX

✨ Status: LIVE ON MAINNET
```

---

## 🔑 Key Features

### 1. **Real Token Creation**
- Uses official Pump.fun SDK
- Creates SPL token with metadata
- Initializes bonding curve

### 2. **Bonding Curve Liquidity**
- Automatic virtual liquidity provisioning
- Price discovery on curve
- No central exchange needed

### 3. **Automated Market Making**
- Real-time price monitoring
- Sell pressure detection
- Automatic buy corrections
- Maintains chart integrity

### 4. **Price Support Mechanism**
```
Initial Price: 0.00000050 SOL per token
    ↓ (sell pressure)
Price drops to: 0.00000042 SOL
    ↓ (detection)
Claude's Protocol triggers
    ↓ (correction)
Buy 0.15 SOL to absorb selling
    ↓ (result)
Final Price: 0.00000055 SOL ✅
```

---

## 💰 Cost Breakdown

| Step | Cost | Details |
|------|------|---------|
| Token Creation | 0.02 SOL | Mint + metadata |
| Initial Liquidity | 0.5 SOL | Your choice |
| Market Making Corrections | ~0.05-0.2 SOL | Varies by sell pressure |
| **Total** | **~0.6-0.7 SOL** | Very affordable! |

---

## 🛡️ Safety Checklist

Before running on mainnet:

- [ ] Test on devnet first
- [ ] Verify wallet has sufficient SOL
- [ ] Never share private key
- [ ] Use hardware wallet if possible
- [ ] Start with small amounts
- [ ] Monitor first transactions
- [ ] Keep .env file in .gitignore

---

## 🔗 API References

### Pump.fun SDK
- **Docs**: https://docs.pump.fun
- **SDK Package**: `@pump-fun/pump-sdk`
- **Swap SDK**: `@pump-fun/pump-swap-sdk`

### Solana Web3.js
- **Docs**: https://solana-labs.github.io/solana-web3.js/
- **Connection**: RPC endpoint communication
- **Keypair**: Wallet management

### Bonding Curve Formula
```
Price = Virtual SOL / Virtual Tokens

As you buy:
- Virtual SOL increases
- Virtual Tokens decreases
- Price goes up ↑

As you sell:
- Virtual SOL decreases
- Virtual Tokens increases
- Price goes down ↓
```

---

## 🚨 Troubleshooting

| Issue | Solution |
|-------|----------|
| "Invalid wallet private key" | Check base58 encoding, use correct format |
| "Insufficient balance" | Fund wallet with more SOL |
| "Network error" | Check RPC URL, try different provider |
| "Transaction timeout" | Network congestion, retry after few secs |
| "Pool not found" | Wait longer for confirmation (60+ seconds) |

---

## 📈 Next Steps for Production

1. **Integrate Full Market Making**
   - Add continuous monitoring loop
   - Track multiple tokens
   - Scale correction sizes

2. **Add Trading Features**
   - Buy/sell orders via API
   - Portfolio tracking
   - Performance analytics

3. **Risk Management**
   - Daily spend limits
   - Emergency stop mechanism
   - Slippage protection

4. **Community Integration**
   - Discord bot for trades
   - Real-time notifications
   - Public dashboard

---

## ✅ Verification

After token launches:

1. **Check on Solscan**
   - https://solscan.io/token/YOUR_MINT

2. **Verify on Pump.fun**
   - https://pump.fun/YOUR_MINT

3. **Check Bonding Curve**
   - Current price
   - Buy/sell volume
   - Market cap

4. **Monitor Transactions**
   - Initial buys recorded
   - Corrections logged
   - All on-chain verified

---

**Built with ❤️ for Solana | Ready for Live Trading**
