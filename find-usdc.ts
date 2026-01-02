#!/usr/bin/env bun

(async () => {
  console.log('Finding the CORRECT USDC address...\n');
  
  // Known working tokens for reference
  const knownGood = {
    'bonk': 'DezXAZ8z7PnrnRJjz3wXBoQskzw1ia8dx5WhJAu1d8b8',
    'wsol': 'So11111111111111111111111111111111111111112',
  };
  
  // Possible USDC addresses
  const usdcCandidates = [
    'EPjFWaLb3hycctiLUXe9ak3G2wBiRAQsmDF93P15DBe', // Guessed fix
    'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX', // Placeholder
    'Bridge9QwwfBcX3W6vd9qYUyNZiEkKKYKUJE7xKdJ',     // Alternate format
  ];
  
  const apiKey = 'cd72422b-136c-4951-a00f-9fb904e14acf';
  
  // First test a known good token to verify endpoint works
  console.log('1. Testing known good token (BONK)...\n');
  let params = new URLSearchParams({
    inputMint: knownGood.bonk,
    outputMint: knownGood.wsol,
    amount: '1000000', // 1M BONK  
    slippageBps: '50',
  });
  
  let url = `https://api.jup.ag/swap/v1/quote?${params.toString()}`;
  let response = await fetch(url, { headers: {'X-API-KEY': apiKey} });
  let data = await response.json();
  
  console.log(`BONK → WSOL Status: ${response.status}`);
  if (response.ok) {
    console.log(`✅ Works! Output: ${data.outAmount / 1e9} SOL`);
  } else {
    console.log(`❌ Failed: ${data.message}`);
  }
  
  // Now try searching for USDC using token search
  console.log('\n2. Trying to find USDC via Jupiter token list...\n');
  
  try {
    const tokenList = await fetch('https://token.jup.ag/all');
    const tokens = await tokenList.json();
    
    const usdc = tokens.find((t: any) => t.symbol === 'USDC');
    
    if (usdc) {
      console.log(`✅ Found USDC in Jupiter list!`);
      console.log(`  Name: ${usdc.name}`);
      console.log(`  Address: ${usdc.address}`);
      console.log(`  Decimals: ${usdc.decimals}`);
      
      // Test with the correct address
      console.log(`\n3. Testing correct USDC address...\n`);
      
      params = new URLSearchParams({
        inputMint: usdc.address,
        outputMint: knownGood.wsol,
        amount: '9000000', // 9 USDC
        slippageBps: '50',
      });
      
      url = `https://api.jup.ag/swap/v1/quote?${params.toString()}`;
      response = await fetch(url, { headers: {'X-API-KEY': apiKey} });
      data = await response.json();
      
      console.log(`USDC → WSOL Status: ${response.status}`);
      if (response.ok) {
        console.log(`✅ Success! You get: ${(data.outAmount / 1e9).toFixed(4)} SOL for 9 USDC`);
        console.log(`\n✨ THE CORRECT USDC ADDRESS IS: ${usdc.address}`);
      } else {
        console.log(`❌ Failed: ${data.message || JSON.stringify(data)}`);
      }
    } else {
      console.log('❌ USDC not found in Jupiter token list');
    }
  } catch (err) {
    console.log(`❌ Error fetching token list: ${err.message}`);
  }
})();
