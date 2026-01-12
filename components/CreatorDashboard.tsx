import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';

/**
 * Creator Dashboard - View accumulated rewards and claim
 */

interface CreatorToken {
  mint: string;
  name: string;
  accumulatedFees: number;
  claimedFees: number;
}

interface CreatorData {
  wallet: string;
  totalAccumulated: number;
  totalClaimed: number;
  claimable: number;
  tokens: CreatorToken[];
}

export default function CreatorDashboard() {
  const { connected, publicKey } = useWallet();
  const [loading, setLoading] = useState(false);
  const [creatorData, setCreatorData] = useState<CreatorData | null>(null);
  const [claimAmount, setClaimAmount] = useState(0);
  const [claiming, setClaiming] = useState(false);
  const [claimStatus, setClaimStatus] = useState<{ success: boolean; message: string } | null>(null);

  // Fetch creator data on mount
  useEffect(() => {
    if (connected && publicKey) {
      fetchCreatorData();
    }
  }, [connected, publicKey]);

  const fetchCreatorData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/model/creator-rewards?wallet=${publicKey?.toBase58()}`);
      const data = await response.json();
      setCreatorData(data);
    } catch (error) {
      console.error('Failed to fetch creator data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClaim = async () => {
    if (!publicKey || !claimAmount || claimAmount > (creatorData?.claimable || 0)) {
      setClaimStatus({ success: false, message: 'Invalid claim amount' });
      return;
    }

    setClaiming(true);
    try {
      // In production, create a signed transaction using Phantom wallet
      // For now, we'll simulate the process
      
      const response = await fetch('/api/claim-rewards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creatorWallet: publicKey.toBase58(),
          amount: claimAmount,
          transaction: '', // Client would sign this
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        setClaimStatus({ 
          success: true, 
          message: `✅ Claimed ${claimAmount} SOL! Tx: ${result.txSignature?.slice(0, 8)}...` 
        });
        setClaimAmount(0);
        setTimeout(() => fetchCreatorData(), 2000);
      } else {
        setClaimStatus({ success: false, message: `❌ ${result.error}` });
      }
    } catch (error: any) {
      setClaimStatus({ success: false, message: `Error: ${error.message}` });
    } finally {
      setClaiming(false);
    }
  };

  if (!connected) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">💰 Creator Dashboard</h1>
          <p className="text-gray-400">Connect your wallet to view your rewards</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">💰 Creator Dashboard</h1>
          <p className="text-gray-400">Wallet: {publicKey?.toBase58().slice(0, 8)}...{publicKey?.toBase58().slice(-8)}</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-400">Loading your rewards...</p>
          </div>
        ) : creatorData ? (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* Total Accumulated */}
              <div className="bg-gradient-to-br from-blue-900 to-blue-800 rounded-lg p-6 border border-blue-700">
                <p className="text-sm text-blue-200 mb-2">Total Accumulated</p>
                <p className="text-4xl font-bold text-white">{creatorData.totalAccumulated.toFixed(4)}</p>
                <p className="text-xs text-blue-300 mt-2">SOL from all tokens</p>
              </div>

              {/* Total Claimed */}
              <div className="bg-gradient-to-br from-green-900 to-green-800 rounded-lg p-6 border border-green-700">
                <p className="text-sm text-green-200 mb-2">Total Claimed</p>
                <p className="text-4xl font-bold text-white">{creatorData.totalClaimed.toFixed(4)}</p>
                <p className="text-xs text-green-300 mt-2">Withdrawn to wallet</p>
              </div>

              {/* Claimable */}
              <div className="bg-gradient-to-br from-yellow-900 to-yellow-800 rounded-lg p-6 border border-yellow-700">
                <p className="text-sm text-yellow-200 mb-2">Available to Claim</p>
                <p className="text-4xl font-bold text-white">{creatorData.claimable.toFixed(4)}</p>
                <p className="text-xs text-yellow-300 mt-2">Ready for withdrawal</p>
              </div>
            </div>

            {/* Claim Section */}
            {creatorData.claimable > 0 && (
              <div className="bg-gradient-to-r from-purple-900 to-pink-900 rounded-lg p-8 border border-purple-700 mb-8">
                <h2 className="text-2xl font-bold text-white mb-6">Claim Your Rewards</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-purple-200 mb-2">Claim Amount (SOL)</label>
                    <input
                      type="number"
                      value={claimAmount}
                      onChange={(e) => setClaimAmount(Math.min(parseFloat(e.target.value) || 0, creatorData.claimable))}
                      max={creatorData.claimable}
                      step={0.0001}
                      placeholder="0.0000"
                      className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg border border-purple-600 focus:border-purple-400 focus:outline-none"
                    />
                    <div className="flex justify-between text-xs text-purple-300 mt-2">
                      <span>Available: {creatorData.claimable.toFixed(4)} SOL</span>
                      <button
                        onClick={() => setClaimAmount(creatorData.claimable)}
                        className="text-purple-300 hover:text-purple-200"
                      >
                        Max
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={handleClaim}
                    disabled={claiming || claimAmount <= 0}
                    className="w-full px-6 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white text-lg font-bold rounded-lg hover:from-green-700 hover:to-green-800 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed transition-all"
                  >
                    {claiming ? '⏳ Processing...' : `✅ Claim ${claimAmount.toFixed(4)} SOL`}
                  </button>

                  {claimStatus && (
                    <div className={`p-4 rounded-lg text-center ${
                      claimStatus.success ? 'bg-green-900 border border-green-700' : 'bg-red-900 border border-red-700'
                    }`}>
                      <p className={claimStatus.success ? 'text-green-200' : 'text-red-200'}>
                        {claimStatus.message}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Your Tokens */}
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-8">
              <h2 className="text-2xl font-bold text-white mb-6">Your Tokens</h2>
              
              {creatorData.tokens.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="border-b border-gray-700">
                      <tr>
                        <th className="pb-4 text-gray-300">Token Name</th>
                        <th className="pb-4 text-gray-300">Mint Address</th>
                        <th className="pb-4 text-right text-gray-300">Accumulated</th>
                        <th className="pb-4 text-right text-gray-300">Claimed</th>
                        <th className="pb-4 text-right text-gray-300">Claimable</th>
                      </tr>
                    </thead>
                    <tbody>
                      {creatorData.tokens.map((token, idx) => (
                        <tr key={idx} className="border-b border-gray-700 hover:bg-gray-700 transition">
                          <td className="py-4 text-white">{token.name}</td>
                          <td className="py-4 text-gray-400 font-mono text-sm">
                            {token.mint.slice(0, 8)}...{token.mint.slice(-8)}
                          </td>
                          <td className="py-4 text-right text-green-400">
                            {token.accumulatedFees.toFixed(4)} SOL
                          </td>
                          <td className="py-4 text-right text-blue-400">
                            {token.claimedFees.toFixed(4)} SOL
                          </td>
                          <td className="py-4 text-right text-yellow-400">
                            {(token.accumulatedFees - token.claimedFees).toFixed(4)} SOL
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <p>No tokens yet. Create your first token to start earning fees!</p>
                </div>
              )}
            </div>

            {/* Info Box */}
            <div className="mt-8 bg-blue-900 border border-blue-700 rounded-lg p-6">
              <p className="text-blue-200 text-sm">
                ℹ️ <strong>How it works:</strong> Each time someone trades your token on AutoFun, you earn creator fees. 
                These fees accumulate in your account and you can claim them anytime using the button above. 
                Claimed fees are sent directly to your wallet via Phantom.
              </p>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-400">No data available</p>
          </div>
        )}
      </div>
    </div>
  );
}
