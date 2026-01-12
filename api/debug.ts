import type { VercelRequest, VercelResponse } from "@vercel/node";

export default function handler(req: VercelRequest, res: VercelResponse) {
  const envVars = {
    SOLANA_PUBLIC_KEY: process.env.SOLANA_PUBLIC_KEY ? '✅ SET' : '❌ MISSING',
    SOLANA_PRIVATE_KEY: process.env.SOLANA_PRIVATE_KEY ? '✅ SET' : '❌ MISSING',
    SOLANA_RPC_URL: process.env.SOLANA_RPC_URL ? '✅ SET' : '❌ MISSING',
    OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY ? '✅ SET' : '❌ MISSING',
    OPENROUTER_MODEL: process.env.OPENROUTER_MODEL ? '✅ SET' : '❌ MISSING',
  };

  return res.status(200).json({
    environment: 'production',
    environmentVariables: envVars,
    message: 'If you see ❌ MISSING, go to Vercel dashboard and set that environment variable',
    vercelUrl: process.env.VERCEL_URL || 'N/A',
  });
}
