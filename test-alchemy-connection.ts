import { Connection, PublicKey } from '@solana/web3.js';
import * as dotenv from 'dotenv';

dotenv.config();

async function testAlchemy() {
  console.log('🧪 Testing Alchemy RPC Connection\n');
  
  const rpcUrl = process.env.SOLANA_RPC_URL || 'https://solana-mainnet.g.alchemy.com/v2/pfiW_dJZBV0RjLHK1TgV53sMmLFTcCmX';
  console.log(`RPC URL: ${rpcUrl}\n`);

  const connection = new Connection(rpcUrl, 'confirmed');

  try {
    // Test 1: Get slot
    console.log('✓ Testing connection...');
    const slot = await connection.getSlot();
    console.log(`  ✅ Current slot: ${slot}\n`);

    // Test 2: Check wallet balance
    const walletAddress = process.env.SOLANA_PUBLIC_KEY || 'CMVrzdso4SShQm2irrc7jMCN9Vw5QxXvrZKB79cYPPJT';
    console.log(`✓ Checking wallet: ${walletAddress}`);
    const balance = await connection.getBalance(new PublicKey(walletAddress));
    console.log(`  ✅ SOL Balance: ${balance / 1e9} SOL\n`);

    // Test 3: Get token accounts
    console.log(`✓ Fetching token accounts...`);
    try {
      const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
        new PublicKey(walletAddress),
        { programId: new PublicKey('TokenkegQfeZyiNwAJsyFbPVwwQQfimJwqDeg4qqvGn') },
        'confirmed'
      );
      console.log(`  ✅ Found ${tokenAccounts.value.length} token accounts\n`);

      if (tokenAccounts.value.length > 0) {
        console.log('📋 Token Accounts:');
        tokenAccounts.value.forEach((account, idx) => {
          const parsed = account.account.data.parsed?.info;
          console.log(`  ${idx + 1}. ${parsed?.mint || 'Unknown'}`);
          console.log(`     Balance: ${parsed?.tokenAmount?.amount || 0}`);
        });
      }
    } catch (e: any) {
      console.log(`  ⚠️  Error fetching token accounts: ${e.message}\n`);
    }

    console.log('\n✅ Alchemy connection test complete!');

  } catch (error: any) {
    console.error('❌ Connection test failed:', error.message);
    process.exit(1);
  }
}

testAlchemy();
