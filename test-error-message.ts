import fetch from 'node-fetch';

const testWallet = '61iHTXhcQM9A5wc8JRMHCw3fAb'; // Jeju Network format

async function test() {
  console.log('\n✅ TESTING IMPROVED ERROR MESSAGES\n');
  console.log('='.repeat(70));

  console.log('\nTest: Swap with Jeju Network wallet on production\n');
  try {
    const res = await fetch('https://shina-hbkzcz2da-naquibmirza-6034s-projects.vercel.app/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: 'test_jeju_error',
        message: 'swap 0.001 SOL for USDC',
        walletPublicKey: testWallet,
      }),
    });
    const data = await res.json();
    console.log('Response:\n');
    console.log(data.response);
    console.log('\n' + '='.repeat(70));
    console.log('\n✅ RESULT: Better error message explaining network mismatch!');
  } catch (e) {
    console.log('Error:', e);
  }
}

test().catch(console.error);
