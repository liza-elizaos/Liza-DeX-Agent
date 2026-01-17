/**
 * Buy/Sell Transaction Handler
 * Comprehensive system for executing buy and sell transactions on Solana
 */

import { Connection, PublicKey, Keypair, VersionedTransaction, TransactionMessage, VersionedMessage } from '@solana/web3.js';
import { Buffer } from 'buffer';

// ==================== TYPES ====================

export interface BuySellConfig {
  rpcUrl: string;
  rpcUrlBackup: string;
  slippageBps: number;
  maxRetries: number;
  timeout: number;
  priorityFee: number;
}

export interface BuySellRequest {
  type: 'buy' | 'sell';
  inputMint: string;
  outputMint: string;
  amount: number;
  userPublicKey: string;
  minAmountOut?: number;
  priorityFee?: number;
}

export interface BuySellResponse {
  success: boolean;
  type: 'buy' | 'sell';
  transactionSignature?: string;
  inputAmount: number;
  outputAmount?: number;
  inputToken: string;
  outputToken: string;
  priceImpact?: number;
  status: 'pending' | 'confirmed' | 'failed';
  message: string;
  timestamp: string;
  explorerUrl?: string;
  error?: string;
}

export interface TransactionQuote {
  inputAmount: number;
  outputAmount: number;
  priceImpactPct: number;
  routePlan: any[];
  quoteResponse: any;
}

// ==================== TOKEN MAP ====================

const TOKEN_MAP: Record<string, { mint: string; decimals: number; symbol: string }> = {
  'sol': { mint: 'So11111111111111111111111111111111111111112', decimals: 9, symbol: 'SOL' },
  'usdc': { mint: 'EPjFWaLb3crJC2z8rxVmE4Gnjg1d4PjNiYq4a8JqkEH', decimals: 6, symbol: 'USDC' },
  'usdt': { mint: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BcJkxN', decimals: 6, symbol: 'USDT' },
  'msol': { mint: 'mSoLzYCxHdgfd3DgZjwwzG8DUR6azJstEWQcW2UCb9', decimals: 9, symbol: 'mSOL' },
  'bonk': { mint: 'DezXAZ8z7PnrnRJjoBXwYaKe2XTis3Zonw1j1axNac5', decimals: 5, symbol: 'BONK' },
  'jup': { mint: 'JUPyiwrYJFskUPiHa7hkeR8JwF3ttBKqrySAv4S3daM', decimals: 6, symbol: 'JUP' },
};

// ==================== HELPER FUNCTIONS ====================

/**
 * Parse token identifier (symbol or mint address)
 */
export function parseTokenIdentifier(token: string): { mint: string; decimals: number; symbol: string } {
  const clean = token.toLowerCase().trim();

  // Check if it's a valid mint address (44 char base58)
  if (/^[1-9A-HJ-NP-Za-km-z]{44}$/.test(token.trim())) {
    return {
      mint: token.trim(),
      decimals: 6, // Default to 6 decimals for unknown tokens
      symbol: token.slice(0, 8).toUpperCase(),
    };
  }

  // Check if it's a known symbol
  if (TOKEN_MAP[clean]) {
    return TOKEN_MAP[clean];
  }

  throw new Error(`Unknown token: ${token}. Supported: ${Object.keys(TOKEN_MAP).join(', ')}`);
}

/**
 * Get or create RPC connection with automatic fallback
 */
async function getConnection(rpcUrl: string, rpcUrlBackup: string, timeout: number = 10000): Promise<Connection> {
  try {
    const connection = new Connection(rpcUrl, 'confirmed');
    // Test connection
    await Promise.race([
      connection.getBlockheight(),
      new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('RPC timeout')), timeout)
      ),
    ]);
    console.log(`✅ Connected to primary RPC: ${rpcUrl.substring(0, 50)}...`);
    return connection;
  } catch (err) {
    console.warn(`⚠️ Primary RPC failed, trying backup: ${err}`);
    try {
      const connection = new Connection(rpcUrlBackup, 'confirmed');
      await Promise.race([
        connection.getBlockheight(),
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('RPC timeout')), timeout)
        ),
      ]);
      console.log(`✅ Connected to backup RPC: ${rpcUrlBackup.substring(0, 50)}...`);
      return connection;
    } catch (backupErr) {
      console.error(`❌ Both RPC endpoints failed. Primary: ${err}, Backup: ${backupErr}`);
      throw new Error('All RPC endpoints unavailable');
    }
  }
}

/**
 * Get Jupiter quote for buy/sell operation
 */
export async function getJupiterQuote(
  inputMint: string,
  outputMint: string,
  amount: number,
  slippageBps: number = 50,
  jupiterApiKey?: string
): Promise<TransactionQuote> {
  try {
    const inputToken = parseTokenIdentifier(inputMint);
    const outputToken = parseTokenIdentifier(outputMint);

    // Convert amount to lamports
    const amountInLamports = Math.floor(amount * Math.pow(10, inputToken.decimals));

    console.log(`📊 Getting Jupiter quote: ${amountInLamports} ${inputToken.symbol} → ${outputToken.symbol}`);

    const jupiterApi = process.env.JUPITER_QUOTE_API || 'https://api.jup.ag/quote';
    const apiKey = jupiterApiKey || process.env.JUPITER_API_KEY;
    const keyParam = apiKey ? `&token=${apiKey}` : '';

    const response = await fetch(
      `${jupiterApi}?inputMint=${inputToken.mint}&outputMint=${outputToken.mint}&amount=${amountInLamports}&slippageBps=${slippageBps}${keyParam}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error(`❌ Jupiter API error (${response.status}):`, error);
      throw new Error(`Jupiter API error: ${response.status}`);
    }

    const quoteData = await response.json() as any;

    if (!quoteData.outAmount) {
      throw new Error('Invalid quote response from Jupiter');
    }

    const outputAmount = parseFloat(quoteData.outAmount) / Math.pow(10, outputToken.decimals);
    const priceImpact = quoteData.priceImpactPct || 0;

    console.log(`✅ Quote received: ${amount} ${inputToken.symbol} → ${outputAmount.toFixed(6)} ${outputToken.symbol}`);
    console.log(`   Price impact: ${priceImpact.toFixed(3)}%`);

    return {
      inputAmount: amount,
      outputAmount: outputAmount,
      priceImpactPct: priceImpact,
      routePlan: quoteData.routePlan || [],
      quoteResponse: quoteData,
    };
  } catch (error) {
    console.error('Error getting Jupiter quote:', error);
    throw error;
  }
}

/**
 * Build Jupiter swap transaction
 */
export async function buildJupiterTransaction(
  userPublicKey: string,
  quoteResponse: any,
  priorityFeeLamports: number = 1000
): Promise<{ transaction: string; lastValidBlockHeight: number }> {
  try {
    console.log(`🔨 Building Jupiter swap transaction for ${userPublicKey}`);

    const jupiterSwapApi = process.env.JUPITER_SWAP_API || 'https://api.jup.ag/swap';
    const apiKey = process.env.JUPITER_API_KEY;
    const keyParam = apiKey ? `?token=${apiKey}` : '';

    const response = await fetch(`${jupiterSwapApi}${keyParam}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        quoteResponse: quoteResponse,
        userPublicKey: userPublicKey,
        wrapUnwrapSOL: true,
        prioritizationFeeLamports: priorityFeeLamports,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error(`❌ Jupiter swap error (${response.status}):`, error);
      throw new Error(`Jupiter swap error: ${response.status}`);
    }

    const txData = await response.json() as any;

    if (!txData.swapTransaction) {
      throw new Error('No swap transaction in response');
    }

    console.log(`✅ Transaction built successfully`);

    return {
      transaction: txData.swapTransaction,
      lastValidBlockHeight: txData.lastValidBlockHeight || 0,
    };
  } catch (error) {
    console.error('Error building Jupiter transaction:', error);
    throw error;
  }
}

/**
 * Decode and sign transaction with keypair
 */
export function signTransaction(
  transactionBase64: string,
  keypair: Keypair
): string {
  try {
    console.log(`🔑 Signing transaction with keypair`);

    const transactionBuffer = Buffer.from(transactionBase64, 'base64');
    const transaction = VersionedTransaction.deserialize(transactionBuffer);

    // Sign with keypair
    transaction.sign([keypair]);

    // Convert back to base64
    const signedTx = Buffer.from(transaction.serialize()).toString('base64');

    console.log(`✅ Transaction signed successfully`);
    return signedTx;
  } catch (error) {
    console.error('Error signing transaction:', error);
    throw error;
  }
}

/**
 * Send signed transaction to blockchain
 */
export async function sendSignedTransaction(
  connection: Connection,
  signedTransactionBase64: string,
  maxRetries: number = 5
): Promise<string> {
  try {
    console.log(`📤 Sending signed transaction to blockchain (max retries: ${maxRetries})`);

    const transactionBuffer = Buffer.from(signedTransactionBase64, 'base64');
    const transaction = VersionedTransaction.deserialize(transactionBuffer);

    const signature = await connection.sendTransaction(transaction, {
      skipPreflight: false,
      maxRetries: maxRetries,
    });

    console.log(`📋 Transaction sent. Signature: ${signature}`);
    return signature;
  } catch (error) {
    console.error('Error sending transaction:', error);
    throw error;
  }
}

/**
 * Wait for transaction confirmation
 */
export async function waitForConfirmation(
  connection: Connection,
  signature: string,
  timeout: number = 60000
): Promise<boolean> {
  try {
    console.log(`⏳ Waiting for transaction confirmation (timeout: ${timeout}ms)`);

    const start = Date.now();
    let confirmed = false;

    while (Date.now() - start < timeout) {
      const status = await connection.getSignatureStatus(signature);

      if (status.value?.confirmationStatus === 'confirmed' || status.value?.confirmationStatus === 'finalized') {
        console.log(`✅ Transaction confirmed! Status: ${status.value.confirmationStatus}`);
        confirmed = true;
        break;
      }

      if (status.value?.err) {
        console.error(`❌ Transaction failed:`, status.value.err);
        throw new Error(`Transaction failed: ${JSON.stringify(status.value.err)}`);
      }

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    if (!confirmed) {
      console.warn(`⚠️ Transaction confirmation timeout after ${timeout}ms`);
    }

    return confirmed;
  } catch (error) {
    console.error('Error waiting for confirmation:', error);
    throw error;
  }
}

/**
 * Execute buy transaction
 */
export async function executeBuyTransaction(
  request: BuySellRequest,
  config: BuySellConfig,
  privateKeyBase58?: string
): Promise<BuySellResponse> {
  const timestamp = new Date().toISOString();

  try {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`🛒 EXECUTING BUY TRANSACTION`);
    console.log(`${'='.repeat(60)}`);
    console.log(`Input: ${request.amount} ${request.inputMint}`);
    console.log(`Output: ${request.outputMint}`);
    console.log(`User: ${request.userPublicKey}`);

    // Get quote
    const quote = await getJupiterQuote(
      request.inputMint,
      request.outputMint,
      request.amount,
      config.slippageBps
    );

    // Build transaction
    const txData = await buildJupiterTransaction(
      request.userPublicKey,
      quote.quoteResponse,
      request.priorityFee || config.priorityFee
    );

    // Sign if private key provided (server-side signing)
    let signedTx = txData.transaction;
    if (privateKeyBase58) {
      try {
        const keypair = Keypair.fromSecretKey(
          Buffer.from(JSON.parse(privateKeyBase58))
        );
        signedTx = signTransaction(txData.transaction, keypair);
      } catch (err) {
        console.warn('Failed to server-side sign:', err);
        // Continue with unsigned transaction for client-side signing
      }
    }

    const inputToken = parseTokenIdentifier(request.inputMint);
    const outputToken = parseTokenIdentifier(request.outputMint);

    return {
      success: true,
      type: 'buy',
      inputAmount: request.amount,
      outputAmount: quote.outputAmount,
      inputToken: inputToken.symbol,
      outputToken: outputToken.symbol,
      priceImpact: quote.priceImpactPct,
      status: 'pending',
      message: `Buy transaction ready. Swap ${request.amount} ${inputToken.symbol} for ${quote.outputAmount.toFixed(6)} ${outputToken.symbol}`,
      timestamp,
      explorerUrl: `https://solscan.io/tx/${signedTx.substring(0, 20)}...`,
    };
  } catch (error) {
    console.error('Buy transaction error:', error);
    return {
      success: false,
      type: 'buy',
      inputAmount: request.amount,
      inputToken: request.inputMint,
      outputToken: request.outputMint,
      status: 'failed',
      message: `Buy transaction failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      timestamp,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Execute sell transaction
 */
export async function executeSellTransaction(
  request: BuySellRequest,
  config: BuySellConfig,
  privateKeyBase58?: string
): Promise<BuySellResponse> {
  const timestamp = new Date().toISOString();

  try {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`🛍️ EXECUTING SELL TRANSACTION`);
    console.log(`${'='.repeat(60)}`);
    console.log(`Input: ${request.amount} ${request.inputMint}`);
    console.log(`Output: ${request.outputMint}`);
    console.log(`User: ${request.userPublicKey}`);

    // Get quote
    const quote = await getJupiterQuote(
      request.inputMint,
      request.outputMint,
      request.amount,
      config.slippageBps
    );

    // Build transaction
    const txData = await buildJupiterTransaction(
      request.userPublicKey,
      quote.quoteResponse,
      request.priorityFee || config.priorityFee
    );

    // Sign if private key provided (server-side signing)
    let signedTx = txData.transaction;
    if (privateKeyBase58) {
      try {
        const keypair = Keypair.fromSecretKey(
          Buffer.from(JSON.parse(privateKeyBase58))
        );
        signedTx = signTransaction(txData.transaction, keypair);
      } catch (err) {
        console.warn('Failed to server-side sign:', err);
        // Continue with unsigned transaction for client-side signing
      }
    }

    const inputToken = parseTokenIdentifier(request.inputMint);
    const outputToken = parseTokenIdentifier(request.outputMint);

    return {
      success: true,
      type: 'sell',
      inputAmount: request.amount,
      outputAmount: quote.outputAmount,
      inputToken: inputToken.symbol,
      outputToken: outputToken.symbol,
      priceImpact: quote.priceImpactPct,
      status: 'pending',
      message: `Sell transaction ready. Exchange ${request.amount} ${inputToken.symbol} for ${quote.outputAmount.toFixed(6)} ${outputToken.symbol}`,
      timestamp,
      explorerUrl: `https://solscan.io/tx/${signedTx.substring(0, 20)}...`,
    };
  } catch (error) {
    console.error('Sell transaction error:', error);
    return {
      success: false,
      type: 'sell',
      inputAmount: request.amount,
      inputToken: request.inputMint,
      outputToken: request.outputMint,
      status: 'failed',
      message: `Sell transaction failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      timestamp,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Execute full buy transaction with signing and sending
 */
export async function executeBuyWithConfirmation(
  request: BuySellRequest,
  config: BuySellConfig,
  privateKeyBase58: string
): Promise<BuySellResponse> {
  const timestamp = new Date().toISOString();

  try {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`🛒 EXECUTING FULL BUY (with confirmation)`);
    console.log(`${'='.repeat(60)}`);

    // Get connection
    const connection = await getConnection(config.rpcUrl, config.rpcUrlBackup, config.timeout);

    // Get quote
    const quote = await getJupiterQuote(
      request.inputMint,
      request.outputMint,
      request.amount,
      config.slippageBps
    );

    // Build transaction
    const txData = await buildJupiterTransaction(
      request.userPublicKey,
      quote.quoteResponse,
      request.priorityFee || config.priorityFee
    );

    // Sign transaction
    const keypair = Keypair.fromSecretKey(
      Buffer.from(JSON.parse(privateKeyBase58))
    );
    const signedTx = signTransaction(txData.transaction, keypair);

    // Send transaction
    const signature = await sendSignedTransaction(connection, signedTx, config.maxRetries);

    // Wait for confirmation
    const confirmed = await waitForConfirmation(connection, signature, config.timeout);

    const inputToken = parseTokenIdentifier(request.inputMint);
    const outputToken = parseTokenIdentifier(request.outputMint);

    return {
      success: confirmed,
      type: 'buy',
      transactionSignature: signature,
      inputAmount: request.amount,
      outputAmount: quote.outputAmount,
      inputToken: inputToken.symbol,
      outputToken: outputToken.symbol,
      priceImpact: quote.priceImpactPct,
      status: confirmed ? 'confirmed' : 'pending',
      message: confirmed 
        ? `Buy transaction confirmed! Swapped ${request.amount} ${inputToken.symbol} for ${quote.outputAmount.toFixed(6)} ${outputToken.symbol}`
        : `Buy transaction sent but not yet confirmed. Signature: ${signature}`,
      timestamp,
      explorerUrl: `https://solscan.io/tx/${signature}`,
    };
  } catch (error) {
    console.error('Full buy transaction error:', error);
    return {
      success: false,
      type: 'buy',
      inputAmount: request.amount,
      inputToken: request.inputMint,
      outputToken: request.outputMint,
      status: 'failed',
      message: `Buy transaction failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      timestamp,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Execute full sell transaction with signing and sending
 */
export async function executeSellWithConfirmation(
  request: BuySellRequest,
  config: BuySellConfig,
  privateKeyBase58: string
): Promise<BuySellResponse> {
  const timestamp = new Date().toISOString();

  try {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`🛍️ EXECUTING FULL SELL (with confirmation)`);
    console.log(`${'='.repeat(60)}`);

    // Get connection
    const connection = await getConnection(config.rpcUrl, config.rpcUrlBackup, config.timeout);

    // Get quote
    const quote = await getJupiterQuote(
      request.inputMint,
      request.outputMint,
      request.amount,
      config.slippageBps
    );

    // Build transaction
    const txData = await buildJupiterTransaction(
      request.userPublicKey,
      quote.quoteResponse,
      request.priorityFee || config.priorityFee
    );

    // Sign transaction
    const keypair = Keypair.fromSecretKey(
      Buffer.from(JSON.parse(privateKeyBase58))
    );
    const signedTx = signTransaction(txData.transaction, keypair);

    // Send transaction
    const signature = await sendSignedTransaction(connection, signedTx, config.maxRetries);

    // Wait for confirmation
    const confirmed = await waitForConfirmation(connection, signature, config.timeout);

    const inputToken = parseTokenIdentifier(request.inputMint);
    const outputToken = parseTokenIdentifier(request.outputMint);

    return {
      success: confirmed,
      type: 'sell',
      transactionSignature: signature,
      inputAmount: request.amount,
      outputAmount: quote.outputAmount,
      inputToken: inputToken.symbol,
      outputToken: outputToken.symbol,
      priceImpact: quote.priceImpactPct,
      status: confirmed ? 'confirmed' : 'pending',
      message: confirmed 
        ? `Sell transaction confirmed! Exchanged ${request.amount} ${inputToken.symbol} for ${quote.outputAmount.toFixed(6)} ${outputToken.symbol}`
        : `Sell transaction sent but not yet confirmed. Signature: ${signature}`,
      timestamp,
      explorerUrl: `https://solscan.io/tx/${signature}`,
    };
  } catch (error) {
    console.error('Full sell transaction error:', error);
    return {
      success: false,
      type: 'sell',
      inputAmount: request.amount,
      inputToken: request.inputMint,
      outputToken: request.outputMint,
      status: 'failed',
      message: `Sell transaction failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      timestamp,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
