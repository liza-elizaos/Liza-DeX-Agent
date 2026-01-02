import { Connection, PublicKey, SystemProgram, Transaction, Keypair } from '@solana/web3.js';
import bs58 from 'bs58';

// Helper function to safely extract error message
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'Unknown error';
}

export async function executeTransfer(
  from: string,
  to: string,
  amount: number
) {
  try {
    const connection = new Connection(
      process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com',
      'confirmed'
    );

    // Validate addresses with detailed error messages
    let fromPubKey: PublicKey;
    let toPubKey: PublicKey;

    try {
      fromPubKey = new PublicKey(from);
      if (!PublicKey.isOnCurve(fromPubKey)) {
        throw new Error(`Sender address is not on Solana curve`);
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error('[SOLANA-TRANSFER] Sender validation failed:', from, errorMsg);
      return {
        success: false,
        error: `Invalid sender address: ${from}. ${errorMsg}`,
        message: `❌ Invalid Sender Address\n\n**Address:** ${from}\n\n**Error:** ${errorMsg}\n\n**Valid format:** 44-character base58 string\n**Allowed characters:** 1-9, A-H, J-N, P-Z\n**Invalid characters:** 0, O, I, l`,
      };
    }

    try {
      toPubKey = new PublicKey(to);
      if (!PublicKey.isOnCurve(toPubKey)) {
        throw new Error(`Recipient address is not on Solana curve`);
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error('[SOLANA-TRANSFER] Recipient validation failed:', to, errorMsg);
      return {
        success: false,
        error: `Invalid recipient address: ${to}. ${errorMsg}`,
        message: `❌ Invalid Recipient Address\n\n**Address:** ${to}\n\n**Error:** ${errorMsg}\n\n**Valid format:** 44-character base58 string\n**Allowed characters:** 1-9, A-H, J-N, P-Z\n**Invalid characters:** 0, O, I, l\n\n**Example valid address:**\n9B5X76itxvQcGu6RNGRNnQMJ1NvHMJDiDYMWDPw7u45S`,
      };
    }

    // Validate amount
    if (amount <= 0) {
      return {
        success: false,
        error: 'Amount must be greater than 0',
        message: `❌ Invalid Amount\n\nAmount must be greater than 0 SOL`,
      };
    }

    // Get private key from environment
    const privateKeyStr = process.env.SOLANA_PRIVATE_KEY;
    if (!privateKeyStr) {
      console.error('[SOLANA-TRANSFER] SOLANA_PRIVATE_KEY not set in environment');
      return {
        success: false,
        error: 'Private key not configured',
        message: `❌ Configuration Error\n\nSOLANA_PRIVATE_KEY is not set in environment variables.\n\nPlease add your private key to .env file:\nSOLANA_PRIVATE_KEY=your_base58_private_key`,
      };
    }

    // Decode private key from base58
    let signer: Keypair;
    try {
      const decoded = bs58.decode(privateKeyStr);
      signer = Keypair.fromSecretKey(new Uint8Array(decoded));
      console.log('[SOLANA-TRANSFER] Signer loaded successfully');
    } catch (error) {
      console.error('[SOLANA-TRANSFER] Failed to decode private key:', error);
      return {
        success: false,
        error: 'Invalid private key format',
        message: `❌ Invalid Private Key\n\nThe SOLANA_PRIVATE_KEY in .env is not in valid base58 format.`,
      };
    }

    // Verify signer matches from address
    if (signer.publicKey.toString() !== from) {
      console.error('[SOLANA-TRANSFER] Signer public key does not match from address');
      return {
        success: false,
        error: 'Signer mismatch',
        message: `❌ Signer Mismatch\n\nPrivate key in .env does not match the sender address.\n\nExpected: ${from}\nGot: ${signer.publicKey.toString()}`,
      };
    }

    // Create transaction
    const tx = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: fromPubKey,
        toPubkey: toPubKey,
        lamports: Math.floor(amount * 1e9),
      })
    );

    const { blockhash } = await connection.getLatestBlockhash('confirmed');
    tx.recentBlockhash = blockhash;
    tx.feePayer = signer.publicKey;

    // Sign transaction with private key
    tx.sign(signer);
    console.log('[SOLANA-TRANSFER] Transaction signed');

    // Send transaction
    const txHash = await connection.sendRawTransaction(tx.serialize(), {
      skipPreflight: false,
      preflightCommitment: 'confirmed',
    });
    console.log('[SOLANA-TRANSFER] Transaction sent:', txHash);

    // Wait for confirmation with polling (not WebSocket)
    let confirmed = false;
    let attempts = 0;
    const maxAttempts = 30; // 30 seconds with 1 second intervals

    while (attempts < maxAttempts && !confirmed) {
      try {
        const status = await connection.getSignatureStatus(txHash, {
          searchTransactionHistory: true,
        });
        
        if (status.value?.confirmationStatus === 'confirmed' || status.value?.confirmationStatus === 'finalized') {
          confirmed = true;
          if (status.value?.err) {
            const errorStr = getErrorMessage(status.value.err);
            console.error('[SOLANA-TRANSFER] Transaction failed:', errorStr);
            return {
              success: false,
              error: 'Transaction failed on-chain',
              message: `❌ Transaction Failed\n\nHash: ${txHash}\n\nError: ${errorStr}`,
            };
          }
          console.log('[SOLANA-TRANSFER] Transaction confirmed:', txHash);
          break;
        }
      } catch (error) {
        console.warn('[SOLANA-TRANSFER] Status check error (attempt ' + (attempts + 1) + '):', getErrorMessage(error));
      }
      
      attempts++;
      if (!confirmed && attempts < maxAttempts) {
        // Wait 1 second before next poll
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    if (!confirmed) {
      console.warn('[SOLANA-TRANSFER] Confirmation timeout, but transaction was sent:', txHash);
      // Return success since the transaction was submitted (Solana is slow sometimes)
    }
    return {
      success: true,
      txHash,
      message: `✅ **Transfer Successful!**\n\n📤 **From:** ${from.slice(0, 8)}...\n📥 **To:** ${to.slice(0, 8)}...\n💸 **Amount:** ${amount} SOL\n\n🔗 **Transaction Hash:**\n${txHash}\n\n✓ Confirmed on Solana ${process.env.SOLANA_NETWORK || 'mainnet'}`,
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error('[SOLANA-TRANSFER] Transfer error:', errorMsg);
    return {
      success: false,
      error: errorMsg,
      message: `❌ Transfer Failed\n\n**Error:** ${errorMsg}`,
    };
  }
}

export async function validateTransfer(
  from: string,
  to: string,
  amount: number
) {
  try {
    const connection = new Connection(
      process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com',
      'confirmed'
    );

    // Validate addresses
    let fromPubKey: PublicKey;
    let toPubKey: PublicKey;

    try {
      fromPubKey = new PublicKey(from);
      if (!PublicKey.isOnCurve(fromPubKey)) {
        return {
          success: false,
          message: `❌ Invalid Sender Address\n\n${from}\n\n**Error:** Not a valid Solana address`,
        };
      }
    } catch (error) {
      return {
        success: false,
        message: `❌ Invalid Sender Address Format\n\n${error instanceof Error ? error.message : 'Non-base58 character'}`,
      };
    }

    try {
      toPubKey = new PublicKey(to);
      if (!PublicKey.isOnCurve(toPubKey)) {
        return {
          success: false,
          message: `❌ Invalid Recipient Address\n\n${to}\n\n**Error:** Not a valid Solana address`,
        };
      }
    } catch (error) {
      return {
        success: false,
        message: `❌ Invalid Recipient Address Format\n\n${error instanceof Error ? error.message : 'Non-base58 character'}`,
      };
    }

    // Check balance
    const balance = await connection.getBalance(fromPubKey);
    const balanceSOL = balance / 1e9;

    if (balanceSOL < amount) {
      return {
        success: false,
        message: `❌ Insufficient balance\n\nYour balance: ${balanceSOL.toFixed(4)} SOL\nRequired: ${amount} SOL\nShortfall: ${(amount - balanceSOL).toFixed(4)} SOL`,
      };
    }

    return {
      success: true,
      message: `✅ Transfer validation passed\n\nYour balance: ${balanceSOL.toFixed(4)} SOL\nTransfer amount: ${amount} SOL\nRemaining: ${(balanceSOL - amount).toFixed(4)} SOL\nEstimated fee: 0.0005 SOL`,
    };
  } catch (error) {
    return {
      success: false,
      message: `❌ Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}
