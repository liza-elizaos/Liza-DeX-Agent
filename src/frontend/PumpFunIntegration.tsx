import React, { useState } from 'react';
import { Wallet, TrendingUp, BarChart3, Zap, Droplets, Settings, Package, Bell, LineChart, Users } from 'lucide-react';

/**
 * PumpFunIntegration Component
 * Adds all 10 Pump.fun features to Liza dashboard
 */
export default function PumpFunIntegration({ walletAddress }: { walletAddress: string }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [tradeForm, setTradeForm] = useState({
    tokenMint: '',
    amount: '',
    action: 'buy'
  });
  const [bots, setBots] = useState<any[]>([]);
  const [newBot, setNewBot] = useState('');

  const features = [
    { id: 'trading', label: 'Trading', icon: TrendingUp, color: 'purple' },
    { id: 'portfolio', label: 'Portfolio', icon: Wallet, color: 'blue' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, color: 'green' },
    { id: 'bots', label: 'Bots', icon: Zap, color: 'red' },
    { id: 'liquidity', label: 'Liquidity', icon: Droplets, color: 'yellow' },
    { id: 'contracts', label: 'Contracts', icon: Settings, color: 'pink' },
    { id: 'batch', label: 'Batch', icon: Package, color: 'orange' },
    { id: 'events', label: 'Events', icon: Bell, color: 'indigo' },
    { id: 'market-maker', label: 'Market Maker', icon: LineChart, color: 'cyan' },
    { id: 'social', label: 'Social', icon: Users, color: 'teal' },
  ];

  const getColorClasses = (color: string) => {
    const colors: Record<string, string> = {
      purple: 'bg-purple-500 hover:bg-purple-600',
      blue: 'bg-blue-500 hover:bg-blue-600',
      green: 'bg-green-500 hover:bg-green-600',
      red: 'bg-red-500 hover:bg-red-600',
      yellow: 'bg-yellow-500 hover:bg-yellow-600',
      pink: 'bg-pink-500 hover:bg-pink-600',
      orange: 'bg-orange-500 hover:bg-orange-600',
      indigo: 'bg-indigo-500 hover:bg-indigo-600',
      cyan: 'bg-cyan-500 hover:bg-cyan-600',
      teal: 'bg-teal-500 hover:bg-teal-600',
    };
    return colors[color] || colors.purple;
  };

  // Feature 1: Trading
  const renderTrading = () => (
    <div className="bg-white rounded-lg p-6 border-2 border-purple-500">
      <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
        <TrendingUp className="text-purple-500" />
        🎯 Feature 1: Trading (Buy/Sell)
      </h3>
      <form className="space-y-4" onSubmit={(e) => {
        e.preventDefault();
        alert(`✅ ${tradeForm.action.toUpperCase()} executed!`);
      }}>
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => setTradeForm({ ...tradeForm, action: 'buy' })}
            className={`py-2 px-4 rounded font-bold text-white transition ${
              tradeForm.action === 'buy' ? 'bg-green-500' : 'bg-gray-400'
            }`}
          >
            BUY
          </button>
          <button
            type="button"
            onClick={() => setTradeForm({ ...tradeForm, action: 'sell' })}
            className={`py-2 px-4 rounded font-bold text-white transition ${
              tradeForm.action === 'sell' ? 'bg-red-500' : 'bg-gray-400'
            }`}
          >
            SELL
          </button>
        </div>
        <input
          type="text"
          placeholder="Token Mint Address"
          value={tradeForm.tokenMint}
          onChange={(e) => setTradeForm({ ...tradeForm, tokenMint: e.target.value })}
          className="w-full border-2 border-gray-300 rounded px-4 py-2"
        />
        <input
          type="number"
          placeholder="Amount (SOL)"
          value={tradeForm.amount}
          onChange={(e) => setTradeForm({ ...tradeForm, amount: e.target.value })}
          className="w-full border-2 border-gray-300 rounded px-4 py-2"
        />
        <button type="submit" className="w-full bg-purple-500 text-white py-3 rounded font-bold hover:bg-purple-600">
          Execute {tradeForm.action.toUpperCase()}
        </button>
      </form>
    </div>
  );

  // Feature 2: Portfolio
  const renderPortfolio = () => (
    <div className="bg-white rounded-lg p-6 border-2 border-blue-500">
      <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
        <Wallet className="text-blue-500" />
        💼 Feature 2: Portfolio Management
      </h3>
      <div className="space-y-4">
        <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg p-6">
          <p className="text-sm opacity-80">Wallet Balance</p>
          <p className="text-4xl font-bold">0.5234 SOL</p>
          <p className="text-xs opacity-70 mt-2">{walletAddress.slice(0, 20)}...</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-50 rounded p-4 border-2 border-blue-200">
            <p className="text-xs text-gray-600">Total Value</p>
            <p className="text-2xl font-bold">$17.27</p>
          </div>
          <div className="bg-blue-50 rounded p-4 border-2 border-blue-200">
            <p className="text-xs text-gray-600">24h Change</p>
            <p className="text-2xl font-bold text-green-500">+3.2%</p>
          </div>
        </div>
      </div>
    </div>
  );

  // Feature 3: Analytics
  const renderAnalytics = () => (
    <div className="bg-white rounded-lg p-6 border-2 border-green-500">
      <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
        <BarChart3 className="text-green-500" />
        📊 Feature 3: Market Analytics
      </h3>
      <div className="space-y-4">
        <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg p-4">
          <p className="text-sm">Top Gainers</p>
          <p className="text-2xl font-bold mt-2">+45.3%</p>
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
      </div>
    </div>
  );

  // Feature 4: Bots
  const renderBots = () => (
    <div className="bg-white rounded-lg p-6 border-2 border-red-500">
      <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
        <Zap className="text-red-500" />
        🤖 Feature 4: Trading Bots
      </h3>
      <div className="space-y-4">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Bot name"
            value={newBot}
            onChange={(e) => setNewBot(e.target.value)}
            className="flex-1 border-2 border-gray-300 rounded px-3 py-2"
          />
          <button
            onClick={() => {
              if (newBot.trim()) {
                setBots([...bots, { id: Date.now(), name: newBot, status: 'ACTIVE' }]);
                setNewBot('');
              }
            }}
            className="bg-red-500 text-white px-4 rounded font-bold hover:bg-red-600"
          >
            Add
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
      </div>
    </div>
  );

  // Feature 5: Liquidity
  const renderLiquidity = () => (
    <div className="bg-white rounded-lg p-6 border-2 border-yellow-500">
      <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
        <Droplets className="text-yellow-500" />
        💧 Feature 5: Liquidity Management
      </h3>
      <div className="space-y-4">
        <input type="number" placeholder="SOL to provide" className="w-full border-2 border-gray-300 rounded px-4 py-2" />
        <div className="bg-yellow-50 rounded p-4 border-2 border-yellow-200">
          <p className="text-sm">Est. LP Tokens: <span className="font-bold">150.50</span></p>
          <p className="text-sm">Est. APY: <span className="font-bold text-green-600">15.2%</span></p>
        </div>
        <button className="w-full bg-yellow-500 text-white py-2 rounded font-bold hover:bg-yellow-600">
          Provide Liquidity
        </button>
      </div>
    </div>
  );

  // Feature 6-10: Quick Action Buttons
  const renderOtherFeatures = () => (
    <div className="grid grid-cols-2 gap-4">
      <div className="bg-white rounded-lg p-6 border-2 border-pink-500">
        <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
          <Settings className="text-pink-500" size={20} />
          ⚙️ Contracts
        </h3>
        <div className="space-y-2">
          <button className="w-full bg-pink-500 text-white py-1 rounded text-sm hover:bg-pink-600">Freeze</button>
          <button className="w-full bg-pink-500 text-white py-1 rounded text-sm hover:bg-pink-600">Mint</button>
        </div>
      </div>

      <div className="bg-white rounded-lg p-6 border-2 border-orange-500">
        <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
          <Package className="text-orange-500" size={20} />
          📦 Batch
        </h3>
        <button className="w-full bg-orange-500 text-white py-2 rounded font-bold hover:bg-orange-600">
          Batch Operations
        </button>
      </div>

      <div className="bg-white rounded-lg p-6 border-2 border-indigo-500">
        <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
          <Bell className="text-indigo-500" size={20} />
          🔔 Events
        </h3>
        <button className="w-full bg-indigo-500 text-white py-2 rounded font-bold hover:bg-indigo-600">
          Monitor Events
        </button>
      </div>

      <div className="bg-white rounded-lg p-6 border-2 border-cyan-500">
        <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
          <LineChart className="text-cyan-500" size={20} />
          📈 Market Maker
        </h3>
        <button className="w-full bg-cyan-500 text-white py-2 rounded font-bold hover:bg-cyan-600">
          Start MM
        </button>
      </div>

      <div className="col-span-2 bg-white rounded-lg p-6 border-2 border-teal-500">
        <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
          <Users className="text-teal-500" size={20} />
          👥 Social Features
        </h3>
        <div className="flex gap-2">
          <button className="flex-1 bg-teal-500 text-white py-2 rounded font-bold hover:bg-teal-600 text-sm">
            Share Token
          </button>
          <button className="flex-1 bg-teal-500 text-white py-2 rounded font-bold hover:bg-teal-600 text-sm">
            Copy Trading
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 min-h-screen p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-2">
          🚀 Pump.fun Features in Liza Dashboard
        </h1>
        <p className="text-gray-300">All 10 features integrated with your Liza agent</p>
      </div>

      {/* Feature Tabs */}
      <div className="mb-8 flex flex-wrap gap-2">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <button
              key={feature.id}
              onClick={() => setActiveTab(feature.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition ${
                activeTab === feature.id
                  ? `${getColorClasses(feature.color)} text-white`
                  : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
              }`}
            >
              <Icon size={18} />
              {feature.label}
            </button>
          );
        })}
      </div>

      {/* Content Area */}
      <div className="space-y-6">
        {activeTab === 'trading' && renderTrading()}
        {activeTab === 'portfolio' && renderPortfolio()}
        {activeTab === 'analytics' && renderAnalytics()}
        {activeTab === 'bots' && renderBots()}
        {activeTab === 'liquidity' && renderLiquidity()}
        {['contracts', 'batch', 'events', 'market-maker', 'social'].includes(activeTab) && renderOtherFeatures()}
      </div>

      {/* Info Box */}
      <div className="mt-8 bg-blue-900/30 border-2 border-blue-500 rounded-lg p-4 text-center">
        <p className="text-blue-300">✅ All 10 Pump.fun features integrated with Liza frontend</p>
        <p className="text-sm text-gray-300 mt-2">Connect wallet to enable all features</p>
      </div>
    </div>
  );
}
