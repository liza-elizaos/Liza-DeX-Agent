/**
 * Solana Swap Plugin for elizaOS
 * Handles token swaps on Solana using Jupiter Protocol
 * 
 * Usage:
 *   - "swap 0.01 SOL for USDC"
 *   - "swap 5 USDC for SOL"
 *   - "check balance"
 */

import { performSwap, getBalance } from '../../swap-implementation.ts';

// Action handler for token swaps
async function handleSwapAction(params: {
  fromToken?: string;
  toToken: string;
  amount: number;
  walletAddress?: string;
}): Promise<any> {
  const {
    fromToken = 'SOL',
    toToken,
    amount,
    walletAddress
  } = params;

  try {
    const result = await performSwap(
      fromToken,
      toToken,
      amount,
      walletAddress
    );

    return {
      success: result.success,
      message: result.message || result.error,
      txHash: result.txHash,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString(),
    };
  }
}

// Action handler for balance checking
async function handleBalanceAction(params: {
  walletAddress?: string;
}): Promise<any> {
  try {
    const balance = await getBalance();
    return {
      success: true,
      balance: balance.toFixed(6),
      unit: 'SOL',
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString(),
    };
  }
}

// elizaOS Plugin Definition
export const SolanaSwapPlugin = {
  name: 'SolanaSwap',
  description: 'Execute token swaps on Solana mainnet using Jupiter Protocol',
  version: '1.0.0',

  // Actions available in the plugin
  actions: [
    {
      name: 'SWAP_TOKENS',
      similes: ['swap', 'exchange', 'trade', 'convert'],
      description: 'Swap tokens on Solana',
      examples: [
        'swap 0.01 SOL for USDC',
        'swap 5 USDC for SOL',
        'exchange 1 SOL to USDT',
      ],
      schema: {
        type: 'object',
        properties: {
          fromToken: {
            type: 'string',
            description: 'Token to swap from (default: SOL)',
            default: 'SOL',
          },
          toToken: {
            type: 'string',
            description: 'Token to swap to (e.g., USDC, USDT, BONK)',
          },
          amount: {
            type: 'number',
            description: 'Amount to swap',
          },
          walletAddress: {
            type: 'string',
            description: 'Wallet address (optional, uses default from config)',
          },
        },
        required: ['toToken', 'amount'],
      },
      handler: handleSwapAction,
    },
    {
      name: 'CHECK_BALANCE',
      similes: ['balance', 'check balance', 'how much SOL', 'wallet balance'],
      description: 'Check Solana wallet balance',
      examples: [
        'check my balance',
        'how much SOL do I have',
        'wallet balance',
      ],
      schema: {
        type: 'object',
        properties: {
          walletAddress: {
            type: 'string',
            description: 'Wallet address (optional, uses default)',
          },
        },
      },
      handler: handleBalanceAction,
    },
  ],

  // Event handlers (optional)
  events: {
    onSwapSuccess: (txHash: string, fromToken: string, toToken: string, amount: number) => {
      console.log(`[SWAP_PLUGIN] Swap successful: ${amount} ${fromToken} → ${toToken}`);
      console.log(`[SWAP_PLUGIN] TX: ${txHash}`);
    },
    onSwapFailure: (error: string) => {
      console.error(`[SWAP_PLUGIN] Swap failed: ${error}`);
    },
  },

  // Configuration
  config: {
    enabled: true,
    requiresWallet: true,
    network: 'mainnet',
    supportedTokens: [
      'SOL', 'USDC', 'USDT', 'WSOL', 'MSOL', 'RAY', 'BONK', 'COPE', 'SRM', 'FTT', 'KIN'
    ],
  },
};

// Export action handlers for direct use
export { handleSwapAction, handleBalanceAction };

// Default export
export default SolanaSwapPlugin;
