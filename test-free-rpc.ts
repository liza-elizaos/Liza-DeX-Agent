#!/usr/bin/env ts-node

/**
 * Test Script: Free Solana RPC Performance
 * Purpose: Check if https://api.mainnet-beta.solana.com works reliably
 * Usage: ts-node test-free-rpc.ts [wallet_address]
 * 
 * Tests:
 * 1. Connection stability
 * 2. Transaction fetching
 * 3. Token launch detection
 * 4. Rate limiting
 * 5. Response times
 */

import { Connection, PublicKey } from '@solana/web3.js';

// Test Configuration
const FREE_RPC = 'https://api.mainnet-beta.solana.com';
const TEST_WALLET = 'DScqtGwFoDTme2Rzdjpdb2w7CtuKc6Z8KF7hMhbx8ugQ';

// Color codes for output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

interface TestResult {
  name: string;
  status: 'PASS' | 'FAIL' | 'WARN';
  time: number;
  message: string;
  details?: any;
}

const results: TestResult[] = [];

async function logTest(name: string, fn: () => Promise<{ status: 'PASS' | 'FAIL' | 'WARN', message: string, details?: any }>) {
  process.stdout.write(`\n⏳ Testing: ${name}... `);
  const startTime = Date.now();
  
  try {
    const result = await fn();
    const time = Date.now() - startTime;
    process.stdout.write('\r');
    
    const statusColor = {
      'PASS': colors.green,
      'FAIL': colors.red,
      'WARN': colors.yellow
    }[result.status];
    
    console.log(`${statusColor}${result.status}${colors.reset} (${time}ms)`);
    console.log(`   └─ ${result.message}`);
    if (result.details) {
      console.log(`   └─ Details: ${JSON.stringify(result.details)}`);
    }
    
    results.push({
      name,
      status: result.status,
      time,
      message: result.message,
      details: result.details
    });
  } catch (error: any) {
    const time = Date.now() - startTime;
    console.log(`${colors.red}ERROR${colors.reset} (${time}ms)`);
    console.log(`   └─ ${error.message}`);
    
    results.push({
      name,
      status: 'FAIL',
      time,
      message: error.message
    });
  }
}

async function runTests() {
  console.log(`${colors.cyan}═══════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.cyan}  FREE SOLANA RPC TEST: ${FREE_RPC}${colors.reset}`);
  console.log(`${colors.cyan}═══════════════════════════════════════════════════${colors.reset}`);

  // Test 1: Connection
  await logTest('Basic Connection', async () => {
    const connection = new Connection(FREE_RPC, {
      commitment: 'confirmed',
      maxSupportedTransactionVersion: 0
    });
    
    const version = await connection.getVersion();
    return {
      status: 'PASS',
      message: `Connected to Solana v${version['solana-core']}`,
      details: version
    };
  });

  // Test 2: Get Balance
  await logTest('Get Wallet Balance', async () => {
    const connection = new Connection(FREE_RPC, {
      commitment: 'confirmed',
      maxSupportedTransactionVersion: 0
    });
    
    const pubkey = new PublicKey(TEST_WALLET);
    const balance = await connection.getBalance(pubkey);
    const solBalance = balance / 1e9;
    
    return {
      status: solBalance > 0 ? 'PASS' : 'WARN',
      message: `Wallet balance: ${solBalance.toFixed(6)} SOL`,
      details: { balance, solBalance }
    };
  });

  // Test 3: Fetch Signatures (Transactions)
  await logTest('Fetch Transaction History (500 signatures)', async () => {
    const connection = new Connection(FREE_RPC, {
      commitment: 'confirmed',
      maxSupportedTransactionVersion: 0
    });
    
    const pubkey = new PublicKey(TEST_WALLET);
    const startTime = Date.now();
    const signatures = await connection.getSignaturesForAddress(pubkey, {
      limit: 500
    });
    const fetchTime = Date.now() - startTime;
    
    if (signatures.length === 0) {
      return {
        status: 'WARN',
        message: `No transactions found (wallet may be new)`,
        details: { count: 0, fetchTime }
      };
    }
    
    return {
      status: 'PASS',
      message: `Fetched ${signatures.length} signatures`,
      details: { count: signatures.length, fetchTime }
    };
  });

  // Test 4: Parse Transactions
  await logTest('Parse 50 Transactions', async () => {
    const connection = new Connection(FREE_RPC, {
      commitment: 'confirmed',
      maxSupportedTransactionVersion: 0
    });
    
    const pubkey = new PublicKey(TEST_WALLET);
    const signatures = await connection.getSignaturesForAddress(pubkey, {
      limit: 500
    });
    
    if (signatures.length === 0) {
      return {
        status: 'WARN',
        message: 'No transactions to parse',
        details: { parsed: 0 }
      };
    }
    
    let parsed = 0;
    let failed = 0;
    let tokenLaunches = 0;
    const startTime = Date.now();
    
    for (let i = 0; i < Math.min(signatures.length, 50); i++) {
      try {
        const tx = await connection.getTransaction(signatures[i].signature, {
          maxSupportedTransactionVersion: 0
        });
        
        if (tx) {
          parsed++;
          
          // Check for token launches
          const hasInitializeMint = tx.transaction.message.instructions.some((instr: any) => {
            if (instr.parsed?.type === 'initializeMint') return true;
            const instrStr = JSON.stringify(instr).toLowerCase();
            return instrStr.includes('initializemint');
          });
          
          if (hasInitializeMint) {
            tokenLaunches++;
          }
        }
      } catch (err) {
        failed++;
      }
    }
    
    const parseTime = Date.now() - startTime;
    const success = (parsed / 50) * 100;
    
    return {
      status: success >= 80 ? 'PASS' : success >= 50 ? 'WARN' : 'FAIL',
      message: `Parsed ${parsed}/50 transactions (${tokenLaunches} token launches found)`,
      details: { parsed, failed, tokenLaunches, success: `${success.toFixed(1)}%`, parseTime }
    };
  });

  // Test 5: Rate Limiting Test
  await logTest('Rate Limiting Check (10 rapid requests)', async () => {
    const connection = new Connection(FREE_RPC, {
      commitment: 'confirmed',
      maxSupportedTransactionVersion: 0
    });
    
    const pubkey = new PublicKey(TEST_WALLET);
    let success = 0;
    let failed = 0;
    const startTime = Date.now();
    
    for (let i = 0; i < 10; i++) {
      try {
        await connection.getBalance(pubkey);
        success++;
      } catch (err) {
        failed++;
      }
    }
    
    const totalTime = Date.now() - startTime;
    
    if (failed === 0) {
      return {
        status: 'PASS',
        message: `All 10 requests succeeded (no rate limiting detected)`,
        details: { success, failed, totalTime }
      };
    } else if (failed < 3) {
      return {
        status: 'WARN',
        message: `${failed}/10 requests rate limited (may be acceptable)`,
        details: { success, failed, totalTime }
      };
    } else {
      return {
        status: 'FAIL',
        message: `${failed}/10 requests rate limited (too aggressive)`,
        details: { success, failed, totalTime }
      };
    }
  });

  // Test 6: Account Age Calculation
  await logTest('Account Age Calculation', async () => {
    const connection = new Connection(FREE_RPC, {
      commitment: 'confirmed',
      maxSupportedTransactionVersion: 0
    });
    
    const pubkey = new PublicKey(TEST_WALLET);
    const signatures = await connection.getSignaturesForAddress(pubkey, {
      limit: 500
    });
    
    if (signatures.length === 0) {
      return {
        status: 'WARN',
        message: 'No transactions to calculate age',
        details: {}
      };
    }
    
    const oldestSig = signatures[signatures.length - 1];
    const oldestTime = (oldestSig.blockTime || 0) * 1000;
    const accountAgeMs = Date.now() - oldestTime;
    const accountAgeDays = Math.floor(accountAgeMs / (1000 * 60 * 60 * 24));
    
    const newestSig = signatures[0];
    const lastActivityTime = new Date((newestSig.blockTime || 0) * 1000);
    
    return {
      status: 'PASS',
      message: `Account age: ${accountAgeDays} days, Last activity: ${lastActivityTime.toLocaleDateString()}`,
      details: { accountAgeDays, lastActivity: lastActivityTime.toISOString() }
    };
  });

  // Summary
  console.log(`\n${colors.cyan}═══════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.cyan}TEST SUMMARY${colors.reset}`);
  console.log(`${colors.cyan}═══════════════════════════════════════════════════${colors.reset}\n`);
  
  const passed = results.filter(r => r.status === 'PASS').length;
  const warned = results.filter(r => r.status === 'WARN').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  
  console.log(`${colors.green}✓ Passed: ${passed}${colors.reset}`);
  console.log(`${colors.yellow}⚠ Warned: ${warned}${colors.reset}`);
  console.log(`${colors.red}✗ Failed: ${failed}${colors.reset}`);
  
  const totalTime = results.reduce((sum, r) => sum + r.time, 0);
  console.log(`\nTotal time: ${totalTime}ms`);
  
  // Recommendation
  console.log(`\n${colors.cyan}RECOMMENDATION:${colors.reset}`);
  
  if (failed === 0 && warned <= 1) {
    console.log(`${colors.green}✓ FREE RPC IS SUITABLE${colors.reset}`);
    console.log(`  - Can fetch transactions reliably`);
    console.log(`  - No excessive rate limiting`);
    console.log(`  - Good for development/testing`);
    console.log(`  - May have occasional slowdowns for production`);
  } else if (failed === 0 && warned <= 2) {
    console.log(`${colors.yellow}⚠ FREE RPC IS PARTIALLY SUITABLE${colors.reset}`);
    console.log(`  - Works but may have occasional issues`);
    console.log(`  - Monitor rate limiting`);
    console.log(`  - Consider Alchemy for production`);
  } else {
    console.log(`${colors.red}✗ FREE RPC NOT RECOMMENDED${colors.reset}`);
    console.log(`  - Too many failures or rate limits`);
    console.log(`  - Use Alchemy or Helius for reliability`);
  }
  
  console.log(`\n${colors.cyan}═══════════════════════════════════════════════════${colors.reset}\n`);
}

// Run the tests
runTests().catch(console.error);
