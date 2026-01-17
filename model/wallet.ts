/**
 * Wallet Connection Handler
 * 
 * This module handles:
 * 1. Wallet connection validation
 * 2. Wallet verification (optional signature proof)
 * 3. Session management
 */

export interface WalletConnectRequest {
  walletAddress: string;
  signature?: string;
  message?: string;
}

export interface WalletConnectResponse {
  success: boolean;
  walletAddress?: string;
  sessionToken?: string;
  error?: string;
}

const SOLANA_ADDRESS_REGEX = /^[1-9A-HJ-NP-Za-km-z]{43,44}$/;

export function validateWalletAddress(address: string): boolean {
  return SOLANA_ADDRESS_REGEX.test(address);
}

export function generateSessionToken(walletAddress: string): string {
  return Buffer.from(
    `${walletAddress}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  ).toString("base64");
}

export async function validateWalletConnection(
  req: WalletConnectRequest
): Promise<WalletConnectResponse> {
  const { walletAddress, signature, message } = req;

  console.log("[WALLET] Connection request:", { 
    walletAddress: walletAddress?.substring(0, 8) + "...",
    hasSignature: !!signature,
    hasMessage: !!message
  });

  // Validate wallet address format (Solana)
  if (!walletAddress) {
    return {
      success: false,
      error: "walletAddress is required"
    };
  }

  if (!validateWalletAddress(walletAddress)) {
    return {
      success: false,
      error: "Invalid Solana wallet address format"
    };
  }

  // Optional: Verify signature if provided
  // Signature verification can be added later for enhanced security

  // Generate session token
  const sessionToken = generateSessionToken(walletAddress);

  console.log("[WALLET] ✅ Wallet validated:", walletAddress.substring(0, 8) + "...");

  return {
    success: true,
    walletAddress,
    sessionToken,
  };
}
