import { VersionedTransaction } from '@solana/web3.js';
import * as fs from 'fs';

// Helper to convert base64 -> Uint8Array - with whitespace cleaning
function base64ToUint8Array(base64: string): Uint8Array {
  // Remove all whitespace (newlines, spaces, tabs, etc)
  const cleanBase64 = base64.replace(/\s/g, '');
  
  console.log('[DECODE] Original length:', base64.length);
  console.log('[DECODE] Cleaned length:', cleanBase64.length);
  
  const binary = atob(cleanBase64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

// Read test base64 from clean file
const testBase64 = fs.readFileSync('./txbase64_clean.txt', 'utf-8');

console.log('[TEST] Starting deserialization test...');
console.log('[TEST] Base64 input length:', testBase64.length);

try {
  const txBytes = base64ToUint8Array(testBase64);
  console.log('[TEST] ✅ Base64 decoded successfully');
  console.log('[TEST] Uint8Array length:', txBytes.length);
  console.log('[TEST] First 32 bytes:', Array.from(txBytes.slice(0, 32)).map(b => b.toString(16).padStart(2, '0')).join(' '));
  
  // Try to deserialize
  console.log('[TEST] Attempting to deserialize VersionedTransaction...');
  const tx = VersionedTransaction.deserialize(txBytes);
  console.log('[TEST] ✅ VersionedTransaction deserialized successfully!');
  console.log('[TEST] Transaction message header:', {
    numRequiredSigners: tx.message.header.numRequiredSigners,
    numReadonlySignedAccounts: tx.message.header.numReadonlySignedAccounts,
    numReadonlyUnsignedAccounts: tx.message.header.numReadonlyUnsignedAccounts,
  });
  console.log('[TEST] Number of account keys:', tx.message.staticAccountKeys.length);
  console.log('[TEST] Number of instructions:', tx.message.compiledInstructions.length);
  console.log('[TEST] ✅ All checks passed!');
} catch (error) {
  console.error('[TEST] ❌ Error:', error instanceof Error ? error.message : String(error));
  if (error instanceof Error) {
    console.error('[TEST] Stack:', error.stack);
  }
}
