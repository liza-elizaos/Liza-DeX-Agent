import React, { createContext, useContext, useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import bs58 from 'bs58';

const PumpContext = createContext();

export const PumpProvider = ({ children }) => {
  const wallet = useWallet();
  const [connection] = useState(
    new Connection('https://api.mainnet-beta.solana.com', 'confirmed')
  );
  
  const [state, setState] = useState({
    walletBalance: 0,
    portfolio: [],
    trades: [],
    tokens: [],
    selectedToken: null,
    bots: [],
    markets: []
  });

  // Feature 1: Get Portfolio
  const getPortfolio = async () => {
    if (!wallet.publicKey) return;
    try {
      const balance = await connection.getBalance(wallet.publicKey);
      setState(prev => ({
        ...prev,
        walletBalance: balance / LAMPORTS_PER_SOL
      }));
    } catch (error) {
      console.error('Portfolio fetch failed:', error);
    }
  };

  useEffect(() => {
    if (wallet.publicKey) {
      getPortfolio();
      const interval = setInterval(getPortfolio, 5000);
      return () => clearInterval(interval);
    }
  }, [wallet.publicKey]);

  const value = {
    ...state,
    wallet,
    connection,
    getPortfolio,
    setState
  };

  return (
    <PumpContext.Provider value={value}>
      {children}
    </PumpContext.Provider>
  );
};

export const usePump = () => {
  const context = useContext(PumpContext);
  if (!context) {
    throw new Error('usePump must be used within PumpProvider');
  }
  return context;
};
