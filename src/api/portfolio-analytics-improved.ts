import { Connection, PublicKey } from '@solana/web3.js';
import axios from 'axios';

/**
 * Portfolio Analytics for LIZA - IMPROVED VERSION
 * Analyzes complete wallet holdings with accurate pricing
 * Uses Jupiter API for real-time prices
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
  solBalance: number;
  solValueUSD: number;
  tokenCount: number;
  tokens: TokenBalance[];
  topTokens: TokenBalance[];
  portfolioComposition: {
    symbol: string;
    percentage: number;
    usdValue: number;
  }[];
  timestamp: string;
}

/**
 * Get token prices from Jupiter API (most accurate)
 */
async function getTokenPriceFromJupiter(mint: string): Promise<number> {
  try {
    // Jupiter Price API
    const response = await axios.get(
      `https://api.jup.ag/price?ids=${mint}`,
      { timeout: 5000 }
    );

    if (response.data?.data?.[mint]?.price) {
      return parseFloat(response.data.data[mint].price);
    }

    return 0;
  } catch (error) {
    console.warn(`[PORTFOLIO] Failed to get Jupiter price for ${mint}`);
    return 0;
  }
}

/**
 * Get token prices from Birdeye (fallback)
 */
async function getTokenPriceFromBirdeye(mint: string): Promise<number> {
  try {
    const response = await axios.get(
      `https://api.birdeye.so/defi/price`,
      {
        params: { address: mint },
        timeout: 5000
      }
    );

    if (response.data?.data?.value) {
      return parseFloat(response.data.data.value);
    }

    return 0;
  } catch (error) {
    console.warn(`[PORTFOLIO] Failed to get Birdeye price for ${mint}`);
    return 0;
  }
}

/**
 * Get token symbol from Jupiter token list
 */
async function getTokenSymbol(mint: string): Promise<string> {
  try {
    // Solana's Token Program native mint
    if (mint === 'So11111111111111111111111111111111111111112') {
      return 'SOL';
    }

    // Cache of common tokens
    const commonTokens: { [key: string]: string } = {
      'EPjFWaJUhxpeZS3iiruSvf3BQ2z5Za8DXzvE5ajZz51f': 'USDC',
      'DezXAZ8z7PnrnRJjoBXwYaKe2XTis3Zonw1j1axNac5': 'BONK',
      'MangoCzJ36AjZyKwVj3VnYU4GTonjfVEnJmvvWaxLac': 'MNGO',
      '7i5KKsX2wuNXzYoSx85ejyskyBCcFHxVrMssFrhdjaSi': 'COPE',
      'EPJFWaLb3fRWKKv8CqjjwNVG5Txvam7yMyQ8671ExKt': 'COPE2',
      'RLY19F4b4z7ALV1peNTaVdRNYSKzzzVgaprykssMh60': 'RLY',
      'JUPyiwrYJFskUPiHa7hkeR8JwF3ttBKqrySAv4S3daM': 'JUP',
      'mSoLzYCxHdgqyNvt6XIaZV6gA9RCKc7oGuZrFw69ztJ': 'mSOL',
    };

    if (commonTokens[mint]) {
      return commonTokens[mint];
    }

    // Try Jupiter token list
    try {
      const response = await axios.get(
        'https://token.jup.ag/strict',
        { timeout: 3000 }
      );

      const tokenList = response.data || [];
      const token = tokenList.find((t: any) => t.address === mint);
      if (token?.symbol) {
        return token.symbol;
      }
    } catch (e) {
      console.warn(`[PORTFOLIO] Failed to fetch Jupiter token list`);
    }

    // Fallback: return shortened mint
    return mint.substring(0, 6).toUpperCase();
  } catch (error) {
    console.warn(`[PORTFOLIO] Failed to get symbol for ${mint}`);
    return mint.substring(0, 6).toUpperCase();
  }
}

/**
 * Get all token accounts for a wallet with proper error handling
 */
async function getTokenAccounts(walletAddress: string, connection: Connection) {
  try {
    const publicKey = new PublicKey(walletAddress);

    console.log(`[PORTFOLIO] Fetching token accounts for ${walletAddress}`);

    // Use getParsedTokenAccountsByOwner with Token Program
    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
      publicKey,
      { programId: new PublicKey('TokenkegQfeZyiNwAJsyFbPVwwQQfimJwqDeg4qqvGn') },
      'confirmed'
    );

    console.log(`[PORTFOLIO] Found ${tokenAccounts.value.length} token accounts`);

    return tokenAccounts.value
      .filter((account) => {
        try {
          return account.account.data.parsed?.info?.tokenAmount?.amount > 0;
        } catch {
          return false;
        }
      })
      .map((account) => {
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
 * Main function: Analyze complete portfolio
 */
export async function analyzePortfolio(
  walletAddress: string,
  rpcUrl: string = process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com'
): Promise<PortfolioSummary> {
  console.log(`[PORTFOLIO] Starting portfolio analysis for: ${walletAddress}`);
  console.log(`[PORTFOLIO] Using RPC: ${rpcUrl}`);

  const connection = new Connection(rpcUrl, 'confirmed');
  const publicKey = new PublicKey(walletAddress);

  try {
    // 1. Get SOL balance
    console.log(`[PORTFOLIO] Fetching SOL balance...`);
    const balanceLamports = await connection.getBalance(publicKey);
    const solBalance = balanceLamports / 1e9;

    console.log(`[PORTFOLIO] SOL Balance: ${solBalance} SOL`);

    // Get SOL price
    const solPrice = await getTokenPriceFromJupiter('So11111111111111111111111111111111111111112');
    const solValueUSD = solBalance * (solPrice || 196); // Fallback to ~$196

    console.log(`[PORTFOLIO] SOL Price: $${solPrice || 196}`);
    console.log(`[PORTFOLIO] SOL Value: $${solValueUSD.toFixed(2)}`);

    // 2. Get all token accounts
    console.log(`[PORTFOLIO] Fetching token accounts...`);
    const tokenAccounts = await getTokenAccounts(walletAddress, connection);
    console.log(`[PORTFOLIO] Total token accounts: ${tokenAccounts.length}`);

    // 3. Fetch token details and prices
    const tokens: TokenBalance[] = [];

    for (let i = 0; i < tokenAccounts.length; i++) {
      const account = tokenAccounts[i];
      try {
        const balance = account.balance / Math.pow(10, account.decimals);

        // Skip tokens with zero balance
        if (balance === 0) continue;

        const symbol = await getTokenSymbol(account.mint);
        
        // Get price from Jupiter first, fallback to Birdeye
        let price = await getTokenPriceFromJupiter(account.mint);
        if (!price || price === 0) {
          price = await getTokenPriceFromBirdeye(account.mint);
        }

        const valueUSD = balance * (price || 0);

        // Only include tokens with non-zero value
        if (valueUSD > 0) {
          tokens.push({
            mint: account.mint,
            symbol,
            balance,
            decimals: account.decimals,
            valueUSD,
          });

          console.log(
            `[PORTFOLIO] ✓ ${symbol.padEnd(8)} | ${balance.toFixed(6).padEnd(15)} | $${price.toFixed(8).padEnd(15)} | Value: $${valueUSD.toFixed(2)}`
          );
        }
      } catch (error) {
        console.warn(`[PORTFOLIO] Error processing token ${account.mint}:`, error);
      }
    }

    // 4. Sort tokens by value
    tokens.sort((a, b) => b.valueUSD - a.valueUSD);

    // 5. Calculate totals
    const totalTokenValueUSD = tokens.reduce((sum, t) => sum + t.valueUSD, 0);
    const totalPortfolioValue = solValueUSD + totalTokenValueUSD;

    // 6. Get top tokens
    const topTokens = tokens.slice(0, 5);

    // 7. Portfolio composition
    const portfolioComposition = [
      {
        symbol: 'SOL',
        percentage: totalPortfolioValue > 0 ? (solValueUSD / totalPortfolioValue) * 100 : 0,
        usdValue: solValueUSD,
      },
      ...tokens
        .slice(0, 10)
        .map((t) => ({
          symbol: t.symbol,
          percentage: totalPortfolioValue > 0 ? (t.valueUSD / totalPortfolioValue) * 100 : 0,
          usdValue: t.valueUSD,
        })),
    ];

    const summary: PortfolioSummary = {
      walletAddress,
      totalValueUSD: totalPortfolioValue,
      solBalance,
      solValueUSD,
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
      topTokens,
      portfolioComposition,
      timestamp: new Date().toISOString(),
    };

    console.log(`[PORTFOLIO] ✅ Analysis complete!`);
    console.log(`[PORTFOLIO] Total Portfolio Value: $${totalPortfolioValue.toFixed(2)}`);
    console.log(`[PORTFOLIO] Total Tokens: ${summary.tokenCount}`);

    return summary;
  } catch (error) {
    console.error('[PORTFOLIO] Fatal error analyzing portfolio:', error);
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
  display += `├─ ${portfolio.solBalance.toFixed(4)} SOL\n`;
  display += `└─ $${portfolio.solValueUSD.toFixed(2)}\n\n`;

  if (portfolio.topTokens.length > 0) {
    display += `**📈 Top Holdings:**\n`;
    for (const token of portfolio.topTokens.slice(0, 5)) {
      const percentage =
        portfolio.totalValueUSD > 0 ? (token.valueUSD / portfolio.totalValueUSD) * 100 : 0;
      display += `├─ ${token.symbol}: ${token.balance.toFixed(6)} ($${token.valueUSD.toFixed(2)}) - ${percentage.toFixed(1)}%\n`;
    }
  }

  display += `\n**📊 Composition:**\n`;
  for (const item of portfolio.portfolioComposition.slice(0, 8)) {
    const barLength = Math.round(item.percentage / 5);
    const bar = barLength > 0 ? '█'.repeat(Math.min(barLength, 20)) : '░';
    display += `├─ ${item.symbol.padEnd(6)} ${bar.padEnd(20)} ${item.percentage.toFixed(1).padStart(5)}% ($${item.usdValue.toFixed(2).padStart(10)})\n`;
  }

  display += `\n⏰ Last Updated: ${new Date(portfolio.timestamp).toLocaleTimeString()}`;

  return display;
}

/**
 * Export portfolio to JSON
 */
export function exportPortfolio(portfolio: PortfolioSummary): string {
  return JSON.stringify(portfolio, null, 2);
}
