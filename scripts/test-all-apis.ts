#!/usr/bin/env bun
import axios from 'axios';

const BASE_URL = 'http://localhost:3000';

async function testEndpoints() {
  console.log('🧪 Testing all API endpoints...\n');

  try {
    // Test chat endpoint
    console.log('1️⃣ Testing Chat API...');
    const chatRes = await axios.post(`${BASE_URL}/api/chat`, {
      message: 'hello'
    });
    console.log('✅ Chat API:', chatRes.data.success ? '200 OK' : 'error');
    
    // Test balance endpoint (GET)
    console.log('\n2️⃣ Testing Balance API (GET)...');
    const balanceGetRes = await axios.get(`${BASE_URL}/api/balance`);
    console.log('✅ Balance GET:', balanceGetRes.data.error ? 'Expected error (no server wallet)' : balanceGetRes.status);

    // Test balance endpoint (POST)
    console.log('\n3️⃣ Testing Balance API (POST)...');
    const balancePostRes = await axios.post(`${BASE_URL}/api/balance`, {
      userPublicKey: 'CMVrzdso4SShQm2irrc7jMCN9Vw5QxXvrZKB79cYPPJT'
    });
    console.log('✅ Balance POST:', balancePostRes.status, balancePostRes.data.success ? 'OK' : '');

    // Test swap endpoint
    console.log('\n4️⃣ Testing Swap API...');
    const swapRes = await axios.post(`${BASE_URL}/api/swap`, {
      fromToken: 'SOL',
      toToken: 'USDC',
      amount: 1
    });
    console.log('✅ Swap API:', swapRes.data.success ? '200 OK' : 'error');
    console.log('   From:', swapRes.data.swap?.from?.token);
    console.log('   To:', swapRes.data.swap?.to?.token);

    // Test portfolio endpoint
    console.log('\n5️⃣ Testing Portfolio API...');
    const portfolioRes = await axios.get(`${BASE_URL}/api/portfolio?wallet=CMVrzdso4SShQm2irrc7jMCN9Vw5QxXvrZKB79cYPPJT`);
    console.log('✅ Portfolio API:', portfolioRes.data.success ? '200 OK' : 'error');
    console.log('   Portfolio Value: $' + portfolioRes.data.data?.totalValueUSD);

    // Test wallet-connect endpoint
    console.log('\n6️⃣ Testing Wallet Connect API...');
    const walletRes = await axios.post(`${BASE_URL}/api/wallet-connect`, {
      publicKey: 'CMVrzdso4SShQm2irrc7jMCN9Vw5QxXvrZKB79cYPPJT',
      signature: 'test_signature'
    });
    console.log('✅ Wallet Connect:', walletRes.data.success ? '200 OK' : 'error');

    console.log('\n✨ All tests completed!');
  } catch (error: any) {
    console.error('❌ Test failed:', error.message);
    if (error.response?.data) {
      console.error('Response:', error.response.data);
    }
  }
}

testEndpoints();
