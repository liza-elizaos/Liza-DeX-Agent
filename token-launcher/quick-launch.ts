#!/usr/bin/env node

/**
 * QUICK START: Launch token with one command
 * 
 * Usage:
 *   npm run launch -- --name "My Token" --symbol "MYT" --liquidity 0.5
 */

import { OnlinePumpSdk } from '@pump-fun/pump-sdk';
import { Connection, PublicKey, Keypair, LAMPORTS_PER_SOL } from '@solana/web3.js';
import bs58 from 'bs58';
import * as dotenv from 'dotenv';

dotenv.config();

// Parse command line arguments
const args = process.argv.slice(2);
const parseArgs = () => {
  const result: Record<string, string> = {};
  for (let i = 0; i < args.length; i += 2) {
    const key = args[i].replace('--', '');
    const value = args[i + 1];
    result[key] = value;
  }
  return result;
};

const cliArgs = parseArgs();

async function quickLaunch() {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║   🚀 QUICK TOKEN LAUNCH - Pump.fun                         ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  // Get config
  const config = {
    name: cliArgs.name || process.env.TOKEN_NAME || 'My Token',
    symbol: cliArgs.symbol || process.env.TOKEN_SYMBOL || 'TOKEN',
    description: cliArgs.description || process.env.TOKEN_DESCRIPTION || 'My awesome token',
    liquidity: parseFloat(cliArgs.liquidity || process.env.INITIAL_LIQUIDITY || '0.5'),
    rpcUrl: process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com',
    privateKey: process.env.SOLANA_PRIVATE_KEY,
  };

  console.log('📋 Configuration:');
  console.log(`   Name: ${config.name}`);
  console.log(`   Symbol: ${config.symbol}`);
  console.log(`   Liquidity: ${config.liquidity} SOL`);
  console.log(`   Network: ${config.rpcUrl === 'https://api.devnet.solana.com' ? 'DEVNET (SAFE)' : 'MAINNET (REAL!)'}`);
  console.log('');

  if (!config.privateKey) {
    console.error('❌ Error: SOLANA_PRIVATE_KEY not set in .env');
    console.log('\nTo fix:');
    console.log('  1. Create .env file in token-launcher/');
    console.log('  2. Add: SOLANA_PRIVATE_KEY=your_base58_key');
    console.log('  3. Save and try again\n');
    process.exit(1);
  }

  try {
    // Initialize
    const connection = new Connection(config.rpcUrl, 'confirmed');
    const wallet = Keypair.fromSecretKey(bs58.decode(config.privateKey));
    const sdk = new OnlinePumpSdk();

    console.log(`💰 Wallet: ${wallet.publicKey.toString()}`);

    // Check balance
    const balance = await connection.getBalance(wallet.publicKey);
    const balanceSOL = balance / LAMPORTS_PER_SOL;
    console.log(`   Balance: ${balanceSOL.toFixed(4)} SOL`);

    const requiredSOL = config.liquidity + 0.1;
    if (balanceSOL < requiredSOL) {
      console.error(`\n❌ Insufficient balance!`);
      console.error(`   Need: ${requiredSOL} SOL`);
      console.error(`   Have: ${balanceSOL.toFixed(4)} SOL`);
      process.exit(1);
    }

    console.log('\n🚀 Launching token...\n');

    // Create token
    const mintKeypair = Keypair.generate();
    const mint = mintKeypair.publicKey;

    console.log(`✓ Mint: ${mint.toString()}`);

    // Create via SDK
    const result = await sdk.createToken({
      mint: mintKeypair,
      owner: wallet,
      metadata: {
        name: config.name,
        symbol: config.symbol,
        uri: 'https://pump.fun/metadata',
        description: config.description,
      },
      initialSupply: 1_000_000_000,
    });

    console.log(`✓ Created: TX ${result.txHash?.substring(0, 20)}...`);

    // Wait for confirmation
    console.log('\n⏳ Waiting for confirmation...');
    await new Promise((r) => setTimeout(r, 15000));

    console.log('\n✅ SUCCESS!\n');
    console.log('═'.repeat(70));
    console.log('TOKEN LAUNCHED');
    console.log('═'.repeat(70));
    console.log(`Name: ${config.name}`);
    console.log(`Symbol: ${config.symbol}`);
    console.log(`Mint: ${mint.toString()}`);
    console.log('\n🔗 Links:');
    console.log(`   Solscan: https://solscan.io/token/${mint.toString()}`);
    console.log(`   Pump.fun: https://pump.fun/${mint.toString()}`);
    console.log('\n💡 Next: Share your mint address to start trading!\n');
  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

quickLaunch();
