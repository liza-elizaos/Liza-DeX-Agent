import fetch from 'node-fetch';

const VERCEL_URL = 'https://shina-htcfy5h7c-naquibmirza-6034s-projects.vercel.app/api/chat';

async function testProductionChat(message: string) {
  console.log(`\n\n📨 Testing Production: "${message}"\n`);
  console.log(`URL: ${VERCEL_URL}`);
  
  try {
    const response = await fetch(VERCEL_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: `prod_test_${Date.now()}`,
        message,
        context: 'trading',
      }),
    });

    if (!response.ok) {
      console.error(`❌ HTTP Error: ${response.status}`);
      return;
    }

    const data = await response.json();
    console.log('Response from Liza (OpenRouter):\n');
    console.log(data.response);
    console.log('\n✅ Test successful!');
    return data;
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Test Liza with different queries
async function runProductionTests() {
  console.log('🚀 VERCEL PRODUCTION TESTS\n');
  console.log('========================================\n');
  
  // Test 1: General capability query
  await testProductionChat('What are your main capabilities as Liza?');
  
  // Test 2: Technical question
  await testProductionChat('How do DeFi strategies work?');
  
  // Test 3: Trading help
  await testProductionChat('Can you help me with token swaps?');
}

runProductionTests().catch(console.error);
