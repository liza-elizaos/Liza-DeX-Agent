import type { VercelRequest, VercelResponse } from "@vercel/node";

function generateToken(idea: string) {
  const words = idea.toLowerCase().split(/\s+/).filter(w => w.length > 0);
  const name = words.length > 0 ? (words[0].charAt(0).toUpperCase() + words[0].slice(1) + ' Coin') : 'Meme Coin';
  const symbol = words.map(w => w.charAt(0).toUpperCase()).join('').substring(0, 5) || 'MEM';
  
  return {
    name,
    symbol,
    description: `A viral ${idea} token`,
    theme: 'Meme',
    tweet: `🚀 ${symbol} token launched! #Solana`
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "POST only" });
  }
  
  try {
    const { idea } = req.body || {};
    
    if (!idea || typeof idea !== "string" || idea.trim().length === 0) {
      return res.status(400).json({ error: "Invalid idea" });
    }

    const token = generateToken(idea);
    return res.status(200).json(token);
  } catch (err: any) {
    console.error("[GENERATE] Error:", err);
    return res.status(500).json({ error: err?.message || "Error" });
  }
}
