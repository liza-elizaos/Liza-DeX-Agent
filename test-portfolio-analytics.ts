/**
 * Test Portfolio Analytics Feature
 * 
 * This test verifies the Portfolio Analytics feature works correctly
 * before deploying to production.
 * 
 * Run with: bun test-portfolio-analytics.ts
 */

import { analyzePortfolio, formatPortfolioDisplay, exportPortfolio } from './src/api/portfolio-analytics';

async function testPortfolioAnalytics() {
  console.log('🧪 Testing Portfolio Analytics Feature\n');
  console.log('=' .repeat(60) + '\n');

  // Test wallet - LIZA's main wallet
  const testWallet = process.env.SOLANA_PUBLIC_KEY || 'CMVrzdso4SShQm2irrc7jMCN9Vw5QxXvrZKB79cYPPJT';
  const rpcUrl = process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';

  try {
    console.log(`📍 Testing with wallet: ${testWallet}\n`);
    console.log(`🌐 RPC Endpoint: ${rpcUrl}\n`);
    console.log('⏳ Fetching portfolio data...\n');

    // Call portfolio analytics
    const portfolio = await analyzePortfolio(testWallet, rpcUrl);

    console.log('✅ Portfolio fetched successfully!\n');
    console.log('=' .repeat(60) + '\n');

    // Display formatted portfolio
    const formattedDisplay = formatPortfolioDisplay(portfolio);
    console.log(formattedDisplay);

    console.log('\n' + '=' .repeat(60) + '\n');

    // Show detailed data
    console.log('📊 Detailed Data:\n');
    console.log(`Total Tokens: ${portfolio.tokenCount}`);
    console.log(`Total Value: $${portfolio.totalValueUSD.toFixed(2)}`);
    console.log(`SOL Balance: ${portfolio.solBalance.SOL.toFixed(4)} SOL`);
    console.log(`SOL Value: $${portfolio.solBalance.USD.toFixed(2)}\n`);

    // Show all tokens
    if (portfolio.tokens.length > 0) {
      console.log('All Tokens:');
      for (const token of portfolio.tokens) {
        console.log(`  - ${token.symbol}: ${token.balance.toFixed(6)} = $${token.valueUSD.toFixed(2)}`);
      }
    } else {
      console.log('No additional tokens found (only SOL)');
    }

    console.log('\n' + '=' .repeat(60) + '\n');
    console.log('✅ Test completed successfully!\n');

    // Option to export
    if (process.env.EXPORT_PORTFOLIO === 'true') {
      const jsonExport = exportPortfolio(portfolio);
      console.log('📄 Portfolio JSON Export:\n');
      console.log(jsonExport);
    }

    return true;
  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error('\nTroubleshooting:');
    console.error('1. Check your SOLANA_RPC_URL environment variable');
    console.error('2. Verify internet connection to Solana network');
    console.error('3. Make sure wallet address is valid: ' + testWallet);
    return false;
  }
}

// Run the test
console.log('\n🚀 Starting Portfolio Analytics Test\n');
const success = await testPortfolioAnalytics();
process.exit(success ? 0 : 1);
