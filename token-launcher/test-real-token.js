#!/usr/bin/env node
/**
 * Test Script: Create a real SPL token on Solana mainnet
 * This script tests the token creation API with actual Solana integration
 */

import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function testTokenCreationWithSolana() {
  console.log('\n🧪 Testing Token Creation with Real Solana Integration\n');
  console.log('=' .repeat(60));

  try {
    // Prepare form data
    const form = new FormData();
    form.append('name', 'TestMeme');
    form.append('symbol', 'TMEM');
    form.append('description', 'Test token for Solana integration');
    form.append('tone', 'edgy');
    form.append('initialSupply', '1000000');

    // Add logo
    const logoPath = path.join(__dirname, 'meme_token.png');
    if (fs.existsSync(logoPath)) {
      console.log('📸 Adding logo:', logoPath);
      form.append('image', fs.createReadStream(logoPath));
    } else {
      console.log('⚠️  Logo not found at:', logoPath);
      console.log('   Using test_logo.png instead...');
      const testLogoPath = path.join(__dirname, 'test_logo.png');
      if (fs.existsSync(testLogoPath)) {
        form.append('image', fs.createReadStream(testLogoPath));
      }
    }

    console.log('\n📤 Sending request to /api/token/create...');
    console.log('   Endpoint: http://localhost:3001/api/token/create');
    console.log('   Method: POST');
    console.log('   Timeout: 120 seconds\n');

    const startTime = Date.now();
    const response = await axios.post('http://localhost:3001/api/token/create', form, {
      headers: form.getHeaders(),
      timeout: 120000, // 2 minutes
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    });

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log(`\n✅ Success! (${elapsed}s)\n`);
    console.log('=' .repeat(60));
    console.log('Response Data:');
    console.log(JSON.stringify(response.data, null, 2));
    console.log('=' .repeat(60));

    if (response.data.success && response.data.mint) {
      console.log('\n🎉 TOKEN CREATED SUCCESSFULLY!\n');
      console.log('📊 Token Details:');
      console.log(`   Name: ${response.data.token.name}`);
      console.log(`   Symbol: ${response.data.token.symbol}`);
      console.log(`   Mint Address: ${response.data.mint}`);
      console.log(`   Transaction: ${response.data.transaction}`);
      console.log(`   Initial Supply: ${response.data.token.initialSupply}`);

      console.log('\n🔗 Verify on Block Explorers:');
      console.log(`   • Solscan: ${response.data.explorer}`);
      console.log(`   • Pump.fun: ${response.data.pumpfun}`);
      if (response.data.solanaBeach) {
        console.log(`   • Solana Beach: ${response.data.solanaBeach}`);
      }

      console.log('\n📋 Token Message:');
      console.log(`   ${response.data.message}`);
    } else {
      console.log('\n⚠️  Response indicates failure:');
      console.log(JSON.stringify(response.data, null, 2));
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('\n❌ API Error:\n');
      console.error('Status:', error.response?.status);
      console.error('Data:', error.response?.data);
      console.error('Message:', error.message);
    } else {
      console.error('\n❌ Error:', error instanceof Error ? error.message : error);
    }
    process.exit(1);
  }

  console.log('\n' + '=' .repeat(60));
  console.log('Test completed!');
  console.log('=' .repeat(60) + '\n');
}

// Run the test
testTokenCreationWithSolana().catch(console.error);
