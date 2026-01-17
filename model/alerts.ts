import { Pool } from 'pg';

// Alert management module

export interface Alert {
  id: string;
  owner: string;
  mint: string;
  type: string;
  payload: any;
  enabled: boolean;
  last_triggered?: Date;
}

let pool: Pool | null = null;

function getPool(): Pool {
  if (!pool) {
    pool = new Pool({ connectionString: process.env.DATABASE_URL });
  }
  return pool;
}

export async function createAlert(
  owner: string,
  mint: string,
  type: string,
  payload: any
): Promise<string> {
  const pool = getPool();
  const client = await pool.connect();
  try {
    const result = await client.query(
      `INSERT INTO alerts(owner,mint,type,payload,enabled,last_triggered) 
       VALUES($1,$2,$3,$4,true,NULL) RETURNING id`,
      [owner, mint, type, payload]
    );
    return result.rows[0].id;
  } finally {
    client.release();
  }
}

export async function getUserAlerts(owner: string): Promise<Alert[]> {
  const pool = getPool();
  const client = await pool.connect();
  try {
    const result = await client.query(`SELECT * FROM alerts WHERE owner=$1`, [owner]);
    return result.rows;
  } finally {
    client.release();
  }
}
