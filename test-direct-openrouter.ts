// Test OpenRouter API directly to verify it works
import fetch from 'node-fetch';

const OPENROUTER_API_KEY = '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';
const MODEL = 'openai/gpt-5.2-chat';

async function testOpenRouterDirectly() {
  console.log('🧪 Testing OpenRouter API Directly\n');
  console.log('API Key:', OPENROUTER_API_KEY.substring(0, 10) + '...');
  console.log('Model:', MODEL);
  
  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'https://shina-htcfy5h7c-naquibmirza-6034s-projects.vercel.app',
        'X-Title': 'Liza DeFi Agent',
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          {
            role: 'system',
            content: 'You are Liza, an autonomous trading agent. Be technical and data-driven.',
          },
          {
            role: 'user',
            content: 'What are your capabilities?',
          },
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    console.log('✅ Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API Error:', errorText);
      return;
    }

    const data = await response.json();
    console.log('\n✅ SUCCESS! OpenRouter Response:\n');
    console.log(data.choices?.[0]?.message?.content || 'No content');
  } catch (error) {
    console.error('❌ Exception:', error);
  }
}

testOpenRouterDirectly();
