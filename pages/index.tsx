// pages/index.tsx
// Main landing page with TokenLaunchApp

import React from 'react';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import { WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';

// Dynamic import to avoid SSR issues
const TokenLaunchApp = dynamic(() => import('../components/TokenLaunchApp'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p>Loading PumpFun Platform...</p>
      </div>
    </div>
  ),
});

export default function Home() {
  const wallets = [
    new PhantomWalletAdapter(),
    new SolflareWalletAdapter(),
  ];

  return (
    <>
      <Head>
        <title>🚀 AutoFun Token Launcher - PumpFun Alternative</title>
        <meta name="description" content="Launch tokens with bonding curves, earn creator fees, integrate with Liza AI" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <TokenLaunchApp />
        </WalletModalProvider>
      </WalletProvider>
    </>
  );
}
