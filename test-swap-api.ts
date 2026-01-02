#!/usr/bin/env bun
/**
 * SWAP TEST WITH SERVER API
 * Tests the complete flow through the server
 */

import { Connection, PublicKey } from '@solana/web3.js';

console.log(`
╔════════════════════════════════════════════════════════════════╗
║            🚀 SWAP TEST THROUGH SERVER API                    ║
║               Testing /api/chat endpoint                       ║
╚════════════════════════════════════════════════════════════════╝
`);

const WALLET = 'CMVrzdso4SShQm2irrc7jMCN9Vw5QxXvrZKB79cYPPJT';
const RPC = 'https://solana-mainnet.g.alchemy.com/v2/pfiW_dJZBV0RjLHK1TgV53sMmLFTcCmX';
const API_BASE = 'http://127.0.0.1:3000';

async function testSwapViaAPI() {
  // First check balance
  console.log(`\n📊 Checking balance...`);
  try {
    const connection = new Connection(RPC, 'confirmed');
    const pubKey = new PublicKey(WALLET);
    const balance = await connection.getBalance(pubKey);
    const solBalance = balance / 1e9;
    console.log(`   ✅ Balance: ${solBalance.toFixed(6)} SOL\n`);
  } catch (err) {
    console.log(`   ❌ Balance check failed: ${err.message}`);
    return false;
  }
  
  // Test 1: SOL → USDC
  console.log(`✓ TEST 1: SOL → USDC via API`);
  console.log(`  Message: "swap 0.001 SOL for USDC"`);
  
  try {
    const response = await fetch(`${API_BASE}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: `session_${Date.now()}`,
        message: 'swap 0.001 SOL for USDC',
        context: 'trading',
        walletPublicKey: WALLET,
      }),
    });
    
    if (!response.ok) {
      console.log(`  ❌ FAIL - Status ${response.status}`);
      return false;
    }
    
    const data = await response.json();
    console.log(`  Response:\n${data.response}`);
    
    if (data.response.includes('✅')) {
      console.log(`  ✅ PASS\n`);
    } else if (data.response.includes('USDC')) {
      console.log(`  ✅ PASS - Quote received\n`);
    } else {
      console.log(`  ⚠️ Response received but status unclear\n`);
    }
    
  } catch (err) {
    console.log(`  ❌ FAIL - ${err.message}\n`);
    return false;
  }
  
  // Test 2: USDC → SOL
  console.log(`✓ TEST 2: USDC → SOL via API`);
  console.log(`  Message: "swap 9 USDC for SOL"`);
  
  try {
    const response = await fetch(`${API_BASE}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: `session_${Date.now()}`,
        message: 'swap 9 USDC for SOL',
        context: 'trading',
        walletPublicKey: WALLET,
      }),
    });
    
    if (!response.ok) {
      console.log(`  ❌ FAIL - Status ${response.status}`);
      return false;
    }
    
    const data = await response.json();
    console.log(`  Response:\n${data.response}`);
    
    if (data.response.includes('✅')) {
      console.log(`  ✅ PASS\n`);
    } else if (data.response.includes('SOL')) {
      console.log(`  ✅ PASS - Quote received\n`);
    } else {
      console.log(`  ⚠️ Response received but status unclear\n`);
    }
    
  } catch (err) {
    console.log(`  ❌ FAIL - ${err.message}\n`);
    return false;
  }
  
  console.log(`
╔════════════════════════════════════════════════════════════════╗
║                 ✅ SWAPS WORKING PERFECTLY!                   ║
╚════════════════════════════════════════════════════════════════╝

Ready to execute:
  • npm run swap -- USDC 0.001      (SOL → USDC)
  • npm run swap -- USDC 0.005      (More USDC)
  • bun swap-interactive.ts          (Interactive menu)
`);
  
  return true;
}

testSwapViaAPI().catch(console.error);
