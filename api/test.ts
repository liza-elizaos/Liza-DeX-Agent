import type { VercelRequest, VercelResponse } from "@vercel/node";
import dotenv from "dotenv";
import bs58 from "bs58";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";

dotenv.config();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const tests = {
    timestamp: new Date().toISOString(),
    results: {} as any
  };

  // Test 1: ENV vars
  tests.results.env_vars = {
    SOLANA_PUBLIC_KEY: process.env.SOLANA_PUBLIC_KEY ? '✅' : '❌',
    SOLANA_PRIVATE_KEY: process.env.SOLANA_PRIVATE_KEY ? '✅' : '❌',
    SOLANA_RPC_URL: process.env.SOLANA_RPC_URL ? '✅' : '❌',
  };

  // Test 2: Parse keys
  try {
    const pubKey = process.env.SOLANA_PUBLIC_KEY;
    const privKey = process.env.SOLANA_PRIVATE_KEY;
    
    if (pubKey && privKey) {
      new PublicKey(pubKey);
      const secretKey = bs58.decode(privKey);
      const kp = Keypair.fromSecretKey(secretKey);
      
      tests.results.key_parsing = {
        status: '✅',
        publicKey: pubKey.substring(0, 20) + '...',
        secretKeyLength: secretKey.length,
        derivedPublicKey: kp.publicKey.toBase58().substring(0, 20) + '...',
        match: kp.publicKey.toBase58() === pubKey ? '✅' : '❌'
      };
    }
  } catch (err: any) {
    tests.results.key_parsing = {
      status: '❌',
      error: err?.message
    };
  }

  // Test 3: RPC Connection
  try {
    const rpcUrl = process.env.SOLANA_RPC_URL;
    if (rpcUrl) {
      const conn = new Connection(rpcUrl);
      const slot = await conn.getSlot();
      tests.results.rpc = {
        status: '✅',
        url: rpcUrl.substring(0, 50) + '...',
        currentSlot: slot
      };
    }
  } catch (err: any) {
    tests.results.rpc = {
      status: '❌',
      error: err?.message
    };
  }

  // Test 4: Wallet balance
  try {
    const pubKey = process.env.SOLANA_PUBLIC_KEY;
    if (pubKey) {
      const conn = new Connection(process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com');
      const balance = await conn.getBalance(new PublicKey(pubKey));
      tests.results.wallet = {
        status: '✅',
        address: pubKey.substring(0, 20) + '...',
        balance: (balance / 1e9).toFixed(8) + ' SOL',
        lamports: balance
      };
    }
  } catch (err: any) {
    tests.results.wallet = {
      status: '❌',
      error: err?.message
    };
  }

  return res.status(200).json(tests);
}
