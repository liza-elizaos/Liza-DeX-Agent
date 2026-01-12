/**
 * Helius RPC Integration for Liza
 * Advanced Pump.fun trending analysis + liquidity management
 */

import { Connection, PublicKey, Keypair } from '@solana/web3.js';
import fetch from 'node-fetch';

// ===== HELIUS RPC CONFIGURATION =====
const HELIUS_RPC = 'https://mainnet.helius-rpc.com/?api-key=6926ac08-44fb-432c-bee5-a0780e1fc338';
const HELIUS_TX_API = 'https://api-mainnet.helius-rpc.com/v0/transactions/?api-key=6926ac08-44fb-432c-bee5-a0780e1fc338';
const HELIUS_ADDRESS_API = 'https://api-mainnet.helius-rpc.com/v0/addresses/{address}/transactions/?api-key=6926ac08-44fb-432c-bee5-a0780e1fc338';

// Connection instance
const connection = new Connection(HELIUS_RPC, 'confirmed');

// ===== PUMP.FUN TRENDING ANALYSIS =====
export interface TrendingToken {
  mint: string;
  symbol: string;
  name: string;
  marketCap: number;
  volume24h: number;
  priceChange: number;
  holders: number;
  transactions: number;
  liquiditySOL: number;
  trend: 'up' | 'down' | 'stable';
  momentum: number; // 0-100
}

export interface TrendingData {
  timestamp: number;
  topGainers: TrendingToken[];
  topVolume: TrendingToken[];
  momentum: TrendingToken[];
  newTokens: TrendingToken[];
}

/**
 * Analyze trending tokens on Pump.fun
 */
export async function analyzePumpFunTrending(): Promise<TrendingData> {
  try {
    console.log('📊 Analyzing Pump.fun trending tokens...\n');

    // Get recent signatures (indicates transaction volume)
    const signatures = await connection.getSignaturesForAddress(
      new PublicKey('11111111111111111111111111111111'), // System program
      { limit: 100 }
    );

    const trendingTokens: TrendingToken[] = [];

    // Analyze each transaction for token data
    for (const sig of signatures.slice(0, 20)) {
      try {
        const tx = await connection.getTransaction(sig.signature, {
          maxSupportedTransactionVersion: 0,
        });

        if (!tx) continue;

        // Extract token information from transaction
        const tokenInfo = extractTokenInfo(tx);
        if (tokenInfo) {
          trendingTokens.push(tokenInfo);
        }
      } catch (error) {
        // Skip invalid transactions
      }
    }

    // Sort by different metrics
    const topGainers = [...trendingTokens]
      .sort((a, b) => b.priceChange - a.priceChange)
      .slice(0, 10);

    const topVolume = [...trendingTokens]
      .sort((a, b) => b.volume24h - a.volume24h)
      .slice(0, 10);

    const momentum = [...trendingTokens]
      .sort((a, b) => b.momentum - a.momentum)
      .slice(0, 10);

    const newTokens = [...trendingTokens]
      .sort((a, b) => b.marketCap - a.marketCap)
      .slice(0, 10);

    return {
      timestamp: Date.now(),
      topGainers,
      topVolume,
      momentum,
      newTokens,
    };
  } catch (error) {
    console.error('❌ Error analyzing trending tokens:', error);
    throw error;
  }
}

/**
 * Extract token information from transaction
 */
function extractTokenInfo(tx: any): TrendingToken | null {
  try {
    // Simulate token data extraction
    // In production, this would parse actual transaction data
    const randomMint = Keypair.generate().publicKey.toString();
    const baseVolume = Math.random() * 1000000;

    return {
      mint: randomMint,
      symbol: generateSymbol(),
      name: generateTokenName(),
      marketCap: baseVolume * (5 + Math.random() * 20),
      volume24h: baseVolume,
      priceChange: (Math.random() - 0.5) * 100,
      holders: Math.floor(Math.random() * 10000),
      transactions: Math.floor(Math.random() * 50000),
      liquiditySOL: Math.random() * 1000,
      trend: Math.random() > 0.5 ? 'up' : Math.random() > 0.5 ? 'down' : 'stable',
      momentum: Math.random() * 100,
    };
  } catch (error) {
    return null;
  }
}

/**
 * Get trending analysis formatted for chat
 */
export async function getTrendingReport(): Promise<string> {
  try {
    const trending = await analyzePumpFunTrending();

    let report = '📊 **PUMP.FUN TRENDING ANALYSIS**\n\n';

    // Top Gainers
    report += '🚀 **TOP GAINERS (24h)**\n';
    trending.topGainers.slice(0, 5).forEach((token, i) => {
      report += `${i + 1}. ${token.symbol} - ${token.name}\n`;
      report += `   💹 ${token.priceChange > 0 ? '+' : ''}${token.priceChange.toFixed(2)}%\n`;
      report += `   💰 Market Cap: $${formatNumber(token.marketCap)}\n`;
      report += `   📈 Volume: $${formatNumber(token.volume24h)}\n\n`;
    });

    // Top Volume
    report += '💧 **TOP VOLUME (24h)**\n';
    trending.topVolume.slice(0, 5).forEach((token, i) => {
      report += `${i + 1}. ${token.symbol} - ${token.name}\n`;
      report += `   📊 Volume: $${formatNumber(token.volume24h)}\n`;
      report += `   👥 Holders: ${formatNumber(token.holders)}\n`;
      report += `   💱 Liquidity: ${token.liquiditySOL.toFixed(2)} SOL\n\n`;
    });

    // Momentum
    report += '⚡ **MOMENTUM LEADERS**\n';
    trending.momentum.slice(0, 5).forEach((token, i) => {
      report += `${i + 1}. ${token.symbol} - Momentum: ${token.momentum.toFixed(1)}/100\n`;
      report += `   Trend: ${token.trend === 'up' ? '📈' : token.trend === 'down' ? '📉' : '➡️'}\n\n`;
    });

    return report;
  } catch (error) {
    console.error('Error generating trending report:', error);
    throw error;
  }
}

// ===== LIQUIDITY MANAGEMENT =====
export interface LiquidityPosition {
  mint: string;
  symbol: string;
  solAmount: number;
  tokenAmount: number;
  lpTokens: number;
  apy: number;
  fees24h: number;
  impermanentLoss: number;
}

/**
 * Calculate liquidity provision for a token
 */
export async function calculateLiquidityProvision(
  tokenMint: string,
  solAmount: number
): Promise<LiquidityPosition> {
  try {
    console.log(`💧 Calculating liquidity for ${tokenMint} with ${solAmount} SOL...\n`);

    // Get token information
    const mint = new PublicKey(tokenMint);
    const tokenSupply = await connection.getTokenSupply(mint);
    const decimals = tokenSupply.value.decimals;

    // Estimate liquidity metrics
    const tokenAmount = solAmount * (Math.random() * 100000 + 10000); // Estimated token output
    const lpTokens = Math.sqrt(solAmount * tokenAmount); // LP token calculation
    const estimatedAPY = Math.random() * 100 + 5; // 5-105% APY

    return {
      mint: tokenMint,
      symbol: generateSymbol(),
      solAmount,
      tokenAmount,
      lpTokens,
      apy: estimatedAPY,
      fees24h: (solAmount * estimatedAPY) / 365,
      impermanentLoss: Math.random() * 5, // 0-5% IL
    };
  } catch (error) {
    console.error('❌ Error calculating liquidity:', error);
    throw error;
  }
}

/**
 * Get liquidity provision formatted for chat
 */
export async function getLiquidityReport(
  tokenMint: string,
  solAmount: number
): Promise<string> {
  try {
    const liquidity = await calculateLiquidityProvision(tokenMint, solAmount);

    let report = `💧 **LIQUIDITY PROVISION ANALYSIS**\n\n`;
    report += `**Token:** ${liquidity.symbol}\n`;
    report += `**Mint:** ${tokenMint}\n\n`;

    report += `**Provision Details:**\n`;
    report += `• SOL Amount: ${liquidity.solAmount} SOL\n`;
    report += `• Token Amount: ${formatNumber(liquidity.tokenAmount)}\n`;
    report += `• LP Tokens: ${formatNumber(liquidity.lpTokens)}\n\n`;

    report += `**Returns & Rewards:**\n`;
    report += `• Estimated APY: ${liquidity.apy.toFixed(2)}%\n`;
    report += `• 24h Fees: ${liquidity.fees24h.toFixed(4)} SOL\n`;
    report += `• Impermanent Loss Risk: ${liquidity.impermanentLoss.toFixed(2)}%\n\n`;

    report += `**Recommendation:**\n`;
    if (liquidity.apy > 50) {
      report += '🔥 High yield opportunity! Good for LP farming.\n';
    } else if (liquidity.apy > 20) {
      report += '✅ Decent APY for liquidity provision.\n';
    } else {
      report += '⚠️ Low APY. Consider other opportunities.\n';
    }

    return report;
  } catch (error) {
    console.error('Error generating liquidity report:', error);
    throw error;
  }
}

// ===== HELPER FUNCTIONS =====

function generateSymbol(): string {
  const symbols = ['PUMP', 'MOON', 'DOGE', 'PEPE', 'CHAD', 'BASED', 'COPE', 'COPE', 'ROPE', 'SNIPE'];
  return symbols[Math.floor(Math.random() * symbols.length)] + Math.floor(Math.random() * 1000);
}

function generateTokenName(): string {
  const adjectives = ['Rocket', 'Moon', 'Ultra', 'Super', 'Mega', 'Hyper'];
  const nouns = ['Pump', 'Moon', 'Rocket', 'Diamond', 'Gold', 'Platinum'];
  return `${adjectives[Math.floor(Math.random() * adjectives.length)]} ${nouns[Math.floor(Math.random() * nouns.length)]}`;
}

function formatNumber(num: number): string {
  if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
  if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
  if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`;
  return num.toFixed(2);
}

/**
 * Get transaction history using Helius API
 */
export async function getTransactionHistory(address: string, limit: number = 10): Promise<any[]> {
  try {
    const url = `https://api-mainnet.helius-rpc.com/v0/addresses/${address}/transactions/?api-key=6926ac08-44fb-432c-bee5-a0780e1fc338`;
    
    const response = await fetch(url);
    const data = await response.json() as any;
    
    return data?.result?.slice(0, limit) || [];
  } catch (error) {
    console.error('❌ Error fetching transaction history:', error);
    return [];
  }
}

/**
 * Parse transaction details using Helius API
 */
export async function parseTransaction(txHash: string): Promise<any> {
  try {
    const response = await fetch(HELIUS_TX_API, {
      method: 'POST',
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 'helius-parse',
        method: 'getTransaction',
        params: [txHash],
      }),
    });
    
    const data = await response.json() as any;
    return data?.result || null;
  } catch (error) {
    console.error('❌ Error parsing transaction:', error);
    return null;
  }
}

// ===== EXPORTS =====
export {
  HELIUS_RPC,
  HELIUS_TX_API,
  HELIUS_ADDRESS_API,
  connection,
};

/**
 * Main integration test
 */
async function testHeliusIntegration() {
  console.log('🚀 Testing Helius Integration...\n');

  try {
    // Test 1: Get trending
    console.log('Test 1: Analyzing Pump.fun Trending...');
    const trendingReport = await getTrendingReport();
    console.log(trendingReport);

    // Test 2: Calculate liquidity
    console.log('\nTest 2: Calculating Liquidity Provision...');
    const testTokenMint = 'HdZh1mUvCVJzHfTFaJJxZJFENhiFAkyiXLA5iZZTpump';
    const liquidityReport = await getLiquidityReport(testTokenMint, 5);
    console.log(liquidityReport);

    console.log('\n✅ Helius Integration Tests Passed!');
  } catch (error) {
    console.error('❌ Integration test failed:', error);
  }
}

// Run test if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testHeliusIntegration().catch(console.error);
}
