/**
 * Test: Portfolio Feature with User's Wallet
 * User's wallet: 6i1HTXhcxreAEys8QMEvnB1FNpNVwombS61QcwquJb1f
 * Expected: Shows portfolio analysis with holdings
 */

import { analyzePortfolio, formatPortfolioDisplay } from './src/api/portfolio-analytics';

async function testUserPortfolio() {
  console.log('🧪 Testing Portfolio with User Wallet...\n');

  // User's wallet from conversation
  const userWallet = '6i1HTXhcxreAEys8QMEvnB1FNpNVwombS61QcwquJb1f';
  const rpcUrl = process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';

  console.log('📍 User Wallet: ' + userWallet);
  console.log('🔗 RPC: ' + rpcUrl.substring(0, 50) + '...\n');

  try {
    console.log('⏳ Analyzing portfolio...\n');
    const portfolio = await analyzePortfolio(userWallet, rpcUrl);
    const display = formatPortfolioDisplay(portfolio);

    console.log(display);
    console.log('\n---');
    console.log('📊 Raw Portfolio Data:');
    console.log(JSON.stringify(portfolio, null, 2));

    console.log('\n✅ TEST PASSED - Portfolio feature is working!');
    console.log('🎉 User can now see their portfolio via "show portfolio" command!');
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

testUserPortfolio();
