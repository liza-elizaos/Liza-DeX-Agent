// Test portfolio with token fetching
const api = 'https://shina-ten.vercel.app/api/portfolio';

// Test with original wallet
const wallet1 = '6i1HTXhcxreAEys8QMEvnB1FNpNVwombS61QcwquJb1f';

// Known wallet with lots of tokens
const wallet2 = '2b1kQm6CJS2iQKkSLnc3EYYjVGnDisQKzSXaBXRzLqJ'; // Example wallet with tokens

console.log('🧪 Testing Portfolio API - Full Token Support\n');
console.log('Wallet 1 (test):', wallet1);

const response = await fetch(api, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ walletAddress: wallet1 })
});

const data = await response.json();

console.log('\n📊 Response:');
console.log('Status:', response.status);
console.log('Success:', data.success);
console.log('\n💰 Portfolio Summary:');
console.log('Total Value:', data.data?.totalValueUSD ? `$${data.data.totalValueUSD.toFixed(2)}` : 'N/A');
console.log('Token Count:', data.data?.tokenCount || 0);
console.log('SOL Balance:', data.data?.solBalance ? `${data.data.solBalance.toFixed(6)} SOL` : 'N/A');
console.log('\n📈 Tokens Found:', data.data?.tokens?.length || 0);

if (data.data?.tokens && data.data.tokens.length > 0) {
  console.log('\n✅ Other Tokens:');
  data.data.tokens.forEach(t => {
    console.log(`  ${t.symbol}: ${t.balance.toFixed(4)} = $${t.valueUSD.toFixed(2)}`);
  });
} else {
  console.log('\n(No other tokens found in this wallet)');
}

if (data.display) {
  console.log('\n📋 Formatted Display:');
  console.log(data.display);
}
