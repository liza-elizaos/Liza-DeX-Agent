# 🚀 Quick Start - Real Token Creation Testing

## ✅ System Status

**Server**: Running at `http://localhost:3001`
**Status**: ✅ Online and Ready
**Integration**: ✅ Real Solana Mainnet

---

## 🎯 Quick Test (2 minutes)

### Step 1: Open the Interface
```
http://localhost:3001
```

You should see:
- ✅ LIZA Token Launcher header
- ✅ Chat section with LIZA greeting
- ✅ Token form on the right

### Step 2: Fill in Token Details
```
Name:           TestMeme
Symbol:         TMEM  
Description:    A test token on Solana
Tone:           Edgy & Meme
Initial Supply: 1000000
Logo:           (optional - select meme_token.png)
```

### Step 3: Click "🚀 Launch Token"

### Step 4: Wait for Transaction
- Processing message appears
- Takes 10-60 seconds (blockchain confirmation)
- Shows progress status

### Step 5: Receive Results
```json
{
  "mint": "Token Address Here",
  "transaction": "Tx Signature Here",
  "explorer": "https://solscan.io/token/...",
  "message": "✅ Token created successfully!"
}
```

### Step 6: Verify on Solscan
Click the Solscan link to see:
- ✅ Token metadata
- ✅ Supply amount
- ✅ Mint authority
- ✅ Transaction history

---

## 📊 What Happens Behind the Scenes

When you click "Launch Token":

```
1. Frontend sends form data to /api/token/create
2. Backend receives request
3. Loads private key from .env (DEV_WALLET_PRIVATE_KEY)
4. Connects to Solana mainnet RPC
5. Validates wallet has enough SOL (min 1 SOL)
6. Creates new mint account keypair
7. Builds token creation transaction
8. Signs with wallet private key
9. Sends to blockchain
10. Waits for confirmation (10-60s)
11. (Optional) Mints initial supply
12. Returns real mint address & tx signature
13. Frontend displays explorer links
```

---

## ✅ Wallet Status

### Checking Wallet Info
```
Wallet Address: 6VR1QcueqMDSgqDZ2JvcRumFu1Azo53qgy66XDJTvA1C
Private Key:    [Loaded from .env]
RPC:           https://api.mainnet-beta.solana.com
```

### Checking Balance
**via Solscan**: 
```
https://solscan.io/account/6VR1QcueqMDSgqDZ2JvcRumFu1Azo53qgy66XDJTvA1C
```

**Required Balance**: Minimum 1 SOL for token creation

---

## 🔍 Verification Steps

### After Token Creation

1. **Check the Response**
   ```json
   {
     "success": true,
     "mint": "Your_Token_Address"
   }
   ```

2. **Click "View on Solscan"**
   - Confirms token exists on-chain
   - Shows metadata
   - Displays supply

3. **Check Your Wallet**
   - Solscan: Account page shows created tokens
   - Phantom wallet: May take 1-2 minutes to show

4. **Verify on Multiple Explorers**
   - Solscan: https://solscan.io/token/{MINT}
   - Pump.fun: https://pump.fun/{MINT}
   - Solana Beach: https://solanabeach.io/token/{MINT}

---

## 🧪 Testing Scenarios

### Scenario 1: Successful Token Creation ✅
```
Input: Valid token name, symbol, description
Expected: Token appears on-chain, links provided
Actual: [Test this]
Result: ✅ / ❌
```

### Scenario 2: With Logo Upload ✅
```
Input: Select meme_token.png
Expected: Logo included in metadata
Actual: [Test this]
Result: ✅ / ❌
```

### Scenario 3: Custom Supply ✅
```
Input: Change initialSupply to 5000000
Expected: Token shows 5M supply on Solscan
Actual: [Test this]
Result: ✅ / ❌
```

### Scenario 4: Multiple Tokens ✅
```
Input: Create 3 different tokens
Expected: All appear on chain, different addresses
Actual: [Test this]
Result: ✅ / ❌
```

---

## 🆘 Troubleshooting

### Problem: "Cannot connect to port 3001"
**Solution**: 
```bash
# Check if server is running
tasklist | find "node"

# If not running, start it:
cd d:\shina\token-launcher
npm start

# Or:
node dist/server.js
```

### Problem: "Insufficient balance" Error
**Solution**:
- Fund wallet at: https://faucet.solana.com (devnet only)
- Or transfer SOL to the wallet address
- Requires minimum 1 SOL

### Problem: Transaction Times Out
**Solution**:
- Check internet connection
- Verify RPC endpoint is accessible
- Try again (network congestion)
- Maximum wait: 60 seconds

### Problem: Private Key Error
**Solution**:
- Verify DEV_WALLET_PRIVATE_KEY is set in .env
- Check key format (base58 or array)
- Ensure .env file is in token-launcher directory

### Problem: Logo Upload Fails
**Solution**:
- Check file size (max 10MB)
- Use supported formats: PNG, JPG, GIF, WebP
- Verify file path exists

---

## 📈 Metrics to Track

During testing, note:

```
Total Tokens Created: [ ]
Average Creation Time: [ ] seconds
Success Rate: [ ] %
Failed Transactions: [ ]
Most Common Error: [ ]
```

---

## 🔐 Security Reminders

- ✅ Private key stays on server only
- ✅ Never share private key
- ✅ Never expose key in frontend code
- ✅ .env file not included in git
- ✅ Use environment variables in production

---

## 📝 Test Report Template

```
Date: [Today]
Wallet: 6VR1QcueqMDSgqDZ2JvcRumFu1Azo53qgy66XDJTvA1C
Server: localhost:3001

Test 1: Basic Token Creation
  Name: TestMeme
  Symbol: TMEM
  Result: ✅ / ❌
  Mint: [Address]
  Link: [Solscan URL]

Test 2: With Logo Upload
  Result: ✅ / ❌
  Notes: [Any issues]

Test 3: Custom Supply
  Supply: 5000000
  Result: ✅ / ❌
  Verified: ✅ / ❌

Summary:
  Total Tests: 3
  Passed: 
  Failed:
  Notes:
```

---

## 🎯 Success Criteria

Token creation is working when:
- ✅ Form submits without errors
- ✅ Response includes real mint address
- ✅ Response includes transaction signature
- ✅ Mint address appears on Solscan within 1 minute
- ✅ Token metadata matches submitted data
- ✅ Initial supply matches submitted amount
- ✅ Can view token on multiple explorers

---

## 📚 Documentation

For more details, see:
- `REAL_SOLANA_INTEGRATION.md` - Full technical details
- `CHANGES_MADE.md` - Code changes made
- `SYSTEM_STATUS.md` - Server status

---

**Ready to Test**: ✅ Yes
**Start Point**: http://localhost:3001
**Date**: January 6, 2026
