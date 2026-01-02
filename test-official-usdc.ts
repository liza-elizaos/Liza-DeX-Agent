#!/usr/bin/env bun
/**
 * Test USDC to SOL swap with CORRECT USDC address
 */

(async () => {
  console.log('🚀 Testing USDC → SOL swap with official USDC address\n');
  
  const USDC_MINT = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'; // Official
  const WSOL_MINT = 'So11111111111111111111111111111111111111112';
  const apiKey = process.env.JUPITER_API_KEY || 'cd72422b-136c-4951-a00f-9fb904e14acf';
  
  const params = new URLSearchParams({
    inputMint: USDC_MINT,
    outputMint: WSOL_MINT,
    amount: '9000000', // 9 USDC (9 * 10^6 decimals)
    slippageBps: '50',
    onlyDirectRoutes: 'false',
  });
  
  const url = `https://api.jup.ag/swap/v1/quote?${params.toString()}`;
  
  console.log('📝 Request:');
  console.log(`  Input: 9 USDC (${USDC_MINT})`);
  console.log(`  Output: WSOL (${WSOL_MINT})`);
  console.log(`  API URL: ${url.substring(0, 80)}...`);
  
  try {
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'x-api-key': apiKey,
      }
    });
    
    const data = await response.json();
    
    console.log(`\n📊 Response Status: ${response.status}\n`);
    
    if (response.ok) {
      const solAmount = data.outAmount / 1e9;
      console.log('✅ SWAP SUCCESSFUL!');
      console.log(`\n   Input: 9 USDC`);
      console.log(`   Output: ${solAmount.toFixed(6)} SOL`);
      console.log(`   Price: 1 USDC = ${(solAmount / 9).toFixed(6)} SOL`);
      console.log(`\n   Route: ${data.routePlan?.length || 1} hop(s)`);
      
      if (data.routePlan?.[0]) {
        const route = data.routePlan[0];
        console.log(`   Primary Route: ${route.swapInfo?.label || 'Unknown'}`);
      }
    } else {
      console.log('❌ SWAP FAILED!');
      console.log(`\nError: ${data.error || data.message || JSON.stringify(data)}`);
    }
  } catch (err) {
    console.log(`❌ Network Error: ${err.message}`);
  }
})();
