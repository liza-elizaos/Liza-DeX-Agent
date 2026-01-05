import { analyzePortfolio, formatPortfolioDisplay } from './src/api/portfolio-analytics';

async function main() {
  try {
    console.log('🚀 Testing Portfolio Analytics with Alternative RPC\n');
    console.log('═══════════════════════════════════════\n');

    // User's wallet
    const walletAddress = 'CMVrzdso4SShQm2irrc7jMCN9Vw5QxXvrZKB79cYPPJT';
    
    // Try with public mainnet RPC (free tier)
    const rpcUrl = 'https://api.mainnet-beta.solana.com';

    console.log(`Wallet Address: ${walletAddress}`);
    console.log(`RPC URL: ${rpcUrl}\n`);

    // Analyze portfolio
    console.log('📊 Analyzing portfolio...\n');
    const portfolio = await analyzePortfolio(walletAddress, rpcUrl);

    // Display results
    console.log(formatPortfolioDisplay(portfolio));
    console.log('\n═══════════════════════════════════════\n');

    // Detailed summary
    console.log('📊 **Portfolio Summary:**');
    console.log(`├─ Total Value: $${portfolio.totalValueUSD.toFixed(2)}`);
    console.log(`├─ Total Tokens: ${portfolio.tokenCount}`);
    console.log(`├─ SOL Balance: ${portfolio.solBalance} SOL`);
    console.log(`├─ Timestamp: ${portfolio.timestamp}`);
    console.log(`└─ Status: ✅ Analysis Complete\n`);

  } catch (error) {
    console.error('❌ Error analyzing portfolio:', error);
    process.exit(1);
  }
}

main();
