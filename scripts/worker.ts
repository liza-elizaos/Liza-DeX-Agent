import { Pool } from 'pg';
import { Connection, PublicKey } from '@solana/web3.js';
import cron from 'node-cron';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const RPC = process.env.HELIUS_RPC || process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';
const conn = new Connection(RPC as string);
const HELIUS_KEY = process.env.HELIUS_API_KEY;

// Fetch recent token transfers and updates from Helius
async function pollHeliusForTransfers() {
  const client = await pool.connect();
  try {
    if (!HELIUS_KEY) {
      console.log('HELIUS_API_KEY not set - skipping Helius poll');
      return;
    }

    // Get all mints from watchlists
    const watchlists = await client.query('SELECT DISTINCT mint FROM watchlists');
    
    for (const row of watchlists.rows) {
      const mint = row.mint;
      
      // Query Helius for token metadata
      const url = `https://api.helius.xyz/v0/token/metadata?token=${mint}&api-key=${HELIUS_KEY}`;
      
      try {
        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          
          // Update token info
          await client.query(`
            INSERT INTO tokens(mint, symbol, name, last_updated) 
            VALUES($1, $2, $3, now())
            ON CONFLICT (mint) DO UPDATE SET 
              symbol = EXCLUDED.symbol,
              name = EXCLUDED.name,
              last_updated = now()
          `, [mint, data.symbol, data.name]);

          console.log(`Updated token ${mint}: ${data.symbol}`);
        }
      } catch (e) {
        console.error(`Error fetching Helius data for ${mint}:`, e);
      }
    }

    console.log('Worker tick - Helius poll complete');
  } catch (e) {
    console.error('Helius poll error:', e);
  } finally {
    client.release();
  }
}

// Check for alert triggers
async function checkAlertTriggers() {
  const client = await pool.connect();
  try {
    // Get all active alerts
    const alerts = await client.query(`
      SELECT id, owner, mint, type, payload FROM alerts WHERE enabled = true
    `);

    for (const alert of alerts.rows) {
      const { id, owner, mint, type, payload } = alert;
      
      if (type === 'volume_spike') {
        // Check if 24h volume > threshold
        const transfers = await client.query(`
          SELECT SUM(CAST(amount as NUMERIC)) as total FROM transfers 
          WHERE mint = $1 AND ts > now() - interval '24 hours'
        `, [mint]);
        
        const volume = parseFloat(transfers.rows[0].total || 0);
        const threshold = payload.threshold || 1000000;
        
        if (volume > threshold) {
          await client.query(`
            UPDATE alerts SET last_triggered = now() WHERE id = $1
          `, [id]);
          console.log(`Alert triggered for ${owner}: volume spike on ${mint}`);
        }
      }
      
      if (type === 'holder_concentration') {
        // Check if top holder exceeds threshold
        const topHolder = await client.query(`
          SELECT balance FROM holders WHERE mint = $1 ORDER BY balance DESC LIMIT 1
        `, [mint]);
        
        if (topHolder.rows.length > 0) {
          const total = await client.query(`
            SELECT SUM(CAST(balance as NUMERIC)) as total FROM holders WHERE mint = $1
          `, [mint]);
          
          const concentration = (parseFloat(topHolder.rows[0].balance) / parseFloat(total.rows[0].total || 1)) * 100;
          const threshold = payload.threshold || 50;
          
          if (concentration > threshold) {
            await client.query(`
              UPDATE alerts SET last_triggered = now() WHERE id = $1
            `, [id]);
            console.log(`Alert triggered for ${owner}: holder concentration ${concentration.toFixed(2)}% on ${mint}`);
          }
        }
      }
    }
  } catch (e) {
    console.error('Alert check error:', e);
  } finally {
    client.release();
  }
}

// Run Helius polling every 2 minutes
cron.schedule('*/2 * * * *', () => {
  console.log('Worker tick - polling Helius');
  pollHeliusForTransfers();
});

// Check alert triggers every 1 minute
cron.schedule('* * * * *', () => {
  console.log('Worker tick - checking alerts');
  checkAlertTriggers();
});

console.log('Enhanced worker started with Helius integration and alert checks');
