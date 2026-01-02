import { VersionedTransaction } from '@solana/web3.js';

// Helper to convert base64 -> Uint8Array
function base64ToUint8Array(base64: string): Uint8Array {
  const binary = atob(base64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

// Test base64 from previous swap
const testBase64 = "AQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAQAGGKIQZOAF1SYNL7Tp/OIcASAzcCg70UZ1uk8Hqg4gr3VMJvmWtd4sK0FtP420O0DQpwfX0OhzCIcEUh9n1fYm0qt+Ai3fNqXUr+apf2L6519pDaMboiYCAH1s2hz8vid464e1I/p3Gy551653GdDPX3KX0D4dWPXyZvsBemb3XlwHiiDOkz7sJDPaIbVpkVuFWO/KF7rlet7R+HAsbVJdqZHHGNxtxLw1kbC2iubW27sQb1u67sNha8c/MNPFWSlf8ckPtHsyvKRD5kG18GfE89zudv2AAqE9tL9IhOAOw9W0zDdav5Ym6rd8h2GayjIaY5rhL52AH7XFeo1kPaGK4Wf0leik9jkv1362dohmM3IIlfyxQveyd3cvj/bIXjnAqwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAwZGb+UhFzL/7K26csOb57yM5bvF9xJrLEObOkAAAAAEedVb8jHAbu50xW7OaBUH/bGy3qP0jlECsc2iVrwTjwbd9uHXZaGT2cvhRs7reawctIXtX1s3kTqM9YV+/wCpgpflRP9EQGoTt/pkws/6PsbhXfiTXgDHQXDervAT832MlyWPTiSJ8bs9ECkUjg2DC1oTmdr/EIQEjnvY2+n4WbQ/+if11/ZKdMCbHylYed5LCas238ndUUsyGqezjOXoW9vHELMJEczRCiPa8V5Rx3PTLiwykbwFJyFoPW18zL8ECgAFArjIAgAOBgAEABgJDAEBCysMDQACBgMEGhgLCw8LHQ0VCAYUFhsaHh8cDAwZDAwXDREYGwMQCBMBBQcSK8EgmzNB1pyBBgIAAAB5AWQAAS8AAGQBAsDUAQAAAAAA5u8NAAAAAAAPAAAMAwQAAAEJAv7oxv+BdJvtepV9LMgffvMnYvhZZCSvFE4zK7l4VGJ2BH1+fy8FgA6BXIPdQMuNJaJHv+04x8D4Sg82s/W3PeRY8dKw3RipgfqwqQMSFxQEFhsTFQ==";

console.log('[TEST] Starting deserialization test...');
console.log('[TEST] Base64 length:', testBase64.length);

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
