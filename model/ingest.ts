import { NextApiRequest, NextApiResponse } from 'next';
import { Pool } from 'pg';
import { Connection, PublicKey } from '@solana/web3.js';

// Simple serverless ingest endpoint. Expects JSON { action: 'token'|'transfer', mint?: string, txSig?: string }
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function fetchTokenInfo(connection: Connection, mint: string) {
  // Placeholder: we can fetch metadata via on-chain or indexer later
  return { mint, symbol: null, name: null };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  const { action } = req.body || {};
  if (!action) return res.status(400).json({ error: 'action required' });

  const client = await pool.connect();
  try {
    if (action === 'token') {
      const { mint, rpc } = req.body;
      if (!mint) return res.status(400).json({ error: 'mint required' });
      const conn = new Connection(rpc || process.env.HELIUS_RPC);
      const info = await fetchTokenInfo(conn, mint);
      await client.query(`INSERT INTO tokens(mint, symbol, name) VALUES($1,$2,$3) ON CONFLICT (mint) DO UPDATE SET last_updated=now()`, [info.mint, info.symbol, info.name]);
      return res.json({ ok: true });
    }

    if (action === 'transfer') {
      const { mint, txSig, from, to, amount, slot, ts } = req.body;
      if (!txSig) return res.status(400).json({ error: 'txSig required' });
      await client.query(`INSERT INTO transfers(mint, tx_sig, "from", "to", amount, slot, ts) VALUES($1,$2,$3,$4,$5,$6,$7) ON CONFLICT (tx_sig) DO NOTHING`, [mint, txSig, from, to, amount, slot, ts]);
      return res.json({ ok: true });
    }

    return res.status(400).json({ error: 'unknown action' });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'server error' });
  } finally {
    client.release();
  }
}
