import { Pool } from 'pg';

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

/**
 * Create or update alert for token
 */
export async function createAlert(
  owner: string,
  mint: string,
  type: string,
  payload: any
): Promise<{ id: string }> {
  if (!owner || !mint || !type) throw new Error('owner, mint, and type required');

  const pool = getPool();
  const client = await pool.connect();
  try {
    const result = await client.query(
      `INSERT INTO alerts(owner, mint, type, payload, enabled, last_triggered) 
       VALUES($1, $2, $3, $4, true, NULL) 
       RETURNING id`,
      [owner, mint, type, JSON.stringify(payload)]
    );
    return { id: result.rows[0].id };
  } finally {
    client.release();
  }
}

/**
 * Get all alerts for owner
 */
export async function getAlerts(owner: string): Promise<Alert[]> {
  if (!owner) throw new Error('owner required');

  const pool = getPool();
  const client = await pool.connect();
  try {
    const result = await client.query(
      `SELECT * FROM alerts WHERE owner = $1`,
      [owner]
    );
    return result.rows;
  } finally {
    client.release();
  }
}

/**
 * Delete alert
 */
export async function deleteAlert(alertId: string): Promise<void> {
  if (!alertId) throw new Error('alertId required');

  const pool = getPool();
  const client = await pool.connect();
  try {
    await client.query(`DELETE FROM alerts WHERE id = $1`, [alertId]);
  } finally {
    client.release();
  }
}
