import type { VercelRequest, VercelResponse } from "@vercel/node";
import axios from 'axios';

// Map token names to mint addresses
const TOKEN_MAP: Record<string, string> = {
  // SOL tokens
  'sol': 'So11111111111111111111111111111111111111112',
  'usdc': 'EPjFWaLb3crJC2z8rxVmE4Gnjg1d4PjNiYq4a8JqkEH',
  'usdt': 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BcJkxN',
  'msol': 'mSoLzYCxHdgfd3DgZjwwzG8DUR6azJstEWQcW2UCb9',
  'mango': 'MangoCzJ36AjZyKwVj3VnYU4GTonjfVEnJmvvWaxLac',
  'bonk': 'DezXAZ8z7PnrnRJjoBXwYaKe2XTis3Zonw1j1axNac5',
  'jup': 'JUPyiwrYJFskUPiHa7hkeR8JwF3ttBKqrySAv4S3daM',
  'kin': 'Kin3gmeNyStCG9kD9B7A6Cq9u3vf3S3PgVCHvRAXVs1',
};

// Get token price from Jupiter
async function getTokenPrice(mint: string): Promise<number> {
  try {
    const response = await axios.get(
      `https://api.jup.ag/price?ids=${mint}`,
      { timeout: 5000 }
    );

    if (response.data?.data?.[mint]?.price) {
      return parseFloat(response.data.data[mint].price);
    }

    return 0;
  } catch (error) {
    console.warn(`[SWAP] Failed to get Jupiter price for ${mint}`);
    return 0;
  }
}

// Parse token identifier (name or mint address)
function parseTokenIdentifier(token: string): string {
  const clean = token.toLowerCase().trim();
  
  // Check if it's a mint address (44 chars, base58)
  if (/^[1-9A-HJ-NP-Za-km-z]{44}$/.test(token.trim())) {
    return token.trim();
  }

  // Check token map
  if (TOKEN_MAP[clean]) {
    return TOKEN_MAP[clean];
  }

  // Try to match common token names
  const similarKeys = Object.keys(TOKEN_MAP).filter(key => 
    key.includes(clean) || clean.includes(key)
  );

  if (similarKeys.length > 0) {
    return TOKEN_MAP[similarKeys[0]];
  }

  throw new Error(`Unknown token: ${token}. Use token name (e.g., 'SOL', 'USDC') or mint address.`);
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'GET') {
    return res.status(200).json({
      status: '✅ Swap API is ready',
      method: 'POST',
      example: {
        fromToken: 'SOL',
        toToken: 'USDC',
        amount: 10
      },
      supportedTokens: Object.keys(TOKEN_MAP)
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { fromToken, toToken, amount, userPublicKey } = req.body;

    // Validate inputs
    if (!fromToken || !toToken || !amount) {
      return res.status(400).json({
        error: 'Missing required parameters: fromToken, toToken, amount'
      });
    }

    if (amount <= 0) {
      return res.status(400).json({
        error: 'Amount must be greater than 0'
      });
    }

    // Parse token addresses
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

    // Get prices for both tokens
    const [fromPrice, toPrice] = await Promise.all([
      getTokenPrice(fromMint),
      getTokenPrice(toMint)
    ]);

    // Calculate estimated output
    let estimatedOutput = amount;
    if (fromPrice > 0 && toPrice > 0) {
      estimatedOutput = (amount * fromPrice) / toPrice;
    }

    // Apply slippage (0.5%)
    const slippageAmount = estimatedOutput * 0.005;
    const estimatedOutputWithSlippage = estimatedOutput - slippageAmount;

    // Get Jupiter quote if available
    try {
      const jupiterUrl = `https://api.jup.ag/swap/v1/quote?inputMint=${fromMint}&outputMint=${toMint}&amount=${Math.floor(amount * 1e9)}&slippageBps=500`;
      const quoteResponse = await axios.get(jupiterUrl, { timeout: 5000 });

      if (quoteResponse.data?.outAmount) {
        const decimals = quoteResponse.data.outputDecimals || 6;
        const precisOutput = parseInt(quoteResponse.data.outAmount) / Math.pow(10, decimals);
        
        return res.status(200).json({
          success: true,
          swap: {
            from: {
              token: fromToken,
              mint: fromMint,
              amount: amount,
              price: fromPrice
            },
            to: {
              token: toToken,
              mint: toMint,
              estimatedAmount: precisOutput,
              price: toPrice
            },
            slippage: '0.5%',
            status: 'quote_ready',
            message: 'Swap quote ready. User must sign with wallet to execute.',
            userPublicKey: userPublicKey || 'not_connected'
          }
        });
      }
    } catch (jupiterError) {
      console.warn('[SWAP] Jupiter API error, using fallback calculation');
    }

    // Fallback response
    return res.status(200).json({
      success: true,
      swap: {
        from: {
          token: fromToken,
          mint: fromMint,
          amount: amount,
          price: fromPrice
        },
        to: {
          token: toToken,
          mint: toMint,
          estimatedAmount: estimatedOutputWithSlippage,
          price: toPrice
        },
        slippage: '0.5%',
        status: 'quote_ready',
        message: 'Swap quote ready (using fallback pricing). User must sign with wallet to execute.',
        userPublicKey: userPublicKey || 'not_connected'
      }
    });
  } catch (error) {
    console.error('[SWAP] Error:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
}
