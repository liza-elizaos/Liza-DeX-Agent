import type { VercelRequest, VercelResponse } from "@vercel/node";

interface TokenBuyRequest {
  mint: string;
  amount: number; // SOL amount
  buyerWallet: string;
  slippage?: number;
}

interface TokenBuyResponse {
  success: boolean;
  transaction?: string;
  tokensReceived?: number;
  price?: number;
  error?: string;
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method === "GET") {
    res.status(200).json({
      status: "✅ Token Buy API is working!",
      endpoint: "/api/token-buy",
      method: "POST",
      description: "Buy tokens with SOL",
    });
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const body: TokenBuyRequest =
      typeof req.body === "string" ? JSON.parse(req.body) : req.body;

    const { mint, amount, buyerWallet, slippage = 0.5 } = body;

    // Validate required fields
    if (!mint || !amount || !buyerWallet) {
      res.status(400).json({
        success: false,
        error: "Missing required fields: mint, amount, buyerWallet",
      });
      return;
    }

    if (amount <= 0) {
      res.status(400).json({
        success: false,
        error: "Amount must be greater than 0",
      });
      return;
    }

    console.log("[TOKEN-BUY] Processing buy order:", {
      mint: mint.substring(0, 8) + "...",
      amount,
      buyer: buyerWallet.substring(0, 8) + "...",
      slippage,
    });

    // Simulate price calculation
    // In reality this would use Jupiter or Raydium API
    const basePrice = 0.001; // SOL per token
    const tokensToReceive = (amount / basePrice) * (1 - slippage / 100);

    // Simulate transaction
    const mockTx = `tx_${Math.random().toString(36).substring(7)}`;

    const response: TokenBuyResponse = {
      success: true,
      transaction: mockTx,
      tokensReceived: Math.floor(tokensToReceive),
      price: basePrice,
    };

    console.log("[TOKEN-BUY] Buy order successful:", {
      tokensReceived: tokensToReceive,
      transaction: mockTx,
    });

    res.status(200).json(response);
  } catch (error) {
    console.error("[TOKEN-BUY] Error:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
