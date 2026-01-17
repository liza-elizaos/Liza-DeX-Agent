import { Pool } from 'pg';

export interface RiskAnalysis {
  mint: string;
  riskScore: number;
  risks: string[];
  verdict: 'safe' | 'caution' | 'danger';
  holderCount: number;
  topHolders: Array<{ owner: string; balance: string }>;
}

let pool: Pool | null = null;

function getPool(): Pool {
  if (!pool) {
    pool = new Pool({ connectionString: process.env.DATABASE_URL });
  }
  return pool;
}

/**
 * Analyze token holder concentration risk
 */
export async function analyzeRisk(mint: string): Promise<RiskAnalysis> {
  if (!mint) throw new Error('mint required');

  const pool = getPool();
  const client = await pool.connect();
  try {
    // Fetch holders for the mint
    const holders = await client.query(
      `SELECT owner, balance FROM holders WHERE mint = $1 ORDER BY balance DESC`,
      [mint]
    );

    const totalBalance = holders.rows.reduce((sum, r) => sum + parseFloat(r.balance || 0), 0);
    
    // Calculate risk metrics
    let riskScore = 0;
    const risks: string[] = [];

    // Risk 1: Top holder concentration > 50%
    if (holders.rows.length > 0) {
      const topHolderPct = (parseFloat(holders.rows[0].balance || 0) / totalBalance * 100);
      if (topHolderPct > 50) {
        risks.push(`Top holder: ${topHolderPct.toFixed(2)}% (rug risk)`);
        riskScore += 30;
      } else if (topHolderPct > 30) {
        risks.push(`Top holder: ${topHolderPct.toFixed(2)}% (caution)`);
        riskScore += 15;
      }
    }

    // Risk 2: Low holder count
    if (holders.rows.length < 5) {
      risks.push(`Low holder count: ${holders.rows.length}`);
      riskScore += 25;
    }

    // Risk 3: Concentration in top 5
    const top5Balance = holders.rows.slice(0, 5).reduce((sum, r) => sum + parseFloat(r.balance || 0), 0);
    const top5Pct = (top5Balance / totalBalance * 100);
    if (top5Pct > 80) {
      risks.push(`Top 5 holders: ${top5Pct.toFixed(2)}% (high concentration)`);
      riskScore += 20;
    }

    const verdict: 'safe' | 'caution' | 'danger' = riskScore > 60 ? 'danger' : riskScore > 40 ? 'caution' : 'safe';

    return {
      mint,
      riskScore,
      risks,
      verdict,
      holderCount: holders.rows.length,
      topHolders: holders.rows.slice(0, 5),
    };
  } finally {
    client.release();
  }
}
