#!/usr/bin/env node
/**
 * LIVE TEST: Token Creation via /api/token/create Endpoint
 * Tests the entire flow: form submission -> Pump.fun API -> Real token
 */

import axios from 'axios';
import FormData from 'form-data';

const API_URL = 'http://localhost:3001/api/token/create';

async function testTokenCreation() {
  console.log('\n' + '='.repeat(70));
  console.log('🧪 LIVE TEST: Token Creation via Backend API');
  console.log('='.repeat(70) + '\n');

  console.log('📍 Test Configuration:');
  console.log(`   Backend: ${API_URL}`);
  console.log(`   Network: Solana Mainnet`);
  console.log(`   Method: POST with multipart/form-data\n`);

  const testCase = {
    name: 'LiveTestToken',
    symbol: 'LIVE',
    description: 'Real token created via backend API on ' + new Date().toLocaleString(),
    tone: 'degen',
  };

  console.log('📤 Sending token creation request:');
  console.log(`   Name: ${testCase.name}`);
  console.log(`   Symbol: ${testCase.symbol}`);
  console.log(`   Description: ${testCase.description}\n`);

  try {
    // Create form data
    const formData = new FormData();
    formData.append('name', testCase.name);
    formData.append('symbol', testCase.symbol);
    formData.append('description', testCase.description);
    formData.append('tone', testCase.tone);

    console.log('🚀 Calling endpoint... (this may take 5-30 seconds)\n');

    const response = await axios.post(API_URL, formData, {
      headers: formData.getHeaders(),
      timeout: 120000, // 2 minute timeout
    });

    console.log('✅ Response received!\n');

    if (response.data.success && response.data.mint) {
      console.log('🎉 SUCCESS! REAL TOKEN CREATED!\n');
      console.log('═'.repeat(70));
      console.log('TOKEN DETAILS:');
      console.log('═'.repeat(70));
      console.log(`  Mint Address: ${response.data.mint}`);
      console.log(`  Transaction: ${response.data.transaction}`);
      console.log(`  Name: ${response.data.token?.name || testCase.name}`);
      console.log(`  Symbol: ${response.data.token?.symbol || testCase.symbol}`);
      console.log('');
      console.log('🔗 VERIFICATION LINKS:');
      console.log('═'.repeat(70));
      console.log(`  Solscan:    ${response.data.explorer}`);
      console.log(`  Pump.fun:   ${response.data.pumpfun}`);
      console.log(`  Solana Beach: ${response.data.solanaBeach || 'N/A'}`);
      console.log('');
      console.log('💰 COST:');
      console.log('═'.repeat(70));
      console.log('  0 SOL - COMPLETELY FREE!');
      console.log('');
      console.log('🎯 NEXT STEPS:');
      console.log('═'.repeat(70));
      console.log('  1. Wait 30 seconds for blockchain confirmation');
      console.log('  2. Click the Solscan link above');
      console.log('  3. Verify token exists with correct supply');
      console.log('  4. Check on Pump.fun for trading');
      console.log('  5. Share mint with your community!');
      console.log('');
    } else {
      console.log('❌ UNEXPECTED RESPONSE\n');
      console.log('Response data:');
      console.log(JSON.stringify(response.data, null, 2));
    }
  } catch (error) {
    console.log('❌ ERROR!\n');

    if (axios.isAxiosError(error)) {
      if (error.response) {
        console.log(`Status: ${error.response.status}`);
        console.log(`Data:`, JSON.stringify(error.response.data, null, 2));
      } else if (error.request) {
        console.log('No response from server. Is it running?');
        console.log('Start it with: npm start');
      } else {
        console.log(`Error: ${error.message}`);
      }
    } else {
      console.log(`Error: ${error}`);
    }
  }

  console.log('═'.repeat(70) + '\n');
}

// Add error handling
process.on('uncaughtException', (error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

// Run the test
testTokenCreation();
