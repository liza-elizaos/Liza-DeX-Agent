import type { PublicKey } from '@solana/web3.js';
import type { Connection } from '@solana/web3.js';

export async function getSolBalance(connection: Connection, publicKey: PublicKey) {
  const lamports = await connection.getBalance(publicKey);
  return lamports / 1e9;
}

// Wrapper around walletAdapter's sendTransaction
import type { WalletContextState } from '@solana/wallet-adapter-react';
import type { Transaction } from '@solana/web3.js';

export async function signAndSendTransaction(
  connection: Connection,
  wallet: WalletContextState,
  transaction: Transaction
) {
  if (!wallet.publicKey || !wallet.sendTransaction) throw new Error('Wallet not connected');
  const signature = await wallet.sendTransaction(transaction, connection);
  await connection.confirmTransaction(signature, 'confirmed');
  return signature;
}
