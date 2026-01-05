/**
 * Portfolio Action Plugin for LIZA
 * Handles "show portfolio" and related requests
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
  examples: [
    [
      {
        user: 'User',
        content: {
          text: 'show my portfolio',
        },
      },
      {
        user: 'LIZA',
        content: {
          text: '💼 **PORTFOLIO ANALYSIS**\n\n📍 Wallet: CMVrzd...\n💰 **Total Value: $X,XXX.XX**',
        },
      },
    ],
  ],
  validate: async (_runtime: IAgentRuntime, _message: Memory, _state?: State): Promise<boolean> => {
    return true;
  },

  handler: async (
    _runtime: IAgentRuntime,
    _message: Memory,
    _state?: State,
    _options?: Record<string, unknown>,
    callback?: HandlerCallback,
    _responses?: Memory[]
  ): Promise<ActionResult> => {
    try {
      // Get wallet address from environment
      const walletAddress = process.env.SOLANA_PUBLIC_KEY || 'CMVrzdso4SShQm2irrc7jMCN9Vw5QxXvrZKB79cYPPJT';

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
        user: _message.userId,
        content: content,
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
        user: _message.userId,
        content: content,
        success: false,
      };
    }
  },
};

export default portfolioAction;
