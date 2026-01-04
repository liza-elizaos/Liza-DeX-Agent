import fetch from 'node-fetch';

const VERCEL_URL = 'https://shina-aqz7cbjf7-naquibmirza-6034s-projects.vercel.app/api/chat';

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
    const text = data.response;
    console.log('✅ Liza Response:\n');
    console.log(text.substring(0, 600));
    if (text.length > 600) console.log('\n... [truncated]');
    console.log('\n' + '='.repeat(70));
  } catch (error) {
    console.error('Error:', error);
  }
}

async function runTests() {
  console.log('\n🚀 FINAL LIZA OPENROUTER INTEGRATION TEST\n');
  console.log('Production URL: ' + VERCEL_URL);
  console.log('='.repeat(70));
  
  await testChat('What can you help me with?', 1);
  await testChat('Explain DeFi strategies', 2);
  await testChat('How do I execute a token swap?', 3);
}

runTests().catch(console.error);
