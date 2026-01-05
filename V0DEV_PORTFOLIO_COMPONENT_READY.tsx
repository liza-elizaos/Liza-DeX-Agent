/**
 * PORTFOLIO DASHBOARD COMPONENT - v0.dev Ready
 * Copy this entire file and paste it into v0.dev
 * 
 * Features:
 * - Real-time portfolio display
 * - Auto-refresh every 60 seconds
 * - Beautiful dark theme with gradients
 * - Responsive mobile design
 * - Loading and error states
 */

'use client';

import { useState, useEffect } from 'react';
import { RefreshCw, TrendingUp, Wallet } from 'lucide-react';

interface Token {
  symbol: string;
  mint: string;
  balance: number;
  valueUSD: number;
  percentage: number;
}

interface PortfolioData {
  totalValueUSD: number;
  solBalance: number;
  solValueUSD: number;
  tokenCount: number;
  tokens: Token[];
  timestamp: string;
}

export default function PortfolioDashboard() {
  const [portfolio, setPortfolio] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const fetchPortfolio = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get wallet address from URL or environment
      const walletAddress =
        new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '').get(
          'wallet'
        ) || process.env.NEXT_PUBLIC_WALLET_ADDRESS || 'CMVrzdso4SShQm2irrc7jMCN9Vw5QxXvrZKB79cYPPJT';

      const response = await fetch('/api/portfolio', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ walletAddress }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success && data.data) {
        setPortfolio(data.data);
        setLastRefresh(new Date());
      } else {
        throw new Error(data.error || 'Failed to fetch portfolio');
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMsg);
      console.error('Portfolio fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch on mount
  useEffect(() => {
    fetchPortfolio();
  }, []);

  // Auto-refresh every 60 seconds
  useEffect(() => {
    const interval = setInterval(fetchPortfolio, 60000);
    return () => clearInterval(interval);
  }, []);

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(2)}M`;
    }
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(2)}K`;
    }
    return `$${value.toFixed(2)}`;
  };

  const formatNumber = (value: number, decimals = 4) => {
    return value.toFixed(decimals);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white flex items-center gap-2">
              <Wallet className="w-8 h-8 text-purple-400" />
              Portfolio Analytics
            </h1>
            <p className="text-slate-400 mt-2">
              Real-time holdings on Solana with Alchemy RPC
            </p>
          </div>
          <button
            onClick={fetchPortfolio}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-600 rounded-lg text-white font-semibold transition-all transform hover:scale-105 active:scale-95"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-500/50 rounded-lg">
            <p className="text-red-400 font-semibold">⚠️ Error</p>
            <p className="text-red-300 text-sm mt-1">{error}</p>
            <p className="text-red-200/50 text-xs mt-2">
              Check that your wallet address is correct and has tokens
            </p>
          </div>
        )}

        {/* Loading State */}
        {loading && !portfolio && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-slate-700/50 rounded-lg animate-pulse" />
            ))}
          </div>
        )}

        {/* Main Stats */}
        {portfolio && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {/* Total Value Card */}
              <div className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-lg p-6 backdrop-blur-sm hover:border-purple-400/50 transition-all">
                <p className="text-slate-300 text-sm font-semibold uppercase tracking-wide">
                  Total Value
                </p>
                <h2 className="text-3xl md:text-4xl font-bold text-white mt-2">
                  {formatCurrency(portfolio.totalValueUSD)}
                </h2>
                <p className="text-slate-400 text-xs mt-3">
                  📊 {portfolio.tokenCount} assets held
                </p>
              </div>

              {/* SOL Balance Card */}
              <div className="bg-gradient-to-br from-amber-600/20 to-orange-600/20 border border-amber-500/30 rounded-lg p-6 backdrop-blur-sm hover:border-amber-400/50 transition-all">
                <p className="text-slate-300 text-sm font-semibold uppercase tracking-wide">
                  SOL Balance
                </p>
                <h2 className="text-3xl md:text-4xl font-bold text-white mt-2">
                  {formatNumber(portfolio.solBalance)}
                </h2>
                <p className="text-slate-400 text-xs mt-3">
                  ◎ {formatCurrency(portfolio.solValueUSD)}
                </p>
              </div>

              {/* Last Updated Card */}
              <div className="bg-gradient-to-br from-green-600/20 to-emerald-600/20 border border-green-500/30 rounded-lg p-6 backdrop-blur-sm hover:border-green-400/50 transition-all">
                <p className="text-slate-300 text-sm font-semibold uppercase tracking-wide">
                  Last Updated
                </p>
                <p className="text-xl font-bold text-white mt-2">
                  {lastRefresh.toLocaleTimeString()}
                </p>
                <p className="text-slate-400 text-xs mt-3">
                  🔄 Auto-refresh: 60s
                </p>
              </div>
            </div>

            {/* Holdings Grid */}
            {portfolio.tokens && portfolio.tokens.length > 0 && (
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6 backdrop-blur-sm">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-purple-400" />
                  Top Holdings
                </h3>

                <div className="space-y-3">
                  {portfolio.tokens.slice(0, 5).map((token, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-4 bg-slate-700/30 hover:bg-slate-700/50 rounded-lg transition-all border border-slate-600/30 hover:border-slate-500/50"
                    >
                      <div className="flex-1">
                        <p className="text-white font-semibold">{token.symbol}</p>
                        <p className="text-slate-400 text-sm">
                          {formatNumber(token.balance)} {token.symbol}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-white font-bold text-lg">
                          {formatCurrency(token.valueUSD)}
                        </p>
                        <p
                          className={`text-sm font-semibold ${
                            token.percentage >= 20
                              ? 'text-green-400'
                              : token.percentage >= 10
                                ? 'text-blue-400'
                                : 'text-slate-400'
                          }`}
                        >
                          {token.percentage.toFixed(1)}%
                        </p>
                      </div>

                      {/* Progress Bar */}
                      <div className="ml-4 w-24 bg-slate-600/50 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all"
                          style={{ width: `${Math.min(token.percentage * 2, 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {portfolio.tokens.length > 5 && (
                  <p className="text-slate-400 text-sm mt-4 text-center">
                    ... and {portfolio.tokens.length - 5} more tokens
                  </p>
                )}
              </div>
            )}

            {/* Portfolio Composition */}
            {portfolio.tokens && portfolio.tokens.length > 0 && (
              <div className="mt-8 bg-slate-800/50 border border-slate-700/50 rounded-lg p-6 backdrop-blur-sm">
                <h3 className="text-xl font-bold text-white mb-4">Asset Composition</h3>

                <div className="space-y-2">
                  {portfolio.tokens.slice(0, 8).map((token, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <div className="w-24">
                        <p className="text-slate-300 text-sm font-semibold">{token.symbol}</p>
                      </div>

                      <div className="flex-1">
                        <div className="w-full bg-slate-700/50 rounded-full h-3">
                          <div
                            className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all"
                            style={{ width: `${Math.min(token.percentage, 100)}%` }}
                          />
                        </div>
                      </div>

                      <div className="w-16 text-right">
                        <p className="text-white font-semibold text-sm">
                          {token.percentage.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {(!portfolio.tokens || portfolio.tokens.length === 0) && (
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-12 text-center backdrop-blur-sm">
                <Wallet className="w-12 h-12 text-slate-400 mx-auto mb-4 opacity-50" />
                <p className="text-slate-300 font-semibold">No tokens found</p>
                <p className="text-slate-400 text-sm mt-2">
                  This wallet appears to be empty or has no tradable tokens
                </p>
              </div>
            )}

            {/* Footer Info */}
            <div className="mt-8 text-center">
              <p className="text-slate-400 text-xs">
                💜 Powered by Alchemy RPC + Jupiter Price Oracle | Last Updated:{' '}
                {lastRefresh.toLocaleString()}
              </p>
              <p className="text-slate-500 text-xs mt-2">
                Data refreshes automatically every 60 seconds
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/**
 * INSTALLATION INSTRUCTIONS FOR v0.dev:
 * 
 * 1. Go to https://v0.dev
 * 2. Create new project
 * 3. In the chat, paste this prompt:
 * 
 * "Create a portfolio dashboard component with this exact functionality:
 * - Display total portfolio value in USD
 * - Show SOL balance separately
 * - Display up to 5 top holdings with balances and percentages
 * - Add progress bars for each holding
 * - Show asset composition with horizontal progress bars
 * - Auto-refresh every 60 seconds
 * - Dark theme with purple and pink gradients
 * - Responsive mobile design
 * - Error and loading states
 * - Use /api/portfolio endpoint (POST with {walletAddress})
 * - Environment variable: NEXT_PUBLIC_WALLET_ADDRESS
 * - Use Lucide React icons (Wallet, RefreshCw, TrendingUp)
 * 
 * Use this exact component code:"
 * 
 * Then paste this entire file (from 'use client' to here)
 * 
 * 4. Click "Create project"
 * 5. The component will be generated
 * 6. Deploy to Vercel
 * 
 * ALTERNATE: Just copy-paste this component directly into your Next.js app!
 */
