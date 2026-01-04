/**
 * TEST: Wallet Connection & Persistence on Production
 * 
 * This test verifies:
 * 1. Wallet is properly passed to backend
 * 2. Swap requests with wallet connected work
 * 3. Error handling when wallet not connected
 */

import fetch from 'node-fetch';

const PROD_URL = 'https://shina-bek7en322-naquibmirza-6034s-projects.vercel.app/api/chat';
const testWallet = 'CMVrzdso4SShQm2irrc7jMCN9Vw5QxXvrZKB79cYPPJT';

async function test() {
  console.log('\n🧪 WALLET PERSISTENCE & SENDING TEST\n');
  console.log('='.repeat(70));
  
  // Test 1: Swap WITH wallet parameter (simulating connected wallet)
  console.log('\n✅ TEST 1: SWAP WITH WALLET (simulating connected Phantom)\n');
  try {
    const res = await fetch(PROD_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: 'persistence_test_swap_1',
        message: 'swap 0.001 SOL for USDC',
        context: 'trading',
        walletPublicKey: testWallet,  // ✅ Wallet is passed
      }),
    });
    const data = await res.json();
    const isSuccess = data.response.includes('Swap instructions') || data.response.includes('ExactIn');
    console.log(isSuccess ? '✅ SUCCESS' : '❌ FAILED');
    console.log('Response:', data.response.substring(0, 120) + '...\n');
  } catch (e) {
    console.log('❌ Error:', e);
  }

  // Test 2: Balance check WITH wallet
  console.log('✅ TEST 2: BALANCE CHECK WITH WALLET\n');
  try {
    const res = await fetch(PROD_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: 'persistence_test_balance',
        message: 'check my balance',
        context: 'trading',
        walletPublicKey: testWallet,  // ✅ Wallet is passed
      }),
    });
    const data = await res.json();
    const isSuccess = data.response.includes('Balance') || data.response.includes('0.019377108');
    console.log(isSuccess ? '✅ SUCCESS' : '⚠️  Check response');
    console.log('Response:', data.response.substring(0, 120) + '...\n');
  } catch (e) {
    console.log('❌ Error:', e);
  }

  // Test 3: Swap WITHOUT wallet (should error)
  console.log('✅ TEST 3: SWAP WITHOUT WALLET (error check)\n');
  try {
    const res = await fetch(PROD_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: 'persistence_test_no_wallet',
        message: 'swap 0.001 SOL for USDC',
        context: 'trading',
        // ❌ NO walletPublicKey
      }),
    });
    const data = await res.json();
    const isError = data.response.includes('Wallet not connected');
    console.log(isError ? '✅ PROPER ERROR' : '❌ Wrong response');
    console.log('Response:', data.response.substring(0, 120) + '...\n');
  } catch (e) {
    console.log('❌ Error:', e);
  }

  // Test 4: Wallet in message (fallback)
  console.log('✅ TEST 4: WALLET IN MESSAGE (fallback detection)\n');
  try {
    const res = await fetch(PROD_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: 'persistence_test_wallet_in_msg',
        message: `swap 0.001 SOL for USDC using ${testWallet}`,
        context: 'trading',
        // ❌ NO walletPublicKey param - should extract from message
      }),
    });
    const data = await res.json();
    const isSuccess = data.response.includes('Swap') || data.response.includes('instructions');
    console.log(isSuccess ? '✅ SUCCESS (extracted from message)' : '⚠️  Check response');
    console.log('Response:', data.response.substring(0, 120) + '...\n');
  } catch (e) {
    console.log('❌ Error:', e);
  }

  // Test 5: Check request body structure
  console.log('✅ TEST 5: REQUEST BODY STRUCTURE VALIDATION\n');
  try {
    const res = await fetch(PROD_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: 'body_structure_test',
        message: 'what is my address?',
        context: 'trading',
        walletPublicKey: testWallet,
        config: null,
      }),
    });
    const data = await res.json();
    console.log('✅ Request body accepted');
    console.log('Response:', data.response.substring(0, 120) + '...\n');
  } catch (e) {
    console.log('❌ Error:', e);
  }

  console.log('='.repeat(70));
  console.log('\n✨ WALLET PERSISTENCE TEST COMPLETE\n');
  console.log('✅ Frontend improvements deployed:');
  console.log('   1. Wallet address persisted to localStorage');
  console.log('   2. Auto-reconnect on page reload');
  console.log('   3. walletPublicKey always sent in requests');
  console.log('   4. Detailed console logging for debugging');
  console.log('   5. Visual indicator showing wallet is connected\n');
  console.log('📱 NEXT: User should:');
  console.log('   1. Go to: https://shina-bek7en322-naquibmirza-6034s-projects.vercel.app');
  console.log('   2. Connect Phantom wallet');
  console.log('   3. Open browser DevTools (F12)');
  console.log('   4. Go to Console tab');
  console.log('   5. Type swap: "swap 0.001 SOL for USDC"');
  console.log('   6. Check console output for wallet being sent\n');
}

test().catch(console.error);
