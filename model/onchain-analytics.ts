import { Pool } from 'pg';
import { Connection } from '@solana/web3.js';

export interface OnchainAnalytics {
  mint: string;
  holders: Array<{ owner: string; balance: string }>;
  topHolderConcentration: number;
  transfers: any[];
  updated: Date;
}

let pool: Pool | null = null;

function getPool(): Pool {
  if (!pool) {
    pool = new Pool({ connectionString: process.env.DATABASE_URL });
  }
  return pool;
}

function getRpcUrl(): string {
  return process.env.HELIUS_RPC || process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';
}

/**
 * Analyze on-chain token metrics
 */
export async function analyzeOnchain(mint: string): Promise<OnchainAnalytics> {
  if (!mint) throw new Error('mint required');

  const pool = getPool();
  const client = await pool.connect();
  try {
    const conn = new Connection(getRpcUrl());
    
    // Get token info from DB
    const tokenData = await client.query('SELECT * FROM tokens WHERE mint = $1', [mint]);
    
    // Fetch holders from DB
    const holders = await client.query(
      `SELECT owner, balance FROM holders WHERE mint = $1 ORDER BY balance DESC LIMIT 20`,
      [mint]
    );
    
    // Calculate concentration
    const totalBalance = holders.rows.reduce((sum, r) => sum + parseFloat(r.balance || 0), 0);
    const topHolderConcentration = holders.rows.length > 0 ? 
      (parseFloat(holders.rows[0].balance || 0) / totalBalance * 100) : 0;

    // Get recent transfers
    const transfers = await client.query(
      `SELECT * FROM transfers WHERE mint = $1 ORDER BY ts DESC LIMIT 50`,
      [mint]
    );

    return {
      mint,
      holders: holders.rows,
      topHolderConcentration,
      transfers: transfers.rows,
      updated: new Date(),
    };
  } finally {
    client.release();
  }
}
