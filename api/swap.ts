import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { fromToken, toToken, amount, userPublicKey, signature } = req.body;

    // Validate inputs
    if (!fromToken || !toToken || !amount) {
      return res.status(400).json({
        error: 'Missing required parameters: fromToken, toToken, amount'
      });
    }

    if (!userPublicKey) {
      return res.status(400).json({
        error: 'User wallet not connected',
        message: 'Please connect your Solana wallet to execute swaps'
      });
    }

    if (amount <= 0) {
      return res.status(400).json({
        error: 'Amount must be greater than 0'
      });
    }

    // Get Jupiter quote
    const jupiterApiUrl = process.env.JUPITER_API_URL || 'https://api.jup.ag/swap/v1/quote';
    
    try {
      const quoteResponse = await fetch(`${jupiterApiUrl}?inputMint=So11111111111111111111111111111111111111112&outputMint=EPjFWaLb3hycctiLUXe9ak3G2wBiRAQsmDF93PI5DBe&amount=${Math.floor(amount * 1e9)}&slippageBps=500`);
      
      if (!quoteResponse.ok) {
        throw new Error('Failed to get Jupiter quote');
      }

      const quote = await quoteResponse.json();

      // Return swap instruction (user will sign this)
      return res.status(200).json({
        success: true,
        message: 'Swap quote received - ready to execute',
        swap: {
          fromToken,
          toToken,
          amount,
          estimatedOutput: quote.outAmount ? quote.outAmount / 1e6 : amount * 0.98,
          inputAmount: amount,
          quote: quote,
          userPublicKey,
          status: 'pending_signature',
          instruction: 'User must sign this transaction with their wallet'
        }
      });
    } catch (jupiterError) {
      return res.status(400).json({
        success: false,
        error: 'Failed to get swap quote',
        fallback: {
          fromToken,
          toToken,
          amount,
          estimatedOutput: amount * 0.98,
          userPublicKey,
          message: 'Estimated output (using 2% slippage estimate)'
        }
      });
    }
  } catch (error) {
    console.error('[API] Swap error:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
}
