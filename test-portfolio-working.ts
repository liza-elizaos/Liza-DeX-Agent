#!/usr/bin/env bun
/**
 * Test Portfolio Feature with Private Key
 * Testing locally before Vercel deployment
 */

import { analyzePortfolio, formatPortfolioDisplay } from './src/api/portfolio-analytics';

async function testPortfolio() {
  try {
    console.log('🧪 Testing Portfolio Feature...\n');

    // Use wallet from .env
    const walletAddress = process.env.SOLANA_PUBLIC_KEY || 'CMVrzdso4SShQm2irrc7jMCN9Vw5QxXvrZKB79cYPPJT';
    const rpcUrl = process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';

    console.log('📍 Wallet Address:', walletAddress);
    console.log('🔗 RPC URL:', rpcUrl);
    console.log('\n🔄 Analyzing portfolio...\n');

    // Call the portfolio analyzer
    const portfolio = await analyzePortfolio(walletAddress, rpcUrl);

    console.log('✅ Portfolio Analysis Complete!\n');

    // Display formatted portfolio
    const display = formatPortfolioDisplay(portfolio);
    console.log(display);

    // Raw data
    console.log('\n📊 Raw Portfolio Data:');
    console.log(JSON.stringify(portfolio, null, 2));

    console.log('\n✅ TEST PASSED - Portfolio feature is working!');
    return true;
  } catch (error) {
    console.error('❌ TEST FAILED:', error);
    return false;
  }
}

// Run test
const result = await testPortfolio();
process.exit(result ? 0 : 1);
