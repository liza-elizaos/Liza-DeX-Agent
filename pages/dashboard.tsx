// pages/dashboard.tsx
// Creator dashboard page

import React from 'react';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import { WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';

// Dynamic import
const CreatorDashboard = dynamic(() => import('../components/CreatorDashboard'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p>Loading Creator Dashboard...</p>
      </div>
    </div>
  ),
});

export default function Dashboard() {
  const wallets = [
    new PhantomWalletAdapter(),
    new SolflareWalletAdapter(),
  ];

  return (
    <>
      <Head>
        <title>💰 Creator Dashboard - Claim Your Rewards</title>
        <meta name="description" content="View and claim your accumulated creator fees" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <CreatorDashboard />
        </WalletModalProvider>
      </WalletProvider>
    </>
  );
}
