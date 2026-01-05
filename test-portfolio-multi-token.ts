// Test with a wallet known to have tokens
const api = 'https://shina-ten.vercel.app/api/portfolio';

// A wallet with known holdings
const walletWithTokens = '9B5X5wUhJ7vUguok7hvjoe5S3fqKUMVHTJXmucjnmY6'; // Known to have USDC, USDT

console.log('🧪 Testing Portfolio with Token Support\n');
console.log('Testing wallet:', walletWithTokens);

const response = await fetch(api, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ walletAddress: walletWithTokens })
});

const data = await response.json();

if (!data.success) {
  console.log('❌ Error:', data.error);
} else {
  console.log('\n✅ Response Status:', response.status);
  console.log('Total Value:', data.data?.totalValueUSD ? `$${data.data.totalValueUSD.toFixed(2)}` : 'N/A');
  console.log('Token Count:', data.data?.tokenCount);
  console.log('SOL Balance:', data.data?.solBalance ? `${data.data.solBalance.toFixed(6)} SOL` : 'N/A');
  console.log('Other Tokens Found:', data.data?.tokens?.length || 0);

  if (data.data?.tokens && data.data.tokens.length > 0) {
    console.log('\n📈 Tokens:');
    data.data.tokens.forEach((t, i) => {
      console.log(`  ${i + 1}. ${t.symbol}: ${t.balance.toFixed(6)} = $${t.valueUSD.toFixed(2)}`);
    });
  }

  if (data.display) {
    console.log('\n📋 Display:');
    console.log(data.display);
  }
}
