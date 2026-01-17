import type { VercelRequest, VercelResponse } from "@vercel/node";
import dotenv from "dotenv";
import bs58 from "bs58";
import { Connection, Keypair, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { PumpSdk } from "@pump-fun/pump-sdk";

dotenv.config();

// ============ CONFIGURATION ============
const CONFIG = {
  RPC_URL: process.env.SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com",
  RPC_URL_BACKUP: process.env.SOLANA_RPC_URL_BACKUP || "https://solana-mainnet.rpc.extrnode.io:443",
  PRIVATE_KEY: process.env.SOLANA_PRIVATE_KEY?.trim().replace(/[\r\n]/g, ''),
  PUBLIC_KEY: process.env.SOLANA_PUBLIC_KEY?.trim().replace(/[\r\n]/g, ''),
  PUMP_FUN_PROGRAM: new PublicKey("6EF8rZkuitQVLNtnYoMTRUY56DJRNm5DQFFLqJEd9QJ"),
};

function isValidBase58(str: string): boolean {
  try { bs58.decode(str); return true; } catch { return false; }
}

function isValidPublicKey(key: string): boolean {
  try { new PublicKey(key); return true; } catch { return false; }
}

async function getConnection(): Promise<Connection> {
  try {
    const conn = new Connection(CONFIG.RPC_URL, "confirmed");
    await conn.getLatestBlockhash();
    return conn;
  } catch (err) {
    console.log("[LAUNCH] Primary RPC failed, trying backup...");
    return new Connection(CONFIG.RPC_URL_BACKUP, "confirmed");
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log("[LAUNCH] ===== TOKEN LAUNCH REQUEST =====");
  console.log("[LAUNCH] Method:", req.method);
  console.log("[LAUNCH] Timestamp:", new Date().toISOString());

  if (req.method !== "POST") {
    console.log("[LAUNCH] ❌ Not POST");
    return res.status(405).json({ error: "Method not allowed, use POST" });
  }

  try {
    // ============ REQUEST VALIDATION ============
    console.log("[LAUNCH] Validating request...");
    const body = (req.body && typeof req.body === "object") ? req.body : {};
    const name = (body.name || body.tokenName)?.toString()?.trim();
    const symbol = (body.symbol || body.tokenSymbol)?.toString()?.trim()?.toUpperCase();
    const uri = (body.uri || body.metadataUri)?.toString()?.trim();
    const initialSupply = body.initialSupply || 1000000;

    console.log("[LAUNCH] Token Request:", { name, symbol, uri, initialSupply });

    // Validate inputs
    if (!name || name.length < 2 || name.length > 50) {
      return res.status(400).json({ error: "Token name must be 2-50 characters" });
    }
    if (!symbol || symbol.length < 2 || symbol.length > 10) {
      return res.status(400).json({ error: "Token symbol must be 2-10 characters" });
    }
    if (!uri) {
      return res.status(400).json({ error: "Metadata URI is required" });
    }

    // ============ ENV VALIDATION ============
    console.log("[LAUNCH] Checking configuration...");
    
    if (!CONFIG.PRIVATE_KEY) {
      console.error("[LAUNCH] ❌ SOLANA_PRIVATE_KEY not configured");
      return res.status(500).json({ error: "Server Error: Missing SOLANA_PRIVATE_KEY" });
    }
    if (!CONFIG.PUBLIC_KEY) {
      console.error("[LAUNCH] ❌ SOLANA_PUBLIC_KEY not configured");
      return res.status(500).json({ error: "Server Error: Missing SOLANA_PUBLIC_KEY" });
    }

    if (!isValidPublicKey(CONFIG.PUBLIC_KEY)) {
      console.error("[LAUNCH] ❌ Invalid PUBLIC_KEY format");
      return res.status(500).json({ error: "Invalid SOLANA_PUBLIC_KEY format" });
    }
    if (!isValidBase58(CONFIG.PRIVATE_KEY)) {
      console.error("[LAUNCH] ❌ Invalid PRIVATE_KEY format");
      return res.status(500).json({ error: "Invalid SOLANA_PRIVATE_KEY format" });
    }

    // ============ SETUP ============
    console.log("[LAUNCH] Connecting to RPC...");
    const connection = await getConnection();

    console.log("[LAUNCH] Setting up keypairs...");
    const secretKey = bs58.decode(CONFIG.PRIVATE_KEY);
    if (secretKey.length !== 64) {
      return res.status(500).json({ error: "Invalid private key length" });
    }

    const walletKeypair = Keypair.fromSecretKey(Uint8Array.from(secretKey));
    const creatorPub = new PublicKey(CONFIG.PUBLIC_KEY);
    const mintKeypair = new Keypair();

    // Verify keypair matches
    if (walletKeypair.publicKey.toBase58() !== CONFIG.PUBLIC_KEY) {
      console.warn("[LAUNCH] ⚠️  Keypair mismatch - using private key's public key");
    }

    console.log("[LAUNCH] ✅ Setup complete");

    // ============ CREATE TOKEN ============
    console.log("[LAUNCH] Initializing PumpSdk...");
    const sdk = new PumpSdk();

    console.log("[LAUNCH] Creating token on pump.fun...");
    const createIx = await sdk.createInstruction({
      mint: mintKeypair.publicKey,
      name,
      symbol,
      uri,
      creator: creatorPub,
      user: walletKeypair.publicKey,
    });

    // ============ BUILD & SEND TRANSACTION ============
    console.log("[LAUNCH] Building transaction...");
    const tx = new Transaction();
    tx.add(createIx);
    tx.feePayer = walletKeypair.publicKey;

    const latestBlockhash = await connection.getLatestBlockhash("finalized");
    tx.recentBlockhash = latestBlockhash.blockhash;

    console.log("[LAUNCH] Signing transaction...");
    tx.sign(walletKeypair, mintKeypair);

    console.log("[LAUNCH] Sending transaction to blockchain...");
    const raw = tx.serialize();
    const sig = await connection.sendRawTransaction(raw, { 
      skipPreflight: false, 
      maxRetries: 5 
    });

    console.log("[LAUNCH] Transaction sent:", sig);
    console.log("[LAUNCH] Confirming transaction...");
    
    const confirmation = await connection.confirmTransaction({
      signature: sig,
      blockhash: latestBlockhash.blockhash,
      lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
    } as any, "confirmed");

    if (confirmation.value.err) {
      console.error("[LAUNCH] ❌ Transaction failed:", confirmation.value.err);
      return res.status(500).json({ 
        error: "Transaction failed on-chain",
        signature: sig,
        details: String(confirmation.value.err)
      });
    }

    const tokenAddress = mintKeypair.publicKey.toBase58();
    console.log("[LAUNCH] ✅ SUCCESS! Token created:", tokenAddress);

    return res.status(200).json({
      success: true,
      signature: sig,
      mint: tokenAddress,
      name,
      symbol,
      explorerUrl: `https://solscan.io/token/${tokenAddress}?cluster=mainnet`,
      creatorUrl: `https://pump.fun/coin/${tokenAddress}`,
      message: "Token launched successfully on pump.fun!"
    });
  } catch (err: any) {
    console.error("[LAUNCH] ❌ ERROR:", err?.message || err);
    console.error("[LAUNCH] Stack:", err?.stack);
    
    return res.status(500).json({ 
      success: false,
      error: String(err?.message || err),
      errorType: err?.name,
      timestamp: new Date().toISOString(),
      hint: "Check server logs for details"
    });
  }
}
