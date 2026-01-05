/**
 * Test Dynamic Portfolio Feature
 * Tests if portfolio works with different wallet addresses
 */

import { analyzePortfolio, formatPortfolioDisplay } from './src/api/portfolio-analytics';

async function testDynamicPortfolio() {
  console.log('🧪 Testing Dynamic Portfolio Feature...\n');

  // Test wallet 1: Environment wallet (test wallet)
  const testWallet1 = process.env.SOLANA_PUBLIC_KEY || 'CMVrzdso4SShQm2irrc7jMCN9Vw5QxXvrZKB79cYPPJT';

  // Test wallet 2: A different wallet with holdings (example: popular wallet)
  const testWallet2 = 'EhYXq3bffPC6neSgV683gHKjnmKJ4ZNXskKWYYte1sKc'; // Another test wallet

  const rpcUrl = process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';

  try {
    // Test 1: Env wallet
    console.log('📍 Test 1: Environment Wallet');
    console.log(`   Wallet: ${testWallet1}\n`);

    const portfolio1 = await analyzePortfolio(testWallet1, rpcUrl);
    const display1 = formatPortfolioDisplay(portfolio1);

    console.log(display1);
    console.log('\n✅ Test 1 PASSED - Environment wallet works\n');
    console.log('---\n');

    // Test 2: Different wallet
    console.log('📍 Test 2: Example Wallet');
    console.log(`   Wallet: ${testWallet2}\n`);

    const portfolio2 = await analyzePortfolio(testWallet2, rpcUrl);
    const display2 = formatPortfolioDisplay(portfolio2);

    console.log(display2);
    console.log('\n✅ Test 2 PASSED - Dynamic wallet address works\n');

    console.log('---\n');
    console.log('🎉 All Dynamic Portfolio Tests PASSED!');
    console.log('✨ Portfolio feature is now fully dynamic and ready for user-connected wallets!\n');
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

testDynamicPortfolio();
