import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';

interface LaunchBody {
  tokenName?: string;
  symbol?: string;
  description?: string;
  imageBase64?: string; // optional base64-encoded image
  devBuySol?: number;
  slippage?: number;
  priorityFee?: number;
  pool?: 'pump' | 'bonk';
}

function writeImage(base64: string) {
  const buffer = Buffer.from(base64, 'base64');
  const tmpPath = path.join('/tmp', `upload_${Date.now()}.png`);
  fs.writeFileSync(tmpPath, buffer);
  return tmpPath;
}

async function uploadToPumpIPFS(imagePath: string, name: string, symbol: string, description: string) {
  const form = new FormData();
  form.append('name', name);
  form.append('symbol', symbol);
  form.append('description', description);
  form.append('image', fs.createReadStream(imagePath));
  form.append('showName', 'true');

  const res = await axios.post('https://pump.fun/api/ipfs', form, {
    headers: form.getHeaders(),
    timeout: 30000,
  });

  // API returns metadataUri or uri
  return res.data?.metadataUri || res.data?.uri || null;
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const body: LaunchBody = req.body || {};

    const tokenName = (body.tokenName || 'Token').substring(0, 20);
    const symbol = (body.symbol || 'TKN').toUpperCase().substring(0, 5);
    const description = (body.description || 'Launched on Solana via Shina').substring(0, 280);

    // env checks
    const apiKey = process.env.PUMPPORTAL_API_KEY;
    const devWallet = process.env.DEV_WALLET_ADDRESS;
    if (!apiKey) return res.status(500).json({ error: 'PUMPPORTAL_API_KEY not configured' });
    if (!devWallet) return res.status(500).json({ error: 'DEV_WALLET_ADDRESS not configured' });

    // default config
    const config = {
      devBuySol: typeof body.devBuySol === 'number' ? body.devBuySol : 0.01,
      slippage: typeof body.slippage === 'number' ? body.slippage : 10,
      priorityFee: typeof body.priorityFee === 'number' ? body.priorityFee : 0.0005,
      pool: body.pool || 'pump',
    } as const;

    // If image provided, upload to pump IPFS
    let metadataUri = `https://api.pump.fun/metadata/${symbol}`;
    if (body.imageBase64) {
      const imgPath = writeImage(body.imageBase64);
      try {
        const uploaded = await uploadToPumpIPFS(imgPath, tokenName, symbol, description);
        if (uploaded) metadataUri = uploaded;
      } finally {
        try { fs.unlinkSync(imgPath); } catch (e) { /* ignore */ }
      }
    }

    // Prepare payload to PumpPortal
    const url = `https://pumpportal.fun/api/trade?api-key=${encodeURIComponent(apiKey)}`;

    const payload = {
      action: 'create',
      tokenMetadata: { name: tokenName, symbol, uri: metadataUri },
      denominatedInSol: 'true',
      amount: config.devBuySol,
      slippage: config.slippage,
      priorityFee: config.priorityFee,
      pool: config.pool,
      isMayhemMode: 'false',
    };

    const timeoutMs = 45000;
    const requestPromise = axios.post(url, payload, { headers: { 'Content-Type': 'application/json' }, timeout: timeoutMs });

    const response = await Promise.race([
      requestPromise,
      new Promise((_, reject) => setTimeout(() => reject(new Error('PumpPortal API timeout')), timeoutMs))
    ]) as any;

    if (response?.status === 200 && response?.data?.signature) {
      const mint = response.data.mint || null;
      return res.json({
        success: true,
        message: `Token launched. Tx: ${response.data.signature}`,
        mint,
        tx: response.data.signature,
        pumpfun: mint ? `https://pump.fun/coin/${mint}` : null,
      });
    }

    return res.status(500).json({ success: false, message: (response?.data as any)?.reason || 'Unknown error' });

  } catch (error: any) {
    console.error('[API] Launch error:', error?.message || error);
    return res.status(500).json({ success: false, message: error?.message || 'Launch failed' });
  }
}
