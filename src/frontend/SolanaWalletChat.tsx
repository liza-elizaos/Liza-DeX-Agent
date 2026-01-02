import React, { useState, useRef, useEffect } from 'react';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface Feature {
  name: string;
  command: string;
  description: string;
  category: string;
  emoji: string;
}

// Extend Window interface for Phantom wallet
declare global {
  interface Window {
    solana?: {
      connect: () => Promise<{ publicKey: { toString: () => string } }>;
      disconnect: () => Promise<void>;
      signMessage: (message: Uint8Array) => Promise<{ signature: Uint8Array }>;
      signTransaction: (tx: any) => Promise<any>;
    };
  }
}

const FEATURES: Feature[] = [
  // Token Operations
  { name: 'Check Balance', command: 'GET_BALANCE', description: 'Check your SOL wallet balance', category: 'Token Operations', emoji: '💰' },
  { name: 'Transfer SOL', command: 'TRANSFER_SOL', description: 'Send SOL to another wallet', category: 'Token Operations', emoji: '🔄' },
  { name: 'Create Token', command: 'TOKEN_CREATION', description: 'Deploy new SPL tokens', category: 'Token Operations', emoji: '🪙' },
  { name: 'Portfolio Analytics', command: 'PORTFOLIO_ANALYSIS', description: 'View complete portfolio & holdings', category: 'Token Operations', emoji: '📊' },
  
  // Trading Operations
  { name: 'Token Swap', command: 'TOKEN_SWAP', description: 'Swap tokens via Jupiter aggregator', category: 'Trading Operations', emoji: '🔀' },
  { name: 'Price Monitor', command: 'PRICE_MONITOR', description: 'Real-time token price feeds', category: 'Trading Operations', emoji: '💹' },
  { name: 'Order Management', command: 'ORDER_MANAGEMENT', description: 'Limit, stop-loss, take-profit orders', category: 'Trading Operations', emoji: '📈' },
  { name: 'Automated Trading', command: 'AUTOMATED_TRADING', description: 'DCA, Grid, Momentum, Arbitrage bots', category: 'Trading Operations', emoji: '🤖' },
  
  // DeFi Integration
  { name: 'Liquidity Analysis', command: 'LIQUIDITY_ANALYSIS', description: 'Analyze pool liquidity & slippage', category: 'DeFi Integration', emoji: '💧' },
  { name: 'Yield Optimization', command: 'YIELD_OPTIMIZATION', description: 'Find best yield farming opportunities', category: 'DeFi Integration', emoji: '🌾' },
  { name: 'Market Making', command: 'MARKET_MAKING', description: 'Automated liquidity provision', category: 'DeFi Integration', emoji: '📈' },
  
  // Trust & Security
  { name: 'Trust Score', command: 'TRUST_SCORE', description: 'Token safety & trust rating', category: 'Trust & Security', emoji: '🛡️' },
  { name: 'Risk Assessment', command: 'RISK_ASSESSMENT', description: 'Real-time risk evaluation', category: 'Trust & Security', emoji: '⚠️' },
  { name: 'Performance Tracking', command: 'PERFORMANCE_TRACKING', description: 'Trading history & P&L analysis', category: 'Trust & Security', emoji: '📊' },
  { name: 'Simulation Mode', command: 'SIMULATION_MODE', description: 'Paper trading without real funds', category: 'Trust & Security', emoji: '🧪' },
];

export function SolanaWalletChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [walletPublicKey, setWalletPublicKey] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showFeatures, setShowFeatures] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Connect to Phantom wallet
  const connectWallet = async () => {
    if (!window.solana) {
      alert('Please install Phantom wallet');
      return;
    }

    try {
      const resp = await window.solana.connect();
      const publicKey = resp.publicKey.toString();
      setWalletPublicKey(publicKey);
      sessionStorage.setItem('walletPublicKey', publicKey);
      
      // Add welcome message
      setMessages([{
        role: 'assistant',
        content: `✅ Wallet connected!\n\nAddress: ${publicKey.slice(0, 8)}...${publicKey.slice(-8)}\n\nYou can now use all Solana features. Try asking me to check your balance!`,
        timestamp: new Date(),
      }]);
      setShowFeatures(true);
    } catch (error) {
      console.error('Wallet connection failed:', error);
      alert('Failed to connect wallet');
    }
  };

  // Disconnect wallet
  const disconnectWallet = async () => {
    if (window.solana?.disconnect) {
      try {
        await window.solana.disconnect();
      } catch (error) {
        console.error('Disconnect error:', error);
      }
    }
    setWalletPublicKey(null);
    setMessages([]);
    setShowFeatures(true);
  };

  // Send message to ElizaOS agent
  const sendMessage = async (e: React.FormEvent, commandOverride?: string) => {
    e.preventDefault();
    
    const messageText = commandOverride || input;
    if (!messageText.trim()) return;

    // Add user message to chat
    const userMessage: ChatMessage = { role: 'user', content: messageText, timestamp: new Date() };
    setMessages((prev) => [...prev, userMessage]);
    if (!commandOverride) setInput('');
    setIsLoading(true);
    setShowFeatures(false);

    try {
      // Send to ElizaOS API with walletPublicKey in context
      // Use relative path for production, localhost for development
      const apiUrl = window.location.hostname === 'localhost' 
        ? 'http://localhost:3000/api/chat'
        : '/api/chat';
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: walletPublicKey || 'guest-session',
          walletPublicKey: walletPublicKey || undefined,
          message: messageText,
        }),
      });

      const data = await response.json();
      
      // Add assistant response
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: data.text || data.response || 'No response',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages((prev) => [
        ...prev,
        { 
          role: 'assistant', 
          content: '❌ Error: Failed to get response. Make sure the server is running on port 3000.',
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFeatureClick = (feature: Feature) => {
    const form = { preventDefault: () => {} } as React.FormEvent;
    sendMessage(form, `Check ${feature.command}`);
  };

  // Get unique categories
  const categories = Array.from(new Set(FEATURES.map(f => f.category)));
  const filteredFeatures = selectedCategory 
    ? FEATURES.filter(f => f.category === selectedCategory)
    : FEATURES;

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 shadow-2xl">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">🚀 LIZA - Solana AI Assistant</h1>
            <p className="text-sm text-purple-100 mt-1">Powered by ElizaOS & Solana Web3</p>
          </div>
          {walletPublicKey && (
            <button
              onClick={disconnectWallet}
              className="px-4 py-2 bg-red-500 text-white rounded font-semibold hover:bg-red-600 transition"
            >
              Disconnect
            </button>
          )}
        </div>
        
        {/* Wallet Connection Status */}
        <div className="mt-3">
          {walletPublicKey ? (
            <div className="bg-green-500 bg-opacity-20 border border-green-400 rounded p-2">
              <p className="text-sm font-semibold">✅ Connected Wallet</p>
              <p className="text-xs text-gray-200">{walletPublicKey.slice(0, 12)}...{walletPublicKey.slice(-12)}</p>
            </div>
          ) : (
            <button
              onClick={connectWallet}
              className="w-full px-4 py-3 bg-white text-purple-600 rounded font-bold hover:bg-gray-100 transition text-lg"
            >
              🔗 Connect Phantom Wallet
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Features */}
        {walletPublicKey && showFeatures && (
          <div className="w-72 bg-slate-800 text-white overflow-y-auto border-r border-slate-700 p-4">
            <h2 className="text-lg font-bold mb-4">📋 Available Features</h2>
            
            {/* Category Filter */}
            <div className="mb-4">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`block w-full text-left px-3 py-2 rounded mb-2 transition ${
                  selectedCategory === null 
                    ? 'bg-purple-600 font-bold' 
                    : 'hover:bg-slate-700 text-gray-300'
                }`}
              >
                All Features
              </button>
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`block w-full text-left px-3 py-2 rounded mb-2 transition ${
                    selectedCategory === cat 
                      ? 'bg-purple-600 font-bold' 
                      : 'hover:bg-slate-700 text-gray-300'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <hr className="border-slate-600 my-4" />

            {/* Features List */}
            <div className="space-y-2">
              {filteredFeatures.map((feature) => (
                <button
                  key={feature.command}
                  onClick={() => handleFeatureClick(feature)}
                  disabled={isLoading}
                  className="block w-full text-left p-3 bg-slate-700 hover:bg-slate-600 rounded transition disabled:opacity-50 border border-slate-600 hover:border-purple-500"
                >
                  <div className="font-semibold text-sm">{feature.emoji} {feature.name}</div>
                  <div className="text-xs text-gray-400 mt-1">{feature.description}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.length === 0 && !walletPublicKey && (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="text-6xl mb-4">🌐</div>
                  <p className="text-xl text-gray-300 mb-4">Welcome to LIZA</p>
                  <p className="text-gray-400">Connect your Phantom wallet to get started</p>
                </div>
              </div>
            )}
            
            {messages.length === 0 && walletPublicKey && (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="text-5xl mb-4">💎</div>
                  <p className="text-lg text-gray-300">Ready to explore Solana</p>
                  <p className="text-gray-400 mt-2">Select a feature or type a command</p>
                </div>
              </div>
            )}

            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
              >
                <div
                  className={`max-w-2xl rounded-lg p-4 shadow-lg ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white rounded-br-none'
                      : 'bg-slate-700 text-gray-100 rounded-bl-none border border-slate-600'
                  }`}
                >
                  <div className="text-sm whitespace-pre-wrap break-words">{msg.content}</div>
                  <div className={`text-xs mt-2 ${msg.role === 'user' ? 'text-blue-200' : 'text-gray-400'}`}>
                    {msg.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-slate-700 text-gray-100 px-4 py-3 rounded-lg rounded-bl-none border border-slate-600 animate-pulse">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-100"></div>
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-200"></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions */}
          {walletPublicKey && (
            <div className="bg-slate-800 p-3 border-t border-slate-700">
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => {
                    const form = { preventDefault: () => {} } as React.FormEvent;
                    sendMessage(form, 'check my balance');
                  }}
                  disabled={isLoading}
                  className="px-3 py-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded transition disabled:opacity-50"
                >
                  💰 Balance
                </button>
                <button
                  onClick={() => {
                    const form = { preventDefault: () => {} } as React.FormEvent;
                    sendMessage(form, 'swap 0.1 SOL for USDC');
                  }}
                  disabled={isLoading}
                  className="px-3 py-1.5 text-xs bg-green-600 hover:bg-green-700 text-white rounded transition disabled:opacity-50"
                >
                  🔀 Swap SOL→USDC
                </button>
                <button
                  onClick={() => {
                    const form = { preventDefault: () => {} } as React.FormEvent;
                    sendMessage(form, 'swap 0.1 SOL for USDT');
                  }}
                  disabled={isLoading}
                  className="px-3 py-1.5 text-xs bg-green-600 hover:bg-green-700 text-white rounded transition disabled:opacity-50"
                >
                  🔀 Swap SOL→USDT
                </button>
                <button
                  onClick={() => {
                    const form = { preventDefault: () => {} } as React.FormEvent;
                    sendMessage(form, 'help');
                  }}
                  disabled={isLoading}
                  className="px-3 py-1.5 text-xs bg-purple-600 hover:bg-purple-700 text-white rounded transition disabled:opacity-50"
                >
                  ❓ Help
                </button>
              </div>
            </div>
          )}

          {/* Input */}
          <form onSubmit={sendMessage} className="bg-slate-800 p-4 border-t border-slate-700">
            <div className="flex gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={walletPublicKey ? "Try: swap 1 SOL for USDC, check balance..." : "Connect wallet first..."}
                disabled={isLoading || !walletPublicKey}
                className="flex-1 px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={isLoading || !walletPublicKey}
                className="px-8 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition font-semibold flex items-center gap-2"
              >
                {isLoading ? '⏳' : '📤'} Send
              </button>
              <button
                type="button"
                onClick={() => setShowFeatures(!showFeatures)}
                disabled={!walletPublicKey}
                className="px-6 py-3 bg-slate-700 text-white rounded-lg hover:bg-slate-600 disabled:opacity-50 transition border border-slate-600"
              >
                {showFeatures ? '✕' : '☰'}
              </button>
            </div>
            {walletPublicKey && (
              <p className="text-xs text-gray-400 mt-2">
                💡 Quick commands: "swap 1 SOL for USDC", "check balance", "buy 100 BONK from SOL"
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}

export default SolanaWalletChat;
