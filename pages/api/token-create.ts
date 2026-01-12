// pages/api/token-create.ts
// Main token creation endpoint
import type { NextApiRequest, NextApiResponse } from 'next';
import { PublicKey, Connection, Keypair, Transaction, SystemProgram } from '@solana/web3.js';
import { createMint, createAssociatedTokenAccount, mintTo } from '@solana/spl-token';
import axios from 'axios';
import formidable from 'formidable';

const connection = new Connection(process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com');
const programId = new PublicKey(process.env.AUTOFUN_PROGRAM_ID || '');
const platformWallet = new PublicKey(process.env.PLATFORM_WALLET || '');

interface TokenCreateRequest {
  name: string;
  symbol: string;
  description: string;
  website?: string;
  twitter?: string;
  discord?: string;
  imageUrl?: string;
  creatorWallet: string;
}

interface TokenCreateResponse {
  success: boolean;
  mint?: string;
  transaction?: string;
  error?: string;
}

// Fee tier structure
const FEE_TIERS = [
  { min: 0, max: 420, creator: 0.300, protocol: 0.930, lp: 0.020 },
  { min: 420, max: 1470, creator: 0.950, protocol: 0.050, lp: 0.200 },
  { min: 1470, max: 2460, creator: 0.900, protocol: 0.050, lp: 0.200 },
  { min: 2460, max: 3440, creator: 0.850, protocol: 0.050, lp: 0.200 },
  { min: 3440, max: 4420, creator: 0.800, protocol: 0.050, lp: 0.200 },
  { min: 4420, max: 9820, creator: 0.750, protocol: 0.050, lp: 0.200 },
  { min: 9820, max: 14740, creator: 0.700, protocol: 0.050, lp: 0.200 },
  { min: 14740, max: 19650, creator: 0.650, protocol: 0.050, lp: 0.200 },
  { min: 19650, max: 24560, creator: 0.600, protocol: 0.050, lp: 0.200 },
  { min: 24560, max: 29470, creator: 0.550, protocol: 0.050, lp: 0.200 },
  { min: 29470, max: 34380, creator: 0.500, protocol: 0.050, lp: 0.200 },
  { min: 34380, max: 39300, creator: 0.450, protocol: 0.050, lp: 0.200 },
  { min: 39300, max: 44210, creator: 0.400, protocol: 0.050, lp: 0.200 },
  { min: 44210, max: 49120, creator: 0.350, protocol: 0.050, lp: 0.200 },
  { min: 49120, max: 54030, creator: 0.300, protocol: 0.050, lp: 0.200 },
  { min: 54030, max: 58940, creator: 0.275, protocol: 0.050, lp: 0.200 },
  { min: 58940, max: 63860, creator: 0.250, protocol: 0.050, lp: 0.200 },
  { min: 63860, max: 68770, creator: 0.225, protocol: 0.050, lp: 0.200 },
  { min: 68770, max: 73681, creator: 0.200, protocol: 0.050, lp: 0.200 },
  { min: 73681, max: 78590, creator: 0.175, protocol: 0.050, lp: 0.200 },
  { min: 78590, max: 83500, creator: 0.150, protocol: 0.050, lp: 0.200 },
  { min: 83500, max: 88400, creator: 0.125, protocol: 0.050, lp: 0.200 },
  { min: 88400, max: 93330, creator: 0.100, protocol: 0.050, lp: 0.200 },
  { min: 93330, max: 98240, creator: 0.075, protocol: 0.050, lp: 0.200 },
  { min: 98240, max: Infinity, creator: 0.050, protocol: 0.050, lp: 0.200 },
];

// Get fee tier for market cap
function getFeeTier(marketCap: number) {
  return FEE_TIERS.find(tier => marketCap >= tier.min && marketCap < tier.max) || FEE_TIERS[0];
}

// Save image to IPFS-like service
async function uploadImage(imageUrl: string): Promise<string> {
  try {
    // If using IPFS (e.g., Pinata, Nft.storage)
    // For now, return base64 or upload to simple storage
    return imageUrl; // In production, upload to IPFS
  } catch (error) {
    console.error('Image upload error:', error);
    throw error;
  }
}

// Record creator in database
async function recordCreator(creatorWallet: string, mint: string, fees: any) {
  try {
    // Save to database (Supabase, Firebase, etc.)
    const response = await fetch(`${process.env.DATABASE_API}/creators`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        creatorWallet,
        mint,
        fees,
        createdAt: new Date(),
        accumulated: 0,
        claimed: 0,
      }),
    });
    return response.json();
  } catch (error) {
    console.error('Database error:', error);
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<TokenCreateResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { name, symbol, description, website, twitter, discord, imageUrl, creatorWallet } = req.body as TokenCreateRequest;

    // Validate inputs
    if (!name || !symbol || !description || !creatorWallet) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    // Validate creator wallet
    const creator = new PublicKey(creatorWallet);

    // Step 1: Create mint
    const mint = Keypair.generate();
    const initialSupply = 1_000_000_000; // 1B tokens

    console.log(`Creating mint: ${mint.publicKey.toBase58()}`);

    // Step 2: Get fee tier (initial market cap = 28 SOL)
    const tier = getFeeTier(28);
    
    // Step 3: Upload metadata to IPFS
    let imageUri = imageUrl;
    if (imageUrl) {
      try {
        imageUri = await uploadImage(imageUrl);
      } catch (err) {
        console.warn('Image upload failed, using direct URL');
      }
    }

    // Step 4: Create token metadata
    const metadata = {
      name,
      symbol,
      description,
      image: imageUri || '',
      website: website || '',
      twitter: twitter || '',
      discord: discord || '',
      extensions: {
        website: website || '',
        twitter: twitter || '',
        discord: discord || '',
      },
    };

    // Step 5: Record creator in database
    await recordCreator(creatorWallet, mint.publicKey.toBase58(), {
      creatorFee: tier.creator,
      protocolFee: tier.protocol,
      lpFee: tier.lp,
      initialMarketCap: 28,
    });

    // Step 6: Generate transaction (client will sign and submit)
    const transaction = {
      mint: mint.publicKey.toBase58(),
      metadata,
      fees: tier,
      creatorWallet,
      timestamp: Date.now(),
    };

    // For demo, we'll simulate the launch
    // In production, the client sends signed transaction
    res.status(200).json({
      success: true,
      mint: mint.publicKey.toBase58(),
      transaction: JSON.stringify(transaction),
    });

  } catch (error: any) {
    console.error('Token creation error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Token creation failed',
    });
  }
}
