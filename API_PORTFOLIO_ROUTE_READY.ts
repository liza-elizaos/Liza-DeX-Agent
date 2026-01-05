/**
 * API Route: /api/portfolio
 * Location: api/portfolio.ts
 * 
 * This route connects the Portfolio Analytics feature to LIZA
 * Handles requests from both v0.dev component and chat
 */

import { analyzePortfolio, formatPortfolioDisplay } from '../src/api/portfolio-analytics';

export default async function handler(req, res) {
  // Only accept POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { walletAddress } = req.body;

    // Validate wallet address
    if (!walletAddress) {
      return res.status(400).json({
        success: false,
        error: 'walletAddress is required',
      });
    }

    // Validate it looks like a Solana address (base58, 44 chars)
    if (!/^[1-9A-HJ-NP-Z]{44}$/.test(walletAddress)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid Solana wallet address',
      });
    }

    // Get RPC URL from environment
    const rpcUrl = process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';

    // Analyze portfolio
    const portfolio = await analyzePortfolio(walletAddress, rpcUrl);

    // Return portfolio data
    return res.status(200).json({
      success: true,
      data: portfolio,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[API] Portfolio error:', error);

    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to analyze portfolio',
    });
  }
}

/**
 * INSTALLATION STEPS:
 * 
 * 1. Create file: api/portfolio.ts (in your project root /api folder)
 * 2. Paste this entire code
 * 3. The route will automatically be available at: POST /api/portfolio
 * 4. Send requests with body: { "walletAddress": "..." }
 * 
 * EXAMPLE REQUEST:
 * 
 * fetch('/api/portfolio', {
 *   method: 'POST',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify({
 *     walletAddress: 'CMVrzdso4SShQm2irrc7jMCN9Vw5QxXvrZKB79cYPPJT'
 *   })
 * })
 * 
 * EXAMPLE RESPONSE:
 * 
 * {
 *   "success": true,
 *   "data": {
 *     "totalValueUSD": 1234.56,
 *     "solBalance": 1.5,
 *     "solValueUSD": 450.00,
 *     "tokenCount": 5,
 *     "tokens": [
 *       {
 *         "symbol": "SOL",
 *         "mint": "...",
 *         "balance": 1.5,
 *         "valueUSD": 450.00,
 *         "percentage": 36.5
 *       },
 *       ...
 *     ],
 *     "timestamp": "2026-01-04T15:30:00Z"
 *   },
 *   "timestamp": "2026-01-04T15:30:01Z"
 * }
 */
