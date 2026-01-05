/**
 * Test: Call deployed Chat API with portfolio request
 * Tests if https://shina-ten.vercel.app can handle portfolio requests
 */

async function testDeployedChatAPI() {
  console.log('🧪 Testing Deployed Chat API...\n');

  const userWallet = '6i1HTXhcxreAEys8QMEvnB1FNpNVwombS61QcwquJb1f';
  const deployedUrl = 'https://shina-ten.vercel.app';
  const apiEndpoint = `${deployedUrl}/api/chat`;

  console.log(`🔗 Calling: ${apiEndpoint}\n`);

  try {
    const response = await fetch(apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: 'show portfolio',
        walletPublicKey: userWallet,
        context: 'trading',
      }),
    });

    console.log('📊 Response Status:', response.status);

    if (!response.ok) {
      const error = await response.text();
      console.error('❌ API Error:', error);
      return;
    }

    const data = await response.json();

    console.log('\n✅ RESPONSE FROM DEPLOYED LIZA:\n');
    console.log(data.response || data);

    if (data.response && data.response.includes('$2.45')) {
      console.log('\n✅ TEST PASSED - Deployed portfolio handler works!');
    } else if (data.response && (data.response.includes('portfolio') || data.response.includes('SOL'))) {
      console.log('\n✅ TEST PASSED - Portfolio response received!');
    } else {
      console.log('\n⚠️  Response received but may not be portfolio data');
    }
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

testDeployedChatAPI();
