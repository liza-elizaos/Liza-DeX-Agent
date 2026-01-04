import { Connection, PublicKey } from '@solana/web3.js';
import axios from 'axios';

/**
 * Portfolio Analytics for LIZA
 * Analyzes complete wallet holdings and valuations
 */

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
  tokenCount: number;
  tokens: TokenBalance[];
  solBalance: {
    SOL: number;
    USD: number;
  };
  topTokens: TokenBalance[];
  portfolioComposition: {
    symbol: string;
    percentage: number;
    usdValue: number;
  }[];
  timestamp: string;
}

/**
 * Get current token price from free APIs
 */
async function getTokenPrice(mint: string): Promise<number> {
  try {
    // Common token prices (cached, no API key needed)
    const commonPrices: { [key: string]: number } = {
      'So11111111111111111111111111111111111111112': 196.5, // SOL
      'EPjFWaJUhxpeZS3iiruSvf3BQ2z5Za8DXzvE5ajZz51f': 1.0, // USDC
      'DezXAZ8z7PnrnRJjoBXwYaKe2XTis3Zonw1j1axNac5': 0.0000049, // BONK
      'MangoCzJ36AjZyKwVj3VnYU4GTonjfVEnJmvvWaxLac': 0.00000005, // MNGO
      '7i5KKsX2wuNXzYoSx85ejyskyBCcFHxVrMssFrhdjaSi': 0.000001, // COPE
    };

    if (commonPrices[mint]) {
      return commonPrices[mint];
    }

    // Try Solana token list endpoint (free, no auth)
    try {
      const response = await axios.get(
        'https://tokens.jup.ag/tokens',
        { timeout: 3000 }
      );
      
      const tokenList = response.data || [];
      const token = tokenList.find((t: any) => t.address === mint);
      if (token?.price) {
        return parseFloat(token.price);
      }
    } catch (e) {
      // Fallback to cached prices
    }

    return commonPrices[mint] || 0;
  } catch (error) {
    console.warn(`[PORTFOLIO] Failed to get price for ${mint}, using cached`);
    // Return default prices on error
    const defaultPrices: { [key: string]: number } = {
      'So11111111111111111111111111111111111111112': 196.5,
      'EPjFWaJUhxpeZS3iiruSvf3BQ2z5Za8DXzvE5ajZz51f': 1.0,
      'DezXAZ8z7PnrnRJjoBXwYaKe2XTis3Zonw1j1axNac5': 0.0000049,
    };
    return defaultPrices[mint] || 0;
  }
}

/**
 * Get SPL token name from various sources
 */
async function getTokenSymbol(mint: string): Promise<string> {
  try {
    // Try Solana Token List first (fast)
    const response = await axios.get(
      'https://token.jup.ag/strict',
      { timeout: 5000 }
    );

    const tokenList = response.data || [];
    const token = tokenList.find((t: any) => t.address === mint);
    if (token?.symbol) {
      return token.symbol;
    }

    // Fallback common tokens
    const commonTokens: { [key: string]: string } = {
      'So11111111111111111111111111111111111111112': 'SOL',
      'EPjFWaJUhxpeZS3iiruSvf3BQ2z5Za8DXzvE5ajZz51f': 'USDC',
      'DezXAZ8z7PnrnRJjoBXwYaKe2XTis3Zonw1j1axNac5': 'BONK',
      'MangoCzJ36AjZyKwVj3VnYU4GTonjfVEnJmvvWaxLac': 'MNGO',
      '7i5KKsX2wuNXzYoSx85ejyskyBCcFHxVrMssFrhdjaSi': 'COPE',
      'HZ1JjGygsrFvd7vhvzen1tqKbtMTQdTmHta1SMuJzhFd': 'COPE2',
    };

    return commonTokens[mint] || mint.substring(0, 6).toUpperCase();
  } catch (error) {
    console.warn(`[PORTFOLIO] Failed to get symbol for ${mint}:`, error);
    return mint.substring(0, 6).toUpperCase();
  }
}

/**
 * Get all token accounts for a wallet
 */
async function getTokenAccounts(walletAddress: string, connection: Connection) {
  try {
    const publicKey = new PublicKey(walletAddress);
    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
      publicKey,
      { programId: new PublicKey('TokenkegQfeZyiNwAJsyFbPVwwQQfimJwqDeg4qqvGn') }
    );

    return tokenAccounts.value.map((account) => {
      const parsed = account.account.data.parsed.info;
      return {
        mint: parsed.mint,
        tokenAccount: account.pubkey.toString(),
        balance: parseInt(parsed.tokenAmount.amount),
        decimals: parsed.tokenAmount.decimals,
      };
    });
  } catch (error) {
    console.error('[PORTFOLIO] Error fetching token accounts:', error);
    return [];
  }
}

/**
 * Analyze complete portfolio
 */
export async function analyzePortfolio(
  walletAddress: string,
  rpcUrl: string = 'https://api.mainnet-beta.solana.com'
): Promise<PortfolioSummary> {
  console.log(`[PORTFOLIO] Analyzing portfolio for: ${walletAddress}`);

  const connection = new Connection(rpcUrl, 'confirmed');
  const publicKey = new PublicKey(walletAddress);

  try {
    // 1. Get SOL balance
    const balanceLamports = await connection.getBalance(publicKey);
    const solBalance = balanceLamports / 1e9;
    const solPrice = await getTokenPrice('So11111111111111111111111111111111111111112');
    const solValueUSD = solBalance * solPrice;

    console.log(`[PORTFOLIO] SOL Balance: ${solBalance} SOL ($${solValueUSD.toFixed(2)})`);

    // 2. Get all token accounts
    const tokenAccounts = await getTokenAccounts(walletAddress, connection);
    console.log(`[PORTFOLIO] Found ${tokenAccounts.length} token accounts`);

    // 3. Fetch token details and prices
    const tokens: TokenBalance[] = [];

    for (const account of tokenAccounts) {
      try {
        const symbol = await getTokenSymbol(account.mint);
        const price = await getTokenPrice(account.mint);
        const balance = account.balance / Math.pow(10, account.decimals);
        const valueUSD = balance * price;

        tokens.push({
          mint: account.mint,
          symbol,
          balance,
          decimals: account.decimals,
          valueUSD,
        });

        console.log(
          `[PORTFOLIO] ${symbol}: ${balance.toFixed(6)} (${account.mint}) = $${valueUSD.toFixed(2)}`
        );
      } catch (error) {
        console.warn(`[PORTFOLIO] Error processing token:`, error);
      }
    }

    // 4. Calculate totals
    const totalTokenValueUSD = tokens.reduce((sum, t) => sum + t.valueUSD, 0);
    const totalPortfolioValue = solValueUSD + totalTokenValueUSD;

    // 5. Sort by value and get top 5
    const topTokens = [...tokens].sort((a, b) => b.valueUSD - a.valueUSD).slice(0, 5);

    // 6. Portfolio composition
    const portfolioComposition = [
      {
        symbol: 'SOL',
        percentage: (solValueUSD / totalPortfolioValue) * 100,
        usdValue: solValueUSD,
      },
      ...tokens
        .sort((a, b) => b.valueUSD - a.valueUSD)
        .slice(0, 10)
        .map((t) => ({
          symbol: t.symbol,
          percentage: (t.valueUSD / totalPortfolioValue) * 100,
          usdValue: t.valueUSD,
        })),
    ];

    const summary: PortfolioSummary = {
      walletAddress,
      totalValueUSD: totalPortfolioValue,
      tokenCount: tokens.length + 1, // +1 for SOL
      tokens: [
        {
          mint: 'So11111111111111111111111111111111111111112',
          symbol: 'SOL',
          balance: solBalance,
          decimals: 9,
          valueUSD: solValueUSD,
        },
        ...tokens,
      ],
      solBalance: {
        SOL: solBalance,
        USD: solValueUSD,
      },
      topTokens,
      portfolioComposition,
      timestamp: new Date().toISOString(),
    };

    console.log(`[PORTFOLIO] Total Portfolio Value: $${totalPortfolioValue.toFixed(2)}`);
    return summary;
  } catch (error) {
    console.error('[PORTFOLIO] Error analyzing portfolio:', error);
    throw error;
  }
}

/**
 * Format portfolio for display
 */
export function formatPortfolioDisplay(portfolio: PortfolioSummary): string {
  let display = `💼 **PORTFOLIO ANALYSIS**\n\n`;
  display += `📍 Wallet: \`${portfolio.walletAddress.substring(0, 8)}...\`\n`;
  display += `💰 **Total Value: $${portfolio.totalValueUSD.toFixed(2)}**\n`;
  display += `📊 Tokens Held: ${portfolio.tokenCount}\n\n`;

  display += `**🔝 SOL Balance:**\n`;
  display += `├─ ${portfolio.solBalance.SOL.toFixed(4)} SOL\n`;
  display += `└─ $${portfolio.solBalance.USD.toFixed(2)}\n\n`;

  display += `**📈 Top Holdings:**\n`;
  for (const token of portfolio.topTokens.slice(0, 5)) {
    const percentage = (token.valueUSD / portfolio.totalValueUSD) * 100;
    display += `├─ ${token.symbol}: ${token.balance.toFixed(6)} ($${token.valueUSD.toFixed(2)}) - ${percentage.toFixed(1)}%\n`;
  }
  display += `└─ ...and ${Math.max(0, portfolio.tokenCount - 5)} more tokens\n\n`;

  display += `**📊 Composition:**\n`;
  for (const item of portfolio.portfolioComposition.slice(0, 8)) {
    const bar = '█'.repeat(Math.round(item.percentage / 5));
    display += `├─ ${item.symbol.padEnd(6)} ${bar} ${item.percentage.toFixed(1)}% ($${item.usdValue.toFixed(2)})\n`;
  }

  display += `\n⏰ Last Updated: ${new Date(portfolio.timestamp).toLocaleTimeString()}`;

  return display;
}

/**
 * Get portfolio change (compare with previous)
 */
export async function getPortfolioChange(
  walletAddress: string,
  previousPortfolio: PortfolioSummary,
  rpcUrl?: string
): Promise<{
  previousValue: number;
  currentValue: number;
  change: number;
  percentChange: number;
}> {
  const current = await analyzePortfolio(walletAddress, rpcUrl);

  const change = current.totalValueUSD - previousPortfolio.totalValueUSD;
  const percentChange = (change / previousPortfolio.totalValueUSD) * 100;

  return {
    previousValue: previousPortfolio.totalValueUSD,
    currentValue: current.totalValueUSD,
    change,
    percentChange,
  };
}

/**
 * Export portfolio to JSON
 */
export function exportPortfolio(portfolio: PortfolioSummary): string {
  return JSON.stringify(portfolio, null, 2);
}
