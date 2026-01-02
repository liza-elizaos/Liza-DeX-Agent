#!/usr/bin/env bun
/**
 * DIRECT JUPITER QUOTE TEST - Exact simulation of swap.ts flow
 * This directly tests what the server will do
 */

console.log(`
╔════════════════════════════════════════════════════════════════╗
║   🔧 DIRECT JUPITER TEST - Simulating swap.ts → server flow   ║
╚════════════════════════════════════════════════════════════════╝
`);

// Import same utilities as swap-utils.ts
import { Connection, PublicKey } from '@solana/web3.js';

const WALLET = 'CMVrzdso4SShQm2irrc7jMCN9Vw5QxXvrZKB79cYPPJT';
const RPC = 'https://solana-mainnet.g.alchemy.com/v2/pfiW_dJZBV0RjLHK1TgV53sMmLFTcCmX';
const JUPITER_KEY = 'cd72422b-136c-4951-a00f-9fb904e14acf';

// Same token map as swap-utils.ts
const KNOWN_TOKENS: Record<string, string> = {
  'sol': 'So11111111111111111111111111111111111111111',   // Native SOL (43 chars)
  'usdc': 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',  // USDC (Official)
  'wsol': 'So11111111111111111111111111111111111111112',   // Wrapped SOL (44 chars)
  'usdt': 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BEnNYb',
  'bonk': 'DezXAZ8z7PnrnRJjz3wXBoQskzw1ia8dx5WhJAu1d8b8',
};

const TOKEN_DECIMALS: Record<string, number> = {
  'sol': 9,
  'wsol': 9,
  'usdc': 6,
  'usdt': 6,
  'bonk': 5,
};

function resolveTokenAddress(token: string): string {
  const lower = token.toLowerCase().trim();
  return KNOWN_TOKENS[lower] || token;
}

function getTokenDecimals(token: string): number {
  const lower = token.toLowerCase().trim();
  return TOKEN_DECIMALS[lower] || 6;
}

async function testSwapFlow() {
  console.log('\n📝 TEST SETUP:');
  console.log(`   User message: "swap 0.001 SOL for USDC"`);
  console.log(`   Wallet: ${WALLET}`);
  
  // Step 1: Parse message (simulating chat.ts)
  console.log('\n📍 STEP 1: Parse Message (chat.ts)');
  const message = 'swap 0.001 SOL for USDC';
  const swapMatch = message.match(/swap\s+(?:([\d.]+)\s+)?(\w+)\s+(?:to|for)\s+(\w+)/i);
  
  if (!swapMatch) {
    console.log('❌ Failed to parse swap');
    return;
  }
  
  const amount = parseFloat(swapMatch[1]);
  const fromToken = swapMatch[2].toUpperCase();
  const toToken = swapMatch[3].toUpperCase();
  
  console.log(`   ✅ Parsed: ${amount} ${fromToken} → ${toToken}`);
  
  // Step 2: Resolve tokens (simulating swap-utils.ts)
  console.log('\n📍 STEP 2: Resolve Token Addresses (swap-utils.ts)');
  
  let inputMint = resolveTokenAddress(fromToken);
  let outputMint = resolveTokenAddress(toToken);
  
  console.log(`   From "${fromToken}" → "${inputMint}"`);
  console.log(`   To "${toToken}" → "${outputMint}"`);
  
  // Step 3: Convert amount to smallest units
  console.log('\n📍 STEP 3: Convert Amount');
  
  const fromDecimals = getTokenDecimals(fromToken);
  const amountInSmallestUnits = Math.floor(amount * Math.pow(10, fromDecimals));
  
  console.log(`   ${amount} ${fromToken} with ${fromDecimals} decimals`);
  console.log(`   = ${amountInSmallestUnits} smallest units`);
  
  // Step 4: Check if native SOL and convert
  console.log('\n📍 STEP 4: Native SOL Check');
  
  const NATIVE_SOL = 'So11111111111111111111111111111111111111111';
  const WSOL_MINT = 'So11111111111111111111111111111111111111112';
  const isInputNativeSol = inputMint === NATIVE_SOL;
  
  console.log(`   Input mint: ${inputMint}`);
  console.log(`   Is native SOL: ${isInputNativeSol}`);
  
  if (isInputNativeSol) {
    console.log(`   ⚠️  Converting native SOL to WSOL for Jupiter quote`);
    inputMint = WSOL_MINT;
    console.log(`   ✅ Using WSOL: ${inputMint}`);
  }
  
  // Step 5: Build Jupiter query
  console.log('\n📍 STEP 5: Build Jupiter Query');
  
  const params = new URLSearchParams({
    inputMint: inputMint,
    outputMint: outputMint,
    amount: amountInSmallestUnits.toString(),
    slippageBps: '50',
    onlyDirectRoutes: 'false',
  });
  
  if (isInputNativeSol) {
    params.append('wrapAndUnwrapSol', 'true');
  }
  
  const url = `https://api.jup.ag/swap/v1/quote?${params.toString()}`;
  console.log(`   Input Mint: ${inputMint}`);
  console.log(`   Output Mint: ${outputMint}`);
  console.log(`   Amount: ${amountInSmallestUnits}`);
  console.log(`   URL (first 100 chars): ${url.substring(0, 100)}...`);
  
  // Step 6: Call Jupiter API
  console.log('\n📍 STEP 6: Call Jupiter API');
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'x-api-key': JUPITER_KEY,
      }
    });
    
    console.log(`   Status: ${response.status}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log(`   ✅ Quote successful!`);
      console.log(`   Input: ${data.inAmount}`);
      console.log(`   Output: ${data.outAmount}`);
      
      const usdcOut = Number(data.outAmount) / 1e6;
      console.log(`   ${amount} SOL → ${usdcOut.toFixed(6)} USDC`);
      console.log(`   Route: ${data.routePlan?.[0]?.swapInfo?.label}`);
      
      console.log(`\n✅ COMPLETE FLOW SUCCESSFUL!`);
      return true;
    } else {
      const error = await response.text();
      console.log(`   ❌ Error: ${error}`);
      return false;
    }
  } catch (err) {
    console.log(`   ❌ Fetch error: ${err.message}`);
    return false;
  }
}

testSwapFlow().then(success => {
  if (!success) {
    console.log('\n❌ TEST FAILED');
    process.exit(1);
  }
});
