import { NextApiRequest, NextApiResponse } from 'next';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const client = await pool.connect();
  try {
    if (req.method === 'POST') {
      const { owner, mint, type, payload } = req.body;
      const result = await client.query(`INSERT INTO alerts(owner,mint,type,payload,enabled,last_triggered) VALUES($1,$2,$3,$4,true,NULL) RETURNING id`, [owner, mint, type, payload]);
      return res.json({ id: result.rows[0].id });
    }

    if (req.method === 'GET') {
      const { owner } = req.query;
      if (!owner) return res.status(400).json({ error: 'owner required' });
      const result = await client.query(`SELECT * FROM alerts WHERE owner=$1`, [owner]);
      return res.json(result.rows);
    }

    return res.status(405).end();
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'server error' });
  } finally {
    client.release();
  }
}
