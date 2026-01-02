#!/usr/bin/env bun
/**
 * LIZA Interactive Swap Terminal
 * Allows you to interactively swap tokens with balance checking and confirmations
 */

import { Connection, PublicKey } from '@solana/web3.js';
import * as readline from 'readline';

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

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function log(color: string, ...args: any[]) {
  console.log(`${color}`, ...args, `${colors.reset}`);
}

function question(prompt: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(`${colors.cyan}${prompt}${colors.reset}`, resolve);
  });
}

async function getBalance(wallet: string = WALLET_ADDRESS): Promise<number> {
  try {
    const connection = new Connection(RPC_URL, 'confirmed');
    const publicKey = new PublicKey(wallet);
    const balanceLamports = await connection.getBalance(publicKey);
    return balanceLamports / 1e9;
  } catch (error) {
    throw new Error(`Failed to fetch balance: ${error instanceof Error ? error.message : String(error)}`);
  }
}

async function executeSwap(wallet: string, fromAmount: number, toToken: string): Promise<void> {
  const response = await fetch(`${API_BASE}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sessionId: `session_${Date.now()}`,
      message: `swap ${fromAmount} SOL for ${toToken}`,
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

async function showMenu(): Promise<string> {
  console.log(`
${colors.bright}${colors.magenta}
╔════════════════════════════════════════════╗
║     LIZA INTERACTIVE SWAP TERMINAL        ║
╚════════════════════════════════════════════╝
${colors.reset}

${colors.yellow}Options:${colors.reset}
  1. Quick Swap (SOL → Token)
  2. Check Balance
  3. Batch Swap
  4. Token Info
  5. Exit
  `);
  
  const choice = await question('Choose an option (1-5): ');
  return choice;
}

async function quickSwap(): Promise<void> {
  try {
    log(colors.bright, '\n🔄 Quick Swap');
    log(colors.blue, '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    const wallet = await question('Wallet address (default: configured): ') || WALLET_ADDRESS;
    
    // Validate wallet
    try {
      new PublicKey(wallet);
    } catch {
      log(colors.red, '❌ Invalid wallet address');
      return;
    }

    log(colors.cyan, '\n💰 Fetching balance...');
    const balance = await getBalance(wallet);
    log(colors.green, `✅ Balance: ${balance.toFixed(6)} SOL`);

    const amountStr = await question('Amount to swap (SOL): ');
    const amount = parseFloat(amountStr);

    if (isNaN(amount) || amount <= 0) {
      log(colors.red, '❌ Invalid amount');
      return;
    }

    if (balance < amount) {
      log(colors.red, `❌ Insufficient balance! Need ${amount} SOL, have ${balance.toFixed(6)} SOL`);
      return;
    }

    const toToken = await question('Token to swap to (e.g., USDC, BONK, USDT): ');
    if (!toToken) {
      log(colors.red, '❌ Token not specified');
      return;
    }

    // Confirmation
    log(colors.yellow, `\n📊 Confirm swap:`);
    log(colors.yellow, `   From: ${amount} SOL`);
    log(colors.yellow, `   To: ${toToken.toUpperCase()}`);
    log(colors.yellow, `   Wallet: ${wallet.slice(0, 8)}...${wallet.slice(-8)}`);

    const confirm = await question('\nProceed? (yes/no): ');
    
    if (confirm.toLowerCase() !== 'yes' && confirm.toLowerCase() !== 'y') {
      log(colors.yellow, '⏭️  Swap cancelled');
      return;
    }

    log(colors.cyan, '\n⏳ Processing swap...');
    const result = await executeSwap(wallet, amount, toToken.toUpperCase());
    log(colors.green, `\n✅ Swap response:\n`);
    console.log(result.response || result);

  } catch (error) {
    log(colors.red, `\n❌ Error: ${error instanceof Error ? error.message : String(error)}`);
  }
}

async function checkBalance(): Promise<void> {
  try {
    const wallet = await question('Wallet address (default: configured): ') || WALLET_ADDRESS;
    
    try {
      new PublicKey(wallet);
    } catch {
      log(colors.red, '❌ Invalid wallet address');
      return;
    }

    log(colors.cyan, '💰 Fetching balance...');
    const balance = await getBalance(wallet);
    
    log(colors.green, `\n✅ Wallet Balance`);
    log(colors.yellow, `   Address: ${wallet.slice(0, 8)}...${wallet.slice(-8)}`);
    log(colors.yellow, `   Balance: ${balance.toFixed(6)} SOL`);
    log(colors.yellow, `   Lamports: ${(balance * 1e9).toFixed(0)}`);
  } catch (error) {
    log(colors.red, `\n❌ Error: ${error instanceof Error ? error.message : String(error)}`);
  }
}

async function batchSwap(): Promise<void> {
  try {
    log(colors.bright, '\n📦 Batch Swap');
    log(colors.blue, '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const wallet = await question('Wallet address (default: configured): ') || WALLET_ADDRESS;
    const swapCountStr = await question('Number of swaps to execute: ');
    const swapCount = parseInt(swapCountStr);

    if (isNaN(swapCount) || swapCount <= 0) {
      log(colors.red, '❌ Invalid number');
      return;
    }

    const swaps: Array<{ amount: number; token: string }> = [];

    for (let i = 0; i < swapCount; i++) {
      log(colors.yellow, `\n📍 Swap ${i + 1}/${swapCount}`);
      const amountStr = await question('  Amount (SOL): ');
      const token = await question('  Token: ');
      
      const amount = parseFloat(amountStr);
      if (!isNaN(amount) && amount > 0 && token) {
        swaps.push({ amount, token: token.toUpperCase() });
      }
    }

    log(colors.yellow, `\n📋 Review ${swaps.length} swaps:`);
    swaps.forEach((swap, i) => {
      log(colors.yellow, `   ${i + 1}. ${swap.amount} SOL → ${swap.token}`);
    });

    const confirm = await question('\nExecute all swaps? (yes/no): ');
    if (confirm.toLowerCase() !== 'yes' && confirm.toLowerCase() !== 'y') {
      log(colors.yellow, '⏭️  Batch swap cancelled');
      return;
    }

    for (let i = 0; i < swaps.length; i++) {
      const swap = swaps[i];
      log(colors.cyan, `\n⏳ Executing swap ${i + 1}/${swaps.length}: ${swap.amount} SOL → ${swap.token}`);
      try {
        const result = await executeSwap(wallet, swap.amount, swap.token);
        log(colors.green, `✅ Swap ${i + 1} complete`);
        if (result.response) {
          console.log(result.response);
        }
      } catch (error) {
        log(colors.red, `❌ Swap ${i + 1} failed: ${error instanceof Error ? error.message : String(error)}`);
      }
      
      // Small delay between swaps
      if (i < swaps.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    log(colors.green, `\n✅ Batch swap complete!`);

  } catch (error) {
    log(colors.red, `\n❌ Error: ${error instanceof Error ? error.message : String(error)}`);
  }
}

async function tokenInfo(): Promise<void> {
  log(colors.bright, '\n📖 Supported Tokens');
  log(colors.blue, '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  const tokens = [
    { name: 'SOL', address: 'So11111111111111111111111111111111111111111', decimals: 9 },
    { name: 'USDC', address: 'EPjFWaLb3hycctiLUXe9ak3G2wBiRAQsmDF93PI5DBe', decimals: 6 },
    { name: 'USDT', address: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BEnNYb', decimals: 6 },
    { name: 'MSOL', address: 'mSoLzYCxHdgqynouc33cLL7mDJNAYXcSovzChBRc1xQ', decimals: 9 },
    { name: 'RAY', address: '4k3Dyjzvzp8eMZRvUoJRTUKvjYnRjJuNm6Z3bQCTe4Y', decimals: 6 },
    { name: 'BONK', address: 'DezXAZ8z7PnrnRJjz3wXBoQskzw1ia8dx5WhJAu1d8b8', decimals: 5 },
    { name: 'COPE', address: '8HGyAAB1yoM1ttS7pNoU34aARYRfSdVmL67LJwKX19gW', decimals: 6 },
    { name: 'SRM', address: 'SRMuApVgqbCmmp5YLrqDL47XYySRJ16jimmy5sStzLy', decimals: 6 },
  ];

  tokens.forEach(token => {
    log(colors.yellow, `${token.name.padEnd(8)} | Decimals: ${token.decimals} | ${token.address.slice(0, 10)}...`);
  });
}

async function main(): Promise<void> {
  log(colors.bright, '\n🚀 LIZA Swap Terminal\n');

  let running = true;
  while (running) {
    try {
      const choice = await showMenu();

      switch (choice.trim()) {
        case '1':
          await quickSwap();
          break;
        case '2':
          await checkBalance();
          break;
        case '3':
          await batchSwap();
          break;
        case '4':
          await tokenInfo();
          break;
        case '5':
          log(colors.green, '\n👋 Goodbye!');
          running = false;
          break;
        default:
          log(colors.red, '❌ Invalid option');
      }
    } catch (error) {
      log(colors.red, `Error: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  rl.close();
}

main();
