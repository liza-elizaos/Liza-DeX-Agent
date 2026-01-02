#!/usr/bin/env bun
/**
 * FINAL COMPLETE TEST - Everything together
 * 1. Check balance
 * 2. Get Jupiter quote
 * 3. Verify both directions work
 */

import { Connection, PublicKey } from '@solana/web3.js';

console.log(`
╔════════════════════════════════════════════════════════════════╗
║              ✅ FINAL COMPLETE SWAP TEST                      ║
║         Testing: Balance → Quote → Both Directions             ║
╚════════════════════════════════════════════════════════════════╝
`);

const WALLET = 'CMVrzdso4SShQm2irrc7jMCN9Vw5QxXvrZKB79cYPPJT';
const RPC = 'https://solana-mainnet.g.alchemy.com/v2/pfiW_dJZBV0RjLHK1TgV53sMmLFTcCmX';
const JUPITER_KEY = 'cd72422b-136c-4951-a00f-9fb904e14acf';
const JUPITER_URL = 'https://api.jup.ag/swap/v1/quote';

const WSOL = 'So11111111111111111111111111111111111111112';
const USDC = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';

async function testBalanceAndQuotes() {
  let testsPassed = 0;
  let testsFailed = 0;
  
  // TEST 1: Balance
  console.log(`\n✓ TEST 1: Balance Check`);
  try {
    const connection = new Connection(RPC, 'confirmed');
    const pubKey = new PublicKey(WALLET);
    const balance = await connection.getBalance(pubKey);
    const solBalance = balance / 1e9;
    
    console.log(`  SOL Balance: ${solBalance.toFixed(6)}`);
    
    if (solBalance > 0.002) {
      console.log(`  ✅ PASS`);
      testsPassed++;
    } else {
      console.log(`  ❌ FAIL - Low balance`);
      testsFailed++;
    }
  } catch (err) {
    console.log(`  ❌ FAIL - ${err.message}`);
    testsFailed++;
  }
  
  // TEST 2: SOL → USDC
  console.log(`\n✓ TEST 2: SOL → USDC Quote`);
  try {
    const params = new URLSearchParams({
      inputMint: WSOL,
      outputMint: USDC,
      amount: '1000000',
      slippageBps: '50',
    });
    
    const url = `${JUPITER_URL}?${params.toString()}`;
    console.log(`  URL: ${url.substring(0, 80)}...`);
    
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'x-api-key': JUPITER_KEY,
      }
    });
    
    console.log(`  Status: ${response.status}`);
    
    if (response.ok) {
      const data = await response.json();
      const usdcOut = Number(data.outAmount) / 1e6;
      console.log(`  0.001 SOL → ${usdcOut.toFixed(6)} USDC`);
      console.log(`  Route: ${data.routePlan?.[0]?.swapInfo?.label}`);
      console.log(`  ✅ PASS`);
      testsPassed++;
    } else {
      const error = await response.text();
      console.log(`  Error: ${error}`);
      console.log(`  ❌ FAIL`);
      testsFailed++;
    }
  } catch (err) {
    console.log(`  ❌ FAIL - ${err.message}`);
    testsFailed++;
  }
  
  // TEST 3: USDC → SOL
  console.log(`\n✓ TEST 3: USDC → SOL Quote`);
  try {
    const params = new URLSearchParams({
      inputMint: USDC,
      outputMint: WSOL,
      amount: '9000000',
      slippageBps: '50',
    });
    
    const url = `${JUPITER_URL}?${params.toString()}`;
    console.log(`  URL: ${url.substring(0, 80)}...`);
    
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'x-api-key': JUPITER_KEY,
      }
    });
    
    console.log(`  Status: ${response.status}`);
    
    if (response.ok) {
      const data = await response.json();
      const solOut = Number(data.outAmount) / 1e9;
      console.log(`  9 USDC → ${solOut.toFixed(6)} SOL`);
      console.log(`  Route: ${data.routePlan?.[0]?.swapInfo?.label}`);
      console.log(`  ✅ PASS`);
      testsPassed++;
    } else {
      const error = await response.text();
      console.log(`  Error: ${error}`);
      console.log(`  ❌ FAIL`);
      testsFailed++;
    }
  } catch (err) {
    console.log(`  ❌ FAIL - ${err.message}`);
    testsFailed++;
  }
  
  // SUMMARY
  console.log(`
╔════════════════════════════════════════════════════════════════╗
║                    FINAL RESULT                                ║
╚════════════════════════════════════════════════════════════════╝

Tests Passed: ${testsPassed}/3 ✅
Tests Failed: ${testsFailed}/3 ❌

Status: ${testsFailed === 0 ? '🚀 ALL SYSTEMS GO!' : '⚠️ NEEDS FIXES'}
`);
  
  return testsFailed === 0;
}

testBalanceAndQuotes().catch(console.error);
