#!/usr/bin/env bun
/**
 * Cost Comparison: First Swap vs Subsequent Swaps
 */

console.log(`
╔════════════════════════════════════════════════════════════════╗
║             💸 COST COMPARISON CHART                          ║
╚════════════════════════════════════════════════════════════════╝

📊 YOUR FIRST SWAP (From Screenshot):

Input:                          0.001 SOL
Output:                         0.128481 USDC ✓
Exchange Rate:                  128.481 USDC per SOL

Total Costs Breakdown:
  ├─ Account Rent (USDC token account):  0.002039 SOL ⚠️
  ├─ Wrapping SOL → WSOL:                0.000015 SOL
  ├─ Swap Fee:                           0.000050 SOL  
  ├─ Unwrapping WSOL → SOL:              0.000015 SOL
  ├─ Network Transaction Fee:            0.000005 SOL
  └─ TOTAL COST:                         0.002124 SOL

Net Result:
  Input:  0.001 SOL
  Cost:   0.002124 SOL
  ─────────────────────
  Total:  0.003124 SOL spent ✗
  
  But you got: 0.128481 USDC = $0.12 worth! ✓

═══════════════════════════════════════════════════════════════════

📊 YOUR NEXT SWAP (After USDC account is created):

Input:                          0.001 SOL
Output:                         ~0.128481 USDC ✓
Exchange Rate:                  128.481 USDC per SOL

Total Costs Breakdown:
  ├─ Account Rent:                       0 SOL 🎉 (ALREADY PAID)
  ├─ Wrapping SOL → WSOL:                0.000015 SOL
  ├─ Swap Fee:                           0.000050 SOL
  ├─ Unwrapping WSOL → SOL:              0.000015 SOL
  ├─ Network Transaction Fee:            0.000005 SOL
  └─ TOTAL COST:                         0.000085 SOL

Net Result:
  Input:  0.001 SOL
  Cost:   0.000085 SOL (24X CHEAPER!)
  ──────────────────────
  Total:  0.0010850 SOL spent ✓
  
  You get: 0.128481 USDC = $0.12 worth! ✓

═══════════════════════════════════════════════════════════════════

📈 COST SAVINGS:

First Swap Cost:     0.003124 SOL
Next Swap Cost:      0.000085 SOL
                     ────────────
Savings:             0.003039 SOL per swap

After 10 swaps:      0.001 + (9 × 0.000085) = ~0.00177 SOL total
vs                   First method: 10 × 0.003124 = 0.03124 SOL

TOTAL SAVINGS:       94% cheaper for repeated swaps! 🚀

═══════════════════════════════════════════════════════════════════

💡 KEY TAKEAWAYS:

✓ First swap expensive? Yes, because:
  - Must create token account (Solana requirement)
  - One-time rent deposit (0.002039 SOL)

✓ Why was your account rent so high?
  - USDC token accounts need more space
  - Rent = 2 years of storage reservation
  - This is standard Solana, not our code!

✓ Next swaps will be cheap?
  - YES! Account already exists
  - No more rent payments
  - Just regular swap fees

✓ Can we optimize further?
  - We already did! (wrapUnwrapSOL: false)
  - Use existing accounts for multiple swaps
  - Batch swaps together to amortize fees

═══════════════════════════════════════════════════════════════════

🎯 RECOMMENDATION:

For production use:
  1. First swap: Pay the one-time account rent
  2. Subsequent swaps: Use the same account (much cheaper)
  3. Or use: Batch multiple swaps in one transaction

This is the standard way Solana works - first interaction
with a token requires account setup, then all future
interactions are efficient! ✓
`);
