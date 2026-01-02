#!/usr/bin/env bun
/**
 * elizaOS SOLANA SWAP PLUGIN
 * 
 * Integrated swap actions for elizaOS character
 * Supports:
 * - Token names (SOL, USDC, WSOL)
 * - Mint addresses
 * - Natural language commands
 * - Pump tokens
 * 
 * Deploy on Vercel with this plugin!
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

// ============================================================
// CONFIGURATION
// ============================================================

const env: Record<string, string> = {};

// Load environment variables
try {
  const envPath = path.join(process.cwd(), '.env');
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && key.trim() && !key.startsWith('#')) {
      env[key.trim()] = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
    }
  });
} catch {
  console.warn('⚠️ Could not load .env file');
}

const SOLANA_RPC_URL = env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';
const SOLANA_PRIVATE_KEY = env.SOLANA_PRIVATE_KEY;
const SOLANA_PUBLIC_KEY = env.SOLANA_PUBLIC_KEY;

// Token mappings
const TOKEN_MAP: Record<string, string> = {
  'SOL': 'So11111111111111111111111111111111111111112',
  'WSOL': 'So11111111111111111111111111111111111111112',
  'USDC': 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
};

// ============================================================
// INTERFACES
// ============================================================

export interface SwapRequest {
  fromToken: string;
  toToken: string;
  amount: number;
}

export interface SwapResult {
  success: boolean;
  message: string;
  transaction?: string;
  details?: {
    sent: string;
    received: string;
    rate: number;
  };
}

export interface ParsedCommand {
  valid: boolean;
  action: 'BUY' | 'SWAP' | 'SELL' | 'CHECK_BALANCE' | null;
  amount?: number;
  fromToken?: string;
  toToken?: string;
  token?: string;
  error?: string;
}

// ============================================================
// HELPER FUNCTIONS
// ============================================================

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
      'User-Agent': 'LIZA-Solana-AI/1.0',
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

async function executeSwapTx(quote: any): Promise<string> {
  const connection = new Connection(SOLANA_RPC_URL, 'confirmed');
  const walletPubkey = new PublicKey(SOLANA_PUBLIC_KEY);
  const signer = Keypair.fromSecretKey(bs58.decode(SOLANA_PRIVATE_KEY));

  const swapResponse = await fetch('https://api.jup.ag/swap/v1/swap', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'x-api-key': env.JUPITER_API_KEY || '',
      'User-Agent': 'LIZA-Solana-AI/1.0',
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

// ============================================================
// PARSER
// ============================================================

export function parseCommand(userMessage: string): ParsedCommand {
  const msg = userMessage.toLowerCase().trim();

  // Pattern: "buy X token from Y"
  const buyPattern = /buy\s+([\d.]+)\s+(\S+)\s+from\s+(\w+)/i;
  const buyMatch = userMessage.match(buyPattern);
  if (buyMatch) {
    return {
      valid: true,
      action: 'BUY',
      amount: parseFloat(buyMatch[1]),
      fromToken: buyMatch[3],
      toToken: buyMatch[2],
    };
  }

  // Pattern: "swap X token for Y"
  const swapPattern = /swap\s+([\d.]+)\s+(\S+)\s+for\s+(\S+)/i;
  const swapMatch = userMessage.match(swapPattern);
  if (swapMatch) {
    return {
      valid: true,
      action: 'SWAP',
      amount: parseFloat(swapMatch[1]),
      fromToken: swapMatch[2],
      toToken: swapMatch[3],
    };
  }

  // Pattern: "sell X token for Y"
  const sellPattern = /sell\s+([\d.]+)\s+(\S+)\s+for\s+(\S+)/i;
  const sellMatch = userMessage.match(sellPattern);
  if (sellMatch) {
    return {
      valid: true,
      action: 'SELL',
      amount: parseFloat(sellMatch[1]),
      fromToken: sellMatch[2],
      toToken: sellMatch[3],
    };
  }

  // Pattern: "balance of X" or "how much X"
  const balancePattern = /(?:balance|how much)\s+(\w+)/i;
  const balanceMatch = userMessage.match(balancePattern);
  if (balanceMatch) {
    return {
      valid: true,
      action: 'CHECK_BALANCE',
      token: balanceMatch[1],
    };
  }

  return {
    valid: false,
    action: null,
    error: 'Could not understand command',
  };
}

// ============================================================
// CORE FUNCTIONS
// ============================================================

export async function performSwap(request: SwapRequest): Promise<SwapResult> {
  try {
    const inputMint = resolveMint(request.fromToken);
    const outputMint = resolveMint(request.toToken);

    const inputDecimals = await getTokenDecimals(inputMint);
    const outputDecimals = await getTokenDecimals(outputMint);

    const quote = await getQuote(
      inputMint,
      outputMint,
      request.amount,
      inputDecimals
    );

    const outputAmount =
      parseInt(quote.outAmount) / Math.pow(10, outputDecimals);

    const txSignature = await executeSwapTx(quote);

    const inputSymbol = await getTokenSymbol(inputMint);
    const outputSymbol = await getTokenSymbol(outputMint);

    return {
      success: true,
      message: `✅ Swapped ${request.amount} ${inputSymbol} for ${outputAmount.toFixed(6)} ${outputSymbol}`,
      transaction: txSignature,
      details: {
        sent: `${request.amount} ${inputSymbol}`,
        received: `${outputAmount.toFixed(6)} ${outputSymbol}`,
        rate: outputAmount / request.amount,
      },
    };
  } catch (error: any) {
    return {
      success: false,
      message: `❌ Swap failed: ${error.message}`,
    };
  }
}

export async function getBalance(token?: string): Promise<number> {
  try {
    const connection = new Connection(SOLANA_RPC_URL, 'confirmed');
    const walletPubkey = new PublicKey(SOLANA_PUBLIC_KEY);

    if (!token || token.toUpperCase() === 'SOL') {
      const balance = await connection.getBalance(walletPubkey);
      return balance / 1e9;
    }

    const tokenMint = resolveMint(token);
    const accounts = await connection.getParsedTokenAccountsByOwner(
      walletPubkey,
      { mint: new PublicKey(tokenMint) }
    );

    if (accounts.value.length === 0) {
      return 0;
    }

    return accounts.value[0].account.data.parsed.info.tokenAmount.uiAmount;
  } catch {
    return 0;
  }
}

export async function executeCommand(
  userMessage: string
): Promise<SwapResult> {
  const parsed = parseCommand(userMessage);

  if (!parsed.valid) {
    return {
      success: false,
      message: `❌ ${parsed.error}`,
    };
  }

  switch (parsed.action) {
    case 'BUY':
    case 'SWAP':
    case 'SELL':
      return performSwap({
        fromToken: parsed.fromToken!,
        toToken: parsed.toToken!,
        amount: parsed.amount!,
      });

    case 'CHECK_BALANCE':
      const balance = await getBalance(parsed.token);
      return {
        success: true,
        message: `💰 You have ${balance.toFixed(6)} ${parsed.token?.toUpperCase() || 'SOL'}`,
      };

    default:
      return {
        success: false,
        message: '❌ Unknown action',
      };
  }
}

// ============================================================
// elizaOS ACTIONS
// ============================================================

export const swapAction = {
  name: 'SWAP_TOKENS',
  similes: ['swap', 'exchange', 'trade', 'convert', 'buy', 'sell'],
  description:
    'Swap or exchange Solana tokens. Supports natural language commands like "swap 0.1 USDC for SOL" or "buy 100 tokens from SOL"',
  validate: async () => true,
  handler: async (message: { content: string }) => {
    const result = await executeCommand(message.content);
    return result;
  },
  examples: [
    [
      {
        user: 'swap 0.1 USDC for SOL',
        content: {
          text: 'I will swap 0.1 USDC for SOL on Solana',
        },
      },
      {
        user: 'User wants to swap',
        content: {
          text: 'Executing swap...',
          action: 'SWAP_TOKENS',
        },
      },
    ],
    [
      {
        user: 'buy 0.001 HdZh from Sol',
        content: {
          text: 'I will buy HdZh tokens with 0.001 SOL',
        },
      },
      {
        user: 'User wants to buy tokens',
        content: {
          text: 'Executing purchase...',
          action: 'SWAP_TOKENS',
        },
      },
    ],
  ],
};

export const checkBalanceAction = {
  name: 'CHECK_BALANCE',
  similes: ['balance', 'how much', 'check', 'portfolio'],
  description: 'Check your wallet balance for any token',
  validate: async () => true,
  handler: async (message: { content: string }) => {
    const result = await executeCommand(message.content);
    return result;
  },
  examples: [
    [
      {
        user: 'how much USDC do I have',
        content: {
          text: 'I will check your USDC balance',
        },
      },
      {
        user: 'User wants to know balance',
        content: {
          text: 'Checking...',
          action: 'CHECK_BALANCE',
        },
      },
    ],
  ],
};

// ============================================================
// PLUGIN EXPORT FOR elizaOS
// ============================================================

export default {
  name: 'solana-swap-plugin',
  description: 'Solana token swap plugin for elizaOS',
  actions: [swapAction, checkBalanceAction],
  providers: [],
  evaluators: [],
};
