#!/usr/bin/env bun
/**
 * Sell All USDC to SOL - Automatic Balance Detection & Execution
 * Command: bun sell-all-usdc.ts
 * 
 * Features:
 * - Gets your entire USDC balance
 * - Sells ALL of it to SOL
 * - No parameters needed
 * - Perfect for automation
 */

import * as fs from 'fs';
import * as path from 'path';

// Load environment variables
const envPath = path.join(process.cwd(), '.env');
const envContent = fs.readFileSync(envPath, 'utf-8');
const env: Record<string, string> = {};
envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && key.trim() && !key.startsWith('#')) {
    env[key.trim()] = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
  }
});

const SOLANA_PUBLIC_KEY = env.SOLANA_PUBLIC_KEY;
const SOLANA_PRIVATE_KEY = env.SOLANA_PRIVATE_KEY;
const SOLANA_RPC_URL = env.SOLANA_RPC_URL;
const JUPITER_API_URL = env.JUPITER_API_URL || 'https://api.jup.ag/swap/v1/quote';

// Token mints
const NATIVE_SOL = 'So11111111111111111111111111111111111111111';
const USDC_MINT = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';
const WSOL_MINT = 'So11111111111111111111111111111111111111112';

// Imports
import { 
  Connection, 
  PublicKey, 
  VersionedTransaction,
  Keypair
} from '@solana/web3.js';
import bs58 from 'bs58';

async function getUSDCBalance(): Promise<number> {
  try {
    const connection = new Connection(SOLANA_RPC_URL, 'confirmed');
    const walletPubkey = new PublicKey(SOLANA_PUBLIC_KEY);
    
    console.log('\n🔍 [GET BALANCE] Fetching USDC balance...');
    
    // Get token accounts
    const accounts = await connection.getParsedTokenAccountsByOwner(
      walletPubkey,
      { mint: new PublicKey(USDC_MINT) }
    );
    
    if (accounts.value.length === 0) {
      console.log('⚠️  [ERROR] No USDC token account found!');
      return 0;
    }
    
    const usdcAccount = accounts.value[0];
    const balance = usdcAccount.account.data.parsed.info.tokenAmount.uiAmount;
    
    console.log(`✅ [BALANCE] Found: ${balance} USDC`);
    return balance;
  } catch (error: any) {
    console.error(`❌ [ERROR] Failed to get balance: ${error.message}`);
    throw error;
  }
}

async function getSwapQuote(
  inputMint: string,
  outputMint: string,
  amount: number
): Promise<any> {
  try {
    // Convert amount to smallest unit (USDC has 6 decimals)
    const amountInSmallestUnit = Math.floor(amount * 1_000_000);
    
    const queryParams = new URLSearchParams({
      inputMint: inputMint,
      outputMint: outputMint,
      amount: amountInSmallestUnit.toString(),
      slippageBps: '50',
      onlyDirectRoutes: 'false',
    });

    const quoteUrl = `https://api.jup.ag/swap/v1/quote?${queryParams.toString()}`;
    console.log(`\n💱 [QUOTE] Getting quote for ${amount} USDC → WSOL (will convert to SOL)...`);
    
    const response = await fetch(quoteUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'x-api-key': env.JUPITER_API_KEY || '',
        'User-Agent': 'Shina-Solana-AI/1.0'
      }
    });
    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`Status: ${response.status}, Body: ${errorBody}`);
      throw new Error(`Quote API error: ${response.statusText}`);
    }
    
    const quote = await response.json();
    const outputAmount = (parseInt(quote.outAmount) / 1e9).toFixed(6);
    
    console.log(`✅ [QUOTE] You will receive: ${outputAmount} SOL`);
    console.log(`   Rate: 1 USDC = ${(parseFloat(outputAmount) / amount).toFixed(6)} SOL`);
    
    return quote;
  } catch (error: any) {
    console.error(`❌ [ERROR] Quote failed: ${error.message}`);
    throw error;
  }
}

async function executeSwap(quote: any): Promise<string> {
  try {
    const connection = new Connection(SOLANA_RPC_URL, 'confirmed');
    const walletPubkey = new PublicKey(SOLANA_PUBLIC_KEY);
    const signer = Keypair.fromSecretKey(bs58.decode(SOLANA_PRIVATE_KEY));
    
    console.log(`\n⚙️  [SWAP] Executing swap transaction...`);
    
    // Get swap transaction from Jupiter
    const swapResponse = await fetch('https://api.jup.ag/swap/v1/swap', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'x-api-key': env.JUPITER_API_KEY || '',
        'User-Agent': 'Shina-Solana-AI/1.0'
      },
      body: JSON.stringify({
        quoteResponse: quote,
        userPublicKey: walletPubkey.toString(),
        wrapUnwrapSOL: false,
        dynamicSlippage: { maxBps: 50 },
        feeAccount: undefined,
      }),
    });

    if (!swapResponse.ok) {
      const error = await swapResponse.text();
      throw new Error(`Swap API error: ${error}`);
    }

    const swapData = await swapResponse.json();
    
    // Deserialize transaction
    const transactionBuffer = Buffer.from(swapData.swapTransaction, 'base64');
    const transaction = VersionedTransaction.deserialize(transactionBuffer);
    
    // Get latest blockhash
    const latestBlockhash = await connection.getLatestBlockhash();
    transaction.message.recentBlockhash = latestBlockhash.blockhash;
    
    // Sign transaction
    transaction.sign([signer]);
    
    console.log(`📤 [SEND] Sending transaction...`);
    
    // Send transaction
    const signature = await connection.sendTransaction(transaction, {
      maxRetries: 5,
    });

    console.log(`⏳ [WAIT] Confirming transaction...`);
    console.log(`   TX: ${signature}`);
    
    // Wait for confirmation
    const confirmation = await connection.confirmTransaction(signature, 'confirmed');
    
    if (confirmation.value.err) {
      throw new Error(`Transaction failed: ${JSON.stringify(confirmation.value.err)}`);
    }

    console.log(`✅ [SUCCESS] Transaction confirmed!`);
    return signature;
  } catch (error: any) {
    console.error(`❌ [ERROR] Swap execution failed: ${error.message}`);
    throw error;
  }
}

async function main() {
  try {
    console.log(`
╔════════════════════════════════════════════════════════════════╗
║           🔄 SELL ALL USDC TO SOL - AUTOMATED                 ║
╚════════════════════════════════════════════════════════════════╝
    `);

    // Step 1: Get USDC balance
    const usdcBalance = await getUSDCBalance();
    
    if (usdcBalance === 0) {
      console.log('\n❌ Nothing to sell!');
      process.exit(1);
    }

    // Step 2: Get quote - USDC to WSOL (then auto-converts to SOL)
    const quote = await getSwapQuote(USDC_MINT, WSOL_MINT, usdcBalance);

    // Step 3: Execute swap
    const txSignature = await executeSwap(quote);

    // Success message
    console.log(`
╔════════════════════════════════════════════════════════════════╗
║           ✅ SWAP COMPLETED SUCCESSFULLY!                     ║
╚════════════════════════════════════════════════════════════════╝

📊 Summary:
   • Sold:      ${usdcBalance} USDC
   • Received:  ${(parseInt(quote.outAmount) / 1e9).toFixed(6)} SOL
   • Rate:      1 USDC = ${((parseInt(quote.outAmount) / 1e9) / usdcBalance).toFixed(6)} SOL
   • TX:        https://solscan.io/tx/${txSignature}

✨ Your USDC is now SOL! Ready for next trade.
    `);

  } catch (error: any) {
    console.error(`\n❌ FATAL ERROR: ${error.message}`);
    process.exit(1);
  }
}

main();
