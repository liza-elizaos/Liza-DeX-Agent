import { Pool } from 'pg';

// Token holder tracking and distribution analysis

export interface HolderInfo {
  owner: string;
  balance: number;
  percentage: string;
}

export interface TransferActivity {
  from: string;
  to: string;
  amount: number;
  ts: Date;
}

export interface HolderAnalysis {
  mint: string;
  totalHolders: number;
  holders: HolderInfo[];
  recentActivity: TransferActivity[];
  updated: Date;
}

let pool: Pool | null = null;

function getPool(): Pool {
  if (!pool) {
    pool = new Pool({ connectionString: process.env.DATABASE_URL });
  }
  return pool;
}

export async function getTopHolders(mint: string): Promise<HolderAnalysis> {
  const pool = getPool();
  const client = await pool.connect();
  try {
    // Get top 20 holders
    const result = await client.query(`
      SELECT owner, balance FROM holders WHERE mint = $1 ORDER BY balance DESC LIMIT 20
    `, [mint]);

    // Calculate distribution
    const totalBalance = result.rows.reduce((sum, r) => sum + parseFloat(r.balance || 0), 0);
    const holders: HolderInfo[] = result.rows.map(r => ({
      owner: r.owner,
      balance: parseFloat(r.balance),
      percentage: ((parseFloat(r.balance) / totalBalance) * 100).toFixed(2),
    }));

    // Get recent activity (transfers in last 24h)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const activity = await client.query(`
      SELECT "from", "to", amount, ts FROM transfers WHERE mint = $1 AND ts > $2 ORDER BY ts DESC LIMIT 50
    `, [mint, oneDayAgo]);

    return {
      mint,
      totalHolders: holders.length,
      holders,
      recentActivity: activity.rows,
      updated: new Date(),
    };
  } finally {
    client.release();
  }
}
