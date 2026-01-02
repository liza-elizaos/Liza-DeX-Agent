#!/usr/bin/env bun
/**
 * Swap By Mint Address - Use mint addresses instead of token names
 * Command: bun swap-by-mint.ts <inputMint> <outputMint> <amount>
 * 
 * Example:
 * bun swap-by-mint.ts So11111111111111111111111111111111111111111 EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v 0.001
 * 
 * Features:
 * - Works with ANY token mint address
 * - No hardcoded tokens
 * - Perfect for flexible trading
 */

import * as fs from 'fs';
import * as path from 'path';

// Load environment variables
const envPath = path.join(process.cwd(), '.env');
const envContent = fs.readFileSync(envPath, 'utf-8');
const env: Record<string, string> = {};
envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && key.trim() && !key.startsWith('#')) {
    env[key.trim()] = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
  }
});

const SOLANA_PUBLIC_KEY = env.SOLANA_PUBLIC_KEY;
const SOLANA_PRIVATE_KEY = env.SOLANA_PRIVATE_KEY;
const SOLANA_RPC_URL = env.SOLANA_RPC_URL;

// Constants
const NATIVE_SOL = 'So11111111111111111111111111111111111111111';
const WSOL_MINT = 'So11111111111111111111111111111111111111112';

// Imports
import { 
  Connection, 
  PublicKey, 
  VersionedTransaction,
  Keypair
} from '@solana/web3.js';
import bs58 from 'bs58';

// Parse command line arguments
const args = process.argv.slice(2);
if (args.length < 3) {
  console.error(`
Usage: bun swap-by-mint.ts <inputMint> <outputMint> <amount>

Examples:
  # Swap SOL to USDC using mint addresses
  bun swap-by-mint.ts So11111111111111111111111111111111111111111 EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v 0.001

  # Swap USDC to SOL
  bun swap-by-mint.ts EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v So11111111111111111111111111111111111111111 1.0

  # Swap between any tokens
  bun swap-by-mint.ts <inputMintAddress> <outputMintAddress> <amount>
  `);
  process.exit(1);
}

const [inputMintArg, outputMintArg, amountArg] = args;
const amount = parseFloat(amountArg);

if (isNaN(amount) || amount <= 0) {
  console.error('❌ Amount must be a positive number');
  process.exit(1);
}

// Validate mint addresses (43-44 character base58)
const validateMint = (mint: string): boolean => {
  // Solana addresses are base58 encoded (no 0, O, I, l)
  return (mint.length === 43 || mint.length === 44);
};

if (!validateMint(inputMintArg) || !validateMint(outputMintArg)) {
  console.error('❌ Invalid mint address format. Must be 43-44 character base58');
  process.exit(1);
}

const INPUT_MINT = inputMintArg;
const OUTPUT_MINT = outputMintArg;

// Helper function to get token decimals
async function getTokenDecimals(mint: string): Promise<number> {
  try {
    const connection = new Connection(SOLANA_RPC_URL, 'confirmed');
    const mintPubkey = new PublicKey(mint);
    
    const info = await connection.getParsedAccountInfo(mintPubkey);
    if (info.value && info.value.data && typeof info.value.data !== 'string') {
      const data = info.value.data as any;
      return data.parsed?.info?.decimals || 6;
    }
    return 6; // Default to 6 decimals
  } catch {
    return 6; // Default fallback
  }
}

// Helper function to get token symbol
async function getTokenSymbol(mint: string): Promise<string> {
  try {
    if (mint === NATIVE_SOL) return 'SOL';
    if (mint === WSOL_MINT) return 'WSOL';
    
    // Common tokens
    const tokenMap: Record<string, string> = {
      'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v': 'USDC',
      '2FPyTwcZLUg1MDrwsyoP4D6s1tM7hAkHYRjG5eNvgQ93': 'JTO',
      'DezXvgNnjow2PCAff4xQE8NHQo38G3cwQvsRgSjwDbt': 'DLY',
    };
    
    return tokenMap[mint] || mint.substring(0, 8) + '...';
  } catch {
    return mint.substring(0, 8) + '...';
  }
}

async function getSwapQuote(
  inputMint: string,
  outputMint: string,
  amount: number,
  inputDecimals: number
): Promise<any> {
  try {
    // Convert to smallest unit
    const amountInSmallestUnit = Math.floor(amount * Math.pow(10, inputDecimals));
    
    const queryParams = new URLSearchParams({
      inputMint: inputMint,
      outputMint: outputMint,
      amount: amountInSmallestUnit.toString(),
      slippageBps: '50',
      onlyDirectRoutes: 'false',
    });

    const quoteUrl = `https://api.jup.ag/swap/v1/quote?${queryParams.toString()}`;
    const response = await fetch(quoteUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'x-api-key': env.JUPITER_API_KEY || '',
        'User-Agent': 'LIZA-Solana-AI/1.0'
      }
    });
    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Swap API error (${response.status}): ${errorBody.substring(0, 100)}`);
    }
    
    const quote = await response.json();
    return quote;
  } catch (error: any) {
    console.error(`❌ Quote failed: ${error.message}`);
    throw error;
  }
}

async function executeSwap(
  quote: any,
  outputDecimals: number,
  inputSymbol: string,
  outputSymbol: string
): Promise<string> {
  try {
    const connection = new Connection(SOLANA_RPC_URL, 'confirmed');
    const walletPubkey = new PublicKey(SOLANA_PUBLIC_KEY);
    const signer = Keypair.fromSecretKey(bs58.decode(SOLANA_PRIVATE_KEY));
    
    // Get swap transaction from Jupiter
    const swapResponse = await fetch('https://api.jup.ag/swap/v1/swap', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'x-api-key': env.JUPITER_API_KEY || '',
        'User-Agent': 'LIZA-Solana-AI/1.0'
      },
      body: JSON.stringify({
        quoteResponse: quote,
        userPublicKey: walletPubkey.toString(),
        wrapUnwrapSOL: false,
        dynamicSlippage: { maxBps: 50 },
        feeAccount: undefined,
      }),
    });

    if (!swapResponse.ok) {
      const error = await swapResponse.text();
      throw new Error(`Swap API error: ${error}`);
    }

    const swapData = await swapResponse.json();
    
    // Deserialize transaction
    const transactionBuffer = Buffer.from(swapData.swapTransaction, 'base64');
    const transaction = VersionedTransaction.deserialize(transactionBuffer);
    
    // Get latest blockhash
    const latestBlockhash = await connection.getLatestBlockhash();
    transaction.message.recentBlockhash = latestBlockhash.blockhash;
    
    // Sign transaction
    transaction.sign([signer]);
    
    // Send transaction
    const signature = await connection.sendTransaction(transaction, {
      maxRetries: 5,
    });

    // Wait for confirmation
    const confirmation = await connection.confirmTransaction(signature, 'confirmed');
    
    if (confirmation.value.err) {
      throw new Error(`Transaction failed: ${JSON.stringify(confirmation.value.err)}`);
    }

    return signature;
  } catch (error: any) {
    console.error(`❌ Swap execution failed: ${error.message}`);
    throw error;
  }
}

async function main() {
  try {
    console.log(`
╔════════════════════════════════════════════════════════════════╗
║              💱 SWAP BY MINT ADDRESS                           ║
╚════════════════════════════════════════════════════════════════╝
    `);

    // Get token symbols
    const inputSymbol = await getTokenSymbol(INPUT_MINT);
    const outputSymbol = await getTokenSymbol(OUTPUT_MINT);
    
    console.log(`\n📊 [INFO] Swap Details:`);
    console.log(`   Input:  ${amount} ${inputSymbol}`);
    console.log(`   Output: ${outputSymbol}`);
    
    // Get input token decimals
    const inputDecimals = await getTokenDecimals(INPUT_MINT);
    const outputDecimals = await getTokenDecimals(OUTPUT_MINT);
    
    // Get quote
    console.log(`\n💱 [QUOTE] Getting quote...`);
    const quote = await getSwapQuote(INPUT_MINT, OUTPUT_MINT, amount, inputDecimals);
    
    const outputAmount = parseInt(quote.outAmount) / Math.pow(10, outputDecimals);
    console.log(`✅ [QUOTE] You will receive: ${outputAmount.toFixed(outputDecimals)} ${outputSymbol}`);
    
    const rate = outputAmount / amount;
    console.log(`   Exchange Rate: 1 ${inputSymbol} = ${rate.toFixed(8)} ${outputSymbol}`);
    
    // Execute swap
    console.log(`\n⚙️  [SWAP] Executing swap...`);
    const txSignature = await executeSwap(quote, outputDecimals, inputSymbol, outputSymbol);

    // Success
    console.log(`
╔════════════════════════════════════════════════════════════════╗
║           ✅ SWAP COMPLETED SUCCESSFULLY!                     ║
╚════════════════════════════════════════════════════════════════╝

📊 Transaction Details:
   • Sent:      ${amount} ${inputSymbol}
   • Received:  ${outputAmount.toFixed(outputDecimals)} ${outputSymbol}
   • Rate:      1 ${inputSymbol} = ${rate.toFixed(8)} ${outputSymbol}
   • TX:        https://solscan.io/tx/${txSignature}
   • Mint In:   ${INPUT_MINT}
   • Mint Out:  ${OUTPUT_MINT}
    `);

  } catch (error: any) {
    console.error(`\n❌ FATAL ERROR: ${error.message}`);
    process.exit(1);
  }
}

main();
