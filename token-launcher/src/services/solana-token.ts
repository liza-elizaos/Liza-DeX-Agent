import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
  sendAndConfirmTransaction,
  LAMPORTS_PER_SOL,
} from '@solana/web3.js';
import {
  createInitializeMintInstruction,
  createMintToInstruction,
  getMinimumBalanceForRentExemptMint,
  MINT_SIZE,
  TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountInstruction,
  getAssociatedTokenAddress,
} from '@solana/spl-token';
import bs58 from 'bs58';

interface TokenCreateParams {
  name: string;
  symbol: string;
  description: string;
  decimals?: number;
  initialSupply?: number;
  imageBuffer?: Buffer;
}

interface TokenCreateResult {
  success: boolean;
  mint?: string;
  transaction?: string;
  error?: string;
  message: string;
  explorerUrl?: string;
}

export async function createTokenOnSolana(params: TokenCreateParams): Promise<TokenCreateResult> {
  try {
    console.log('[SOLANA] Creating token:', params.name);

    // Get environment variables
    const rpcUrl = process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';
    const devWalletPrivateKeyStr = process.env.DEV_WALLET_PRIVATE_KEY;

    if (!devWalletPrivateKeyStr) {
      throw new Error('DEV_WALLET_PRIVATE_KEY not configured in environment');
    }

    // Initialize connection
    const connection = new Connection(rpcUrl, 'confirmed');
    console.log(`[SOLANA] Connected to RPC: ${rpcUrl}`);

    // Parse private key - it could be base58 or array
    let keypair: Keypair;
    try {
      // Try base58 first
      const secretKey = bs58.decode(devWalletPrivateKeyStr);
      keypair = Keypair.fromSecretKey(secretKey);
    } catch {
      try {
        // Try array format [1,2,3...]
        const arr = JSON.parse(devWalletPrivateKeyStr);
        if (Array.isArray(arr)) {
          keypair = Keypair.fromSecretKey(new Uint8Array(arr));
        } else {
          throw new Error('Invalid private key format');
        }
      } catch {
        throw new Error('Invalid DEV_WALLET_PRIVATE_KEY format. Must be base58 or array.');
      }
    }

    const walletPublicKey = keypair.publicKey;
    console.log(`[SOLANA] Wallet: ${walletPublicKey.toBase58()}`);

    // Check wallet balance
    const balance = await connection.getBalance(walletPublicKey);
    const balanceInSol = balance / LAMPORTS_PER_SOL;
    console.log(`[SOLANA] Wallet balance: ${balanceInSol} SOL`);

    if (balanceInSol < 1) {
      throw new Error(
        `Insufficient balance. Need at least 1 SOL for token creation, have ${balanceInSol} SOL`
      );
    }

    // Create a new Keypair for the mint
    const mintKeypair = Keypair.generate();
    const mint = mintKeypair.publicKey;
    console.log(`[SOLANA] New mint address: ${mint.toBase58()}`);

    // Calculate rent for mint
    const lamports = await getMinimumBalanceForRentExemptMint(connection);
    console.log(`[SOLANA] Rent required: ${lamports / LAMPORTS_PER_SOL} SOL`);

    // Create transaction
    const transaction = new Transaction().add(
      // Create account for mint
      SystemProgram.createAccount({
        fromPubkey: walletPublicKey,
        newAccountPubkey: mint,
        space: MINT_SIZE,
        lamports,
        programId: TOKEN_PROGRAM_ID,
      }),
      // Initialize mint
      createInitializeMintInstruction(
        mint,
        params.decimals || 6,
        walletPublicKey,
        walletPublicKey,
        TOKEN_PROGRAM_ID
      )
    );

    // Get latest blockhash
    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed');
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = walletPublicKey;

    // Sign and send transaction
    console.log('[SOLANA] Signing and sending transaction...');
    const signature = await sendAndConfirmTransaction(connection, transaction, [keypair, mintKeypair], {
      commitment: 'confirmed',
    });

    console.log(`[SOLANA] Transaction confirmed: ${signature}`);

    // If initial supply is provided, mint tokens
    if (params.initialSupply && params.initialSupply > 0) {
      console.log(`[SOLANA] Minting ${params.initialSupply} tokens...`);

      // Get or create associated token account
      const ata = await getAssociatedTokenAddress(mint, walletPublicKey);

      const mintTx = new Transaction().add(
        createAssociatedTokenAccountInstruction(
          walletPublicKey, // payer
          ata, // ata
          walletPublicKey, // owner
          mint // mint
        ),
        createMintToInstruction(
          mint,
          ata,
          walletPublicKey,
          params.initialSupply * Math.pow(10, params.decimals || 6),
          [],
          TOKEN_PROGRAM_ID
        )
      );

      const { blockhash: bh2 } = await connection.getLatestBlockhash('confirmed');
      mintTx.recentBlockhash = bh2;
      mintTx.feePayer = walletPublicKey;

      const mintSig = await sendAndConfirmTransaction(connection, mintTx, [keypair], {
        commitment: 'confirmed',
      });

      console.log(`[SOLANA] Mint transaction: ${mintSig}`);
    }

    const mintAddress = mint.toBase58();
    const explorerUrl = `https://solscan.io/token/${mintAddress}`;
    const pumpFunUrl = `https://pump.fun/${mintAddress}`;

    return {
      success: true,
      mint: mintAddress,
      transaction: signature,
      message: `✅ Token ${params.name} (${params.symbol}) created successfully on mainnet!`,
      explorerUrl,
    };
  } catch (error) {
    console.error('[SOLANA] Error creating token:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
      message: `❌ Failed to create token: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

export async function getTokenInfo(mint: string): Promise<any> {
  try {
    const rpcUrl = process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';
    const connection = new Connection(rpcUrl, 'confirmed');

    const mintPublicKey = new PublicKey(mint);
    const mintInfo = await connection.getParsedAccountInfo(mintPublicKey);

    return {
      success: true,
      mint,
      info: mintInfo.value?.data,
      explorerUrl: `https://solscan.io/token/${mint}`,
    };
  } catch (error) {
    console.error('[SOLANA] Error fetching token info:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
