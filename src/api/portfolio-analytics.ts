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

    // TokenkegQfeZyiNwAJsyFbPVwwQQfimJwqDeg4qqvGn is the Token Program ID
    const TOKEN_PROGRAM_ID = 'TokenkegQfeZyiNwAJsyFbPVwwQQfimJwqDeg4qqvGn';

    try {
      // Use filters to query token accounts
      const accounts = await connection.getTokenAccountsByOwner(publicKey, {
        programId: new PublicKey(TOKEN_PROGRAM_ID),
      });

      console.log(`[PORTFOLIO] Found ${accounts.value.length} token accounts`);

      const tokenAccounts = [];

      for (const account of accounts.value) {
        try {
          const data = account.account.data;
          
          // Token Account Data Layout (Compact):
          // [0:32] - Mint pubkey
          // [32:64] - Owner pubkey  
          // [64:72] - Amount (u64)
          // [72:73] - Decimals (u8)
          // [73:74] - Is initialized (bool)
          // [74:75] - Is frozen (bool)
          // ... delegated authority, delegation ... (optional fields)

          if (data.length < 73) continue;

          const mint = new PublicKey(data.slice(0, 32)).toString();
          const balanceBuffer = data.slice(64, 72);
          const balance = Number(balanceBuffer.readBigUInt64LE(0));
          const decimals = data[72];

          if (balance > 0) {
            tokenAccounts.push({
              mint,
              tokenAccount: account.pubkey.toString(),
              balance,
              decimals,
            });
          }
        } catch (e) {
          console.warn(`[PORTFOLIO] Error parsing token account`);
        }
      }

      return tokenAccounts;
    } catch (e1) {
      console.warn('[PORTFOLIO] getTokenAccountsByOwner failed, attempting alternative approach...');
      
      try {
        // Alternative: Try without the filter (some RPC providers don't support it)
        const result = await connection.getParsedTokenAccountsByOwner(publicKey, {
          programId: new PublicKey(TOKEN_PROGRAM_ID),
        });

        return result.value
          .filter((account) => {
            try {
              const amount = account.account?.data?.parsed?.info?.tokenAmount?.amount;
              return amount && parseInt(amount) > 0;
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
      } catch (e2) {
        console.warn('[PORTFOLIO] All token account methods failed');
        return [];
      }
    }
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
  let display = `📊 **Portfolio Summary**\n`;
  display += `━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

  display += `💰 **Total Value**: $${portfolio.totalValueUSD.toFixed(2)}\n`;
  display += `📈 **Token Count**: ${portfolio.tokenCount}\n\n`;

  display += `**SOL Holdings:**\n`;
  display += `├─ Amount: ${portfolio.solBalance.toFixed(6)} SOL\n`;
  display += `└─ Value: $${portfolio.solValueUSD.toFixed(2)}\n\n`;

  if (portfolio.topTokens.length > 0) {
    display += `**Top Holdings:**\n`;
    portfolio.topTokens.forEach((token, idx) => {
      const prefix = idx === portfolio.topTokens.length - 1 ? '└─' : '├─';
      display += `${prefix} ${token.symbol}: ${token.balance.toFixed(6)} = $${token.valueUSD.toFixed(2)}\n`;
    });
  }

  display += `\n**Portfolio Composition:**\n`;
  portfolio.portfolioComposition.slice(0, 5).forEach((comp, idx) => {
    const prefix = idx === 4 || idx === portfolio.portfolioComposition.slice(0, 5).length - 1 ? '└─' : '├─';
    display += `${prefix} ${comp.symbol}: ${comp.percentage.toFixed(2)}%\n`;
  });

  return display;
}

/**
 * Get portfolio changes over time
 */
export function getPortfolioChange(
  portfolio: PortfolioSummary,
  previousPortfolio?: PortfolioSummary
): {
  totalValueChange: number;
  percentageChange: number;
  tokens: any[];
} {
  if (!previousPortfolio) {
    return {
      totalValueChange: 0,
      percentageChange: 0,
      tokens: [],
    };
  }

  const valueChange = portfolio.totalValueUSD - previousPortfolio.totalValueUSD;
  const percentageChange =
    previousPortfolio.totalValueUSD > 0
      ? (valueChange / previousPortfolio.totalValueUSD) * 100
      : 0;

  return {
    totalValueChange: valueChange,
    percentageChange,
    tokens: [],
  };
}

/**
 * Export portfolio to JSON
 */
export function exportPortfolio(portfolio: PortfolioSummary): string {
  return JSON.stringify(portfolio, null, 2);
}
