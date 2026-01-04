# ⚡ LIZA Features - Quick Commands Reference

## 🎯 LIZA Ab Kya Kar Sakta Hai (What LIZA Can Do Now)

---

## 📊 **PORTFOLIO** (Naya Feature! 🆕)

### Commands:
```
"show my portfolio"
"portfolio analysis"
"portfolio summary"
"what's my total value"
"my assets"
"token holdings"
```

### Output:
```
💼 **PORTFOLIO ANALYSIS**
├─ Total Value: $X,XXX.XX
├─ Tokens: 5
├─ SOL: X.XX ($XXXX)
├─ USDC: XXX ($XXXX)
└─ Top holdings breakdown...
```

### Takes: ~5 seconds

---

## 💰 **GET BALANCE**

### Commands:
```
"check balance"
"wallet balance"
"how much sol do I have"
"my balance"
"get balance"
```

### Output:
```
✅ **Wallet Balance**
📍 Address: CMVrz...
💰 Balance: **5.5000 SOL**
(5500000000 lamports)
```

### Takes: ~2 seconds

---

## 🔄 **TRANSFER SOL**

### Commands:
```
"send 1 SOL to <wallet>"
"transfer 2.5 sol to ADDRESS"
"send all SOL to ADDRESS"
"transfer max to ADDRESS"
```

### Example:
```
"send 1 SOL to DezXAZ8z7PnrnRJjoBXwYaKe2XTis3Zonw1j1axNac5"
```

### Output:
```
✅ **Transfer Complete!**
From: CMVrz...
To: DezXA...
Amount: 1.0 SOL
Tx Hash: 5Kp8...
```

### ⚠️ Careful - This sends real SOL!

---

## 🔀 **TOKEN SWAP**

### Commands:
```
"buy 100 USDC from SOL"
"swap 1 SOL for USDC"
"exchange 100 BONK for SOL"
"trade SOL to USDC"
```

### Example:
```
"buy 100 USDC with 1 SOL"
```

### Output:
```
✅ **Swap Successful!**
From: 1 SOL
To: 195.50 USDC
Rate: 1 SOL = 195.50 USDC
Tx Hash: 7Km9...
```

### ⚠️ Real transaction - actual SOL/tokens used!

---

## 🔮 **UPCOMING FEATURES** (Soon! ⏳)

### #1 PRICE MONITORING (10 min away)
```
"what's the price of SOL"
"show prices: SOL, USDC, BONK"
"price of bitcoin" (coming soon)
```

### #2 BALANCE HISTORY (15 min away)
```
"show my balance history"
"wallet transactions"
"when did I get 5 SOL"
```

### #3 PRICE ALERTS (20 min away)
```
"alert me when SOL = $200"
"notify if BONK hits $0.00001"
"track USDC price"
```

### #4 ORDER MANAGEMENT (30 min away)
```
"place buy order: 10 USDC when SOL = $195"
"sell 100 BONK at $0.000006"
"show pending orders"
```

### ... and 6 more advanced features!

---

## ✨ **SPECIAL COMMANDS**

### General Info:
```
"solana features"
"what can you do"
"help me"
"how do I use this"
```

### Info:
```
LIZA is your autonomous Solana AI agent
├─ Can check balances
├─ Can send SOL
├─ Can swap tokens
├─ Can analyze portfolio
└─ Can do much more!
```

---

## 🚀 **HOW TO ACCESS**

### Option 1: Vercel (Already Deployed)
```
Go to: https://shina-q05uuvffb-...vercel.app
Click on LIZA chatbot
Start chatting!
```

### Option 2: Local Development
```bash
cd d:\shina
bun run dev
# Opens chat interface
# Start typing commands
```

### Option 3: Telegram (If Configured)
```
Add @LizaSolanaBot
Send commands
Get responses
```

---

## ⚙️ **QUICK SETUP**

### Before Using (First Time):

1. **Environment Variables** (`.env` file):
```
SOLANA_PUBLIC_KEY=CMVrzdso4SShQm2irrc7jMCN9Vw5QxXvrZKB79cYPPJT
SOLANA_PRIVATE_KEY=<your-secret-key>
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
```

2. **Build Project**:
```bash
bun run build
```

3. **Run Locally**:
```bash
bun run dev
```

4. **Deploy to Vercel**:
```bash
git push  # Auto-deploys!
```

---

## 📊 **FEATURE STATUS TABLE**

| Feature | Status | Time | Ready? |
|---------|--------|------|--------|
| Get Balance | ✅ Live | 2s | Yes |
| Transfer SOL | ✅ Live | 5s | Yes |
| Token Swap | ✅ Live | 10s | Yes |
| Portfolio | ✅ NEW! | 5s | Yes |
| Price Monitor | ⏳ Ready | 10m | Soon |
| Balance History | ⏳ Ready | 15m | Soon |
| Price Alerts | ⏳ Ready | 20m | Soon |
| Order Manage | ⏳ Ready | 30m | Soon |
| Automated Bot | 🔴 Complex | 2h | Later |
| Yield Farming | 🔴 Complex | 2h | Later |
| Market Making | 🔴 Complex | 2h | Later |

---

## 💡 **TIPS**

### For Best Results:

✅ Be specific: "show my portfolio" not just "portfolio"  
✅ Use full wallet addresses when needed  
✅ Check balance before swapping  
✅ Review amounts before transfers  
✅ Double-check addresses for transfers  

### Avoid:

❌ Don't ask for prices in USD only (use token names)  
❌ Don't use special characters in commands  
❌ Don't type too fast (let LIZA respond first)  
❌ Don't send tiny amounts (watch gas fees)  

---

## 🎯 **COMMON WORKFLOWS**

### Workflow 1: Check Assets
```
1. "show my portfolio"
   ↓
2. See all holdings + values
   ↓
3. Done!
```

### Workflow 2: Send SOL
```
1. "check balance" (verify you have SOL)
   ↓
2. "send 1 SOL to ADDRESS"
   ↓
3. Confirm transaction hash
   ↓
4. Done!
```

### Workflow 3: Swap Tokens
```
1. "show my portfolio" (see what you have)
   ↓
2. "swap 1 SOL for USDC"
   ↓
3. Review swap details
   ↓
4. LIZA executes automatically
   ↓
5. Done!
```

### Workflow 4: Monitor & Alert (New)
```
1. "alert me when SOL = $200" (new feature)
   ↓
2. LIZA checks every 5 min
   ↓
3. Get notified when target hit!
```

---

## 🔐 **SECURITY REMINDERS**

✅ Never share private keys  
✅ LIZA runs on secure servers  
✅ Portfolio = read-only (safe)  
✅ Transfers = uses stored private key (secure)  
✅ Never store keys in messages  
✅ Use environment variables for secrets  

---

## 📞 **TROUBLESHOOTING**

### "Portfolio showing $0"
→ Wallet may be empty  
→ Try with a different wallet address  

### "Can't get prices"
→ Internet connection check  
→ API might be rate limited  
→ Falls back to cached prices  

### "Transfer failed"
→ Insufficient SOL for gas fees  
→ Check balance first  
→ Wallet address invalid?  

### "Swap not working"
→ Check if you have the token  
→ Sufficient SOL for fees?  
→ Try again in a moment  

---

## 📈 **WHAT'S NEXT?**

### Week 1 (NOW):
✅ Use Portfolio feature  
✅ Try swapping/transfers  
✅ Get comfortable with LIZA  

### Week 2:
⏳ Price monitoring added  
⏳ Balance history added  
⏳ More commands available  

### Week 3:
⏳ Price alerts working  
⏳ Order management ready  
⏳ Automated trading options  

---

## 🚀 **START USING LIZA NOW!**

### Online (Vercel):
```
Visit: https://shina-...vercel.app
Click LIZA
Start chatting!
```

### Local (Development):
```bash
bun run dev
# Then type any command above
```

### Try Now:
```
"show my portfolio"
```

---

## 📝 **QUICK COMMAND LIST**

```
PORTFOLIO:
  - "show my portfolio"
  - "portfolio analysis"
  - "my total value"

BALANCE:
  - "check balance"
  - "wallet balance"

TRANSFERS:
  - "send 1 SOL to <address>"
  - "transfer <amount> to <address>"

SWAPS:
  - "buy 100 USDC from SOL"
  - "swap 1 SOL for USDC"
  - "exchange tokens"

COMING SOON:
  - "what's the price of SOL"
  - "alert me when SOL = $200"
  - "show balance history"
  - "place buy order"
```

---

**Ready? Start chatting with LIZA now! 🤖**

Go to: https://shina-...vercel.app  
Or run: `bun run dev`

Have fun! 🚀
