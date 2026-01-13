import { NextApiRequest, NextApiResponse } from 'next';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).end();
  const { mint } = req.query;
  if (!mint) return res.status(400).json({ error: 'mint required' });

  const client = await pool.connect();
  try {
    // Get top 20 holders
    const result = await client.query(`
      SELECT owner, balance FROM holders WHERE mint = $1 ORDER BY balance DESC LIMIT 20
    `, [mint]);

    // Calculate distribution
    const totalBalance = result.rows.reduce((sum, r) => sum + parseFloat(r.balance || 0), 0);
    const holders = result.rows.map(r => ({
      owner: r.owner,
      balance: parseFloat(r.balance),
      percentage: ((parseFloat(r.balance) / totalBalance) * 100).toFixed(2),
    }));

    // Get recent activity (transfers in last 24h)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const activity = await client.query(`
      SELECT "from", "to", amount, ts FROM transfers WHERE mint = $1 AND ts > $2 ORDER BY ts DESC LIMIT 50
    `, [mint, oneDayAgo]);

    return res.json({
      mint,
      totalHolders: holders.length,
      holders,
      recentActivity: activity.rows,
      updated: new Date(),
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'server error' });
  } finally {
    client.release();
  }
}
