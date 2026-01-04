/**
 * Test wallet handling with a message that has NO token address
 */

const PRODUCTION_URL = 'https://shina-bqx35uu2u-naquibmirza-6034s-projects.vercel.app';

async function testWalletDetection() {
  console.log('🧪 Testing Wallet Detection WITHOUT Token Address in Message\n');

  const testCases = [
    {
      name: '✅ WITH valid Solana wallet param',
      walletPublicKey: '9B5X6q78YZA9BQ5X6q78YZA9BQ5X6q78YZA9BQ5X6qW',
      message: 'check my balance',
      expectedError: false,
    },
    {
      name: '❌ WITHOUT wallet (empty string) and NO address in message',
      walletPublicKey: '',
      message: 'check my balance',
      expectedError: true,
    },
    {
      name: '❌ WITH undefined wallet and NO address in message',
      walletPublicKey: undefined,
      message: 'what is my portfolio',
      expectedError: true,
    },
    {
      name: '⚠️ WITH Jeju wallet and swap message',
      walletPublicKey: '61iHTXhc92dGhkJT7ykAcpxqYcF6Q1q8',
      message: 'swap my tokens',
      expectedError: false, // Will get network detection message instead
    },
  ];

  for (const test of testCases) {
    console.log(`\n${test.name}`);
    
    const body = {
      sessionId: `test_${Date.now()}`,
      message: test.message,
      context: 'trading',
      walletPublicKey: test.walletPublicKey,
      config: null,
    };

    try {
      const res = await fetch(`${PRODUCTION_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      console.log('Response preview:', data.response?.substring(0, 80) + '...');

      if (test.expectedError) {
        if (data.response?.includes('Wallet not connected')) {
          console.log('✅ PASS: Got wallet not connected error');
        } else {
          console.log('❌ FAIL: Should have gotten wallet not connected error, but got:', data.response?.substring(0, 60));
        }
      }
    } catch (e) {
      console.log('Error:', e instanceof Error ? e.message : e);
    }
  }
}

testWalletDetection();
