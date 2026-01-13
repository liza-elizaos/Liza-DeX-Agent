import { NextApiRequest, NextApiResponse } from 'next';
import { Pool } from 'pg';
import { Connection, PublicKey } from '@solana/web3.js';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const RPC = process.env.HELIUS_RPC || process.env.NEXT_PUBLIC_SOLANA_RPC_URL;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).end();
  const { mint } = req.query;
  if (!mint) return res.status(400).json({ error: 'mint required' });

  const client = await pool.connect();
  try {
    const conn = new Connection(RPC as string);
    
    // Get token info from DB or fetch fresh
    let tokenData = await client.query('SELECT * FROM tokens WHERE mint = $1', [mint]);
    
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

    return res.json({
      mint,
      holders: holders.rows,
      topHolderConcentration,
      transfers: transfers.rows,
      updated: new Date(),
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'server error' });
  } finally {
    client.release();
  }
}
