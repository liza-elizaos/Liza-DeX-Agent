import { Connection, PublicKey } from '@solana/web3.js';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
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

  if (req.method === 'POST') {
    // Support POST with userPublicKey in body for user-submitted queries
    try {
      const { userPublicKey } = req.body;

      if (!userPublicKey) {
        return res.status(400).json({
          error: 'Missing userPublicKey',
          message: 'Please provide the user Solana public key'
        });
      }

      const rpcUrl = process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';
      const connection = new Connection(rpcUrl, 'confirmed');

      try {
        const publicKey = new PublicKey(userPublicKey);
        const balanceLamports = await connection.getBalance(publicKey);
        const balanceSOL = balanceLamports / 1e9;

        return res.status(200).json({
          success: true,
          walletAddress: userPublicKey,
          balanceSOL: parseFloat(balanceSOL.toFixed(9)),
          balanceLamports,
          network: process.env.SOLANA_NETWORK || 'mainnet'
        });
      } catch (err) {
        return res.status(400).json({
          error: 'Invalid public key',
          message: 'The provided public key is not valid'
        });
      }
    } catch (error) {
      console.error('[API] Balance POST error:', error);
      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    }
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed. Use GET or POST' });
  }

  // GET - check server wallet (for backwards compatibility)
  try {
    const walletAddress = process.env.SOLANA_PUBLIC_KEY;
    
    if (!walletAddress) {
      return res.status(200).json({
        success: false,
        error: 'Server wallet not configured',
        message: 'SOLANA_PUBLIC_KEY environment variable not set. Please connect your own wallet instead using POST request.',
        instruction: 'Send POST request with { "userPublicKey": "your_address" } to check your balance'
      });
    }

    const rpcUrl = process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';
    const connection = new Connection(rpcUrl, 'confirmed');
    const publicKey = new PublicKey(walletAddress);

    const balanceLamports = await connection.getBalance(publicKey);
    const balanceSOL = balanceLamports / 1e9;

    return res.status(200).json({
      success: true,
      walletAddress,
      balanceSOL: parseFloat(balanceSOL.toFixed(9)),
      balanceLamports,
      network: process.env.SOLANA_NETWORK || 'mainnet'
    });
  } catch (error) {
    console.error('[API] Balance error:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
}
