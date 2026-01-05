import { Connection, PublicKey } from '@solana/web3.js';
import axios from 'axios';

const rpcUrl = 'https://solana-mainnet.g.alchemy.com/v2/pfiW_dJZBV0RjLHK1TgV53sMmLFTcCmX';
const connection = new Connection(rpcUrl, 'confirmed');

// Well-known wallet with many tokens
const testWallet = 'GJvPqXiU2f3mKwgSdkbGNfVSXF5DaKbfS7gJXcP3sMfR'; // From explorer

console.log('🧪 Testing Token Account Fetching\n');
console.log('RPC:', rpcUrl.substring(0, 50) + '...');
console.log('Wallet:', testWallet);

try {
  const publicKey = new PublicKey(testWallet);
  
  console.log('\n📊 Fetching token accounts...');
  const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
    publicKey,
    { programId: new PublicKey('TokenkegQfeZyiNwAJsyFbPVwwQQfuM32jneSYP1daB') }
  );

  console.log(`✅ Found ${tokenAccounts.value.length} token accounts\n`);

  let tokenCount = 0;
  for (const tokenAccount of tokenAccounts.value) {
    const parsedInfo = tokenAccount.account.data.parsed?.info;
    if (!parsedInfo) continue;

    const mint = parsedInfo.mint;
    const balance = parsedInfo.tokenAmount?.uiAmount || 0;

    if (balance > 0) {
      tokenCount++;
      console.log(`Token ${tokenCount}:`, {
        mint: mint.substring(0, 20) + '...',
        balance: balance.toFixed(6),
      });
    }

    if (tokenCount >= 5) break; // Show first 5
  }

  console.log(`\n✅ Total tokens with balance > 0: ${tokenCount}`);
} catch (error) {
  console.error('❌ Error:', error instanceof Error ? error.message : error);
}
