import { Connection, VersionedTransaction } from '@solana/web3.js';

// Helper to convert base64 -> Uint8Array in browsers
function base64ToUint8Array(base64: string): Uint8Array {
  const binary = atob(base64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
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

  // Deserialize VersionedTransaction
  const txBytes = base64ToUint8Array(transactionBase64);
  const tx = VersionedTransaction.deserialize(txBytes.buffer ? new Uint8Array(txBytes).buffer : txBytes.buffer);

  // Wallet signing
  // Support both wallet-adapter (wallet.signTransaction) and Phantom injected provider
  let signedTx: VersionedTransaction;

  if (typeof wallet.signTransaction === 'function') {
    signedTx = await wallet.signTransaction(tx);
  } else if ((window as any).solana && typeof (window as any).solana.signTransaction === 'function') {
    signedTx = await (window as any).solana.signTransaction(tx);
  } else {
    throw new Error('No compatible wallet signing method found');
  }

  // Send signed transaction to RPC
  const connection = new Connection(rpcUrl, 'confirmed');
  const raw = signedTx.serialize();
  const txid = await connection.sendRawTransaction(raw, { skipPreflight: false, preflightCommitment: 'confirmed' });

  // Wait for confirmation (optional)
  await connection.confirmTransaction(txid, 'confirmed');

  return txid;
}
