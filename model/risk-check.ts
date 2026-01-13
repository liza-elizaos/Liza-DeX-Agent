import { NextApiRequest, NextApiResponse } from 'next';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  const { mint } = req.body;
  if (!mint) return res.status(400).json({ error: 'mint required' });

  const client = await pool.connect();
  try {
    // Fetch holders for the mint
    const holders = await client.query(`
      SELECT owner, balance FROM holders WHERE mint = $1 ORDER BY balance DESC
    `, [mint]);

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

    const verdict = riskScore > 60 ? 'danger' : riskScore > 40 ? 'caution' : 'safe';

    return res.json({
      mint,
      riskScore,
      risks,
      verdict,
      holderCount: holders.rows.length,
      topHolders: holders.rows.slice(0, 5),
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'server error' });
  } finally {
    client.release();
  }
}
