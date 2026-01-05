/**
 * LIZA Portfolio Action
 * Location: src/plugins/portfolio-action.ts
 * 
 * This plugin registers the Portfolio Analytics feature as an action in LIZA
 * Allows users to ask "show my portfolio" and get real-time data
 */

import { analyzePortfolio, formatPortfolioDisplay } from '../api/portfolio-analytics';

/**
 * Portfolio Action for LIZA
 * Registered as a tool that LIZA can use
 */
export const portfolioAction = {
  name: 'PORTFOLIO_ANALYSIS',
  similes: [
    'show portfolio',
    'portfolio analysis',
    'my holdings',
    'total value',
    'what am i holding',
    'portfolio composition',
    'my assets',
    'token holdings',
    'portfolio breakdown',
    'show my portfolio',
    'analyze portfolio',
  ],
  description:
    'Analyzes your complete Solana wallet portfolio with real-time valuations, token holdings, and composition breakdown',

  /**
   * Main action handler
   */
  handler: async (params) => {
    try {
      // Get wallet address from context
      const walletAddress =
        params.walletAddress ||
        params.userId ||
        process.env.SOLANA_PUBLIC_KEY ||
        'CMVrzdso4SShQm2irrc7jMCN9Vw5QxXvrZKB79cYPPJT';

      // Get RPC URL from environment
      const rpcUrl = process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';

      // Analyze portfolio
      console.log(`[PORTFOLIO] Analyzing wallet: ${walletAddress}`);
      const portfolio = await analyzePortfolio(walletAddress, rpcUrl);

      // Format for display
      const display = formatPortfolioDisplay(portfolio);

      return {
        success: true,
        content: display,
        data: portfolio,
      };
    } catch (error) {
      console.error('[PORTFOLIO] Error:', error);
      return {
        success: false,
        content: `Unable to analyze portfolio: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error: error,
      };
    }
  },
};

/**
 * LIZA Integration Pattern
 * Add this to your ElizaOS plugin system
 */

export class PortfolioPlugin {
  /**
   * Initialize portfolio plugin
   */
  static async initialize() {
    console.log('[PORTFOLIO] Plugin initialized');
    return {
      actions: [portfolioAction],
      name: 'Portfolio Analytics',
      version: '1.0.0',
    };
  }

  /**
   * Handle portfolio requests from any source
   */
  static async handleRequest(
    walletAddress: string,
    rpcUrl?: string
  ): Promise<{ success: boolean; content: string; data?: any }> {
    try {
      const portfolio = await analyzePortfolio(
        walletAddress,
        rpcUrl || process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com'
      );
      const content = formatPortfolioDisplay(portfolio);

      return {
        success: true,
        content,
        data: portfolio,
      };
    } catch (error) {
      return {
        success: false,
        content: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }
}

/**
 * INSTALLATION IN LIZA:
 * 
 * Option 1: Add to Character Config
 * =====================================
 * 
 * In src/characters/liza.character.json:
 * 
 * "actions": [
 *   {
 *     "name": "PORTFOLIO_ANALYSIS",
 *     "description": "Shows your complete portfolio with real-time valuations",
 *     "similes": [
 *       "show portfolio",
 *       "portfolio analysis",
 *       "my holdings",
 *       "total value"
 *     ]
 *   }
 * ]
 * 
 * 
 * Option 2: Register in Plugin System
 * =====================================
 * 
 * In src/plugins/index.ts:
 * 
 * import { PortfolioPlugin } from './portfolio-action';
 * 
 * export async function initializePlugins() {
 *   const portfolioPlugin = await PortfolioPlugin.initialize();
 *   // Register with your plugin system
 *   registerPlugin(portfolioPlugin);
 * }
 * 
 * 
 * Option 3: Add to ElizaOS Action Handler
 * ========================================
 * 
 * In your message handler:
 * 
 * if (message.includes('portfolio') || message.includes('holdings')) {
 *   const result = await PortfolioPlugin.handleRequest(
 *     userWalletAddress,
 *     process.env.SOLANA_RPC_URL
 *   );
 *   
 *   return result.content;
 * }
 * 
 * 
 * TESTING IN LIZA:
 * ================
 * 
 * Once installed, users can say:
 * - "show my portfolio"
 * - "portfolio analysis"
 * - "what am I holding"
 * - "total value"
 * - "my holdings"
 * 
 * LIZA will respond with:
 * 
 * 💼 **PORTFOLIO ANALYSIS**
 * 📍 Wallet: CMVrzd...
 * 💰 **Total Value: $1,234.56**
 * 📊 Tokens Held: 5
 * 
 * **🔝 SOL Balance:**
 * ├─ 1.5000 SOL
 * └─ $450.00
 * 
 * [and more tokens...]
 */

/**
 * SIMPLE USAGE EXAMPLE:
 * 
 * // In any LIZA handler or API route:
 * import { PortfolioPlugin } from './plugins/portfolio-action';
 * 
 * const result = await PortfolioPlugin.handleRequest(
 *   'CMVrzdso4SShQm2irrc7jMCN9Vw5QxXvrZKB79cYPPJT'
 * );
 * 
 * console.log(result.content); // Formatted portfolio display
 * console.log(result.data);    // Raw portfolio data
 */

export default PortfolioPlugin;
