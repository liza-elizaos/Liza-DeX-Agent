/**
 * Portfolio Action Plugin for LIZA
 * Handles "show portfolio" and related requests
 * Now supports dynamic wallet addresses from user connection
 */

import {
  Action,
  IAgentRuntime,
  Memory,
  State,
  ActionResult,
  Content,
  HandlerCallback,
} from '@elizaos/core';
import { analyzePortfolio, formatPortfolioDisplay } from '../api/portfolio-analytics';

export const portfolioAction: Action = {
  name: 'SHOW_PORTFOLIO',
  similes: [
    'show portfolio',
    'show my portfolio',
    'portfolio analysis',
    'my portfolio',
    'portfolio breakdown',
    'my holdings',
    'what am i holding',
    'total value',
    'portfolio composition',
    'token holdings',
    'analyze portfolio',
  ],
  description: 'Shows your complete portfolio with real-time valuations',
  validate: async (_runtime: IAgentRuntime, _message: Memory, _state?: State): Promise<boolean> => {
    return true;
  },

  handler: async (
    runtime: IAgentRuntime,
    _message: Memory,
    _state?: State,
    _options?: Record<string, unknown>,
    callback?: HandlerCallback,
    _responses?: Memory[]
  ): Promise<ActionResult> => {
    try {
      // Try multiple sources to get wallet address
      let walletAddress = '';

      // Source 1: Direct context
      walletAddress = (_state?.walletAddress as string) ||
                      (_options?.walletAddress as string) ||
                      (_message.content?.walletAddress as string);

      // Source 2: Parse from message text - look for wallet address pattern
      if (!walletAddress && _message.content?.text) {
        const text = _message.content.text;
        // Solana addresses are 44 character base58
        const base58Pattern = /\b[1-9A-HJ-NP-Z]{44}\b/g;
        const matches = text.match(base58Pattern);
        if (matches && matches.length > 0) {
          walletAddress = matches[0]; // Use first valid address found
          console.log('[PORTFOLIO_ACTION] Extracted wallet from message:', walletAddress);
        }
      }

      // Source 4: Fallback to environment wallet
      if (!walletAddress) {
        walletAddress = process.env.SOLANA_PUBLIC_KEY || 'CMVrzdso4SShQm2irrc7jMCN9Vw5QxXvrZKB79cYPPJT';
        console.log('[PORTFOLIO_ACTION] Using fallback environment wallet');
      }

      console.log('[PORTFOLIO_ACTION] Analyzing portfolio for:', walletAddress);

      // Get RPC URL
      const rpcUrl = process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';

      // Analyze portfolio
      const portfolio = await analyzePortfolio(walletAddress, rpcUrl);

      // Format for display
      const display = formatPortfolioDisplay(portfolio);

      // Create response
      const content: Content = {
        text: display,
      };

      // Call callback if provided
      if (callback) {
        callback(content);
      }

      return {
        success: true,
      };
    } catch (error) {
      console.error('[PORTFOLIO_ACTION] Error:', error);

      const errorMessage = error instanceof Error ? error.message : 'Failed to analyze portfolio';
      const content: Content = {
        text: `❌ Unable to fetch portfolio: ${errorMessage}`,
      };

      if (callback) {
        callback(content);
      }

      return {
        success: false,
      };
    }
  },
};

export default portfolioAction;
