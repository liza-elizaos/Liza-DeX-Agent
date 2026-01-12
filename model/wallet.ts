import type { VercelRequest, VercelResponse } from "@vercel/node";

/**
 * Wallet Connection Handler
 * 
 * This endpoint handles:
 * 1. Wallet connection validation
 * 2. Wallet verification (optional signature proof)
 * 3. Session management
 */

interface WalletConnectRequest {
  walletAddress: string;
  signature?: string;
  message?: string;
}

interface WalletConnectResponse {
  success: boolean;
  walletAddress?: string;
  sessionToken?: string;
  error?: string;
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  // Enable CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed. Use POST." });
    return;
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const { walletAddress, signature, message } = body as WalletConnectRequest;

    console.log("[WALLET] Connection request:", { 
      walletAddress: walletAddress?.substring(0, 8) + "...",
      hasSignature: !!signature,
      hasMessage: !!message
    });

    // Validate wallet address format (Solana)
    if (!walletAddress) {
      res.status(400).json({ 
        success: false,
        error: "walletAddress is required" 
      });
      return;
    }

    const solanaAddressRegex = /^[1-9A-HJ-NP-Za-km-z]{43,44}$/;
    if (!solanaAddressRegex.test(walletAddress)) {
      res.status(400).json({ 
        success: false,
        error: "Invalid Solana wallet address format" 
      });
      return;
    }

    // Optional: Verify signature if provided (OPTION B from user)
    // For now, we're implementing OPTION A (accept valid address format)
    // Signature verification can be added later for enhanced security

    // Generate session token
    const sessionToken = Buffer.from(
      `${walletAddress}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    ).toString("base64");

    console.log("[WALLET] ✅ Wallet validated:", walletAddress.substring(0, 8) + "...");

    res.status(200).json({
      success: true,
      walletAddress,
      sessionToken,
    } as WalletConnectResponse);

  } catch (error) {
    console.error("[WALLET] Error:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
