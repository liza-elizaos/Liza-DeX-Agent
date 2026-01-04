import fetch from 'node-fetch';

const API_URL = 'http://localhost:3000/api/chat';

async function testChat(message: string) {
  console.log(`\n📨 Testing: "${message}"\n`);
  
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: `test_${Date.now()}`,
        message,
        context: 'trading',
      }),
    });

    const data = await response.json();
    console.log('✅ Response:', data.response);
    return data;
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Test various queries
async function runTests() {
  // Test 1: General query
  await testChat('What are your capabilities?');
  
  // Test 2: Help
  await testChat('Can you help me with trading?');
  
  // Test 3: DeFi
  await testChat('What DeFi strategies do you support?');
}

runTests().catch(console.error);
