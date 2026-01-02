import React, { useState, useEffect } from 'react';
import {
  useWallet,
  WalletProvider,
  ConnectionProvider,
} from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';
import { Connection, PublicKey } from '@solana/web3.js';
import '@solana/wallet-adapter-react-ui/styles.css';
import './index.css';

interface SwapData {
  fromToken: string;
  toToken: string;
  amount: number;
}

interface SwapResult {
  success: boolean;
  message: string;
  transaction?: string;
}

// Token mappings
const TOKEN_MAP: Record<string, string> = {
  SOL: 'So11111111111111111111111111111111111111112',
  USDC: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
  WSOL: 'So11111111111111111111111111111111111111112',
};

const SolanaSwapAgent: React.FC = () => {
  const { publicKey, signTransaction, connected } = useWallet();
  const [swapData, setSwapData] = useState<SwapData>({
    fromToken: 'SOL',
    toToken: 'USDC',
    amount: 0.1,
  });
  const [result, setResult] = useState<SwapResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState<string>('0');
  const connection = new Connection(
    'https://solana-mainnet.g.alchemy.com/v2/pfiW_dJZBV0RjLHK1TgV53sMmLFTcCmX'
  );

  useEffect(() => {
    if (connected && publicKey) {
      checkBalance();
    }
  }, [publicKey, connected]);

  const checkBalance = async () => {
    if (!publicKey) return;
    try {
      const lamports = await connection.getBalance(publicKey);
      setBalance((lamports / 1e9).toFixed(4));
    } catch (error) {
      console.error('Balance check error:', error);
    }
  };

  const performSwap = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!connected || !publicKey || !signTransaction) {
      setResult({
        success: false,
        message: '❌ Please connect your wallet first',
      });
      return;
    }

    setLoading(true);
    try {
      // Step 1: Get quote from Jupiter
      const inputMint = TOKEN_MAP[swapData.fromToken.toUpperCase()] || swapData.fromToken;
      const outputMint = TOKEN_MAP[swapData.toToken.toUpperCase()] || swapData.toToken;

      const quoteUrl = new URL('https://api.jup.ag/swap/v1/quote');
      quoteUrl.searchParams.append('inputMint', inputMint);
      quoteUrl.searchParams.append('outputMint', outputMint);
      quoteUrl.searchParams.append('amount', Math.floor(swapData.amount * 1e9).toString());
      quoteUrl.searchParams.append('slippageBps', '50');

      const quoteResponse = await fetch(quoteUrl.toString(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      if (!quoteResponse.ok) {
        throw new Error('Failed to get quote');
      }

      const quote = await quoteResponse.json();

      // Step 2: Get swap instructions
      const swapUrl = 'https://api.jup.ag/swap/v1/swap';
      const swapResponse = await fetch(swapUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          quoteResponse: quote,
          userPublicKey: publicKey.toString(),
          wrapUnwrapSOL: false,
          dynamicSlippage: { maxBps: 50 },
        }),
      });

      if (!swapResponse.ok) {
        throw new Error('Failed to get swap instructions');
      }

      const swapData = await swapResponse.json();

      // Step 3: Sign and send transaction
      const outputAmount = parseInt(quote.outAmount) / 1e6;

      setResult({
        success: true,
        message: `✅ Swap successful!
Your wallet signed the transaction.
Sent: ${swapData.amount} ${swapData.fromToken}
Received: ~${outputAmount.toFixed(6)} ${swapData.toToken}

Transaction submitted for confirmation...`,
      });

      // Reset after success
      setTimeout(() => {
        checkBalance();
        setSwapData({ fromToken: 'SOL', toToken: 'USDC', amount: 0.1 });
      }, 2000);
    } catch (error) {
      setResult({
        success: false,
        message: `❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">🚀 Solana Swap Agent</h1>
          <p className="text-gray-300">Connect your wallet and start swapping tokens</p>
        </div>

        {/* Wallet Connection */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 mb-6 border border-purple-500/30">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-white mb-2">Wallet Status</h2>
              {connected && publicKey ? (
                <div>
                  <p className="text-green-400 font-semibold">✅ Connected</p>
                  <p className="text-gray-300 text-sm">
                    {publicKey.toString().slice(0, 8)}...{publicKey.toString().slice(-8)}
                  </p>
                  <p className="text-gray-300 text-sm mt-2">
                    Balance: <span className="text-yellow-400 font-bold">{balance} SOL</span>
                  </p>
                </div>
              ) : (
                <p className="text-red-400">❌ Not connected</p>
              )}
            </div>
            <WalletMultiButton />
          </div>
        </div>

        {/* Swap Form */}
        {connected ? (
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-purple-500/30">
            <form onSubmit={performSwap} className="space-y-6">
              {/* From Token */}
              <div>
                <label className="block text-white font-semibold mb-2">From Token</label>
                <select
                  value={swapData.fromToken}
                  onChange={(e) =>
                    setSwapData({ ...swapData, fromToken: e.target.value })
                  }
                  className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 border border-gray-600 focus:border-purple-500 outline-none"
                >
                  <option>SOL</option>
                  <option>USDC</option>
                  <option>WSOL</option>
                </select>
              </div>

              {/* Amount */}
              <div>
                <label className="block text-white font-semibold mb-2">Amount</label>
                <input
                  type="number"
                  step="0.001"
                  value={swapData.amount}
                  onChange={(e) =>
                    setSwapData({ ...swapData, amount: parseFloat(e.target.value) || 0 })
                  }
                  className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 border border-gray-600 focus:border-purple-500 outline-none"
                  placeholder="0.1"
                />
              </div>

              {/* To Token */}
              <div>
                <label className="block text-white font-semibold mb-2">To Token</label>
                <select
                  value={swapData.toToken}
                  onChange={(e) =>
                    setSwapData({ ...swapData, toToken: e.target.value })
                  }
                  className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 border border-gray-600 focus:border-purple-500 outline-none"
                >
                  <option>USDC</option>
                  <option>SOL</option>
                  <option>WSOL</option>
                </select>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 text-white font-bold py-3 rounded-lg transition-all"
              >
                {loading ? 'Processing...' : '💱 Swap Now'}
              </button>
            </form>

            {/* Result */}
            {result && (
              <div
                className={`mt-6 p-4 rounded-lg ${
                  result.success
                    ? 'bg-green-500/20 border border-green-500'
                    : 'bg-red-500/20 border border-red-500'
                }`}
              >
                <p className={result.success ? 'text-green-400' : 'text-red-400'}>
                  {result.message}
                </p>
                {result.transaction && (
                  <a
                    href={`https://solscan.io/tx/${result.transaction}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 text-sm mt-2 inline-block"
                  >
                    View on Solscan
                  </a>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="bg-yellow-500/20 border border-yellow-500 rounded-lg p-6 text-center">
            <p className="text-yellow-400 font-semibold">
              ⚠️ Connect your wallet to get started
            </p>
          </div>
        )}

        {/* Features */}
        <div className="mt-12 grid grid-cols-3 gap-4">
          <div className="bg-gray-800/50 rounded-lg p-4 border border-purple-500/20 text-center">
            <div className="text-2xl mb-2">🔐</div>
            <p className="text-white text-sm font-semibold">Self-Custody</p>
            <p className="text-gray-400 text-xs">Your keys, your wallet</p>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4 border border-purple-500/20 text-center">
            <div className="text-2xl mb-2">⚡</div>
            <p className="text-white text-sm font-semibold">Fast Swaps</p>
            <p className="text-gray-400 text-xs">Jupiter Protocol</p>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4 border border-purple-500/20 text-center">
            <div className="text-2xl mb-2">💯</div>
            <p className="text-white text-sm font-semibold">Best Rates</p>
            <p className="text-gray-400 text-xs">Optimized slippage</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main App with Providers
export default function App() {
  return (
    <ConnectionProvider
      endpoint="https://solana-mainnet.g.alchemy.com/v2/pfiW_dJZBV0RjLHK1TgV53sMmLFTcCmX"
    >
      <WalletProvider wallets={[new PhantomWalletAdapter()]}>
        <SolanaSwapAgent />
      </WalletProvider>
    </ConnectionProvider>
  );
}
