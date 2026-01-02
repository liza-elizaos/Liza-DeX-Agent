#!/usr/bin/env bun
/**
 * NATURAL LANGUAGE SWAP PARSER & EXECUTOR
 * 
 * Parse user commands like:
 * - "buy 100 HdZh1mUvCVJzHfTFaJJxZJFENhiFAkyiXLA5iZZTpump from Sol"
 * - "swap 50 SOL for EPjFW..."
 * - "purchase 0.5 USDC with SOL"
 * 
 * And execute the swap on mainnet
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

// Load env
const envPath = path.join(process.cwd(), '.env');
const envContent = fs.readFileSync(envPath, 'utf-8');
const env: Record<string, string> = {};
envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && key.trim() && !key.startsWith('#')) {
    env[key.trim()] = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
  }
});

const SOLANA_RPC_URL = env.SOLANA_RPC_URL;
const SOLANA_PRIVATE_KEY = env.SOLANA_PRIVATE_KEY;
const SOLANA_PUBLIC_KEY = env.SOLANA_PUBLIC_KEY;

// Token mappings
const TOKEN_MAP: Record<string, string> = {
  'SOL': 'So11111111111111111111111111111111111111112',
  'WSOL': 'So11111111111111111111111111111111111111112',
  'USDC': 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
};

interface ParsedCommand {
  valid: boolean;
  action: 'BUY' | 'SWAP' | 'SELL' | null;
  amount: number | null;
  fromToken: string | null;
  toToken: string | null;
  error?: string;
}

/**
 * Parse natural language command
 */
function parseCommand(userMessage: string): ParsedCommand {
  const msg = userMessage.toLowerCase().trim();

  // Pattern 1: "buy 100 [token] from Sol"
  const buyPattern = /buy\s+([\d.]+)\s+(\S+)\s+from\s+(\w+)/i;
  const buyMatch = userMessage.match(buyPattern);
  if (buyMatch) {
    const [, amount, toToken, fromToken] = buyMatch;
    return {
      valid: true,
      action: 'BUY',
      amount: parseFloat(amount),
      fromToken: fromToken,
      toToken: toToken,
    };
  }

  // Pattern 2: "swap [amount] [token1] for [token2]"
  const swapPattern = /swap\s+([\d.]+)\s+(\S+)\s+for\s+(\S+)/i;
  const swapMatch = userMessage.match(swapPattern);
  if (swapMatch) {
    const [, amount, fromToken, toToken] = swapMatch;
    return {
      valid: true,
      action: 'SWAP',
      amount: parseFloat(amount),
      fromToken: fromToken,
      toToken: toToken,
    };
  }

  // Pattern 3: "sell [amount] [token] for [token]"
  const sellPattern = /sell\s+([\d.]+)\s+(\S+)\s+for\s+(\S+)/i;
  const sellMatch = userMessage.match(sellPattern);
  if (sellMatch) {
    const [, amount, fromToken, toToken] = sellMatch;
    return {
      valid: true,
      action: 'SELL',
      amount: parseFloat(amount),
      fromToken: fromToken,
      toToken: toToken,
    };
  }

  // Pattern 4: "purchase [amount] [token] with [token]"
  const purchasePattern = /purchase\s+([\d.]+)\s+(\S+)\s+with\s+(\S+)/i;
  const purchaseMatch = userMessage.match(purchasePattern);
  if (purchaseMatch) {
    const [, amount, toToken, fromToken] = purchaseMatch;
    return {
      valid: true,
      action: 'BUY',
      amount: parseFloat(amount),
      fromToken: fromToken,
      toToken: toToken,
    };
  }

  return {
    valid: false,
    action: null,
    amount: null,
    fromToken: null,
    toToken: null,
    error: 'Could not parse command. Try: "buy 100 [mint] from Sol"',
  };
}

function resolveMint(token: string): string {
  if (TOKEN_MAP[token.toUpperCase()]) {
    return TOKEN_MAP[token.toUpperCase()];
  }
  return token;
}

async function getTokenSymbol(mint: string): Promise<string> {
  if (mint === 'So11111111111111111111111111111111111111112') return 'WSOL';
  if (mint === 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v') return 'USDC';
  return mint.substring(0, 8) + '...';
}

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
      `Quote failed (${response.status}): ${errorBody.substring(0, 150)}`
    );
  }

  return response.json();
}

async function executeSwap(quote: any): Promise<string> {
  const connection = new Connection(SOLANA_RPC_URL, 'confirmed');
  const walletPubkey = new PublicKey(SOLANA_PUBLIC_KEY);
  const signer = Keypair.fromSecretKey(bs58.decode(SOLANA_PRIVATE_KEY));

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
      `Swap failed (${swapResponse.status}): ${errorBody.substring(0, 150)}`
    );
  }

  const swapData = await swapResponse.json();
  const transactionBuffer = Buffer.from(swapData.swapTransaction, 'base64');
  const transaction = VersionedTransaction.deserialize(transactionBuffer);

  const latestBlockhash = await connection.getLatestBlockhash();
  transaction.message.recentBlockhash = latestBlockhash.blockhash;

  transaction.sign([signer]);

  const signature = await connection.sendTransaction(transaction, {
    maxRetries: 5,
  });

  return signature;
}

/**
 * Main execution function
 */
async function executeCommand(
  userMessage: string
): Promise<{
  success: boolean;
  message: string;
  transaction?: string;
  details?: any;
}> {
  console.log(`\n📝 User Command: "${userMessage}"`);

  // Parse command
  const parsed = parseCommand(userMessage);

  if (!parsed.valid) {
    return {
      success: false,
      message: `❌ ${parsed.error}`,
    };
  }

  console.log(`\n✅ Parsed Command:`);
  console.log(`   Action: ${parsed.action}`);
  console.log(`   Amount: ${parsed.amount}`);
  console.log(`   From: ${parsed.fromToken}`);
  console.log(`   To: ${parsed.toToken}`);

  try {
    // Resolve mints
    const inputMint = resolveMint(parsed.fromToken!);
    const outputMint = resolveMint(parsed.toToken!);

    console.log(`\n🔍 Resolved Mints:`);
    console.log(`   Input:  ${parsed.fromToken} → ${inputMint}`);
    console.log(`   Output: ${parsed.toToken} → ${outputMint}`);

    // Get decimals
    const inputDecimals = await getTokenDecimals(inputMint);
    const outputDecimals = await getTokenDecimals(outputMint);

    console.log(`\n📊 Token Info:`);
    console.log(`   Input decimals:  ${inputDecimals}`);
    console.log(`   Output decimals: ${outputDecimals}`);

    // Get quote
    console.log(`\n💱 Getting quote...`);
    const quote = await getQuote(
      inputMint,
      outputMint,
      parsed.amount!,
      inputDecimals
    );

    const outputAmount =
      parseInt(quote.outAmount) / Math.pow(10, outputDecimals);
    const inputSymbol = await getTokenSymbol(inputMint);
    const outputSymbol = await getTokenSymbol(outputMint);

    console.log(`✅ Quote received:`);
    console.log(`   ${parsed.amount} ${inputSymbol} → ${outputAmount.toFixed(6)} ${outputSymbol}`);
    console.log(`   Rate: 1 ${inputSymbol} = ${(outputAmount / parsed.amount!).toFixed(8)} ${outputSymbol}`);

    // Execute
    console.log(`\n⚙️  Executing swap on mainnet...`);
    const txSignature = await executeSwap(quote);

    const successMessage = `✅ Swap successful! You bought ${outputAmount.toFixed(6)} ${outputSymbol} with ${parsed.amount} ${inputSymbol}`;

    console.log(`\n${successMessage}`);
    console.log(`📍 Transaction: https://solscan.io/tx/${txSignature}`);

    return {
      success: true,
      message: successMessage,
      transaction: txSignature,
      details: {
        sent: `${parsed.amount} ${inputSymbol}`,
        received: `${outputAmount.toFixed(6)} ${outputSymbol}`,
        rate: outputAmount / parsed.amount!,
      },
    };
  } catch (error: any) {
    const errorMsg = `❌ Swap failed: ${error.message}`;
    console.log(`\n${errorMsg}`);

    return {
      success: false,
      message: errorMsg,
    };
  }
}

// CLI test
if (import.meta.main) {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log(`
╔════════════════════════════════════════════════════════════════╗
║   🤖 NATURAL LANGUAGE SWAP EXECUTOR                           ║
║   Test with commands like:                                    ║
╚════════════════════════════════════════════════════════════════╝

Usage: bun nlp-swap-parser.ts "your command here"

Examples:
  bun nlp-swap-parser.ts "buy 100 HdZh1mUvCVJzHfTFaJJxZJFENhiFAkyiXLA5iZZTpump from Sol"
  bun nlp-swap-parser.ts "swap 0.001 SOL for USDC"
  bun nlp-swap-parser.ts "sell 0.1 USDC for SOL"
  bun nlp-swap-parser.ts "purchase 50 tokens with SOL"

Supported Patterns:
  • "buy [amount] [token] from [token]"
  • "swap [amount] [token] for [token]"
  • "sell [amount] [token] for [token]"
  • "purchase [amount] [token] with [token]"

Token Names: SOL, USDC, WSOL
Mint Addresses: 43-44 character base58 addresses
    `);
    process.exit(0);
  }

  const userCommand = args.join(' ');
  executeCommand(userCommand).then(result => {
    console.log(`\n${'═'.repeat(60)}`);
    console.log(`Result: ${result.message}`);
    if (result.details) {
      console.log(`Details:`, result.details);
    }
    console.log(`${'═'.repeat(60)}`);
    process.exit(result.success ? 0 : 1);
  });
}

export { executeCommand, parseCommand };
