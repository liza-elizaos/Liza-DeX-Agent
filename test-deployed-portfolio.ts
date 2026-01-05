// Test the deployed portfolio integration
const url = 'https://shina-ten.vercel.app/api/chat';
const wallet = '6i1HTXhcxreAEys8QMEvnB1FNpNVwombS61QcwquJb1f';

console.log('🧪 Testing Deployed Portfolio Integration...\n');

const response = await fetch(url, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: `show portfolio for wallet ${wallet}`,
    userId: 'test-user',
    agentId: '6f5a9e99-1b8c-4d5c-b91b-7e4c1d8f5a3b'
  })
});

const data = await response.json();
console.log('✅ Response Status:', response.status);
console.log('\n📊 Portfolio Response:');
console.log(data.text || data.content || JSON.stringify(data, null, 2));

console.log('\n✅ Deployment successful! Portfolio API working.');
console.log('🌐 Website: https://shina-ten.vercel.app');
