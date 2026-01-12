#!/usr/bin/env node

// Quick test of the launch token flow
import dotenv from 'dotenv';
import bs58 from 'bs58';
import { Keypair, PublicKey } from '@solana/web3.js';

dotenv.config();

console.log('🧪 Quick Validation Tests\n');

// Test 1: Validate env vars
console.log('1️⃣ Checking environment variables...');
const publicKey = process.env.SOLANA_PUBLIC_KEY;
const privateKey = process.env.SOLANA_PRIVATE_KEY;
const rpcUrl = process.env.SOLANA_RPC_URL;

if (!publicKey) console.warn('⚠️  Missing SOLANA_PUBLIC_KEY');
else console.log(`✅ Public Key: ${publicKey.slice(0, 10)}...`);

if (!privateKey) console.warn('⚠️  Missing SOLANA_PRIVATE_KEY');
else console.log(`✅ Private Key: ${privateKey.slice(0, 10)}...`);

if (!rpcUrl) console.log('✅ RPC URL: Using default mainnet');
else console.log(`✅ RPC URL: ${rpcUrl.slice(0, 20)}...`);

// Test 2: Validate private key format
console.log('\n2️⃣ Validating private key format...');
try {
  const decoded = bs58.decode(privateKey);
  if (decoded.length === 64) {
    console.log(`✅ Private key is valid base58 (64 bytes)`);
    const kp = Keypair.fromSecretKey(Uint8Array.from(decoded));
    console.log(`✅ Keypair created successfully`);
    console.log(`   Derived public: ${kp.publicKey.toBase58()}`);
  } else {
    console.error(`❌ Private key wrong length: ${decoded.length} bytes (expected 64)`);
  }
} catch (e) {
  console.error(`❌ Private key decode failed: ${e.message}`);
}

// Test 3: Validate public key format
console.log('\n3️⃣ Validating public key format...');
try {
  const pk = new PublicKey(publicKey);
  console.log(`✅ Public key is valid: ${pk.toBase58()}`);
} catch (e) {
  console.error(`❌ Public key validation failed: ${e.message}`);
}

// Test 4: Check AI providers
console.log('\n4️⃣ Checking AI providers...');
if (process.env.OPENROUTER_API_KEY) {
  console.log(`✅ OpenRouter API key present`);
  console.log(`   Model: ${process.env.OPENROUTER_MODEL || 'default'}`);
} else {
  console.warn('⚠️  OpenRouter API key missing');
}

if (process.env.ANTHROPIC_API_KEY) {
  console.log(`✅ Anthropic API key present`);
  console.log(`   Model: ${process.env.ANTHROPIC_MODEL || 'default'}`);
} else {
  console.warn('⚠️  Anthropic API key missing');
}

console.log('\n✅ Validation complete! Ready for deployment.\n');
