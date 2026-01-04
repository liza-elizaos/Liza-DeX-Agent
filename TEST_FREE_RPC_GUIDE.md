# 🧪 Free Solana RPC Test Guide

**Purpose**: Test if `https://api.mainnet-beta.solana.com` (free) works reliably  
**Goal**: Decide between Free RPC vs Paid (Alchemy)  
**File**: `test-free-rpc.ts`

---

## 🚀 HOW TO RUN TEST

### Prerequisites
```bash
# Make sure you're in the project directory
cd d:/shina

# Install dependencies (if not already done)
npm install
```

### Run the Test
```bash
# Using ts-node (recommended)
npx ts-node test-free-rpc.ts

# Or compile and run
npx tsc test-free-rpc.ts
node test-free-rpc.js
```

### Expected Output
```
═══════════════════════════════════════════════════
  FREE SOLANA RPC TEST: https://api.mainnet-beta.solana.com
═══════════════════════════════════════════════════

⏳ Testing: Basic Connection... PASS (234ms)
   └─ Connected to Solana v1.18.0
   └─ Details: {"solana-core":"1.18.0","rpc-api":"1.18.0"}

⏳ Testing: Get Wallet Balance... PASS (156ms)
   └─ Wallet balance: 0.234567 SOL

⏳ Testing: Fetch Transaction History (500 signatures)... PASS (2341ms)
   └─ Fetched 500 signatures
   └─ Details: {"count":500,"fetchTime":2341}

⏳ Testing: Parse 50 Transactions... PASS (8923ms)
   └─ Parsed 50/50 transactions (6 token launches found)

⏳ Testing: Rate Limiting Check (10 rapid requests)... PASS (892ms)
   └─ All 10 requests succeeded (no rate limiting detected)

⏳ Testing: Account Age Calculation... PASS (234ms)
   └─ Account age: 200 days, Last activity: 1/2/2026

═══════════════════════════════════════════════════
TEST SUMMARY
═══════════════════════════════════════════════════

✓ Passed: 6
⚠ Warned: 0
✗ Failed: 0

Total time: 12780ms

RECOMMENDATION:
✓ FREE RPC IS SUITABLE
  - Can fetch transactions reliably
  - No excessive rate limiting
  - Good for development/testing
  - May have occasional slowdowns for production
```

---

## 📊 TEST EXPLANATIONS

### Test 1: Basic Connection
**What it tests**: Can we connect to the RPC?  
**What it checks**: Solana version availability  
**Pass criteria**: Any version number returned

**Result interpretation**:
- ✅ PASS: RPC is online and responding
- ❌ FAIL: RPC is down or unreachable

---

### Test 2: Get Wallet Balance
**What it tests**: Can we read wallet data?  
**What it checks**: Balance of test wallet  
**Pass criteria**: Returns a number (any amount)

**Result interpretation**:
- ✅ PASS: Basic read operations work
- ❌ FAIL: Can't access wallet data

---

### Test 3: Fetch Transaction History (500 signatures)
**What it tests**: Can we get transaction history?  
**What it checks**: Fetch 500 most recent transactions  
**Pass criteria**: Returns signatures without timeout

**Result interpretation**:
- ✅ PASS: Can fetch bulk transaction history
- ⚠️ WARN: Slow fetch (>5000ms)
- ❌ FAIL: Timeout or error

---

### Test 4: Parse 50 Transactions
**What it tests**: Can we read individual transactions?  
**What it checks**: Parse each transaction and detect token launches  
**Pass criteria**: 80%+ success rate (40+ out of 50)

**Result interpretation**:
- ✅ PASS (80-100%): Reliable for production use
- ⚠️ WARN (50-80%): Works but unreliable
- ❌ FAIL (<50%): Too many errors

**Details**:
```
parsed: 40+ out of 50 transactions successfully read
failed: <10 errors (acceptable)
tokenLaunches: Number of token creation transactions found
success: Percentage of successful parses
parseTime: Total time to process 50 transactions
```

---

### Test 5: Rate Limiting Check (10 rapid requests)
**What it tests**: Does the RPC limit rapid requests?  
**What it checks**: Make 10 simultaneous balance requests  
**Pass criteria**: 0 failures (all succeed)

**Result interpretation**:
- ✅ PASS (0 failures): No rate limiting issues
- ⚠️ WARN (1-2 failures): Minor rate limiting
- ❌ FAIL (3+ failures): Heavy rate limiting

**Why it matters**: 
- Dev Trust system makes many requests
- If rate limited heavily, scores will timeout
- Free RPC has generous rate limits typically

---

### Test 6: Account Age Calculation
**What it tests**: Can we calculate account age correctly?  
**What it checks**: Compare oldest vs newest transaction  
**Pass criteria**: Returns valid dates

**Result interpretation**:
- ✅ PASS: Dates are correct
- Example: Account age: 200 days, Last activity: 1/2/2026

**Why it matters**:
- Trust score depends on account age
- Wrong dates = wrong trust scores
- Free RPC usually returns correct timestamps

---

## 🎯 EXPECTED RESULTS

### For Free RPC: PASS (Good Result)
```
✓ Passed: 6 / 6
⚠ Warned: 0
✗ Failed: 0

RECOMMENDATION:
✓ FREE RPC IS SUITABLE
  - Can fetch transactions reliably
  - No excessive rate limiting
  - Good for development/testing
  - May have occasional slowdowns for production
```

✅ **Conclusion**: Use free RPC, save money!

---

### For Free RPC: PARTIAL (Warning)
```
✓ Passed: 4 / 6
⚠ Warned: 2
✗ Failed: 0

RECOMMENDATION:
⚠ FREE RPC IS PARTIALLY SUITABLE
  - Works but may have occasional issues
  - Monitor rate limiting
  - Consider Alchemy for production
```

⚠️ **Conclusion**: Use free RPC for dev, consider Alchemy for production

---

### For Free RPC: FAIL (Bad Result)
```
✓ Passed: 2 / 6
⚠ Warned: 1
✗ Failed: 3

RECOMMENDATION:
✗ FREE RPC NOT RECOMMENDED
  - Too many failures or rate limits
  - Use Alchemy or Helius for reliability
```

❌ **Conclusion**: Use paid RPC (Alchemy or Helius)

---

## 📈 PERFORMANCE METRICS

### Good Performance
```
Total time: 12-15 seconds (all 6 tests)
Parse 50 transactions: 8-12 seconds
Rate limit test: <1 second (no delays)
```

### Acceptable Performance
```
Total time: 15-25 seconds
Parse 50 transactions: 12-20 seconds
Rate limit test: 1-2 seconds (minor delays)
```

### Poor Performance
```
Total time: >30 seconds
Parse 50 transactions: >20 seconds
Timeouts or connection errors
Rate limit failures (3+ out of 10)
```

---

## 💾 TEST CONFIGURATION

The test uses:
- **Wallet**: DScqtGwFoDTme2Rzdjpdb2w7CtuKc6Z8KF7hMhbx8ugQ
- **Limit**: 500 signatures
- **Check**: 50 transactions
- **Rate test**: 10 rapid requests

You can modify these in the script:
```typescript
const FREE_RPC = 'https://api.mainnet-beta.solana.com';  // ← RPC URL
const TEST_WALLET = 'DScqtGwFoDTme2Rzdjpdb2w7CtuKc6Z8KF7hMhbx8ugQ';  // ← Wallet to test
```

---

## 🚀 NEXT STEPS BASED ON RESULTS

### If PASS (Free RPC Works Well):
```
1. Update .env:
   SOLANA_RPC_URL=https://api.mainnet-beta.solana.com

2. Deploy with free RPC
   npm run build
   npx vercel deploy --prod

3. Monitor in production
   Check for timeouts or rate limiting

4. Recommendation: Save money with free RPC!
```

### If WARN (Free RPC Works But Unreliable):
```
1. Test again at different times (RPC load varies)

2. If consistent: Consider switching to Alchemy
   
3. Or: Use free RPC for dev, Alchemy for production

4. Update .env:
   SOLANA_RPC_URL=https://solana-mainnet.g.alchemy.com/v2/YOUR_KEY
```

### If FAIL (Free RPC Doesn't Work):
```
1. Check if https://api.mainnet-beta.solana.com is down
   
2. Use Alchemy instead:
   SOLANA_RPC_URL=https://solana-mainnet.g.alchemy.com/v2/YOUR_KEY

3. Or use Helius:
   SOLANA_RPC_URL=https://mainnet.helius-rpc.com/?api-key=YOUR_KEY
```

---

## ✅ CHECKLIST

Before deploying:
- [ ] Run test-free-rpc.ts
- [ ] Review results
- [ ] Check "RECOMMENDATION" section
- [ ] If PASS: Update .env with free RPC
- [ ] If WARN/FAIL: Use Alchemy or Helius
- [ ] Deploy and monitor

---

## 📞 TROUBLESHOOTING

**Error: "Connection refused"**
- Free RPC is down
- Try again later
- Use Alchemy as backup

**Error: "Rate limited"**
- Free RPC is busy
- Try at off-peak hours
- Consider paid RPC

**Error: "Invalid transaction version"**
- RPC doesn't support v0 transactions
- Use different RPC
- Alchemy supports this better

**Timeout errors**
- Network issue or RPC slow
- Try again
- Check your internet connection

---

**Status**: Ready to test  
**File**: test-free-rpc.ts  
**Run**: `npx ts-node test-free-rpc.ts`
