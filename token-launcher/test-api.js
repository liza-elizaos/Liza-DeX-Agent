import fetch from 'node-fetch';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function testTokenLaunch() {
  try {
    console.log('\n🚀 Testing Token Launch API\n');

    // Create a simple test image (1x1 transparent PNG)
    const base64Png = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    const imageBuffer = Buffer.from(base64Png, 'base64');
    
    // Create form data
    const form = new FormData();
    
    form.append('userPrompt', JSON.stringify({
      idea: 'SHINA - AI-powered cryptocurrency intelligence platform',
      tone: 'professional',
      symbolHint: 'SHINA',
      notes: 'Advanced market analysis and trading signals'
    }));
    
    form.append('launchConfig', JSON.stringify({
      devBuySol: 0.1,
      slippage: 10,
      priorityFee: 0.0005,
      pool: 'pump'
    }));
    
    form.append('image', imageBuffer, 'token.png');
    
    console.log('[REQUEST] Sending to http://localhost:3001/api/agent/launch');
    console.log('[TIMEOUT] 60 seconds\n');
    
    const response = await fetch('http://localhost:3001/api/agent/launch', {
      method: 'POST',
      body: form,
      timeout: 60000,
      headers: form.getHeaders()
    });
    
    const data = await response.json();
    
    console.log(`\n[RESPONSE] HTTP ${response.status}`);
    console.log(JSON.stringify(data, null, 2));
    
    if (data.status === 'success' && data.mint) {
      console.log('\n✅ Token Launch Successful!');
      console.log(`\nVerify on Solscan:`);
      console.log(`  Token: https://solscan.io/token/${data.mint}`);
      console.log(`  TX: https://solscan.io/tx/${data.tx}`);
    } else {
      console.log('\n❌ Token launch may have failed. Check response above.');
    }
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

testTokenLaunch();
