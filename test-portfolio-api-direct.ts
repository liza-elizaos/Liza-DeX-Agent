/**
 * Test: Direct Portfolio API Endpoint
 */

async function testPortfolioAPI() {
  console.log('🧪 Testing /api/portfolio endpoint...\n');

  const userWallet = '6i1HTXhcxreAEys8QMEvnB1FNpNVwombS61QcwquJb1f';
  const deployedUrl = 'https://shina-ten.vercel.app';
  const endpoint = `${deployedUrl}/api/portfolio`;

  console.log(`🔗 POST ${endpoint}\n`);

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        walletAddress: userWallet,
      }),
    });

    console.log('Status:', response.status);
    console.log('Headers:', Array.from(response.headers.entries()).slice(0, 5).map(([k, v]) => `${k}: ${v}`).join('\n'));
    console.log('');

    const text = await response.text();
    console.log('Response Body:');
    console.log(text.substring(0, 500));

    if (response.ok) {
      try {
        const data = JSON.parse(text);
        console.log('\n✅ Portfolio API works!');
        console.log('\nFull Response:');
        console.log(JSON.stringify(data, null, 2).substring(0, 800));
      } catch {
        console.log('\n✅ Portfolio API responds (not JSON)');
      }
    } else {
      console.log(`\n❌ API error: ${response.status}`);
    }
  } catch (error) {
    console.error('❌ Request failed:', error);
  }
}

testPortfolioAPI();
