import React, { useState } from 'react';

interface BalanceResponse {
  success: boolean;
  walletAddress: string;
  balanceSOL: number;
  balanceLamports: number;
  network: string;
  error?: string;
}

interface PortfolioResponse {
  success: boolean;
  walletAddress: string;
  totalValueUSD: number;
  solBalance: number;
  solValueUSD: number;
  tokenCount: number;
  tokens: Array<any>;
  portfolioComposition: Array<any>;
  timestamp: string;
  error?: string;
}

interface SwapResponse {
  success: boolean;
  swap?: any;
  error?: string;
  message?: string;
  fallback?: any;
}

export default function TestDashboard() {
  const [walletAddress, setWalletAddress] = useState('');
  const [loading, setLoading] = useState(false);

  // Balance state
  const [balanceData, setBalanceData] = useState<BalanceResponse | null>(null);
  const [balanceError, setBalanceError] = useState('');

  // Portfolio state
  const [portfolioData, setPortfolioData] = useState<PortfolioResponse | null>(null);
  const [portfolioError, setPortfolioError] = useState('');

  // Swap state
  const [swapData, setSwapData] = useState<SwapResponse | null>(null);
  const [swapError, setSwapError] = useState('');
  const [swapFromToken, setSwapFromToken] = useState('sol');
  const [swapToToken, setSwapToToken] = useState('usdc');
  const [swapAmount, setSwapAmount] = useState('1');

  const handleCheckBalance = async () => {
    if (!walletAddress) {
      setBalanceError('Please enter a wallet address');
      return;
    }

    setLoading(true);
    setBalanceError('');
    setBalanceData(null);

    try {
      const response = await fetch('/api/balance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userPublicKey: walletAddress }),
      });

      const data = await response.json();
      if (data.success) {
        setBalanceData(data);
      } else {
        setBalanceError(data.error || 'Failed to fetch balance');
      }
    } catch (err) {
      setBalanceError(err instanceof Error ? err.message : 'Error');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckPortfolio = async () => {
    if (!walletAddress) {
      setPortfolioError('Please enter a wallet address');
      return;
    }

    setLoading(true);
    setPortfolioError('');
    setPortfolioData(null);

    try {
      const response = await fetch('/api/portfolio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress }),
      });

      const data = await response.json();
      if (data.success) {
        setPortfolioData(data);
      } else {
        setPortfolioError(data.error || 'Failed to fetch portfolio');
      }
    } catch (err) {
      setPortfolioError(err instanceof Error ? err.message : 'Error');
    } finally {
      setLoading(false);
    }
  };

  const handleSwap = async () => {
    if (!walletAddress) {
      setSwapError('Please enter a wallet address');
      return;
    }

    if (!swapAmount || parseFloat(swapAmount) <= 0) {
      setSwapError('Invalid amount');
      return;
    }

    setLoading(true);
    setSwapError('');
    setSwapData(null);

    try {
      const response = await fetch('/api/swap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromToken: swapFromToken,
          toToken: swapToToken,
          amount: parseFloat(swapAmount),
          userPublicKey: walletAddress,
        }),
      });

      const data = await response.json();
      setSwapData(data);

      if (!data.success) {
        setSwapError(data.error || 'Swap failed');
      }
    } catch (err) {
      setSwapError(err instanceof Error ? err.message : 'Error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(to bottom right, rgb(17, 24, 39), rgb(31, 41, 55))', color: 'white', padding: '2rem' }}>
      <div style={{ maxWidth: '90rem', margin: '0 auto' }}>
        <div style={{ marginBottom: '3rem' }}>
          <h1 style={{ fontSize: '3rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>🧪 Liza API Test Dashboard</h1>
          <p style={{ color: '#9CA3AF' }}>Test wallet balance, portfolio, and swap functionality</p>
        </div>

        {/* Wallet Address Input */}
        <div style={{ background: 'rgb(31, 41, 55)', borderRadius: '0.5rem', padding: '1.5rem', marginBottom: '2rem', border: '1px solid rgb(55, 65, 81)' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>💼 Wallet Address</h2>
          <input
            type="text"
            value={walletAddress}
            onChange={(e) => setWalletAddress(e.target.value)}
            placeholder="Enter Solana wallet address"
            style={{ width: '100%', background: 'rgb(55, 65, 81)', border: '1px solid rgb(75, 85, 99)', borderRadius: '0.375rem', padding: '0.75rem', color: 'white' }}
          />
          {walletAddress && (
            <p style={{ fontSize: '0.875rem', color: '#9CA3AF', marginTop: '0.5rem' }}>✓ Address: {walletAddress.substring(0, 20)}...</p>
          )}
        </div>

        {/* Three-column grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
          {/* Balance Check */}
          <div style={{ background: 'rgb(31, 41, 55)', borderRadius: '0.5rem', padding: '1.5rem', border: '1px solid rgb(55, 65, 81)' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>💰 Balance Check</h2>
            <p style={{ color: '#9CA3AF', fontSize: '0.875rem', marginBottom: '1rem' }}>Check your Solana wallet balance</p>

            <button
              onClick={handleCheckBalance}
              disabled={loading}
              style={{ width: '100%', background: '#2563EB', color: 'white', fontWeight: 'bold', padding: '0.5rem 1rem', borderRadius: '0.375rem', border: 'none', cursor: 'pointer', marginBottom: '1rem' }}
            >
              {loading ? 'Loading...' : 'Check Balance'}
            </button>

            {balanceError && (
              <div style={{ background: 'rgb(127, 29, 29)', border: '1px solid rgb(153, 27, 27)', borderRadius: '0.375rem', padding: '0.75rem', marginBottom: '1rem' }}>
                <p style={{ color: '#FECACA', fontSize: '0.875rem' }}>{balanceError}</p>
              </div>
            )}

            {balanceData && balanceData.success && (
              <div style={{ background: 'rgb(20, 83, 45)', border: '1px solid rgb(34, 197, 94)', borderRadius: '0.375rem', padding: '1rem' }}>
                <p style={{ color: '#86EFAC', fontWeight: 'bold', marginBottom: '0.75rem' }}>✅ Balance Retrieved</p>
                <p style={{ fontSize: '0.875rem' }}><span style={{ color: '#9CA3AF' }}>SOL:</span> <span style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>{balanceData.balanceSOL.toFixed(6)} SOL</span></p>
                <p style={{ fontSize: '0.875rem' }}><span style={{ color: '#9CA3AF' }}>Lamports:</span> <span style={{ fontFamily: 'monospace' }}>{balanceData.balanceLamports}</span></p>
              </div>
            )}
          </div>

          {/* Portfolio Check */}
          <div style={{ background: 'rgb(31, 41, 55)', borderRadius: '0.5rem', padding: '1.5rem', border: '1px solid rgb(55, 65, 81)' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>📊 Portfolio Check</h2>
            <p style={{ color: '#9CA3AF', fontSize: '0.875rem', marginBottom: '1rem' }}>View full wallet portfolio</p>

            <button
              onClick={handleCheckPortfolio}
              disabled={loading}
              style={{ width: '100%', background: '#16A34A', color: 'white', fontWeight: 'bold', padding: '0.5rem 1rem', borderRadius: '0.375rem', border: 'none', cursor: 'pointer', marginBottom: '1rem' }}
            >
              {loading ? 'Loading...' : 'Check Portfolio'}
            </button>

            {portfolioError && (
              <div style={{ background: 'rgb(127, 29, 29)', border: '1px solid rgb(153, 27, 27)', borderRadius: '0.375rem', padding: '0.75rem', marginBottom: '1rem' }}>
                <p style={{ color: '#FECACA', fontSize: '0.875rem' }}>{portfolioError}</p>
              </div>
            )}

            {portfolioData && portfolioData.success && (
              <div style={{ background: 'rgb(20, 83, 45)', border: '1px solid rgb(34, 197, 94)', borderRadius: '0.375rem', padding: '1rem' }}>
                <p style={{ color: '#86EFAC', fontWeight: 'bold', marginBottom: '0.75rem' }}>✅ Portfolio Loaded</p>
                <p style={{ fontSize: '0.875rem' }}><span style={{ color: '#9CA3AF' }}>Total Value:</span> <span style={{ fontWeight: 'bold', color: '#86EFAC' }}>${portfolioData.totalValueUSD.toFixed(2)}</span></p>
                <p style={{ fontSize: '0.875rem' }}><span style={{ color: '#9CA3AF' }}>SOL:</span> <span style={{ fontFamily: 'monospace' }}>{portfolioData.solBalance.toFixed(6)}</span></p>
                <p style={{ fontSize: '0.875rem' }}><span style={{ color: '#9CA3AF' }}>Tokens:</span> <span style={{ fontFamily: 'monospace' }}>{portfolioData.tokenCount}</span></p>
              </div>
            )}
          </div>

          {/* Swap */}
          <div style={{ background: 'rgb(31, 41, 55)', borderRadius: '0.5rem', padding: '1.5rem', border: '1px solid rgb(55, 65, 81)' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>🔄 Swap Tokens</h2>
            <p style={{ color: '#9CA3AF', fontSize: '0.875rem', marginBottom: '1rem' }}>Get swap quote via Jupiter</p>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ fontSize: '0.75rem', color: '#9CA3AF', display: 'block', marginBottom: '0.25rem' }}>From Token</label>
              <select value={swapFromToken} onChange={(e) => setSwapFromToken(e.target.value)} style={{ width: '100%', background: 'rgb(55, 65, 81)', border: '1px solid rgb(75, 85, 99)', borderRadius: '0.375rem', padding: '0.5rem', color: 'white', marginBottom: '0.5rem' }}>
                <option value="sol">SOL</option>
                <option value="usdc">USDC</option>
                <option value="usdt">USDT</option>
              </select>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ fontSize: '0.75rem', color: '#9CA3AF', display: 'block', marginBottom: '0.25rem' }}>To Token</label>
              <select value={swapToToken} onChange={(e) => setSwapToToken(e.target.value)} style={{ width: '100%', background: 'rgb(55, 65, 81)', border: '1px solid rgb(75, 85, 99)', borderRadius: '0.375rem', padding: '0.5rem', color: 'white', marginBottom: '0.5rem' }}>
                <option value="usdc">USDC</option>
                <option value="usdt">USDT</option>
                <option value="sol">SOL</option>
              </select>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ fontSize: '0.75rem', color: '#9CA3AF', display: 'block', marginBottom: '0.25rem' }}>Amount</label>
              <input type="number" value={swapAmount} onChange={(e) => setSwapAmount(e.target.value)} placeholder="0.0" style={{ width: '100%', background: 'rgb(55, 65, 81)', border: '1px solid rgb(75, 85, 99)', borderRadius: '0.375rem', padding: '0.5rem', color: 'white' }} />
            </div>

            <button
              onClick={handleSwap}
              disabled={loading}
              style={{ width: '100%', background: '#A855F7', color: 'white', fontWeight: 'bold', padding: '0.5rem 1rem', borderRadius: '0.375rem', border: 'none', cursor: 'pointer' }}
            >
              {loading ? 'Loading...' : 'Get Swap Quote'}
            </button>

            {swapError && (
              <div style={{ background: 'rgb(127, 29, 29)', border: '1px solid rgb(153, 27, 27)', borderRadius: '0.375rem', padding: '0.75rem', marginTop: '1rem' }}>
                <p style={{ color: '#FECACA', fontSize: '0.875rem' }}>{swapError}</p>
              </div>
            )}

            {swapData && (
              <div style={{ background: swapData.success ? 'rgb(88, 28, 135)' : 'rgb(120, 53, 15)', border: swapData.success ? '1px solid rgb(168, 85, 247)' : '1px solid rgb(217, 119, 6)', borderRadius: '0.375rem', padding: '1rem', marginTop: '1rem' }}>
                <p style={{ fontWeight: 'bold', fontSize: '0.875rem', marginBottom: '0.5rem', color: swapData.success ? '#E9D5FF' : '#FEF3C7' }}>{swapData.success ? '✅ Quote Received' : '⚠️ Fallback Quote'}</p>
                <p style={{ fontSize: '0.875rem' }}>Est. Output: <span style={{ fontWeight: 'bold' }}>{swapData.swap?.estimatedOutput || swapData.fallback?.estimatedOutput}</span></p>
              </div>
            )}
          </div>
        </div>

        {/* Info Section */}
        <div style={{ background: 'rgb(31, 41, 55)', borderRadius: '0.5rem', padding: '1.5rem', border: '1px solid rgb(55, 65, 81)' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '0.75rem' }}>📋 API Endpoints</h3>
          <p style={{ fontSize: '0.875rem', color: '#9CA3AF', marginBottom: '0.5rem' }}>✅ <span style={{ fontFamily: 'monospace', color: '#D1D5DB' }}>POST /api/balance</span> - Get wallet balance</p>
          <p style={{ fontSize: '0.875rem', color: '#9CA3AF', marginBottom: '0.5rem' }}>✅ <span style={{ fontFamily: 'monospace', color: '#D1D5DB' }}>POST /api/portfolio</span> - Get portfolio analysis</p>
          <p style={{ fontSize: '0.875rem', color: '#9CA3AF' }}>✅ <span style={{ fontFamily: 'monospace', color: '#D1D5DB' }}>POST /api/swap</span> - Get swap quote from Jupiter</p>
        </div>
      </div>
    </div>
  );
}
