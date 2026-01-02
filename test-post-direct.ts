#!/usr/bin/env bun
/**
 * Direct POST test to server
 */

async function test() {
  console.log('📤 Sending POST to http://127.0.0.1:3000/api/chat...\n');
  
  const body = {
    sessionId: 'test-' + Date.now(),
    message: 'swap 0.001 SOL for USDC',
    context: 'trading',
    walletPublicKey: 'CMVrzdso4SShQm2irrc7jMCN9Vw5QxXvrZKB79cYPPJT',
    config: null,
  };
  
  console.log('📝 Body:', JSON.stringify(body));
  
  try {
    const response = await fetch('http://127.0.0.1:3000/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    
    console.log('\n✅ Response status:', response.status);
    const data = await response.json();
    console.log('📤 Response:', data.response || JSON.stringify(data, null, 2));
  } catch (err) {
    console.log('\n❌ Error:', err instanceof Error ? err.message : String(err));
    console.log('Stack:', err instanceof Error ? err.stack : '');
  }
}

test();
