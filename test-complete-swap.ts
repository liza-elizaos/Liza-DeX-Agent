#!/usr/bin/env bun
/**
 * COMPLETE SWAP TEST - End to End
 * Test with official USDC address
 */

console.log(`
╔══════════════════════════════════════════════════════════════╗
║   🚀 COMPLETE SWAP TEST - End to End                         ║
╚══════════════════════════════════════════════════════════════╝
`);

// Official addresses from user
const OFFICIAL_USDC = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';
const WSOL = 'So11111111111111111111111111111111111111112';
const SOL_NATIVE = 'So11111111111111111111111111111111111111111';

const WALLET = 'CMVrzdso4SShQm2irrc7jMCN9Vw5QxXvrZKB79cYPPJT';
const RPC = 'https://solana-mainnet.g.alchemy.com/v2/pfiW_dJZBV0RjLHK1TgV53sMmLFTcCmX';
const JUPITER_KEY = 'cd72422b-136c-4951-a00f-9fb904e14acf';

async function getBalance() {
  console.log('\n📊 Step 1: Check Wallet Balance');
  console.log(`   Wallet: ${WALLET}`);
  console.log(`   RPC: ${RPC}\n`);
  
  try {
    const { Connection, PublicKey } = await import('@solana/web3.js');
    const connection = new Connection(RPC, 'confirmed');
    const pubKey = new PublicKey(WALLET);
    const balance = await connection.getBalance(pubKey);
    const solBalance = balance / 1e9;
    
    console.log(`   ✅ Balance: ${solBalance.toFixed(6)} SOL`);
    return solBalance;
  } catch (err) {
    console.log(`   ❌ Error: ${err.message}`);
    return 0;
  }
}

async function getQuote(inputMint, outputMint, amount, label) {
  console.log(`\n💱 Step: Get Quote - ${label}`);
  console.log(`   Input: ${inputMint}`);
  console.log(`   Output: ${outputMint}`);
  console.log(`   Amount: ${amount}`);
  
  const params = new URLSearchParams({
    inputMint,
    outputMint,
    amount: amount.toString(),
    slippageBps: '50',
    onlyDirectRoutes: 'false',
  });
  
  const url = `https://api.jup.ag/swap/v1/quote?${params.toString()}`;
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'x-api-key': JUPITER_KEY,
      }
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log(`   ✅ Quote Successful!`);
      console.log(`      In: ${data.inAmount}`);
      console.log(`      Out: ${data.outAmount}`);
      console.log(`      Route: ${data.routePlan?.[0]?.swapInfo?.label || 'N/A'}`);
      return data;
    } else {
      console.log(`   ❌ Quote Failed: ${data.error || data.message}`);
      return null;
    }
  } catch (err) {
    console.log(`   ❌ Error: ${err.message}`);
    return null;
  }
}

async function runTests() {
  // Test 1: Check balance
  const balance = await getBalance();
  
  if (balance < 0.002) {
    console.log('\n   ⚠️  Insufficient balance for tests');
    return;
  }
  
  // Test 2: SOL → USDC (using WSOL for quote)
  const quote1 = await getQuote(
    WSOL, 
    OFFICIAL_USDC, 
    '1000000', // 0.001 SOL
    'SOL → USDC'
  );
  
  // Test 3: USDC → SOL (reverse)
  const quote2 = await getQuote(
    OFFICIAL_USDC,
    WSOL,
    '9000000', // 9 USDC
    'USDC → SOL'
  );
  
  // Summary
  console.log(`
╔══════════════════════════════════════════════════════════════╗
║                        TEST SUMMARY                          ║
╚══════════════════════════════════════════════════════════════╝
`);
  
  if (quote1) {
    const usdcOut = Number(quote1.outAmount) / 1e6;
    console.log(`✅ TEST 1 - SOL → USDC:`);
    console.log(`   0.001 SOL = ${usdcOut.toFixed(6)} USDC`);
  } else {
    console.log(`❌ TEST 1 - SOL → USDC: FAILED`);
  }
  
  console.log();
  
  if (quote2) {
    const solOut = Number(quote2.outAmount) / 1e9;
    console.log(`✅ TEST 2 - USDC → SOL:`);
    console.log(`   9 USDC = ${solOut.toFixed(6)} SOL`);
  } else {
    console.log(`❌ TEST 2 - USDC → SOL: FAILED`);
  }
  
  console.log(`
╔══════════════════════════════════════════════════════════════╗
║                  OFFICIAL USDC ADDRESS                       ║
║                                                              ║
║  ${OFFICIAL_USDC}  ║
║                                                              ║
║  Status: ${(quote1 && quote2) ? '✅ VERIFIED & WORKING' : '❌ NEEDS FIX'}                                 ║
╚══════════════════════════════════════════════════════════════╝
`);
}

runTests();
