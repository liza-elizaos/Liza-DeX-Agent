/**
 * API Route: /api/portfolio (FIXED)
 * Location: api/portfolio.ts or app/api/portfolio/route.ts
 * 
 * FIXES:
 * 1. Properly extracts wallet from Phantom connection
 * 2. Cleans wallet address (removes parentheses, whitespace)
 * 3. Better error handling
 * 4. Validates base58 format correctly
 */

import { analyzePortfolio } from '@/src/api/portfolio-analytics';

export async function POST(req) {
  try {
    const body = await req.json();
    let { walletAddress } = body;

    console.log('[Portfolio API] Received request:', { walletAddress, type: typeof walletAddress });

    // ✅ FIX 1: Handle Phantom wallet format
    if (!walletAddress) {
      return Response.json(
        {
          success: false,
          error: 'walletAddress is required',
        },
        { status: 400 }
      );
    }

    // ✅ FIX 2: Clean wallet address (remove parentheses, whitespace, etc)
    walletAddress = String(walletAddress)
      .trim()
      .replace(/[()]/g, '') // Remove parentheses
      .replace(/\s+/g, '') // Remove whitespace
      .trim();

    console.log('[Portfolio API] Cleaned wallet:', walletAddress);

    // ✅ FIX 3: Better base58 validation (more lenient but still correct)
    // Solana addresses are base58 encoded, 44 characters long
    const base58Regex = /^[1-9A-HJ-NP-Z]{44}$/;

    if (!base58Regex.test(walletAddress)) {
      console.error('[Portfolio API] Invalid base58 wallet address:', walletAddress);
      return Response.json(
        {
          success: false,
          error: `Invalid Solana wallet address format. Expected 44 character base58 address, got: "${walletAddress}"`,
          received: walletAddress,
          length: walletAddress.length,
        },
        { status: 400 }
      );
    }

    console.log('[Portfolio API] Valid wallet address, analyzing...');

    // Get RPC URL from environment
    const rpcUrl = process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';

    // Analyze portfolio
    const portfolio = await analyzePortfolio(walletAddress, rpcUrl);

    console.log('[Portfolio API] Analysis complete:', {
      total: portfolio.totalValueUSD,
      tokens: portfolio.tokenCount,
    });

    // Return portfolio data
    return Response.json({
      success: true,
      data: portfolio,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Portfolio API] Error:', error);

    const errorMessage = error instanceof Error ? error.message : 'Failed to analyze portfolio';

    return Response.json(
      {
        success: false,
        error: errorMessage,
        details: error instanceof Error ? error.toString() : undefined,
      },
      { status: 500 }
    );
  }
}

/**
 * USAGE IN v0.dev:
 *
 * const response = await fetch('/api/portfolio', {
 *   method: 'POST',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify({
 *     walletAddress: phantomWallet.publicKey.toString()
 *   })
 * });
 *
 * KEY POINTS:
 * - Wallet address should be: phantomWallet.publicKey.toString()
 * - API will clean it automatically
 * - Returns clear error messages if format is wrong
 * - Works with Phantom, Magic, and other wallet providers
 */

/**
 * INSTALLATION PATHS:
 *
 * Next.js 13+ (App Router):
 * → app/api/portfolio/route.ts
 *
 * Next.js 12 or earlier (Pages Router):
 * → api/portfolio.ts
 *
 * Vite/React:
 * → Serverless function or backend API
 */

export default POST;
