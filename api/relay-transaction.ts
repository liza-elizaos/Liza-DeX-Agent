import type { VercelRequest, VercelResponse } from "@vercel/node";
import { Connection } from "@solana/web3.js";

/**
 * Relay endpoint: Accept a signed base64 transaction from frontend,
 * forward to Solana RPC, and return txid (bypasses browser CORS issues).
 */
export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { transactionBase64 } = req.body;

  if (!transactionBase64 || typeof transactionBase64 !== "string") {
    return res.status(400).json({ error: "Missing or invalid transactionBase64" });
  }

  // Validate base64 format
  if (!/^[A-Za-z0-9+/=]+$/.test(transactionBase64)) {
    console.error("[RELAY] Invalid base64 format in transaction");
    return res.status(400).json({ error: "Invalid base64 format" });
  }

  const rpcUrl = process.env.SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com";
  console.log("[RELAY] Starting transaction relay...");
  console.log("[RELAY] RPC URL:", rpcUrl.substring(0, 50) + "...");
  console.log("[RELAY] Base64 length:", transactionBase64.length, "chars");

  // Try primary RPC, then fallback to public RPC
  const rpcCandidates = [
    rpcUrl,
    "https://solana-api.projectserum.com",
    "https://api.mainnet-beta.solana.com",
  ];

  for (const candidate of rpcCandidates) {
    try {
      console.log("[RELAY] Attempting RPC:", candidate.substring(0, 50) + "...");

      // Method 1: Try using @solana/web3.js Connection
      if (candidate === rpcUrl) {
        try {
          const connection = new Connection(candidate, "confirmed");
          const txBytes = Buffer.from(transactionBase64, "base64");
          console.log("[RELAY] Deserialized transaction bytes, size:", txBytes.length);

          const txid = await connection.sendRawTransaction(txBytes, {
            skipPreflight: false,
            preflightCommitment: "confirmed",
          });

          console.log("[RELAY] Transaction sent via Connection, txid:", txid);
          return res.status(200).json({
            success: true,
            txid,
            message: `Transaction sent: ${txid}`,
          });
        } catch (connErr: any) {
          console.warn("[RELAY] Connection method failed:", connErr?.message || connErr);
        }
      }

      // Method 2: Direct JSON-RPC POST (more robust)
      const rpcResponse = await fetch(candidate, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: "relay-" + Date.now(),
          method: "sendRawTransaction",
          params: [
            transactionBase64,
            { skipPreflight: false, preflightCommitment: "confirmed" },
          ],
        }),
        signal: AbortSignal.timeout(15000),
      });

      console.log("[RELAY] RPC response status:", rpcResponse.status);

      if (!rpcResponse.ok) {
        console.error("[RELAY] RPC HTTP error:", rpcResponse.status, rpcResponse.statusText);
        continue;
      }

      const rpcData = await rpcResponse.json();
      console.log("[RELAY] RPC response data:", JSON.stringify(rpcData).substring(0, 300));

      if (rpcData.error) {
        const errorCode = rpcData.error.code;
        const errorMsg = rpcData.error.message || "Unknown error";
        console.error("[RELAY] RPC error code:", errorCode, "message:", errorMsg);

        // Only continue to next RPC on certain errors
        if (errorCode === -32601) {
          // Method not found - try next RPC
          console.warn("[RELAY] Method not found on this RPC, trying next...");
          continue;
        }

        // For other errors, return immediately
        return res.status(400).json({
          error: "RPC error",
          code: errorCode,
          details: errorMsg,
        });
      }

      if (!rpcData.result) {
        console.error("[RELAY] No result in RPC response");
        continue;
      }

      const txid = rpcData.result;
      console.log("[RELAY] Transaction sent successfully, txid:", txid);

      return res.status(200).json({
        success: true,
        txid,
        message: `Transaction sent: ${txid}`,
      });
    } catch (error: any) {
      console.warn("[RELAY] Candidate failed:", candidate.substring(0, 50), "error:", error?.message || error);
    }
  }

  // All RPCs failed
  console.error("[RELAY] All RPC candidates failed");
  return res.status(503).json({
    error: "All RPC endpoints failed",
    details: "Could not send transaction via any RPC endpoint",
  });
}
