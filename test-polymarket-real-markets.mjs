#!/usr/bin/env node

/**
 * Test Polymarket Integration with REAL Markets
 * This tests the new market search approach with actual Polymarket data
 */

import fetch from 'node-fetch';

const CLOB_API_URL = process.env.CLOB_API_URL || 'https://clob.polymarket.com';
const CLOB_API_KEY = process.env.CLOB_API_KEY || '0x4dc38c53fd31c863e58c7e95665052e1f5a6e35616d7b987e912c1b745cb74d3';

const testCases = [
  'presidential election winner 2028',
  'bitcoin price 100000',
  'will Trump',
  'US election 2024',
  'ethereum price',
];

async function searchMarkets(query) {
  try {
    console.log(`\n🔍 Searching for: "${query}"`);
    
    const url = `${CLOB_API_URL}/markets?search=${encodeURIComponent(query)}`;
    console.log(`   Request: ${url}`);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${CLOB_API_KEY}`,
      },
    });

    console.log(`   Status: ${response.status}`);

    if (!response.ok) {
      console.log(`   ❌ Failed: ${response.status} ${response.statusText}`);
      return null;
    }

    const data = await response.json();
    console.log(`   ✅ Found ${data.length || 0} markets`);

    if (data.length > 0) {
      const market = data[0];
      console.log(`\n   📊 Top Match:`);
      console.log(`      Question: ${market.question}`);
      console.log(`      ID: ${market.id}`);
      console.log(`      Created: ${new Date(market.createdAt).toLocaleDateString()}`);
      
      if (market.tokens && Array.isArray(market.tokens)) {
        console.log(`      Outcomes: ${market.tokens.length}`);
        market.tokens.forEach((token, i) => {
          console.log(`        - ${i + 1}. ${token.name || token.ticker || 'Unknown'}`);
        });

        // Try to get real odds for each outcome
        console.log(`\n      📈 Real-Time Odds:`);
        for (const token of market.tokens) {
          const price = await getMarketPrice(token.address);
          if (price) {
            console.log(`        - ${token.name}: ${(price * 100).toFixed(2)}%`);
          }
        }
      }

      return market;
    }

    return null;
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    return null;
  }
}

async function getMarketPrice(tokenId) {
  try {
    const url = `${CLOB_API_URL}/mid?token_id=${tokenId}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${CLOB_API_KEY}`,
      },
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return parseFloat(data.mid || '0');
  } catch (error) {
    return null;
  }
}

async function runTests() {
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║   Polymarket Real Market Testing                       ║');
  console.log('║   Testing market search + real odds fetching           ║');
  console.log('╚════════════════════════════════════════════════════════╝');
  
  console.log(`\n🌐 API: ${CLOB_API_URL}`);
  console.log(`🔑 API Key: ${CLOB_API_KEY.slice(0, 10)}...`);
  console.log(`📅 Test Time: ${new Date().toISOString()}`);

  let successCount = 0;
  let failCount = 0;

  for (const query of testCases) {
    const result = await searchMarkets(query);
    if (result) {
      successCount++;
    } else {
      failCount++;
    }
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('\n╔════════════════════════════════════════════════════════╗');
  console.log('║   Test Summary                                         ║');
  console.log('╠════════════════════════════════════════════════════════╣');
  console.log(`║ ✅ Successful: ${successCount}/${testCases.length}`);
  console.log(`║ ❌ Failed: ${failCount}/${testCases.length}`);
  console.log('╚════════════════════════════════════════════════════════╝');

  if (successCount === testCases.length) {
    console.log('\n🎉 ALL TESTS PASSED! Ready to deploy.');
    console.log('\nNext steps:');
    console.log('1. npm run build');
    console.log('2. npx vercel deploy --prod --yes');
    process.exit(0);
  } else {
    console.log('\n⚠️  Some tests failed. Check API connectivity and try again.');
    process.exit(1);
  }
}

runTests().catch(error => {
  console.error('Test error:', error);
  process.exit(1);
});
