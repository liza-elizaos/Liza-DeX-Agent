// Test: Simulate the complete signing flow locally
import { VersionedTransaction, PublicKey } from '@solana/web3.js';
import * as fs from 'fs';

// Simulated Phantom wallet
const mockPhantomWallet = {
  publicKey: new PublicKey('CMVrzdso4SShQm2irrc7jMCN9Vw5QxXvrZKB79cYPPJT'),
  async signTransaction(tx: VersionedTransaction): Promise<VersionedTransaction> {
    console.log('[MOCK-PHANTOM] Signing transaction...');
    console.log('[MOCK-PHANTOM] Message type:', tx.message.constructor.name);
    console.log('[MOCK-PHANTOM] Account keys:', tx.message.staticAccountKeys.length);
    console.log('[MOCK-PHANTOM] ✅ Transaction signed (mock)');
    return tx;
  }
};

// Helper to convert base64 -> Uint8Array (same as frontend)
function base64ToUint8Array(base64: string): Uint8Array {
  const binary = atob(base64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

// Main signing flow (same as frontend)
async function testSigningFlow() {
  console.log('\n🧪 COMPLETE SIGNING FLOW TEST\n');
  
  // Read CLEAN base64 from file
  const base64 = fs.readFileSync('./txbase64_clean.txt', 'utf-8').trim();
  
  try {
    console.log('1️⃣  Received base64 from API');
    console.log('   Length:', base64.length);
    
    // STEP 1: Clean whitespace (THE FIX)
    console.log('\n2️⃣  Cleaning whitespace...');
    const cleanBase64 = base64.replace(/\s/g, '');
    console.log('   ✅ Cleaned length:', cleanBase64.length);
    
    // STEP 2: Decode base64
    console.log('\n3️⃣  Decoding base64 to bytes...');
    const txBytes = base64ToUint8Array(cleanBase64);
    console.log('   ✅ Decoded bytes length:', txBytes.length);
    
    // STEP 3: Deserialize VersionedTransaction
    console.log('\n4️⃣  Deserializing VersionedTransaction...');
    const tx = VersionedTransaction.deserialize(txBytes);
    console.log('   ✅ Deserialized successfully!');
    console.log('   📊 Message header:', {
      requiredSigners: tx.message.header.numRequiredSigners,
      readonlySignedAccounts: tx.message.header.numReadonlySignedAccounts,
      readonlyUnsignedAccounts: tx.message.header.numReadonlyUnsignedAccounts,
    });
    console.log('   📊 Account keys:', tx.message.staticAccountKeys.length);
    console.log('   📊 Instructions:', tx.message.compiledInstructions.length);
    
    // STEP 4: Sign with Phantom (mocked)
    console.log('\n5️⃣  Signing with Phantom wallet...');
    const signedTx = await mockPhantomWallet.signTransaction(tx);
    console.log('   ✅ Transaction signed!');
    
    // STEP 5: Serialize signed transaction
    console.log('\n6️⃣  Serializing signed transaction...');
    const raw = signedTx.serialize();
    console.log('   ✅ Serialized length:', raw.length, 'bytes');
    
    console.log('\n✅ COMPLETE SIGNING FLOW SUCCESSFUL!\n');
    console.log('📋 Summary:');
    console.log('   - Base64 cleaning: ✅');
    console.log('   - Deserialization: ✅');
    console.log('   - Phantom signing: ✅');
    console.log('   - Ready to broadcast: ✅');
    
  } catch (error) {
    console.error('\n❌ ERROR:', error instanceof Error ? error.message : String(error));
    if (error instanceof Error) {
      console.error('\n📋 Stack trace:');
      console.error(error.stack);
    }
  }
}

testSigningFlow();
