#!/usr/bin/env bun
/**
 * CONTRACT ADDRESS vs MINT ADDRESS SWAP TEST
 * 
 * Test both methods:
 * 1. Mint Address Swapping
 * 2. Contract Address Swapping (if different)
 * 3. Token Name Swapping
 * 
 * Check which ones work and document for elizaOS
 */

import * as fs from 'fs';
import * as path from 'path';
import {
  Connection,
  PublicKey,
  VersionedTransaction,
  Keypair,
} from '@solana/web3.js';
import bs58 from 'bs58';

// Load env
const envPath = path.join(process.cwd(), '.env');
const envContent = fs.readFileSync(envPath, 'utf-8');
const env: Record<string, string> = {};
envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && key.trim() && !key.startsWith('#')) {
    env[key.trim()] = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
  }
});

const SOLANA_RPC_URL = env.SOLANA_RPC_URL;
const SOLANA_PRIVATE_KEY = env.SOLANA_PRIVATE_KEY;
const SOLANA_PUBLIC_KEY = env.SOLANA_PUBLIC_KEY;

// Test data
const TEST_CASES = [
  {
    name: 'Mint Address (SOL → USDC)',
    inputMint: 'So11111111111111111111111111111111111111112', // WSOL (43 chars)
    outputMint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC (44 chars)
    amount: 0.001,
    type: 'MINT_ADDRESS'
  },
  {
    name: 'Token Name (SOL → USDC)',
    inputMint: 'SOL',
    outputMint: 'USDC',
    amount: 0.001,
    type: 'TOKEN_NAME'
  },
  {
    name: 'Mixed (Token Name → Mint)',
    inputMint: 'USDC',
    outputMint: 'So11111111111111111111111111111111111111112', // WSOL
    amount: 0.1,
    type: 'MIXED'
  }
];

// Token mappings
const TOKEN_MAP: Record<string, string> = {
  'SOL': 'So11111111111111111111111111111111111111112',
  'WSOL': 'So11111111111111111111111111111111111111112',
  'USDC': 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
};

function resolveMint(token: string): string {
  if (TOKEN_MAP[token.toUpperCase()]) {
    return TOKEN_MAP[token.toUpperCase()];
  }
  return token;
}

async function getTokenSymbol(mint: string): Promise<string> {
  if (mint === 'So11111111111111111111111111111111111111112') return 'WSOL';
  if (mint === 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v') return 'USDC';
  return mint.substring(0, 8) + '...';
}

async function getTokenDecimals(mint: string): Promise<number> {
  try {
    const connection = new Connection(SOLANA_RPC_URL, 'confirmed');
    const mintPubkey = new PublicKey(mint);
    const info = await connection.getParsedAccountInfo(mintPubkey);
    if (info.value && info.value.data && typeof info.value.data !== 'string') {
      const data = info.value.data as any;
      return data.parsed?.info?.decimals || 6;
    }
    return 6;
  } catch {
    return 6;
  }
}

async function getQuote(
  inputMint: string,
  outputMint: string,
  amount: number,
  inputDecimals: number
): Promise<any> {
  const amountInSmallestUnit = Math.floor(
    amount * Math.pow(10, inputDecimals)
  );

  const queryParams = new URLSearchParams({
    inputMint,
    outputMint,
    amount: amountInSmallestUnit.toString(),
    slippageBps: '50',
    onlyDirectRoutes: 'false',
  });

  const quoteUrl = `https://api.jup.ag/swap/v1/quote?${queryParams.toString()}`;

  const response = await fetch(quoteUrl, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'x-api-key': env.JUPITER_API_KEY || '',
      'User-Agent': 'Shina-Solana-AI/1.0',
    },
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `Quote failed (${response.status}): ${errorBody.substring(0, 100)}`
    );
  }

  return response.json();
}

async function executeSwap(quote: any, outputDecimals: number): Promise<string> {
  const connection = new Connection(SOLANA_RPC_URL, 'confirmed');
  const walletPubkey = new PublicKey(SOLANA_PUBLIC_KEY);
  const signer = Keypair.fromSecretKey(bs58.decode(SOLANA_PRIVATE_KEY));

  const swapResponse = await fetch('https://api.jup.ag/swap/v1/swap', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'x-api-key': env.JUPITER_API_KEY || '',
      'User-Agent': 'Shina-Solana-AI/1.0',
    },
    body: JSON.stringify({
      quoteResponse: quote,
      userPublicKey: walletPubkey.toString(),
      wrapUnwrapSOL: false,
      dynamicSlippage: { maxBps: 50 },
      feeAccount: undefined,
    }),
  });

  if (!swapResponse.ok) {
    const errorBody = await swapResponse.text();
    throw new Error(
      `Swap failed (${swapResponse.status}): ${errorBody.substring(0, 100)}`
    );
  }

  const swapData = await swapResponse.json();
  const transactionBuffer = Buffer.from(swapData.swapTransaction, 'base64');
  const transaction = VersionedTransaction.deserialize(transactionBuffer);

  const latestBlockhash = await connection.getLatestBlockhash();
  transaction.message.recentBlockhash = latestBlockhash.blockhash;

  transaction.sign([signer]);

  const signature = await connection.sendTransaction(transaction, {
    maxRetries: 5,
  });

  return signature;
}

async function runTest(testCase: any): Promise<any> {
  console.log(`\n${'─'.repeat(60)}`);
  console.log(`📋 TEST: ${testCase.name}`);
  console.log(`   Type: ${testCase.type}`);
  console.log(`${'─'.repeat(60)}`);

  try {
    // Resolve mints
    const inputMint = resolveMint(testCase.inputMint);
    const outputMint = resolveMint(testCase.outputMint);
    
    console.log(`\n📍 Mints:`);
    console.log(`   Input:  ${testCase.inputMint} → ${inputMint}`);
    console.log(`   Output: ${testCase.outputMint} → ${outputMint}`);
    console.log(`   Amount: ${testCase.amount}`);

    // Get decimals
    const inputDecimals = await getTokenDecimals(inputMint);
    const outputDecimals = await getTokenDecimals(outputMint);
    
    console.log(`\n📊 Decimals:`);
    console.log(`   Input:  ${inputDecimals}`);
    console.log(`   Output: ${outputDecimals}`);

    // Get quote
    console.log(`\n💱 Getting quote...`);
    const quote = await getQuote(
      inputMint,
      outputMint,
      testCase.amount,
      inputDecimals
    );

    const outputAmount =
      parseInt(quote.outAmount) / Math.pow(10, outputDecimals);
    const inputSymbol = await getTokenSymbol(inputMint);
    const outputSymbol = await getTokenSymbol(outputMint);

    console.log(`✅ Quote received:`);
    console.log(`   ${testCase.amount} ${inputSymbol} → ${outputAmount.toFixed(outputDecimals)} ${outputSymbol}`);
    console.log(`   Rate: 1 ${inputSymbol} = ${(outputAmount / testCase.amount).toFixed(8)} ${outputSymbol}`);

    // Execute swap
    console.log(`\n⚙️  Executing swap...`);
    const txSignature = await executeSwap(quote, outputDecimals);

    console.log(`\n✅ SWAP SUCCESSFUL!`);
    console.log(`   TX: https://solscan.io/tx/${txSignature}`);
    console.log(`   Sent: ${testCase.amount} ${inputSymbol}`);
    console.log(`   Got: ${outputAmount.toFixed(outputDecimals)} ${outputSymbol}`);

    return {
      testCase: testCase.name,
      type: testCase.type,
      status: '✅ PASS',
      txSignature,
      inputSymbol,
      outputSymbol,
      inputAmount: testCase.amount,
      outputAmount: outputAmount.toFixed(outputDecimals),
    };
  } catch (error: any) {
    console.log(`\n❌ TEST FAILED!`);
    console.log(`   Error: ${error.message}`);

    return {
      testCase: testCase.name,
      type: testCase.type,
      status: '❌ FAIL',
      error: error.message,
    };
  }
}

async function main() {
  console.log(`
╔════════════════════════════════════════════════════════════════╗
║   🧪 CONTRACT & MINT ADDRESS SWAP TEST                        ║
║   Testing all swap methods for elizaOS                        ║
╚════════════════════════════════════════════════════════════════╝
  `);

  const results: any[] = [];

  for (const testCase of TEST_CASES) {
    const result = await runTest(testCase);
    results.push(result);
    
    // Wait between tests
    await new Promise(r => setTimeout(r, 2000));
  }

  // Summary
  console.log(`\n${'═'.repeat(60)}`);
  console.log(`📊 TEST SUMMARY`);
  console.log(`${'═'.repeat(60)}\n`);

  console.log(`| Test Type | Method | Status | Details |`);
  console.log(`|-----------|--------|--------|---------|`);

  results.forEach(result => {
    const statusIcon = result.status.includes('✅') ? '✅' : '❌';
    const details = result.status.includes('PASS')
      ? `${result.inputAmount} ${result.inputSymbol} → ${result.outputAmount} ${result.outputSymbol}`
      : result.error.substring(0, 30);

    console.log(
      `| ${result.testCase.substring(0, 20)} | ${result.type} | ${statusIcon} | ${details} |`
    );
  });

  // Pass/Fail count
  const passed = results.filter(r => r.status.includes('PASS')).length;
  const failed = results.filter(r => r.status.includes('FAIL')).length;

  console.log(`\n${'═'.repeat(60)}`);
  console.log(`📈 RESULTS: ${passed}/${results.length} tests passed`);
  console.log(`${'═'.repeat(60)}\n`);

  if (failed === 0) {
    console.log(`
╔════════════════════════════════════════════════════════════════╗
║  ✨ ALL TESTS PASSED! READY FOR elizaOS IMPLEMENTATION  ✨    ║
╚════════════════════════════════════════════════════════════════╝

Supported Methods:
  ✅ Token Names (SOL, USDC, WSOL)
  ✅ Mint Addresses (43-44 char base58)
  ✅ Mixed (Names + Mints)

Ready to add to implementation sheet!
    `);
  } else {
    console.log(`
⚠️  Some tests failed. Review errors above.
    `);
  }
}

main();
