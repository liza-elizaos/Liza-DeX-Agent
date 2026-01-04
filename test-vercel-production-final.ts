import fetch from 'node-fetch';

const VERCEL_URL = 'https://shina-qc9yqt5wm-naquibmirza-6034s-projects.vercel.app/api/chat';

async function testProductionChat(message: string) {
  console.log(`\n📨 Query: "${message}"\n`);
  
  try {
    const response = await fetch(VERCEL_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: `prod_${Date.now()}`,
        message,
        context: 'trading',
      }),
    });

    if (!response.ok) {
      console.error(`❌ HTTP Error: ${response.status}`);
      return;
    }

    const data = await response.json();
    console.log('✅ Liza Response (from OpenRouter AI):\n');
    console.log(data.response);
    console.log('\n' + '='.repeat(60));
    return data;
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Test Liza with various queries
async function runProductionTests() {
  console.log('\n🚀 PRODUCTION VERCEL TESTS WITH OPENROUTER AI\n');
  console.log('URL: ' + VERCEL_URL);
  console.log('Model: openai/gpt-5.2-chat');
  console.log('='.repeat(60));
  
  // Test 1: General capability query
  await testProductionChat('What are your main capabilities as Liza?');
  
  // Test 2: Technical question
  await testProductionChat('How do DeFi strategies work on Solana?');
  
  // Test 3: Trading help
  await testProductionChat('I want to swap SOL for BONK tokens, what should I know?');
}

runProductionTests().catch(console.error);
