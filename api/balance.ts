import { VercelRequest, VercelResponse } from '@vercel/node';
import { Connection, PublicKey } from '@solana/web3.js';

const RPC_ENDPOINTS = [
  process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com',
  process.env.SOLANA_RPC_URL_BACKUP || 'https://solana-api.projectserum.com',
];

async function getBalanceWithFallback(publicKeyStr: string): Promise<number> {
  let lastError: Error | null = null;
  
  for (let i = 0; i < RPC_ENDPOINTS.length; i++) {
    const rpcUrl = RPC_ENDPOINTS[i];
    
    try {
      const connection = new Connection(rpcUrl, 'confirmed');
      const publicKey = new PublicKey(publicKeyStr);
      const balance = await Promise.race([
        connection.getBalance(publicKey),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('RPC timeout')), 10000)
        ),
      ]);
      console.log(`✅ Successfully fetched balance from RPC: ${rpcUrl}`);
      return balance;
    } catch (err: any) {
      lastError = err;
      console.warn(`❌ RPC failed (${i + 1}/${RPC_ENDPOINTS.length}): ${rpcUrl} - ${err.message}`);
      if (i < RPC_ENDPOINTS.length - 1) {
        // Wait a bit before trying next endpoint
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
  }
  
  throw new Error(`All RPC endpoints failed. Last error: ${lastError?.message || 'Unknown error'}`);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    try {
      const { userPublicKey } = req.body;

      if (!userPublicKey) {
        return res.status(400).json({
          error: 'Missing userPublicKey',
          message: 'Please provide the user Solana public key'
        });
      }

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
          network: 'mainnet'
        });
      } catch (err: any) {
        console.error('Balance check error:', err.message);
        return res.status(503).json({
          success: false,
          error: 'RPC service unavailable',
          message: err.message || 'Cannot connect to Solana RPC'
        });
      }
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const walletAddress = process.env.SOLANA_PUBLIC_KEY;
  
  if (!walletAddress) {
    return res.status(200).json({
      success: false,
      error: 'Server wallet not configured',
      instruction: 'Send POST request with { "userPublicKey": "your_address" }'
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
      network: 'mainnet'
    });
  } catch (err: any) {
    return res.status(503).json({
      success: false,
      error: 'RPC service unavailable'
    });
  }
}
