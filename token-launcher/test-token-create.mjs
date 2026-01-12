#!/usr/bin/env node
/**
 * Quick test to verify token creation endpoint works
 * Run: node test-token-create.mjs
 */

import axios from 'axios';
import FormData from 'form-data';

const API_BASE = 'http://localhost:3001';

async function testTokenCreation() {
  try {
    console.log('🧪 Testing token creation endpoint...');
    console.log(`📍 API Base: ${API_BASE}`);
    console.log('');

    // Test 1: Health check
    console.log('1️⃣  Testing health check...');
    try {
      const healthRes = await axios.get(`${API_BASE}/health`);
      console.log('✅ Server health:', healthRes.data);
    } catch (err) {
      console.log('⚠️  Server not responding to health check');
      console.log('   This is OK - waiting for it to start...');
    }

    // Wait a moment
    await new Promise(r => setTimeout(r, 2000));

    // Test 2: Create token without logo
    console.log('\n2️⃣  Testing token creation (no logo)...');
    const tokenData = new FormData();
    tokenData.append('name', 'TestMeme');
    tokenData.append('symbol', 'TST');
    tokenData.append('description', 'This is a test token created via Pump.fun FREE API');
    tokenData.append('tone', 'degen');

    console.log('📤 Sending request to /api/token/create...');
    console.log('   - Name: TestMeme');
    console.log('   - Symbol: TST');
    console.log('   - Description: This is a test token created via Pump.fun FREE API');
    console.log('');

    const response = await axios.post(`${API_BASE}/api/token/create`, tokenData, {
      headers: tokenData.getHeaders(),
      timeout: 120000, // 2 minutes timeout for API call
    });

    console.log('\n✅ Token creation response received!');
    console.log(JSON.stringify(response.data, null, 2));

    if (response.data.success && response.data.mint) {
      console.log('\n🎉 SUCCESS! Real token created!');
      console.log(`   Mint Address: ${response.data.mint}`);
      console.log(`   Transaction: ${response.data.transaction}`);
      console.log(`   Explorer: ${response.data.explorer}`);
      console.log(`   Pump.fun: ${response.data.pumpfun}`);
      console.log('\n💰 Cost: ZERO SOL! (Completely FREE via Pump.fun)');
    } else {
      console.log('\n❌ FAILED! Response did not contain mint address');
      console.log(`   Error: ${response.data.error}`);
      console.log(`   Message: ${response.data.message}`);
    }
  } catch (error) {
    console.error('\n💥 Error during test:');
    if (error instanceof Error) {
      console.error(`   Message: ${error.message}`);
      if ('response' in error) {
        const axError = error as any;
        console.error(`   Status: ${axError.response?.status}`);
        console.error(`   Data:`, JSON.stringify(axError.response?.data, null, 2));
      }
    } else {
      console.error(error);
    }
  }
}

testTokenCreation();
