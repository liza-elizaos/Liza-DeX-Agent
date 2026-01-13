import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createRoot } from 'react-dom/client';
import './index.css';
import React, { useState, useRef, useEffect, useMemo } from 'react';
import type { UUID } from '@elizaos/core';
import { WalletAdapterNetwork, WalletError } from '@solana/wallet-adapter-base';
import { ConnectionProvider, WalletProvider, useConnection, useWallet } from '@solana/wallet-adapter-react';
import { WalletModalProvider, WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import '@solana/wallet-adapter-react-ui/styles.css';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';
import { clusterApiUrl } from '@solana/web3.js';

const queryClient = new QueryClient();

// Define the interface for the ELIZA_CONFIG
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

// Declare global window extension for TypeScript
declare global {
  interface Window {
    ELIZA_CONFIG?: ElizaConfig;
  }
}

/**
 * Chat Component - Now with Wallet Support
 */
function ChatComponent({ agentId }: { agentId: UUID }) {
  const { publicKey, connecting, connected, connect } = useWallet();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: `Hello! I'm LIZA, your autonomous agent assistant. Connect your Phantom wallet to check your balance and execute transactions.`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    // Add user message
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
      // If user is asking about balance/wallet and has connected, add their address
      let messageToSend = input;
      if ((input.toLowerCase().includes('balance') || input.toLowerCase().includes('wallet')) && publicKey && !input.includes(publicKey.toBase58())) {
        messageToSend = `${input} ${publicKey.toBase58()}`;
      }

      const apiUrl = `${window.location.protocol}//${window.location.host}/api/chat`;

      console.log('Sending to:', apiUrl, 'Message:', messageToSend);

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          message: messageToSend,
          context: 'trading',
          config: null,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      
      console.log('API Response:', data);

      const assistantMessage: Message = {
        id: `msg_${Date.now()}_assistant`,
        role: 'assistant',
        content: data.response || 'No response received',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
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
      <div className="bg-gradient-to-r from-purple-900 to-black p-4 border-b border-purple-800 flex justify-between items-start gap-4">
        <div className="flex-1">
          <h1 className="text-2xl font-bold">LIZA - Autonomous Agent</h1>
          <p className="text-sm text-purple-300">Agent ID: {agentId}</p>
        </div>
        
        {/* Wallet Connect Button - Right Side */}
        <div className="flex-shrink-0 flex items-center">
          <WalletMultiButton />
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

      {/* Status */}
      {connected && (
        <div className="px-4 py-2 bg-green-900 border-l-4 border-green-500 text-green-200 text-sm">
          ✅ Wallet connected - You can now check balance and execute transactions
        </div>
      )}

      {/* Input */}
      <div className="border-t border-purple-800 p-4 bg-black">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={connected ? "Type your message..." : "Connect wallet first..."}
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

/**
 * Main Example route component
 */
function ExampleRoute() {
  const config = window.ELIZA_CONFIG;
  const agentId = config?.agentId;

  // Apply dark mode to the root element
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

  try {
    const network = WalletAdapterNetwork.Mainnet;
    const endpoint = clusterApiUrl(network);
    const wallets = useMemo(() => [new PhantomWalletAdapter()], []);

    const onError = (error: WalletError) => {
      console.error('[WALLET ERROR]', error);
    };

    return (
      <QueryClientProvider client={queryClient}>
        <ConnectionProvider endpoint={endpoint}>
          <WalletProvider wallets={wallets} onError={onError} autoConnect={true}>
            <WalletModalProvider>
              <ChatComponent agentId={agentId as UUID} />
            </WalletModalProvider>
          </WalletProvider>
        </ConnectionProvider>
      </QueryClientProvider>
    );
  } catch (error) {
    console.error('[INIT ERROR]', error);
    return (
      <div className="p-4 text-red-600">
        <div>Error initializing wallet: {error instanceof Error ? error.message : 'Unknown error'}</div>
      </div>
    );
  }
}

// Initialize the application
const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(<ExampleRoute />);
}

// Define types for integration with agent UI system
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

/**
 * Example panel component for the plugin system
 */
const PanelComponent: React.FC<PanelProps> = ({ agentId }) => {
  return (
    <ConnectionProvider endpoint={clusterApiUrl(WalletAdapterNetwork.Mainnet)}>
      <WalletProvider wallets={[new PhantomWalletAdapter()]} onError={(error: WalletError) => console.error(error)} autoConnect={true}>
        <ChatComponent agentId={agentId as UUID} />
      </WalletProvider>
    </ConnectionProvider>
  );
};

// Export the panel configuration for integration with the agent UI
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
