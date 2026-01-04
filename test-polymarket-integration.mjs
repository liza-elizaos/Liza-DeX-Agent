#!/usr/bin/env node

/**
 * Test Polymarket Integration
 * Tests the new PM/polymarket query handler
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

async function testPolymarket() {
  console.log('🧪 Testing Polymarket Integration\n');

  const testCases = [
    {
      name: 'PM with odds (decimal)',
      message: 'PM 0.45 will trump win',
    },
    {
      name: 'PM with odds (percentage)',
      message: 'polymarket 55% BTC reach 100k',
    },
    {
      name: 'PM with dollar format',
      message: 'poly $0.65 harris election',
    },
    {
      name: 'Simple balance check',
      message: 'check balance CMVrzdso4SShQm2irrc7jMCN9Vw5QxXvrZKB79cYPPJT',
    },
  ];

  for (const testCase of testCases) {
    console.log(`\n📍 Test: ${testCase.name}`);
    console.log(`Message: "${testCase.message}"`);

    try {
      const response = await fetch(`${BASE_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: `test_${Date.now()}`,
          message: testCase.message,
          context: 'trading',
        }),
      });

      if (!response.ok) {
        console.log(`❌ Error: ${response.status} ${response.statusText}`);
        const error = await response.text();
        console.log(`Response: ${error.substring(0, 200)}`);
      } else {
        const data = await response.json();
        console.log(`✅ Response received`);
        console.log(`Response preview: ${data.response.substring(0, 150)}...`);
        
        if (data.swap) {
          console.log(`💱 Swap data included (pending signature)`);
        }
      }
    } catch (error) {
      console.log(`❌ Error: ${error instanceof Error ? error.message : String(error)}`);
    }

    // Add delay between requests
    await new Promise(r => setTimeout(r, 500));
  }

  console.log('\n✅ Test suite completed!\n');
}

// Run tests
testPolymarket().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
