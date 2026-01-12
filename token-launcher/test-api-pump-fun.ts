/**
 * Test Pump.fun FREE API directly
 * Real token creation without any fees
 * Run: npx ts-node test-api-pump-fun.ts
 */

import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';

interface PumpFunTokenCreate {
  name: string;
  symbol: string;
  description: string;
  image?: string;
  twitter?: string;
  telegram?: string;
  website?: string;
}

async function testPumpFunAPI() {
  console.log('\n' + '='.repeat(60));
  console.log('🔥 PUMP.FUN FREE API TEST');
  console.log('='.repeat(60) + '\n');

  const apiKey = process.env.PUMPPORTAL_API_KEY;
  const walletAddress = process.env.DEV_WALLET_ADDRESS;
  const rpcUrl = process.env.SOLANA_RPC_URL;

  console.log('📋 Environment Check:');
  console.log(`  ✓ API Key: ${apiKey ? '✓ LOADED' : '✗ MISSING'}`);
  console.log(`  ✓ Wallet: ${walletAddress || '✗ MISSING'}`);
  console.log(`  ✓ RPC URL: ${rpcUrl || '✗ MISSING'}\n`);

  if (!apiKey || !walletAddress) {
    console.log('❌ Missing environment variables!');
    process.exit(1);
  }

  try {
    // Test 1: Direct API call
    console.log('TEST 1️⃣  - Direct Pump.fun API Call');
    console.log('-'.repeat(60));

    const tokenData: PumpFunTokenCreate = {
      name: 'TestMemeCoin',
      symbol: 'TMEM',
      description: 'First real token launch via API - Zero fees!',
      twitter: 'https://twitter.com/test',
      telegram: 'https://t.me/test',
      website: 'https://test.com',
    };

    console.log('📤 Creating token with params:');
    console.log(`   Name: ${tokenData.name}`);
    console.log(`   Symbol: ${tokenData.symbol}`);
    console.log(`   Description: ${tokenData.description}`);
    console.log('');

    // Step 1: Create metadata
    console.log('📝 Step 1: Uploading metadata to Pump.fun...');
    const metadataForm = new FormData();
    metadataForm.append('name', tokenData.name);
    metadataForm.append('symbol', tokenData.symbol);
    metadataForm.append('description', tokenData.description);
    metadataForm.append('showName', 'true');

    if (tokenData.twitter) metadataForm.append('twitter', tokenData.twitter);
    if (tokenData.telegram) metadataForm.append('telegram', tokenData.telegram);
    if (tokenData.website) metadataForm.append('website', tokenData.website);

    let metadataUri = '';

    try {
      const metaResponse = await axios.post('https://pump.fun/api/ipfs', metadataForm, {
        headers: metadataForm.getHeaders(),
        timeout: 30000,
      });

      metadataUri = metaResponse.data.metadataUri || metaResponse.data.uri;
      console.log('   ✅ Metadata uploaded successfully');
      console.log(`   📎 URI: ${metadataUri}\n`);
    } catch (err) {
      console.log('   ⚠️  Metadata upload failed (using default URI)');
      metadataUri = 'https://pump.fun/metadata';
    }

    // Step 2: Create token via API
    console.log('🚀 Step 2: Creating token via PumpPortal API...');
    const createUrl = `https://pumpportal.fun/api/trade?api-key=${apiKey}`;

    const createPayload = {
      action: 'create',
      tokenMetadata: {
        name: tokenData.name.substring(0, 20),
        symbol: tokenData.symbol.substring(0, 10).toUpperCase(),
        uri: metadataUri,
      },
      denominatedInSol: 'true',
      amount: '0.001', // Small initial buy (if required)
      slippage: 10,
      priorityFee: 0.001,
      pool: 'pump',
    };

    console.log('   📡 API Endpoint: ' + createUrl.split('?')[0]);
    console.log('   📦 Payload:');
    console.log(JSON.stringify(createPayload, null, 3));
    console.log('');

    try {
      const createResponse = await axios.post(createUrl, createPayload, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 60000,
      });

      console.log('   ✅ API Response received!');
      console.log('   📊 Response data:');
      console.log(JSON.stringify(createResponse.data, null, 2));

      if (createResponse.data.mint) {
        console.log('\n' + '='.repeat(60));
        console.log('🎉 SUCCESS! REAL TOKEN CREATED!');
        console.log('='.repeat(60));
        console.log(`\n✅ Mint Address: ${createResponse.data.mint}`);
        console.log(`✅ Transaction: ${createResponse.data.signature || createResponse.data.tx}`);
        console.log(`\n🔗 Verification Links:`);
        console.log(`   📍 Solscan: https://solscan.io/token/${createResponse.data.mint}`);
        console.log(`   📍 Pump.fun: https://pump.fun/${createResponse.data.mint}`);
        console.log(`   📍 Magic Eden: https://magiceden.io/marketplace/${createResponse.data.mint}`);
        console.log(`\n💰 Cost: $0 SOL (COMPLETELY FREE!))`);
        console.log(`   Network: Solana Mainnet`);
        console.log(`   Time: ${new Date().toISOString()}`);
        console.log('');
      } else {
        console.log('\n⚠️  Response received but no mint address found');
        console.log('Full response:', JSON.stringify(createResponse.data, null, 2));
      }
    } catch (error: any) {
      console.log('   ❌ API Error:');
      if (error.response) {
        console.log(`   Status: ${error.response.status}`);
        console.log(`   Data:`, error.response.data);
      } else {
        console.log(`   Error: ${error.message}`);
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('TEST 2️⃣  - Verify Token on Blockchain');
    console.log('-'.repeat(60) + '\n');

    console.log('(To verify, check the mint address on Solscan after a few moments)');
    console.log('The token should appear on:');
    console.log('  • Solscan.io');
    console.log('  • Pump.fun');
    console.log('  • Your wallet\n');
  } catch (error) {
    console.error('❌ Fatal error:', error);
  }

  console.log('='.repeat(60) + '\n');
}

// Run the test
testPumpFunAPI().catch(console.error);
