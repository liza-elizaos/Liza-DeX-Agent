import { Connection, VersionedTransaction } from '@solana/web3.js';

// Helper to convert base64 -> Uint8Array in browsers
function base64ToUint8Array(base64: string): Uint8Array {
  const binary = atob(base64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

// Helper to convert Uint8Array -> base64 in browsers (no Buffer)
function uint8ArrayToBase64(array: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < array.length; i++) {
    binary += String.fromCharCode(array[i]);
  }
  return btoa(binary);
}

/**
 * Sign and send a VersionedTransaction base64 returned by the swap API.
 * - `wallet` should be the connected wallet adapter (e.g. from useWallet())
 * - `rpcUrl` optional Solana RPC endpoint
 */
export async function signAndSendBase64Tx(
  transactionBase64: string,
  wallet: any,
  rpcUrl: string = (window as any).__SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com'
) {
  if (!transactionBase64) throw new Error('Missing transactionBase64');
  if (!wallet) throw new Error('Wallet not provided');

  console.log('[SIGN] Starting transaction signing process');

  // Clean the base64 string - remove any whitespace (newlines, spaces, etc)
  // This can happen when the JSON response has been formatted with line breaks
  const cleanBase64 = transactionBase64.replace(/\s/g, '');
  console.log('[SIGN] Base64 original length:', transactionBase64.length, 'cleaned length:', cleanBase64.length);

  // Deserialize VersionedTransaction
  const txBytes = base64ToUint8Array(cleanBase64);
  console.log('[SIGN] Deserialized transaction bytes length:', txBytes.length);

  // VersionedTransaction.deserialize expects a Uint8Array directly
  const tx = VersionedTransaction.deserialize(txBytes);
  console.log('[SIGN] Transaction deserialized successfully');

  // Wallet signing
  // Support both wallet-adapter (wallet.signTransaction) and Phantom injected provider
  let signedTx: VersionedTransaction;

  try {
    if (typeof wallet.signTransaction === 'function') {
      console.log('[SIGN] Using wallet.signTransaction from wallet adapter');
      signedTx = await wallet.signTransaction(tx);
    } else if ((window as any).solana && typeof (window as any).solana.signTransaction === 'function') {
      console.log('[SIGN] Using Phantom injected signTransaction');
      signedTx = await (window as any).solana.signTransaction(tx);
    } else {
      throw new Error('No compatible wallet signing method found');
    }
  } catch (signError) {
    console.error('[SIGN] Signing error:', signError);
    throw signError;
  }

  console.log('[SIGN] Transaction signed successfully');

  // Serialize signed transaction to base64 (browser-safe)
  const raw = signedTx.serialize();
  const base64Tx = uint8ArrayToBase64(raw);
  console.log('[SEND] Sending signed transaction via relay, size:', raw.length, 'bytes');

  // Send to backend relay endpoint (bypasses CORS)
  try {
    const relayUrl = '/api/relay-transaction';
    const relayResponse = await fetch(relayUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transactionBase64: base64Tx }),
    });

    console.log('[SEND] Relay response status:', relayResponse.status);

    if (!relayResponse.ok) {
      const errorData = await relayResponse.json().catch(() => ({}));
      console.error('[SEND] Relay error:', errorData);
      throw new Error(`Relay returned ${relayResponse.status}: ${JSON.stringify(errorData)}`);
    }

    const relayData = await relayResponse.json();
    const txid = relayData.txid;

    if (!txid) {
      throw new Error('No txid returned from relay');
    }

    console.log('[SEND] Transaction relayed successfully, txid:', txid);

    // Optionally wait for confirmation via relay or direct RPC
    if (rpcUrl) {
      try {
        console.log('[CONFIRM] Waiting for confirmation...');
        const connection = new Connection(rpcUrl, 'confirmed');
        await connection.confirmTransaction(txid, 'confirmed');
        console.log('[CONFIRM] Transaction confirmed!');
      } catch (confirmErr) {
        console.warn('[CONFIRM] Confirmation check failed (tx may still be valid):', confirmErr?.message || confirmErr);
      }
    }

    return txid;
  } catch (relayErr: any) {
    console.error('[SEND] Relay failed:', relayErr?.message || relayErr);
    throw new Error(`Failed to send transaction: ${relayErr?.message || 'Relay error'}`);
  }
}
