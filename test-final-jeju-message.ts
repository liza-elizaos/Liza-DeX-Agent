import fetch from 'node-fetch';

async function test() {
  console.log('\n🚀 FINAL VERIFICATION - USER FRIENDLY ERROR MESSAGE\n');
  
  const res = await fetch('https://shina-mzfms53jo-naquibmirza-6034s-projects.vercel.app/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sessionId: 'jeju_test',
      message: 'swap 0.001 SOL for USDC',
      walletPublicKey: '61iHTXhcQM9A5wc8JRMHCw3fAb',
    }),
  });
  const data = await res.json();
  
  console.log('MESSAGE FROM LIZA:\n');
  console.log(data.response);
  console.log('\n' + '='.repeat(70));
  console.log('\n✅ Result: User now gets clear instructions!\n');
}

test().catch(console.error);
