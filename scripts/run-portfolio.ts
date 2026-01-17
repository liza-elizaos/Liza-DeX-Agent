#!/usr/bin/env bun
import { analyzePortfolio, formatPortfolioDisplay } from '../src/api/portfolio-analytics';

const wallet = process.argv[2] || process.env.SOLANA_PUBLIC_KEY || 'CMVrzdso4SShQm2irrc7jMCN9Vw5QxXvrZKB79cYPPJT';
const rpc = process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';

(async () => {
  try {
    console.log(`[run-portfolio] Running analysis for ${wallet} using RPC ${rpc}`);
    const portfolio = await analyzePortfolio(wallet, rpc);

    // Print raw JSON
    console.log(JSON.stringify({ success: true, data: portfolio }, null, 2));

    // Print formatted display
    console.log('\nFormatted display:\n');
    console.log(formatPortfolioDisplay(portfolio));
  } catch (err) {
    console.error('[run-portfolio] Error:', err instanceof Error ? err.message : err);
    process.exit(1);
  }
})();
