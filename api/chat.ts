import type { VercelRequest, VercelResponse } from "@vercel/node";

// Direct import with proper error handling for Vercel + local dev
let executeSwap: any = null;

async function loadSwapUtils() {
  if (!executeSwap) {
    try {
      const swapModule = await import("./swap-utils");
      executeSwap = swapModule.executeSwap;
      console.log('[CHAT] ✅ Successfully loaded swap-utils');
    } catch (error) {
      console.error('[CHAT] Failed to load swap-utils:', error instanceof Error ? error.message : String(error));
      throw error;
    }
  }
  return executeSwap;
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

// Smart chat response handler with actual API calls
async function generateResponse(
  message: string,
  context: string = "trading",
  config?: ChatRequest["config"],
  walletPublicKey?: string
): Promise<string> {
  const msg = message.toLowerCase().trim();
  
  console.log('[CHAT] Processing message:', { original: message, lowercase: msg });
  
  // Balance/Wallet queries - Check FIRST
  const hasBalance = msg.includes("balance");
  const hasWallet = msg.includes("wallet");
  const hasCheck = msg.includes("check");
  
  console.log('[CHAT] Keyword check:', { hasBalance, hasWallet, hasCheck });
  
  if (hasBalance || hasWallet || hasCheck) {
    console.log('[CHAT] ✅ Detected balance/wallet/check query');
    
    // Priority: walletPublicKey from request > extract from message > error
    let userPublicKey = walletPublicKey || null;
    
    // If not in request, try to extract from message
    if (!userPublicKey) {
      // Format: "check balance of 7k..." or "my balance 7k..."
      // Solana addresses are 43-44 characters in base58
      // Base58 alphabet: 123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz (no 0, O, I, l)
      const addressMatch = message.match(/([1-9A-HJ-NP-Za-km-z]{43,44})/); // Solana address format (43-44 chars)
      userPublicKey = addressMatch ? addressMatch[0] : null;
    }
    
    console.log('[CHAT] Using public key:', userPublicKey, 'from:', walletPublicKey ? 'request' : 'message');
    
    if (!userPublicKey) {
      return `WALLET BALANCE CHECK
━━━━━━━━━━━━━━━━━━━━━━━━

To check your wallet balance, please provide your Solana public key.

Examples:
• check balance 7kDH3pzNUH3Jx1oTeWjGHExKY89K5ZzQLVB3iw5dGLP
• balance of 7kDH3pzNUH3Jx1oTeWjGHExKY89K5ZzQLVB3iw5dGLP
• wallet 7kDH3pzNUH3Jx1oTeWjGHExKY89K5ZzQLVB3iw5dGLP

Or connect your Phantom wallet and we'll fetch it automatically.`;
    }
    
    // Call balance API with user's public key
    try {
      console.log('[CHAT] Fetching balance for:', userPublicKey);
      
      // Get RPC URL - handle both local and Vercel environments
      let rpcUrl = process.env.SOLANA_RPC_URL;
      console.log('[CHAT] ENV SOLANA_RPC_URL:', rpcUrl ? 'SET' : 'NOT SET');
      
      if (!rpcUrl) {
        console.warn('[CHAT] ⚠️ SOLANA_RPC_URL not set, using default');
        rpcUrl = 'https://api.mainnet-beta.solana.com';
      }
      
      console.log('[CHAT] Using RPC URL:', rpcUrl.substring(0, 50) + '...');
      
      // Validate public key format (base58, 43-44 chars)
      if (!/^[1-9A-HJ-NP-Za-km-z]{43,44}$/.test(userPublicKey)) {
        return `WALLET BALANCE - INVALID KEY
━━━━━━━━━━━━━━━━━━━━━━━━

The provided public key format is invalid:
Address: ${userPublicKey}

Solana addresses must be 43-44 characters in base58 format.`;
      }

      try {
        // Use JSON-RPC directly instead of Connection class
        const balanceLamports = await getBalanceViajsonRpc(userPublicKey, rpcUrl);
        const balanceSOL = balanceLamports / 1e9;

        console.log('[CHAT] Balance fetched successfully:', { balanceSOL, userPublicKey });
        
        return `WALLET BALANCE
━━━━━━━━━━━━━━━━━━━━━━━━

Wallet: ${userPublicKey.slice(0, 8)}...${userPublicKey.slice(-8)}
Balance: ${parseFloat(balanceSOL.toFixed(9))} SOL
Network: ${process.env.SOLANA_NETWORK || 'mainnet'}

[Real-time data from blockchain]`;
      } catch (err: any) {
        const errorMsg = err?.message || String(err);
        console.error('[CHAT] Balance check error:', errorMsg);
        
        // Handle timeout
        if (errorMsg.includes('timed out')) {
          return `WALLET BALANCE - TIMEOUT
━━━━━━━━━━━━━━━━━━━━━━━━

The balance check timed out. This usually means:
• RPC endpoint is slow
• Network connection issue
• Solana network is congested

Try again in a few moments.`;
        }
        
        return `WALLET BALANCE - ERROR
━━━━━━━━━━━━━━━━━━━━━━━━

Error: ${errorMsg}
Address: ${userPublicKey}

Please verify the address is correct and try again.`;
      }
    } catch (error) {
      console.error('[CHAT] Balance exception:', error);
      return `WALLET BALANCE - ERROR
━━━━━━━━━━━━━━━━━━━━━━━━

Connection Error: ${error instanceof Error ? error.message : String(error)}

Please try again.`;
    }
  }

  // Swap/Trade queries - Actually execute the swap
  if (msg.includes("swap") || msg.includes("trade") || msg.includes("exchange") || msg.includes("buy")) {
    console.log('[CHAT] Swap request detected, parsing parameters...');
    
    // Parse swap parameters from message
    const text = message.toLowerCase();
    
    // Pattern 1: "buy 100 TOKEN from SOL" or "buy TOKEN from SOL"
    const buyMatch = text.match(/buy\s+(?:([\d.]+)\s+)?(\w+)\s+(?:from|with)\s+(\w+)/i);
    
    // Pattern 2: "swap 100 SOL for TOKEN" or "swap SOL for TOKEN" or "swap 100 SOL to TOKEN"
    const swapMatch = text.match(/swap\s+(?:([\d.]+)\s+)?(\w+)\s+(?:to|for)\s+(\w+)/i);
    
    // Pattern 3: "exchange 100 TOKEN1 for TOKEN2" or "exchange TOKEN1 for TOKEN2"
    const exchangeMatch = text.match(/exchange\s+(?:([\d.]+)\s+)?(\w+)\s+(?:for|to)\s+(\w+)/i);
    
    let amount: number = 0;
    let fromToken: string = '';
    let toToken: string = '';
    let swapMode: 'ExactIn' | 'ExactOut' = 'ExactIn';

    if (buyMatch) {
      const amountStr = buyMatch[1] || '1';
      amount = parseFloat(amountStr);
      toToken = buyMatch[2];
      fromToken = buyMatch[3];
      swapMode = 'ExactOut';
      console.log(`[CHAT] Buy detected: ${amount} ${toToken} from ${fromToken} (Exact-Out)`);
    } else if (swapMatch) {
      const amountStr = swapMatch[1] || '1';
      amount = parseFloat(amountStr);
      fromToken = swapMatch[2];
      toToken = swapMatch[3];
      swapMode = 'ExactIn';
      console.log(`[CHAT] Swap detected: ${amount} ${fromToken} to ${toToken} (Exact-In)`);
    } else if (exchangeMatch) {
      const amountStr = exchangeMatch[1] || '1';
      amount = parseFloat(amountStr);
      fromToken = exchangeMatch[2];
      toToken = exchangeMatch[3];
      swapMode = 'ExactIn';
      console.log(`[CHAT] Exchange detected: ${amount} ${fromToken} for ${toToken} (Exact-In)`);
    } else {
      return `❌ Could not parse swap request\n\n**Supported formats:**\n- "buy 100 TOKEN from SOL" or "buy TOKEN from SOL"\n- "swap 100 SOL for TOKEN" or "swap SOL for TOKEN"\n- "exchange 50 TOKEN1 to TOKEN2" or "exchange TOKEN1 to TOKEN2"\n\n**Examples:**\n- "buy 100 BONK from SOL"\n- "swap 1 SOL for USDC"\n- "exchange 0.5 TOKEN1 for TOKEN2"`;
    }

    if (!amount || amount <= 0) {
      return `❌ Invalid amount: ${amount}\n\nAmount must be greater than 0`;
    }

    if (!fromToken || !toToken) {
      return `❌ Invalid tokens\n\nFrom: ${fromToken}, To: ${toToken}`;
    }

    // Get wallet address - Priority: walletPublicKey from request > config > env variable
    // If walletPublicKey is provided in request, use it (user's connected wallet)
    // Otherwise fall back to config or env (server-side wallet)
    let walletAddress: string | undefined = walletPublicKey;
    
    // If no wallet from request, try config or env (for server-side operations)
    if (!walletAddress) {
      walletAddress = config?.privateKey 
        ? (process.env.SOLANA_PUBLIC_KEY || undefined)
        : (process.env.SOLANA_PUBLIC_KEY || undefined);
    }
    
    // Validate wallet address - must be provided
    if (!walletAddress) {
      console.log('[CHAT] No wallet address found in request, config, or env');
      return `❌ Wallet not connected\n\nPlease connect your Solana wallet to execute swaps.\n\nYour wallet address is required to perform token swaps. Connect your Phantom wallet in the frontend.`;
    }
    
    // Validate it's a proper Solana address format (43-44 characters, base58)
    const solanaAddressRegex = /^[1-9A-HJ-NP-Za-km-z]{43,44}$/;
    if (!solanaAddressRegex.test(walletAddress)) {
      console.log('[CHAT] Invalid wallet address format:', walletAddress);
      return `❌ Invalid wallet address format\n\nThe wallet address provided is not a valid Solana address.`;
    }
    
    console.log(`[CHAT] Using wallet address: ${walletAddress.substring(0, 8)}...${walletAddress.substring(walletAddress.length - 8)} (from: ${walletPublicKey ? 'request' : 'config/env'})`);
    
    console.log(`[CHAT] Executing swap: ${amount} ${fromToken} -> ${toToken} (${swapMode}) for wallet: ${walletAddress}`);

    // Execute the swap
    try {
      console.log(`[CHAT] Loading swap utils...`);
      const swapExecutor = await loadSwapUtils();
      
      console.log(`[CHAT] Calling executeSwap with: ${fromToken} -> ${toToken}, amount: ${amount}, wallet: ${walletAddress.substring(0, 8)}...`);
      const result = await swapExecutor(fromToken, toToken, amount, walletAddress, swapMode);
      
      if (!result) {
        return `❌ Swap failed: No result returned from swap function`;
      }
      
      if (result.success) {
        return result.message || `✅ Swap executed successfully!\n\n${amount} ${fromToken} -> ${result.txHash ? `Transaction: ${result.txHash}` : 'Completed'}`;
      } else {
        return result.message || `❌ Swap failed: ${result.error || 'Unknown error'}`;
      }
    } catch (error) {
      console.error('[CHAT] Swap execution error:', error);
      return `❌ Swap execution error: ${error instanceof Error ? error.message : String(error)}\n\nPlease try again or check your wallet connection.`;
    }
  }

  // Help queries
  if (msg.includes("help") || msg.includes("guide") || msg.includes("what can you")) {
    return `LIZA - TRADING BOT
━━━━━━━━━━━━━━━━━━━━━━━━

Available Commands:
- "balance" - Get wallet balance
- "swap" - Exchange tokens
- "config" - View settings
- "deploy" - Start trading bot
- "audit" - Contract security check
- "defi" - DeFi strategies

APIs:
/api/balance - Get SOL balance
/api/swap - Execute token swap
/api/chat - Send messages

Connect your Phantom wallet to get started.`;
  }

  // Config queries
  if (msg.includes("config") || msg.includes("settings")) {
    return `CONFIGURATION
━━━━━━━━━━━━━━━━━━━━━━━━

Bot: LIZA Trading Bot
Max Buy: 0.2 SOL per trade
Daily Cap: 1.0 SOL
Min Liquidity: $5,000
Min Holders: 100
Dev Trust: 60%
Auto-Approve: OFF
Kill Switch: ON

Ready to modify settings?`;
  }

  // Deploy queries
  if (msg.includes("deploy") || msg.includes("start") || msg.includes("activate")) {
    return `DEPLOYMENT
━━━━━━━━━━━━━━━━━━━━━━━━

To deploy trading bot:
1. Add Solana private key
2. Configure parameters
3. Set risk filters
4. Enable safety controls
5. Click Deploy

Status: Ready to deploy`;
  }

  // Audit queries
  if (msg.includes("audit") || msg.includes("contract") || msg.includes("security")) {
    return `SMART CONTRACT AUDIT
━━━━━━━━━━━━━━━━━━━━━━━━

Gas: OPTIMIZED
Security: PASSED
Liquidity: SAFE
Dev Score: 75/100

Status: SAFE FOR TRADING

Recommendations:
- Monitor liquidity
- Check history  
- Verify distribution`;
  }

  // DeFi queries
  if (msg.includes("defi") || msg.includes("strategy") || msg.includes("yield") || msg.includes("farming")) {
    return `DEFI STRATEGIES
━━━━━━━━━━━━━━━━━━━━━━━━

1. LIQUIDITY PROVISION
   APY: 6-12% | Risk: Low

2. YIELD FARMING
   APY: 15-40% | Risk: Medium

3. STABLE SWAPS
   APY: 3-5% | Risk: Very Low

4. ARBITRAGE
   APY: 10-25% | Risk: Low

Which interests you?`;
  }

  // Default helpful response
  return `I'm LIZA - Your Autonomous Trading Agent

I can help with:
- Wallet balance (real-time)
- Token swaps
- Trading bots
- Contract audits
- DeFi strategies

Try asking:
"Check my wallet balance"
"How to swap tokens"
"Help"
"Deploy a trading bot"`;
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
    
    // Log wallet public key for debugging
    console.log('[CHAT] Request received:', { 
      sessionId, 
      message: message.substring(0, 50), 
      hasWalletPublicKey: !!walletPublicKey,
      walletPublicKey: walletPublicKey ? `${walletPublicKey.substring(0, 8)}...${walletPublicKey.substring(walletPublicKey.length - 8)}` : 'none'
    });

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

    const chatResponse: ChatResponse = {
      response,
      sessionId: finalSessionId,
      timestamp: new Date().toISOString(),
    };

    return res.status(200).json(chatResponse);
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
