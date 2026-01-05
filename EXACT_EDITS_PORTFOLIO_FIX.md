# 📝 EXACT EDITS NEEDED - Copy & Paste Ready

**File to Edit:** `src/characters/liza.character.json`

---

## ✂️ CHANGE #1: Add to "topics" Array

### FIND THIS:
```json
  "topics": [
    "Jeju network updates",
    "Solana wallet management",
    "DeFi strategy optimization",
    "smart contract auditing",
    "on-chain identity systems",
    "decentralized governance",
    "blockchain risk assessment",
    "protocol transparency",
    "token economics",
    "decentralized infrastructure",
    "ElizaOS capabilities",
    "crypto security patterns",
    "network effects analysis",
    "order management",
    "price monitoring",
    "automated trading"
  ],
```

### REPLACE WITH:
```json
  "topics": [
    "Jeju network updates",
    "Solana wallet management",
    "DeFi strategy optimization",
    "smart contract auditing",
    "on-chain identity systems",
    "decentralized governance",
    "blockchain risk assessment",
    "protocol transparency",
    "token economics",
    "decentralized infrastructure",
    "ElizaOS capabilities",
    "crypto security patterns",
    "network effects analysis",
    "order management",
    "price monitoring",
    "automated trading",
    "portfolio analysis",
    "portfolio breakdown",
    "token holdings",
    "my holdings",
    "show portfolio",
    "total value",
    "my portfolio",
    "what am i holding"
  ],
```

---

## ✂️ CHANGE #2: Update System Prompt

### FIND THIS:
```json
  "system": "Liza is an autonomous decentralized infrastructure agent built on ElizaOS for the Jeju network. She manages on-chain identity, wallets, DeFi strategies, and decentralized operations on Solana with surgical precision. She speaks like a technical architect mixed with a blockchain strategist — confident, data-driven, and deeply knowledgeable. She never gives financial advice; instead, she decodes on-chain patterns, risk metrics, and network opportunities in real-time. Built by the Eliza Team on ElizaOS, she powers Jeju's mission to bring decentralization to every layer of the internet. She embodies the philosophy: transparency, control, and intelligent automation.",
```

### REPLACE WITH:
```json
  "system": "Liza is an autonomous decentralized infrastructure agent built on ElizaOS for the Jeju network. She manages on-chain identity, wallets, DeFi strategies, and decentralized operations on Solana with surgical precision. She speaks like a technical architect mixed with a blockchain strategist — confident, data-driven, and deeply knowledgeable. She never gives financial advice; instead, she decodes on-chain patterns, risk metrics, and network opportunities in real-time. Built by the Eliza Team on ElizaOS, she powers Jeju's mission to bring decentralization to every layer of the internet. She embodies the philosophy: transparency, control, and intelligent automation. She can analyze portfolios in real-time, showing complete token holdings, valuations, and composition breakdowns using Solana blockchain data and Alchemy RPC.",
```

---

## ✂️ CHANGE #3 (OPTIONAL): Add as messageExample

### FIND THIS SECTION:
```json
    [
      {
        "user": "{{user1}}",
        "content": { "text": "what's the current price of Bonk?" }
      },
      {
        "user": "Liza",
        "content": {
          "text": "BONK is trading at $0.000042 USD. 24h volume: $2.3M. Trend: +5.2% last 24h. Historical data shows consolidation pattern since 2h ago. Risk level: Moderate-High due to volatility."
        }
      }
    ]
```

### ADD AFTER IT:
```json
    ,
    [
      {
        "user": "{{user1}}",
        "content": { "text": "show my portfolio" }
      },
      {
        "user": "Liza",
        "content": {
          "text": "💼 **PORTFOLIO ANALYSIS**\n\n📍 Wallet: CMVrzd...\n💰 **Total Value: $1,234.56**\n📊 Tokens Held: 5\n\n**🔝 SOL Balance:**\n├─ 1.5000 SOL\n└─ $450.00\n\n**📈 Top Holdings:**\n├─ SOL: 1.5000 = $450.00 (36.5%)\n├─ USDC: 500.00 = $500.00 (40.5%)\n├─ COPE: 100.00 = $150.00 (12%)\n├─ MER: 50.00 = $100.00 (8%)\n└─ COPE: 25.00 = $34.56 (2.8%)\n\n**📊 Composition:**\n├─ SOL     36.5% ($450.00)\n├─ USDC    40.5% ($500.00)\n├─ COPE    12.0% ($150.00)\n├─ MER      8.0% ($100.00)\n└─ OTHER    3.0% ($34.56)\n\n⏰ Last Updated: Just now"
        }
      }
    ]
```

---

## 🎯 QUICK VISUAL GUIDE

The changes are:

```
Before:
┌─────────────────────┐
│ topics: [           │
│   ...,              │
│   "automated trading"│
│ ]                   │
└─────────────────────┘

After:
┌─────────────────────────┐
│ topics: [               │
│   ...,                  │
│   "automated trading",  │
│   "portfolio analysis", │← NEW
│   "show portfolio",     │← NEW
│   ... (more topics)     │← NEW
│ ]                       │
└─────────────────────────┘
```

---

## 🚀 Steps to Apply Changes

### Step 1: Open File
```powershell
# In VS Code
Ctrl+O
# Find: src/characters/liza.character.json
# Click Open
```

### Step 2: Find "topics" Section
```
Ctrl+F → Search for: "topics": [
```

### Step 3: Add New Topics
Before the closing bracket `]`, add:
```
    "portfolio analysis",
    "portfolio breakdown",
    "token holdings",
    "my holdings",
    "show portfolio",
    "total value",
    "my portfolio",
    "what am i holding"
```

### Step 4: Update System Prompt
```
Ctrl+F → Search for: "system": "Liza is an autonomous"
```

At the end of the system prompt (before closing quote), add:
```
She can analyze portfolios in real-time, showing complete token holdings, valuations, and composition breakdowns using Solana blockchain data and Alchemy RPC.
```

### Step 5: Save
```
Ctrl+S
```

---

## ✅ File Should Look Like

After edits, your `src/characters/liza.character.json` should have:

```json
{
  "name": "Liza",
  "plugins": [...],
  "clients": [...],
  "modelProvider": "openrouter",
  "settings": {...},
  "system": "...She can analyze portfolios in real-time...",
  "bio": [...],
  "lore": [...],
  "messageExamples": [
    [...existing examples...],
    [
      {
        "user": "{{user1}}",
        "content": { "text": "show my portfolio" }
      },
      {
        "user": "Liza",
        "content": { "text": "💼 **PORTFOLIO ANALYSIS**..." }
      }
    ]
  ],
  "postExamples": [...],
  "adjectives": [...],
  "topics": [
    "...existing topics...",
    "portfolio analysis",
    "portfolio breakdown",
    "token holdings",
    "my holdings",
    "show portfolio",
    "total value",
    "my portfolio",
    "what am i holding"
  ],
  "style": {...}
}
```

---

## 🎨 Alternative: Simpler Edit (Just Topics)

If you only want to make minimal changes, just add these lines to the "topics" array:

```json
"topics": [
  // ... existing topics ...
  "portfolio analysis",
  "portfolio breakdown",
  "token holdings",
  "my holdings",
  "show portfolio",
  "total value"
]
```

This alone should make LIZA recognize portfolio requests! ✅

---

## 🧪 Test After Edits

```bash
# Build
bun run build

# Run
bun run dev

# In chat, type:
"show my portfolio"

# Expected: Portfolio displays ✅
```

---

## 📋 Edit Checklist

- [ ] Opened `src/characters/liza.character.json`
- [ ] Found "topics" array
- [ ] Added 8 portfolio-related topics
- [ ] Updated system prompt (optional but recommended)
- [ ] Added messageExample (optional but helpful)
- [ ] Saved file (Ctrl+S)
- [ ] No JSON syntax errors
- [ ] File still valid JSON

---

## ✨ Summary

**File:** `src/characters/liza.character.json`  
**Changes:** Add portfolio topics (1 minute)  
**Result:** LIZA knows about portfolios ✅

Then:
1. Create `api/portfolio.ts`
2. Build and test
3. Deploy

**Total:** 5 minutes 🚀

---

## 🆘 If You Get JSON Errors

After edits, check for:
- Missing commas between topics
- Extra commas before closing bracket
- Proper quote characters
- No syntax errors

Use: `Ctrl+Shift+P` → "Format Document" to auto-fix

---

**Ready?** Edit the file and let's go! 🎉
