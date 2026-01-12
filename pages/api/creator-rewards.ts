// pages/api/creator-rewards.ts
// Get accumulated creator fees
import type { NextApiRequest, NextApiResponse } from 'next';

interface CreatorReward {
  wallet: string;
  totalAccumulated: number;
  totalClaimed: number;
  claimable: number;
  tokens: Array<{
    mint: string;
    name: string;
    accumulatedFees: number;
    claimedFees: number;
  }>;
}

interface ErrorResponse {
  error: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CreatorReward | ErrorResponse>
) {
  const { wallet } = req.query;

  if (!wallet || typeof wallet !== 'string') {
    return res.status(400).json({ error: 'Creator wallet required' });
  }

  try {
    // Fetch creator's tokens and accumulated fees from database
    const response = await fetch(`${process.env.DATABASE_API}/creators/${wallet}`, {
      headers: {
        'Authorization': `Bearer ${process.env.DATABASE_API_KEY}`,
      },
    });

    if (!response.ok) {
      return res.status(404).json({ error: 'Creator not found' });
    }

    const creatorData = await response.json();

    // Calculate totals
    let totalAccumulated = 0;
    let totalClaimed = 0;
    const tokens: CreatorReward['tokens'] = [];

    for (const token of creatorData.tokens || []) {
      totalAccumulated += token.accumulatedFees || 0;
      totalClaimed += token.claimedFees || 0;
      tokens.push({
        mint: token.mint,
        name: token.name,
        accumulatedFees: token.accumulatedFees || 0,
        claimedFees: token.claimedFees || 0,
      });
    }

    res.status(200).json({
      wallet,
      totalAccumulated,
      totalClaimed,
      claimable: Math.max(0, totalAccumulated - totalClaimed),
      tokens,
    });

  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch rewards' });
  }
}
