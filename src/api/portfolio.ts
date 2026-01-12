/**
 * API Route: /api/portfolio
 * Location: src/api/portfolio.ts
 * 
 * Analyzes Solana wallet portfolio with real-time pricing
 * Fixes Phantom wallet address format issues
 */

import { analyzePortfolio, formatPortfolioDisplay } from './portfolio-analytics';

export async function POST(req: any) {
  try {
    const body = await req.json();
    let { walletAddress } = body;

    console.log('[Portfolio API] Received request:', { walletAddress, type: typeof walletAddress });

    // Validate wallet address exists
    if (!walletAddress) {
      // Try to use env wallet as fallback
      walletAddress = process.env.SOLANA_PUBLIC_KEY;
      if (!walletAddress) {
        return Response.json(
          {
            success: false,
            error: 'walletAddress is required (provide in body or set SOLANA_PUBLIC_KEY)',
          },
          { status: 400 }
        );
      }
      console.log('[Portfolio API] Using env wallet as fallback');
    }

    // Clean wallet address (remove parentheses, whitespace, etc)
    walletAddress = String(walletAddress)
      .trim()
      .replace(/[()]/g, '') // Remove parentheses
      .replace(/\s+/g, '') // Remove whitespace
      .replace(/truncated/gi, '') // Remove "truncated" text
      .trim();

    console.log('[Portfolio API] Cleaned wallet:', walletAddress);

    // Validate base58 format (Solana addresses are 44 char base58)
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

export async function GET(req: any) {
  try {
    const url = new URL(req.url);
    let walletAddress = url.searchParams.get('wallet');

    if (!walletAddress) {
      return Response.json(
        { success: false, error: 'wallet query parameter required' },
        { status: 400 }
      );
    }

    // Clean and validate
    walletAddress = String(walletAddress)
      .trim()
      .replace(/[()]/g, '')
      .replace(/\s+/g, '')
      .trim();

    const base58Regex = /^[1-9A-HJ-NP-Z]{44}$/;
    if (!base58Regex.test(walletAddress)) {
      return Response.json(
        { success: false, error: `Invalid wallet address: ${walletAddress}` },
        { status: 400 }
      );
    }

    const rpcUrl = process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';
    const portfolio = await analyzePortfolio(walletAddress, rpcUrl);

    return Response.json({
      success: true,
      data: portfolio,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Portfolio API] Error:', error);
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to analyze portfolio',
      },
      { status: 500 }
    );
  }
}
