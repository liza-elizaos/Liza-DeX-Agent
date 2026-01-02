#!/usr/bin/env bun
/**
 * Reverse Swap Test: USDC to SOL
 * This tests swapping USDC (from wallet) to SOL
 * Goal: Understand the reverse flow and fix any issues
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

// Test different USDC addresses to find the correct one
const usdcCandidates = [
  { name: 'Original (with I)', addr: 'EPjFWaLb3hycctiLUXe9ak3G2wBiRAQsmDF93PI5DBe' },
  { name: 'With 1', addr: 'EPjFWaLb3hycctiLUXe9ak3G2wBiRAQsmDF93P15DBe' },
  { name: 'With l', addr: 'EPjFWaLb3hycctiLUXe9ak3G2wBiRAQsmDF93Pl5DBe' },
];

const base58 = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

log(colors.bright + colors.cyan, '\n🔍 Testing USDC Address Candidates\n');

for (const candidate of usdcCandidates) {
  const isValid = [...candidate.addr].every((c) => base58.includes(c));
  const length = candidate.addr.length;
  const status = isValid && (length === 43 || length === 44) ? '✅' : '❌';
  
  console.log(`${status} ${candidate.name}: ${candidate.addr}`);
  console.log(`   Length: ${length}, Valid chars: ${isValid}`);
  
  if (!isValid) {
    const invalid = [...candidate.addr].filter((c) => !base58.includes(c));
    console.log(`   Invalid chars: ${invalid.join(', ')}`);
  }
  console.log();
}

log(colors.cyan, '\n💡 Testing Direct Jupiter API Call (no auth needed)\n');

async function testJupiterAPI(inputMint: string, outputMint: string, amount: number) {
  const params = new URLSearchParams({
    inputMint,
    outputMint,
    amount: Math.floor(amount * 1e6).toString(), // USDC has 6 decimals
    slippageBps: '50',
    onlyDirectRoutes: 'false',
  });

  const url = `https://api.jup.ag/swap/v1/quote?${params.toString()}`;
  
  log(colors.yellow, `Testing: ${inputMint} → ${outputMint}`);
  console.log(`URL: ${url}`);
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    });
    
    if (response.ok) {
      const data = await response.json();
      log(colors.green, `✅ Quote successful!`);
      console.log('  Input:', data.inputMint);
      console.log('  Output:', data.outputMint);
      console.log('  Quote Route:', JSON.stringify(data.routePlan?.[0], null, 2));
    } else {
      const error = await response.text();
      log(colors.red, `❌ Quote failed: ${response.status}`);
      console.log('  Response:', error);
    }
  } catch (err) {
    log(colors.red, `❌ Error:`, err instanceof Error ? err.message : String(err));
  }
}

// Known working addresses
const SOL_MINT = 'So11111111111111111111111111111111111111111';
const WSOL_MINT = 'So11111111111111111111111111111111111111112';
const USDC_MINT = 'EPjFWaLb3hycctiLUXe9ak3G2wBiRAQsmDF93P15DBe'; // Try this one (1 instead of I)

(async () => {
  // Test 1: USDC -> WSOL
  await testJupiterAPI(USDC_MINT, WSOL_MINT, 0.009);
  
  console.log('\n' + '='.repeat(60) + '\n');
  
  // Test 2: Try with different address
  await testJupiterAPI('EPjFWaLb3hycctiLUXe9ak3G2wBiRAQsmDF93PI5DBe', WSOL_MINT, 0.009);
})();
