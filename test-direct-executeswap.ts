#!/usr/bin/env bun
/**
 * Direct swap test - No server needed
 * Tests executeSwap function directly
 */

import { executeSwap } from './api/swap-utils.ts';

console.log(`
╔════════════════════════════════════════════════════════════════╗
║        🎯 DIRECT SWAP TEST - No Server Needed                 ║
║    Testing executeSwap function with fixed Jupiter API URL    ║
╚════════════════════════════════════════════════════════════════╝
`);

const WALLET = 'CMVrzdso4SShQm2irrc7jMCN9Vw5QxXvrZKB79cYPPJT';

async function testDirectSwap() {
  console.log(`\n🎯 TEST 1: SOL → USDC (0.001 SOL)`);
  console.log(`Wallet: ${WALLET}`);
  
  try {
    const result = await executeSwap('SOL', 'USDC', 0.001, WALLET, 'ExactIn');
    
    console.log(`\nResult:`, JSON.stringify(result, null, 2));
    
    if (result.success) {
      console.log(`✅ SWAP SUCCESSFUL!`);
    } else {
      console.log(`❌ SWAP FAILED:`, result.error);
    }
  } catch (err) {
    console.log(`❌ ERROR:`, err.message);
  }
  
  console.log(`\n${'='.repeat(60)}`);
  console.log(`\n🎯 TEST 2: USDC → SOL (9 USDC)`);
  
  try {
    const result = await executeSwap('USDC', 'SOL', 9, WALLET, 'ExactIn');
    
    console.log(`\nResult:`, JSON.stringify(result, null, 2));
    
    if (result.success) {
      console.log(`✅ SWAP SUCCESSFUL!`);
    } else {
      console.log(`❌ SWAP FAILED:`, result.error);
    }
  } catch (err) {
    console.log(`❌ ERROR:`, err.message);
  }
}

testDirectSwap().catch(console.error);
