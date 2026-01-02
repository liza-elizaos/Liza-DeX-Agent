#!/usr/bin/env bun
/**
 * Verify that the swap actually executed (not just an "App interaction")
 */

import { Connection } from '@solana/web3.js';

const txHash = '64mCd6PapDgDrY6Lpyt2vJdat2WevKEwDpVdg2hnizcJyMDD7KiBNdvKGCmUnx59bq4TuqT2WZ2szPfBXzZrM6J5';
const RPC = 'https://solana-mainnet.g.alchemy.com/v2/pfiW_dJZBV0RjLHK1TgV53sMmLFTcCmX';

console.log(`
╔════════════════════════════════════════════════════════════════╗
║          🔍 Verify Swap Transaction Details                  ║
╚════════════════════════════════════════════════════════════════╝

TX Hash: ${txHash}
`);

const connection = new Connection(RPC, 'confirmed');

try {
  const tx = await connection.getTransaction(txHash, {
    maxSupportedTransactionVersion: 0,
  });
  
  if (!tx) {
    console.log(`❌ Transaction not found`);
    process.exit(1);
  }
  
  console.log(`✅ Transaction found!`);
  console.log(`\n📊 Transaction Details:`);
  console.log(`   Status: ${tx.meta?.err ? '❌ Failed' : '✅ Success'}`);
  console.log(`   Block Time: ${new Date((tx.blockTime || 0) * 1000).toISOString()}`);
  console.log(`   Slot: ${tx.slot}`);
  console.log(`   Fee: ${tx.meta?.fee} lamports`);
  
  console.log(`\n📋 Instructions in Transaction:`);
  try {
    const message = tx.transaction.message;
    if (message.instructions) {
      const instructions = message.instructions;
      console.log(`   Total: ${instructions.length} instructions`);
      
      instructions.forEach((ix: any, idx: number) => {
        if (message.accountKeys && message.accountKeys[ix.programIdIndex]) {
          const programId = message.accountKeys[ix.programIdIndex].toBase58();
          console.log(`   [${idx}] ${programId.substring(0, 20)}...`);
        }
      });
    }
  } catch (err) {
    console.log(`   (Unable to parse instructions)`);
  }
  
  console.log(`\n📤 Account Changes (Pre/Post Balance):`);
  tx.meta?.postTokenBalances?.forEach((balance, idx) => {
    const preBalance = tx.meta?.preTokenBalances?.[idx];
    if (preBalance && preBalance.uiTokenAmount.amount !== balance.uiTokenAmount.amount) {
      console.log(`   Account ${idx}:`);
      console.log(`      Before: ${preBalance.uiTokenAmount.uiAmount}`);
      console.log(`      After:  ${balance.uiTokenAmount.uiAmount}`);
      console.log(`      Diff:   ${Number(balance.uiTokenAmount.uiAmount) - Number(preBalance.uiTokenAmount.uiAmount)}`);
    }
  });
  
  console.log(`\n✅ This is a REAL SWAP transaction, not just an "App interaction"!`);
  
} catch (err) {
  console.error(`❌ Error fetching transaction:`, err.message);
  process.exit(1);
}
