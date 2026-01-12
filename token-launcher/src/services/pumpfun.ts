import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';

interface TokenMetadata {
  name: string;
  symbol: string;
  description: string;
  image: string; // base64 or URI
  twitter?: string;
  telegram?: string;
  website?: string;
}

interface LaunchConfig {
  devBuySol: number;
  slippage: number;
  priorityFee: number;
  pool: 'pump' | 'bonk';
}

interface LaunchResult {
  mint: string;
  tx: string;
  success: boolean;
  message: string;
}

export async function uploadToPumpIPFS(
  imagePath: string,
  metadata: TokenMetadata
): Promise<{ metadataUri: string }> {
  try {
    console.log('[PUMP] Uploading to IPFS...');

    // Read image
    const imageBuffer = fs.readFileSync(imagePath);
    const form = new FormData();

    form.append('name', metadata.name);
    form.append('symbol', metadata.symbol);
    form.append('description', metadata.description);
    form.append('image', imageBuffer, path.basename(imagePath));
    form.append('showName', 'true');

    if (metadata.twitter) form.append('twitter', metadata.twitter);
    if (metadata.telegram) form.append('telegram', metadata.telegram);
    if (metadata.website) form.append('website', metadata.website);

    const response = await axios.post('https://pump.fun/api/ipfs', form, {
      headers: form.getHeaders(),
      timeout: 30000,
    });

    console.log('[PUMP] IPFS Response:', response.data);

    return {
      metadataUri: response.data.metadataUri || response.data.uri,
    };
  } catch (error) {
    console.error('[PUMP] IPFS Error:', error instanceof Error ? error.message : error);
    throw new Error('Failed to upload to IPFS');
  }
}

export async function launchToken(
  metadata: TokenMetadata,
  metadataUri: string,
  config: LaunchConfig
): Promise<LaunchResult> {
  try {
    console.log('[PUMP] Launching token via PumpPortal...');

    const apiKey = process.env.PUMPPORTAL_API_KEY;
    if (!apiKey) throw new Error('PUMPPORTAL_API_KEY not set');

    const devWalletAddress = process.env.DEV_WALLET_ADDRESS;
    if (!devWalletAddress) throw new Error('DEV_WALLET_ADDRESS not set');

    const tokenMetadata = {
      name: metadata.name,
      symbol: metadata.symbol,
      uri: metadataUri,
    };

    console.log('[PUMP] Token Metadata:', tokenMetadata);
    console.log('[PUMP] Launch Config:', {
      amount: config.devBuySol,
      slippage: config.slippage,
      priorityFee: config.priorityFee,
      pool: config.pool,
    });

    const url = `https://pumpportal.fun/api/trade?api-key=${apiKey}`;
    console.log('[PUMP] Calling API:', url);

    // Use Promise.race with timeout
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('PumpPortal API timeout (45s)')), 45000)
    );

    const requestPromise = axios.post(
      url,
      {
        action: 'create',
        tokenMetadata,
        denominatedInSol: 'true',
        amount: config.devBuySol,
        slippage: config.slippage,
        priorityFee: config.priorityFee,
        pool: config.pool,
        isMayhemMode: 'false',
      },
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 45000,
      }
    );

    const response = await Promise.race([requestPromise, timeoutPromise]) as any;

    console.log('[PUMP] Launch Response:', response?.data);

    if (response?.status === 200 && response?.data?.signature) {
      return {
        mint: response.data.mint || 'unknown',
        tx: response.data.signature,
        success: true,
        message: `Token launched! Tx: ${response.data.signature}`,
      };
    } else {
      throw new Error((response?.data as any)?.reason || 'Unknown error from API');
    }
  } catch (error) {
    console.error('[PUMP] Launch Error:', error instanceof Error ? error.message : error);

    return {
      mint: 'failed',
      tx: '',
      success: false,
      message: `Launch failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

export async function createTokenMetadata(
  name: string,
  symbol: string,
  lore: string,
  imageUrl?: string
): Promise<TokenMetadata> {
  return {
    name: name.substring(0, 20),
    symbol: symbol.substring(0, 5).toUpperCase(),
    description: lore.substring(0, 280),
    image: imageUrl || '',
    website: 'https://pumpportal.fun',
  };
}
