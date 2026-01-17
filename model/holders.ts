import { Pool } from 'pg';

// Type definitions
export interface HolderInfo {
  owner: string;
  balance: number;
  percentage: string;
}

export interface HolderAnalysis {
  mint: string;
  totalHolders: number;
  holders: HolderInfo[];
  recentActivity: Array<{
    from: string;
    to: string;
    amount: number;
    ts: Date;
  }>;
  updated: Date;
}

// Database connection pool
let pool: Pool | null = null;

function getPool(): Pool {
  if (!pool) {
    pool = new Pool({ connectionString: process.env.DATABASE_URL });
  }
  return pool;
}

/**
 * Get top token holders
 */
export async function getTopHolders(mint: string, limit: number = 20): Promise<HolderInfo[]> {
  if (!mint) throw new Error('mint required');

  const pool = getPool();
  const client = await pool.connect();
  try {
    const result = await client.query(
      `SELECT owner, balance FROM holders WHERE mint = $1 ORDER BY balance DESC LIMIT $2`,
      [mint, limit]
    );

    const totalBalance = result.rows.reduce((sum, r) => sum + parseFloat(r.balance || 0), 0);
    
    return result.rows.map(r => ({
      owner: r.owner,
      balance: parseFloat(r.balance),
      percentage: totalBalance > 0 
        ? ((parseFloat(r.balance) / totalBalance) * 100).toFixed(2)
        : '0.00',
    }));
  } finally {
    client.release();
  }
}

/**
 * Get recent token transfers (last 24h)
 */
export async function getRecentActivity(mint: string, hoursBack: number = 24, limit: number = 50): Promise<Array<{
  from: string;
  to: string;
  amount: number;
  ts: Date;
}>> {
  if (!mint) throw new Error('mint required');

  const pool = getPool();
  const client = await pool.connect();
  try {
    const timeAgo = new Date(Date.now() - hoursBack * 60 * 60 * 1000);
    
    const result = await client.query(
      `SELECT "from", "to", amount, ts FROM transfers 
       WHERE mint = $1 AND ts > $2 
       ORDER BY ts DESC LIMIT $3`,
      [mint, timeAgo, limit]
    );

    return result.rows.map(r => ({
      from: r.from,
      to: r.to,
      amount: parseFloat(r.amount || 0),
      ts: new Date(r.ts),
    }));
  } finally {
    client.release();
  }
}

/**
 * Analyze complete holder distribution
 */
export async function analyzeHolders(mint: string): Promise<HolderAnalysis> {
  if (!mint) throw new Error('mint required');

  const [holders, recentActivity] = await Promise.all([
    getTopHolders(mint),
    getRecentActivity(mint),
  ]);

  return {
    mint,
    totalHolders: holders.length,
    holders,
    recentActivity,
    updated: new Date(),
  };
}
