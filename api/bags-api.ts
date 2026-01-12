import axios from 'axios';

const BAGS_API = 'https://public-api-v2.bags.fm/api/v1';
const API_KEY = process.env.BAGS_API_KEY || '';

export interface LaunchTokenRequest {
  name: string;
  symbol: string;
  description: string;
  imageUrl?: string;
  initialBuyLamports: number;
  wallet: string;
  tokenMint?: string;
  configKey?: string;
  tipWallet?: string;
  tipLamports?: number;
}

export async function createLaunchTransaction(data: LaunchTokenRequest) {
  try {
    console.log('[BAGS-API] Creating launch transaction:', {
      symbol: data.symbol,
      wallet: data.wallet.slice(0, 8) + '...',
      initialBuy: data.initialBuyLamports,
    });

    const response = await axios.post(
      `${BAGS_API}/token-launch/create-launch-transaction`,
      {
        name: data.name,
        symbol: data.symbol,
        description: data.description,
        imageUrl: data.imageUrl,
        initialBuyLamports: data.initialBuyLamports,
        wallet: data.wallet,
        tokenMint: data.tokenMint,
        configKey: data.configKey,
        tipWallet: data.tipWallet,
        tipLamports: data.tipLamports,
      },
      {
        headers: {
          'x-api-key': API_KEY,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('[BAGS-API] Launch transaction created:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('[BAGS-API] Error creating launch transaction:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to create launch transaction with Bags API');
  }
}

export async function getTokenCreators() {
  try {
    console.log('[BAGS-API] Fetching token creators...');

    const response = await axios.get(
      `${BAGS_API}/token-launch/creator/v3`,
      {
        headers: {
          'x-api-key': API_KEY,
        },
      }
    );

    console.log('[BAGS-API] Fetched creators:', response.data.length);
    return response.data;
  } catch (error: any) {
    console.error('[BAGS-API] Error fetching creators:', error.response?.data || error.message);
    throw new Error('Failed to fetch token creators');
  }
}
