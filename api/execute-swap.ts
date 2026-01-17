import type { VercelRequest, VercelResponse } from '@vercel/node';

const TOKEN_MAP: Record<string, string> = {
  'sol': 'So11111111111111111111111111111111111111112',
  'usdc': 'EPjFWaLb3crJC2z8rxVmE4Gnjg1d4PjNiYq4a8JqkEH',
  'usdt': 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BcJkxN',
  'msol': 'mSoLzYCxHdgfd3DgZjwwzG8DUR6azJstEWQcW2UCb9',
  'bonk': 'DezXAZ8z7PnrnRJjoBXwYaKe2XTis3Zonw1j1axNac5',
  'jup': 'JUPyiwrYJFskUPiHa7hkeR8JwF3ttBKqrySAv4S3daM',
};

function parseTokenIdentifier(token: string): string {
  const clean = token.toLowerCase().trim();
  
  if (/^[1-9A-HJ-NP-Za-km-z]{44}$/.test(token.trim())) {
    return token.trim();
  }

  if (TOKEN_MAP[clean]) {
    return TOKEN_MAP[clean];
  }

  throw new Error(`Unknown token: ${token}`);
}

async function getJupiterSwapTransaction(
  userPublicKey: string,
  inputMint: string,
  outputMint: string,
  amount: number
) {
  try {
    // Convert amount to lamports
    const decimals = inputMint === TOKEN_MAP['sol'] ? 9 : 6;
    const amountInLamports = Math.floor(amount * Math.pow(10, decimals));

    // Get quote first
    const quoteResponse = await fetch(
      `https://quote-api.jup.ag/v6/quote?inputMint=${inputMint}&outputMint=${outputMint}&amount=${amountInLamports}&slippageBps=50`
    );

    if (!quoteResponse.ok) {
      console.error('[SWAP] Quote error:', quoteResponse.status);
      return null;
    }

    const quote = await quoteResponse.json() as any;

    // Get swap transaction
    const swapResponse = await fetch('https://quote-api.jup.ag/v6/swap', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        quoteResponse: quote,
        userPublicKey: userPublicKey,
        wrapUnwrapSOL: true,
        prioritizationFeeLamports: 1000,
      }),
    });

    if (!swapResponse.ok) {
      console.error('[SWAP] Transaction error:', swapResponse.status);
      return null;
    }

    const swapData = await swapResponse.json() as any;
    return swapData;
  } catch (error) {
    console.error('[SWAP] Error getting transaction:', error);
    return null;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { fromToken, toToken, amount, userPublicKey } = req.body;

    if (!fromToken || !toToken || !amount || !userPublicKey) {
      return res.status(400).json({
        error: 'Missing required parameters: fromToken, toToken, amount, userPublicKey'
      });
    }

    if (amount <= 0) {
      return res.status(400).json({ error: 'Amount must be greater than 0' });
    }

    // Validate wallet address
    if (!/^[1-9A-HJ-NP-Za-km-z]{43,44}$/.test(userPublicKey)) {
      return res.status(400).json({ error: 'Invalid wallet address' });
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

    // Get the swap transaction from Jupiter
    const swapTransaction = await getJupiterSwapTransaction(
      userPublicKey,
      fromMint,
      toMint,
      amount
    );

    if (!swapTransaction) {
      return res.status(500).json({
        success: false,
        error: 'Failed to create swap transaction. Please try again.',
      });
    }

    return res.status(200).json({
      success: true,
      transaction: swapTransaction.swapTransaction,
      simulationResult: swapTransaction.simulationResult || null,
      from: {
        token: fromToken,
        mint: fromMint,
        amount: amount,
      },
      to: {
        token: toToken,
        mint: toMint,
      },
      status: 'ready_to_sign',
      instructions: 'This transaction is ready to be signed by your wallet. Use your Phantom wallet to approve and execute the swap.',
    });
  } catch (error) {
    console.error('[SWAP] Error:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
