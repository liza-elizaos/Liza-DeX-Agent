import React, { useState, useEffect } from 'react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';

interface PortfolioData {
  walletAddress: string;
  solBalance: number;
  solValueUSD: number;
  totalValueUSD: number;
  tokenCount: number;
  tokens: Array<{
    mint: string;
    symbol: string;
    balance: number;
    price: number;
    valueUSD: number;
  }>;
  topTokens: any[];
  portfolioComposition: any[];
  timestamp: string;
}

export default function PortfolioDashboard() {
  const [portfolio, setPortfolio] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { connection } = useConnection();
  const wallet = useWallet();
  const { publicKey, connected, disconnect } = wallet;

  // Helper functions
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return value.toLocaleString('en-US', {
      minimumFractionDigits: 4,
      maximumFractionDigits: 8,
    });
  };

  // When wallet connects
  useEffect(() => {
    if (connected && publicKey) {
      console.log('[Portfolio] Connected wallet:', publicKey.toString());
      setError(null);
      setPortfolio(null);

      // Automatically fetch portfolio after connecting
      setTimeout(() => fetchPortfolio(publicKey.toString()), 500);
    }
  }, [connected, publicKey]);

  // When wallet disconnects
  useEffect(() => {
    if (!connected) {
      setPortfolio(null);
      setError(null);
    }
  }, [connected]);

  // Fetch portfolio
  const fetchPortfolio = async (address?: string) => {
    if (!publicKey && !address) {
      setError('Connect wallet first');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Get wallet address
      let cleanAddress = address || publicKey?.toString();

      if (!cleanAddress) {
        throw new Error('No wallet address available');
      }

      console.log('[Portfolio] Fetching for address:', cleanAddress);

      const response = await fetch('/api/portfolio', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAddress: cleanAddress,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setPortfolio(data.data);
        console.log('[Portfolio] Data fetched successfully');
      } else {
        throw new Error(data.error || 'Failed to fetch portfolio');
      }
    } catch (err) {
      console.error('[Portfolio] Fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch portfolio');
      setPortfolio(null);
    } finally {
      setLoading(false);
    }
  };

  // Manual refresh button
  const handleRefresh = async () => {
    if (publicKey) {
      await fetchPortfolio(publicKey.toString());
    }
  };

  // Auto-refresh portfolio every 60 seconds
  useEffect(() => {
    if (!connected) return;

    const interval = setInterval(() => {
      if (publicKey) {
        fetchPortfolio(publicKey.toString());
      }
    }, 60000); // 60 seconds

    return () => clearInterval(interval);
  }, [connected, publicKey]);

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-2 text-white">💼 Portfolio</h1>
        <p className="text-gray-400">Real-time wallet analytics on Solana</p>
      </div>

      {/* Connect Button */}
      <div className="mb-8 flex justify-between items-center">
        <WalletMultiButton />
        {connected && (
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:bg-gray-600 transition"
          >
            {loading ? 'Loading...' : '🔄 Refresh'}
          </button>
        )}
      </div>

      {/* Not Connected Message */}
      {!connected && (
        <div className="bg-blue-900/30 border border-blue-500 rounded-lg p-6 text-center">
          <p className="text-blue-300 mb-4">
            Click "Connect Phantom" to view your portfolio
          </p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-900/30 border border-red-500 rounded-lg p-4 mb-6 text-red-300">
          ❌ {error}
        </div>
      )}

      {/* Loading Spinner */}
      {loading && !portfolio && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      )}

      {/* Portfolio Display */}
      {portfolio && (
        <div className="space-y-6">
          {/* Total Value Card */}
          <div className="bg-gradient-to-r from-blue-900 to-blue-800 rounded-lg p-6 border border-blue-700">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-blue-300 text-sm mb-2">💰 Total Portfolio Value</p>
                <h2 className="text-4xl font-bold text-white">
                  {formatCurrency(portfolio.totalValueUSD)}
                </h2>
                <p className="text-blue-300 text-sm mt-2">
                  📊 {portfolio.tokenCount} assets held
                </p>
              </div>
              <div className="text-right">
                <p className="text-blue-300 text-xs">Updated</p>
                <p className="text-xs text-blue-400">{new Date(portfolio.timestamp).toLocaleTimeString()}</p>
              </div>
            </div>
          </div>

          {/* SOL Holdings */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-white">◎ SOL Balance</h3>
              <span className="text-2xl font-bold text-yellow-400">
                {formatNumber(portfolio.solBalance)}
              </span>
            </div>
            <div className="flex justify-between text-gray-400">
              <span>USD Value</span>
              <span className="text-white font-semibold">
                ◎ {formatCurrency(portfolio.solValueUSD)}
              </span>
            </div>
          </div>

          {/* Token Holdings */}
          {portfolio.tokens && portfolio.tokens.length > 0 && (
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4">📈 Token Holdings</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left py-2 text-gray-400">Token</th>
                      <th className="text-right py-2 text-gray-400">Balance</th>
                      <th className="text-right py-2 text-gray-400">Price</th>
                      <th className="text-right py-2 text-gray-400">Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {portfolio.tokens.slice(0, 5).map((token, idx) => (
                      <tr key={idx} className="border-b border-gray-700 hover:bg-gray-700/50">
                        <td className="py-3 text-white font-medium">{token.symbol}</td>
                        <td className="py-3 text-right text-gray-300">
                          {formatNumber(token.balance)}
                        </td>
                        <td className="py-3 text-right text-gray-300">
                          ${token.price.toFixed(8)}
                        </td>
                        <td className="py-3 text-right text-white font-semibold">
                          {formatCurrency(token.valueUSD)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {portfolio.tokens.length > 5 && (
                <p className="text-gray-400 text-sm mt-4">
                  ... and {portfolio.tokens.length - 5} more tokens
                </p>
              )}
            </div>
          )}

          {/* Empty Portfolio */}
          {(!portfolio.tokens || portfolio.tokens.length === 0) && (
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 text-center">
              <p className="text-gray-400">No tokens found in this wallet</p>
            </div>
          )}

          {/* Portfolio Info */}
          <div className="text-xs text-gray-500 text-center pt-4">
            <p>Wallet: {portfolio.walletAddress.substring(0, 8)}...{portfolio.walletAddress.substring(-8)}</p>
            <p>Last Updated: {new Date(portfolio.timestamp).toLocaleString()}</p>
          </div>
        </div>
      )}
    </div>
  );
}
