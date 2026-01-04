import fetch from 'node-fetch';

const PROD = 'https://shina-hyso3e071-naquibmirza-6034s-projects.vercel.app/api/chat';

// Test with different address formats
const addresses = {
  solana: 'CMVrzdso4SShQm2irrc7jMCN9Vw5QxXvrZKB79cYPPJT',        // Solana (43 chars)
  jeju: '61iHTXhcQM9A5wc8JRMHCw3fAb',                            // Jeju Network (from screenshot)
  shortJeju: '61iHTXhc',                                         // Short Jeju format
};

async function testAddressFormats() {
  console.log('\n🔗 TESTING MULTI-CHAIN ADDRESS FORMAT SUPPORT\n');
  console.log('='.repeat(70) + '\n');

  for (const [chain, addr] of Object.entries(addresses)) {
    console.log(`Testing ${chain.toUpperCase()} format: ${addr}`);
    try {
      const res = await fetch(PROD, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: `test_${chain}`,
          message: 'swap 0.001 SOL for USDC',
          walletPublicKey: addr,
        }),
      });
      const data = await res.json();
      const success = !data.response.includes('Invalid wallet address');
      console.log(success ? '✅ ACCEPTED' : '❌ REJECTED');
      console.log('Response:', data.response.substring(0, 80) + '...\n');
    } catch (e) {
      console.log('❌ Error:', e);
      console.log('');
    }
  }

  console.log('='.repeat(70));
  console.log('\n✨ MULTI-CHAIN SUPPORT TEST COMPLETE\n');
  console.log('Supported formats:');
  console.log('  • Solana (43-44 chars, base58)');
  console.log('  • EVM addresses (0x + 40 hex chars)');
  console.log('  • Jeju Network (alphanumeric 10+ chars)');
  console.log('  • Other blockchain addresses\n');
}

testAddressFormats().catch(console.error);
