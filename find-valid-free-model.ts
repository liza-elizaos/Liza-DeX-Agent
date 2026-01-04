import fetch from 'node-fetch';

const OPENROUTER_API_KEY = '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';

async function findValidFreeModel() {
  console.log('🔍 Finding valid free models on OpenRouter...\n');
  
  try {
    const response = await fetch('https://openrouter.ai/api/v1/models', {
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      },
    });

    if (!response.ok) {
      console.error('Error fetching models:', response.status);
      return;
    }

    const data = await response.json();
    const models = data.data || [];
    
    // Find free models with good performance
    console.log('Available FREE models:\n');
    const freeModels = models.filter(m => m.id && m.id.includes(':free'));
    
    freeModels.slice(0, 15).forEach((model) => {
      console.log(`✓ ${model.id}`);
    });

    console.log('\n\nTesting best free models:\n');
    
    // Test a few free models
    const testModels = [
      'mistralai/mistral-large:free',
      'meta-llama/llama-3-8b-instruct:free',
      'google/gemini-3-flash-preview:free',
      'mistralai/mistral-small:free'
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
            messages: [{ role: 'user', content: 'Hello, test' }],
            temperature: 0.7,
            max_tokens: 100,
          }),
        });

        if (testRes.ok) {
          console.log(`  ✅ WORKING - ${testModel}\n`);
        } else {
          console.log(`  ❌ ${testRes.status} - ${testModel}\n`);
        }
      } catch (error) {
        console.log(`  ❌ Error - ${testModel}\n`);
      }
    }

  } catch (error) {
    console.error('Exception:', error);
  }
}

findValidFreeModel();
