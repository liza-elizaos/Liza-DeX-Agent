// pages/api/calculate-fees.ts
// Dynamic fee calculation based on market cap tiers
import type { NextApiRequest, NextApiResponse } from 'next';

interface FeeCalculation {
  marketCap: number;
  tier: number;
  creatorFee: number;
  protocolFee: number;
  lpFee: number;
  totalFee: number;
  blockchainCost: number;
  platformFee: number;
  platformFeePercent: number;
  totalCost: number;
  breakdown: {
    creator: string;
    protocol: string;
    lp: string;
    platform: string;
  };
}

interface ErrorResponse {
  error: string;
}

const FEE_TIERS = [
  { tier: 1, min: 0, max: 420, creator: 0.300, protocol: 0.930, lp: 0.020 },
  { tier: 2, min: 420, max: 1470, creator: 0.950, protocol: 0.050, lp: 0.200 },
  { tier: 3, min: 1470, max: 2460, creator: 0.900, protocol: 0.050, lp: 0.200 },
  { tier: 4, min: 2460, max: 3440, creator: 0.850, protocol: 0.050, lp: 0.200 },
  { tier: 5, min: 3440, max: 4420, creator: 0.800, protocol: 0.050, lp: 0.200 },
  { tier: 6, min: 4420, max: 9820, creator: 0.750, protocol: 0.050, lp: 0.200 },
  { tier: 7, min: 9820, max: 14740, creator: 0.700, protocol: 0.050, lp: 0.200 },
  { tier: 8, min: 14740, max: 19650, creator: 0.650, protocol: 0.050, lp: 0.200 },
  { tier: 9, min: 19650, max: 24560, creator: 0.600, protocol: 0.050, lp: 0.200 },
  { tier: 10, min: 24560, max: 29470, creator: 0.550, protocol: 0.050, lp: 0.200 },
  { tier: 11, min: 29470, max: 34380, creator: 0.500, protocol: 0.050, lp: 0.200 },
  { tier: 12, min: 34380, max: 39300, creator: 0.450, protocol: 0.050, lp: 0.200 },
  { tier: 13, min: 39300, max: 44210, creator: 0.400, protocol: 0.050, lp: 0.200 },
  { tier: 14, min: 44210, max: 49120, creator: 0.350, protocol: 0.050, lp: 0.200 },
  { tier: 15, min: 49120, max: 54030, creator: 0.300, protocol: 0.050, lp: 0.200 },
  { tier: 16, min: 54030, max: 58940, creator: 0.275, protocol: 0.050, lp: 0.200 },
  { tier: 17, min: 58940, max: 63860, creator: 0.250, protocol: 0.050, lp: 0.200 },
  { tier: 18, min: 63860, max: 68770, creator: 0.225, protocol: 0.050, lp: 0.200 },
  { tier: 19, min: 68770, max: 73681, creator: 0.200, protocol: 0.050, lp: 0.200 },
  { tier: 20, min: 73681, max: 78590, creator: 0.175, protocol: 0.050, lp: 0.200 },
  { tier: 21, min: 78590, max: 83500, creator: 0.150, protocol: 0.050, lp: 0.200 },
  { tier: 22, min: 83500, max: 88400, creator: 0.125, protocol: 0.050, lp: 0.200 },
  { tier: 23, min: 88400, max: 93330, creator: 0.100, protocol: 0.050, lp: 0.200 },
  { tier: 24, min: 93330, max: 98240, creator: 0.075, protocol: 0.050, lp: 0.200 },
  { tier: 25, min: 98240, max: Infinity, creator: 0.050, protocol: 0.050, lp: 0.200 },
];

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<FeeCalculation | ErrorResponse>
) {
  const { marketCap = 28 } = req.query;
  
  try {
    const cap = parseFloat(marketCap as string);
    
    if (isNaN(cap) || cap < 0) {
      return res.status(400).json({ error: 'Invalid market cap' });
    }

    // Find tier for this market cap
    const tier = FEE_TIERS.find(t => cap >= t.min && cap < t.max) || FEE_TIERS[0];
    
    // Calculate fees
    const blockchainCost = 0.0086; // SOL for account creation
    const platformFeePercent = 0.02; // 0.02%
    const platformFee = (blockchainCost * platformFeePercent) / 100;
    const totalFee = tier.creator + tier.protocol + tier.lp;
    const totalCost = blockchainCost + platformFee;

    const response: FeeCalculation = {
      marketCap: cap,
      tier: tier.tier,
      creatorFee: tier.creator,
      protocolFee: tier.protocol,
      lpFee: tier.lp,
      totalFee,
      blockchainCost,
      platformFee,
      platformFeePercent,
      totalCost,
      breakdown: {
        creator: `${tier.creator.toFixed(3)}% → Creator`,
        protocol: `${tier.protocol.toFixed(3)}% → Protocol`,
        lp: `${tier.lp.toFixed(3)}% → Liquidity Pool`,
        platform: `${platformFeePercent.toFixed(4)}% (${platformFee.toFixed(6)} SOL) → Platform`,
      },
    };

    res.status(200).json(response);

  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Fee calculation failed' });
  }
}
