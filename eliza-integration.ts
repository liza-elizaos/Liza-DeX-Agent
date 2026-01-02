#!/usr/bin/env bun
/**
 * elizaOS Solana Integration Module
 * 
 * This module provides integration for elizaOS to perform token swaps
 * and handle Solana transactions.
 * 
 * Features:
 * - Buy tokens: "swap 0.01 SOL for USDC"
 * - Sell all: "sell all USDC to SOL"
 * - Use mint addresses: "swap 0.001 [mint1] for [mint2]"
 * 
 * Usage in elizaOS:
 * 1. Copy this to elizaOS plugin directory
 * 2. Register as action in character configuration
 * 3. Use in conversations naturally
 */

import * as fs from 'fs';
import * as path from 'path';
import {
  Connection,
  PublicKey,
  VersionedTransaction,
  Keypair,
} from '@solana/web3.js';
import bs58 from 'bs58';

// Load environment
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

// Token constants
const NATIVE_SOL = 'So11111111111111111111111111111111111111111';
const WSOL_MINT = 'So11111111111111111111111111111111111111112';
const USDC_MINT = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';

// Token name to mint mapping
const TOKEN_MAP: Record<string, string> = {
  'SOL': NATIVE_SOL,
  'WSOL': WSOL_MINT,
  'USDC': USDC_MINT,
};

export interface SwapRequest {
  fromToken: string; // Token name or mint address
  toToken: string;
  amount: number;
}

export interface SwapResult {
  success: boolean;
  transaction?: string;
  error?: string;
  details?: {
    sent: number;
    received: number;
    rate: number;
  };
}

/**
 * Parse token name or address
 * "USDC" -> USDC_MINT
 * "EPjFWdd5..." -> return as is
 */
function resolveTokenMint(token: string): string {
  if (TOKEN_MAP[token.toUpperCase()]) {
    return TOKEN_MAP[token.toUpperCase()];
  }
  return token; // Assume it's a mint address
}

/**
 * Get token symbol from mint
 */
async function getTokenSymbol(mint: string): Promise<string> {
  if (mint === NATIVE_SOL) return 'SOL';
  if (mint === WSOL_MINT) return 'WSOL';
  if (mint === USDC_MINT) return 'USDC';
  return mint.substring(0, 8) + '...';
}

/**
 * Get token decimals
 */
async function getTokenDecimals(mint: string): Promise<number> {
  try {
    const connection = new Connection(SOLANA_RPC_URL, 'confirmed');
    const mintPubkey = new PublicKey(mint);
    const info = await connection.getParsedAccountInfo(mintPubkey);

    if (info.value && info.value.data && typeof info.value.data !== 'string') {
      const data = info.value.data as any;
      return data.parsed?.info?.decimals || 6;
    }
    return 6;
  } catch {
    return 6;
  }
}

/**
 * Get quote from Jupiter
 */
async function getQuote(
  inputMint: string,
  outputMint: string,
  amount: number,
  inputDecimals: number
): Promise<any> {
  const amountInSmallestUnit = Math.floor(
    amount * Math.pow(10, inputDecimals)
  );

  const queryParams = new URLSearchParams({
    inputMint,
    outputMint,
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
      'User-Agent': 'Shina-Solana-AI/1.0',
    },
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `Quote failed (${response.status}): ${errorBody.substring(0, 100)}`
    );
  }

  return response.json();
}

/**
 * Execute swap on Solana
 */
async function executeSwap(
  quote: any,
  outputDecimals: number
): Promise<string> {
  const connection = new Connection(SOLANA_RPC_URL, 'confirmed');
  const walletPubkey = new PublicKey(SOLANA_PUBLIC_KEY);
  const signer = Keypair.fromSecretKey(bs58.decode(SOLANA_PRIVATE_KEY));

  // Get swap transaction
  const swapResponse = await fetch('https://api.jup.ag/swap/v1/swap', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'x-api-key': env.JUPITER_API_KEY || '',
      'User-Agent': 'Shina-Solana-AI/1.0',
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
    const errorBody = await swapResponse.text();
    throw new Error(
      `Swap failed (${swapResponse.status}): ${errorBody.substring(0, 100)}`
    );
  }

  const swapData = await swapResponse.json();

  // Deserialize transaction
  const transactionBuffer = Buffer.from(swapData.swapTransaction, 'base64');
  const transaction = VersionedTransaction.deserialize(transactionBuffer);

  // Get latest blockhash
  const latestBlockhash = await connection.getLatestBlockhash();
  transaction.message.recentBlockhash = latestBlockhash.blockhash;

  // Sign
  transaction.sign([signer]);

  // Send
  const signature = await connection.sendTransaction(transaction, {
    maxRetries: 5,
  });

  return signature;
}

/**
 * Perform a token swap
 *
 * @param request - Swap details { fromToken, toToken, amount }
 * @returns Result with transaction hash or error
 */
export async function performSwap(
  request: SwapRequest
): Promise<SwapResult> {
  try {
    // Resolve token names to mints
    let inputMint = resolveTokenMint(request.fromToken);
    let outputMint = resolveTokenMint(request.toToken);

    // Convert native SOL to WSOL for Jupiter
    if (inputMint === NATIVE_SOL) {
      inputMint = WSOL_MINT;
    }
    if (outputMint === NATIVE_SOL) {
      outputMint = WSOL_MINT;
    }

    const inputDecimals = await getTokenDecimals(inputMint);
    const outputDecimals = await getTokenDecimals(outputMint);

    // Get quote
    const quote = await getQuote(
      inputMint,
      outputMint,
      request.amount,
      inputDecimals
    );

    const outputAmount =
      parseInt(quote.outAmount) / Math.pow(10, outputDecimals);

    // Execute swap
    const txSignature = await executeSwap(quote, outputDecimals);

    const inputSymbol = await getTokenSymbol(request.fromToken);
    const outputSymbol = await getTokenSymbol(request.toToken);

    return {
      success: true,
      transaction: txSignature,
      details: {
        sent: request.amount,
        received: outputAmount,
        rate: outputAmount / request.amount,
      },
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Unknown error',
    };
  }
}

/**
 * Sell all of a token
 */
export async function sellAll(
  tokenToSell: string
): Promise<SwapResult> {
  try {
    const connection = new Connection(SOLANA_RPC_URL, 'confirmed');
    const walletPubkey = new PublicKey(SOLANA_PUBLIC_KEY);

    // Resolve token mint
    let tokenMint = resolveTokenMint(tokenToSell);

    // Get balance
    if (tokenMint === NATIVE_SOL) {
      const balance = await connection.getBalance(walletPubkey);
      const balanceInSol = balance / 1e9;
      return performSwap({
        fromToken: tokenToSell,
        toToken: 'USDC',
        amount: balanceInSol * 0.99, // Keep 1% for fees
      });
    } else {
      const accounts = await connection.getParsedTokenAccountsByOwner(
        walletPubkey,
        { mint: new PublicKey(tokenMint) }
      );

      if (accounts.value.length === 0) {
        return {
          success: false,
          error: `No ${tokenToSell} token account found`,
        };
      }

      const balance = accounts.value[0].account.data.parsed.info.tokenAmount
        .uiAmount;

      return performSwap({
        fromToken: tokenToSell,
        toToken: 'SOL',
        amount: balance,
      });
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Unknown error',
    };
  }
}

/**
 * Get wallet balance
 */
export async function getBalance(token?: string): Promise<number> {
  const connection = new Connection(SOLANA_RPC_URL, 'confirmed');
  const walletPubkey = new PublicKey(SOLANA_PUBLIC_KEY);

  if (!token || token.toUpperCase() === 'SOL') {
    const balance = await connection.getBalance(walletPubkey);
    return balance / 1e9;
  }

  const tokenMint = resolveTokenMint(token);
  const accounts = await connection.getParsedTokenAccountsByOwner(
    walletPubkey,
    { mint: new PublicKey(tokenMint) }
  );

  if (accounts.value.length === 0) {
    return 0;
  }

  return accounts.value[0].account.data.parsed.info.tokenAmount.uiAmount;
}

// CLI interface
if (import.meta.main) {
  const args = process.argv.slice(2);

  if (args[0] === 'swap') {
    // bun eliza-integration.ts swap USDC SOL 1.0
    const [, fromToken, toToken, amount] = args;
    performSwap({
      fromToken,
      toToken,
      amount: parseFloat(amount),
    }).then(result => {
      console.log(result);
      process.exit(result.success ? 0 : 1);
    });
  } else if (args[0] === 'sell-all') {
    // bun eliza-integration.ts sell-all USDC
    const [, token] = args;
    sellAll(token).then(result => {
      console.log(result);
      process.exit(result.success ? 0 : 1);
    });
  } else if (args[0] === 'balance') {
    // bun eliza-integration.ts balance USDC
    const token = args[1];
    getBalance(token).then(balance => {
      console.log(`Balance: ${balance}`);
      process.exit(0);
    });
  } else {
    console.log(`
Usage:
  bun eliza-integration.ts swap <fromToken> <toToken> <amount>
  bun eliza-integration.ts sell-all <token>
  bun eliza-integration.ts balance [token]

Examples:
  bun eliza-integration.ts swap SOL USDC 0.001
  bun eliza-integration.ts swap [mint1] [mint2] 0.001
  bun eliza-integration.ts sell-all USDC
  bun eliza-integration.ts balance USDC
    `);
  }
}
