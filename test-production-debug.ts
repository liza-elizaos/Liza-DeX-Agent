import fetch from 'node-fetch';

async function test() {
  console.log('\n🔍 DEBUGGING CURRENT PRODUCTION STATUS\n');
  
  const addresses = {
    solana: 'CMVrzdso4SShQm2irrc7jMCN9Vw5QxXvrZKB79cYPPJT',
    jeju: '61iHTXhcQM9A5wc8JRMHCw3fAb',
  };

  for (const [name, addr] of Object.entries(addresses)) {
    console.log(`\n[TEST] ${name.toUpperCase()} Wallet`);
    console.log('─'.repeat(60));
    
    try {
      const res = await fetch('https://shina-mzfms53jo-naquibmirza-6034s-projects.vercel.app/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: `test_${name}`,
          message: 'swap 0.001 SOL for USDC',
          walletPublicKey: addr,
        }),
      });
      
      const data = await res.json();
      const response = data.response;
      
      // Check what error/response we got
      if (response.includes('Wrong Blockchain')) {
        console.log('✅ CORRECT: Network detection working');
      } else if (response.includes('Wallet not connected')) {
        console.log('❌ ERROR: Still showing old error');
        console.log('⚠️  This means fix didn\'t deploy properly');
      } else if (response.includes('Swap instructions')) {
        console.log('✅ CORRECT: Swap ready');
      }
      
      console.log('\nResponse preview:');
      console.log(response.substring(0, 150) + '...');
      
    } catch (e) {
      console.log('❌ Error:', e);
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('\n🎯 DIAGNOSIS NEXT STEPS:');
  console.log('If you still see "Wallet not connected"');
  console.log('→ Need to rebuild and redeploy fresh code\n');
}

test().catch(console.error);
