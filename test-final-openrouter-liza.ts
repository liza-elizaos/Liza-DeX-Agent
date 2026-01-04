import fetch from 'node-fetch';

const VERCEL_URL = 'https://shina-4ci1etxch-naquibmirza-6034s-projects.vercel.app/api/chat';

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
    if (typeof text === 'string') {
      console.log('✅ Liza Response:\n');
      console.log(text);
    } else {
      console.log('Response structure:', JSON.stringify(data, null, 2));
    }
    console.log('\n' + '='.repeat(70));
  } catch (error) {
    console.error('Error:', error);
  }
}

async function runTests() {
  console.log('\n🚀 OPENROUTER LIZA INTEGRATION - FINAL TEST\n');
  console.log('URL: ' + VERCEL_URL);
  console.log('='.repeat(70));
  
  await testChat('What are your main capabilities as Liza the trading agent?', 1);
  await testChat('Tell me about automated DeFi trading strategies', 2);
  await testChat('How does your system handle risk management?', 3);
}

runTests().catch(console.error);
