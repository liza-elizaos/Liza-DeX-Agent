const url = 'https://shina-ten.vercel.app';
console.log('🌐 Testing deployed website...\n');

const response = await fetch(url);
const html = await response.text();

// Check if HTML contains expected content
const hasHtml = html.includes('<!DOCTYPE html>') || html.includes('<html');
const hasReact = html.includes('main.js');
const hasCss = html.includes('main.css');

console.log('✅ Status:', response.status);
console.log('✅ Has HTML:', hasHtml);
console.log('✅ Has main.js:', hasReact);
console.log('✅ Has main.css:', hasCss);
console.log('✅ Content length:', html.length, 'bytes');

if (hasHtml && hasReact) {
  console.log('\n✅ Website deployed successfully!');
} else {
  console.log('\n❌ Issue with deployment');
  console.log('\nFirst 500 chars:');
  console.log(html.substring(0, 500));
}
