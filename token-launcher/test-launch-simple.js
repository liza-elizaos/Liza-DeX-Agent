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
  }
};

console.log('\n[TEST] Sending token launch request...\n');

const req = http.request(options, (res) => {
  let body = '';

  res.on('data', (chunk) => {
    body += chunk;
  });

  res.on('end', () => {
    console.log(`[RESPONSE] HTTP ${res.statusCode}\n`);
    
    try {
      const json = JSON.parse(body);
      console.log(JSON.stringify(json, null, 2));
      
      if (json.status === 'success') {
        console.log('\n[SUCCESS] Token launch orchestration completed!');
        if (json.token) {
          console.log(`\nToken Name: ${json.token.name}`);
          console.log(`Token Symbol: ${json.token.symbol}`);
          console.log(`Confidence: ${json.trendConfidence}%`);
          console.log(`Verdict: ${json.trendVerdict}`);
        }
      } else if (json.status === 'rejected') {
        console.log('\n[INFO] Launch rejected - add override:true to force');
      } else {
        console.log('\n[ERROR] Launch failed');
      }
    } catch (e) {
      console.log(body);
    }
  });
});

req.on('error', (e) => {
  console.error(`[ERROR] ${e.message}`);
  process.exit(1);
});

req.write(data);
req.end();
