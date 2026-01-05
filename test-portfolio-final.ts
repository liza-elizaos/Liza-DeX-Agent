// Test with known valid addresses
const api = 'https://shina-ten.vercel.app/api/portfolio';

// Definitely valid addresses
const addresses = [
  '6i1HTXhcxreAEys8QMEvnB1FNpNVwombS61QcwquJb1f', // Our test wallet (has SOL only)
  'TokenkegQfeZyiNwAJsyFbPVwwQQfuM32jneSYP1daB',  // Token program (should fail validation but good test)
];

console.log('🧪 Testing Portfolio API - Enhanced Token Fetching\n');

for (const wallet of addresses) {
  console.log(`\n📍 Testing: ${wallet}`);
  console.log('─'.repeat(60));
  
  const response = await fetch(api, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ walletAddress: wallet })
  });

  const data = await response.json();

  if (!data.success) {
    console.log('❌ Error:', data.error);
    continue;
  }

  console.log('✅ Status:', response.status);
  console.log(`💰 Total Value: $${data.data?.totalValueUSD?.toFixed(2) || '0.00'}`);
  console.log(`🪙 Token Count: ${data.data?.tokenCount || 0}`);
  console.log(`◎ SOL Balance: ${data.data?.solBalance?.toFixed(6) || '0.000000'} SOL`);
  
  if (data.data?.tokens && data.data.tokens.length > 0) {
    console.log(`\n📈 Other Tokens (${data.data.tokens.length}):`);
    data.data.tokens.forEach((t, i) => {
      console.log(`   ${i + 1}. ${t.symbol}: ${t.balance.toFixed(6)} = $${t.valueUSD.toFixed(2)}`);
    });
  } else {
    console.log('\n📈 Other Tokens: None');
  }
}

console.log('\n' + '='.repeat(60));
console.log('✅ Portfolio API Enhanced with Token Support!');
