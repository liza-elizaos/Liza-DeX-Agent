import type { VercelRequest, VercelResponse } from "@vercel/node";

export default function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const envStatus = {
      timestamp: new Date().toISOString(),
      environment: 'production',
      vercelUrl: process.env.VERCEL_URL || 'N/A',
      nodeEnv: process.env.NODE_ENV || 'N/A',
      vars: {
        SOLANA_PUBLIC_KEY: process.env.SOLANA_PUBLIC_KEY ? '✅ SET' : '❌ MISSING',
        SOLANA_PRIVATE_KEY: process.env.SOLANA_PRIVATE_KEY ? '✅ SET' : '❌ MISSING',
        SOLANA_RPC_URL: process.env.SOLANA_RPC_URL ? '✅ SET' : '❌ MISSING',
        OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY ? '✅ SET' : '❌ MISSING',
        OPENROUTER_MODEL: process.env.OPENROUTER_MODEL ? '✅ SET' : '❌ MISSING',
      },
      values: {
        SOLANA_PUBLIC_KEY: process.env.SOLANA_PUBLIC_KEY?.substring(0, 20) + '...' || 'N/A',
        SOLANA_RPC_URL: process.env.SOLANA_RPC_URL?.substring(0, 50) + '...' || 'N/A',
      }
    };

    // Check if all required vars are set
    const allSet = Object.values(envStatus.vars).every(v => v === '✅ SET');
    
    return res.status(allSet ? 200 : 500).json(envStatus);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}
