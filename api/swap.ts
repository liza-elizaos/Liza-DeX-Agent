import { VercelRequest, VercelResponse } from '@vercel/node';

const TOKEN_MAP: Record<string, string> = {
  'sol': 'So11111111111111111111111111111111111111112',
  'usdc': 'EPjFWaLb3crJC2z8rxVmE4Gnjg1d4PjNiYq4a8JqkEH',
  'usdt': 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BcJkxN',
  'msol': 'mSoLzYCxHdgfd3DgZjwwzG8DUR6azJstEWQcW2UCb9',
  'bonk': 'DezXAZ8z7PnrnRJjoBXwYaKe2XTis3Zonw1j1axNac5',
  'jup': 'JUPyiwrYJFskUPiHa7hkeR8JwF3ttBKqrySAv4S3daM',
};

async function getJupiterQuote(inputMint: string, outputMint: string, amount: number) {
  try {
    // Convert amount to lamports (accounting for decimals)
    const decimals = inputMint === TOKEN_MAP['sol'] ? 9 : 6;
    const amountInLamports = Math.floor(amount * Math.pow(10, decimals));

    const jupiterApi = process.env.JUPITER_QUOTE_API || 'https://api.jup.ag/quote';
    const apiKey = process.env.JUPITER_API_KEY ? `&token=${process.env.JUPITER_API_KEY}` : '';
    
    const response = await fetch(
      `${jupiterApi}?inputMint=${inputMint}&outputMint=${outputMint}&amount=${amountInLamports}&slippageBps=50${apiKey}`
    );

    if (!response.ok) {
      console.error('[SWAP] Jupiter quote error:', response.status, await response.text());
      return null;
    }

    const data = await response.json() as any;
    return data;
  } catch (error) {
    console.error('[SWAP] Error fetching quote:', error);
    return null;
  }
}

async function getTokenPrice(mint: string): Promise<number> {
  try {
    const jupiterPriceApi = process.env.JUPITER_PRICE_API || 'https://api.jup.ag/price';
    const response = await fetch(
      `${jupiterPriceApi}?ids=${mint}`
    );
    if (!response.ok) return 0;
    
    const data = await response.json() as any;
    if (data?.data?.[mint]?.price) {
      return parseFloat(data.data[mint].price);
    }
    return 0;
  } catch (error) {
    console.error('[PRICE] Error:', error);
    return 0;
  }
}

function parseTokenIdentifier(token: string): string {
  const clean = token.toLowerCase().trim();
  
  // Check if it's a valid Solana address (44 chars, base58)
  if (/^[1-9A-HJ-NP-Za-km-z]{44}$/.test(token.trim())) {
    return token.trim();
  }

  if (TOKEN_MAP[clean]) {
    return TOKEN_MAP[clean];
  }

  throw new Error(`Unknown token: ${token}`);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    return res.status(200).json({
      status: '✅ Swap API is ready',
      method: 'POST',
      supportedTokens: Object.keys(TOKEN_MAP)
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { fromToken, toToken, amount, userPublicKey } = req.body;

    if (!fromToken || !toToken || !amount) {
      return res.status(400).json({
        error: 'Missing required parameters: fromToken, toToken, amount'
      });
    }

    if (amount <= 0) {
      return res.status(400).json({ error: 'Amount must be greater than 0' });
    }

    let fromMint: string;
    let toMint: string;

    try {
      fromMint = parseTokenIdentifier(fromToken);
      toMint = parseTokenIdentifier(toToken);
    } catch (error) {
      return res.status(400).json({
        error: error instanceof Error ? error.message : 'Invalid token',
        supportedTokens: Object.keys(TOKEN_MAP)
      });
    }

    const [fromPrice, toPrice] = await Promise.all([
      getTokenPrice(fromMint),
      getTokenPrice(toMint)
    ]);

    // Get Jupiter quote for accurate prices and output
    const quote = await getJupiterQuote(fromMint, toMint, amount);
    
    let estimatedOutput = amount;
    let estimatedOutputWithSlippage = amount;

    if (quote) {
      // Use Jupiter quote data
      const outputDecimals = toMint === TOKEN_MAP['sol'] ? 9 : 6;
      estimatedOutput = quote.outAmount / Math.pow(10, outputDecimals);
      estimatedOutputWithSlippage = quote.outAmountWithSlippage / Math.pow(10, outputDecimals);
    } else if (fromPrice > 0 && toPrice > 0) {
      // Fallback to price-based calculation
      estimatedOutput = (amount * fromPrice) / toPrice;
      const slippageAmount = estimatedOutput * 0.005;
      estimatedOutputWithSlippage = estimatedOutput - slippageAmount;
    }

    return res.status(200).json({
      success: true,
      swap: {
        from: {
          token: fromToken,
          mint: fromMint,
          amount: amount,
          price: fromPrice,
          symbol: Object.keys(TOKEN_MAP).find(k => TOKEN_MAP[k] === fromMint)?.toUpperCase() || 'UNKNOWN'
        },
        to: {
          token: toToken,
          mint: toMint,
          estimatedAmount: estimatedOutputWithSlippage,
          price: toPrice,
          symbol: Object.keys(TOKEN_MAP).find(k => TOKEN_MAP[k] === toMint)?.toUpperCase() || 'UNKNOWN'
        },
        slippage: '0.5%',
        status: 'quote_ready',
        userPublicKey: userPublicKey || 'not_connected'
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
