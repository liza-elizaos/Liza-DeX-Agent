#!/usr/bin/env node
/**
 * Test the Vercel deployed swap API
 * Run: node verify-vercel-swap.js
 */

const VERCEL_URL = 'https://shina-30t1rgkis-naquibmirza-6034s-projects.vercel.app';
const API_ENDPOINT = `${VERCEL_URL}/api/chat`;

async function testSwapAPI() {
  console.log('🧪 Testing Vercel Deployed Swap API\n');
  console.log(`📡 Endpoint: ${API_ENDPOINT}\n`);

  // Test 1: Check balance
  console.log('Test 1: Checking wallet balance...');
  try {
    const balanceResponse = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: 'test-session-1',
        message: 'check my balance CMVrzdso4SShQm2irrc7jMCN9Vw5QxXvrZKB79cYPPJT',
        context: 'trading',
        walletPublicKey: 'CMVrzdso4SShQm2irrc7jMCN9Vw5QxXvrZKB79cYPPJT',
      }),
    });

    if (!balanceResponse.ok) {
      console.error(`❌ Balance check failed: ${balanceResponse.status} ${balanceResponse.statusText}`);
      return;
    }

    const balanceData = await balanceResponse.json();
    console.log(`✅ Balance check successful`);
    console.log(`Response (first 150 chars): ${balanceData.response?.substring(0, 150) || 'N/A'}...\n`);
  } catch (error) {
    console.error(`❌ Balance check error:`, error instanceof Error ? error.message : String(error));
    return;
  }

  // Test 2: Attempt swap (should return base64 tx or pending signature)
  console.log('Test 2: Testing swap request...');
  try {
    const swapResponse = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: 'test-session-2',
        message: 'swap 0.01 USDC for SOL',
        context: 'trading',
        walletPublicKey: 'CMVrzdso4SShQm2irrc7jMCN9Vw5QxXvrZKB79cYPPJT',
      }),
    });

    if (!swapResponse.ok) {
      console.error(`❌ Swap request failed: ${swapResponse.status} ${swapResponse.statusText}`);
      return;
    }

    const swapData = await swapResponse.json();
    console.log(`✅ Swap request successful`);
    
    // Check for transactionBase64 (client signing) or success message
    if (swapData.response?.includes('pending_signature') || swapData.swap?.transactionBase64) {
      console.log(`✅ Transaction prepared for client signing (base64 returned)`);
      console.log(`Response type: ${swapData.swap ? 'Structured JSON with transactionBase64' : 'Text response with pending_signature'}`);
    } else if (swapData.response?.includes('Swap Successful')) {
      console.log(`✅ Swap executed successfully!`);
      console.log(`Response: ${swapData.response?.substring(0, 100)}...`);
    } else if (swapData.response?.includes('error') || swapData.response?.includes('Error')) {
      console.log(`❌ Swap API returned error:`);
      console.log(`Response: ${swapData.response?.substring(0, 200)}...`);
    } else {
      console.log(`Response: ${swapData.response?.substring(0, 150)}...`);
    }
  } catch (error) {
    console.error(`❌ Swap request error:`, error instanceof Error ? error.message : String(error));
    return;
  }

  console.log('\n✅ Vercel API tests complete!');
  console.log(`\n📝 Production URL: ${VERCEL_URL}`);
}

testSwapAPI().catch(console.error);
