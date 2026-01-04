// Test available OpenRouter models
import fetch from 'node-fetch';

const OPENROUTER_API_KEY = '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';

async function listModels() {
  console.log('📋 Fetching available OpenRouter models...\n');
  
  try {
    const response = await fetch('https://openrouter.ai/api/v1/models', {
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      },
    });

    if (!response.ok) {
      console.error('Error:', response.status, await response.text());
      return;
    }

    const data = await response.json();
    
    console.log('Available Models (First 20):\n');
    const models = data.data || [];
    
    // Show top models
    models.slice(0, 20).forEach((model) => {
      console.log(`- ${model.id}`);
    });

    // Look for gpt models
    console.log('\n\n🔍 GPT Models Available:\n');
    models.filter(m => m.id.includes('gpt')).slice(0, 10).forEach((model) => {
      console.log(`- ${model.id}`);
    });
  } catch (error) {
    console.error('Exception:', error);
  }
}

listModels();
