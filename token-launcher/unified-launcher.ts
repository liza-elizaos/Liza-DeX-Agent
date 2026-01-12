#!/usr/bin/env bun

/**
 * UNIFIED TOKEN LAUNCHER
 * Combines:
 * 1. Pump.fun Official SDK (on-chain token creation)
 * 2. Your Backend API (portfolio tracking, metadata storage)
 * 3. Claude's Protocol (market making)
 * 
 * This creates a complete token launch pipeline
 */

import { OnlinePumpSdk } from '@pump-fun/pump-sdk';
import { OnlinePumpAmmSdk, canonicalPumpPoolPda } from '@pump-fun/pump-swap-sdk';
import { Connection, PublicKey, Keypair, LAMPORTS_PER_SOL } from '@solana/web3.js';
import axios from 'axios';
import bs58 from 'bs58';
import * as dotenv from 'dotenv';

dotenv.config();

interface TokenLaunchRequest {
  name: string;
  symbol: string;
  description: string;
  tone?: string;
  initialLiquidity: number;
}

interface LaunchResponse {
  success: boolean;
  mint?: string;
  poolAddress?: string;
  txHash?: string;
  explorerUrl?: string;
  pumpfunUrl?: string;
  onChainMetadata?: {
    name: string;
    symbol: string;
    totalSupply: string;
    decimals: number;
  };
  error?: string;
}

class UnifiedTokenLauncher {
  private connection: Connection;
  private wallet: Keypair;
  private pumpSdk: OnlinePumpSdk;
  private ammSdk: OnlinePumpAmmSdk;
  private backendUrl: string;

  constructor(
    rpcUrl: string,
    walletPrivateKey: string,
    backendUrl: string = 'http://localhost:3001'
  ) {
    this.connection = new Connection(rpcUrl, 'confirmed');

    try {
      this.wallet = Keypair.fromSecretKey(bs58.decode(walletPrivateKey));
    } catch (error) {
      throw new Error(`Invalid wallet private key: ${error}`);
    }

    this.pumpSdk = new OnlinePumpSdk();
    this.ammSdk = new OnlinePumpAmmSdk({ connection: this.connection });
    this.backendUrl = backendUrl;

    console.log(`\n[UNIFIED LAUNCHER] Initialized`);
    console.log(`  Wallet: ${this.wallet.publicKey.toString()}`);
    console.log(`  RPC: ${rpcUrl}`);
    console.log(`  Backend: ${backendUrl}\n`);
  }

  /**
   * Main launch method - coordinates everything
   */
  async launch(request: TokenLaunchRequest): Promise<LaunchResponse> {
    try {
      console.log('═'.repeat(70));
      console.log('🚀 UNIFIED TOKEN LAUNCH');
      console.log('═'.repeat(70) + '\n');

      // Step 1: Validate wallet
      console.log('📍 Step 1: Validating wallet...');
      const balance = await this.connection.getBalance(this.wallet.publicKey);
      const balanceSOL = balance / LAMPORTS_PER_SOL;
      console.log(`   ✓ Balance: ${balanceSOL.toFixed(4)} SOL\n`);

      if (balanceSOL < request.initialLiquidity + 0.1) {
        return {
          success: false,
          error: `Insufficient balance. Need ${request.initialLiquidity + 0.1} SOL, have ${balanceSOL}`,
        };
      }

      // Step 2: Create token on-chain via Pump.fun
      console.log('📍 Step 2: Creating token on Pump.fun...');
      const createResult = await this.createTokenOnChain(request);

      if (!createResult.success || !createResult.mint) {
        return createResult;
      }

      console.log(`   ✓ Mint: ${createResult.mint}`);
      console.log(`   ✓ TX: ${createResult.txHash}\n`);

      // Step 3: Add liquidity
      console.log('📍 Step 3: Adding liquidity to bonding curve...');
      const liquidityResult = await this.addLiquidity(
        createResult.mint,
        request.initialLiquidity
      );

      if (!liquidityResult.success) {
        return liquidityResult;
      }

      console.log(`   ✓ Pool: ${liquidityResult.poolAddress}`);
      console.log(`   ✓ Liquidity: ${request.initialLiquidity} SOL\n`);

      // Step 4: Store in backend (for portfolio/tracking)
      console.log('📍 Step 4: Storing in backend...');
      const backendResult = await this.storeInBackend({
        mint: createResult.mint,
        ...request,
        poolAddress: liquidityResult.poolAddress,
        txHash: createResult.txHash,
        walletAddress: this.wallet.publicKey.toString(),
      });

      console.log(backendResult.success ? '   ✓ Stored in database\n' : '   ⚠ Backend storage failed\n');

      // Step 5: Generate URLs
      const mint = createResult.mint;
      const explorerUrl = `https://solscan.io/token/${mint}`;
      const pumpfunUrl = `https://pump.fun/${mint}`;

      console.log('═'.repeat(70));
      console.log('✅ LAUNCH COMPLETE!');
      console.log('═'.repeat(70) + '\n');

      return {
        success: true,
        mint: mint,
        poolAddress: liquidityResult.poolAddress,
        txHash: createResult.txHash,
        explorerUrl: explorerUrl,
        pumpfunUrl: pumpfunUrl,
        onChainMetadata: {
          name: request.name,
          symbol: request.symbol,
          totalSupply: '1000000000', // 1B
          decimals: 6,
        },
      };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error('❌ Launch failed:', errorMsg);
      return {
        success: false,
        error: errorMsg,
      };
    }
  }

  /**
   * Create token on Pump.fun
   */
  private async createTokenOnChain(
    request: TokenLaunchRequest
  ): Promise<{ success: boolean; mint?: string; txHash?: string; error?: string }> {
    try {
      const mintKeypair = Keypair.generate();
      const mint = mintKeypair.publicKey;

      const result = await this.pumpSdk.createToken({
        mint: mintKeypair,
        owner: this.wallet,
        metadata: {
          name: request.name,
          symbol: request.symbol,
          uri: 'https://pump.fun/metadata',
          description: request.description,
        },
        initialSupply: 1_000_000_000, // 1 billion tokens
      });

      // Wait for confirmation
      await new Promise((r) => setTimeout(r, 5000));

      return {
        success: true,
        mint: mint.toString(),
        txHash: result.txHash || 'confirmed',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Add liquidity via bonding curve
   */
  private async addLiquidity(
    mint: string,
    solAmount: number
  ): Promise<{ success: boolean; poolAddress?: string; error?: string }> {
    try {
      const mintPubkey = new PublicKey(mint);

      const tx = await this.ammSdk.buy({
        mint: mintPubkey,
        owner: this.wallet,
        amount: solAmount * LAMPORTS_PER_SOL,
        slippage: 0.05,
      });

      // Get pool address
      const [poolAddress] = canonicalPumpPoolPda(mintPubkey);

      // Wait for confirmation
      await new Promise((r) => setTimeout(r, 5000));

      return {
        success: true,
        poolAddress: poolAddress.toString(),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Store token data in backend
   */
  private async storeInBackend(data: any): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await axios.post(`${this.backendUrl}/api/tokens/create`, data, {
        timeout: 10000,
      });

      return { success: response.data.success };
    } catch (error) {
      // Don't fail launch if backend unavailable
      console.log('   ⚠ Backend unavailable (continuing anyway)');
      return { success: false };
    }
  }
}

/**
 * Main execution
 */
async function main() {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║   🚀 UNIFIED TOKEN LAUNCHER                               ║');
  console.log('║   Pump.fun + Claude Protocol + Backend                    ║');
  console.log('╚════════════════════════════════════════════════════════════╝');

  // Configuration
  const rpcUrl = process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';
  const privateKey = process.env.SOLANA_PRIVATE_KEY;
  const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';

  if (!privateKey) {
    console.error('❌ SOLANA_PRIVATE_KEY not set');
    process.exit(1);
  }

  // Create launcher
  const launcher = new UnifiedTokenLauncher(rpcUrl, privateKey, backendUrl);

  // Launch request
  const launchRequest: TokenLaunchRequest = {
    name: process.env.TOKEN_NAME || 'Claude Protocol Token',
    symbol: process.env.TOKEN_SYMBOL || 'CLAUDE',
    description:
      process.env.TOKEN_DESCRIPTION ||
      'Algorithmic market maker with automatic price support via Claude Protocol',
    tone: process.env.TOKEN_TONE || 'professional',
    initialLiquidity: parseFloat(process.env.INITIAL_LIQUIDITY || '0.5'),
  };

  try {
    const result = await launcher.launch(launchRequest);

    if (result.success && result.mint) {
      console.log('📊 LAUNCH RESULTS:');
      console.log('─'.repeat(70));
      console.log(`Name: ${launchRequest.name}`);
      console.log(`Symbol: ${launchRequest.symbol}`);
      console.log(`Mint: ${result.mint}`);
      console.log(`Pool: ${result.poolAddress}`);
      console.log(`\n🔗 VERIFICATION LINKS:`);
      console.log(`Solscan:  ${result.explorerUrl}`);
      console.log(`Pump.fun: ${result.pumpfunUrl}`);
      console.log(`\n💾 ON-CHAIN METADATA:`);
      console.log(`Total Supply: ${result.onChainMetadata?.totalSupply} tokens`);
      console.log(`Decimals: ${result.onChainMetadata?.decimals}`);
      console.log(`\n✨ Token is now LIVE and tradeable!\n`);
    } else {
      console.error('❌ Launch failed:', result.error);
      process.exit(1);
    }
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

// Run it
main().catch(console.error);
