/**
 * API Route: /api/portfolio
 * Vercel Serverless Function - Analyzes Solana wallet portfolio
 */

import type { VercelRequest, VercelResponse } from "@vercel/node";
import { analyzePortfolio, formatPortfolioDisplay } from './portfolio-inline';

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

    console.log('[Portfolio] Method:', req.method);
    console.log('[Portfolio] Body:', JSON.stringify(req.body));
    console.log('[Portfolio] Query:', JSON.stringify(req.query));

    if (req.method === 'POST') {
      walletAddress = req.body?.walletAddress || '';
    } else if (req.method === 'GET') {
      walletAddress = (req.query.wallet as string) || '';
    } else {
      res.status(405).json({ error: 'Method not allowed' });
      return;
    }

    console.log('[Portfolio] Raw wallet input:', walletAddress);

    if (!walletAddress) {
      res.status(400).json({
        success: false,
        error: 'walletAddress is required',
        received: walletAddress,
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

    console.log('[Portfolio] Cleaned wallet:', walletAddress);
    console.log('[Portfolio] Cleaned length:', walletAddress.length);

    // Validate base58 format (accept mixed case - Solana addresses)
    // Solana uses base58 which includes: 123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz
    const base58Regex = /^[1-9A-HJ-NP-Za-km-z]{44}$/;
    const isValid = base58Regex.test(walletAddress);
    console.log('[Portfolio] Valid format?', isValid);

    if (!isValid) {
      res.status(400).json({
        success: false,
        error: 'Invalid Solana wallet address format',
        received: walletAddress,
        length: walletAddress.length,
      });
      return;
    }

    // Import portfolio analytics - should be in same folder on Vercel
    // Now using inline version to avoid import issues on Vercel

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
    
    // Return helpful error response
    res.status(500).json({
      success: false,
      error: message,
      explorer: `https://explorer.solana.com/address/${req.body?.walletAddress || req.query.wallet}`,
    });
  }
}
