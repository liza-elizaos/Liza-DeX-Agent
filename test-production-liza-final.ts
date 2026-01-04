import fetch from 'node-fetch';

const VERCEL_URL = 'https://shina-4orp5mqyc-naquibmirza-6034s-projects.vercel.app/api/chat';

async function testChat(message: string, testNum: number) {
  console.log(`\n[TEST ${testNum}] 📨 "${message}"\n`);
  
  try {
    const response = await fetch(VERCEL_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: `prod_${testNum}`,
        message,
        context: 'trading',
      }),
    });

    if (!response.ok) {
      console.error(`HTTP Error: ${response.status}`);
      return;
    }

    const data = await response.json();
    console.log('✅ Liza Response:\n');
    console.log(data.response.substring(0, 500));
    if (data.response.length > 500) console.log('...');
    console.log('\n' + '='.repeat(70));
  } catch (error) {
    console.error('Error:', error);
  }
}

async function runTests() {
  console.log('\n🚀 FINAL OPENROUTER LIZA INTEGRATION TEST\n');
  console.log('URL: ' + VERCEL_URL);
  console.log('Status: Production with Environment Variables configured');
  console.log('='.repeat(70));
  
  await testChat('What are your main capabilities as Liza?', 1);
  await testChat('Explain DeFi strategies for Solana', 2);
  await testChat('How can I execute a token swap with you?', 3);
}

runTests().catch(console.error);
