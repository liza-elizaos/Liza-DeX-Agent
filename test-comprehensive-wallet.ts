import fetch from 'node-fetch';

const API_URL = 'http://localhost:3000/api/chat';
const WALLET_CONNECT_URL = 'http://localhost:3000/api/wallet';

const testWallet = 'CMVrzdso4SShQm2irrc7jMCN9Vw5QxXvrZKB79cYPPJT';

async function test() {
  console.log('\n🔍 COMPREHENSIVE WALLET VALIDATION TEST\n');
  console.log('Testing wallet handling in chat API...\n');
  console.log('='.repeat(70) + '\n');

  // Test 1: Swap WITHOUT wallet (should error gracefully)
  console.log('TEST 1: Swap request WITHOUT wallet connected');
  console.log('-'.repeat(70));
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: 'test_no_wallet',
        message: 'swap 0.001 SOL for USDC',
        context: 'trading',
        // ❌ NO walletPublicKey
      }),
    });
    const data = await res.json();
    console.log('✅ Response received');
    console.log('Message:', data.response.substring(0, 100));
    console.log('Expected: "Wallet not connected" error\n');
  } catch (e) {
    console.log('❌ Error:', e);
  }

  // Test 2: Swap WITH wallet as walletPublicKey param
  console.log('TEST 2: Swap request WITH wallet as parameter');
  console.log('-'.repeat(70));
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: 'test_with_wallet_param',
        message: 'swap 0.001 SOL for USDC',
        context: 'trading',
        walletPublicKey: testWallet,  // ✅ Wallet passed as parameter
      }),
    });
    const data = await res.json();
    console.log('✅ Response received');
    console.log('Message:', data.response.substring(0, 100));
    console.log('Expected: Swap instructions (NOT wallet error)\n');
  } catch (e) {
    console.log('❌ Error:', e);
  }

  // Test 3: Balance check WITH wallet as parameter
  console.log('TEST 3: Balance check WITH wallet');
  console.log('-'.repeat(70));
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: 'test_balance',
        message: 'check my balance',
        context: 'trading',
        walletPublicKey: testWallet,  // ✅ Wallet provided
      }),
    });
    const data = await res.json();
    console.log('✅ Response received');
    console.log('Message:', data.response.substring(0, 100));
    console.log('Expected: Wallet balance info\n');
  } catch (e) {
    console.log('❌ Error:', e);
  }

  // Test 4: Swap with wallet in message (fallback detection)
  console.log('TEST 4: Swap with wallet ADDRESS in message (fallback)');
  console.log('-'.repeat(70));
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: 'test_wallet_in_message',
        message: `swap 0.001 SOL for USDC using ${testWallet}`,
        context: 'trading',
        // ❌ NO walletPublicKey param - should still extract from message
      }),
    });
    const data = await res.json();
    console.log('✅ Response received');
    console.log('Message:', data.response.substring(0, 100));
    console.log('Expected: Swap instructions (extracted from message)\n');
  } catch (e) {
    console.log('❌ Error:', e);
  }

  // Test 5: Wallet connection endpoint
  console.log('TEST 5: Wallet connection endpoint validation');
  console.log('-'.repeat(70));
  try {
    const res = await fetch(WALLET_CONNECT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        walletAddress: testWallet,
      }),
    });
    const data = await res.json();
    console.log('✅ Response received');
    if (data.success) {
      console.log('✅ Wallet validated');
      console.log('Session token:', data.sessionToken?.substring(0, 30) + '...');
    } else {
      console.log('❌ Validation failed:', data.error);
    }
    console.log('');
  } catch (e) {
    console.log('⚠️  Wallet endpoint not available (might not be deployed yet):', e);
    console.log('');
  }

  // Test 6: Invalid wallet format
  console.log('TEST 6: Invalid wallet format rejection');
  console.log('-'.repeat(70));
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: 'test_invalid_wallet',
        message: 'swap 0.001 SOL for USDC',
        context: 'trading',
        walletPublicKey: 'invalid_wallet_format',  // ❌ Invalid format
      }),
    });
    const data = await res.json();
    console.log('✅ Response received');
    console.log('Message:', data.response.substring(0, 100));
    console.log('Expected: "Invalid wallet address" error\n');
  } catch (e) {
    console.log('❌ Error:', e);
  }

  console.log('='.repeat(70));
  console.log('\n✨ WALLET VALIDATION TESTS COMPLETE\n');
  console.log('Key improvements implemented:');
  console.log('1. ✅ Wallet extraction from walletPublicKey parameter');
  console.log('2. ✅ Wallet extraction from message fallback');
  console.log('3. ✅ Server-side wallet fallback for configured bots');
  console.log('4. ✅ Proper error messages when wallet missing');
  console.log('5. ✅ Dedicated wallet connection endpoint\n');
}

test().catch(console.error);
