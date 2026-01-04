#!/usr/bin/env node

/**
 * Test Script: Find Working Free Solana RPCs
 * Purpose: Test multiple free RPC endpoints to find working ones
 * Usage: node find-working-rpc.mjs
 */

import { Connection, PublicKey } from '@solana/web3.js';

// Multiple free RPC endpoints to test
const FREE_RPCS = [
  'https://api.mainnet-beta.solana.com',
  'https://solana-api.projectserum.com',
  'https://rpc.ankr.com/solana',
  'https://api.rpcpool.com',
  'https://public1.genesysgo.com',
  'https://rpc-mainnet.phantom.app',
  'https://api.metaplex.solana.com'
];

const TEST_WALLET = 'DScqtGwFoDTme2Rzdjpdb2w7CtuKc6Z8KF7hMhbx8ugQ';

// Color codes
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m'
};

const rpcResults = [];

async function testRPC(rpcUrl) {
  console.log(`\n${colors.cyan}═══════════════════════════════════════════════════${colors.reset}`);
  console.log(`Testing RPC: ${rpcUrl}`);
  console.log(`${colors.cyan}═══════════════════════════════════════════════════${colors.reset}`);

  const result = {
    rpc: rpcUrl,
    tests: {}
  };

  // Test 1: Connection
  process.stdout.write(`⏳ Connection... `);
  try {
    const connection = new Connection(rpcUrl, 'confirmed');
    const version = await Promise.race([
      connection.getVersion(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))
    ]);
    console.log(`${colors.green}✓ PASS${colors.reset} (v${version['solana-core']})`);
    result.tests.connection = { status: 'PASS', version: version['solana-core'] };
  } catch (error) {
    console.log(`${colors.red}✗ FAIL${colors.reset} (${error.message})`);
    result.tests.connection = { status: 'FAIL', error: error.message };
    rpcResults.push(result);
    return; // Skip other tests if connection fails
  }

  // Test 2: Get Balance
  process.stdout.write(`⏳ Balance... `);
  try {
    const connection = new Connection(rpcUrl, 'confirmed');
    const pubkey = new PublicKey(TEST_WALLET);
    const startTime = Date.now();
    const balance = await Promise.race([
      connection.getBalance(pubkey),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))
    ]);
    const time = Date.now() - startTime;
    const solBalance = balance / 1e9;
    console.log(`${colors.green}✓ PASS${colors.reset} (${solBalance.toFixed(6)} SOL, ${time}ms)`);
    result.tests.balance = { status: 'PASS', solBalance, time };
  } catch (error) {
    console.log(`${colors.red}✗ FAIL${colors.reset} (${error.message})`);
    result.tests.balance = { status: 'FAIL', error: error.message };
  }

  // Test 3: Fetch Signatures
  process.stdout.write(`⏳ Fetch Transactions... `);
  try {
    const connection = new Connection(rpcUrl, 'confirmed');
    const pubkey = new PublicKey(TEST_WALLET);
    const startTime = Date.now();
    const signatures = await Promise.race([
      connection.getSignaturesForAddress(pubkey, { limit: 100 }),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 10000))
    ]);
    const time = Date.now() - startTime;
    console.log(`${colors.green}✓ PASS${colors.reset} (${signatures.length} txs, ${time}ms)`);
    result.tests.signatures = { status: 'PASS', count: signatures.length, time };
  } catch (error) {
    console.log(`${colors.red}✗ FAIL${colors.reset} (${error.message})`);
    result.tests.signatures = { status: 'FAIL', error: error.message };
  }

  // Test 4: Parse Transaction
  process.stdout.write(`⏳ Parse Transactions... `);
  try {
    const connection = new Connection(rpcUrl, 'confirmed');
    const pubkey = new PublicKey(TEST_WALLET);
    const signatures = await Promise.race([
      connection.getSignaturesForAddress(pubkey, { limit: 50 }),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 10000))
    ]);

    if (signatures.length === 0) {
      console.log(`${colors.yellow}⚠ WARN${colors.reset} (No transactions)`);
      result.tests.parse = { status: 'WARN', message: 'No transactions' };
    } else {
      let parsed = 0;
      const startTime = Date.now();
      
      for (let i = 0; i < Math.min(signatures.length, 10); i++) {
        try {
          await Promise.race([
            connection.getTransaction(signatures[i].signature),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 3000))
          ]);
          parsed++;
        } catch (e) {
          // Skip
        }
      }
      
      const time = Date.now() - startTime;
      const successRate = (parsed / 10) * 100;
      const statusColor = successRate >= 80 ? colors.green : successRate >= 50 ? colors.yellow : colors.red;
      console.log(`${statusColor}✓ PASS${colors.reset} (${parsed}/10 parsed, ${time}ms)`);
      result.tests.parse = { status: 'PASS', parsed, time, rate: `${successRate}%` };
    }
  } catch (error) {
    console.log(`${colors.red}✗ FAIL${colors.reset} (${error.message})`);
    result.tests.parse = { status: 'FAIL', error: error.message };
  }

  // Test 5: Rate Limiting
  process.stdout.write(`⏳ Rate Limiting... `);
  try {
    const connection = new Connection(rpcUrl, 'confirmed');
    const pubkey = new PublicKey(TEST_WALLET);
    let success = 0;
    const startTime = Date.now();

    for (let i = 0; i < 5; i++) {
      try {
        await Promise.race([
          connection.getBalance(pubkey),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 2000))
        ]);
        success++;
      } catch (e) {
        // Count as failure
      }
    }

    const time = Date.now() - startTime;
    const statusColor = success >= 4 ? colors.green : success >= 3 ? colors.yellow : colors.red;
    console.log(`${statusColor}${success}/5${colors.reset} (${time}ms)`);
    result.tests.rateLimit = { status: success >= 4 ? 'PASS' : 'WARN', success, time };
  } catch (error) {
    console.log(`${colors.red}✗ FAIL${colors.reset} (${error.message})`);
    result.tests.rateLimit = { status: 'FAIL', error: error.message };
  }

  rpcResults.push(result);
}

async function runAllTests() {
  console.log(`${colors.cyan}╔════════════════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.cyan}║     FREE SOLANA RPC COMPARISON TEST                 ║${colors.reset}`);
  console.log(`${colors.cyan}╚════════════════════════════════════════════════════╝${colors.reset}`);

  for (const rpc of FREE_RPCS) {
    await testRPC(rpc);
  }

  // Summary
  console.log(`\n${colors.cyan}╔════════════════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.cyan}║              SUMMARY & RECOMMENDATIONS              ║${colors.reset}`);
  console.log(`${colors.cyan}╚════════════════════════════════════════════════════╝${colors.reset}\n`);

  // Sort by number of passing tests
  rpcResults.sort((a, b) => {
    const aPass = Object.values(a.tests).filter(t => t.status === 'PASS').length;
    const bPass = Object.values(b.tests).filter(t => t.status === 'PASS').length;
    return bPass - aPass;
  });

  console.log(`${colors.cyan}RANKING (by passing tests):${colors.reset}\n`);

  rpcResults.forEach((result, index) => {
    const passed = Object.values(result.tests).filter(t => t.status === 'PASS').length;
    const failed = Object.values(result.tests).filter(t => t.status === 'FAIL').length;
    const warned = Object.values(result.tests).filter(t => t.status === 'WARN').length;
    
    const rankColor = index === 0 ? colors.green : index === 1 ? colors.yellow : colors.red;
    console.log(`${rankColor}#${index + 1}${colors.reset} ${result.rpc}`);
    console.log(`    ✓ Pass: ${passed}  ⚠ Warn: ${warned}  ✗ Fail: ${failed}`);
    
    // Show test details
    Object.entries(result.tests).forEach(([testName, testResult]) => {
      const statusIcon = testResult.status === 'PASS' ? '✓' : testResult.status === 'WARN' ? '⚠' : '✗';
      const statusColor = testResult.status === 'PASS' ? colors.green : testResult.status === 'WARN' ? colors.yellow : colors.red;
      console.log(`      ${statusColor}${statusIcon}${colors.reset} ${testName}: ${testResult.status}`);
    });
    console.log();
  });

  // Recommendation
  console.log(`${colors.cyan}RECOMMENDATION:${colors.reset}\n`);
  
  if (rpcResults.length > 0) {
    const bestRpc = rpcResults[0];
    const bestPassed = Object.values(bestRpc.tests).filter(t => t.status === 'PASS').length;
    
    if (bestPassed >= 4) {
      console.log(`${colors.green}✓ RECOMMENDED RPC:${colors.reset}`);
      console.log(`  ${bestRpc.rpc}`);
      console.log(`\n  Update .env:`);
      console.log(`  SOLANA_RPC_URL=${bestRpc.rpc}`);
    } else {
      console.log(`${colors.yellow}⚠ ALL RPCS PARTIALLY WORKING${colors.reset}`);
      console.log(`  Best option: ${bestRpc.rpc}`);
      console.log(`  Or use paid RPC (Alchemy/Helius) for production`);
    }
  }

  console.log(`\n${colors.cyan}═══════════════════════════════════════════════════${colors.reset}\n`);
}

// Run tests
runAllTests().catch(err => {
  console.error(`${colors.red}Error: ${err.message}${colors.reset}`);
  process.exit(1);
});
