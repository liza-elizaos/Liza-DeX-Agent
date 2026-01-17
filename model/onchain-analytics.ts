import { Pool } from 'pg';
import { Connection } from '@solana/web3.js';

// On-chain analytics module

export interface TokenAnalytics {
  mint: string;
  holders: any[];
  topHolderConcentration: number;
  transfers: any[];
  updated: Date;
}

const RPC = process.env.HELIUS_RPC || process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';

let pool: Pool | null = null;

function getPool(): Pool {
  if (!pool) {
    pool = new Pool({ connectionString: process.env.DATABASE_URL });
  }
  return pool;
}

export async function getTokenAnalytics(mint: string): Promise<TokenAnalytics> {
  const pool = getPool();
  const client = await pool.connect();
  try {
    const conn = new Connection(RPC as string);
    
    // Get token info from DB or fetch fresh
    await client.query('SELECT * FROM tokens WHERE mint = $1', [mint]);
    
    // Fetch holders from DB
    const holders = await client.query(`
      SELECT owner, balance FROM holders WHERE mint = $1 ORDER BY balance DESC LIMIT 20
    `, [mint]);
    
    // Calculate concentration
    const totalBalance = holders.rows.reduce((sum, r) => sum + parseFloat(r.balance || 0), 0);
    const topHolderConcentration = holders.rows.length > 0 ? 
      (parseFloat(holders.rows[0].balance || 0) / totalBalance * 100) : 0;

    // Get recent transfers
    const transfers = await client.query(`
      SELECT * FROM transfers WHERE mint = $1 ORDER BY ts DESC LIMIT 50
    `, [mint]);

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
