// pages/api/claim-rewards.ts
// Process creator rewards claim via Phantom
import type { NextApiRequest, NextApiResponse } from 'next';
import { PublicKey, Connection, SystemProgram, Transaction, Keypair } from '@solana/web3.js';
import { sendAndConfirmTransaction } from '@solana/web3.js';

const connection = new Connection(process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com');

interface ClaimRequest {
  creatorWallet: string;
  amount: number;
  transaction: string; // Base64 encoded signed transaction
}

interface ClaimResponse {
  success: boolean;
  txSignature?: string;
  error?: string;
  explorerUrl?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ClaimResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { creatorWallet, amount, transaction } = req.body as ClaimRequest;

    if (!creatorWallet || !amount || !transaction) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    // Validate amount
    if (amount <= 0) {
      return res.status(400).json({ success: false, error: 'Invalid claim amount' });
    }

    try {
      new PublicKey(creatorWallet);
    } catch {
      return res.status(400).json({ success: false, error: 'Invalid creator wallet' });
    }

    // Step 1: Fetch current claimable amount from database
    const creatorResponse = await fetch(`${process.env.DATABASE_API}/creators/${creatorWallet}`, {
      headers: {
        'Authorization': `Bearer ${process.env.DATABASE_API_KEY}`,
      },
    });

    if (!creatorResponse.ok) {
      return res.status(404).json({ success: false, error: 'Creator not found' });
    }

    const creator = await creatorResponse.json();
    const totalAccumulated = creator.tokens.reduce((sum: number, t: any) => sum + (t.accumulatedFees || 0), 0);
    const totalClaimed = creator.tokens.reduce((sum: number, t: any) => sum + (t.claimedFees || 0), 0);
    const claimable = Math.max(0, totalAccumulated - totalClaimed);

    // Validate claim amount doesn't exceed claimable
    if (amount > claimable) {
      return res.status(400).json({ 
        success: false, 
        error: `Claim amount (${amount}) exceeds claimable (${claimable})` 
      });
    }

    // Step 2: Decode transaction
    const txBuffer = Buffer.from(transaction, 'base64');
    const txObj = Transaction.from(txBuffer);

    // Step 3: Send transaction
    try {
      const signature = await connection.sendRawTransaction(txBuffer);
      
      // Confirm transaction
      const confirmation = await connection.confirmTransaction({
        signature,
        blockhash: txObj.recentBlockhash!,
        lastValidBlockHeight: await connection.getBlockHeight(),
      });

      if (!confirmation.value.err) {
        // Step 4: Update database with claim
        const updateResponse = await fetch(`${process.env.DATABASE_API}/creators/${creatorWallet}/claim`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.DATABASE_API_KEY}`,
          },
          body: JSON.stringify({
            amount,
            txSignature: signature,
            timestamp: new Date(),
          }),
        });

        if (!updateResponse.ok) {
          throw new Error('Failed to update claim in database');
        }

        return res.status(200).json({
          success: true,
          txSignature: signature,
          explorerUrl: `https://solscan.io/tx/${signature}`,
        });
      } else {
        return res.status(400).json({
          success: false,
          error: 'Transaction failed on blockchain',
        });
      }
    } catch (txError: any) {
      return res.status(400).json({
        success: false,
        error: `Transaction error: ${txError.message}`,
      });
    }

  } catch (error: any) {
    console.error('Claim error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Claim processing failed',
    });
  }
}
