import type { VercelRequest, VercelResponse } from "@vercel/node";
import { executeSwap } from "./swap-utils.js";
import {
  handlePolymarketQuery,
  generatePolymarketResponse,
  extractOddsFromMessage,
  formatMarketForDisplay,
  getMarketOdds,
  searchPolymarketMarkets,
} from "./polymarket.js";

// Liza Character Definition
const LIZA_CHARACTER = {
  name: "Liza",
  role: "Decentralized Infrastructure Architect",
  bio: "Autonomous decentralized agent built on ElizaOS for Jeju network. Manages wallets, DeFi strategies, and blockchain operations with surgical precision.",
  personality: "Technical, data-driven, transparent, security-conscious",
  network: "Solana Mainnet / Jeju",
};

// System prompt for OpenRouter
const SYSTEM_PROMPT = `You are Liza, an autonomous decentralized infrastructure agent built on ElizaOS for the Jeju network.

CHARACTER TRAITS:
- Name: Liza
- Role: Decentralized Infrastructure Architect
- Network: Solana Mainnet / Jeju
- Expertise: Wallet management, DeFi strategies, on-chain identity, blockchain risk assessment

PERSONALITY:
- Speak like a technical architect with deep blockchain knowledge
- Data-driven and analytical
- Never give financial advice—only risk analysis and data interpretation
- Use on-chain metrics and probability-based language
- Maintain professional confidence without arrogance
- Always focus on transparency and auditability

CAPABILITIES:
1. Wallet Management - Check balances, manage keys, track holdings
2. DeFi Strategies - Analyze yield, explain farming, grid trading, DCA
3. Token Swaps - Execute trades, manage orders, track execution
4. Price Monitoring - Real-time data, historical analysis, market trends
5. Risk Assessment - Contract audits, security analysis, trust metrics
6. Order Management - Create, track, cancel orders
7. Trading Strategies - DCA, Momentum, Grid trading

TONE:
- Professional but approachable
- Use technical language accurately
- Explain complex concepts clearly
- Frame decisions through risk/benefit lens
- Always mention transparency and auditability
- Combine blockchain metrics with practical insights

REMEMBER:
- Never make promises about returns
- Always explain the risks
- Provide data to back up claims
- Offer verification paths and audit trails
- Focus on decentralization and user control`;

// Helper to call OpenRouter API
async function callOpenRouter(messages: Array<{ role: string; content: string }>): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const model = (process.env.OPENROUTER_MODEL || "mistralai/devstral-2512:free").trim();

  if (!apiKey) {
    console.error("[OpenRouter] ❌ No API key configured");
    throw new Error("OpenRouter API key not configured");
  }

  console.log(`[OpenRouter] Calling ${model} with ${messages.length} messages`);

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://localhost",
        "X-Title": "Liza DeFi Agent",
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages,
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error(`[OpenRouter] ❌ API error: ${response.status}`, errorData);
      throw new Error(`OpenRouter API error: ${response.status}`);
    }

    const data = (await response.json()) as any;
    const reply = data.choices?.[0]?.message?.content || "No response generated";

    console.log(`[OpenRouter] ✅ Response received (${reply.length} chars)`);
    return reply;
  } catch (error) {
    console.error("[OpenRouter] Exception:", error);
    throw error;
  }
}

// Helper function to get balance via JSON-RPC directly
async function getBalanceViajsonRpc(publicKey: string, rpcUrl: string): Promise<number> {
  console.log('[RPC] Fetching balance for:', publicKey);
  console.log('[RPC] RPC endpoint:', rpcUrl.substring(0, 40) + '...');
  
  try {
    const response = await fetch(rpcUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 'balance-' + Date.now(),
        method: 'getBalance',
        params: [publicKey],
      }),
      signal: AbortSignal.timeout(8000), // 8 second timeout
    });

    console.log('[RPC] Response status:', response.status);

    if (!response.ok) {
      throw new Error(`RPC error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json() as any;
    console.log('[RPC] Response received:', data);

    if (data.error) {
      throw new Error(`RPC error: ${data.error.message}`);
    }

    const balanceLamports = data.result?.value || 0;
    console.log('[RPC] Balance in lamports:', balanceLamports);

    return balanceLamports;
  } catch (error: any) {
    console.error('[RPC] Error fetching balance:', error?.message || error);
    throw error;
  }
}

interface ChatRequest {
  sessionId: string;
  message: string;
  context: "trading" | "audit" | "defi";
  walletPublicKey?: string;
  config?: {
    name: string;
    privateKey: string;
    maxBuyPerTrade: number;
    dailyCap: number;
    minLiquidity: number;
    minHolders: number;
    devTrustThreshold: number;
    autoApprove: boolean;
    killSwitch: boolean;
  };
}

interface ChatResponse {
  response: string;
  sessionId: string;
  timestamp: string;
}

// Enhanced chat response handler with OpenRouter AI + actual API calls
async function generateResponse(
  message: string,
  context: string = "trading",
  config?: ChatRequest["config"],
  walletPublicKey?: string
): Promise<any> {
  const msg = message.toLowerCase().trim();

  console.log("[CHAT] Processing message:", { original: message, lowercase: msg });

  // ==================== BALANCE/WALLET CHECK ====================
  const hasBalance = msg.includes("balance");
  const hasWallet = msg.includes("wallet");
  const hasCheck = msg.includes("check");

  if (hasBalance || hasWallet || hasCheck) {
    console.log("[CHAT] ✅ Detected balance/wallet/check query");

    let userPublicKey = walletPublicKey || null;

    if (!userPublicKey) {
      const addressMatch = message.match(/([1-9A-HJ-NP-Za-km-z]{43,44})/);
      userPublicKey = addressMatch ? addressMatch[0] : null;
    }

    console.log("[CHAT] Using public key:", userPublicKey);

    if (!userPublicKey) {
      // Use OpenRouter to generate response about wallet check
      try {
        const aiResponse = await callOpenRouter([
          {
            role: "user",
            content: `The user asked to check wallet balance but didn't provide a public key. Generate a helpful response explaining how to provide their Solana public key or connect Phantom wallet.`,
          },
        ]);
        return { response: aiResponse };
      } catch (error) {
        console.error("[CHAT] Error getting AI response:", error);
        return {
          response: `To check your wallet balance, please provide your Solana public key.

Examples:
• check balance 7kDH3pzNUH3Jx1oTeWjGHExKY89K5ZzQLVB3iw5dGLP
• wallet 7kDH3pzNUH3Jx1oTeWjGHExKY89K5ZzQLVB3iw5dGLP

Or connect your Phantom wallet and I'll fetch it automatically.`,
        };
      }
    }

    try {
      let rpcUrl = process.env.SOLANA_RPC_URL;
      console.log("[CHAT] ENV SOLANA_RPC_URL:", rpcUrl ? "SET" : "NOT SET");

      if (!rpcUrl) {
        console.warn("[CHAT] ⚠️ SOLANA_RPC_URL not set, using default");
        rpcUrl = "https://api.mainnet-beta.solana.com";
      }

      if (!/^[1-9A-HJ-NP-Za-km-z]{43,44}$/.test(userPublicKey)) {
        const aiResponse = await callOpenRouter([
          {
            role: "user",
            content: `User provided an invalid Solana public key: ${userPublicKey}. Generate a response explaining the correct format.`,
          },
        ]);
        return { response: aiResponse };
      }

      try {
        const balanceLamports = await getBalanceViajsonRpc(userPublicKey, rpcUrl);
        const balanceSOL = balanceLamports / 1e9;

        console.log("[CHAT] Balance fetched successfully:", { balanceSOL, userPublicKey });

        // Use OpenRouter to format the balance response
        const aiResponse = await callOpenRouter([
          {
            role: "user",
            content: `Format a response for a user's wallet balance check:
- Wallet: ${userPublicKey}
- Balance: ${balanceSOL} SOL
- Network: ${process.env.SOLANA_NETWORK || "mainnet"}

Make it professional but concise.`,
          },
        ]);
        return { response: aiResponse };
      } catch (err: any) {
        const errorMsg = err?.message || String(err);
        console.error("[CHAT] Balance check error:", errorMsg);

        // Use OpenRouter to generate error response
        try {
          const aiResponse = await callOpenRouter([
            {
              role: "user",
              content: `The wallet balance check failed with error: ${errorMsg}. Generate a helpful response explaining what went wrong and what to do.`,
            },
          ]);
          return { response: aiResponse };
        } catch {
          return { response: `Balance check failed: ${errorMsg}\n\nPlease try again or verify the wallet address is correct.` };
        }
      }
    } catch (error) {
      console.error("[CHAT] Balance exception:", error);
      return { response: `Connection error: ${error instanceof Error ? error.message : String(error)}\n\nPlease try again.` };
    }
  }

  // ==================== POLYMARKET PREDICTION MARKETS ====================
  const hasPolymarket = msg.includes("pm") || msg.includes("polymarket") || msg.includes("poly");

  if (hasPolymarket) {
    console.log("[CHAT] 🎯 Polymarket prediction market query detected");

    try {
      // Extract market query - remove "pm" or "polymarket" prefix
      let marketQuery = message
        .replace(/^(pm|polymarket)\s+/i, "")
        .replace(/^poly\s+/i, "")
        .trim();

      if (!marketQuery) {
        const aiResponse = await callOpenRouter([
          {
            role: "user",
            content: `User wants to check Polymarket prediction markets but didn't specify which market. Examples: "PM presidential election winner 2028", "PM will Bitcoin reach 100k", "PM Tesla stock price above 300". Ask them what market they want to check.`,
          },
        ]);
        return { response: aiResponse };
      }

      console.log(`[CHAT] Searching for market: "${marketQuery}"`);

      // Search for real market data on Polymarket
      const marketData = await getMarketOdds(marketQuery);

      if (!marketData || !marketData.market) {
        const aiResponse = await callOpenRouter([
          {
            role: "user",
            content: `User searched for Polymarket market: "${marketQuery}"\n\nNo matching market found on Polymarket. Suggest similar markets or help them refine their search. For example, try "presidential election 2028", "BTC price prediction", "US election", etc.`,
          },
        ]);
        return { response: aiResponse };
      }

      // Format the market data for display
      let marketDisplay = `📊 **Found Market: ${marketData.bestMatch}**\n\n`;
      marketDisplay += `**Current Odds:**\n`;
      
      for (const outcome of marketData.outcomes) {
        marketDisplay += `• ${outcome.name}: ${outcome.probability} (Price: $${outcome.price.toFixed(4)})\n`;
      }

      // Generate AI analysis with real market data
      const aiAnalysis = await callOpenRouter([
        {
          role: "user",
          content: `User asked about this Polymarket prediction market with real live odds:\n\nMarket: "${marketData.bestMatch}"\nCurrent Live Odds:\n${marketData.outcomes.map(o => `- ${o.name}: ${o.probability} (${(o.price * 100).toFixed(1)}¢)`).join('\n')}\n\nProvide a brief analysis:\n1. What do these odds suggest about the likely outcome?\n2. What's the most probable scenario based on current market sentiment?\n3. Any notable risks or considerations?\n\nBe concise and data-driven (2-3 sentences max).`,
        },
      ]);

      return { response: `${marketDisplay}\n**Market Analysis:**\n${aiAnalysis}` };
    } catch (error) {
      console.error("[CHAT] Polymarket error:", error);
      const errorMsg = error instanceof Error ? error.message : String(error);
      return {
        response: `Polymarket analysis error: ${errorMsg}\n\nPlease try again with format: "polymarket 0.45 will BTC reach $100k"`,
      };
    }
  }

  // ==================== SWAP/TRADE EXECUTION ====================
  if (msg.includes("swap") || msg.includes("trade") || msg.includes("exchange") || msg.includes("buy")) {
    console.log("[CHAT] Swap request detected, parsing parameters...");

    const text = message;
    const base58Pattern = "[1-9A-HJNPZa-km-z]{43,44}";
    const tokenPattern = `(?:[a-z0-9_]+|${base58Pattern})`;

    const buyMatch = text.match(new RegExp(`buy\\s+(?:([\\d.]+|all)\\s+)?(${tokenPattern})\\s+(?:from|with)\\s+(${tokenPattern})`, "i"));
    const swapMatch = text.match(new RegExp(`swap\\s+(?:([\\d.]+|all)\\s+)?(${tokenPattern})\\s+(?:to|for)\\s+(${tokenPattern})`, "i"));
    const exchangeMatch = text.match(new RegExp(`exchange\\s+(?:([\\d.]+|all)\\s+)?(${tokenPattern})\\s+(?:for|to)\\s+(${tokenPattern})`, "i"));

    let amount: number = 0;
    let amountStr: string = "";
    let fromToken: string = "";
    let toToken: string = "";
    let swapMode: "ExactIn" | "ExactOut" = "ExactIn";
    let useAllBalance: boolean = false;

    if (buyMatch) {
      amountStr = buyMatch[1] || "1";
      toToken = buyMatch[2];
      fromToken = buyMatch[3];
      swapMode = "ExactOut";
      console.log(`[CHAT] Buy detected: ${amountStr} ${toToken} from ${fromToken} (Exact-Out)`);
    } else if (swapMatch) {
      amountStr = swapMatch[1] || "1";
      fromToken = swapMatch[2];
      toToken = swapMatch[3];
      swapMode = "ExactIn";
      console.log(`[CHAT] Swap detected: ${amountStr} ${fromToken} to ${toToken} (Exact-In)`);
    } else if (exchangeMatch) {
      amountStr = exchangeMatch[1] || "1";
      fromToken = exchangeMatch[2];
      toToken = exchangeMatch[3];
      swapMode = "ExactIn";
      console.log(`[CHAT] Exchange detected: ${amountStr} ${fromToken} for ${toToken} (Exact-In)`);
    } else {
      // Use OpenRouter for parsing error
      try {
        const aiResponse = await callOpenRouter([
          {
            role: "user",
            content: `User: "${message}"\n\nThey're trying to do a swap but the format wasn't recognized. Generate a helpful response with examples of correct swap formats.`,
          },
        ]);
        return { response: aiResponse };
      } catch {
        return { response: `I understand you want to swap tokens. Supported formats:\n- "buy 100 BONK from SOL"\n- "swap 1 SOL for USDC"\n- "swap all TOKEN for SOL"` };
      }
    }

    if (amountStr.toLowerCase() === "all") {
      useAllBalance = true;
      amount = -1;
      console.log('[CHAT] "all" keyword detected - will use entire wallet balance');
    } else {
      amount = parseFloat(amountStr);
    }

    if (!useAllBalance && (!amount || amount <= 0)) {
      return { response: `Invalid amount: ${amountStr}\n\nAmount must be greater than 0 or use "all" keyword` };
    }

    if (!fromToken || !toToken) {
      return { response: `Invalid tokens\n\nFrom: ${fromToken}, To: ${toToken}` };
    }

    // Get wallet address with comprehensive validation
    // Priority: 
    // 1. walletPublicKey from request (user's connected Phantom wallet)
    // 2. Try to extract address from message
    // 3. Fall back to server-side wallet if configured
    
    let walletAddress: string | undefined = walletPublicKey && walletPublicKey.trim() !== '' ? walletPublicKey.trim() : undefined;
    
    console.log("[CHAT] Swap wallet detection START:", {
      walletPublicKeyParam: walletPublicKey && walletPublicKey.trim() ? `${walletPublicKey.substring(0, 8)}...` : "NOT PROVIDED / EMPTY",
      messageLength: message.length,
      hasConfig: !!config,
    });

    // Try to extract wallet address from message ONLY if not provided as parameter
    console.log('[CHAT] [WALLET DETECTION STEP 1] walletPublicKey from request:', walletAddress ? `${walletAddress.substring(0, 8)}...` : 'NOT PROVIDED OR EMPTY');
    
    if (!walletAddress) {
      console.log('[CHAT] [WALLET DETECTION STEP 2] Wallet parameter not provided, trying to extract from message...');
      const addressMatch = message.match(/([1-9A-HJ-NP-Za-km-z]{43,44})/);
      if (addressMatch) {
        walletAddress = addressMatch[0];
        console.log("[CHAT] [WALLET DETECTION STEP 2] ✅ Extracted wallet from message:", walletAddress.substring(0, 8) + "...");
      } else {
        console.log('[CHAT] [WALLET DETECTION STEP 2] ❌ Could not extract wallet from message');
      }
    } else {
      console.log('[CHAT] [WALLET DETECTION STEP 2] ✅ Using wallet from request parameter:', walletAddress.substring(0, 8) + '...');
    }

    // If still no wallet and server has private key, use server wallet
    if (!walletAddress && (config?.privateKey || process.env.SOLANA_PRIVATE_KEY)) {
      walletAddress = process.env.SOLANA_PUBLIC_KEY || undefined;
      console.log("[CHAT] [WALLET DETECTION STEP 3] Using server-side wallet for swap");
    } else if (!walletAddress) {
      console.log("[CHAT] [WALLET DETECTION STEP 3] ❌ No server-side wallet available");
    }

    if (!walletAddress) {
      console.log("[CHAT] ❌ NO WALLET ADDRESS FOUND AT ALL");
      console.log('[CHAT] walletPublicKey (from request):', walletPublicKey);
      console.log('[CHAT] message:', message);
      return { 
        response: `Wallet not connected. Please connect your Solana wallet first using the wallet button, then try again.` 
      };
    }
    
    console.log("[CHAT] ✅ FINAL WALLET DETERMINED:", walletAddress.substring(0, 8) + "...");

    // Accept multiple wallet address formats:
    // 1. Solana addresses: 43-44 chars, base58
    // 2. Jeju Network addresses: shorter format like 61iHTXhc
    // 3. EVM addresses: 0x followed by hex
    // 4. General: at least 20 chars (most chains use at least this)
    const solanaMatch = /^[1-9A-HJ-NP-Za-km-z]{43,44}$/.test(walletAddress);
    const evmMatch = /^0x[0-9a-fA-F]{40}$/.test(walletAddress);
    const otherMatch = /^[a-zA-Z0-9]{10,}$/.test(walletAddress);
    
    // Accept all address formats (Solana, EVM, Jeju, etc)
    const isValidAddress = solanaMatch || evmMatch || otherMatch;
    
    if (!isValidAddress) {
      console.log("[CHAT] ❌ Invalid wallet address format:", walletAddress);
      return { response: `Invalid wallet address format. Please provide a valid blockchain address.` };
    }

    // Warn if wallet is NOT Solana format (they might be on wrong network)
    if (!solanaMatch && (msg.includes("swap") || msg.includes("trade"))) {
      console.log("[CHAT] ⚠️  Non-Solana wallet detected for swap:", walletAddress.substring(0, 8) + "...");
      
      return {
        response: `⚠️ **Wrong Blockchain Network Detected**\n\nYour wallet address (\`${walletAddress}\`) appears to be from a **different blockchain** (e.g., Jeju Network, Ethereum, etc.).\n\n🔄 **To use Jupiter swaps, you need a Solana wallet:**\n\n1. **Option A: Switch Networks in Your Wallet App**\n   • Open your wallet app\n   • Look for network/chain selector\n   • Switch to "Solana Mainnet"\n   • Refresh this page\n\n2. **Option B: Connect a Solana Wallet**\n   • If your wallet doesn't support Solana, install Phantom or another Solana wallet\n   • Transfer SOL to your Solana wallet\n   • Connect it here\n\n📚 **Learn More:**\n   • Phantom Wallet: https://phantom.app\n   • Solana Network: https://solana.com\n\nOnce you're on Solana mainnet, I'll help you execute the swap! 🚀`,
      };
    }

    console.log(`[CHAT] Executing swap: ${useAllBalance ? "ALL" : amount} ${fromToken} -> ${toToken}`);

    try {
      const result = await executeSwap(fromToken, toToken, amount, walletAddress, swapMode, useAllBalance);

      if (!result) {
        return { response: `Swap failed: No result returned` };
      }

      if (result.success) {
        if (result.swap && result.swap.status === "pending_signature") {
          console.log("[CHAT] Returning pending_signature swap with transactionBase64");
          (globalThis as any).__lastSwapData = result.swap;
          return {
            response: result.message || "🔄 Swap Instructions Ready for Signing",
            swap: result.swap,
          };
        }
        return { response: result.message || `✅ Swap executed successfully!` };
      } else {
        return { response: result.message || `❌ Swap failed: ${result.error || "Unknown error"}` };
      }
    } catch (error) {
      console.error("[CHAT] Swap execution error:", error);
      return { response: `Swap execution error: ${error instanceof Error ? error.message : String(error)}` };
    }
  }

  // ==================== GENERAL QUERIES - USE OPENROUTER AI ====================
  console.log("[CHAT] General query - calling OpenRouter AI for message:", message.substring(0, 50));

  try {
    const apiKeySet = process.env.OPENROUTER_API_KEY ? '✅' : '❌';
    const modelVal = process.env.OPENROUTER_MODEL?.trim() || 'NOT SET';
    console.log('[CHAT] About to call OpenRouter with:', {
      apiKey: apiKeySet,
      model: modelVal,
    });

    const aiResponse = await callOpenRouter([
      {
        role: "user",
        content: message,
      },
    ]);

    console.log("[CHAT] ✅ Got AI response from OpenRouter, length:", aiResponse.length);
    return { response: aiResponse };
  } catch (error) {
    console.error("[CHAT] OpenRouter error:", error instanceof Error ? error.message : String(error));

    // Fallback response - try again with retry
    console.log("[CHAT] Attempting fallback response...");
    try {
      const fallbackResponse = await callOpenRouter([
        {
          role: "user",
          content: "User asked: " + message + "\n\nProvide a helpful response as Liza, even if you need to acknowledge limitations.",
        },
      ]);
      return { response: fallbackResponse };
    } catch (fallbackError) {
      console.error("[CHAT] Fallback also failed:", fallbackError instanceof Error ? fallbackError.message : String(fallbackError));
      return {
        response: `I'm Liza, your autonomous trading agent. I can help with wallet checks, token swaps, DeFi strategies, and market analysis. 

How can I assist you today?`,
      };
    }
  }
}


export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Enable CORS for all origins
  const origin = req.headers.origin || "*";
  res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Requested-With"
  );

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  // Handle GET for debugging/testing
  if (req.method === "GET") {
    return res.status(200).json({
      status: "✅ API is working!",
      message: "LIZA Chat API is running and ready to accept POST requests",
      endpoint: "/api/chat",
      method: "POST",
      requiredFields: {
        sessionId: "string (or auto-generated)",
        message: "string (required)",
        context: "trading | audit | defi (optional, defaults to trading)",
        config: "AgentConfig object (optional)"
      },
      exampleRequest: {
        sessionId: "session_123",
        message: "hello",
        context: "trading",
        config: null
      },
      timestamp: new Date().toISOString()
    });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ 
      error: "Method not allowed",
      allowedMethods: ["POST", "OPTIONS", "GET"],
      message: "Use POST to send chat messages, or GET for API info"
    });
  }

  try {
    let body: ChatRequest;
    
    // Parse request body
    if (typeof req.body === "string") {
      body = JSON.parse(req.body) as ChatRequest;
    } else {
      body = req.body as ChatRequest;
    }

    const { sessionId, message, context, config, walletPublicKey } = body;
    
    // Log wallet public key for debugging - VERY DETAILED
    const walletInfo = {
      type: typeof walletPublicKey,
      length: walletPublicKey ? walletPublicKey.length : 0,
      isEmpty: walletPublicKey === '' || walletPublicKey === null || walletPublicKey === undefined,
      fullValue: walletPublicKey,
      preview: walletPublicKey ? `${walletPublicKey.substring(0, 8)}...${walletPublicKey.substring(walletPublicKey.length - 8)}` : 'NOT PROVIDED',
    };
    console.log('[CHAT] ========== REQUEST RECEIVED ==========');
    console.log('[CHAT] Session:', sessionId);
    console.log('[CHAT] Message:', message.substring(0, 100));
    console.log('[CHAT] Context:', context);
    console.log('[CHAT] WALLET DATA:', walletInfo);
    console.log('[CHAT] Full body:', JSON.stringify(body, null, 2));
    console.log('[CHAT] ========================================');

    // Validate required fields
    if (!message) {
      return res.status(400).json({
        error: "Missing required field: message",
        received: { sessionId, message, context }
      });
    }

    const finalSessionId = sessionId || `session_${Date.now()}`;

    // Generate AI response (now async!)
    const response = await generateResponse(message, context || "trading", config, walletPublicKey);

    // Check if response is already a structured object
    let responseObject: any;
    
    if (typeof response === 'object' && response !== null && response.response) {
      // generateResponse returned an object with { response, swap? }
      responseObject = {
        ...response,
        sessionId: finalSessionId,
        timestamp: new Date().toISOString()
      };
    } else {
      // response is a string
      responseObject = { response, sessionId: finalSessionId, timestamp: new Date().toISOString() };
    }

    return res.status(200).json(responseObject);
  } catch (error) {
    console.error("Chat API error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const errorStack = error instanceof Error ? error.stack : "No stack";
    
    console.error("Full error details:", {
      message: errorMessage,
      stack: errorStack,
      timestamp: new Date().toISOString()
    });
    
    return res.status(500).json({
      error: "Internal server error",
      details: errorMessage,
      timestamp: new Date().toISOString(),
      hint: "Check server logs for more details"
    });
  }
}
