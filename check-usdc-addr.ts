#!/usr/bin/env bun

(async () => {
  console.log('Testing USDC addresses with Jupiter...\n');
  
  const addresses = [
    { name: 'Original (with I)', addr: 'EPjFWaLb3hycctiLUXe9ak3G2wBiRAQsmDF93PI5DBe' },
    { name: 'Corrected (with 1)', addr: 'EPjFWaLb3hycctiLUXe9ak3G2wBiRAQsmDF93P15DBe' },
  ];
  
  const apiKey = 'cd72422b-136c-4951-a00f-9fb904e14acf';
  
  for (const { name, addr } of addresses) {
    console.log(`\nTesting: ${name}`);
    console.log(`Address: ${addr}\n`);
    
    const params = new URLSearchParams({
      inputMint: addr,
      outputMint: 'So11111111111111111111111111111111111111112',
      amount: '9000000',
      slippageBps: '50',
    });
    
    const url = `https://api.jup.ag/swap/v1/quote?${params.toString()}`;
    
    try {
      const response = await fetch(url, {
        headers: {'X-API-KEY': apiKey}
      });
      
      const data = await response.json();
      console.log(`Status: ${response.status}`);
      
      if (response.ok) {
        console.log(`✅ Success! Output: ${data.outAmount / 1e9} SOL`);
      } else {
        console.log(`❌ Error: ${data.message || JSON.stringify(data)}`);
      }
    } catch (err) {
      console.log(`❌ Fetch error: ${err.message}`);
    }
  }
})();
