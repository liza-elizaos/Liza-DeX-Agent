import React, { useState } from 'react';
import { usePump } from '../context/PumpContext';
import { ArrowUpRight, ArrowDownLeft, Loader } from 'lucide-react';

export const TradeFeature = () => {
  const { wallet, connection } = usePump();
  const [formData, setFormData] = useState({
    tokenMint: '',
    amount: '',
    slippage: '1',
    action: 'buy'
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleTrade = async (e) => {
    e.preventDefault();
    if (!wallet.publicKey) {
      alert('Connect wallet first!');
      return;
    }

    setLoading(true);
    try {
      // Simulate trade
      const tx = {
        signature: Math.random().toString(36).substring(7),
        action: formData.action,
        amount: formData.amount,
        timestamp: new Date().toLocaleTimeString()
      };
      
      setResult(tx);
      alert(`✅ ${formData.action.toUpperCase()} executed!\nTx: ${tx.signature}`);
      setFormData({ tokenMint: '', amount: '', slippage: '1', action: 'buy' });
    } catch (error) {
      alert('❌ Trade failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-purple-500">
      <div className="flex items-center gap-2 mb-4">
        {formData.action === 'buy' ? <ArrowUpRight className="text-green-500" /> : <ArrowDownLeft className="text-red-500" />}
        <h2 className="text-2xl font-bold">🎯 Feature 1: Token Trading</h2>
      </div>

      <form onSubmit={handleTrade} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => setFormData({ ...formData, action: 'buy' })}
            className={`py-2 px-4 rounded font-bold ${formData.action === 'buy' ? 'bg-green-500 text-white' : 'bg-gray-200'}`}
          >
            BUY
          </button>
          <button
            type="button"
            onClick={() => setFormData({ ...formData, action: 'sell' })}
            className={`py-2 px-4 rounded font-bold ${formData.action === 'sell' ? 'bg-red-500 text-white' : 'bg-gray-200'}`}
          >
            SELL
          </button>
        </div>

        <input
          type="text"
          placeholder="Token Mint Address"
          value={formData.tokenMint}
          onChange={(e) => setFormData({ ...formData, tokenMint: e.target.value })}
          className="w-full border-2 border-gray-300 rounded px-4 py-2 focus:outline-none focus:border-purple-500"
        />

        <input
          type="number"
          placeholder="Amount (SOL)"
          value={formData.amount}
          onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
          className="w-full border-2 border-gray-300 rounded px-4 py-2 focus:outline-none focus:border-purple-500"
        />

        <input
          type="number"
          placeholder="Slippage %"
          value={formData.slippage}
          onChange={(e) => setFormData({ ...formData, slippage: e.target.value })}
          className="w-full border-2 border-gray-300 rounded px-4 py-2 focus:outline-none focus:border-purple-500"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-purple-500 text-white py-3 rounded font-bold hover:bg-purple-600 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading && <Loader className="animate-spin" size={20} />}
          {loading ? 'Processing...' : `Execute ${formData.action.toUpperCase()}`}
        </button>
      </form>

      {result && (
        <div className="mt-4 bg-green-50 border-2 border-green-500 rounded p-4">
          <p className="text-sm">✅ Trade executed successfully</p>
          <p className="text-xs text-gray-600 mt-1">Tx: {result.signature}</p>
        </div>
      )}
    </div>
  );
};

export const PortfolioFeature = () => {
  const { walletBalance, wallet } = usePump();

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-blue-500">
      <h2 className="text-2xl font-bold mb-4">💼 Feature 2: Portfolio Management</h2>

      {wallet.publicKey ? (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg p-6">
            <p className="text-sm opacity-80">Wallet Balance</p>
            <p className="text-4xl font-bold">{walletBalance.toFixed(4)} SOL</p>
            <p className="text-xs opacity-70 mt-2">{wallet.publicKey.toString().slice(0, 10)}...</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded p-4 border-2 border-gray-200">
              <p className="text-xs text-gray-600">Total Value</p>
              <p className="text-2xl font-bold">${(walletBalance * 33).toFixed(2)}</p>
            </div>
            <div className="bg-gray-50 rounded p-4 border-2 border-gray-200">
              <p className="text-xs text-gray-600">24h Change</p>
              <p className="text-2xl font-bold text-green-500">+2.5%</p>
            </div>
          </div>

          <div className="bg-yellow-50 border-2 border-yellow-300 rounded p-4">
            <p className="text-sm font-bold">📊 Holdings: 3 tokens</p>
            <p className="text-xs text-gray-600 mt-2">Tracking enabled - Real-time updates</p>
          </div>
        </div>
      ) : (
        <p className="text-center text-gray-500 py-8">Connect wallet to view portfolio</p>
      )}
    </div>
  );
};

export const AnalyticsFeature = () => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-green-500">
      <h2 className="text-2xl font-bold mb-4">📊 Feature 3: Market Analytics</h2>

      <div className="space-y-4">
        <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg p-4">
          <p className="text-sm">Top Gainers</p>
          <p className="text-2xl font-bold mt-2">+45.3%</p>
          <p className="text-xs opacity-80 mt-1">Last 24h</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded p-4 border-2 border-gray-200">
            <p className="text-xs text-gray-600">24h Volume</p>
            <p className="text-xl font-bold">$2.5M</p>
          </div>
          <div className="bg-gray-50 rounded p-4 border-2 border-gray-200">
            <p className="text-xs text-gray-600">Market Cap</p>
            <p className="text-xl font-bold">$125M</p>
          </div>
        </div>

        <div className="bg-blue-50 border-2 border-blue-300 rounded p-4">
          <p className="text-sm font-bold">📈 Analytics Data:</p>
          <ul className="text-xs text-gray-700 mt-2 space-y-1">
            <li>✓ Candlestick charts</li>
            <li>✓ Trading volume</li>
            <li>✓ Holder distribution</li>
            <li>✓ Price trends</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export const BotFeature = () => {
  const [bots, setBots] = useState([]);
  const [newBot, setNewBot] = useState({
    name: '',
    buySignal: '0.5',
    sellSignal: '2.5',
    enabled: false
  });

  const addBot = () => {
    if (newBot.name.trim()) {
      setBots([...bots, { ...newBot, id: Date.now(), status: 'ACTIVE' }]);
      setNewBot({ name: '', buySignal: '0.5', sellSignal: '2.5', enabled: false });
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-red-500">
      <h2 className="text-2xl font-bold mb-4">🤖 Feature 4: Trading Bots</h2>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Bot name"
            value={newBot.name}
            onChange={(e) => setNewBot({ ...newBot, name: e.target.value })}
            className="border-2 border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-red-500"
          />
          <button
            onClick={addBot}
            className="bg-red-500 text-white rounded font-bold hover:bg-red-600"
          >
            Create Bot
          </button>
        </div>

        {bots.length > 0 && (
          <div className="space-y-2">
            {bots.map((bot) => (
              <div key={bot.id} className="bg-red-50 rounded p-3 border-2 border-red-200">
                <p className="font-bold">{bot.name}</p>
                <p className="text-xs text-gray-600">Status: <span className="text-green-600">●</span> {bot.status}</p>
              </div>
            ))}
          </div>
        )}

        {bots.length === 0 && (
          <p className="text-center text-gray-500 py-6">No bots created yet</p>
        )}
      </div>
    </div>
  );
};

export const LiquidityFeature = () => {
  const [liquidity, setLiquidity] = useState({
    solAmount: '',
    lpTokens: 0
  });

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-yellow-500">
      <h2 className="text-2xl font-bold mb-4">💧 Feature 5: Liquidity Management</h2>

      <div className="space-y-4">
        <input
          type="number"
          placeholder="SOL to provide"
          value={liquidity.solAmount}
          onChange={(e) => setLiquidity({ ...liquidity, solAmount: e.target.value })}
          className="w-full border-2 border-gray-300 rounded px-4 py-2 focus:outline-none focus:border-yellow-500"
        />

        <div className="bg-yellow-50 rounded p-4 border-2 border-yellow-200">
          <p className="text-sm">Est. LP Tokens: <span className="font-bold">{(liquidity.solAmount * 100).toFixed(2)}</span></p>
          <p className="text-sm">Est. APY: <span className="font-bold text-green-600">15.2%</span></p>
        </div>

        <button className="w-full bg-yellow-500 text-white py-3 rounded font-bold hover:bg-yellow-600">
          Provide Liquidity
        </button>
      </div>
    </div>
  );
};

export const SmartContractFeature = () => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-pink-500">
      <h2 className="text-2xl font-bold mb-4">⚙️ Feature 6: Smart Contract Control</h2>

      <div className="space-y-3">
        <button className="w-full bg-pink-500 text-white py-2 rounded font-bold hover:bg-pink-600 text-sm">
          Freeze Accounts
        </button>
        <button className="w-full bg-pink-500 text-white py-2 rounded font-bold hover:bg-pink-600 text-sm">
          Mint Control
        </button>
        <button className="w-full bg-pink-500 text-white py-2 rounded font-bold hover:bg-pink-600 text-sm">
          Update Metadata
        </button>
        <button className="w-full bg-pink-500 text-white py-2 rounded font-bold hover:bg-pink-600 text-sm">
          Set Authority
        </button>
      </div>
    </div>
  );
};

export const BatchFeature = () => {
  const [batch, setBatch] = useState([]);
  const [batchToken, setBatchToken] = useState('');

  const addToBatch = () => {
    if (batchToken.trim()) {
      setBatch([...batch, batchToken]);
      setBatchToken('');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-orange-500">
      <h2 className="text-2xl font-bold mb-4">📦 Feature 7: Batch Operations</h2>

      <div className="space-y-4">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Add token mint"
            value={batchToken}
            onChange={(e) => setBatchToken(e.target.value)}
            className="flex-1 border-2 border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-orange-500"
          />
          <button
            onClick={addToBatch}
            className="bg-orange-500 text-white px-4 rounded font-bold hover:bg-orange-600"
          >
            Add
          </button>
        </div>

        {batch.length > 0 && (
          <div>
            <p className="text-sm font-bold mb-2">Batch ({batch.length} items):</p>
            <div className="bg-orange-50 rounded p-3 max-h-40 overflow-y-auto">
              {batch.map((token, i) => (
                <p key={i} className="text-xs text-gray-700 py-1 border-b last:border-b-0">
                  {i + 1}. {token.slice(0, 15)}...
                </p>
              ))}
            </div>
          </div>
        )}

        <button className="w-full bg-orange-500 text-white py-2 rounded font-bold hover:bg-orange-600">
          Execute Batch ({batch.length})
        </button>
      </div>
    </div>
  );
};

export const EventsFeature = () => {
  const [events, setEvents] = useState([
    { id: 1, type: 'NewToken', data: 'Token ABC created', time: 'Just now' },
    { id: 2, type: 'Trade', data: '5 SOL bought', time: '2m ago' }
  ]);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-indigo-500">
      <h2 className="text-2xl font-bold mb-4">🔔 Feature 8: Event Monitoring</h2>

      <div className="space-y-2 max-h-60 overflow-y-auto">
        {events.map((event) => (
          <div key={event.id} className="bg-indigo-50 rounded p-3 border-l-4 border-indigo-500">
            <p className="text-sm font-bold">{event.type}</p>
            <p className="text-xs text-gray-700">{event.data}</p>
            <p className="text-xs text-gray-500 mt-1">{event.time}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 text-center">
        <label className="flex items-center justify-center gap-2">
          <input type="checkbox" defaultChecked className="rounded" />
          <span className="text-sm">Real-time monitoring enabled</span>
        </label>
      </div>
    </div>
  );
};

export const MarketMakerFeature = () => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-cyan-500">
      <h2 className="text-2xl font-bold mb-4">📈 Feature 9: Market Making</h2>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-cyan-50 rounded p-4 border-2 border-cyan-200">
            <p className="text-xs text-gray-600">Bid-Ask Spread</p>
            <p className="text-2xl font-bold">0.5%</p>
          </div>
          <div className="bg-cyan-50 rounded p-4 border-2 border-cyan-200">
            <p className="text-xs text-gray-600">Min Volume</p>
            <p className="text-2xl font-bold">100 SOL</p>
          </div>
        </div>

        <div className="bg-cyan-50 rounded p-4 border-2 border-cyan-200">
          <p className="text-sm font-bold">Strategy: Auto Rebalance</p>
          <p className="text-xs text-gray-700 mt-2">✓ Hedging enabled</p>
          <p className="text-xs text-gray-700">✓ Volume maintenance active</p>
        </div>

        <button className="w-full bg-cyan-500 text-white py-2 rounded font-bold hover:bg-cyan-600">
          Start Market Making
        </button>
      </div>
    </div>
  );
};

export const SocialFeature = () => {
  const [shared, setShared] = useState(false);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-teal-500">
      <h2 className="text-2xl font-bold mb-4">👥 Feature 10: Social Features</h2>

      <div className="space-y-3">
        <button 
          onClick={() => setShared(true)}
          className="w-full bg-teal-500 text-white py-2 rounded font-bold hover:bg-teal-600 text-sm"
        >
          Share Token on Twitter
        </button>
        <button className="w-full bg-teal-500 text-white py-2 rounded font-bold hover:bg-teal-600 text-sm">
          Join Community Pool
        </button>
        <button className="w-full bg-teal-500 text-white py-2 rounded font-bold hover:bg-teal-600 text-sm">
          Copy Trading
        </button>
        <button className="w-full bg-teal-500 text-white py-2 rounded font-bold hover:bg-teal-600 text-sm">
          View Leaderboard
        </button>
      </div>

      {shared && (
        <div className="mt-4 bg-green-50 border-2 border-green-500 rounded p-3">
          <p className="text-sm font-bold text-green-700">✅ Shared on Twitter!</p>
        </div>
      )}
    </div>
  );
};
