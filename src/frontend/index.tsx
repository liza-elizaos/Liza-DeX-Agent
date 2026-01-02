import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createRoot } from 'react-dom/client';
import './index.css';
import React, { useState, useRef, useEffect } from 'react';
import type { UUID } from '@elizaos/core';

const queryClient = new QueryClient();

interface ElizaConfig {
  agentId: string;
  apiBase: string;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

declare global {
  interface Window {
    ELIZA_CONFIG?: ElizaConfig;
  }
}

/**
 * Simple Chat Component WITHOUT wallet complexity
 */
function ChatComponent({ agentId }: { agentId: UUID }) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: `Hello! I'm LIZA, your autonomous agent assistant. Type a message to start chatting!`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleConnectWallet = async () => {
    try {
      const anyWindow = window as any;
      
      if (!anyWindow.phantom?.solana) {
        const installUrl = 'https://phantom.app/download';
        alert('Phantom wallet not installed!\n\nClick OK to install from: phantom.app');
        window.open(installUrl, '_blank');
        return;
      }

      console.log('[WALLET] Connecting to Phantom...');
      const response = await anyWindow.phantom.solana.connect();
      const address = response.publicKey.toString();
      console.log('[WALLET] Connected:', address);
      
      setWalletAddress(address);
      
      // Show connection message
      const connectMsg: Message = {
        id: `msg_${Date.now()}`,
        role: 'assistant',
        content: `Wallet connected: ${address.slice(0, 8)}...${address.slice(-8)}\n\nFetching your balance...`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, connectMsg]);
      
      // Small delay then auto-send balance check
      setTimeout(async () => {
        console.log('[WALLET] Auto-sending balance check...');
        
        const userMsg: Message = {
          id: `msg_${Date.now()}`,
          role: 'user',
          content: `check my balance ${address}`,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, userMsg]);
        setIsLoading(true);

        try {
          // Use relative path for production, localhost for development
          const apiUrl = window.location.hostname === 'localhost' 
            ? 'http://localhost:3000/api/chat'
            : '/api/chat';
          console.log('[WALLET] Calling API:', apiUrl, 'with message:', `check my balance ${address}`);
          
          const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              sessionId,
              message: `check my balance ${address}`,
              context: 'trading',
              walletPublicKey: address,
              config: null,
            }),
          });

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
          }

          const data = await response.json();
          console.log('[WALLET] API Response:', data);

          const assistantMsg: Message = {
            id: `msg_${Date.now()}_assistant`,
            role: 'assistant',
            content: data.response || 'No response received',
            timestamp: new Date(),
          };

          setMessages((prev) => [...prev, assistantMsg]);
        } catch (error) {
          console.error('[WALLET] Error:', error);
          const errorMsg: Message = {
            id: `msg_${Date.now()}_error`,
            role: 'assistant',
            content: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, errorMsg]);
        } finally {
          setIsLoading(false);
        }
      }, 800); // Increased delay to 800ms for better timing
      
    } catch (error) {
      console.error('[WALLET] Connection error:', error);
      alert('Connection failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: input,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      let messageToSend = input;
      
      // Auto-append wallet if available and asking about balance/swap
      if (walletAddress && (input.toLowerCase().includes('balance') || input.toLowerCase().includes('wallet') || input.toLowerCase().includes('swap')) && !input.includes(walletAddress)) {
        messageToSend = `${input} ${walletAddress}`;
      }

      // Use relative path for production, localhost for development
      const apiUrl = window.location.hostname === 'localhost' 
        ? 'http://localhost:3000/api/chat'
        : '/api/chat';

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          message: messageToSend,
          context: 'trading',
          walletPublicKey: walletAddress || undefined,
          config: null,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      const assistantMessage: Message = {
        id: `msg_${Date.now()}_assistant`,
        role: 'assistant',
        content: data.response || 'No response received',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage: Message = {
        id: `msg_${Date.now()}_error`,
        role: 'assistant',
        content: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full h-screen flex flex-col bg-black text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-900 to-black p-4 border-b border-purple-800 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">LIZA - Autonomous Agent</h1>
          <p className="text-sm text-purple-300">Agent ID: {agentId}</p>
        </div>
        
        {/* Wallet Connect Button - ALWAYS SHOW */}
        <div className="flex-shrink-0">
          {walletAddress ? (
            <div className="bg-purple-700 px-4 py-2 rounded-lg text-sm font-mono flex items-center gap-2">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              ✅ {walletAddress.slice(0, 8)}...{walletAddress.slice(-8)}
            </div>
          ) : (
            <button
              onClick={handleConnectWallet}
              type="button"
              className="bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white px-6 py-2 rounded-lg font-bold text-base transition-all duration-200"
              style={{ cursor: 'pointer', display: 'block' }}
            >
              🔗 Connect Phantom
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-md px-4 py-2 rounded-lg ${
                message.role === 'user'
                  ? 'bg-purple-600 text-white rounded-br-none'
                  : 'bg-gray-800 text-gray-100 rounded-bl-none'
              }`}
            >
              <p className="text-sm">{message.content}</p>
              <p className="text-xs mt-1 opacity-70">
                {message.timestamp.toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-800 px-4 py-2 rounded-lg">
              <div className="flex gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-purple-800 p-4 bg-black">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={walletAddress ? "Type your message..." : "Connect wallet first..."}
            className="flex-1 bg-gray-900 text-white rounded px-4 py-2 border border-purple-800 focus:border-purple-500 focus:outline-none"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white px-6 py-2 rounded font-semibold transition-colors"
          >
            Send
          </button>
        </form>
        <p className="text-xs text-gray-500 mt-2">
          💡 Try: "check my balance" or "swap" or "help"
        </p>
      </div>
    </div>
  );
}

function ExampleRoute() {
  const config = window.ELIZA_CONFIG;
  const agentId = config?.agentId;

  React.useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  if (!agentId) {
    return (
      <div className="p-4 text-center">
        <div className="text-red-600 font-medium">Error: Agent ID not found</div>
        <div className="text-sm text-gray-600 mt-2">
          The server should inject the agent ID configuration.
        </div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ChatComponent agentId={agentId as UUID} />
    </QueryClientProvider>
  );
}

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(<ExampleRoute />);
}

export interface AgentPanel {
  name: string;
  path: string;
  component: React.ComponentType<any>;
  icon?: string;
  public?: boolean;
  shortLabel?: string;
}

interface PanelProps {
  agentId: string;
}

const PanelComponent: React.FC<PanelProps> = ({ agentId }) => {
  return <ChatComponent agentId={agentId as UUID} />;
};

export const panels: AgentPanel[] = [
  {
    name: 'Chat',
    path: 'chat',
    component: PanelComponent,
    icon: 'MessageCircle',
    public: true,
    shortLabel: 'Chat',
  },
];

export * from './utils';
