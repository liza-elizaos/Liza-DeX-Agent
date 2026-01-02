#!/usr/bin/env bun
/**
 * LIZA Swap Script
 * Usage: bun swap.ts <toToken> <amount> [walletAddress]
 * 
 * Examples:
 *   bun swap.ts USDC 0.001       - Swap 0.001 SOL for USDC
 *   bun swap.ts BONK 0.001       - Swap 0.001 SOL for BONK
 *   bun swap.ts USDT 0.5         - Swap 0.5 SOL for USDT
 */

import { Connection, PublicKey } from '@solana/web3.js';

// Configuration
const WALLET_ADDRESS = process.env.SOLANA_PUBLIC_KEY || 'CMVrzdso4SShQm2irrc7jMCN9Vw5QxXvrZKB79cYPPJT';
const RPC_URL = process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';
const API_BASE = process.env.API_BASE || 'http://127.0.0.1:3000';

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
    process.exit(1);
  }
}

async function executeSwap(fromToken: string, toToken: string, amount: number): Promise<void> {
  try {
    log(colors.cyan, '\n📡 Sending swap request...');
    
    const response = await fetch(`${API_BASE}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: `session_${Date.now()}`,
        message: `swap ${amount} ${fromToken} for ${toToken}`,
        context: 'trading',
        walletPublicKey: WALLET_ADDRESS,
        config: null,
      }),
    });

    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }

    const data = await response.json();
    
    if (data.response) {
      log(colors.green, '\n✅ Swap Response:');
      console.log(data.response);
    } else {
      log(colors.red, '\n❌ No response from API');
    }
  } catch (error) {
    log(colors.red, '❌ Swap error:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
    console.log(`
${colors.bright}${colors.cyan}LIZA Swap Script${colors.reset}

${colors.yellow}Usage:${colors.reset}
  bun swap.ts <toToken> <amount> [walletAddress]

${colors.yellow}Arguments:${colors.reset}
  toToken       - Token to swap to (e.g., USDC, BONK, USDT, RAY)
  amount        - Amount of SOL to swap (e.g., 0.001, 0.5, 1.0)
  walletAddress - (Optional) Wallet address to use

${colors.yellow}Examples:${colors.reset}
  bun swap.ts USDC 0.001        # Swap 0.001 SOL for USDC
  bun swap.ts BONK 0.5          # Swap 0.5 SOL for BONK
  bun swap.ts USDT 1.0          # Swap 1.0 SOL for USDT

${colors.yellow}Supported Tokens:${colors.reset}
  SOL, USDC, USDT, MSOL, RAY, COPE, SRM, FTT, KIN, WSOL, BONK, MARINADE

${colors.yellow}Environment Variables:${colors.reset}
  SOLANA_PUBLIC_KEY   - Your Solana wallet address (default: test wallet)
  SOLANA_RPC_URL      - Solana RPC endpoint
  API_BASE            - API base URL (default: http://localhost:3000)
    `);
    process.exit(0);
  }

  const toToken = args[0].toUpperCase();
  const amountStr = args[1];
  const customWallet = args[2];

  if (!toToken || !amountStr) {
    log(colors.red, '❌ Missing arguments. Use: bun swap.ts <toToken> <amount>');
    log(colors.yellow, 'Example: bun swap.ts USDC 0.001');
    process.exit(1);
  }

  const amount = parseFloat(amountStr);
  if (isNaN(amount) || amount <= 0) {
    log(colors.red, '❌ Invalid amount. Must be a positive number');
    process.exit(1);
  }

  const walletAddress = customWallet || WALLET_ADDRESS;

  try {
    log(colors.bright, `\n🚀 LIZA Token Swap`);
    log(colors.blue, `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

    // Get balance
    log(colors.cyan, `\n💰 Checking wallet balance...`);
    const balance = await getBalance();
    log(colors.green, `✅ Balance: ${balance.toFixed(6)} SOL`);

    // Validate amount
    if (balance < amount) {
      log(colors.red, `❌ Insufficient balance!`);
      log(colors.yellow, `   Required: ${amount} SOL`);
      log(colors.yellow, `   Available: ${balance.toFixed(6)} SOL`);
      process.exit(1);
    }

    log(colors.yellow, `\n📊 Swap Details:`);
    log(colors.yellow, `   From: ${amount} SOL`);
    log(colors.yellow, `   To: ${toToken}`);
    log(colors.yellow, `   Wallet: ${walletAddress.slice(0, 8)}...${walletAddress.slice(-8)}`);

    // Execute swap
    await executeSwap('SOL', toToken, amount);

  } catch (error) {
    log(colors.red, '❌ Error:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

main();
