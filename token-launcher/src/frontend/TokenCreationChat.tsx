import React, { useState, useRef, useEffect } from 'react';
import '../styles/token-chat.css';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  type?: 'text' | 'form' | 'result';
  data?: any;
}

interface TokenConfig {
  name: string;
  symbol: string;
  description: string;
  logo: File | null;
  logoPreview: string;
  twitter?: string;
  website?: string;
  tone: 'degen' | 'serious' | 'funny' | 'community';
}

export default function TokenCreationChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: '🚀 Welcome to LIZA Token Launcher!\n\nI help you create and launch Solana tokens on mainnet. Let\'s get started! What would you like to name your token?',
      timestamp: Date.now(),
      type: 'text',
    },
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [tokenConfig, setTokenConfig] = useState<TokenConfig>({
    name: '',
    symbol: '',
    description: '',
    logo: null,
    logoPreview: '',
    tone: 'degen',
  });

  const [step, setStep] = useState<'name' | 'symbol' | 'description' | 'logo' | 'review' | 'launched'>('name');
  const [launchStatus, setLaunchStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const addMessage = (role: 'user' | 'assistant' | 'system', content: string, type: 'text' | 'form' | 'result' = 'text', data?: any) => {
    const message: Message = {
      id: Date.now().toString(),
      role,
      content,
      timestamp: Date.now(),
      type,
      data,
    };
    setMessages(prev => [...prev, message]);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setTokenConfig(prev => ({
          ...prev,
          logo: file,
          logoPreview: reader.result as string,
        }));
        addMessage('user', `Uploaded logo: ${file.name}`, 'text');
        
        setTimeout(() => {
          addMessage('assistant', `✅ Great! I've received your logo.\n\nLet me review your token configuration:\n\n**Token: ${tokenConfig.name} (${tokenConfig.symbol})**\n\nReady to launch on mainnet?`, 'text');
          setStep('review');
        }, 500);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim()) return;

    addMessage('user', input, 'text');
    setInput('');
    setLoading(true);

    try {
      // Step 1: Name
      if (step === 'name' && input.trim()) {
        const name = input.trim();
        setTokenConfig(prev => ({ ...prev, name }));
        setStep('symbol');
        addMessage('assistant', `✅ Got it! **${name}** is a great name.\n\nNow, what should be the **symbol** (ticker)? (e.g., MEM, LIZA, etc.)`, 'text');
      }
      // Step 2: Symbol
      else if (step === 'symbol' && input.trim()) {
        const symbol = input.trim().toUpperCase();
        setTokenConfig(prev => ({ ...prev, symbol }));
        setStep('description');
        addMessage('assistant', `Perfect! **${symbol}** is your symbol.\n\nNow describe your token briefly. What's the purpose or concept? (You can make it fun!)`, 'text');
      }
      // Step 3: Description
      else if (step === 'description' && input.trim()) {
        const description = input.trim();
        setTokenConfig(prev => ({ ...prev, description }));
        setStep('logo');
        addMessage('assistant', `📝 Great description!\n\n"${description}"\n\nNow let's upload your **logo image** (PNG or JPG). This will be shown on explorers and pump.fun.`, 'form');
      }
    } catch (error) {
      addMessage('system', `❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`, 'text');
    } finally {
      setLoading(false);
    }
  };

  const handleLaunchToken = async () => {
    if (!tokenConfig.logo) {
      addMessage('system', '❌ Please upload a logo before launching', 'text');
      return;
    }

    setLaunchStatus('loading');
    addMessage('system', '🚀 Launching your token on mainnet...', 'text');

    try {
      const formData = new FormData();
      formData.append('name', tokenConfig.name);
      formData.append('symbol', tokenConfig.symbol);
      formData.append('description', tokenConfig.description);
      formData.append('logo', tokenConfig.logo);
      formData.append('tone', tokenConfig.tone);

      const response = await fetch('/api/token/create', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const result = await response.json();

      if (result.success && result.mint) {
        setLaunchStatus('success');
        setStep('launched');
        
        const explorerLink = `https://solscan.io/token/${result.mint}`;
        const pumpfunLink = `https://pump.fun/${result.mint}`;
        
        addMessage('assistant', `
✨ **SUCCESS! Your token is live on mainnet!** ✨

🎉 **Token Launched:**
- **Name:** ${tokenConfig.name}
- **Symbol:** ${tokenConfig.symbol}
- **Mint Address:** ${result.mint}
- **Network:** Solana Mainnet

📊 **View Your Token:**
- [View on Solscan](${explorerLink})
- [View on Pump.fun](${pumpfunLink})

🚀 **Next Steps:**
1. Share your token address with the community
2. Create liquidity on Raydium or Jupiter
3. Promote your token on social media

Thank you for using LIZA! 🎊
        `, 'result', result);
      } else {
        throw new Error(result.error || 'Token launch failed');
      }
    } catch (error) {
      setLaunchStatus('error');
      addMessage('system', `❌ Launch error: ${error instanceof Error ? error.message : 'Unknown error'}`, 'text');
    }
  };

  const handleReset = () => {
    setMessages([{
      id: '1',
      role: 'assistant',
      content: '🚀 Welcome to LIZA Token Launcher!\n\nI help you create and launch Solana tokens on mainnet. Let\'s get started! What would you like to name your token?',
      timestamp: Date.now(),
      type: 'text',
    }]);
    setTokenConfig({
      name: '',
      symbol: '',
      description: '',
      logo: null,
      logoPreview: '',
      tone: 'degen',
    });
    setStep('name');
    setLaunchStatus('idle');
  };

  return (
    <div className="token-chat-container">
      <div className="chat-header">
        <h1>🚀 LIZA Token Launcher</h1>
        <p>Create and launch Solana tokens in minutes</p>
      </div>

      <div className="chat-messages">
        {messages.map((msg) => (
          <div key={msg.id} className={`message message-${msg.role}`}>
            <div className="message-content">
              {msg.role === 'assistant' && <span className="avatar">🤖</span>}
              {msg.role === 'user' && <span className="avatar">👤</span>}
              {msg.role === 'system' && <span className="avatar">⚙️</span>}
              
              <div className="message-text">
                {msg.type === 'result' ? (
                  <div className="result-box">
                    {msg.content}
                  </div>
                ) : (
                  <p>{msg.content}</p>
                )}
              </div>
            </div>
          </div>
        ))}

        {step === 'logo' && (
          <div className="message message-form">
            <div className="form-section">
              <label className="file-upload-label">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  style={{ display: 'none' }}
                />
                📸 Click to upload logo
              </label>
              {tokenConfig.logoPreview && (
                <div className="logo-preview">
                  <img src={tokenConfig.logoPreview} alt="Logo preview" />
                  <p>Logo ready!</p>
                </div>
              )}
            </div>
          </div>
        )}

        {step === 'review' && (
          <div className="message message-form">
            <div className="review-box">
              <h3>📋 Review Your Token</h3>
              <div className="review-item">
                <strong>Name:</strong> {tokenConfig.name}
              </div>
              <div className="review-item">
                <strong>Symbol:</strong> {tokenConfig.symbol}
              </div>
              <div className="review-item">
                <strong>Description:</strong> {tokenConfig.description}
              </div>
              {tokenConfig.logoPreview && (
                <div className="review-item">
                  <strong>Logo:</strong> ✅ Uploaded
                </div>
              )}
              
              <div className="button-group">
                <button
                  onClick={handleLaunchToken}
                  disabled={launchStatus === 'loading'}
                  className="btn-launch"
                >
                  {launchStatus === 'loading' ? '🚀 Launching...' : '🚀 Launch Token Now'}
                </button>
                <button
                  onClick={handleReset}
                  className="btn-reset"
                >
                  ↻ Start Over
                </button>
              </div>
            </div>
          </div>
        )}

        {step === 'launched' && launchStatus === 'success' && (
          <div className="message message-success">
            <button
              onClick={handleReset}
              className="btn-reset"
            >
              🎉 Create Another Token
            </button>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {step !== 'review' && step !== 'launched' && (
        <form onSubmit={handleSendMessage} className="chat-input-form">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              step === 'name' ? 'Enter token name (e.g., mem, LIZA)...' :
              step === 'symbol' ? 'Enter symbol (e.g., MEM, LIZA)...' :
              step === 'description' ? 'Describe your token...' :
              'Type your message...'
            }
            disabled={loading}
            className="chat-input"
          />
          <button
            type="submit"
            disabled={loading}
            className="send-button"
          >
            {loading ? '⏳' : '→'}
          </button>
        </form>
      )}
    </div>
  );
}
