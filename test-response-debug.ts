import fetch from 'node-fetch';

const VERCEL_URL = 'https://shina-4orp5mqyc-naquibmirza-6034s-projects.vercel.app/api/chat';

async function testChat() {
  console.log('Testing Production Deployment...\n');
  
  try {
    const response = await fetch(VERCEL_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: 'test_123',
        message: 'What can you do?',
        context: 'trading',
      }),
    });

    const data = await response.json();
    console.log('Full Response:\n');
    console.log(JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error:', error);
  }
}

testChat();
