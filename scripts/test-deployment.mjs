#!/usr/bin/env node
import fetch from 'node-fetch';

const BASE_URL = 'https://shina-2d5w0tad6-naquibmirza-6034s-projects.vercel.app';

async function testEndpoints() {
  console.log('🧪 Testing deployed endpoints\n');

  // Test 1: Generate token
  console.log('1️⃣ Testing /api/generate...');
  try {
    const genRes = await fetch(`${BASE_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idea: 'Test meme coin' })
    });
    const genData = await genRes.json();
    console.log(`✅ Response:`, genData);
  } catch (e) {
    console.error(`❌ Error:`, e.message);
  }

  console.log('\n2️⃣ UI available at:');
  console.log(`   https://shina-2d5w0tad6-naquibmirza-6034s-projects.vercel.app/launch`);
  console.log(`   or: https://shina-ten.vercel.app/launch`);
}

testEndpoints();
