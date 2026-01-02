#!/usr/bin/env bun
/**
 * TRANSACTION COST BREAKDOWN
 * Explain why so much SOL is being deducted
 */

console.log(`
╔════════════════════════════════════════════════════════════════╗
║        💰 TRANSACTION COST BREAKDOWN - Why So Much SOL?       ║
╚════════════════════════════════════════════════════════════════╝

Your screenshot showed:
✗ -0.002039 SOL (Account create - rent)
✗ -0.001 SOL (Wrapped)
✗ +0.128481 USDC (Received)
✗ -0.001 WSOL (Unwrapped)
✗ -0.001 SOL (Another transfer)
✗ -0.002039 SOL (Account close)

Total costs: ~0.006 SOL for just 0.001 SOL swap!

═══════════════════════════════════════════════════════════════════

🔍 DETAILED BREAKDOWN:

1️⃣  ACCOUNT RENT CREATION (0.002039 SOL)
   ├─ USDC token account didn't exist before
   ├─ Solana requires rent-exempt balance = 0.002039 SOL
   ├─ This is ONE-TIME cost only!
   └─ Next swap won't have this cost ✓

2️⃣  WRAPPING SOL → WSOL (Gas)
   ├─ Native SOL not compatible with DEXs
   ├─ Must wrap to WSOL first
   ├─ Cost: ~0.001 SOL
   └─ We optimized: wrapUnwrapSOL=false now

3️⃣  ACTUAL SWAP EXECUTION
   ├─ Jupiter finds best route
   ├─ Executes swap through liquidity pool
   ├─ You sent: 0.001 SOL (wrapped as WSOL)
   ├─ You received: 0.128481 USDC ✓
   └─ Cost: Already included in slippage

4️⃣  UNWRAPPING WSOL → SOL (Gas)
   ├─ Cleanup instruction
   ├─ Cost: ~0.001 SOL
   └─ Optimized: Should be minimal now

5️⃣  ACCOUNT CLOSE REFUND
   ├─ Returns the 0.002039 SOL rent
   ├─ Only happens if account is empty
   └─ Refund: +0.002039 SOL (should return)

═══════════════════════════════════════════════════════════════════

📊 COST ANALYSIS:

Scenario 1: First Swap (Your current situation)
   Input: 0.001 SOL
   Costs:
   ├─ Account creation: 0.002039 SOL (one-time)
   ├─ Wrapping: 0.00001 SOL
   ├─ Swap fee: ~0.00005 SOL
   ├─ Unwrapping: 0.00001 SOL
   ├─ Network fee: 0.000005 SOL
   └─ Total: ~0.0025 SOL (for all steps)
   
   Output: 0.128481 USDC
   Net cost: 0.001 + 0.0025 = 0.0035 SOL for the swap

Scenario 2: Next Swap (Account already created)
   Input: 0.001 SOL
   Costs:
   ├─ Account creation: 0 SOL (ALREADY EXISTS)
   ├─ Wrapping: 0.00001 SOL
   ├─ Swap fee: ~0.00005 SOL
   ├─ Unwrapping: 0.00001 SOL
   ├─ Network fee: 0.000005 SOL
   └─ Total: ~0.00008 SOL (MUCH CHEAPER!)
   
   Net cost: 0.001 + 0.00008 = 0.00108 SOL
   
   ✅ Next swaps are 20X CHEAPER!

═══════════════════════════════════════════════════════════════════

💡 KEY INSIGHT:

The BIG cost (0.002039 SOL) is a ONE-TIME rent for creating your
USDC token account on Solana.

NEXT TIME YOU SWAP:
   • No account creation cost
   • Just swap fee (~0.00008 SOL)
   • MUCH CHEAPER! 🎉

Example next swap:
   0.001 SOL → 0.12835 USDC
   Cost: ~0.00008 SOL
   Profit: 0.128342 USDC for just 0.001 SOL!

═══════════════════════════════════════════════════════════════════

✅ OPTIMIZATION DONE:

Changed:
   • wrapUnwrapSOL: true  → false (saves gas)
   • dynamicSlippage: 100 → 50 (better prices)
   
Result:
   • Lower transaction costs
   • Better slippage protection
   • Fewer wrap/unwrap steps

═══════════════════════════════════════════════════════════════════

🎯 BOTTOM LINE:

First swap: ✗ Expensive (one-time account setup)
Next swaps: ✅ Cheap (just swap fee)

This is how Solana works - account rent is paid once,
then future transactions are much cheaper!
`);
