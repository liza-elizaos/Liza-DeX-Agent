#!/usr/bin/env node

import http from 'http';

const data = JSON.stringify({
  userPrompt: {
    idea: "SHINA - AI cryptocurrency intelligence platform",
    tone: "professional",
    symbolHint: "SHINA",
    notes: "Advanced Solana trading signals"
  },
  launchConfig: {
    devBuySol: 0.1,
    slippage: 10,
    priorityFee: 0.0005,
    pool: "pump"
  }
});

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/agent/launch',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  },
  timeout: 120000  // 120 second timeout
};

console.log('\n[TEST] Sending token launch request...');
console.log('[INFO] Timeout: 120 seconds\n');

let completed = false;

const req = http.request(options, (res) => {
  let body = '';

  res.on('data', (chunk) => {
    body += chunk;
  });

  res.on('end', () => {
    completed = true;
    console.log(`\n[RESPONSE] HTTP ${res.statusCode}\n`);
    
    try {
      const json = JSON.parse(body);
      console.log(JSON.stringify(json, null, 2));
      
      if (json.status === 'success') {
        console.log('\n[SUCCESS] Token launched!');
        if (json.mint) {
          console.log(`Mint: ${json.mint}`);
          console.log(`TX: ${json.tx}`);
          console.log(`Solscan: https://solscan.io/token/${json.mint}`);
        }
      } else if (json.status === 'rejected') {
        console.log('\n[INFO] Launch rejected (use override:true to force)');
      } else {
        console.log('\n[ERROR] Request failed');
      }
    } catch (e) {
      console.log('[RAW] ' + body);
    }
    process.exit(0);
  });
});

req.on('error', (e) => {
  completed = true;
  console.error(`\n[ERROR] Request failed: ${e.message}`);
  process.exit(1);
});

req.on('timeout', () => {
  completed = true;
  console.error('\n[ERROR] Request timeout - server may be hung');
  req.destroy();
  process.exit(1);
});

console.log('[INFO] Sending JSON payload...');
req.write(data);
req.end();

// Safety timeout
setTimeout(() => {
  if (!completed) {
    console.error('\n[ERROR] Test timeout - no response after 130 seconds');
    process.exit(1);
  }
}, 130000);
