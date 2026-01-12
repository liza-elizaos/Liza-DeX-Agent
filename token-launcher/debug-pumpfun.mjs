#!/usr/bin/env node
/**
 * DEBUG TEST: See exact error from Pump.fun API
 * This will show us why we're getting fake tokens
 */

import axios from 'axios';

async function debugPumpfun() {
  console.log('\n' + '='.repeat(70));
  console.log('🔍 DEBUGGING PUMP.FUN API');
  console.log('='.repeat(70) + '\n');

  const apiKey = process.env.PUMPPORTAL_API_KEY;
  const walletAddress = process.env.DEV_WALLET_ADDRESS;

  console.log('📋 Environment Check:');
  console.log(`   API Key length: ${apiKey?.length || 0} chars`);
  console.log(`   Wallet: ${walletAddress}\n`);

  if (!apiKey) {
    console.log('❌ NO API KEY! Cannot test.\n');
    process.exit(1);
  }

  try {
    console.log('🔗 Testing Pump.fun API endpoint...\n');

    const testPayload = {
      action: 'create',
      tokenMetadata: {
        name: 'DebugTest',
        symbol: 'DBG',
        uri: 'https://pump.fun/metadata',
      },
      denominatedInSol: 'true',
      amount: '0.001',
      slippage: 10,
      priorityFee: 0.001,
      pool: 'pump',
    };

    console.log('📤 Sending to: https://pumpportal.fun/api/trade');
    console.log(`   API Key: ${apiKey.substring(0, 10)}...${apiKey.substring(-10)}`);
    console.log('   Payload:', JSON.stringify(testPayload, null, 2));
    console.log('');

    const response = await axios.post(
      `https://pumpportal.fun/api/trade?api-key=${apiKey}`,
      testPayload,
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 30000,
        validateStatus: () => true,
      }
    );

    console.log('📨 Response Status:', response.status);
    console.log('📨 Response Headers:', JSON.stringify(response.headers, null, 2));
    console.log('📨 Response Data:', JSON.stringify(response.data, null, 2));
    console.log('');

    if (response.status === 200) {
      if (response.data.mint) {
        console.log('✅ Got mint address:', response.data.mint);
        console.log('   Length:', response.data.mint.length, 'chars');
        
        if (response.data.mint.length < 30) {
          console.log('   ⚠️ WARNING: Mint is TOO SHORT (expected 43-44 chars)');
          console.log('   This might be a fake/mock address!');
        }
      } else {
        console.log('❌ NO MINT IN RESPONSE!');
        console.log('   Response:', response.data);
      }
    } else {
      console.log('❌ BAD STATUS CODE:', response.status);
      console.log('   This means API rejected the request!');
      console.log('   Response:', response.data);
    }
  } catch (error) {
    console.log('❌ NETWORK ERROR:');
    if (axios.isAxiosError(error)) {
      console.log('   Message:', error.message);
      if (error.response) {
        console.log('   Status:', error.response.status);
        console.log('   Data:', error.response.data);
      } else if (error.request) {
        console.log('   No response from server');
      }
    } else {
      console.log('   Error:', error);
    }
  }

  console.log('\n' + '='.repeat(70) + '\n');
}

debugPumpfun();
