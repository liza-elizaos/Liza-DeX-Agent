/**
 * Test to verify wallet is being properly sent to backend
 * Simulates the frontend's actual request to /api/chat
 */

const PRODUCTION_URL = 'https://shina-bqx35uu2u-naquibmirza-6034s-projects.vercel.app';
const LOCAL_URL = 'http://localhost:3000';

async function testWalletSending() {
  console.log('🧪 Testing Wallet Data Sending to Backend\n');

  const testCases = [
    {
      name: '1️⃣ WITH Solana Wallet in walletPublicKey param',
      walletPublicKey: '9B5X6q78YZA9BQ5X6q78YZA9BQ5X6q78YZA9BQ5X6qW', // Valid Solana format
      message: 'swap all HdZh1mUvCVJzHfTFaJJxZJFENhiFAkyiXLA5iZZTpump for SOL',
      expectedBehavior: '✅ Should accept wallet and process swap'
    },
    {
      name: '2️⃣ WITHOUT Solana Wallet (empty string)',
      walletPublicKey: '',
      message: 'swap all HdZh1mUvCVJzHfTFaJJxZJFENhiFAkyiXLA5iZZTpump for SOL',
      expectedBehavior: '❌ Should show "Wallet not connected" error'
    },
    {
      name: '3️⃣ WITH Jeju Network Wallet',
      walletPublicKey: '61iHTXhc92dGhkJT7ykAcpxqYcF6Q1q8',
      message: 'swap all test for SOL',
      expectedBehavior: '⚠️ Should show "Wrong Blockchain Network Detected" message'
    },
    {
      name: '4️⃣ WITH undefined walletPublicKey',
      walletPublicKey: undefined as any,
      message: 'swap test for SOL',
      expectedBehavior: '❌ Should show "Wallet not connected" error'
    },
  ];

  for (const testCase of testCases) {
    console.log(`\n${testCase.name}`);
    console.log(`Expected: ${testCase.expectedBehavior}`);
    
    const requestBody = {
      sessionId: `session_test_${Date.now()}`,
      message: testCase.message,
      context: 'trading',
      walletPublicKey: testCase.walletPublicKey,
      config: null,
    };

    console.log(`Request Body:`, {
      sessionId: requestBody.sessionId,
      message: requestBody.message.substring(0, 50),
      walletPublicKey: requestBody.walletPublicKey ? `${requestBody.walletPublicKey.substring(0, 8)}...` : 'NOT PROVIDED',
      context: requestBody.context,
    });

    try {
      const response = await fetch(`${PRODUCTION_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        console.log(`❌ HTTP Error: ${response.status}`);
        const errorData = await response.json();
        console.log('Error:', errorData);
        continue;
      }

      const data = await response.json();
      console.log('✅ Response:', data.response?.substring(0, 100) + '...');

      // Check if response matches expected behavior
      if (testCase.name.includes('WITH Solana')) {
        if (data.response?.includes('Swap') || data.response?.includes('instructions')) {
          console.log('✅ PASS: Got expected swap response');
        }
      } else if (testCase.name.includes('WITHOUT')) {
        if (data.response?.includes('Wallet not connected')) {
          console.log('✅ PASS: Got expected wallet not connected error');
        }
      } else if (testCase.name.includes('JEJU')) {
        if (data.response?.includes('Wrong Blockchain') || data.response?.includes('Network')) {
          console.log('✅ PASS: Got expected network detection message');
        }
      }
    } catch (error) {
      console.log('❌ Request failed:', error instanceof Error ? error.message : error);
    }
  }

  console.log('\n📝 IMPORTANT: Check Vercel logs to see detailed wallet parameter info:');
  console.log('   Visit: https://vercel.com/naquibmirza-6034s-projects/shina/');
  console.log('   Look for logs with "[CHAT] ========== REQUEST RECEIVED =========="');
}

testWalletSending().catch(console.error);
