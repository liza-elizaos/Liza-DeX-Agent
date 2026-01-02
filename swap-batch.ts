#!/usr/bin/env bun
/**
 * LIZA Batch Swap Script
 * Execute multiple swaps from a configuration file
 * 
 * Usage: bun swap-batch.ts <configFile>
 * 
 * Config file format (JSON):
 * {
 *   "wallet": "your_wallet_address",
 *   "swaps": [
 *     { "amount": 0.001, "toToken": "USDC" },
 *     { "amount": 0.001, "toToken": "BONK" },
 *     { "amount": 0.002, "toToken": "USDT" }
 *   ]
 * }
 */

import { Connection, PublicKey } from '@solana/web3.js';
import { readFile } from 'fs/promises';

const WALLET_ADDRESS = process.env.SOLANA_PUBLIC_KEY || 'CMVrzdso4SShQm2irrc7jMCN9Vw5QxXvrZKB79cYPPJT';
const RPC_URL = process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';
const API_BASE = process.env.API_BASE || 'http://localhost:3000';

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
};

function log(color: string, ...args: any[]) {
  console.log(`${color}`, ...args, `${colors.reset}`);
}

interface SwapConfig {
  wallet?: string;
  swaps: Array<{ amount: number; toToken: string }>;
}

async function getBalance(wallet: string): Promise<number> {
  const connection = new Connection(RPC_URL, 'confirmed');
  const publicKey = new PublicKey(wallet);
  const balanceLamports = await connection.getBalance(publicKey);
  return balanceLamports / 1e9;
}

async function executeSwap(wallet: string, amount: number, toToken: string): Promise<void> {
  const response = await fetch(`${API_BASE}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sessionId: `session_${Date.now()}`,
      message: `swap ${amount} SOL for ${toToken}`,
      context: 'trading',
      walletPublicKey: wallet,
      config: null,
    }),
  });

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`);
  }

  const data = await response.json();
  return data;
}

async function main(): Promise<void> {
  const configFile = process.argv[2];

  if (!configFile || process.argv[2] === '--help' || process.argv[2] === '-h') {
    log(colors.bright + colors.magenta, `
LIZA Batch Swap Script
`);
    log(colors.yellow, 'Usage:');
    log(colors.reset, '  bun swap-batch.ts <configFile>');

    log(colors.yellow, '\nConfig file example:');
    log(colors.cyan, `{
  "wallet": "CMVrzdso4SShQm2irrc7jMCN9Vw5QxXvrZKB79cYPPJT",
  "swaps": [
    { "amount": 0.001, "toToken": "USDC" },
    { "amount": 0.001, "toToken": "BONK" },
    { "amount": 0.002, "toToken": "USDT" }
  ]
}`);

    log(colors.yellow, '\nExample:');
    log(colors.reset, '  bun swap-batch.ts swaps.json');
    process.exit(0);
  }

  try {
    // Read config file
    const configContent = await readFile(configFile, 'utf-8');
    const config: SwapConfig = JSON.parse(configContent);

    const wallet = config.wallet || WALLET_ADDRESS;

    // Validate wallet
    try {
      new PublicKey(wallet);
    } catch {
      log(colors.red, '❌ Invalid wallet address in config');
      process.exit(1);
    }

    if (!config.swaps || !Array.isArray(config.swaps) || config.swaps.length === 0) {
      log(colors.red, '❌ No swaps defined in config');
      process.exit(1);
    }

    log(colors.bright + colors.magenta, `
╔════════════════════════════════════════════╗
║     LIZA BATCH SWAP EXECUTION             ║
╚════════════════════════════════════════════╝
`);

    // Get balance
    log(colors.cyan, '💰 Fetching wallet balance...');
    const balance = await getBalance(wallet);
    log(colors.green, `✅ Balance: ${balance.toFixed(6)} SOL`);

    // Validate total amount
    const totalAmount = config.swaps.reduce((sum, swap) => sum + swap.amount, 0);
    if (balance < totalAmount) {
      log(colors.red, `\n❌ Insufficient balance!`);
      log(colors.yellow, `   Required: ${totalAmount} SOL`);
      log(colors.yellow, `   Available: ${balance.toFixed(6)} SOL`);
      process.exit(1);
    }

    // Show swap summary
    log(colors.yellow, `\n📋 Swap Summary:`);
    log(colors.yellow, `   Total swaps: ${config.swaps.length}`);
    log(colors.yellow, `   Total amount: ${totalAmount} SOL`);
    log(colors.yellow, `   Wallet: ${wallet.slice(0, 8)}...${wallet.slice(-8)}\n`);

    config.swaps.forEach((swap, i) => {
      log(colors.blue, `   ${i + 1}. ${swap.amount} SOL → ${swap.toToken}`);
    });

    // Execute swaps
    log(colors.cyan, `\n⏳ Starting batch swap execution...\n`);

    let successful = 0;
    let failed = 0;

    for (let i = 0; i < config.swaps.length; i++) {
      const swap = config.swaps[i];
      const swapNum = i + 1;

      log(colors.cyan, `[${swapNum}/${config.swaps.length}] Swapping ${swap.amount} SOL → ${swap.toToken}...`);

      try {
        const result = await executeSwap(wallet, swap.amount, swap.toToken);
        
        if (result.response) {
          // Check if successful
          if (result.response.includes('✅') || result.response.includes('Swap Successful')) {
            log(colors.green, `✅ Swap ${swapNum} successful!`);
            successful++;
          } else if (result.response.includes('❌')) {
            log(colors.red, `❌ Swap ${swapNum} failed!`);
            log(colors.yellow, result.response.substring(0, 200));
            failed++;
          } else {
            log(colors.yellow, `⚠️  Swap ${swapNum} response:`);
            console.log(result.response);
            successful++;
          }
        } else {
          log(colors.red, `❌ Swap ${swapNum} failed: No response`);
          failed++;
        }
      } catch (error) {
        log(colors.red, `❌ Swap ${swapNum} error: ${error instanceof Error ? error.message : String(error)}`);
        failed++;
      }

      // Delay between swaps
      if (i < config.swaps.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    // Summary
    log(colors.magenta, `\n╔════════════════════════════════════════════╗`);
    log(colors.magenta, `║         BATCH SWAP COMPLETE                ║`);
    log(colors.magenta, `╚════════════════════════════════════════════╝`);
    log(colors.green, `✅ Successful: ${successful}`);
    log(colors.red, `❌ Failed: ${failed}`);
    log(colors.yellow, `📊 Total: ${config.swaps.length}\n`);

  } catch (error) {
    log(colors.red, `\n❌ Error: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }
}

main();
