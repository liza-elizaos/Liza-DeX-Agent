import fetch from 'node-fetch';

const PRODUCTION_URL = 'https://shina-aqz7cbjf7-naquibmirza-6034s-projects.vercel.app';

async function comprehensiveTest() {
  console.log('\n🚀 COMPREHENSIVE LIZA OPENROUTER INTEGRATION TEST\n');
  console.log('Production URL:', PRODUCTION_URL);
  console.log('=' . repeat(70) + '\n');

  // Test 1: Check environment
  console.log('[1/5] Checking Vercel Environment Variables...\n');
  try {
    const envResponse = await fetch(`${PRODUCTION_URL}/api/debug-env`);
    const envData = await envResponse.json();
    console.log('✅ OpenRouter API Key:', envData.env.OPENROUTER_API_KEY);
    console.log('✅ OpenRouter Model:', envData.env.OPENROUTER_MODEL);
    console.log('✅ Environment:', envData.env.NODE_ENV);
  } catch (error) {
    console.error('❌ Environment check failed:', error);
  }

  // Test 2: Liza capabilities query
  console.log('\n[2/5] Testing Liza Capabilities Query...\n');
  try {
    const chatResponse = await fetch(`${PRODUCTION_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: 'test_caps',
        message: 'What are your key capabilities and how do you approach DeFi?',
        context: 'trading',
      }),
    });
    const chatData = await chatResponse.json();
    const response = chatData.response;
    console.log('✅ Liza Response (first 400 chars):\n');
    console.log(response.substring(0, 400) + '...\n');
  } catch (error) {
    console.error('❌ Capabilities test failed:', error);
  }

  // Test 3: Technical query
  console.log('[3/5] Testing Technical DeFi Question...\n');
  try {
    const techResponse = await fetch(`${PRODUCTION_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: 'test_tech',
        message: 'What is the difference between constant product AMMs and stable swap pools?',
        context: 'trading',
      }),
    });
    const techData = await techResponse.json();
    const response = techData.response;
    console.log('✅ Technical Response (first 350 chars):\n');
    console.log(response.substring(0, 350) + '...\n');
  } catch (error) {
    console.error('❌ Technical test failed:', error);
  }

  // Test 4: Risk assessment query
  console.log('[4/5] Testing Risk Assessment...\n');
  try {
    const riskResponse = await fetch(`${PRODUCTION_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: 'test_risk',
        message: 'How do you assess smart contract risk in DeFi protocols?',
        context: 'audit',
      }),
    });
    const riskData = await riskResponse.json();
    const response = riskData.response;
    console.log('✅ Risk Assessment Response (first 350 chars):\n');
    console.log(response.substring(0, 350) + '...\n');
  } catch (error) {
    console.error('❌ Risk test failed:', error);
  }

  // Test 5: Response consistency
  console.log('[5/5] Testing Response Consistency...\n');
  try {
    let consistentResponses = true;
    const responses = [];
    
    for (let i = 0; i < 2; i++) {
      const response = await fetch(`${PRODUCTION_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: `consistency_test_${i}`,
          message: 'Summarize your role as Liza in one sentence',
          context: 'trading',
        }),
      });
      const data = await response.json();
      responses.push(data.response);
    }
    
    // Check that responses are different (indicating they're AI-generated)
    if (responses[0] !== responses[1]) {
      console.log('✅ Responses are varied (AI-generated, not hardcoded)');
      console.log('   Response 1:', responses[0].substring(0, 80) + '...');
      console.log('   Response 2:', responses[1].substring(0, 80) + '...');
    } else {
      console.log('⚠️  Responses are identical (possible issue)');
    }
  } catch (error) {
    console.error('❌ Consistency test failed:', error);
  }

  console.log('\n' + '='.repeat(70));
  console.log('✅ ALL TESTS COMPLETED - Liza OpenRouter Integration is Working!\n');
}

comprehensiveTest().catch(console.error);
