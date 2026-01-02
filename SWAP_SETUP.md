# 📋 SHINA Swap Scripts - Complete Setup

I've created a complete swapping system for SHINA with three main scripts to handle different use cases.

## 🎯 Three Scripts You Now Have

### 1. **Quick Swap** - `swap.ts`
Simple command-line tool for single swaps
```bash
bun swap.ts USDC 0.001      # Swap 0.001 SOL for USDC
bun swap.ts BONK 0.5        # Swap 0.5 SOL for BONK
npm run swap -- USDT 1.0    # Using npm alias
```

**Features:**
- ✅ Automatic balance checking
- ✅ Amount validation
- ✅ Clear success/error messages
- ✅ Support for all tokens

### 2. **Interactive Terminal** - `swap-interactive.ts`
Full-featured menu interface for manual trading
```bash
bun swap-interactive.ts
npm run swap:interactive
```

**Features:**
- ✅ Menu-driven interface
- ✅ Quick swap with confirmation
- ✅ Check balance
- ✅ Batch swap execution
- ✅ View token information
- ✅ Color-coded output

### 3. **Batch Executor** - `swap-batch.ts`
Execute multiple swaps from a JSON configuration file
```bash
bun swap-batch.ts swaps.json
npm run swap:batch swaps.json
```

**Features:**
- ✅ Configure swaps in JSON
- ✅ Automatic balance validation
- ✅ Sequential execution with delays
- ✅ Success/failure summary
- ✅ Perfect for DCA and diversification strategies

## 📝 Quick Start

### 1. Ensure Server is Running
```bash
npm run server
```
(In a separate terminal)

### 2. Try a Quick Swap
```bash
bun swap.ts USDC 0.001
```

This will:
1. ✅ Check your wallet balance
2. ✅ Validate you have enough SOL
3. ✅ Execute the swap
4. ✅ Show the result

### 3. Or Use Interactive Mode
```bash
bun swap-interactive.ts
```

Then choose an option from the menu.

## 🔧 Configuration

### Option A: Environment Variables
```bash
export SOLANA_PUBLIC_KEY="your_wallet_address"
export SOLANA_RPC_URL="https://api.mainnet-beta.solana.com"
export API_BASE="http://localhost:3000"
```

### Option B: .env File
```env
SOLANA_PUBLIC_KEY=CMVrzdso4SShQm2irrc7jMCN9Vw5QxXvrZKB79cYPPJT
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
API_BASE=http://localhost:3000
```

## 📊 Usage Examples

### Single Swap
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
# 
# 📡 Sending swap request...
# ✅ Swap Response: ✅ Swap Successful!
```

### Batch Swap from Config

**Create config file: `my-swaps.json`**
```json
{
  "wallet": "CMVrzdso4SShQm2irrc7jMCN9Vw5QxXvrZKB79cYPPJT",
  "swaps": [
    { "amount": 0.001, "toToken": "USDC" },
    { "amount": 0.001, "toToken": "BONK" },
    { "amount": 0.002, "toToken": "USDT" }
  ]
}
```

**Execute:**
```bash
bun swap-batch.ts my-swaps.json
```

### Interactive Session
```bash
bun swap-interactive.ts
# Follow the menu:
# 1. Quick Swap - Execute a single swap
# 2. Check Balance - View your SOL balance
# 3. Batch Swap - Enter multiple swaps interactively
# 4. Token Info - See supported tokens
# 5. Exit
```

## 🎯 Real-World Workflows

### Dollar-Cost Averaging (DCA)
Buy same amount of token daily:
```json
{
  "swaps": [
    { "amount": 0.002, "toToken": "BONK" },
    { "amount": 0.002, "toToken": "BONK" },
    { "amount": 0.002, "toToken": "BONK" }
  ]
}
```
Run with: `bun swap-batch.ts dca.json`

### Portfolio Rebalancing
Diversify into multiple tokens:
```json
{
  "swaps": [
    { "amount": 0.004, "toToken": "USDC" },
    { "amount": 0.003, "toToken": "BONK" },
    { "amount": 0.003, "toToken": "RAY" },
    { "amount": 0.002, "toToken": "MSOL" }
  ]
}
```

### Token Testing
Test swap with different tokens:
```json
{
  "swaps": [
    { "amount": 0.001, "toToken": "USDC" },
    { "amount": 0.001, "toToken": "USDT" },
    { "amount": 0.001, "toToken": "BONK" },
    { "amount": 0.001, "toToken": "RAY" },
    { "amount": 0.001, "toToken": "MSOL" }
  ]
}
```

## 📚 Supported Tokens

All scripts support these tokens:
- **SOL** - Solana (native)
- **USDC** - USD Coin
- **USDT** - Tether USD
- **MSOL** - Marinade SOL
- **RAY** - Raydium
- **COPE** - Cope
- **SRM** - Serum
- **FTT** - FTX Token
- **KIN** - Kin
- **WSOL** - Wrapped SOL
- **BONK** - Bonk
- **MARINADE** - Marinade

View in interactive mode: `bun swap-interactive.ts` → option 4

## 🆘 Troubleshooting

### "Unable to connect"
- Make sure server is running: `npm run server`
- Check API_BASE URL is correct

### "Insufficient balance"
- Check balance first: `bun swap-interactive.ts` → option 2
- Keep 0.01 SOL for fees

### "Token not found"
- Verify token name (case-insensitive)
- Check token is in supported list
- Try interactive mode option 4

### "Invalid wallet"
- Check wallet address format (44 characters, base58)
- Verify SOLANA_PUBLIC_KEY environment variable

## ✨ Features

### Balance Checking
All scripts check wallet balance before swapping:
```bash
bun swap.ts USDC 0.001
# Automatically checks and validates balance
```

### Amount Validation
- Checks sufficient balance
- Validates amount > 0
- Shows required balance with fees

### Error Handling
- Clear error messages
- Fallback WSOL support for native SOL
- Retry logic (3 attempts)

### Color Output
- Green ✅ for success
- Red ❌ for errors
- Yellow ⚠️ for warnings
- Blue 📡 for information

## 📖 Documentation

- **Full Guide**: See [SWAP_SCRIPTS.md](./SWAP_SCRIPTS.md)
- **Help Command**: `bun swap-help.ts`
- **Example Config**: [swaps.example.json](./swaps.example.json)

## 🚀 Getting Started NOW

1. **Start the server** (if not already running):
   ```bash
   npm run server
   ```

2. **Test a swap**:
   ```bash
   bun swap.ts USDC 0.001
   ```

3. **Or go interactive**:
   ```bash
   bun swap-interactive.ts
   ```

## 📋 Files Created

- ✅ `swap.ts` - Quick swap script
- ✅ `swap-interactive.ts` - Interactive terminal
- ✅ `swap-batch.ts` - Batch executor
- ✅ `swap-help.ts` - Help and quick start
- ✅ `swaps.example.json` - Example configuration
- ✅ `SWAP_SCRIPTS.md` - Full documentation
- ✅ Updated `package.json` with npm aliases

## 🎯 npm Aliases Added

```bash
npm run swap -- USDC 0.001           # Quick swap
npm run swap:interactive             # Interactive mode
npm run swap:batch swaps.json        # Batch execution
```

Now you have a complete, production-ready swapping system! 🎉
