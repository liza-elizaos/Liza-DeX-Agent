import { PublicKey, Connection } from '@solana/web3.js';
import type { WalletContextState } from '@solana/wallet-adapter-react';
import { getSolBalance } from './walletHelpers';

export type CommandResult = {
  handled: boolean;
  reply?: string;
};

// Very small parser for common commands used by the chat UI.
export async function handleChatCommand(
  message: string,
  opts: { connection?: Connection; wallet?: WalletContextState }
): Promise<CommandResult> {
  const text = message.trim().toLowerCase();

  // Balance check
  if (text.includes('balance') || text.includes('check my balance')) {
    if (!opts.wallet?.publicKey || !opts.connection) {
      return { handled: true, reply: 'Please connect your wallet to check balance.' };
    }
    try {
      const bal = await getSolBalance(opts.connection, opts.wallet.publicKey as PublicKey);
      return { handled: true, reply: `Your SOL balance: ${bal.toFixed(6)} SOL` };
    } catch (e) {
      return { handled: true, reply: `Balance check failed: ${e instanceof Error ? e.message : 'error'}` };
    }
  }

  // Watch token: "watch token <ADDRESS>"
  if (text.startsWith('watch token')) {
    const parts = message.split(/\s+/);
    const addr = parts[2];
    if (!addr) return { handled: true, reply: 'Usage: watch token <TOKEN_MINT_ADDRESS>' };
    try {
      // Save to localStorage watchlist for now
      const key = 'liza_watchlist_v0';
      const cur = JSON.parse(localStorage.getItem(key) || '[]');
      if (!cur.includes(addr)) cur.push(addr);
      localStorage.setItem(key, JSON.stringify(cur));
      return { handled: true, reply: `Added ${addr} to your watchlist.` };
    } catch (e) {
      return { handled: true, reply: 'Failed to add to watchlist.' };
    }
  }

  // Swap hint
  if (text.startsWith('swap') || text.includes('swap ')) {
    return { handled: true, reply: 'To swap, open the Swap panel — this will guide you through quoting and signing the transaction.' };
  }

  // Not handled
  return { handled: false };
}
