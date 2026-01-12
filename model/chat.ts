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

  // ========== LAUNCH TOKEN COMMAND ==========
  if (msg.startsWith('/launch token ') || msg.startsWith('launch token ')) {
    // Parse: /launch token [name] [symbol] [description]
    const parts = message.replace(/^\/launch token |^launch token /i, '').split(' ');
    
    if (parts.length < 3) {
      return `🚀 **TOKEN LAUNCH - STEP BY STEP**

**Format:** \`/launch token [name] [symbol] [description]\`

**Example:**
\`/launch token MyToken MTK "The best trading token ever"\`

**What you need:**
• Token Name (e.g., MyToken)
• Symbol (e.g., MTK) - max 6 chars
• Description (e.g., "Best trading token")
• Logo URL (optional - will ask next)
• Website (optional - will ask next)

**Ready? Type:**
\`/launch token YourName YourSymbol Your description here\``;
    }

    const name = parts[0];
    const symbol = parts[1];
    const description = parts.slice(2).join(' ');

    return `✅ **TOKEN LAUNCH INITIATED!**

🎉 Your token is being created:

📋 **Token Details:**
• Name: **${name}**
• Symbol: **${symbol}**
• Description: **${description}**

💰 **Creator Rewards Setup:**
Based on market cap, you'll earn:
• **0.3% - 0.95% per trade**
• **0.05% - 0.93% protocol fee** (your revenue!)

🔗 **Next Steps:**
1. Upload token logo (optional):
   \`/upload logo [image-url]\`

2. Add token links (optional):
   \`/add links website:https://... twitter:@... discord:...\`

3. Launch on-chain:
   \`/confirm launch\`

4. Start selling tokens to users:
   \`/sell 1000 tokens\`

**Ready to launch?** 🚀`;
  }

  // Quick launch response
  if (msg.startsWith('/launch') || msg === 'launch token') {
    return `🚀 **TOKEN LAUNCH WIZARD**

Ready to launch your token on Solana!

📋 **Quick Start:**
Type: \`/launch token [name] [symbol] [description]\`

Example:
\`/launch token MyToken MTK "The best trading token"\`

**Features:**
✅ Automatic fee tier calculation
✅ Creator reward setup (0.3%-0.95% per trade)
✅ Token logo upload support
✅ Social links integration
✅ Instant Solana deployment

Or use the **Launch Form** at /launch for full UI! 🎨`;
  }

  // Quick responses
  if (msg.includes("hello") || msg.includes("hi") || msg.includes("hey")) {
    return "👋 Hi! I'm Liza, your trading assistant. How can I help?";
  }

  if (msg.includes("help") || msg.includes("features")) {
    return `🚀 I can help you with:
• **Launch Tokens** - Type \`/launch token [name] [symbol] [description]\`
• **Buy Tokens** - Type \`/buy [amount] SOL of [token]\`
• **Trading** - Buy/sell tokens on Solana
• **Portfolio** - Check wallet balance & holdings  
• **Balance** - Check account balances
• **Rewards** - Claim creator rewards

What would you like to do?`;
  }

  // Check for balance command
  if (msg.includes("balance") || msg.includes("check balance")) {
    return `💰 **Check Your Balance**

Type: \`check balance [wallet_address]\`

Or if you have a wallet connected, I can check automatically!

Example:
\`check balance 2ae321aSbfU5o9Qfg6DpVQckGQVKZe4haevWVJJR4VE9\``;
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
        return res.status(400).json({ error: "Missing message field" });
      }

      const response = await generateResponse(message);
      return res.status(200).json({
        response,
        sessionId: sessionId || `session_${Date.now()}`,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("[CHAT] Error:", error);
      return res.status(500).json({
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
