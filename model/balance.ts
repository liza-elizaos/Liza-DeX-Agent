import { Connection, PublicKey } from '@solana/web3.js';
import type { VercelRequest, VercelResponse } from '@vercel/node';

// List of RPC endpoints with fallback order
const RPC_ENDPOINTS = [
  process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com',
  process.env.BACKUP_RPC_URL || 'https://solana-api.projectserum.com',
  'https://api.mainnet-beta.solana.com',
];

// Helper to fetch balance via RPC with fallback support
async function getBalanceWithFallback(publicKeyStr: string): Promise<number> {
  for (let i = 0; i < RPC_ENDPOINTS.length; i++) {
    const rpcUrl = RPC_ENDPOINTS[i];
    console.log(`[Balance] Attempt ${i + 1}: Trying RPC ${rpcUrl.substring(0, 50)}...`);
    
    try {
      const connection = new Connection(rpcUrl, 'confirmed');
      const publicKey = new PublicKey(publicKeyStr);
      const balance = await Promise.race([
        connection.getBalance(publicKey),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('RPC timeout')), 8000)
        ),
      ]);
      console.log(`[Balance] ✅ Success with RPC endpoint ${i + 1}`);
      return balance;
    } catch (err: any) {
      console.error(`[Balance] ⚠️ RPC ${i + 1} failed:`, err.message);
      if (i === RPC_ENDPOINTS.length - 1) {
        throw new Error(`All RPC endpoints failed. Last error: ${err.message}`);
      }
    }
  }
  throw new Error('All RPC endpoints exhausted');
}

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

      // Validate public key format
      try {
        new PublicKey(userPublicKey);
      } catch {
        return res.status(400).json({
          error: 'Invalid public key',
          message: 'The provided public key is not a valid Solana address'
        });
      }

      try {
        const balanceLamports = await getBalanceWithFallback(userPublicKey);
        const balanceSOL = balanceLamports / 1e9;

        return res.status(200).json({
          success: true,
          walletAddress: userPublicKey,
          balanceSOL: parseFloat(balanceSOL.toFixed(9)),
          balanceLamports,
          network: process.env.SOLANA_NETWORK || 'mainnet'
        });
      } catch (err: any) {
        console.error('[Balance] RPC fetch error:', err.message);
        return res.status(503).json({
          success: false,
          error: 'RPC service unavailable',
          message: 'Cannot connect to Solana RPC. Please try again in a moment.',
          details: err.message
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

    try {
      const balanceLamports = await getBalanceWithFallback(walletAddress);
      const balanceSOL = balanceLamports / 1e9;

      return res.status(200).json({
        success: true,
        walletAddress,
        balanceSOL: parseFloat(balanceSOL.toFixed(9)),
        balanceLamports,
        network: process.env.SOLANA_NETWORK || 'mainnet'
      });
    } catch (err: any) {
      console.error('[Balance] RPC fetch error:', err.message);
      return res.status(503).json({
        success: false,
        error: 'RPC service unavailable',
        message: 'Cannot connect to Solana RPC. Please try again in a moment.',
        details: err.message
      });
    }
  } catch (error) {
    console.error('[API] Balance error:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
}
