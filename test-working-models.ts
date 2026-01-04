import fetch from 'node-fetch';

const OPENROUTER_API_KEY = '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';

async function testWorkingModels() {
  console.log('Testing working free models...\n');
  
  const testModels = [
    'allenai/olmo-3.1-32b-think:free',
    'nvidia/nemotron-3-nano-30b-a3b:free',
    'mistralai/devstral-2512:free',
    'nex-agi/deepseek-v3.1-nex-n1:free',
  ];

  for (const testModel of testModels) {
    try {
      console.log(`Testing ${testModel}...`);
      const testRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'HTTP-Referer': 'https://shina.vercel.app',
          'X-Title': 'Liza DeFi Agent',
        },
        body: JSON.stringify({
          model: testModel,
          messages: [{ role: 'user', content: 'Say hello briefly' }],
          temperature: 0.7,
          max_tokens: 100,
        }),
      });

      if (testRes.ok) {
        const data = await testRes.json();
        const response = data.choices?.[0]?.message?.content;
        console.log(`✅ WORKING!`);
        console.log(`   Response: ${response}\n`);
      } else {
        const error = await testRes.text();
        console.log(`❌ ${testRes.status} - ${error.substring(0, 100)}\n`);
      }
    } catch (error) {
      console.log(`❌ Exception: ${error}\n`);
    }
  }
}

testWorkingModels();
