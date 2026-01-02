📋 **SOLANA TRANSFER GUIDE - FIXED!**

=================================================================

## ✅ WHAT'S FIXED

The transfer handler now has:
✅ Better wallet address parsing
✅ Support for "all SOL" transfers
✅ Multiple input formats
✅ Clear error messages with examples
✅ Automatic balance checking
✅ Proper validation

=================================================================

## 🔄 HOW TO TRANSFER SOL

### Method 1: Specific Amount + Address
```
"Transfer 1.5 SOL to 9B5X76itxvQcGu6RNGRNnQMJ1NvHMJDiDYMWDPw7u45S"
```

### Method 2: Transfer All SOL
```
"Transfer all SOL to 9B5X76itxvQcGu6RNGRNnQMJ1NvHMJDiDYMWDPw7u45S"
```

### Method 3: Alternative Format with Comma
```
"Transfer 2 SOL, 9B5X76itxvQcGu6RNGRNnQMJ1NvHMJDiDYMWDPw7u45S"
```

### Method 4: Using "Send" Keyword
```
"Send 5 SOL to 9B5X76itxvQcGu6RNGRNnQMJ1NvHMJDiDYMWDPw7u45S"
```

### Method 5: Address Only (Amount from UI)
```
"Transfer to 9B5X76itxvQcGu6RNGRNnQMJ1NvHMJDiDYMWDPw7u45S"
```

=================================================================

## ✅ VALID WALLET ADDRESS FORMAT

**Requirements:**
- 44 characters long
- Base58 characters only (1-9, A-Z except I, O, l, a-z except o)
- No spaces, dashes, or special characters

**Example Valid Address:**
```
9B5X76itxvQcGu6RNGRNnQMJ1NvHMJDiDYMWDPw7u45S
```

**Common Invalid Formats:**
```
❌ 9B5X76itxvQcGu6RNGRNnQMJ1NvHMJDiDYMWDPw7u45S  (with spaces)
❌ 9B5X76it xvQcGu6RNGRNnQMJ1NvHMJDiDYMWDPw7u45S  (space in middle)
❌ 9B5X76-itxvQcGu6RNGRNnQMJ1NvHMJDiDYMWDPw7u45S  (with dash)
❌ 9B5X76itxvQcGu6RNGRNnQMJ10NvHMJDiDYMWDPw7u45S  (invalid char 0)
```

=================================================================

## 🔍 HOW TO GET A VALID WALLET ADDRESS

### From Phantom Wallet:
1. Open Phantom extension
2. Click on your wallet name
3. Click "Copy Address"
4. Paste in transfer command

### From Solana Explorer:
1. Visit https://solscan.io/
2. Search for wallet address
3. Copy the address from the page

### From Solflare:
1. Go to https://solflare.com/
2. Connect wallet
3. Copy address from top of page

=================================================================

## 📝 RESPONSE EXAMPLES

### ✅ Success (Address Validated)
```
✅ Transfer transaction created

From: CMVrzd...YPPJT
To: 9B5X76...45S
Amount: 1.5 SOL

Ready to sign and send!

📝 Next Steps:
1. Sign with Phantom wallet
2. Send transaction
3. Confirmation takes 30-60 seconds
```

### ❌ Error: Non-base58 Character
```
❌ Invalid Recipient Address

9B5X76itxvQcGu6RNGRNnQMJ10NvHMJDiDYMWDPw7u45S

Error: Non-base58 character or invalid format

Valid format: 44-character base58 string
Example: 9B5X76itxvQcGu6RNGRNnQMJ1NvHMJDiDYMWDPw7u45S
```

### ❌ Error: Insufficient Balance
```
❌ Insufficient balance

Your balance: 0.5 SOL
Required: 2 SOL
Shortfall: 1.5 SOL
```

### ❌ Error: Invalid Format
```
❌ Invalid Recipient Address Format

Non-base58 character
```

=================================================================

## 🎯 BEST PRACTICES

1. **Double-check addresses**
   - Copy from official sources
   - Never type manually
   - Test with small amounts first

2. **Format matters**
   - Use "to" keyword: "Transfer X to ADDRESS"
   - No special characters
   - Address must be exact

3. **"All SOL" feature**
   - Automatically fetches your balance
   - Reserves ~0.0025 SOL for transaction fee
   - Perfect for emptying wallet

4. **Error messages**
   - Read the full error
   - Shows exactly what's wrong
   - Provides valid example format

=================================================================

## 🔐 SECURITY TIPS

⚠️ **NEVER:**
- Share your private key
- Type wallet addresses manually
- Use addresses from untrusted sources

✅ **DO:**
- Copy addresses from verified wallets
- Use Phantom "Copy" button
- Verify address matches recipient
- Start with small test amounts

=================================================================

## 🧪 TEST TRANSFER

Try this safe test:
```
Transfer 0.01 SOL to Bv7gzVhvWyAC5MZyR4vz98DTqPiahFQEMDqAPDtEpuMH
```

This is a test address. If it works, your setup is correct!

=================================================================

## 💡 TROUBLESHOOTING

### "Non-base58 character" error?
- Check for spaces
- Look for invalid characters (0, O, I, l, o)
- Ensure 44 character length
- Copy fresh from wallet

### "Invalid wallet address" error?
- Verify you copied full address
- No truncation of address
- Check network (mainnet vs devnet)
- Address must be on-curve

### Transfer still failing?
- Restart server: `elizaos start`
- Clear browser cache
- Try different browser
- Check RPC connection status

=================================================================

✅ **Your transfer handler is now fixed and ready!**

Use the format: "Transfer [amount] SOL to [valid-address]"
