import { VercelRequest, VercelResponse } from '@vercel/node';
import { Connection, PublicKey } from '@solana/web3.js';

// Simple in-memory session store for wallet connections
const walletSessions: Record<string, any> = {};

async function callOpenRouter(messages: Array<{ role: string; content: string }>): Promise<string> {
  try {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return "Chat not configured. Set OPENROUTER_API_KEY.";
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
        "HTTP-Referer": "https://vercel.app",
        "X-Title": "Liza Chat",
      },
      body: JSON.stringify({
        model: process.env.OPENROUTER_MODEL || "meta-llama/llama-2-7b-chat",
        messages: messages,
        max_tokens: 1024,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      return "Error connecting to AI service.";
    }

    const data = await response.json() as any;
    return data.choices[0]?.message?.content || "No response";
  } catch (error) {
    return "Error processing your request.";
  }
}

// Extract wallet address from message
function extractWalletAddress(message: string): string | null {
  const match = message.match(/[1-9A-HJ-NP-Za-km-z]{44}/);
  return match ? match[0] : null;
}

// Get or create session
function getOrCreateSession(sessionId: string): { wallet: string | null } {
  const now = Date.now();
  
  // Clean old sessions (older than 1 hour)
  for (const [id, data] of Object.entries(walletSessions)) {
    if (now - data.lastActivity > 3600000) {
      delete walletSessions[id];
    }
  }

  if (!walletSessions[sessionId]) {
    walletSessions[sessionId] = { wallet: '', lastActivity: now };
  } else {
    walletSessions[sessionId].lastActivity = now;
  }

  return {
    wallet: walletSessions[sessionId].wallet || null
  };
}

// Set wallet for session
function setWalletForSession(sessionId: string, wallet: string): void {
  walletSessions[sessionId] = { wallet, lastActivity: Date.now() };
}

// Get balance from wallet
async function getBalance(walletAddress: string): Promise<string> {
  try {
    const rpcUrl = process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';
    const connection = new Connection(rpcUrl, 'confirmed');
    const publicKey = new PublicKey(walletAddress);
    const balanceLamports = await connection.getBalance(publicKey);
    const balanceSOL = balanceLamports / 1e9;
    return `💰 **Wallet Balance**\n\n📍 Address: ${walletAddress}\n💰 Balance: **${balanceSOL.toFixed(9)} SOL**\n(${balanceLamports} lamports)`;
  } catch (error) {
    return `❌ Error fetching balance: ${error instanceof Error ? error.message : 'Unknown error'}`;
  }
}

async function generateResponse(message: string, sessionId: string = 'default'): Promise<string> {
  const msg = message.toLowerCase().trim();
  const session = getOrCreateSession(sessionId);

  // ========== CONNECT WALLET ==========
  if (msg.includes('connect') || msg.includes('wallet') && (msg.includes('address') || msg.includes('phantom'))) {
    const walletAddress = extractWalletAddress(message);
    if (walletAddress) {
      setWalletForSession(sessionId, walletAddress);
      return `✅ **Wallet Connected!**

Your wallet has been connected to this session:
📍 **Address**: ${walletAddress.substring(0, 20)}...

You can now:
• Check your balance
• View your portfolio  
• Execute swaps directly

Try: "check balance" or "swap 0.001 SOL for USDC"`;
    }
    return `🔐 **Connect Your Wallet**

To connect your wallet, paste your Solana wallet address:

Example:
\`connect wallet 6i1HTXhcxreAEys8QMEvnB1FNpNVwombS61QcwquJb1f\`

Or just say:
\`6i1HTXhcxreAEys8QMEvnB1FNpNVwombS61QcwquJb1f\``;
  }

  // Check for balance command
  if (msg.includes('balance') || msg.includes('check my balance')) {
    let walletAddress = session.wallet || extractWalletAddress(message);
    
    if (!walletAddress) {
      return `💰 **Check Your Balance**

You need to connect your wallet first!

Example:
\`connect 6i1HTXhcxreAEys8QMEvnB1FNpNVwombS61QcwquJb1f\`

Or provide your wallet address:
\`check balance 6i1HTXhcxreAEys8QMEvnB1FNpNVwombS61QcwquJb1f\``;
    }
    
    return await getBalance(walletAddress);

**Option 1:** Connect your Phantom wallet
- Click "Connect Wallet" above
- I'll automatically fetch your balance

**Option 2:** Tell me your wallet address
- Say: "check my balance 6i1HTXhc...cwquJb1f"
- I'll look up your balance on-chain

💡 Your wallet address is shown at the top when connected to Phantom!`;
  }

  if (msg.includes("portfolio") || msg.includes("show portfolio")) {
    const walletAddress = extractWalletAddress(message);
    if (walletAddress) {
      // Could add portfolio fetch here if needed
      return `📊 **Portfolio Analysis**\n\nPortfolio analysis for: ${walletAddress}\n\n(Full portfolio details would be fetched here with holdings and USD values)`;
    }
    return `📊 **Portfolio Analysis** - Connect your wallet and I'll show your complete holdings with USD valuations!`;
  }

  if (msg.includes("hello") || msg.includes("hi")) {
    return "👋 Hi! I'm LIZA, your Solana trading assistant. How can I help?";
  }

  if (msg.includes("help") || msg.includes("features")) {
    return `🚀 I can help with:
• **Balance** - Check your SOL balance (connect wallet or provide address)
• **Portfolio** - Analyze your token holdings
• **Swap** - Trade tokens by name (SOL, USDC, BONK) or mint address
• **Wallet** - Connect/disconnect Phantom wallet

What would you like to do?`;
  }

  // ========== SWAP COMMAND ==========
  if (msg.includes("swap") || msg.includes("buy") || msg.includes("sell")) {
    // Try all patterns on the ORIGINAL message (preserves case)
    const swapPatterns = [
      /swap\s+([\d.]+)\s+([1-9A-HJ-NP-Za-km-z]{44}|[\w]+)\s+for\s+([1-9A-HJ-NP-Za-km-z]{44}|[\w]+)/i,  // with mint or name
      /swap\s+([\d.]+)\s+(\w+)\s+for\s+(\w+)/i,  // "swap 0.001 SOL for USDC"
      /buy\s+([\d.]+)\s+(\w+)/i,                  // "buy 100 USDC"
      /sell\s+([\d.]+)\s+(\w+)/i,                 // "sell 100 USDC"
    ];
    
    let swapMatch = null;
    for (const pattern of swapPatterns) {
      swapMatch = message.match(pattern);
      if (swapMatch) break;
    }
    
    if (!swapMatch) {
      return `🔄 **Token Swap**
Ready to swap tokens! You can:
• Swap by name: "swap 10 SOL for USDC"
• Swap by mint: "swap So11111... for EPjFWa..."
Supported tokens: SOL, USDC, USDT, mSOL, BONK, JUP

What would you like to swap?`;
    }

    let amount = parseFloat(swapMatch[1]);
    let fromToken = swapMatch[2]?.toLowerCase() || '';
    let toToken = swapMatch[3]?.toLowerCase() || '';

    if (isNaN(amount) || amount <= 0) {
      return `❌ Invalid amount. Please enter a number greater than 0.\n\nExample: \`swap 0.001 SOL for USDC\``;
    }

    // Handle buy/sell commands - if no toToken, infer it
    if (!toToken && message.toLowerCase().includes('buy')) {
      toToken = fromToken;
      fromToken = 'sol'; // Default: buy tokens with SOL
    } else if (!toToken && message.toLowerCase().includes('sell')) {
      toToken = 'usdc'; // Default: sell tokens for USDC
    }

    if (!fromToken || !toToken) {
      return `❌ Please specify both tokens:\n\`swap 0.001 SOL for USDC\``;
    }

    try {
      // Use connected wallet or require user to connect
      let userPublicKey = session.wallet || extractWalletAddress(message);
      
      if (!userPublicKey) {
        return `❌ **Wallet Not Connected**

To execute swaps, you need to connect your wallet first:

\`connect wallet [your_solana_address]\`

Example:
\`connect wallet 6i1HTXhcxreAEys8QMEvnB1FNpNVwombS61QcwquJb1f\`

Then try: \`swap ${amount} ${fromToken} for ${toToken}\` again`;
      }

      // Store swap details for confirmation
      walletSessions[sessionId] = {
        ...walletSessions[sessionId],
        lastActivity: Date.now(),
        pendingSwap: { fromToken, toToken, amount, userPublicKey }
      };

      // Get user wallet from session
      userPublicKey = userPublicKey;

      const swapResponse = await fetch('https://shina-ten.vercel.app/api/swap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromToken: fromToken.toLowerCase(),
          toToken: toToken.toLowerCase(),
          amount,
          userPublicKey,
        }),
      });

      const swapData = await swapResponse.json() as any;

      if (swapData.success && swapData.swap) {
        const swap = swapData.swap;
        const rate = swap.to.estimatedAmount / swap.from.amount;
        const fromSymbol = swap.from.symbol || fromToken.toUpperCase();
        const toSymbol = swap.to.symbol || toToken.toUpperCase();
        return `✅ **Swap Quote Ready!**
━━━━━━━━━━━━━━━━━━━━━━━━━━━
📤 **From**: ${fromSymbol}
   Amount: ${swap.from.amount}
   Price: $${(swap.from.price || 0).toFixed(4)}

📥 **To**: ${toSymbol}
   Estimated: ${swap.to.estimatedAmount.toFixed(6)}
   Price: $${(swap.to.price || 0).toFixed(4)}

💱 **Exchange Rate**: 1 ${fromSymbol} = ${rate.toFixed(6)} ${toSymbol}

📊 **Slippage**: ${swap.slippage || '0.5%'}
━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Ready to execute? Say "confirm swap"`;
      } else if (swapData.success === false) {
        return `⚠️ Quote Error: ${swapData.error || 'Unable to get quote'}\n${swapData.supportedTokens ? `\nTry: ${swapData.supportedTokens.join(', ')}` : ''}`;
      }
      
      return `❌ Unexpected response from swap API`;
    } catch (error) {
      console.error('[SWAP] Error:', error);
      return `❌ Error getting swap quote: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  }

  // ========== CONFIRM SWAP COMMAND ==========
  if (msg.includes("confirm") && msg.includes("swap")) {
    const pendingSwap = (walletSessions[sessionId] as any)?.pendingSwap;
    
    if (!pendingSwap) {
      return `❌ **No Pending Swap**

You need to request a swap first:
\`swap 0.001 SOL for USDC\`

Then confirm it with:
\`confirm swap\``;
    }

    try {
      const { fromToken, toToken, amount, userPublicKey } = pendingSwap;

      // Get the executable swap transaction from Jupiter
      const execResponse = await fetch('https://shina-ten.vercel.app/api/execute-swap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromToken: fromToken.toLowerCase(),
          toToken: toToken.toLowerCase(),
          amount,
          userPublicKey,
        }),
      });

      const execData = await execResponse.json() as any;

      if (execData.success && execData.transaction) {
        // Clear pending swap
        if (walletSessions[sessionId]) {
          (walletSessions[sessionId] as any).pendingSwap = null;
        }

        return `✅ **SWAP TRANSACTION READY!**

🔄 **Transaction prepared and ready to sign**

📊 **Swap Details:**
• From: ${pendingSwap.fromToken.toUpperCase()} (${amount})
• To: ${pendingSwap.toToken.toUpperCase()}
• Wallet: ${userPublicKey.substring(0, 20)}...

📱 **Next Steps:**

**IMPORTANT:** Your Phantom wallet should automatically prompt to sign this transaction. If not:

1. Open your Phantom wallet
2. Look for a pending signature request
3. Review the swap details
4. Tap "Approve" to execute

⚠️ **The transaction contains:**
- Your swap instructions
- Gas fees (~5000 lamports)
- 0.5% slippage protection

✨ After you approve, the swap will execute on-chain immediately!

💡 **Note:** This session ID: ${sessionId}`;
      } else {
        return `❌ **Transaction Error**: ${execData.error || 'Could not create transaction'}

Make sure:
• Your wallet is valid
• You have enough balance
• Network is responding

Try again with: \`confirm swap\``;
      }
    } catch (error) {
      console.error('[CONFIRM] Error:', error);
      return `❌ **Error preparing transaction**: ${error instanceof Error ? error.message : 'Unknown error'}

Please try again or contact support.`;
    }
  }

  // Fall back to OpenRouter for general queries
  try {
    const response = await callOpenRouter([{ role: "user", content: message }]);
    return response;
  } catch {
    return "Let me help you! Try:\n• \"check my balance\"\n• \"show portfolio\"\n• \"swap tokens\"\n• \"connect wallet\"";
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method === "GET") {
    return res.status(200).json({
      status: "✅ Chat API is ready",
      method: "POST"
    });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const { message, sessionId } = body;

    if (!message) {
      return res.status(400).json({ error: "No message provided" });
    }

    const finalSessionId = sessionId || `session_${Date.now()}`;
    const response = await generateResponse(message, finalSessionId);

    return res.status(200).json({
      success: true,
      message: response,
      response: response,  // Also return as 'response' for frontend compatibility
      sessionId: finalSessionId,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
