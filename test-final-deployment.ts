import fetch from 'node-fetch';

const VERCEL_URL = 'https://shina-goigego55-naquibmirza-6034s-projects.vercel.app/api/chat';

async function testChat(message: string, testNum: number) {
  console.log(`\n[TEST ${testNum}] Query: "${message}"\n`);
  
  try {
    const response = await fetch(VERCEL_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: `test_${testNum}_${Date.now()}`,
        message,
        context: 'trading',
      }),
    });

    if (!response.ok) {
      console.error(`❌ HTTP Error: ${response.status}`);
      console.error(await response.text());
      return;
    }

    const data = await response.json();
    console.log('Liza Response:\n');
    console.log(data.response);
    console.log('\n' + '='.repeat(70));
    return data;
  } catch (error) {
    console.error('Error:', error);
  }
}

async function runTests() {
  console.log('🚀 FINAL OPENROUTER AI INTEGRATION TEST\n');
  console.log('URL:', VERCEL_URL);
  console.log('Model: openai/gpt-5.2-chat');
  console.log('='.repeat(70));
  
  await testChat('What are your main capabilities?', 1);
  await testChat('Tell me about DeFi strategies', 2);
  await testChat('How does automated trading work?', 3);
}

runTests().catch(console.error);
