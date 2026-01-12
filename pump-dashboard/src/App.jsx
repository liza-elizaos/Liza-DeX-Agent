import React, { useMemo } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
} from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';

import { PumpProvider } from './context/PumpContext';
import { WalletConnect } from './components/WalletConnect';
import {
  TradeFeature,
  PortfolioFeature,
  AnalyticsFeature,
  BotFeature,
  LiquidityFeature,
  SmartContractFeature,
  BatchFeature,
  EventsFeature,
  MarketMakerFeature,
  SocialFeature,
} from './components/Features';

// Import wallet styles
import '@solana/wallet-adapter-react-ui/styles.css';

const AppContent = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="bg-black/50 backdrop-blur border-b-2 border-purple-500 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
              🚀 PUMP.FUN DASHBOARD
            </h1>
            <p className="text-xs text-gray-400 mt-1">10 Features • Wallet Integration • Real-time Monitoring</p>
          </div>
          <WalletConnect />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Features Grid - 2x5 Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Row 1 */}
          <div className="lg:col-span-1">
            <TradeFeature />
          </div>
          <div className="lg:col-span-1">
            <PortfolioFeature />
          </div>

          {/* Row 2 */}
          <div className="lg:col-span-1">
            <AnalyticsFeature />
          </div>
          <div className="lg:col-span-1">
            <BotFeature />
          </div>

          {/* Row 3 */}
          <div className="lg:col-span-1">
            <LiquidityFeature />
          </div>
          <div className="lg:col-span-1">
            <SmartContractFeature />
          </div>

          {/* Row 4 */}
          <div className="lg:col-span-1">
            <BatchFeature />
          </div>
          <div className="lg:col-span-1">
            <EventsFeature />
          </div>

          {/* Row 5 */}
          <div className="lg:col-span-1">
            <MarketMakerFeature />
          </div>
          <div className="lg:col-span-1">
            <SocialFeature />
          </div>
        </div>

        {/* Features Legend */}
        <div className="bg-black/50 backdrop-blur rounded-lg border-2 border-purple-500 p-6 mb-8">
          <h3 className="text-xl font-bold text-purple-400 mb-4">📋 10 Features Checklist</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center"><span className="text-2xl">🎯</span><p className="text-xs mt-2 text-gray-300">Trading</p></div>
            <div className="text-center"><span className="text-2xl">💼</span><p className="text-xs mt-2 text-gray-300">Portfolio</p></div>
            <div className="text-center"><span className="text-2xl">📊</span><p className="text-xs mt-2 text-gray-300">Analytics</p></div>
            <div className="text-center"><span className="text-2xl">🤖</span><p className="text-xs mt-2 text-gray-300">Bots</p></div>
            <div className="text-center"><span className="text-2xl">💧</span><p className="text-xs mt-2 text-gray-300">Liquidity</p></div>
            <div className="text-center"><span className="text-2xl">⚙️</span><p className="text-xs mt-2 text-gray-300">Contracts</p></div>
            <div className="text-center"><span className="text-2xl">📦</span><p className="text-xs mt-2 text-gray-300">Batch</p></div>
            <div className="text-center"><span className="text-2xl">🔔</span><p className="text-xs mt-2 text-gray-300">Events</p></div>
            <div className="text-center"><span className="text-2xl">📈</span><p className="text-xs mt-2 text-gray-300">Maker</p></div>
            <div className="text-center"><span className="text-2xl">👥</span><p className="text-xs mt-2 text-gray-300">Social</p></div>
          </div>
        </div>

        {/* Testing Info */}
        <div className="bg-blue-900/30 border-2 border-blue-500 rounded-lg p-6 text-center">
          <h3 className="text-xl font-bold text-blue-300 mb-2">🧪 Testing Mode</h3>
          <p className="text-sm text-gray-300">
            ✅ Wallet Integration Working • ✅ All 10 Features Visible • ✅ Ready for Deployment
          </p>
          <p className="text-xs text-gray-400 mt-2">Connect Phantom wallet to test live features</p>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t-2 border-purple-500 bg-black/30 mt-12 py-6 text-center text-gray-400">
        <p>© 2026 Pump.fun Dashboard | Built with React + Solana + Pump SDK</p>
        <p className="text-xs mt-2">Localhost Testing • Ready for Vercel Deployment</p>
      </footer>
    </div>
  );
};

function App() {
  const network = WalletAdapterNetwork.Mainnet;
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);

  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
    ],
    []
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <PumpProvider>
            <AppContent />
          </PumpProvider>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

export default App;
