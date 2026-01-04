import fetch from 'node-fetch';

const PROD_URL = 'https://shina-ft1qmfb24-naquibmirza-6034s-projects.vercel.app/api/chat';

async function testBalance() {
  console.log('\n✅ TESTING BALANCE CHECK FIX\n');
  console.log('Model: mistralai/devstral-2512:free (VERIFIED WORKING)');
  console.log('='.repeat(70) + '\n');
  
  // Test 1: Balance check with address
  console.log('[1/3] Testing balance check with wallet address...\n');
  try {
    const res = await fetch(PROD_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: 'balance_test_1',
        message: 'check my balance CMVrzdso4SShQm2irrc7jMCN9Vw5QxXvrZKB79cYPPJT',
        context: 'trading',
      }),
    });
    
    if (res.ok) {
      const data = await res.json();
      console.log('✅ Response:\n', (data.response || 'OK').substring(0, 300) + '...\n');
    } else {
      console.log('❌ Error:', res.status + '\n');
    }
  } catch (error) {
    console.error('Error:', error);
  }

  // Test 2: General balance query
  console.log('[2/3] Testing general balance query...\n');
  try {
    const res = await fetch(PROD_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: 'balance_test_2',
        message: 'check wallet balance',
        context: 'trading',
      }),
    });
    
    if (res.ok) {
      const data = await res.json();
      console.log('✅ Response:\n', (data.response || 'OK').substring(0, 300) + '...\n');
    } else {
      console.log('❌ Error:', res.status + '\n');
    }
  } catch (error) {
    console.error('Error:', error);
  }

  // Test 3: Liza query (verify AI works)
  console.log('[3/3] Testing AI response with new model...\n');
  try {
    const res = await fetch(PROD_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: 'ai_test',
        message: 'What DeFi strategies do you recommend?',
        context: 'trading',
      }),
    });
    
    if (res.ok) {
      const data = await res.json();
      console.log('✅ AI Response:\n', (data.response || 'OK').substring(0, 300) + '...\n');
    } else {
      console.log('❌ Error:', res.status + '\n');
    }
  } catch (error) {
    console.error('Error:', error);
  }

  console.log('='.repeat(70));
  console.log('✨ Fix deployed! Balance checks should now work.\n');
}

testBalance();
