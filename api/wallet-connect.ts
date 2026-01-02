import type { VercelRequest, VercelResponse } from "@vercel/node";

interface WalletSession {
  publicKey: string;
  timestamp: number;
  signature?: string;
  verified: boolean;
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { publicKey, signature, message } = req.body;

    if (!publicKey) {
      return res.status(400).json({
        error: "Missing publicKey",
        message: "User must connect their Solana wallet first"
      });
    }

    // In production, verify the signature here using:
    // import { verify } from '@solana/web3.js';
    // const verified = verify(message, signature, publicKey);

    const session: WalletSession = {
      publicKey,
      timestamp: Date.now(),
      signature,
      verified: true // In production, verify signature
    };

    return res.status(200).json({
      success: true,
      message: "Wallet connected successfully!",
      session,
      walletInfo: {
        publicKey,
        connected: true,
        type: "phantom" // or solflare, etc
      }
    });
  } catch (error) {
    return res.status(500).json({
      error: "Wallet connection failed",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
}
