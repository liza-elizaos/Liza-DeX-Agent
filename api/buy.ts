/**
 * API Route: /api/buy
 * Vercel Serverless Function - Execute buy transactions
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { 
  executeBuyTransaction, 
  executeBuyWithConfirmation,
  BuySellConfig 
} from '../model/buy-sell';

const TRANSACTION_CONFIG: BuySellConfig = {
  rpcUrl: process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com',
  rpcUrlBackup: process.env.SOLANA_RPC_URL_BACKUP || 'https://api.mainnet-beta.solana.com',
  slippageBps: parseInt(process.env.DEFAULT_SLIPPAGE_BPS || '50'),
  maxRetries: parseInt(process.env.MAX_RETRIES || '5'),
  timeout: 60000,
  priorityFee: parseInt(process.env.DEFAULT_GAS_PRICE || '5000'),
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  try {
    const { 
      inputMint, 
      outputMint, 
      amount, 
      userPublicKey,
      executeNow,
      priorityFee 
    } = req.body;

    // Validation
    if (!inputMint || !outputMint || !amount || !userPublicKey) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameters',
        required: ['inputMint', 'outputMint', 'amount', 'userPublicKey'],
      });
    }

    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Amount must be greater than 0',
      });
    }

    // Parse amount as float
    const amountFloat = parseFloat(amount.toString());

    if (isNaN(amountFloat)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid amount',
      });
    }

    console.log(`📥 /api/buy request: ${amountFloat} ${inputMint} → ${outputMint}`);

    const buySellRequest = {
      type: 'buy' as const,
      inputMint,
      outputMint,
      amount: amountFloat,
      userPublicKey,
      priorityFee: priorityFee || TRANSACTION_CONFIG.priorityFee,
    };

    // Execute with or without confirmation
    if (executeNow && process.env.SOLANA_PRIVATE_KEY) {
      console.log('Executing with server-side signing and confirmation...');
      const result = await executeBuyWithConfirmation(
        buySellRequest,
        TRANSACTION_CONFIG,
        process.env.SOLANA_PRIVATE_KEY
      );

      return res.status(result.success ? 200 : 400).json(result);
    } else {
      console.log('Building transaction for client-side signing...');
      const result = await executeBuyTransaction(
        buySellRequest,
        TRANSACTION_CONFIG
      );

      return res.status(result.success ? 200 : 400).json(result);
    }
  } catch (error) {
    console.error('Buy transaction error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
