/**
 * Real Pump.fun SDK Integration
 * Fetches actual trending tokens from Pump.fun
 */

import fetch from 'node-fetch';
import { Connection, PublicKey } from '@solana/web3.js';

const HELIUS_RPC = 'https://mainnet.helius-rpc.com/?api-key=6926ac08-44fb-432c-bee5-a0780e1fc338';
const connection = new Connection(HELIUS_RPC, 'confirmed');

// ===== PUMP.FUN REAL API ENDPOINTS =====
const PUMPFUN_API = 'https://frontend-api.pump.fun/api';
const PUMPFUN_TRENDING = `${PUMPFUN_API}/trending/tokens`;
const PUMPFUN_RECENT = `${PUMPFUN_API}/recent-tokens`;
const PUMPFUN_TOKEN_INFO = `${PUMPFUN_API}/token`;

export interface RealTrendingToken {
  mint: string;
  name: string;
  symbol: string;
  description: string;
  image: string;
  website: string;
  twitter: string;
  telegram: string;
  createdAt: number;
  createdAtDate: string;
  
  // Real Market Data
  marketCap: number;
  volume24h: number;
  priceChange24h: number;
  priceChangePercent24h: number;
  currentPrice: number;
  
  // Real On-Chain Data
  holders: number;
  transactions: number;
  liquiditySOL: number;
  totalSupply: string;
  circulatingSupply: string;
  
  // Real Status
  isRug: boolean;
  isFrozen: boolean;
  isBurned: boolean;
  contractStatus: string;
}

export interface RealTrendingData {
  timestamp: number;
  trending: RealTrendingToken[];
  recent: RealTrendingToken[];
  totalCount: number;
}

/**
 * Fetch real trending tokens from Pump.fun
 */
export async function fetchRealTrendingTokens(): Promise<RealTrendingToken[]> {
  try {
    console.log('📊 Fetching REAL trending tokens from Pump.fun...\n');

    const response = await fetch(PUMPFUN_TRENDING, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!response.ok) {
      throw new Error(`Pump.fun API error: ${response.status}`);
    }

    const data = (await response.json()) as any;
    console.log(`✅ Got ${data?.length || 0} trending tokens from Pump.fun\n`);

    // Parse and enrich the data
    return (data || []).map((token: any) => ({
      mint: token.mint || token.id,
      name: token.name || 'Unknown',
      symbol: token.symbol || 'UNKNOWN',
      description: token.description || '',
      image: token.image || '',
      website: token.website || '',
      twitter: token.twitter || '',
      telegram: token.telegram || '',
      createdAt: token.created_timestamp || Date.now(),
      createdAtDate: token.created_timestamp ? new Date(token.created_timestamp * 1000).toISOString() : new Date().toISOString(),

      // Market Data
      marketCap: parseFloat(token.marketCap) || parseFloat(token.usd_market_cap) || 0,
      volume24h: parseFloat(token.volume_24h) || parseFloat(token.usd_24h_volume) || 0,
      priceChange24h: parseFloat(token.priceChange24h) || 0,
      priceChangePercent24h: parseFloat(token.priceChangePercent24h) || 0,
      currentPrice: parseFloat(token.price) || parseFloat(token.usd_price) || 0,

      // On-Chain Data
      holders: parseInt(token.holders) || 0,
      transactions: parseInt(token.transactions) || 0,
      liquiditySOL: parseFloat(token.liquidity) || 0,
      totalSupply: token.total_supply || '0',
      circulatingSupply: token.circulating_supply || '0',

      // Status
      isRug: token.is_rug || false,
      isFrozen: token.is_frozen || false,
      isBurned: token.is_burned || false,
      contractStatus: token.contract_status || 'active',
    }));
  } catch (error) {
    console.error('❌ Error fetching trending tokens:', error);
    throw error;
  }
}

/**
 * Fetch recent launches from Pump.fun
 */
export async function fetchRecentLaunches(limit: number = 20): Promise<RealTrendingToken[]> {
  try {
    console.log(`📊 Fetching REAL recent launches from Pump.fun (last ${limit})...\n`);

    const response = await fetch(`${PUMPFUN_RECENT}?limit=${limit}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!response.ok) {
      throw new Error(`Pump.fun API error: ${response.status}`);
    }

    const data = (await response.json()) as any;
    console.log(`✅ Got ${data?.length || 0} recent launches\n`);

    return (data || []).map((token: any) => ({
      mint: token.mint || token.id,
      name: token.name || 'Unknown',
      symbol: token.symbol || 'UNKNOWN',
      description: token.description || '',
      image: token.image || '',
      website: token.website || '',
      twitter: token.twitter || '',
      telegram: token.telegram || '',
      createdAt: token.created_timestamp || Date.now(),
      createdAtDate: token.created_timestamp ? new Date(token.created_timestamp * 1000).toISOString() : new Date().toISOString(),

      marketCap: parseFloat(token.marketCap) || parseFloat(token.usd_market_cap) || 0,
      volume24h: parseFloat(token.volume_24h) || parseFloat(token.usd_24h_volume) || 0,
      priceChange24h: parseFloat(token.priceChange24h) || 0,
      priceChangePercent24h: parseFloat(token.priceChangePercent24h) || 0,
      currentPrice: parseFloat(token.price) || parseFloat(token.usd_price) || 0,

      holders: parseInt(token.holders) || 0,
      transactions: parseInt(token.transactions) || 0,
      liquiditySOL: parseFloat(token.liquidity) || 0,
      totalSupply: token.total_supply || '0',
      circulatingSupply: token.circulating_supply || '0',

      isRug: token.is_rug || false,
      isFrozen: token.is_frozen || false,
      isBurned: token.is_burned || false,
      contractStatus: token.contract_status || 'active',
    }));
  } catch (error) {
    console.error('❌ Error fetching recent launches:', error);
    throw error;
  }
}

/**
 * Get real trending report formatted for chat
 */
export async function getRealTrendingReport(): Promise<string> {
  try {
    const tokens = await fetchRealTrendingTokens();

    if (!tokens || tokens.length === 0) {
      return '📊 **PUMP.FUN TRENDING**\n\nNo trending tokens available at the moment.\n\nTry checking the website directly: https://pump.fun';
    }

    // Sort by volume
    const byVolume = [...tokens].sort((a, b) => b.volume24h - a.volume24h);
    const byGainers = [...tokens].sort((a, b) => b.priceChangePercent24h - a.priceChangePercent24h);
    const byMarketCap = [...tokens].sort((a, b) => b.marketCap - a.marketCap);

    let report = '📊 **PUMP.FUN TRENDING - REAL TIME DATA**\n\n';
    report += `Updated: ${new Date().toLocaleTimeString()}\n`;
    report += `Total Tokens Analyzed: ${tokens.length}\n\n`;

    // Top Gainers
    report += '🚀 **TOP GAINERS (24h)**\n';
    byGainers.slice(0, 5).forEach((token, i) => {
      const priceStr = token.priceChangePercent24h > 0 ? '+' : '';
      report += `${i + 1}. **${token.symbol}** - ${token.name}\n`;
      report += `   Mint: \`${token.mint.slice(0, 20)}...\`\n`;
      report += `   💹 ${priceStr}${token.priceChangePercent24h.toFixed(2)}%\n`;
      report += `   💰 Market Cap: $${formatNumber(token.marketCap)}\n`;
      report += `   📈 Volume 24h: $${formatNumber(token.volume24h)}\n`;
      report += `   👥 Holders: ${token.holders.toLocaleString()}\n`;
      report += `   Created: ${token.createdAtDate}\n\n`;
    });

    // Top Volume
    report += '💧 **TOP VOLUME (24h)**\n';
    byVolume.slice(0, 5).forEach((token, i) => {
      report += `${i + 1}. **${token.symbol}** - ${token.name}\n`;
      report += `   📊 Volume: $${formatNumber(token.volume24h)}\n`;
      report += `   💰 Market Cap: $${formatNumber(token.marketCap)}\n`;
      report += `   👥 Holders: ${token.holders.toLocaleString()}\n`;
      report += `   💱 Liquidity: ${token.liquiditySOL.toFixed(2)} SOL\n`;
      report += `   🔗 https://pump.fun/${token.mint}\n\n`;
    });

    // Highest Market Cap
    report += '📈 **HIGHEST MARKET CAP**\n';
    byMarketCap.slice(0, 5).forEach((token, i) => {
      report += `${i + 1}. **${token.symbol}** ($${formatNumber(token.marketCap)})\n`;
      report += `   Name: ${token.name}\n`;
      report += `   Website: ${token.website || 'N/A'}\n`;
      report += `   Transactions: ${token.transactions.toLocaleString()}\n\n`;
    });

    return report;
  } catch (error) {
    console.error('Error generating trending report:', error);
    throw error;
  }
}

/**
 * Get recent launches filtered by market cap
 */
export async function getRecentLaunchesReport(minMC: number = 30000): Promise<string> {
  try {
    const launches = await fetchRecentLaunches(50);

    // Filter by min market cap
    const filtered = launches.filter(token => token.marketCap >= minMC);

    if (filtered.length === 0) {
      return `📊 **RECENT LAUNCHES > $${formatNumber(minMC)}**\n\nNo recent launches above $${formatNumber(minMC)} market cap found.\n\nCheck recent launches below that threshold.`;
    }

    // Sort by market cap (descending)
    const sorted = [...filtered].sort((a, b) => b.marketCap - a.marketCap);

    let report = `📊 **RECENT LAUNCHES > $${formatNumber(minMC)} (REAL TIME)**\n\n`;
    report += `Updated: ${new Date().toLocaleTimeString()}\n`;
    report += `Found: ${sorted.length} launches\n\n`;

    sorted.slice(0, 10).forEach((token, i) => {
      report += `${i + 1}. **${token.symbol}** - ${token.name}\n`;
      report += `   💰 Market Cap: $${formatNumber(token.marketCap)}\n`;
      report += `   📈 Volume: $${formatNumber(token.volume24h)}\n`;
      report += `   👥 Holders: ${token.holders.toLocaleString()}\n`;
      report += `   ⏱️ Created: ${new Date(token.createdAt * 1000).toLocaleString()}\n`;
      report += `   🔗 https://pump.fun/${token.mint}\n`;
      report += `   Status: ${token.isRug ? '🚫 RUG' : token.contractStatus}\n\n`;
    });

    return report;
  } catch (error) {
    console.error('Error generating recent launches report:', error);
    throw error;
  }
}

/**
 * Get token info directly from Pump.fun
 */
export async function getTokenInfo(tokenMint: string): Promise<RealTrendingToken | null> {
  try {
    console.log(`🔍 Fetching real info for token: ${tokenMint}\n`);

    const response = await fetch(`${PUMPFUN_TOKEN_INFO}/${tokenMint}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!response.ok) {
      console.log(`Token info not found: ${response.status}`);
      return null;
    }

    const token = (await response.json()) as any;

    return {
      mint: token.mint || token.id,
      name: token.name || 'Unknown',
      symbol: token.symbol || 'UNKNOWN',
      description: token.description || '',
      image: token.image || '',
      website: token.website || '',
      twitter: token.twitter || '',
      telegram: token.telegram || '',
      createdAt: token.created_timestamp || Date.now(),
      createdAtDate: token.created_timestamp ? new Date(token.created_timestamp * 1000).toISOString() : new Date().toISOString(),

      marketCap: parseFloat(token.marketCap) || parseFloat(token.usd_market_cap) || 0,
      volume24h: parseFloat(token.volume_24h) || parseFloat(token.usd_24h_volume) || 0,
      priceChange24h: parseFloat(token.priceChange24h) || 0,
      priceChangePercent24h: parseFloat(token.priceChangePercent24h) || 0,
      currentPrice: parseFloat(token.price) || parseFloat(token.usd_price) || 0,

      holders: parseInt(token.holders) || 0,
      transactions: parseInt(token.transactions) || 0,
      liquiditySOL: parseFloat(token.liquidity) || 0,
      totalSupply: token.total_supply || '0',
      circulatingSupply: token.circulating_supply || '0',

      isRug: token.is_rug || false,
      isFrozen: token.is_frozen || false,
      isBurned: token.is_burned || false,
      contractStatus: token.contract_status || 'active',
    };
  } catch (error) {
    console.error('Error fetching token info:', error);
    return null;
  }
}

/**
 * Helper: Format numbers
 */
function formatNumber(num: number): string {
  if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
  if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
  if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`;
  return num.toFixed(2);
}

/**
 * Test real integration
 */
async function testRealIntegration() {
  console.log('🚀 Testing REAL Pump.fun Integration...\n');

  try {
    // Test 1: Trending
    console.log('Test 1: Fetching REAL Trending Tokens...');
    const trendingReport = await getRealTrendingReport();
    console.log(trendingReport);

    // Test 2: Recent launches
    console.log('\nTest 2: Fetching REAL Recent Launches (>$30K)...');
    const recentReport = await getRecentLaunchesReport(30000);
    console.log(recentReport);

    console.log('\n✅ Real Integration Tests Passed!');
  } catch (error) {
    console.error('❌ Integration test failed:', error);
  }
}

// Run test if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testRealIntegration().catch(console.error);
}

export {
  PUMPFUN_API,
  PUMPFUN_TRENDING,
  PUMPFUN_RECENT,
  PUMPFUN_TOKEN_INFO,
};
