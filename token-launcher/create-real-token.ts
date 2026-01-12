#!/usr/bin/env node

/**
 * ⚡ REAL SOLANA MAINNET - PUMP.FUN TOKEN CREATION
 * 
 * This script actually creates a token on Solana Mainnet using Pump.fun SDK
 * WARNING: This will cost real SOL for transaction fees and liquidity
 * 
 * Wallet: 6VR1QcueqMDSgqDZ2JvcRumFu1Azo53qgy66XDJTvA1C
 * Required Balance: 1+ SOL (for fees + liquidity)
 */

import {
  Connection,
  PublicKey,
  Keypair,
  LAMPORTS_PER_SOL,
  Transaction,
  SystemProgram,
  sendAndConfirmTransaction,
} from '@solana/web3.js';
import { OnlinePumpSdk } from '@pump-fun/pump-sdk';
import bs58 from 'bs58';
import dotenv from 'dotenv';

dotenv.config();

const RPC_URL = process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';
const WALLET_KEY = process.env.DEV_WALLET_PRIVATE_KEY;
const PUMPFUN_API = process.env.PUMPPORTAL_API_KEY || 'https://pumpportal.fun/api';

let connection;
let sdk;
let wallet;

/**
 * Initialize Solana + Pump.fun SDK
 */
async function initialize() {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║     🎯 PUMP.FUN TOKEN CREATION - MAINNET                   ║');
  console.log('║     Solana Mainnet Real Transaction                        ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  try {
    console.log('📍 Initializing...\n');

    // Create connection
    connection = new Connection(RPC_URL, 'confirmed');
    const version = await connection.getVersion();
    console.log(`✓ Connected to Solana ${version['solana-core']}`);
    console.log(`  RPC: ${RPC_URL}\n`);

    // Load wallet
    if (!WALLET_KEY) {
      throw new Error('❌ DEV_WALLET_PRIVATE_KEY not set in .env');
    }

    wallet = Keypair.fromSecretKey(bs58.decode(WALLET_KEY));
    console.log(`✓ Wallet loaded: ${wallet.publicKey.toString()}`);

    // Check balance
    const balance = await connection.getBalance(wallet.publicKey);
    const balanceSOL = balance / LAMPORTS_PER_SOL;
    console.log(`✓ Balance: ${balanceSOL.toFixed(6)} SOL`);

    if (balanceSOL < 1) {
      console.log(`\n⚠️  INSUFFICIENT BALANCE!`);
      console.log(`   Required: 1.0 SOL (for gas + liquidity)`);
      console.log(`   Available: ${balanceSOL.toFixed(6)} SOL`);
      console.log(`\n   Get free SOL on Devnet:`);
      console.log(`   https://faucet.solana.com\n`);
      throw new Error('Insufficient balance for mainnet transaction');
    }

    // Initialize Pump.fun SDK
    sdk = new OnlinePumpSdk({
      rpcUrl: RPC_URL,
      wallet: wallet,
    });

    console.log('✓ Pump.fun SDK initialized\n');
    return true;
  } catch (error) {
    console.error('❌ Initialization failed:', error.message);
    return false;
  }
}

/**
 * Create token on Pump.fun
 */
async function createToken() {
  try {
    console.log('📍 Creating token...\n');

    const tokenName = 'Claude Protocol';
    const tokenSymbol = 'CLAUDE';
    const tokenDescription = 'Algorithmic market maker with automatic price support';
    const initialLiquidity = 0.5; // SOL
    const imageUrl = 'https://pumpportal.fun/pump-logo.png';

    console.log(`📝 Token Details:`);
    console.log(`   Name: ${tokenName}`);
    console.log(`   Symbol: ${tokenSymbol}`);
    console.log(`   Description: ${tokenDescription}`);
    console.log(`   Initial Liquidity: ${initialLiquidity} SOL\n`);

    // Generate token mint
    const tokenMint = Keypair.generate();
    console.log(`🔑 Token Mint: ${tokenMint.publicKey.toString()}`);

    // Create token using Pump.fun SDK
    console.log(`\n⏳ Submitting transaction...\n`);

    const createTokenResult = await sdk.createToken(
      tokenName, // name
      tokenSymbol, // symbol
      tokenDescription, // uri
      {
        decimals: 6,
        initialSupply: BigInt(1_000_000_000), // 1 billion tokens
      }
    );

    console.log(`✅ Token created successfully!`);
    console.log(`   Mint: ${createTokenResult.mint}\n`);

    return {
      mint: createTokenResult.mint,
      name: tokenName,
      symbol: tokenSymbol,
      initialLiquidity: initialLiquidity,
      creator: wallet.publicKey.toString(),
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('❌ Token creation failed:', error);
    return null;
  }
}

/**
 * Add liquidity to token bonding curve
 */
async function addLiquidity(tokenMint, solAmount = 0.5) {
  try {
    console.log(`📍 Adding liquidity to bonding curve...\n`);

    console.log(`💧 Liquidity Parameters:`);
    console.log(`   Token: ${tokenMint}`);
    console.log(`   SOL Amount: ${solAmount} SOL`);
    console.log(`   Slippage: 10%\n`);

    // Add liquidity using Pump.fun SDK
    console.log(`⏳ Submitting buy transaction...\n`);

    const buyResult = await sdk.buy(
      new PublicKey(tokenMint),
      wallet.publicKey,
      BigInt(solAmount * LAMPORTS_PER_SOL), // Amount in lamports
      { slippage: 0.1 } // 10% slippage
    );

    console.log(`✅ Liquidity added successfully!`);
    console.log(`   Transaction: ${buyResult.txid}\n`);

    // Calculate market cap
    const virtualSolReserves = solAmount;
    const virtualTokenReserves = 1_000_000_000;
    const initialPrice = (virtualSolReserves / virtualTokenReserves).toFixed(12);
    const marketCap = virtualSolReserves * 33; // ~$33 per SOL

    console.log(`📊 Market Metrics:`);
    console.log(`   Initial Price: ${initialPrice} SOL per token`);
    console.log(`   Market Cap: $${marketCap.toFixed(2)}\n`);

    return {
      txid: buyResult.txid,
      solAmount: solAmount,
      initialPrice: initialPrice,
      marketCap: marketCap,
    };
  } catch (error) {
    console.error('❌ Liquidity addition failed:', error);
    return null;
  }
}

/**
 * Display final report
 */
function displayReport(tokenData, liquidityData) {
  console.log('═'.repeat(70));
  console.log('✨ TOKEN CREATION COMPLETE');
  console.log('═'.repeat(70) + '\n');

  console.log('📋 TOKEN DETAILS:');
  console.log(`   Name: ${tokenData.name}`);
  console.log(`   Symbol: ${tokenData.symbol}`);
  console.log(`   Mint: ${tokenData.mint}`);
  console.log(`   Creator: ${tokenData.creator}\n`);

  console.log('💧 LIQUIDITY ADDED:');
  console.log(`   SOL: ${tokenData.initialLiquidity} SOL`);
  console.log(`   Initial Price: ${liquidityData.initialPrice} SOL per token`);
  console.log(`   Market Cap: $${liquidityData.marketCap.toFixed(2)}\n`);

  console.log('🔗 BLOCKCHAIN LINKS:');
  console.log(`   Solscan:  https://solscan.io/token/${tokenData.mint}`);
  console.log(`   Pump.fun: https://pump.fun/${tokenData.mint}`);
  console.log(`   Birdeye:  https://birdeye.so/token/${tokenData.mint}?chain=solana\n`);

  console.log('🎉 Your token is now LIVE on Solana Mainnet!');
  console.log('   Visit the links above to view and trade your token\n');

  console.log('═'.repeat(70) + '\n');
}

/**
 * Main execution
 */
async function main() {
  try {
    const initialized = await initialize();
    if (!initialized) return;

    const tokenData = await createToken();
    if (!tokenData) return;

    const liquidityData = await addLiquidity(tokenData.mint, 0.5);
    if (!liquidityData) return;

    displayReport(tokenData, liquidityData);

    console.log('✅ SUCCESS!\n');
    console.log('📝 Summary:');
    console.log(`   Token Mint: ${tokenData.mint}`);
    console.log(`   Transaction: ${liquidityData.txid}`);
    console.log(`   Created at: ${tokenData.timestamp}\n`);
  } catch (error) {
    console.error('Fatal error:', error.message);
    process.exit(1);
  }
}

main().catch(console.error);
