// Quick test to verify environment variables
console.log('Testing Environment Variables...\n');

const required = [
  'SOLANA_RPC_URL',
  'SOLANA_NETWORK',
  'JUPITER_API_URL',
  'JUPITER_API_KEY'
];

const optional = [
  'SOLANA_PUBLIC_KEY',
  'SOLANA_PRIVATE_KEY'
];

console.log('Required Variables:');
required.forEach(key => {
  const value = process.env[key];
  if (value) {
    console.log(`✅ ${key}: ${value.substring(0, 30)}...`);
  } else {
    console.log(`❌ ${key}: NOT SET`);
  }
});

console.log('\nOptional Variables:');
optional.forEach(key => {
  const value = process.env[key];
  if (value) {
    console.log(`✅ ${key}: ${value.substring(0, 20)}...`);
  } else {
    console.log(`⚠️  ${key}: NOT SET (optional)`);
  }
});

console.log('\n✅ Environment check complete!');

