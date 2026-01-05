import { analyzePortfolio, formatPortfolioDisplay } from './src/api/portfolio-analytics';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function main() {
  try {
    console.log('🚀 Testing Improved Portfolio Analytics\n');
    console.log('═══════════════════════════════════════\n');

    // User's wallet
    const walletAddress = process.env.SOLANA_PUBLIC_KEY || 'CMVrzdso4SShQm2irrc7jMCN9Vw5QxXvrZKB79cYPPJT';
    const rpcUrl = process.env.SOLANA_RPC_URL || 'https://solana-mainnet.g.alchemy.com/v2/pfiW_dJZBV0RjLHK1TgV53sMmLFTcCmX';

    console.log(`Wallet Address: ${walletAddress}`);
    console.log(`RPC URL: ${rpcUrl}\n`);

    // Analyze portfolio
    console.log('📊 Analyzing portfolio...\n');
    const portfolio = await analyzePortfolio(walletAddress, rpcUrl);

    // Display results
    console.log(formatPortfolioDisplay(portfolio));
    console.log('\n═══════════════════════════════════════\n');

    // Detailed token breakdown
    console.log('📋 **Detailed Token Breakdown:**\n');
    
    // Include SOL
    let tokenList = [
      {
        symbol: 'SOL',
        balance: portfolio.solBalance,
        valueUSD: portfolio.solValueUSD,
        decimals: 9,
        mint: 'So11111111111111111111111111111111111111112'
      },
      ...portfolio.topTokens
    ];

    for (const token of tokenList) {
      const pricePerToken = token.balance > 0 ? token.valueUSD / token.balance : 0;
      console.log(`├─ ${token.symbol}`);
      console.log(`│  ├─ Amount: ${token.balance.toFixed(6)}`);
      console.log(`│  ├─ Price per token: $${pricePerToken.toFixed(8)}`);
      console.log(`│  └─ Total Value: $${token.valueUSD.toFixed(2)}\n`);
    }

    // Overall summary
    console.log('\n📊 **Portfolio Summary:**');
    console.log(`├─ Total Value: $${portfolio.totalValueUSD.toFixed(2)}`);
    console.log(`├─ Total Tokens: ${portfolio.tokenCount}`);
    console.log(`├─ Timestamp: ${portfolio.timestamp}`);
    console.log(`└─ Status: ✅ Analysis Complete\n`);

    // JSON export
    console.log('\n📄 **JSON Export:**');
    console.log(JSON.stringify(portfolio, null, 2));

  } catch (error) {
    console.error('❌ Error analyzing portfolio:', error);
    process.exit(1);
  }
}

main();
