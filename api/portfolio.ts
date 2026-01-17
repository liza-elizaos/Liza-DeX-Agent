import { VercelRequest, VercelResponse } from '@vercel/node';
import { Connection, PublicKey } from '@solana/web3.js';

function formatPortfolioDisplay(portfolio: any): string {
  let display = `📊 **Portfolio Summary**\n`;
  display += `━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
  display += `💰 **Total Value**: $${portfolio.totalValueUSD.toFixed(2)}\n`;
  display += `📈 **Token Count**: ${portfolio.tokenCount}\n\n`;
  display += `**SOL Holdings:**\n`;
  display += `├─ Amount: ${portfolio.solBalance.toFixed(6)} SOL\n`;
  display += `└─ Value: $${portfolio.solValueUSD.toFixed(2)}\n\n`;
  if (portfolio.tokens?.length > 0) {
    display += `**Holdings:**\n`;
    portfolio.tokens.forEach((t: any, i: number) => {
      if (t.symbol !== 'SOL') {
        display += `├─ ${t.symbol}: $${t.valueUSD.toFixed(2)}\n`;
      }
    });
  }
  return display;
}

async function analyzePortfolio(walletAddress: string, rpcUrl: string) {
  const connection = new Connection(rpcUrl, 'confirmed');
  const publicKey = new PublicKey(walletAddress);

  try {
    const balanceLamports = await connection.getBalance(publicKey);
    const solBalance = balanceLamports / 1e9;
    const solPrice = 196; // Default SOL price
    const solValueUSD = solBalance * solPrice;

    return {
      walletAddress,
      totalValueUSD: solValueUSD,
      solBalance,
      solValueUSD,
      tokenCount: 1,
      tokens: [{
        mint: 'So11111111111111111111111111111111111111112',
        symbol: 'SOL',
        balance: solBalance,
        decimals: 9,
        valueUSD: solValueUSD
      }],
      topTokens: [],
      portfolioComposition: [{
        symbol: 'SOL',
        percentage: 100,
        usdValue: solValueUSD
      }],
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    throw error;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    let walletAddress = '';

    if (req.method === 'POST') {
      walletAddress = req.body?.walletAddress || '';
    } else if (req.method === 'GET') {
      walletAddress = (req.query.wallet as string) || '';
    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    if (!walletAddress) {
      return res.status(400).json({ success: false, error: 'walletAddress is required' });
    }

    walletAddress = String(walletAddress)
      .trim()
      .replace(/[()]/g, '')
      .replace(/\s+/g, '')
      .replace(/truncated/gi, '')
      .trim();

    const base58Regex = /^[1-9A-HJ-NP-Za-km-z]{44}$/;
    if (!base58Regex.test(walletAddress)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid Solana wallet address format',
        received: walletAddress,
      });
    }

    const rpcUrl = process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';
    const portfolio = await analyzePortfolio(walletAddress, rpcUrl);
    const display = formatPortfolioDisplay(portfolio);

    return res.status(200).json({
      success: true,
      data: portfolio,
      display: display,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Portfolio] Error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';

    return res.status(500).json({
      success: false,
      error: message,
    });
  }
}
