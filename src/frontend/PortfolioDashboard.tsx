import React, { useState, useEffect } from 'react';

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

interface Props {
  walletAddress?: string | null;
}

export default function PortfolioDashboard({ walletAddress }: Props) {
  const [portfolio, setPortfolio] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  // Fetch portfolio
  const fetchPortfolio = async (address: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/portfolio', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAddress: address,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setPortfolio(data.data);
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

  // When wallet address changes
  useEffect(() => {
    if (walletAddress) {
      fetchPortfolio(walletAddress);
      
      // Auto-refresh every 60 seconds
      const interval = setInterval(() => {
        fetchPortfolio(walletAddress);
      }, 60000);

      return () => clearInterval(interval);
    } else {
      setPortfolio(null);
      setError(null);
    }
  }, [walletAddress]);

  // Manual refresh button
  const handleRefresh = async () => {
    if (walletAddress) {
      await fetchPortfolio(walletAddress);
    }
  };

  if (!walletAddress) {
    return null;
  }

  return (
    <div className="w-full space-y-4">
      {/* Refresh Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold text-white">📊 Portfolio</h2>
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="px-3 py-1 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-sm rounded font-semibold transition-colors"
        >
          {loading ? '⏳' : '🔄'}
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-900/30 border border-red-500 rounded p-3 text-red-300 text-sm">
          ❌ {error}
        </div>
      )}

      {/* Loading Spinner */}
      {loading && !portfolio && (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
        </div>
      )}

      {/* Portfolio Display */}
      {portfolio && (
        <div className="space-y-3">
          {/* Total Value Card */}
          <div className="bg-gradient-to-r from-purple-900 to-purple-800 rounded p-4 border border-purple-700">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-purple-300 text-xs mb-1">💰 Total Value</p>
                <h3 className="text-2xl font-bold text-white">
                  {formatCurrency(portfolio.totalValueUSD)}
                </h3>
              </div>
              <div className="text-right text-xs text-purple-300">
                <p>{portfolio.tokenCount} assets</p>
              </div>
            </div>
          </div>

          {/* SOL Holdings */}
          <div className="bg-gray-800 rounded p-3 border border-gray-700">
            <div className="flex justify-between items-center">
              <span className="text-gray-300 text-sm">◎ SOL</span>
              <div className="text-right">
                <p className="text-white font-semibold">
                  {formatNumber(portfolio.solBalance)}
                </p>
                <p className="text-yellow-400 text-xs">
                  {formatCurrency(portfolio.solValueUSD)}
                </p>
              </div>
            </div>
          </div>

          {/* Token Holdings */}
          {portfolio.tokens && portfolio.tokens.length > 0 && (
            <div className="bg-gray-800 rounded p-3 border border-gray-700 text-sm max-h-48 overflow-y-auto">
              <p className="text-gray-400 text-xs mb-2">📈 Top Tokens</p>
              {portfolio.tokens.slice(0, 3).map((token, idx) => (
                <div key={idx} className="flex justify-between py-1.5 border-b border-gray-700 last:border-0">
                  <span className="text-gray-300">{token.symbol}</span>
                  <span className="text-white font-semibold">{formatCurrency(token.valueUSD)}</span>
                </div>
              ))}
              {portfolio.tokens.length > 3 && (
                <p className="text-gray-500 text-xs mt-2">
                  +{portfolio.tokens.length - 3} more
                </p>
              )}
            </div>
          )}

          {/* Wallet Info */}
          <div className="text-xs text-gray-500 text-center pt-2 border-t border-gray-700">
            <p className="break-words">
              {portfolio.walletAddress.substring(0, 8)}...{portfolio.walletAddress.substring(-8)}
            </p>
            <p>{new Date(portfolio.timestamp).toLocaleTimeString()}</p>
          </div>
        </div>
      )}
    </div>
  );
}
