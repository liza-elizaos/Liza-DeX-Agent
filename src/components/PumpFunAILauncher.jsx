import React, { useState, useEffect, useRef } from 'react';

export default function PumpFunAILauncher({ apiBase = '/api' }) {
  const [messages, setMessages] = useState([{ role: 'assistant', content: '🤖 Ek idea batao token launch karne ke liye' }]);
  const [input, setInput] = useState('');
  const [wallet, setWallet] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const ref = useRef(null);

  useEffect(() => ref.current?.scrollIntoView({ behavior: 'smooth' }), [messages]);

  const add = (role, content) => setMessages(m => [...m, { role, content }]);

  async function generate(idea) {
    setLoading(true);
    add('assistant', '🤖 Generating token...');
    try {
      const r = await fetch(`${apiBase}/generate`, { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ idea }) 
      });
      
      if (!r.ok) {
        const err = await r.json();
        throw new Error(err.error || `HTTP ${r.status}`);
      }
      
      const d = await r.json();
      if (!d.name || !d.symbol) {
        throw new Error('Invalid token response');
      }
      
      setToken(d);
      add('assistant', `✨ Generated: ${d.name} ($${d.symbol})\n\n📝 "${d.description}"\n\nType "LAUNCH" to deploy on mainnet`);
    } catch (e) {
      console.error('Generate error:', e);
      add('assistant', `❌ Error: ${e.message}\n\nTry another idea or check API configuration`);
    }
    setLoading(false);
  }

  async function launch() {
    if (!token) return add('assistant', 'Generate token first');
    if (!wallet) return add('assistant', 'Connect wallet first');
    setLoading(true);
    add('assistant', '🚀 Launching on Solana mainnet...');
    try {
      const r = await fetch(`${apiBase}/launch`, { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ 
          name: token.name, 
          symbol: token.symbol, 
          uri: `https://api.dicebear.com/7.x/bottts/svg?seed=${token.symbol}` 
        }) 
      });
      
      if (!r.ok) {
        const err = await r.json();
        throw new Error(err.error || `HTTP ${r.status}`);
      }
      
      const d = await r.json();
      add('assistant', `✅ LIVE ON MAINNET!\n\n🪙 Mint: ${d.mint}\n🔗 Link: ${d.explorerUrl}\n\n🎉 Your token is now trading on Solana!`);
      setToken(null);
    } catch (e) {
      console.error('Launch error:', e);
      add('assistant', `❌ Launch failed: ${e.message}\n\n⚠️ Make sure:\n• Wallet is connected\n• Vercel env vars are set\n• You have SOL for gas fees`);
    }
    setLoading(false);
  }

  async function connect() {
    try {
      if (!window.solana) return add('assistant', 'Install Phantom');
      const r = await window.solana.connect();
      setWallet(r.publicKey.toString());
      add('assistant', `✅ ${r.publicKey.toString().slice(0, 6)}...`);
    } catch (e) {
      add('assistant', `❌ ${e.message}`);
    }
  }

  const send = () => {
    if (!input.trim() || loading) return;
    const msg = input.trim().toLowerCase();
    add('user', input);
    setInput('');
    if (!wallet) return add('assistant', 'Connect first');
    if (msg === 'launch' && token) launch();
    else generate(input);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 to-purple-900 text-white">
      <div className="bg-black/30 sticky top-0 z-10 p-4 flex justify-between">
        <h1 className="text-xl font-bold">🚀 Launcher</h1>
        {wallet ? <div className="text-sm bg-green-500/20 px-3 py-1 rounded">✅ {wallet.slice(0, 6)}...</div> : <button onClick={connect} className="bg-green-500 px-4 py-2 rounded">Connect</button>}
      </div>
      <div className="max-w-3xl mx-auto px-4 py-6 pb-24">
        {messages.map((m, i) => (<div key={i} className={`flex mb-4 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}><div className={`px-4 py-3 rounded-lg ${m.role === 'user' ? 'bg-purple-600' : 'bg-black/30 border border-purple-500/30'}`}><pre className="whitespace-pre-wrap text-sm">{m.content}</pre></div></div>))}
        {token && <div className="text-center p-4 bg-purple-600/20 rounded-lg mb-4">{token.name} (${token.symbol})</div>}
        {loading && <div className="text-center">⏳</div>}
        <div ref={ref} />
      </div>
      <div className="fixed bottom-0 left-0 right-0 bg-black/60 p-4 border-t border-purple-500/30">
        <div className="max-w-3xl mx-auto flex gap-3">
          <input type="text" value={input} onChange={e => setInput(e.target.value)} onKeyPress={e => e.key === 'Enter' && send()} placeholder={wallet ? 'Idea...' : 'Connect'} disabled={loading || !wallet} className="flex-1 bg-white/10 border border-purple-400/50 rounded px-4 py-2 text-white disabled:opacity-50" />
          <button onClick={send} disabled={loading || !input.trim() || !wallet} className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 px-6 py-2 rounded">🚀</button>
        </div>
      </div>
    </div>
  );
}
