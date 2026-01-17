import type { VercelRequest, VercelResponse } from "@vercel/node";

// Simple OpenRouter call
async function callOpenRouter(messages: Array<{ role: string; content: string }>): Promise<string> {
  try {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      console.error("[CHAT] OPENROUTER_API_KEY not set");
      return "Sorry, I'm not configured yet. Please set OPENROUTER_API_KEY.";
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
        "HTTP-Referer": "http://localhost:3001",
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
      const text = await response.text();
      console.error("[CHAT] OpenRouter error:", response.status, text);
      return "Sorry, there was an error connecting to the AI service.";
    }

    const data = await response.json() as any;
    return data.choices[0]?.message?.content || "No response from AI";
  } catch (error) {
    console.error("[CHAT] Error calling OpenRouter:", error);
    return "Sorry, there was an error processing your request.";
  }
}

// Main response generator
async function generateResponse(message: string): Promise<string> {
  const msg = message.toLowerCase().trim();

  // Portfolio command
  if (msg.includes("portfolio") || msg.includes("show portfolio")) {
    return `📊 **Portfolio Analysis**

To view your portfolio, I'll analyze your wallet holdings.

Make sure your wallet is connected and I'll show you:
✅ Total portfolio value in USD
✅ SOL balance and value
✅ All token holdings with balances
✅ Portfolio composition breakdown

Say: \`show portfolio\` and I'll fetch your latest data!`;
  }

  // Quick responses
  if (msg.includes("hello") || msg.includes("hi") || msg.includes("hey")) {
    return "👋 Hi! I'm Liza, your trading assistant. How can I help?";
  }

  if (msg.includes("help") || msg.includes("features")) {
    return `🚀 I can help you with:
• **Portfolio** - Type \`show portfolio\`
• **Balance** - Check account balances
• **Swap** - Swap tokens with name & mint address
• **Buy/Sell** - Trading on Solana
• **Launch Token** - Create new tokens
• **Rewards** - Claim creator rewards

What would you like to do?`;
  }

  // Check for balance command
  if (msg.includes("balance") || msg.includes("check balance")) {
    return `💰 **Check Your Balance**

I can check your SOL and token balances.

Make sure your wallet is connected, then ask me to check your balance!`;
  }

  // ========== SWAP COMMAND ==========
  if (msg.includes("swap") || msg.includes("buy") || msg.includes("sell")) {
    const swapPatterns = [
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
      const userPublicKey = "6i1HTXhcxreAEys8QMEvnB1FNpNVwombS61QcwquJb1f";
      const swapResponse = await fetch('https://shina-ten.vercel.app/api/swap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fromToken: fromToken.toLowerCase(), toToken: toToken.toLowerCase(), amount, userPublicKey }),
      });

      const swapData = await swapResponse.json();
      if (swapData.success && swapData.swap) {
        const swap = swapData.swap;
        const rate = swap.to.estimatedAmount / swap.from.amount;
        return `✅ **Swap Quote Ready!**
📤 **From**: ${(swap.from.token || fromToken).toUpperCase()} - ${swap.from.amount} @ $${(swap.from.price || 0).toFixed(4)}
📥 **To**: ${(swap.to.token || toToken).toUpperCase()} - Est: ${swap.to.estimatedAmount.toFixed(6)} @ $${(swap.to.price || 0).toFixed(4)}
💱 **Rate**: 1 ${(swap.from.token || fromToken).toUpperCase()} = ${rate.toFixed(6)} ${(swap.to.token || toToken).toUpperCase()}
📊 **Slippage**: ${swap.slippage || '0.5%'}

Ready? Say "confirm swap"`;
      }
      return `⚠️ Quote Error: ${swapData.error || 'Unable to get quote'}`;
    } catch (error) {
      return `❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  }

  // Fall back to OpenRouter for general queries
  try {
    const response = await callOpenRouter([
      {
        role: "user",
        content: message,
      },
    ]);
    return response;
  } catch (error) {
    console.error("[CHAT] Response generation error:", error);
    return "I'm having trouble processing that. Try asking something specific!";
  }
}

// Main handler
export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle OPTIONS
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // GET for debugging
  if (req.method === "GET") {
    return res.status(200).json({
      status: "✅ API is working!",
      message: "Liza Chat API is ready",
      endpoint: "/api/chat",
      method: "POST",
    });
  }

  // POST handler
  if (req.method === "POST") {
    try {
      const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
      const { message, sessionId } = body;

      if (!message) {
        return res.status(400).json({
          error: "No message provided",
        });
      }

      console.log("[CHAT] Received message:", message);

      const response = await generateResponse(message);

      return res.status(200).json({
        success: true,
        message: response,
        sessionId: sessionId || Date.now().toString(),
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("[CHAT] Error:", error);
      return res.status(500).json({
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
