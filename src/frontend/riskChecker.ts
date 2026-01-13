import { Connection, PublicKey } from '@solana/web3.js';

export interface RiskScore {
  mint: string;
  score: number; // 0-100, higher = riskier
  risks: string[];
  frozen: boolean;
  devHolding: number; // %
  topHolderConcentration: number; // %
  age: number; // days
  verdict: 'safe' | 'caution' | 'danger';
}

// Check if token is freezable (bad sign - dev can freeze transfers)
export async function isTokenFreezable(
  connection: Connection,
  mint: string
): Promise<boolean> {
  try {
    const mintPubkey = new PublicKey(mint);
    const mintInfo = await connection.getParsedAccountInfo(mintPubkey);
    if (!mintInfo.value) return false;
    const parsed = (mintInfo.value.data as any).parsed;
    return parsed?.info?.freezeAuthority ? true : false;
  } catch (e) {
    console.error('Freeze check error:', e);
    return false;
  }
}

export async function performRugPullCheck(
  connection: Connection,
  mint: string
): Promise<RiskScore> {
  const risks: string[] = [];
  let score = 0;

  try {
    // Check 1: Token age (brand new = risky)
    // Placeholder: in production, query slot or timestamp
    const age = 0; // days - would fetch from indexer
    if (age < 1) {
      risks.push('Token < 24 hours old');
      score += 20;
    }

    // Check 2: Freezable tokens (dev control = risky)
    const frozen = await isTokenFreezable(connection, mint);
    if (frozen) {
      risks.push('Token is freezable (dev can disable transfers)');
      score += 30;
    }

    // Check 3: Dev holding concentration (would need indexer data)
    // Placeholder
    const devHolding = 0;
    if (devHolding > 50) {
      risks.push(`Dev holding ${devHolding}% - high concentration risk`);
      score += 25;
    }

    // Check 4: Top holder concentration
    const topHolderConcentration = 0; // would fetch from indexer
    if (topHolderConcentration > 70) {
      risks.push(`Top holder has ${topHolderConcentration}% - rug pull risk`);
      score += 25;
    }

    // Determine verdict
    let verdict: 'safe' | 'caution' | 'danger' = 'safe';
    if (score > 60) verdict = 'danger';
    else if (score > 40) verdict = 'caution';

    return {
      mint,
      score,
      risks,
      frozen,
      devHolding,
      topHolderConcentration,
      age,
      verdict,
    };
  } catch (e) {
    console.error('Risk check error:', e);
    return {
      mint,
      score: 50,
      risks: ['Error performing checks'],
      frozen: false,
      devHolding: 0,
      topHolderConcentration: 0,
      age: 0,
      verdict: 'caution',
    };
  }
}
