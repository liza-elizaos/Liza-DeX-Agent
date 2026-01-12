import axios from 'axios';

const BASE_URL = 'https://api.dexscreener.com';

// ⚡ QUICK TIMEOUT - 5 seconds max
const client = axios.create({
  baseURL: BASE_URL,
  timeout: 5000,
  headers: {
    'Accept': 'application/json'
  }
});

interface TrendingToken {
  symbol: string;
  address: string;
  volume: number;
  txns: number;
  liquidity: number;
  priceChange: number;
  boosts: number;
  createdAt?: number;
}

export async function getTrendingTokens(): Promise<TrendingToken[]> {
  console.log('[DEX] Fetching trending tokens from Dexscreener...');
  
  try {
    // Search for Solana tokens with high activity
    const response = await client.get('/latest/dex/search', {
      params: {
        q: 'SOL'
      }
    });
    
    if (!response.data || !response.data.pairs) {
      console.log('[DEX] No pairs found');
      return [];
    }
    
    const pairs = response.data.pairs;
    console.log(`[DEX] Found ${pairs.length} pairs`);
    
    // Filter and score
    const scored = pairs
      .filter((p: any) => 
        p.chainId === 'solana' &&
        p.volume?.h24 > 1000 && // Min $1k volume
        p.liquidity?.usd > 500 && // Min $500 liquidity
        p.priceChange?.h24 // Has price data
      )
      .map((p: any) => ({
        symbol: p.baseToken?.symbol || 'UNKNOWN',
        address: p.baseToken?.address || '',
        volume: p.volume?.h24 || 0,
        txns: (p.txns?.h24?.buys || 0) + (p.txns?.h24?.sells || 0),
        liquidity: p.liquidity?.usd || 0,
        priceChange: p.priceChange?.h24 || 0,
        boosts: p.boosts?.active || 0,
        createdAt: p.pairCreatedAt || 0
      }))
      .sort((a: any, b: any) => {
        // Score = volume * (1 + boosts/10) * (1 + txns/1000)
        const scoreA = a.volume * (1 + a.boosts / 10) * (1 + a.txns / 1000);
        const scoreB = b.volume * (1 + b.boosts / 10) * (1 + b.txns / 1000);
        return scoreB - scoreA;
      })
      .slice(0, 5); // Top 5
    
    console.log(`[DEX] Filtered to ${scored.length} trending tokens`);
    
    scored.forEach((t: any, i: number) => {
      console.log(`${i + 1}. ${t.symbol}: $${t.volume.toFixed(0)} vol, ${t.txns} txns`);
    });
    
    return scored;
    
  } catch (error: any) {
    console.error('[DEX] Dexscreener API error:', error.message);
    
    // Return empty array on error (don't block the flow)
    return [];
  }
}

export async function getTokenDetails(address: string): Promise<any> {
  console.log(`[DEX] Fetching details for ${address}...`);
  
  try {
    const response = await client.get(`/latest/dex/tokens/${address}`);
    
    if (!response.data || !response.data.pairs || response.data.pairs.length === 0) {
      console.log('[DEX] No data found for token');
      return null;
    }
    
    const pair = response.data.pairs[0];
    console.log(`[DEX] Got details for ${pair.baseToken?.symbol}`);
    
    return {
      symbol: pair.baseToken?.symbol,
      name: pair.baseToken?.name,
      address: pair.baseToken?.address,
      volume24h: pair.volume?.h24 || 0,
      liquidity: pair.liquidity?.usd || 0,
      priceUsd: pair.priceUsd || 0,
      priceChange24h: pair.priceChange?.h24 || 0,
      txns24h: (pair.txns?.h24?.buys || 0) + (pair.txns?.h24?.sells || 0),
      marketCap: pair.fdv || 0
    };
    
  } catch (error: any) {
    console.error('[DEX] Token details error:', error.message);
    return null;
  }
}
