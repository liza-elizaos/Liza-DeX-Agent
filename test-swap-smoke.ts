#!/usr/bin/env bun
import { executeSwap } from './api/swap-utils.ts';

async function run() {
  console.log('Starting swap smoke test (no server signing expected)');
  const fromToken = 'Sol';
  const toToken = 'HdZh1mUvCVJzHfTFaJJxZJFENhiFAkyiXLA5iZZTpump';
  const amount = 0.001;
  const walletPublicKey = process.env.SOLANA_PUBLIC_KEY || '7kDH3pzNUH3Jx1oTeWjGHExKY89K5ZzQLVB3iw5dGLP';

  try {
    const result = await executeSwap(fromToken, toToken, amount, walletPublicKey, 'ExactIn', false);
    console.log('Result:', result);
    process.exit(result && result.success ? 0 : 1);
  } catch (err) {
    console.error('Error during smoke test:', err);
    process.exit(1);
  }
}

run();
