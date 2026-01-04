import fetch from 'node-fetch';

const VERCEL_URL = 'https://shina-1bexbqorg-naquibmirza-6034s-projects.vercel.app/api/chat';

async function testChat(message: string, testNum: number) {
  console.log(`\n[TEST ${testNum}] Query: "${message}"\n`);
  
  try {
    const response = await fetch(VERCEL_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: `test_${testNum}`,
        message,
        context: 'trading',
      }),
    });

    if (!response.ok) {
      console.error(`HTTP Error: ${response.status}`);
      return;
    }

    const data = await response.json();
    const msg = typeof data.response === 'object' ? data.response.response : data.response;
    console.log('✅ Liza Response (Cheapest Model):\n');
    console.log(msg.substring(0, 400));
    console.log('\n' + '='.repeat(70));
  } catch (error) {
    console.error('Error:', error);
  }
}

async function runTests() {
  console.log('\n🚀 TESTING WITH CHEAPEST MODEL (mistralai/mistral-small:free)\n');
  console.log('URL:', VERCEL_URL);
  console.log('Model: mistralai/mistral-small:free (FREE)');
  console.log('='.repeat(70));
  
  await testChat('What are your capabilities?', 1);
  await testChat('How do DeFi strategies work?', 2);
  await testChat('Help me with token swaps', 3);
}

runTests().catch(console.error);
