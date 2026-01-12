import type { VercelRequest, VercelResponse } from "@vercel/node";
import dotenv from "dotenv";
import bs58 from "bs58";
import { Connection, Keypair, PublicKey, Transaction } from "@solana/web3.js";
import { PumpSdk } from "@pump-fun/pump-sdk";

dotenv.config();

function isValidBase58(str: string): boolean {
  try { bs58.decode(str); return true; } catch { return false; }
}

function isValidPublicKey(key: string): boolean {
  try { new PublicKey(key); return true; } catch { return false; }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log("[LAUNCH] ===== START =====");
  console.log("[LAUNCH] Method:", req.method);
  console.log("[LAUNCH] Body:", JSON.stringify(req.body));

  if (req.method !== "POST") {
    console.log("[LAUNCH] ❌ Not POST");
    return res.status(405).json({ error: "Method not allowed, use POST" });
  }

  try {
    console.log("[LAUNCH] Parsing request body...");
    const body = (req.body && typeof req.body === "object") ? req.body : {};
    const name = (body.name || body.tokenName)?.toString()?.trim();
    const symbol = (body.symbol || body.tokenSymbol)?.toString()?.trim()?.toUpperCase();
    const uri = (body.uri || body.metadataUri)?.toString()?.trim();

    console.log("[LAUNCH] Token details:", { name, symbol, uri });

    if (!name || name.length < 2 || name.length > 50) {
      return res.status(400).json({ error: "Token name must be 2-50 characters" });
    }
    if (!symbol || symbol.length < 2 || symbol.length > 10) {
      console.error("[LAUNCH] ❌ Invalid symbol:", symbol);
      return res.status(400).json({ error: "Token symbol must be 2-10 characters" });
    }
    if (!uri) {
      console.error("[LAUNCH] ❌ No URI provided");
      return res.status(400).json({ error: "Metadata URI is required" });
    }

    console.log("[LAUNCH] Checking environment variables...");
    const privateKeyEnv = process.env.SOLANA_PRIVATE_KEY?.trim().replace(/[\r\n]/g, '');
    const publicKeyEnv = process.env.SOLANA_PUBLIC_KEY?.trim().replace(/[\r\n]/g, '');
    const rpcUrl = (process.env.SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com").trim().replace(/[\r\n]/g, '');

    console.log("[LAUNCH] Env vars status:", { 
      hasPrivateKey: !!privateKeyEnv, 
      hasPublicKey: !!publicKeyEnv, 
      rpcUrl: rpcUrl.substring(0, 50) 
    });

    // Better error messaging for missing config
    if (!privateKeyEnv) {
      console.error("[LAUNCH] ❌ SOLANA_PRIVATE_KEY not set on Vercel");
      return res.status(500).json({ 
        error: "Server not configured: Set SOLANA_PRIVATE_KEY in Vercel environment variables" 
      });
    }
    if (!publicKeyEnv) {
      console.error("[LAUNCH] ❌ SOLANA_PUBLIC_KEY not set on Vercel");
      return res.status(500).json({ 
        error: "Server not configured: Set SOLANA_PUBLIC_KEY in Vercel environment variables" 
      });
    }

    if (!isValidPublicKey(publicKeyEnv)) {
      console.error("[LAUNCH] ❌ Invalid SOLANA_PUBLIC_KEY format");
      return res.status(500).json({ error: "Invalid SOLANA_PUBLIC_KEY format (must be valid Solana address)" });
    }

    if (!isValidBase58(privateKeyEnv)) {
      console.error("[LAUNCH] ❌ Invalid SOLANA_PRIVATE_KEY format");
      return res.status(500).json({ error: "Invalid SOLANA_PRIVATE_KEY format (must be base58)" });
    }

    console.log("[LAUNCH] Connecting to RPC:", rpcUrl);
    const connection = new Connection(rpcUrl, "confirmed");

    console.log("[LAUNCH] Decoding private key...");
    const secretKey = bs58.decode(privateKeyEnv);
    if (secretKey.length !== 64) {
      console.error("[LAUNCH] ❌ Invalid private key length:", secretKey.length);
      return res.status(500).json({ error: "Invalid private key length" });
    }

    console.log("[LAUNCH] Creating keypairs...");
    const walletKeypair = Keypair.fromSecretKey(Uint8Array.from(secretKey));
    const creatorPub = new PublicKey(publicKeyEnv);
    console.log("[LAUNCH] Initializing PumpSdk...");
    const sdk = new PumpSdk(connection);
    const mintKeypair = new Keypair();
    console.log("[LAUNCH] ✅ All keypairs ready");

    console.log("[LAUNCH] Creating token...");
    const createIx = await sdk.createInstruction({
      mint: mintKeypair.publicKey,
      name,
      symbol,
      uri,
      creator: creatorPub,
      user: walletKeypair.publicKey,
    });

    const tx = new Transaction();
    tx.add(createIx);
    tx.feePayer = walletKeypair.publicKey;

    const { blockhash } = await connection.getLatestBlockhash("finalized");
    tx.recentBlockhash = blockhash;

    tx.sign(walletKeypair, mintKeypair);

    console.log("[LAUNCH] Sending transaction...");
    const raw = tx.serialize();
    const sig = await connection.sendRawTransaction(raw, { skipPreflight: false, maxRetries: 3 });

    const confirmation = await connection.confirmTransaction({ signature: sig, blockhash, lastValidBlockHeight: (await connection.getLatestBlockhash()).lastValidBlockHeight } as any, "confirmed");
    if (confirmation.value.err) {
      console.error("[LAUNCH] Transaction failed:", confirmation.value.err);
      return res.status(500).json({ error: "Transaction failed on-chain" });
    }

    console.log("[LAUNCH] ✅ Success!");
    return res.status(200).json({
      success: true,
      signature: sig,
      mint: mintKeypair.publicKey.toBase58(),
      explorerUrl: `https://solscan.io/token/${mintKeypair.publicKey.toBase58()}?cluster=mainnet`,
    });
  } catch (err: any) {
    console.error("[LAUNCH] Error:", err?.message || err);
    return res.status(500).json({ error: String(err?.message || err) });
  }
}
