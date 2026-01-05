/**
 * API Route: /api/portfolio
 * Vercel Serverless Function - Analyzes Solana wallet portfolio
 */

import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // Get wallet address from POST body or GET query
    let walletAddress = '';

    if (req.method === 'POST') {
      walletAddress = req.body?.walletAddress || '';
    } else if (req.method === 'GET') {
      walletAddress = (req.query.wallet as string) || '';
    } else {
      res.status(405).json({ error: 'Method not allowed' });
      return;
    }

    if (!walletAddress) {
      res.status(400).json({
        success: false,
        error: 'walletAddress is required',
      });
      return;
    }

    // Clean wallet address
    walletAddress = String(walletAddress)
      .trim()
      .replace(/[()]/g, '')
      .replace(/\s+/g, '')
      .replace(/truncated/gi, '')
      .trim();

    console.log('[Portfolio] Wallet:', walletAddress);

    // Validate base58 format
    const base58Regex = /^[1-9A-HJ-NP-Z]{44}$/;
    if (!base58Regex.test(walletAddress)) {
      res.status(400).json({
        success: false,
        error: 'Invalid Solana wallet address format',
      });
      return;
    }

    // Import portfolio analytics
    const { analyzePortfolio, formatPortfolioDisplay } = await import(
      '../src/api/portfolio-analytics'
    );

    // Get RPC URL
    const rpcUrl = process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';

    console.log('[Portfolio] Analyzing...');

    // Analyze portfolio
    const portfolio = await analyzePortfolio(walletAddress, rpcUrl);

    // Format display
    const display = formatPortfolioDisplay(portfolio);

    console.log('[Portfolio] Complete:', {
      value: portfolio.totalValueUSD,
      tokens: portfolio.tokenCount,
    });

    res.status(200).json({
      success: true,
      data: portfolio,
      display: display,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Portfolio] Error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      success: false,
      error: message,
    });
  }
}
