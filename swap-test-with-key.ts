#!/usr/bin/env bun
/**
 * Reverse Swap Test: USDC to SOL with API Key
 */

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(color: string, ...args: any[]) {
  console.log(`${color}`, ...args, `${colors.reset}`);
}

async function testJupiterWithAuth() {
  const apiKey = process.env.JUPITER_API_KEY || 'cd72422b-136c-4951-a00f-9fb904e14acf';
  const jupiterUrl = process.env.JUPITER_API_URL || 'https://api.jup.ag/swap/v1/quote';

  const USDC_MINT = 'EPjFWaLb3hycctiLUXe9ak3G2wBiRAQsmDF93P15DBe';
  const WSOL_MINT = 'So11111111111111111111111111111111111111112';
  
  log(colors.cyan + colors.bright, '\n🚀 Testing USDC → WSOL Swap with API Key\n');
  
  const params = new URLSearchParams({
    inputMint: USDC_MINT,
    outputMint: WSOL_MINT,
    amount: '9000000', // 9 USDC (9 * 10^6 decimals)
    slippageBps: '50',
    onlyDirectRoutes: 'false',
  });

  const url = `${jupiterUrl}?${params.toString()}`;
  
  log(colors.yellow, `📝 Request Details:`);
  console.log(`  URL: ${url}`);
  console.log(`  Input: USDC - ${USDC_MINT}`);
  console.log(`  Output: WSOL - ${WSOL_MINT}`);
  console.log(`  Amount: 9 USDC (9000000 in smallest units)`);
  console.log(`  API Key: ${apiKey.substring(0, 10)}...`);
  
  try {
    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    };
    
    if (apiKey) {
      headers['X-API-KEY'] = apiKey;
    }

    log(colors.cyan, `\n📡 Sending request...\n`);
    
    const response = await fetch(url, {
      method: 'GET',
      headers,
    });
    
    const data = await response.json();
    
    if (response.ok) {
      log(colors.green, `✅ Quote successful!\n`);
      console.log('📊 Swap Quote:');
      console.log(`  Input Amount: 9 USDC`);
      console.log(`  Output Amount: ${data.outAmount / 1e9} SOL`);
      console.log(`  In-Price: ${data.inPrice}`);
      console.log(`  Out-Price: ${data.outPrice}`);
      console.log(`  Route Count: ${data.routePlan?.length || 0}`);
      
      if (data.routePlan?.[0]) {
        console.log(`  Direct Route: ${data.routePlan[0].swapInfo?.label || 'N/A'}`);
      }
    } else {
      log(colors.red, `❌ Quote failed: ${response.status}\n`);
      console.log('Error:', JSON.stringify(data, null, 2));
    }
  } catch (err) {
    log(colors.red, `❌ Error:`, err instanceof Error ? err.message : String(err));
  }
}

testJupiterWithAuth();
