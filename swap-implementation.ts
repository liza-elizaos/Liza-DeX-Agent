#!/usr/bin/env bun
/**
 * FINAL SWAP IMPLEMENTATION
 * Direct import and use of executeSwap function
 * Ready for elizaOS integration
 */

import { executeSwap } from './api/swap-utils.ts';
import { Connection, PublicKey } from '@solana/web3.js';

// Configuration
const WALLET_ADDRESS = process.env.SOLANA_PUBLIC_KEY || 'CMVrzdso4SShQm2irrc7jMCN9Vw5QxXvrZKB79cYPPJT';
const RPC_URL = process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';

// Color output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(color: string, ...args: any[]) {
  console.log(`${color}`, ...args, `${colors.reset}`);
}

async function getBalance(): Promise<number> {
  try {
    const connection = new Connection(RPC_URL, 'confirmed');
    const publicKey = new PublicKey(WALLET_ADDRESS);
    const balanceLamports = await connection.getBalance(publicKey);
    return balanceLamports / 1e9;
  } catch (error) {
    log(colors.red, '❌ Error fetching balance:', error instanceof Error ? error.message : String(error));
    throw error;
  }
}

async function performSwap(fromToken: string, toToken: string, amount: number, walletAddress?: string): Promise<any> {
  const wallet = walletAddress || WALLET_ADDRESS;
  
  try {
    log(colors.bright, `\n🚀 SHINA Token Swap`);
    log(colors.blue, `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

    // Get balance
    log(colors.cyan, `\n💰 Checking wallet balance...`);
    const balance = await getBalance();
    log(colors.green, `✅ Balance: ${balance.toFixed(6)} SOL`);

    // Validate amount
    if (fromToken.toUpperCase() === 'SOL' && balance < amount) {
      log(colors.red, `❌ Insufficient balance!`);
      log(colors.yellow, `   Required: ${amount} SOL`);
      log(colors.yellow, `   Available: ${balance.toFixed(6)} SOL`);
      throw new Error('Insufficient balance');
    }

    log(colors.yellow, `\n📊 Swap Details:`);
    log(colors.yellow, `   From: ${amount} ${fromToken.toUpperCase()}`);
    log(colors.yellow, `   To: ${toToken.toUpperCase()}`);
    log(colors.yellow, `   Wallet: ${wallet.slice(0, 8)}...${wallet.slice(-8)}`);

    // Execute swap using direct function
    log(colors.cyan, `\n📡 Executing swap...`);
    const result = await executeSwap(fromToken, toToken, amount, wallet, 'ExactIn');
    
    if (result.success) {
      log(colors.green, `\n✅ SWAP SUCCESSFUL!`);
      log(colors.green, result.message || '');
      return {
        success: true,
        txHash: result.txHash,
        message: result.message,
      };
    } else {
      log(colors.red, `\n❌ SWAP FAILED`);
      log(colors.red, result.message || result.error);
      return {
        success: false,
        error: result.error,
        message: result.message,
      };
    }

  } catch (error) {
    log(colors.red, '❌ Error:', error instanceof Error ? error.message : String(error));
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    log(colors.yellow, `
Usage: bun swap-implementation.ts <toToken> <amount> [walletAddress]

Examples:
  bun swap-implementation.ts USDC 0.001
  bun swap-implementation.ts SOL 5
  bun swap-implementation.ts USDT 1.0
    `);
    process.exit(0);
  }

  const toToken = args[0];
  const amountStr = args[1];
  const customWallet = args[2];

  if (!toToken || !amountStr) {
    log(colors.red, '❌ Missing arguments');
    process.exit(1);
  }

  const amount = parseFloat(amountStr);
  if (isNaN(amount) || amount <= 0) {
    log(colors.red, '❌ Invalid amount');
    process.exit(1);
  }

  const result = await performSwap('SOL', toToken, amount, customWallet);
  process.exit(result.success ? 0 : 1);
}

// Export for elizaOS integration
export { performSwap, getBalance };

// Run if called directly
if (import.meta.main) {
  main().catch(console.error);
}
