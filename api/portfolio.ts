/**
 * API Route: /api/portfolio
 * Vercel Serverless Function - Analyzes Solana wallet portfolio
 * FULLY SELF-CONTAINED - No external imports except @solana/web3.js
 */

import type { VercelRequest, VercelResponse } from "@vercel/node";
import { Connection, PublicKey } from '@solana/web3.js';
import axios from 'axios';

// ==================== TYPES ====================
interface TokenBalance {
  mint: string;
  symbol: string;
  balance: number;
  decimals: number;
  valueUSD: number;
}

interface PortfolioSummary {
  walletAddress: string;
  totalValueUSD: number;
  solBalance: number;
  solValueUSD: number;
  tokenCount: number;
  tokens: TokenBalance[];
  topTokens: any[];
  portfolioComposition: any[];
  timestamp: string;
}

// Price cache
const priceCache: Record<string, { price: number; timestamp: number }> = {};
const CACHE_TTL = 5 * 60 * 1000;

// ==================== FUNCTIONS ====================

async function analyzePortfolio(
  walletAddress: string,
  rpcUrl: string
): Promise<PortfolioSummary> {
  console.log(`[PORTFOLIO] Starting portfolio analysis for: ${walletAddress}`);
  console.log(`[PORTFOLIO] Using RPC: ${rpcUrl.substring(0, 50)}...`);

  const connection = new Connection(rpcUrl, 'confirmed');

  // Get SOL balance
  console.log('[PORTFOLIO] Fetching SOL balance...');
  let solBalance = 0;
  try {
    const publicKey = new PublicKey(walletAddress);
    solBalance = await connection.getBalance(publicKey);
    solBalance = solBalance / 1e9;
  } catch (error) {
    console.error('[PORTFOLIO] Error fetching SOL balance:', error);
  }

  console.log(`[PORTFOLIO] SOL Balance: ${solBalance} SOL`);

  // Get SOL price (simplified)
  let solPrice = 196;
  try {
    const response = await axios.get('https://api.jup.ag/price?ids=So11111111111111111111111111111111111111112', { timeout: 5000 });
    solPrice = response.data?.data?.['So11111111111111111111111111111111111111112']?.price || 196;
  } catch (error) {
    console.log('[PORTFOLIO] Using default SOL price: $196');
  }

  console.log(`[PORTFOLIO] SOL Price: $${solPrice}`);
  const solValueUSD = solBalance * solPrice;
  console.log(`[PORTFOLIO] SOL Value: $${solValueUSD.toFixed(2)}`);

  // Token accounts
  console.log('[PORTFOLIO] Fetching token accounts...');
  const tokens: TokenBalance[] = [];
  
  try {
    const publicKey = new PublicKey(walletAddress);
    
    // Use getProgramAccounts to find all token accounts
    // This is more compatible with Alchemy
    const filters = [
      {
        dataSize: 165, // Token account size
      },
      {
        memcmp: {
          offset: 32, // Owner address offset in token account
          bytes: publicKey.toBase58(),
        },
      },
    ];

    const tokenAccounts = await connection.getProgramAccounts(
      new PublicKey('TokenkegQfeZyiNwAJsyFbPVwwQQfuM32jneSYP1daB'),
      {
        filters,
        encoding: 'jsonParsed',
      }
    );

    console.log(`[PORTFOLIO] Found ${tokenAccounts.length} token accounts`);

    // Common token mappings
    const tokenMap: Record<string, string> = {
      'EPjFWaLb3crJC2z8rxVmE4Gnjg1d4PjNiYq4a8JqkEH': 'USDC',
      'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BcJkxN': 'USDT',
      'mSoLzYCxHdgfd3DgZjwwzG8DUR6azJstEWQcW2UCb9': 'mSOL',
      'MangoCzJ36AjZyKwVj3VnYU4GTonjfVEnJmvvWaxLac': 'MANGO',
      'Kin3gmeNyStCG9kD9B7A6Cq9u3vf3S3PgVCHvRAXVs1': 'KIN',
      'UXPhBoR3qMCSVtL4Yntjg3Ufty5rVJd6QPanrVnrgEU': 'UXP',
      'Fkz3TqvIYi2xhYv2wnxkfzv3QV5a8jNfbSJpjCL3V9Q': 'WSB',
      '11111111111111111111111111111111': 'SOL_WRAPPED',
    };

    // Process each token account
    for (const tokenAccount of tokenAccounts) {
      try {
        const parsedInfo = (tokenAccount.account.data as any)?.parsed?.info;
        if (!parsedInfo) continue;

        const mint = parsedInfo.mint;
        const balance = parsedInfo.tokenAmount?.uiAmount || 0;
        const decimals = parsedInfo.tokenAmount?.decimals || 6;

        if (balance <= 0) continue; // Skip zero balances

        // Get token symbol
        let symbol = tokenMap[mint] || `${mint.substring(0, 6).toUpperCase()}`;

        // Try to get price from Jupiter
        let price = 0;
        try {
          const priceResponse = await axios.get(
            `https://api.jup.ag/price?ids=${mint}`,
            { timeout: 3000 }
          );
          price = priceResponse.data?.data?.[mint]?.price || 0;
        } catch (e) {
          console.log(`[PORTFOLIO] Could not fetch price for ${symbol}`);
        }

        const valueUSD = balance * price;

        if (valueUSD > 0.01) { // Only include tokens with >$0.01 value
          tokens.push({
            mint,
            symbol,
            balance,
            decimals,
            valueUSD,
          });
        }
      } catch (err) {
        console.log(`[PORTFOLIO] Error processing token account:`, err instanceof Error ? err.message : 'Error');
      }
    }

    // Sort by value
    tokens.sort((a, b) => b.valueUSD - a.valueUSD);
    console.log(`[PORTFOLIO] Found ${tokens.length} valuable tokens`);
  } catch (error) {
    console.log('[PORTFOLIO] Could not fetch token accounts (non-critical):', error instanceof Error ? error.message : 'Unknown error');
  }

  // Build summary
  const totalValueUSD = solValueUSD + tokens.reduce((sum, t) => sum + t.valueUSD, 0);
  const tokenCount = tokens.length + 1;

  console.log('[PORTFOLIO] ✅ Analysis complete!');
  console.log(`[PORTFOLIO] Total Portfolio Value: $${totalValueUSD.toFixed(2)}`);

  const portfolioComposition = [
    { symbol: 'SOL', percentage: 100, usdValue: solValueUSD },
    ...tokens.map(t => ({
      symbol: t.symbol,
      percentage: totalValueUSD > 0 ? (t.valueUSD / totalValueUSD) * 100 : 0,
      usdValue: t.valueUSD,
    })),
  ];

  return {
    walletAddress,
    totalValueUSD,
    solBalance,
    solValueUSD,
    tokenCount,
    tokens,
    topTokens: tokens.slice(0, 5),
    portfolioComposition,
    timestamp: new Date().toISOString(),
  };
}

function formatPortfolioDisplay(portfolio: PortfolioSummary): string {
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
  const formatNumber = (value: number) => value.toLocaleString('en-US', { maximumFractionDigits: 8 });

  let display = `📊 **Portfolio Summary**\n`;
  display += `━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
  display += `💰 **Total Value**: ${formatCurrency(portfolio.totalValueUSD)}\n`;
  display += `📈 **Token Count**: ${portfolio.tokenCount}\n\n`;
  display += `**SOL Holdings:**\n`;
  display += `├─ Amount: ${formatNumber(portfolio.solBalance)} SOL\n`;
  display += `└─ Value: ${formatCurrency(portfolio.solValueUSD)}\n\n`;

  if (portfolio.tokens.length > 0) {
    display += `**Other Tokens:**\n`;
    portfolio.tokens.forEach((token, i) => {
      const isLast = i === portfolio.tokens.length - 1;
      display += `${isLast ? '└─' : '├─'} ${token.symbol}: ${formatNumber(token.balance)} = ${formatCurrency(token.valueUSD)}\n`;
    });
    display += '\n';
  }

  display += `**Portfolio Composition:**\n`;
  portfolio.portfolioComposition.forEach((item, i) => {
    const isLast = i === portfolio.portfolioComposition.length - 1;
    display += `${isLast ? '└─' : '├─'} ${item.symbol}: ${item.percentage.toFixed(2)}%\n`;
  });

  return display;
}

// ==================== API HANDLER ====================

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
    // Get wallet address
    let walletAddress = '';
    console.log('[Portfolio] Method:', req.method);

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
      res.status(400).json({ success: false, error: 'walletAddress is required' });
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

    // Validate base58 format
    const base58Regex = /^[1-9A-HJ-NP-Za-km-z]{44}$/;
    if (!base58Regex.test(walletAddress)) {
      res.status(400).json({
        success: false,
        error: 'Invalid Solana wallet address format',
        received: walletAddress,
      });
      return;
    }

    // Get RPC URL
    const rpcUrl = process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';

    console.log('[Portfolio] Analyzing...');

    // Analyze portfolio
    const portfolio = await analyzePortfolio(walletAddress, rpcUrl);
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
      explorer: `https://explorer.solana.com/address/${req.body?.walletAddress || req.query.wallet}`,
    });
  }
}
