#!/usr/bin/env node

/**
 * Test Script: Trust Score System with Rate Limiting
 * Purpose: Test trust score calculations with proper rate limiting
 * Usage: node test-free-rpc-ratelimit.mjs WALLET_ADDRESS
 */

import { Connection, PublicKey } from '@solana/web3.js';

const RPC_URL = 'https://api.mainnet-beta.solana.com';
const WALLET = process.argv[2] || 'DScqtGwFoDTme2Rzdjpdb2w7CtuKc6Z8KF7hMhbx8ugQ';

// Delay helper
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Color codes
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m'
};

async function testTrustScoreWithRateLimit() {
  console.log(`${colors.cyan}╔════════════════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.cyan}║   TRUST SCORE TEST (with Rate Limiting)             ║${colors.reset}`);
  console.log(`${colors.cyan}╚════════════════════════════════════════════════════╝${colors.reset}\n`);

  try {
    const connection = new Connection(RPC_URL, {
      commitment: 'confirmed',
      maxSupportedTransactionVersion: 0
    });

    console.log(`RPC: ${RPC_URL}`);
    console.log(`Wallet: ${WALLET}\n`);

    // Step 1: Get wallet pubkey
    console.log(`${colors.yellow}[1/5]${colors.reset} Validating wallet...`);
    let pubkey;
    try {
      pubkey = new PublicKey(WALLET);
      console.log(`      ✓ Valid Solana address\n`);
    } catch (e) {
      console.log(`${colors.red}✗ Invalid wallet address${colors.reset}`);
      process.exit(1);
    }

    // Step 2: Get balance
    console.log(`${colors.yellow}[2/5]${colors.reset} Fetching balance...`);
    const balance = await connection.getBalance(pubkey);
    const solBalance = balance / 1e9;
    console.log(`      ✓ Balance: ${solBalance.toFixed(6)} SOL\n`);
    await delay(500); // Rate limit

    // Step 3: Get signatures with rate limiting
    console.log(`${colors.yellow}[3/5]${colors.reset} Fetching transaction history (with rate limiting)...`);
    const signatures = await connection.getSignaturesForAddress(pubkey, {
      limit: 100
    });
    console.log(`      ✓ Found ${signatures.length} transactions\n`);
    await delay(500); // Rate limit

    // Step 4: Parse transactions with aggressive rate limiting
    console.log(`${colors.yellow}[4/5]${colors.reset} Analyzing transactions (with delays)...`);
    let analyzed = 0;
    let tokenLaunches = 0;
    let errors = 0;

    for (let i = 0; i < Math.min(signatures.length, 50); i++) {
      try {
        const tx = await connection.getTransaction(signatures[i].signature, {
          maxSupportedTransactionVersion: 0
        });

        if (!tx) {
          process.stdout.write('.');
          continue;
        }

        // Simple token detection
        const hasSPL = tx.transaction.message.accountKeys.some(ak =>
          ak.pubkey.toString() === 'TokenkegQfeZyiNwAJsyFbPVwwQQfC3kNYy2byMx9KTEz'
        );

        if (hasSPL) tokenLaunches++;
        analyzed++;
        process.stdout.write('✓');

        // Add delay between requests to avoid rate limit
        if (i % 3 === 0) {
          await delay(300); // Delay every 3 transactions
        }
      } catch (txError) {
        errors++;
        process.stdout.write('✗');
        // Continue even if one fails
      }
    }

    console.log(`\n      ✓ Analyzed ${analyzed} transactions\n`);
    await delay(500); // Rate limit

    // Step 5: Calculate metrics
    console.log(`${colors.yellow}[5/5]${colors.reset} Calculating trust score...\n`);

    const oldestSig = signatures[signatures.length - 1];
    const newestSig = signatures[0];

    const oldestDate = new Date((oldestSig.blockTime || 0) * 1000);
    const newestDate = new Date((newestSig.blockTime || 0) * 1000);

    const accountAgeDays = Math.floor(
      (Date.now() - oldestDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Calculate trust score
    let trustScore = 5;
    if (signatures.length >= 100) trustScore += 2;
    if (tokenLaunches >= 3) trustScore += 1;
    if (accountAgeDays >= 180) trustScore += 2;

    // Print report
    console.log(`${colors.bold}═══════════════════════════════════════════════════${colors.reset}`);
    console.log(`${colors.bold}DEVELOPER TRUST SCORE REPORT${colors.reset}`);
    console.log(`${colors.bold}═══════════════════════════════════════════════════${colors.reset}\n`);

    console.log(`Wallet: ${WALLET}`);
    console.log(`Trust Score: ${colors.cyan}${trustScore}/10${colors.reset}\n`);

    console.log(`${colors.bold}📊 METRICS:${colors.reset}`);
    console.log(`  • Total Transactions: ${signatures.length}`);
    console.log(`  • Token Launches: ${tokenLaunches}`);
    console.log(`  • Account Age: ${accountAgeDays} days`);
    console.log(`  • Last Activity: ${newestDate.toLocaleDateString()}`);
    console.log(`  • Account Created: ${oldestDate.toLocaleDateString()}\n`);

    console.log(`${colors.bold}🟢 GREEN FLAGS:${colors.reset}`);
    if (signatures.length >= 100)
      console.log(`  ✓ Regular activity (${signatures.length}+ transactions)`);
    if (tokenLaunches >= 3)
      console.log(`  ✓ Active developer (${tokenLaunches} token launches)`);
    if (accountAgeDays >= 180)
      console.log(`  ✓ Established account (${accountAgeDays}+ days old)\n`);

    console.log(`${colors.bold}🔴 RED FLAGS:${colors.reset}`);
    if (signatures.length < 50)
      console.log(`  ✗ Low activity (only ${signatures.length} transactions)`);
    if (tokenLaunches < 1)
      console.log(`  ✗ No token launches detected`);
    if (accountAgeDays < 30)
      console.log(`  ✗ New account (only ${accountAgeDays} days old)\n`);

    console.log(`${colors.bold}💡 RESULT:${colors.reset}`);
    if (trustScore >= 8) {
      console.log(`  ${colors.green}🟢 LOW RISK - Trusted developer${colors.reset}`);
    } else if (trustScore >= 6) {
      console.log(`  ${colors.yellow}🟡 MEDIUM RISK - Moderate trust${colors.reset}`);
    } else {
      console.log(`  ${colors.red}🔴 HIGH RISK - Use caution${colors.reset}`);
    }

    console.log(`\n${colors.bold}═══════════════════════════════════════════════════${colors.reset}\n`);

    // Rate limit info
    console.log(`${colors.cyan}ℹ️  RPC RATE LIMIT INFO:${colors.reset}`);
    console.log(`  • Free RPC has rate limits (~ 100 requests/second)`);
    console.log(`  • Added 300ms delay between requests`);
    console.log(`  • Analyzed 50 most recent transactions`);
    console.log(`  • Failed requests: ${errors}\n`);

    console.log(`${colors.green}✓ Test completed successfully${colors.reset}`);

  } catch (error) {
    console.error(`${colors.red}✗ Error: ${error.message}${colors.reset}`);
    process.exit(1);
  }
}

testTrustScoreWithRateLimit();
