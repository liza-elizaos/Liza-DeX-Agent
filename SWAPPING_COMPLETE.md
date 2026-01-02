# 🎉 SHINA Token Swapping System - Complete

A complete, production-ready token swapping system for the SHINA Solana trading bot with three different interfaces to suit your needs.

## 🚀 Quick Start (30 seconds)

### Terminal 1 - Start Server
```bash
npm run server
```

### Terminal 2 - Try a Swap
```bash
# Option A: Quick swap
bun swap.ts USDC 0.001

# Option B: Interactive mode
bun swap-interactive.ts

# Option C: Batch from config
bun swap-batch.ts swaps.json
```

Done! 🎉

## 📦 What You Get

### 3 Main Scripts

| Script | Usage | Best For |
|--------|-------|----------|
| `swap.ts` | `bun swap.ts USDC 0.001` | Single quick swaps |
| `swap-interactive.ts` | `bun swap-interactive.ts` | Manual trading with menu |
| `swap-batch.ts` | `bun swap-batch.ts config.json` | Multiple swaps from file |

### npm Aliases (Convenient!)
```bash
npm run swap -- USDC 0.001           # Quick swap
npm run swap:interactive             # Interactive
npm run swap:batch swaps.json        # Batch
```

### Helper Scripts
- `swap-help.ts` - Quick start guide
- `swaps.example.json` - Example configuration

### Documentation
- `SWAP_SCRIPTS.md` - Full comprehensive guide
- `SWAP_SETUP.md` - Setup instructions

## 💡 Three Ways to Swap

### 1️⃣ Quick Swap (Fastest)
```bash
bun swap.ts USDC 0.001
```
- ✅ Simplest command
- ✅ Automatic balance check
- ✅ Perfect for quick trades
- ✅ Shows clear result

### 2️⃣ Interactive (Best for Learning)
```bash
bun swap-interactive.ts
```
- ✅ Menu-driven interface
- ✅ Check balance
- ✅ Multiple swaps at once
- ✅ View token info
- ✅ Visual confirmation

### 3️⃣ Batch Config (Best for Automation)
```bash
bun swap-batch.ts swaps.json
```
- ✅ Configure swaps in JSON
- ✅ Execute multiple swaps
- ✅ Perfect for strategies (DCA, rebalancing)
- ✅ Repeat daily/weekly
- ✅ Success summary

## 🎯 Real Examples

### Example 1: Test Swap
```bash
bun swap.ts USDC 0.001
```
Output:
```
🚀 SHINA Token Swap
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💰 Checking wallet balance...
✅ Balance: 0.025666 SOL

📊 Swap Details:
   From: 0.001 SOL
   To: USDC
   Wallet: CMVrzds...9cYPPJT

📡 Sending swap request...
✅ Swap Response: ✅ Swap Successful!
```

### Example 2: Dollar-Cost Averaging Daily

Create `dca.json`:
```json
{
  "swaps": [
    { "amount": 0.002, "toToken": "BONK" },
    { "amount": 0.002, "toToken": "BONK" },
    { "amount": 0.002, "toToken": "BONK" }
  ]
}
```

Run daily:
```bash
bun swap-batch.ts dca.json
```

### Example 3: Portfolio Rebalancing

Create `rebalance.json`:
```json
{
  "swaps": [
    { "amount": 0.004, "toToken": "USDC" },
    { "amount": 0.003, "toToken": "BONK" },
    { "amount": 0.003, "toToken": "RAY" }
  ]
}
```

Execute:
```bash
bun swap-batch.ts rebalance.json
```

## 📊 Supported Tokens

```
SOL, USDC, USDT, MSOL, RAY, COPE, SRM, FTT, KIN, WSOL, BONK, MARINADE
```

Check all in interactive mode:
```bash
bun swap-interactive.ts  # Select option 4
```

## ⚙️ Configuration

### Set Wallet Address (Optional)
```bash
export SOLANA_PUBLIC_KEY="your_wallet_address"
```

Or create `.env`:
```env
SOLANA_PUBLIC_KEY=CMVrzdso4SShQm2irrc7jMCN9Vw5QxXvrZKB79cYPPJT
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
API_BASE=http://localhost:3000
```

### Ensure Server is Running
```bash
npm run server  # In another terminal
```

## 🔍 How It Works

### Flow Diagram
```
User Input
    ↓
Balance Check ✓
    ↓
Amount Validation ✓
    ↓
Swap Execution via API
    ↓
Jupiter Quote
    ↓
Transaction Build
    ↓
Result
```

### Features
- ✅ Native SOL → WSOL automatic conversion
- ✅ 3 retry attempts for failed quotes
- ✅ Automatic fee buffer (0.01 SOL)
- ✅ Slippage protection (50 bps default)
- ✅ Clear error messages
- ✅ Colored output for readability

## ✨ Key Features

### Safety
- Balance validation before swap
- Fee buffer checking
- Amount validation
- Confirmation prompts (interactive/batch)

### Flexibility
- Single or multiple swaps
- Manual or automated
- Command-line or interactive
- Configurable from JSON

### Reliability
- Retry logic (3 attempts)
- Clear error messages
- Success/failure tracking
- Detailed logging

## 🐛 Troubleshooting

### "Unable to connect"
```bash
npm run server  # Start server first
```

### "Insufficient balance"
```bash
bun swap-interactive.ts  # Check option 2
```

### "Token not found"
```bash
bun swap-interactive.ts  # Check option 4 for supported tokens
```

### "Invalid wallet"
Check wallet address format:
- Must be 44 characters
- Base58 format
- Verify in .env or SOLANA_PUBLIC_KEY

## 📚 Files Reference

| File | Purpose |
|------|---------|
| `swap.ts` | Quick swap script |
| `swap-interactive.ts` | Interactive menu |
| `swap-batch.ts` | Batch executor |
| `swap-help.ts` | Quick start guide |
| `swaps.example.json` | Config example |
| `SWAP_SCRIPTS.md` | Full documentation |
| `SWAP_SETUP.md` | Setup guide |
| `server.ts` | API server |
| `api/swap-utils.ts` | Swap logic |

## 🎓 Learning Path

1. **Start here**: `bun swap-help.ts` - Quick overview
2. **Try this**: `bun swap.ts USDC 0.001` - First swap
3. **Explore this**: `bun swap-interactive.ts` - All features
4. **Automate**: Create config file → `bun swap-batch.ts`
5. **Deep dive**: Read `SWAP_SCRIPTS.md` - Full details

## ⚡ Common Commands

```bash
# Quick swap
bun swap.ts USDC 0.001

# Or using npm
npm run swap -- USDC 0.001

# Interactive trading
bun swap-interactive.ts
npm run swap:interactive

# Batch from config
bun swap-batch.ts swaps.json
npm run swap:batch swaps.json

# View help
bun swap-help.ts

# Start server (if needed)
npm run server
```

## 🎯 Next Steps

1. **[Required]** Ensure server is running:
   ```bash
   npm run server
   ```

2. **[Quick Test]** Try a small swap:
   ```bash
   bun swap.ts USDC 0.001
   ```

3. **[Explore]** Use interactive mode:
   ```bash
   bun swap-interactive.ts
   ```

4. **[Automate]** Create batch config:
   ```bash
   # See swaps.example.json for template
   bun swap-batch.ts your-config.json
   ```

## 💬 Support

For detailed help:
- Quick start: `bun swap-help.ts`
- Full docs: `SWAP_SCRIPTS.md`
- Setup guide: `SWAP_SETUP.md`

Check server logs for issues:
```bash
npm run server  # Shows all activity
```

---

**You're all set!** 🚀 Your complete token swapping system is ready to use!

Choose your style:
- 🚀 **Quick**: `bun swap.ts USDC 0.001`
- 🎮 **Interactive**: `bun swap-interactive.ts`
- ⚙️ **Automated**: `bun swap-batch.ts config.json`
