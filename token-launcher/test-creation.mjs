#!/usr/bin/env node
/**
 * FINAL TEST: Test token creation with new fixed code
 * Output all debug logs to file
 */

import axios from 'axios';
import fs from 'fs';

const logFile = './debug-output.log';

function log(...args: any[]) {
  const msg = args.map(a => typeof a === 'string' ? a : JSON.stringify(a, null, 2)).join(' ');
  console.log(msg);
  fs.appendFileSync(logFile, msg + '\n');
}

async function testTokenCreation() {
  log('\n' + '='.repeat(70));
  log('🧪 TESTING TOKEN CREATION WITH NEW FIXED CODE');
  log('='.repeat(70) + '\n');

  try {
    log('[TEST] Sending request to http://localhost:3001/api/token/create');
    log('[TEST] Data: name=TestToken, symbol=TEST, description=Testing real creation');
    log('');

    const response = await axios.post(
      'http://localhost:3001/api/token/create',
      {
        name: 'TestToken',
        symbol: 'TEST',
        description: 'Testing with new fixed code',
      },
      {
        timeout: 120000,
        validateStatus: () => true,
      }
    );

    log('[TEST] Status:', response.status);
    log('[TEST] Response:', JSON.stringify(response.data, null, 2));
    log('');

    if (response.data?.success) {
      log('✅ SUCCESS!');
      log('   Mint:', response.data.mint);
      log('   Length:', response.data.mint?.length);
      
      if (response.data.mint?.length < 30) {
        log('   ⚠️ ERROR: Mint too short! This is FAKE!');
      } else if (response.data.mint?.length >= 43) {
        log('   ✅ Mint format looks good (43+ chars)!');
      }
    } else {
      log('❌ FAILED!');
      log('   Error:', response.data?.error);
      log('   Message:', response.data?.message);
    }
  } catch (error: any) {
    log('❌ Network Error:', error.message);
    if (error.response) {
      log('   Status:', error.response.status);
      log('   Data:', error.response.data);
    }
  }

  log('\n' + '='.repeat(70));
  log('Debug output saved to debug-output.log');
  log('='.repeat(70) + '\n');
}

// Clear previous log
if (fs.existsSync(logFile)) {
  fs.unlinkSync(logFile);
}

testTokenCreation().catch(e => {
  log('Fatal error:', e);
  process.exit(1);
});
