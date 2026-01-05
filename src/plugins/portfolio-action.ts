/**
 * Portfolio Action Plugin for LIZA
 * Handles "show portfolio" and related requests
 */

import { Action, IAgentRuntime, Memory, State } from '@elizaos/core';
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
  validate: async (_runtime: IAgentRuntime) => true,
  handler: async (
    runtime: IAgentRuntime,
    _message: Memory,
    _state?: State,
    _options?: Record<string, unknown>,
    _callback?: (response: { text: string }) => void
  ): Promise<boolean> => {
    try {
      // Get wallet address from environment or context
      const walletAddress = process.env.SOLANA_PUBLIC_KEY || 'CMVrzdso4SShQm2irrc7jMCN9Vw5QxXvrZKB79cYPPJT';

      console.log('[PORTFOLIO_ACTION] Analyzing portfolio for:', walletAddress);

      // Get RPC URL
      const rpcUrl = process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';

      // Analyze portfolio
      const portfolio = await analyzePortfolio(walletAddress, rpcUrl);

      // Format for display
      const display = formatPortfolioDisplay(portfolio);

      // Return response
      if (_callback) {
        _callback({
          text: display,
        });
      }

      return true;
    } catch (error) {
      console.error('[PORTFOLIO_ACTION] Error:', error);

      const errorMessage = error instanceof Error ? error.message : 'Failed to analyze portfolio';

      if (_callback) {
        _callback({
          text: `❌ Unable to fetch portfolio: ${errorMessage}`,
        });
      }

      return false;
    }
  },
};

export default portfolioAction;
