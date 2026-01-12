import type { VercelRequest, VercelResponse } from "@vercel/node";
import dotenv from "dotenv";
import bs58 from "bs58";
import { Connection, Keypair, PublicKey, sendAndConfirmTransaction, Transaction, SystemProgram, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { createInitializeMintInstruction, createMintToInstruction, getMinimumBalanceForRentExemptMint, MINT_SIZE, TOKEN_PROGRAM_ID, createAssociatedTokenAccountInstruction, getAssociatedTokenAddress } from "@solana/spl-token";

dotenv.config();

interface TokenCreateRequest {
  name: string;
  symbol: string;
  description: string;
  imageUrl?: string;
}

interface TokenCreateResponse {
  success: boolean;
  mint?: string;
  transaction?: string;
  error?: string;
  message: string;
  explorerUrl?: string;
  cost?: string;
}

function isValidBase58(str: string): boolean {
  try {
    bs58.decode(str);
    return true;
  } catch {
    return false;
  }
}

function isValidPublicKey(key: string): boolean {
  try {
    new PublicKey(key);
    return true;
  } catch {
    return false;
  }
}

async function createTokenOnSolana(
  params: TokenCreateRequest,
  connection: Connection,
  walletKeypair: Keypair
): Promise<{ success: boolean; mint?: string; txSignature?: string; error?: string }> {
  try {
    console.log("[TOKEN_CREATE] Starting token creation:", params.name);

    // Check wallet balance
    const balance = await connection.getBalance(walletKeypair.publicKey);
    const balanceInSol = balance / LAMPORTS_PER_SOL;
    console.log(`[TOKEN_CREATE] Wallet balance: ${balanceInSol} SOL`);

    if (balanceInSol < 0.01) {
      return {
        success: false,
        error: `Insufficient balance. Need at least 0.01 SOL, have ${balanceInSol} SOL`,
      };
    }

    // Create a new Keypair for the mint
    const mintKeypair = Keypair.generate();
    const mint = mintKeypair.publicKey;
    console.log(`[TOKEN_CREATE] New mint address: ${mint.toBase58()}`);

    // Calculate rent for mint
    const lamports = await getMinimumBalanceForRentExemptMint(connection);
    console.log(`[TOKEN_CREATE] Rent required: ${lamports / LAMPORTS_PER_SOL} SOL`);

    // Create transaction
    const transaction = new Transaction().add(
      // Create account for mint
      SystemProgram.createAccount({
        fromPubkey: walletKeypair.publicKey,
        newAccountPubkey: mint,
        space: MINT_SIZE,
        lamports,
        programId: TOKEN_PROGRAM_ID,
      }),
      // Initialize mint
      createInitializeMintInstruction(
        mint,
        6, // decimals
        walletKeypair.publicKey,
        walletKeypair.publicKey,
        TOKEN_PROGRAM_ID
      )
    );

    // Get latest blockhash
    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash("confirmed");
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = walletKeypair.publicKey;

    // Sign transaction
    transaction.sign(mintKeypair, walletKeypair);

    // Send transaction
    console.log("[TOKEN_CREATE] Sending transaction...");
    const signature = await sendAndConfirmTransaction(connection, transaction, [walletKeypair, mintKeypair], {
      commitment: "confirmed",
    });

    console.log(`[TOKEN_CREATE] Transaction signature: ${signature}`);

    // Create associated token account for initial mint
    const ata = await getAssociatedTokenAddress(mint, walletKeypair.publicKey);

    // Create ATA if it doesn't exist
    try {
      const ataInfo = await connection.getAccountInfo(ata);
      if (!ataInfo) {
        console.log("[TOKEN_CREATE] Creating associated token account...");
        const createAtaTx = new Transaction().add(
          createAssociatedTokenAccountInstruction(walletKeypair.publicKey, ata, walletKeypair.publicKey, mint)
        );

        const { blockhash: bh2 } = await connection.getLatestBlockhash("confirmed");
        createAtaTx.recentBlockhash = bh2;
        createAtaTx.feePayer = walletKeypair.publicKey;
        createAtaTx.sign(walletKeypair);

        const ataSig = await sendAndConfirmTransaction(connection, createAtaTx, [walletKeypair], {
          commitment: "confirmed",
        });

        console.log(`[TOKEN_CREATE] ATA created: ${ataSig}`);
      }
    } catch (error) {
      console.log("[TOKEN_CREATE] ATA already exists or error creating:", error);
    }

    // Mint initial supply
    try {
      console.log("[TOKEN_CREATE] Minting initial supply...");
      const mintTx = new Transaction().add(
        createMintToInstruction(mint, ata, walletKeypair.publicKey, 1000000 * Math.pow(10, 6), [walletKeypair])
      );

      const { blockhash: bh3 } = await connection.getLatestBlockhash("confirmed");
      mintTx.recentBlockhash = bh3;
      mintTx.feePayer = walletKeypair.publicKey;
      mintTx.sign(walletKeypair);

      const mintSig = await sendAndConfirmTransaction(connection, mintTx, [walletKeypair], {
        commitment: "confirmed",
      });

      console.log(`[TOKEN_CREATE] Mint transaction: ${mintSig}`);
    } catch (error) {
      console.log("[TOKEN_CREATE] Error minting tokens (non-critical):", error);
    }

    const mintAddress = mint.toBase58();
    return {
      success: true,
      mint: mintAddress,
      txSignature: signature,
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error("[TOKEN_CREATE] Error creating token:", errorMsg);
    return {
      success: false,
      error: errorMsg,
    };
  }
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  // Set CORS headers
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  console.log("[TOKEN_CREATE] ===== START =====");
  console.log("[TOKEN_CREATE] Method:", req.method);

  if (req.method !== "POST") {
    console.log("[TOKEN_CREATE] ❌ Not POST");
    return res.status(405).json({
      success: false,
      error: "Method not allowed, use POST",
      message: "Use POST method to create tokens",
    });
  }

  try {
    console.log("[TOKEN_CREATE] Parsing request body...");
    const body = (req.body && typeof req.body === "object") ? req.body : {};
    const name = (body.name || body.tokenName)?.toString()?.trim();
    const symbol = (body.symbol || body.tokenSymbol)?.toString()?.trim()?.toUpperCase();
    const description = (body.description || body.tokenDescription)?.toString()?.trim();
    const imageUrl = body.imageUrl?.toString()?.trim();

    console.log("[TOKEN_CREATE] Token details:", { name, symbol, description: description?.substring(0, 50) });

    // Validation
    if (!name || name.length < 2 || name.length > 32) {
      return res.status(400).json({
        success: false,
        error: "Token name must be 2-32 characters",
        message: "Invalid token name length",
      });
    }

    if (!symbol || symbol.length < 2 || symbol.length > 10) {
      console.error("[TOKEN_CREATE] ❌ Invalid symbol:", symbol);
      return res.status(400).json({
        success: false,
        error: "Token symbol must be 2-10 characters",
        message: "Invalid token symbol length",
      });
    }

    if (!description || description.length < 1 || description.length > 500) {
      return res.status(400).json({
        success: false,
        error: "Token description must be 1-500 characters",
        message: "Invalid token description length",
      });
    }

    // Prefer Helius and SOLANA_ env vars if present
    const privateKeyEnv = process.env.SOLANA_PRIVATE_KEY?.trim().replace(/[\r\n]/g, "")
      || process.env.DEV_WALLET_PRIVATE_KEY?.trim().replace(/[\r\n]/g, "");
    const publicKeyEnv = process.env.SOLANA_PUBLIC_KEY?.trim().replace(/[\r\n]/g, "")
      || process.env.DEV_WALLET_ADDRESS?.trim().replace(/[\r\n]/g, "");
    const rpcUrl = process.env.HELIUS_RPC_URL?.trim().replace(/[\r\n]/g, "")
      || process.env.SOLANA_RPC_URL?.trim().replace(/[\r\n]/g, "")
      || "https://api.mainnet-beta.solana.com";

    console.log("[TOKEN_CREATE] Env vars status:", {
      hasPrivateKey: !!privateKeyEnv,
      hasPublicKey: !!publicKeyEnv,
      rpcUrl: rpcUrl.substring(0, 80),
    });

    if (!privateKeyEnv) {
      console.error("[TOKEN_CREATE] ❌ SOLANA_PRIVATE_KEY/DEV_WALLET_PRIVATE_KEY not set");
      return res.status(500).json({
        success: false,
        error: "Server not configured: Set SOLANA_PRIVATE_KEY or DEV_WALLET_PRIVATE_KEY in environment variables",
        message: "Missing private key configuration",
      });
    }

    if (!publicKeyEnv) {
      console.error("[TOKEN_CREATE] ❌ SOLANA_PUBLIC_KEY/DEV_WALLET_ADDRESS not set");
      return res.status(500).json({
        success: false,
        error: "Server not configured: Set SOLANA_PUBLIC_KEY or DEV_WALLET_ADDRESS in environment variables",
        message: "Missing wallet address configuration",
      });
    }

    if (!isValidPublicKey(publicKeyEnv)) {
      console.error("[TOKEN_CREATE] ❌ Invalid SOLANA_PUBLIC_KEY/DEV_WALLET_ADDRESS format");
      return res.status(500).json({
        success: false,
        error: "Invalid SOLANA_PUBLIC_KEY/DEV_WALLET_ADDRESS format (must be valid Solana address)",
        message: "Invalid wallet address",
      });
    }

    if (!isValidBase58(privateKeyEnv)) {
      console.error("[TOKEN_CREATE] ❌ Invalid SOLANA_PRIVATE_KEY/DEV_WALLET_PRIVATE_KEY format");
      return res.status(500).json({
        success: false,
        error: "Invalid SOLANA_PRIVATE_KEY/DEV_WALLET_PRIVATE_KEY format (must be base58)",
        message: "Invalid private key format",
      });
    }

    console.log("[TOKEN_CREATE] Connecting to RPC:", rpcUrl);
    const connection = new Connection(rpcUrl, "confirmed");

    console.log("[TOKEN_CREATE] Decoding private key...");
    const secretKey = bs58.decode(privateKeyEnv);

    if (secretKey.length !== 64) {
      console.error("[TOKEN_CREATE] ❌ Invalid private key length:", secretKey.length);
      return res.status(500).json({
        success: false,
        error: "Invalid private key length",
        message: "Private key must be 64 bytes",
      });
    }

    console.log("[TOKEN_CREATE] Creating keypairs...");
    const walletKeypair = Keypair.fromSecretKey(Uint8Array.from(secretKey));
    console.log("[TOKEN_CREATE] ✅ Keypair ready");

    // Create token
    const createResult = await createTokenOnSolana(
      { name, symbol, description, imageUrl },
      connection,
      walletKeypair
    );

    if (!createResult.success) {
      console.error("[TOKEN_CREATE] ❌ Token creation failed:", createResult.error);
      return res.status(500).json({
        success: false,
        error: createResult.error || "Token creation failed",
        message: "Failed to create token on blockchain",
      });
    }

    const mint = createResult.mint!;
    const signature = createResult.txSignature!;

    console.log("[TOKEN_CREATE] ✅ Token created successfully:", mint);

    const response: TokenCreateResponse = {
      success: true,
      mint,
      transaction: signature,
      message: `✅ Token ${symbol} created successfully on Solana mainnet!`,
      explorerUrl: `https://solscan.io/token/${mint}`,
      cost: "~0.002 SOL (rent + transaction fee)",
    };

    return res.status(200).json(response);
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error("[TOKEN_CREATE] ❌ Handler error:", errorMsg);

    return res.status(500).json({
      success: false,
      error: errorMsg,
      message: "Failed to process token creation request",
    });
  }
}
