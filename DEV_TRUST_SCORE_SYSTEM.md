# 🔍 DEV TRUST SCORE SYSTEM - IMPLEMENTATION GUIDE

**Purpose**: Detect developer credibility based on on-chain transaction history  
**Status**: To be implemented  
**Date**: January 4, 2026

---

## 📋 WHAT THE SYSTEM SHOULD DO

### Command:
```
check dev trust [wallet_address]
check dev trust HdZh1mUvCVJzHfTFaJJxZJFENhiFAkyiXLA5iZZTpump
```

### Response Should Include:
```
✅ Developer Trust Score Report

Wallet Address: HdZh1mUvCVJzHfTFaJJxZJFENhiFAkyiXLA5iZZTpump
Network: Solana Mainnet

📊 METRICS:
├─ Total Transactions: 1,247
├─ Token Launches: 12
├─ Coins Created (SPL): 8
├─ Unique Contract Interactions: 34
├─ Total Volume Traded: 450.5 SOL
├─ Account Age: 18 months
├─ Funded Other Wallets: 23 addresses
└─ Last Activity: 2 hours ago

🎯 TRUST SCORE: 7.8/10 (MEDIUM-HIGH)

✅ GREEN FLAGS:
✅ Regular on-chain activity (not dormant)
✅ Multiple successful token launches
✅ Active trading history (liquid market maker behavior)
✅ Account age > 6 months (established)
✅ No obvious rug pulls detected

⚠️ YELLOW FLAGS:
⚠️ Moderate token launch frequency (reasonable rate)
⚠️ Some tokens with low liquidity

❌ RED FLAGS:
❌ None detected

💡 RECOMMENDATION:
This developer appears CREDIBLE. Medium-High trust score suitable for:
- Partnership discussions
- Liquidity pools
- Token collaborations
- Smart contract audits
```

---

## 🔧 TECHNICAL IMPLEMENTATION

### 1. Add to SYSTEM_PROMPT (api/chat.ts)

```typescript
Add this to SYSTEM_PROMPT:

"DEV TRUST SCORE SYSTEM:
When user says: 'check dev trust [wallet]'

You must:
1. Call the dev_trust_score function
2. Fetch on-chain data from Solana RPC
3. Analyze:
   - Total transactions
   - Token launches (SPL tokens created)
   - Trading volume
   - Account age
   - Suspicious patterns
4. Calculate trust score (0-10):
   - 0-2: Scammer/rug pull patterns
   - 3-4: New/unproven
   - 5-6: Moderate activity, some launches
   - 7-8: Active developer, multiple launches
   - 9-10: Established, trusted developer
5. List GREEN/YELLOW/RED flags
6. Give RECOMMENDATION"
```

---

### 2. Create Trust Score Function

**File**: `api/trust-score.ts` (NEW FILE)

```typescript
import { PublicKey, Connection } from '@solana/web3.js';

interface TrustScoreData {
  walletAddress: string;
  totalTransactions: number;
  tokenLaunches: number;
  splTokensCreated: number;
  uniqueContracts: number;
  totalVolume: number;
  accountAge: number; // in days
  lastActivity: string; // ISO format string, not Date object
  greenFlags: string[];
  yellowFlags: string[];
  redFlags: string[];
  trustScore: number; // 0-10
  recommendation: string;
}

export async function calculateDevTrustScore(
  walletAddress: string,
  rpcUrl: string
): Promise<TrustScoreData> {
  // FIX: Add maxSupportedTransactionVersion to handle newer transaction formats
  const connection = new Connection(rpcUrl, {
    commitment: 'confirmed',
    maxSupportedTransactionVersion: 0
  });
  
  const pubkey = new PublicKey(walletAddress);

  try {
    // 1. GET TRANSACTION HISTORY (increased limit to 500 for better accuracy)
    const signatures = await connection.getSignaturesForAddress(pubkey, {
      limit: 500  // Increased from 100 to get more data
    });
    
    const totalTransactions = signatures.length;
    
    console.log(`[TRUST] Analyzing ${totalTransactions} transactions for ${walletAddress}`);

    // 2. ANALYZE TRANSACTIONS
    let tokenLaunches = 0;
    let splTokensCreated = 0;
    let uniqueContracts = new Set<string>();
    let totalVolume = 0;
    let lastActivityDate = new Date();
    let fundedWallets = new Set<string>();

    // Get account creation time from first (oldest) transaction
    let accountAge = 0;
    let oldestTime = Date.now();
    
    if (signatures.length > 0) {
      const oldestSig = signatures[signatures.length - 1];
      const oldestBlockTime = (oldestSig.blockTime || 0) * 1000;
      oldestTime = oldestBlockTime;
      accountAge = Math.floor((Date.now() - oldestTime) / (1000 * 60 * 60 * 24));
      
      // Most recent activity
      const newestSig = signatures[0];
      lastActivityDate = new Date((newestSig.blockTime || 0) * 1000);
    }

    // Process each transaction (check up to 200, not just 50)
    for (let i = 0; i < Math.min(signatures.length, 200); i++) {
      try {
        const sig = signatures[i];
        
        // Get raw transaction to detect program interactions
        const tx = await connection.getTransaction(sig.signature, {
          maxSupportedTransactionVersion: 0
        });
        
        if (!tx) continue;

        if (tx.blockTime) {
          lastActivityDate = new Date(tx.blockTime * 1000);
        }

        // Count program interactions
        const programIds = tx.transaction.message.accountKeys.slice(0, 10);
        programIds.forEach(pk => {
          uniqueContracts.add(pk.pubkey.toString());
        });

        // Improved token launch detection:
        // Check for InitializeMint instruction in the transaction
        const hasInitializeMint = tx.transaction.message.instructions.some((instr: any) => {
          // Check parsed format
          if (instr.parsed?.type === 'initializeMint') {
            return true;
          }
          // Check if instruction mentions "InitializeMint"
          const instrStr = JSON.stringify(instr).toLowerCase();
          return instrStr.includes('initializemint');
        });

        if (hasInitializeMint) {
          tokenLaunches++;
          splTokensCreated++;
          console.log(`[TRUST] Found token launch in tx: ${sig.signature}`);
        }

        // Alternative detection: Look for TokenkegQfe program (SPL Token program)
        // AND account creation (new token mint account)
        const splTokenProgram = 'TokenkegQfeZyiNwAJsyFbPVwwQQfփMT';
        const hasSPLProgram = tx.transaction.message.programIds?.some(
          (pid: any) => pid?.toString?.()?.includes('TokenkegQfe') || pid?.toString?.() === splTokenProgram
        );

        // If we already counted it above, skip
        if (hasSPLProgram && !hasInitializeMint) {
          const instrDetails = JSON.stringify(tx.transaction.message.instructions);
          if (instrDetails.includes('Mint') || instrDetails.includes('initialize')) {
            if (!tokenLaunches || tokenLaunches < 1) {
              tokenLaunches++;
              splTokensCreated++;
            }
          }
        }

      } catch (txError) {
        console.log(`[TRUST] Skipped transaction ${signatures[i].signature}`);
        // Continue to next transaction
      }
    }

    // 3. DETECT FLAGS
    const greenFlags: string[] = [];
    const yellowFlags: string[] = [];
    const redFlags: string[] = [];

    // GREEN FLAGS
    if (totalTransactions > 100) {
      greenFlags.push("Regular on-chain activity (100+ transactions)");
    }
    if (tokenLaunches >= 3) {
      greenFlags.push("Multiple successful token launches");
    }
    if (accountAge > 180) {
      greenFlags.push("Established account (6+ months old)");
    }
    if (lastActivity.getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000) {
      greenFlags.push("Recent activity (within last week)");
    }
    if (uniqueContracts.size > 10) {
      greenFlags.push("Active DeFi participant (10+ contract interactions)");
    }

    // YELLOW FLAGS
    if (tokenLaunches > 20) {
      yellowFlags.push("High frequency token launches (risky)");
    }
    if (accountAge > 0 && accountAge < 30) {
      yellowFlags.push("New account (< 1 month old)");
    }
    if (totalVolume < 10 && totalTransactions > 50) {
      yellowFlags.push("Low trading volume for transaction count");
    }
    if (lastActivityDate.getTime() < Date.now() - 30 * 24 * 60 * 60 * 1000) {
      yellowFlags.push("Inactive (last transaction 30+ days ago)");
    }

    // RED FLAGS
    if (tokenLaunches > 50) {
      redFlags.push("Excessive token launches (potential scammer)");
    }

    // 4. CALCULATE TRUST SCORE (0-10)
    let trustScore = 5; // Base score

    // Add/subtract based on metrics
    if (greenFlags.length >= 4) trustScore += 3;
    else if (greenFlags.length >= 2) trustScore += 1.5;

    if (redFlags.length > 0) trustScore -= 5;
    if (yellowFlags.length > 2) trustScore -= 1;

    if (accountAge > 365) trustScore += 1;
    if (totalTransactions > 500) trustScore += 1;
    if (tokenLaunches > 0 && tokenLaunches <= 5) trustScore += 1;

    // Cap score between 0-10
    trustScore = Math.max(0, Math.min(10, trustScore));

    // 5. GENERATE RECOMMENDATION
    let recommendation = '';
    if (trustScore >= 8) {
      recommendation = 'HIGH TRUST - Established developer with proven track record';
    } else if (trustScore >= 6) {
      recommendation = 'MEDIUM-HIGH TRUST - Active developer with good activity';
    } else if (trustScore >= 4) {
      recommendation = 'MEDIUM TRUST - Some activity but needs verification';
    } else if (trustScore >= 2) {
      recommendation = 'LOW TRUST - Limited history or risky patterns';
    } else {
      recommendation = 'DO NOT TRUST - Major red flags detected';
    }

    return {
      walletAddress,
      totalTransactions,
      tokenLaunches,
      splTokensCreated,
      uniqueContracts: uniqueContracts.size,
      totalVolume: Math.round(totalVolume * 100) / 100,
      accountAge,
      lastActivity: lastActivityDate.toISOString(), // Convert to ISO string format
      greenFlags,
      yellowFlags,
      redFlags,
      trustScore: Math.round(trustScore * 10) / 10,
      recommendation
    };

  } catch (error: any) {
    console.error('[TRUST_ERROR]', error.message);
    throw new Error(`Failed to analyze wallet: ${error.message}`);
  }
}
```

---

### 3. Add to Handler (api/chat.ts)

```typescript
// FIX: Import at top of file
import { calculateDevTrustScore } from './trust-score';

// Add to handler() function around line 500

if (message.toLowerCase().includes('check dev trust')) {
  const walletMatch = message.match(/check dev trust\s+(\w+)/i);
  if (!walletMatch) {
    return {
      response: "❌ Please provide a wallet address: 'check dev trust [address]'",
      error: true
    };
  }

  const walletAddress = walletMatch[1];
  
  try {
    console.log(`[TRUST] Analyzing wallet: ${walletAddress}`);
    
    const trustData = await calculateDevTrustScore(
      walletAddress,
      process.env.SOLANA_RPC_URL || 'https://solana-mainnet.g.alchemy.com/v2/demo'
    );

    const flagsSection = `
${trustData.greenFlags.length > 0 ? `✅ GREEN FLAGS (${trustData.greenFlags.length}):\n${trustData.greenFlags.map(f => `  ✅ ${f}`).join('\n')}\n` : ''}
${trustData.yellowFlags.length > 0 ? `⚠️ YELLOW FLAGS (${trustData.yellowFlags.length}):\n${trustData.yellowFlags.map(f => `  ⚠️ ${f}`).join('\n')}\n` : ''}
${trustData.redFlags.length > 0 ? `❌ RED FLAGS (${trustData.redFlags.length}):\n${trustData.redFlags.map(f => `  ❌ ${f}`).join('\n')}\n` : ''}`;

    const response = `
✅ **Developer Trust Score Report**

**Wallet**: ${trustData.walletAddress}
**Trust Score**: ${trustData.trustScore}/10 ${getTrustEmoji(trustData.trustScore)}

**📊 METRICS:**
• Total Transactions: ${trustData.totalTransactions}
• Token Launches: ${trustData.tokenLaunches}
• Account Age: ${trustData.accountAge} days
• Last Activity: ${new Date(trustData.lastActivity).toLocaleDateString()}
• Unique Contracts: ${trustData.uniqueContracts}

${flagsSection}
**💡 RECOMMENDATION:**
${trustData.recommendation}

**Risk Level**: ${getRiskLevel(trustData.trustScore)}
    `;

    return {
      response,
      trustScore: trustData
    };
  } catch (error: any) {
    console.error('[TRUST_ERROR]', error);
    return {
      response: `❌ Error analyzing wallet: ${error.message}. Please verify the wallet address is valid.`,
      error: true
    };
  }
}

// Helper function
function getTrustEmoji(score: number): string {
  if (score >= 8) return '🟢';
  if (score >= 6) return '🟡';
  return '🔴';
}

function getRiskLevel(score: number): string {
  if (score >= 8) return '🟢 LOW RISK';
  if (score >= 6) return '🟡 MEDIUM RISK';
  if (score >= 4) return '🟡 MEDIUM-HIGH RISK';
  return '🔴 HIGH RISK';
}
```

---

## 🧪 TESTING CHECKLIST

### Frontend Test:
1. Open browser DevTools
2. Type: `check dev trust HdZh1mUvCVJzHfTFaJJxZJFENhiFAkyiXLA5iZZTpump`
3. Should see:
   - ✅ Trust score calculated
   - ✅ Metrics displayed
   - ✅ Flags listed
   - ✅ Recommendation shown

### Test Different Wallets:

**Wallet Type 1: New Account**
```
check dev trust [new_wallet_address]
Expected: Score 2-3, warning: "New account"
```

**Wallet Type 2: Active Developer**
```
check dev trust [active_dev_address]
Expected: Score 7-8, recommendation: "High trust"
```

**Wallet Type 3: Suspicious Account**
```
check dev trust [suspicious_wallet]
Expected: Score 1-2, red flags: "Rug pull pattern"
```

---

## 🎯 TRUST SCORE RANGES

| Score | Level | Meaning | Action |
|-------|-------|---------|--------|
| 9-10 | 🟢 Excellent | Highly trusted developer | Partner/Collaborate |
| 7-8 | 🟢 Good | Established developer | Trust for major deals |
| 5-6 | 🟡 Medium | Active but unproven | Verify independently |
| 3-4 | 🟡 Low | Limited history | Request references |
| 1-2 | 🔴 Very Low | High risk | DO NOT TRUST |

---

## 📊 SCORING LOGIC

### Points Added:
```
✅ 3 points: 4+ green flags
✅ 1.5 points: 2-3 green flags
✅ 1 point: Account age > 1 year
✅ 1 point: 500+ transactions
✅ 1 point: 1-5 successful token launches
```

### Points Subtracted:
```
❌ 5 points: Any red flag
❌ 1 point: Each yellow flag (max 3)
```

### Base Score: 5/10

---

## ⚙️ IMPLEMENTATION STEPS

### Step 1: Create trust-score.ts
```bash
Create: src/trust-score.ts
Copy: Code from above section
```

### Step 2: Update api/chat.ts
```bash
Line 1: Add import { calculateDevTrustScore } from './trust-score'
Line ~500: Add handler for "check dev trust" command
```

### Step 3: Update SYSTEM_PROMPT
```bash
Add DEV_TRUST_SCORE section to AI instructions
Tell AI to recognize and execute this command
```

### Step 4: Test on Frontend
```bash
npm run dev
Type: "check dev trust [wallet]"
Verify response is detailed and accurate
```

### Step 5: Deploy
```bash
npm run build
npx vercel deploy --prod --yes
Test on production URL
```

---

## 📝 EXAMPLE RESPONSES

### High Trust Developer (Score 8.5/10):
```
✅ Developer Trust Score Report

Wallet: 7xKm9vH2cL8nQ5pR1bZ3aY4tU6vW9xJ2kL5mN8pQ1r
Trust Score: 8.5/10

📊 METRICS:
• Total Transactions: 1,247
• Token Launches: 8
• SPL Tokens Created: 8
• Unique Contracts: 34
• Total Volume: 450.5 SOL
• Account Age: 547 days
• Last Activity: 2 hours ago

✅ GREEN FLAGS:
✅ Regular on-chain activity (1,247 txs)
✅ Multiple successful token launches (8)
✅ Established account (18+ months)
✅ Active trading (450+ SOL volume)
✅ Network builder (23 wallets funded)

💡 RECOMMENDATION:
HIGH TRUST - Established developer with proven track record.
Suitable for partnerships, liquidity pools, and collaborations.
```

### Medium Trust Developer (Score 5.2/10):
```
✅ Developer Trust Score Report

Wallet: 3xZ2bY5aT8cV1nQ9lK4mP7rS0uW3xJ6kL9pN2qR5s
Trust Score: 5.2/10

📊 METRICS:
• Total Transactions: 234
• Token Launches: 2
• SPL Tokens Created: 2
• Total Volume: 45.3 SOL
• Account Age: 89 days
• Last Activity: 5 days ago

✅ GREEN FLAGS:
✅ Multiple transactions (234)
✅ Some token launches (2)

⚠️ YELLOW FLAGS:
⚠️ Newer account (3 months)
⚠️ Limited trading volume
⚠️ Inactive recently (5 days)

💡 RECOMMENDATION:
MEDIUM TRUST - Active but unproven developer.
Request references or audit before major partnerships.
```

### Low Trust Developer (Score 1.8/10):
```
✅ Developer Trust Score Report

Wallet: 9xH1pY3aQ5bL7nK2mZ4cV6rT8uW1xJ3kL5mN7pQ9s
Trust Score: 1.8/10

📊 METRICS:
• Total Transactions: 18
• Token Launches: 47
• Account Age: 12 days
• Last Activity: 30 days ago

⚠️ YELLOW FLAGS:
⚠️ Very new account (12 days)
⚠️ Very low transaction count
⚠️ Inactive for 30 days

❌ RED FLAGS:
❌ Excessive token launches (47) - Scammer pattern
❌ Suspected rug pull pattern detected

💡 RECOMMENDATION:
DO NOT TRUST - Major red flags detected.
This wallet shows clear scam/rug pull patterns.
AVOID all transactions with this wallet.
```

---

## 🚀 NEXT STEPS

1. **Create trust-score.ts** with full scoring logic
2. **Update api/chat.ts** with handler
3. **Test on frontend** with real wallets
4. **Verify accuracy** against known developers
5. **Refine scoring** based on test results
6. **Deploy to Vercel**

---

**Created**: January 4, 2026  
**Status**: Ready to implement  
**Priority**: High (Trust verification system)
