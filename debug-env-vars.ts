import fetch from 'node-fetch';

const VERCEL_URL = 'https://shina-goigego55-naquibmirza-6034s-projects.vercel.app/api/chat';

async function debugEnvironment() {
  console.log('🔍 Testing Vercel Environment Configuration\n');
  
  try {
    // Test if the API can even be reached
    const response = await fetch(VERCEL_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: 'debug_' + Date.now(),
        message: 'DEBUG: Show environment info',
        context: 'trading',
      }),
    });

    const data = await response.json();
    console.log('Response:', JSON.stringify(data, null, 2));
    
    // The response should tell us if env vars are set
  } catch (error) {
    console.error('Error:', error);
  }
}

// Also create a direct test calling OpenRouter ourselves
async function testDirectOpenRouter() {
  console.log('\n\n🧪 Testing Direct OpenRouter Call\n');
  
  const apiKey = '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';
  
  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://shina-goigego55-naquibmirza-6034s-projects.vercel.app',
        'X-Title': 'Liza DeFi Agent',
      },
      body: JSON.stringify({
        model: 'openai/gpt-5.2-chat',
        messages: [
          {
            role: 'system',
            content: 'You are Liza, a DeFi trading agent. Be concise and technical.',
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

    if (response.ok) {
      const data = await response.json();
      console.log('✅ OpenRouter Response:\n');
      console.log(data.choices?.[0]?.message?.content);
    } else {
      console.error('❌ Error:', response.status);
      console.error(await response.text());
    }
  } catch (error) {
    console.error('Exception:', error);
  }
}

debugEnvironment().then(() => testDirectOpenRouter());
