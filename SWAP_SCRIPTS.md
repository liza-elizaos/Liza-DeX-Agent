# 🚀 SHINA Swap Scripts

Complete swap automation tools for the SHINA Solana trading bot. Execute single swaps, interactive trading, or batch operations.

## 📋 Available Scripts

### 1. **Quick Swap** (`swap.ts`)
Simple command-line swap execution with wallet balance checking.

**Usage:**
```bash
bun swap.ts <toToken> <amount> [walletAddress]
```

**Examples:**
```bash
# Swap 0.001 SOL for USDC
bun swap.ts USDC 0.001

# Swap 0.5 SOL for BONK
bun swap.ts BONK 0.5

# Swap 1.0 SOL for USDT with custom wallet
bun swap.ts USDT 1.0 "your_wallet_address"
```

**Supported Tokens:**
- SOL, USDC, USDT, MSOL, RAY, COPE, SRM, FTT, KIN, WSOL, BONK, MARINADE

### 2. **Interactive Terminal** (`swap-interactive.ts`)
Full-featured interactive terminal for manual swapping, balance checking, and batch operations.

**Usage:**
```bash
bun swap-interactive.ts
```

**Features:**
- ✅ Quick Swap - Single token swap with confirmation
- ✅ Check Balance - View your SOL balance
- ✅ Batch Swap - Execute multiple swaps sequentially
- ✅ Token Info - View supported tokens and details

**Menu Options:**
```
1. Quick Swap (SOL → Token)
2. Check Balance
3. Batch Swap
4. Token Info
5. Exit
```

### 3. **Batch Swap from Config** (`swap-batch.ts`)
Automated batch swaps from a JSON configuration file.

**Usage:**
```bash
bun swap-batch.ts <configFile>
```

**Configuration Format (JSON):**
```json
{
  "wallet": "your_wallet_address_optional",
  "swaps": [
    { "amount": 0.001, "toToken": "USDC" },
    { "amount": 0.001, "toToken": "BONK" },
    { "amount": 0.002, "toToken": "USDT" }
  ]
}
```

**Examples:**
```bash
# Execute swaps from config file
bun swap-batch.ts swaps.json

# Show help
bun swap-batch.ts --help
```

**Example Config Files:**
- `swaps.example.json` - Basic batch swap example

## 🔧 Environment Configuration

Set these environment variables before running scripts:

```bash
# Your Solana wallet address
export SOLANA_PUBLIC_KEY="your_wallet_address"

# Solana RPC endpoint
export SOLANA_RPC_URL="https://api.mainnet-beta.solana.com"

# API base URL (for local development)
export API_BASE="http://localhost:3000"
```

Or create a `.env` file in the project root:
```env
SOLANA_PUBLIC_KEY=CMVrzdso4SShQm2irrc7jMCN9Vw5QxXvrZKB79cYPPJT
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
API_BASE=http://localhost:3000
```

## 📊 Quick Start Examples

### 1. Single Swap
```bash
# Swap 0.001 SOL for USDC
bun swap.ts USDC 0.001

# Output:
# 🚀 SHINA Token Swap
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 💰 Checking wallet balance...
# ✅ Balance: 0.025666 SOL
# 
# 📊 Swap Details:
#    From: 0.001 SOL
#    To: USDC
#    Wallet: CMVrzds...9cYPPJT
# 
# 📡 Sending swap request...
# ✅ Swap Response:
# ✅ Swap Successful!
```

### 2. Interactive Session
```bash
bun swap-interactive.ts

# Follow the menu prompts to:
# - Check your balance
# - Execute a single swap
# - Execute multiple swaps
# - View token information
```

### 3. Batch Execution
```bash
# Create a config file
cat > my-swaps.json << EOF
{
  "wallet": "CMVrzdso4SShQm2irrc7jMCN9Vw5QxXvrZKB79cYPPJT",
  "swaps": [
    { "amount": 0.001, "toToken": "USDC" },
    { "amount": 0.001, "toToken": "BONK" }
  ]
}
EOF

# Execute batch
bun swap-batch.ts my-swaps.json

# Output:
# ╔════════════════════════════════════════════╗
# ║     SHINA BATCH SWAP EXECUTION             ║
# ╚════════════════════════════════════════════╝
# 
# 💰 Fetching wallet balance...
# ✅ Balance: 0.025666 SOL
# 
# 📋 Swap Summary:
#    Total swaps: 2
#    Total amount: 0.002 SOL
#    Wallet: CMVrzds...9cYPPJT
# 
# [1/2] Swapping 0.001 SOL → USDC...
# ✅ Swap 1 successful!
# 
# [2/2] Swapping 0.001 SOL → BONK...
# ✅ Swap 2 successful!
# 
# ╔════════════════════════════════════════════╗
# ║         BATCH SWAP COMPLETE                ║
# ╚════════════════════════════════════════════╝
# ✅ Successful: 2
# ❌ Failed: 0
# 📊 Total: 2
```

## 🎯 Workflow Examples

### Example 1: Dollar-Cost Averaging (DCA)
```json
{
  "wallet": "your_wallet",
  "swaps": [
    { "amount": 0.002, "toToken": "BONK" },
    { "amount": 0.002, "toToken": "BONK" },
    { "amount": 0.002, "toToken": "BONK" }
  ]
}
```
Run daily with: `bun swap-batch.ts dca-daily.json`

### Example 2: Portfolio Diversification
```json
{
  "wallet": "your_wallet",
  "swaps": [
    { "amount": 0.003, "toToken": "USDC" },
    { "amount": 0.002, "toToken": "BONK" },
    { "amount": 0.002, "toToken": "RAY" },
    { "amount": 0.002, "toToken": "MSOL" }
  ]
}
```

### Example 3: Testing Different Tokens
```json
{
  "wallet": "your_wallet",
  "swaps": [
    { "amount": 0.001, "toToken": "USDC" },
    { "amount": 0.001, "toToken": "USDT" },
    { "amount": 0.001, "toToken": "BONK" },
    { "amount": 0.001, "toToken": "RAY" }
  ]
}
```

## ⚠️ Important Notes

1. **Server Required**: Make sure the SHINA API server is running:
   ```bash
   npm run server
   ```

2. **Sufficient Balance**: Always ensure your wallet has enough SOL + transaction fees:
   ```bash
   # Check balance first
   bun swap-interactive.ts
   # Select option 2 to check balance
   ```

3. **Test First**: Start with small amounts:
   ```bash
   # Test with 0.001 SOL
   bun swap.ts USDC 0.001
   ```

4. **Token Support**: Verify token is supported:
   - Interactive mode option 4 shows all supported tokens
   - Or check swap-utils.ts for token addresses

5. **Rate Limiting**: Batch scripts add 2-second delays between swaps to avoid rate limits

## 🐛 Troubleshooting

### Connection Refused
```
Error: Unable to connect. Is the computer able to access the url?
```
**Solution**: Make sure the server is running:
```bash
npm run server
```

### Insufficient Balance
```
❌ Insufficient balance! Need 0.1 SOL, have 0.025 SOL
```
**Solution**: Reduce swap amount or add more SOL to wallet

### Token Not Found
```
❌ Token Not Found
```
**Solution**: Check token name is correct and supported. Run `bun swap-interactive.ts` → option 4

### Invalid Wallet Address
```
❌ Invalid wallet address
```
**Solution**: Verify wallet address format (44-character base58 string)

## 📝 Tips & Best Practices

1. **Start Small**: Always test with minimal amounts first
2. **Use Batch for Complex**: Use batch scripts for multiple swaps
3. **Monitor Slippage**: Check swap responses for price impact
4. **Spacing Swaps**: Add delays between large swaps to minimize slippage
5. **Keep Backups**: Save working config files for recurring swaps

## 🔗 API Endpoints Used

- `POST /api/chat` - Main swap execution endpoint
  - Used by all three scripts
  - Handles balance checking and swap execution

## 📚 Related Files

- [swap.ts](./swap.ts) - Quick swap script
- [swap-interactive.ts](./swap-interactive.ts) - Interactive terminal
- [swap-batch.ts](./swap-batch.ts) - Batch execution from config
- [swaps.example.json](./swaps.example.json) - Example configuration
- [api/swap-utils.ts](./api/swap-utils.ts) - Core swap logic

## 🆘 Support

For issues with:
- **Swap Logic**: Check server logs with `npm run server`
- **Token Addresses**: Verify in `api/swap-utils.ts` TOKEN_CONTRACTS
- **Jupiter API**: Check Jupiter API status
- **Wallet**: Verify Solana address format and balance
