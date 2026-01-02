#!/usr/bin/env bun
/**
 * Test if API server is responding
 */

(async () => {
  try {
    console.log('Testing API at http://localhost:3000/api/chat...\n');
    
    const response = await fetch('http://localhost:3000/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: 'test-' + Date.now(),
        message: 'swap 0.001 SOL for USDC',
        context: 'trading',
        walletPublicKey: 'CMVrzdso4SShQm2irrc7jMCN9Vw5QxXvrZKB79cYPPJT',
        config: null,
      }),
    });
    
    console.log('✅ Connected! Status:', response.status);
    const data = await response.json();
    console.log('\n📤 Response:');
    console.log(data.response || JSON.stringify(data, null, 2));
  } catch (err) {
    console.log('❌ Connection failed:', err.message);
  }
})();
