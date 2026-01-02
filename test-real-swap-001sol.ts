#!/usr/bin/env bun
/**
 * REAL SWAP TEST - 0.01 SOL
 * Direct test to see if swap actually executes
 */

import { executeSwap } from './api/swap-utils.ts';

console.log(`
╔════════════════════════════════════════════════════════════════╗
║           🎯 REAL SWAP TEST - 0.01 SOL                        ║
║          Testing if swap actually works end-to-end             ║
╚════════════════════════════════════════════════════════════════╝
`);

const WALLET = 'CMVrzdso4SShQm2irrc7jMCN9Vw5QxXvrZKB79cYPPJT';

async function testRealSwap() {
  console.log(`\n🎯 SWAP TEST: 0.01 SOL → USDC`);
  console.log(`Wallet: ${WALLET}`);
  console.log(`Amount: 0.01 SOL`);
  
  try {
    console.log(`\n⏳ Calling executeSwap()...`);
    const result = await executeSwap('SOL', 'USDC', 0.01, WALLET, 'ExactIn');
    
    console.log(`\n📊 RESULT:`);
    console.log(JSON.stringify(result, null, 2));
    
    if (result.success) {
      console.log(`\n✅ SWAP SUCCESSFUL!`);
      console.log(`Transaction: ${result.txSignature}`);
      return true;
    } else {
      console.log(`\n❌ Swap failed with error: ${result.error}`);
      console.log(`Message: ${result.message}`);
      
      // Check if quote worked but transaction failed
      if (result.message && result.message.includes('quote')) {
        console.log(`\n⚠️  Quote succeeded but transaction setup failed`);
        console.log(`This is expected - we need wallet to execute`);
        return false;
      }
      return false;
    }
  } catch (err) {
    console.log(`\n❌ CRITICAL ERROR:`, err instanceof Error ? err.message : String(err));
    console.log(`Stack:`, err instanceof Error ? err.stack : 'N/A');
    return false;
  }
}

console.log(`\n⏳ Starting test...\n`);
testRealSwap().then(success => {
  console.log(`\n${'='.repeat(60)}`);
  if (success) {
    console.log(`✅ TEST PASSED - Swap executed successfully!`);
  } else {
    console.log(`⚠️  TEST COMPLETED - Check details above`);
  }
  process.exit(success ? 0 : 1);
}).catch(err => {
  console.error(`Fatal error:`, err);
  process.exit(1);
});
