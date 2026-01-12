#!/usr/bin/env node
/**
 * SIMPLE TEST: Check if Pump.fun API endpoint is accessible
 * This just tests if the backend API is responding
 */

import axios from 'axios';

async function simpleTest() {
  console.log('\n========================================');
  console.log('🧪 SIMPLE API TEST');
  console.log('========================================\n');

  const baseUrl = 'http://localhost:3001';

  // Test 1: Health check
  console.log('1️⃣  Health Check:');
  try {
    const health = await axios.get(`${baseUrl}/health`, { timeout: 5000 });
    console.log('✅ Server is running!');
    console.log(`   Status: ${health.status}`);
    console.log(`   Response: ${JSON.stringify(health.data)}\n`);
  } catch (err) {
    console.log('❌ Server not responding');
    console.log(`   Error: ${(err as any).message}\n`);
    process.exit(1);
  }

  // Test 2: Token creation with minimal data
  console.log('2️⃣  Token Creation Test:\n');

  const testData = {
    name: 'SimpleTest',
    symbol: 'SIMPLE',
    description: 'Simple test',
  };

  console.log(`   Endpoint: ${baseUrl}/api/token/create`);
  console.log(`   Method: POST`);
  console.log(`   Data: ${JSON.stringify(testData)}\n`);
  console.log('   Sending request (timeout 30 seconds)...\n');

  try {
    const response = await axios.post(`${baseUrl}/api/token/create`, testData, {
      timeout: 30000,
      validateStatus: () => true, // Accept any status
    });

    console.log(`   Status: ${response.status}`);
    console.log(`   Response:`);
    console.log(`   ${JSON.stringify(response.data, null, 2)}\n`);

    if (response.data?.mint) {
      console.log('🎉 SUCCESS!');
      console.log(`   Mint: ${response.data.mint}`);
      console.log(`   Link: ${response.data.explorer}\n`);
    } else if (response.data?.error) {
      console.log('⚠️  API responded but with error:');
      console.log(`   ${response.data.error}\n`);
    }
  } catch (err: any) {
    console.log(`❌ Request failed:`);
    console.log(`   ${err.message}\n`);
  }

  console.log('========================================\n');
}

simpleTest().catch(console.error);
