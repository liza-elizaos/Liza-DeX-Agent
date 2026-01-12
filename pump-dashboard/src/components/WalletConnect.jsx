import React from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Wallet, LogOut } from 'lucide-react';

export const WalletConnect = () => {
  const { publicKey, disconnect } = useWallet();

  return (
    <div className="flex items-center gap-4">
      {publicKey ? (
        <div className="flex items-center gap-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg">
          <Wallet size={20} />
          <span className="font-bold">{publicKey.toString().slice(0, 8)}...</span>
          <button
            onClick={disconnect}
            className="ml-2 hover:opacity-80 transition"
            title="Disconnect"
          >
            <LogOut size={18} />
          </button>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg p-1">
          <WalletMultiButton className="!bg-white !text-black !rounded-md" />
        </div>
      )}
    </div>
  );
};
