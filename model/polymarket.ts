/**
 * Polymarket Integration Module
 * Handles Polymarket prediction market data fetching and AI analysis
 */

interface PolymarketMarket {
  id: string;
  conditionId: string;
  question: string;
  category: string;
  active: boolean;
  endDate: string;
  tokens: Array<{
    name: string;
    ticker: string;
    address: string;
  }>;
}

interface MarketPrice {
  tokenId: string;
  price: number; // 0-1 representing probability
  side: 'buy' | 'sell';
  timestamp: number;
}

interface PolymarketResponse {
  success: boolean;
  data?: any;
  error?: string;
}

const CLOB_API_URL = process.env.CLOB_API_URL || 'https://clob.polymarket.com';
const CLOB_API_KEY = process.env.CLOB_API_KEY;

/**
 * Fetch market data from Polymarket CLOB API
 */
export async function getPolymarketMarkets(
  searchQuery?: string,
  limit: number = 50
): Promise<PolymarketMarket[]> {
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (CLOB_API_KEY) {
      headers['Authorization'] = `Bearer ${CLOB_API_KEY}`;
    }

    const url = new URL(`${CLOB_API_URL}/markets`);
    url.searchParams.set('limit', limit.toString());

    if (searchQuery) {
      url.searchParams.set('search', searchQuery);
    }

    console.log(`[Polymarket] Fetching markets from ${url.toString()}`);

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      throw new Error(`Polymarket API error: ${response.status}`);
    }

    const data = (await response.json()) as any;
    console.log(`[Polymarket] ✅ Got ${data.markets?.length || 0} markets`);

    return (data.markets || []).map((m: any) => ({
      id: m.id,
      conditionId: m.conditionId,
      question: m.question,
      category: m.category,
      active: m.active,
      endDate: m.endDate,
      tokens: m.tokens || [],
    }));
  } catch (error) {
    console.error('[Polymarket] Error fetching markets:', error);
    throw error;
  }
}

/**
 * Search for markets matching user query
 */
export async function searchPolymarketMarkets(query: string): Promise<PolymarketMarket[]> {
  // Normalize query - remove special chars, lowercase
  const normalized = query
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .trim();

  try {
    const markets = await getPolymarketMarkets(normalized, 100);

    // Filter based on relevance
    return markets.filter((m) => {
      const questionLower = m.question.toLowerCase();
      const keywords = normalized.split(/\s+/);

      return keywords.some((keyword) => questionLower.includes(keyword));
    });
  } catch (error) {
    console.error('[Polymarket] Search error:', error);
    return [];
  }
}

/**
 * Get market price (probability) for a specific token
 */
export async function getMarketPrice(tokenId: string): Promise<MarketPrice | null> {
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (CLOB_API_KEY) {
      headers['Authorization'] = `Bearer ${CLOB_API_KEY}`;
    }

    // Get midpoint price (fair value between bid and ask)
    const url = `${CLOB_API_URL}/mid?token_id=${tokenId}`;
    console.log(`[Polymarket] Fetching price for token: ${tokenId}`);

    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      console.warn(`[Polymarket] Could not get price for ${tokenId}: ${response.status}`);
      return null;
    }

    const data = (await response.json()) as any;

    return {
      tokenId,
      price: parseFloat(data.mid || '0'),
      side: 'buy',
      timestamp: Date.now(),
    };
  } catch (error) {
    console.error('[Polymarket] Price fetch error:', error);
    return null;
  }
}

/**
 * Search for market and get real-time odds
 */
export async function getMarketOdds(marketQuery: string): Promise<{
  market: PolymarketMarket | null;
  outcomes: Array<{ name: string; price: number; probability: string }>;
  bestMatch: string;
} | null> {
  try {
    console.log(`[Polymarket] Searching for market: "${marketQuery}"`);
    
    // Search for matching markets
    const markets = await searchPolymarketMarkets(marketQuery);
    
    if (!markets || markets.length === 0) {
      console.log(`[Polymarket] No markets found for: "${marketQuery}"`);
      return null;
    }

    // Take best match (first result)
    const bestMarket = markets[0];
    console.log(`[Polymarket] Best match: "${bestMarket.question}"`);

    // Get prices for all tokens/outcomes
    const outcomes = [];
    
    if (bestMarket.tokens && Array.isArray(bestMarket.tokens)) {
      for (const token of bestMarket.tokens) {
        try {
          const price = await getMarketPrice(token.address);
          if (price) {
            const probability = (price.price * 100).toFixed(2);
            outcomes.push({
              name: token.name || token.ticker || 'Unknown',
              price: price.price,
              probability: `${probability}%`
            });
          }
        } catch (e) {
          console.log(`[Polymarket] Could not fetch price for ${token.name}`);
        }
      }
    }

    console.log(`[Polymarket] Got outcomes for "${bestMarket.question}":`, outcomes);

    return {
      market: bestMarket,
      outcomes,
      bestMatch: bestMarket.question
    };
  } catch (error) {
    console.error('[Polymarket] Error getting market odds:', error);
    return null;
  }
}

/**
 * Extract market odds from user message
 * Supports formats like: "0.45", "45%", "$0.45", etc.
 */
export function extractOddsFromMessage(message: string): number | null {
  // Try to find decimal format: 0.XX
  const decimalMatch = message.match(/(?:^|\s)(0\.\d+)(?:\s|$)/);
  if (decimalMatch) {
    const value = parseFloat(decimalMatch[1]);
    if (value >= 0 && value <= 1) {
      return value;
    }
  }

  // Try percentage format: XX%
  const percentMatch = message.match(/(\d+(?:\.\d+)?)\s*%/);
  if (percentMatch) {
    const value = parseFloat(percentMatch[1]) / 100;
    if (value >= 0 && value <= 1) {
      return value;
    }
  }

  // Try dollar format: $0.XX
  const dollarMatch = message.match(/\$\s*(0\.\d+)/);
  if (dollarMatch) {
    const value = parseFloat(dollarMatch[1]);
    if (value >= 0 && value <= 1) {
      return value;
    }
  }

  return null;
}

/**
 * Calculate implied probability from market odds
 */
export function calculateProbability(odds: number): string {
  const percentage = (odds * 100).toFixed(2);
  return `${percentage}%`;
}

/**
 * Format market data for display
 */
export function formatMarketForDisplay(market: PolymarketMarket): string {
  const status = market.active ? '✅ Active' : '❌ Closed';
  const tokenInfo = market.tokens
    .map((t) => `${t.name} (${t.ticker})`)
    .join(' vs ');

  return `
📊 Market: ${market.question}
   Category: ${market.category}
   Status: ${status}
   Tokens: ${tokenInfo}
   Ends: ${new Date(market.endDate).toLocaleDateString()}
`.trim();
}

/**
 * Main handler for Polymarket queries
 */
export async function handlePolymarketQuery(
  message: string,
  aiContext?: string
): Promise<{
  markets: PolymarketMarket[];
  odds: number | null;
  probability: string | null;
  analysis: string;
}> {
  // Extract odds if provided
  const userOdds = extractOddsFromMessage(message);
  const probability = userOdds ? calculateProbability(userOdds) : null;

  // Search for matching markets
  let markets: PolymarketMarket[] = [];

  // Check if user is asking about a specific market
  if (message.toLowerCase().includes('list') || message.toLowerCase().includes('all markets')) {
    try {
      markets = await getPolymarketMarkets('', 20);
    } catch (error) {
      console.error('[Polymarket] Error listing markets:', error);
    }
  } else {
    // Search based on query
    const searchTerms = message
      .replace(/polymarket|poly|pm|odds|probability|win/gi, '')
      .trim();

    if (searchTerms.length > 2) {
      markets = await searchPolymarketMarkets(searchTerms);
    }
  }

  // Build analysis string
  let analysis = '';

  if (userOdds !== null && probability) {
    analysis = `
🎯 **ODDS ANALYSIS**

Current Market Odds: ${probability}
Implied Probability: ${(userOdds * 100).toFixed(1)}% chance of YES winning

**What this means:**
- If betting on YES: You risk 1 unit to win ${(1 / userOdds - 1).toFixed(2)} units
- If betting on NO: You risk 1 unit to win ${(1 / (1 - userOdds) - 1).toFixed(2)} units
- Fair midpoint between YES and NO outcomes
- Reflects current market consensus
`.trim();
  }

  if (markets.length > 0) {
    analysis += `

**Matching Markets (${markets.length} found):**

${markets.slice(0, 3).map((m, i) => `${i + 1}. ${m.question} (${m.category})`).join('\n')}
${markets.length > 3 ? `... and ${markets.length - 3} more` : ''}`;
  }

  return {
    markets,
    odds: userOdds,
    probability,
    analysis,
  };
}

/**
 * Generate AI response for Polymarket query
 */
export async function generatePolymarketResponse(
  message: string,
  odds: number | null,
  probability: string | null,
  aiResponseFunc: (msg: string) => Promise<string>
): Promise<string> {
  if (odds === null || probability === null) {
    return 'Please provide market odds (e.g., "0.45", "45%", or "$0.45") along with your Polymarket query.';
  }

  const prompt = `
The user is checking Polymarket prediction market odds.

Market Query: "${message}"
Provided Odds: ${probability}

Analyze the current market odds and provide:
1. What the odds mean (winning probability)
2. Whether the odds seem high or low for this event
3. Risk considerations
4. Current market consensus

Be concise and data-driven. Use the odds to inform your analysis.
  `.trim();

  try {
    const response = await aiResponseFunc(prompt);
    return response;
  } catch (error) {
    console.error('[Polymarket] Error generating AI response:', error);
    return `Unable to analyze odds at this time. Provided odds: ${probability}`;
  }
}

export default {
  getPolymarketMarkets,
  searchPolymarketMarkets,
  getMarketPrice,
  extractOddsFromMessage,
  calculateProbability,
  formatMarketForDisplay,
  handlePolymarketQuery,
  generatePolymarketResponse,
};
