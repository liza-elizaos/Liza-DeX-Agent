import { VercelRequest, VercelResponse } from "@vercel/node";

export default function handler(req: VercelRequest, res: VercelResponse) {
  return res.status(200).json({
    env: {
      OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY ? '✅ SET' : '❌ NOT SET',
      OPENROUTER_MODEL: process.env.OPENROUTER_MODEL || 'NOT SET',
      NODE_ENV: process.env.NODE_ENV,
      VERCEL_ENV: process.env.VERCEL_ENV,
    },
    message: 'Environment debug endpoint',
  });
}
