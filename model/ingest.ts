import { Pool } from 'pg';
import { Connection } from '@solana/web3.js';

// Token ingestion service
// Handles token data and transfer tracking

export interface TokenData {
  mint: string;
  symbol: string | null;
  name: string | null;
}

export interface TransferData {
  mint: string;
  txSig: string;
  from?: string;
  to?: string;
  amount?: number;
  slot?: number;
  ts?: number;
}

export interface IngestResult {
  success: boolean;
  error?: string;
}

let pool: Pool | null = null;

function getPool(): Pool {
  if (!pool) {
    pool = new Pool({ connectionString: process.env.DATABASE_URL });
  }
  return pool;
}

async function fetchTokenInfo(connection: Connection, mint: string): Promise<TokenData> {
  // Placeholder: we can fetch metadata via on-chain or indexer later
  return { mint, symbol: null, name: null };
}

export async function ingestToken(mint: string, rpc?: string): Promise<IngestResult> {
  if (!mint) return { success: false, error: 'mint required' };
  
  const pool = getPool();
  const client = await pool.connect();
  try {
    const rpcUrl = rpc || process.env.HELIUS_RPC || process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';
    const conn = new Connection(rpcUrl);
    const info = await fetchTokenInfo(conn, mint);
    
    await client.query(
      `INSERT INTO tokens(mint, symbol, name) VALUES($1,$2,$3) 
       ON CONFLICT (mint) DO UPDATE SET last_updated=now()`,
      [info.mint, info.symbol, info.name]
    );
    return { success: true };
  } catch (error) {
    console.error('Token ingest error:', error);
    return { success: false, error: String(error) };
  } finally {
    client.release();
  }
}

export async function ingestTransfer(data: TransferData): Promise<IngestResult> {
  if (!data.txSig) return { success: false, error: 'txSig required' };
  
  const pool = getPool();
  const client = await pool.connect();
  try {
    const { mint, txSig, from, to, amount, slot, ts } = data;
    await client.query(
      `INSERT INTO transfers(mint, tx_sig, "from", "to", amount, slot, ts) 
       VALUES($1,$2,$3,$4,$5,$6,$7) 
       ON CONFLICT (tx_sig) DO NOTHING`,
      [mint, txSig, from, to, amount, slot, ts]
    );
    return { success: true };
  } catch (error) {
    console.error('Transfer ingest error:', error);
    return { success: false, error: String(error) };
  } finally {
    client.release();
  }
}
