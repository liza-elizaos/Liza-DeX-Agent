#!/usr/bin/env bun
/**
 * elizaOS SOLANA SWAP PLUGIN - WALLET CONNECTED VERSION
 * 
 * NO HARDCODED KEYS - Users connect their own wallets via Phantom/Solflare
 * All transactions signed by user's wallet
 */

export interface SwapRequest {
  fromToken: string;
  toToken: string;
  amount: number;
  userWalletAddress?: string;
}

export interface SwapResult {
  success: boolean;
  message: string;
  transaction?: string;
  details?: {
    sent: string;
    received: string;
    rate: number;
  };
}

// Token mappings
const TOKEN_MAP: Record<string, string> = {
  'SOL': 'So11111111111111111111111111111111111111112',
  'WSOL': 'So11111111111111111111111111111111111111112',
  'USDC': 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
};

function resolveMint(token: string): string {
  const upper = token.toUpperCase();
  if (TOKEN_MAP[upper]) {
    return TOKEN_MAP[upper];
  }
  return token;
}

async function getTokenSymbol(mint: string): Promise<string> {
  if (mint === 'So11111111111111111111111111111111111111112') return 'WSOL';
  if (mint === 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v') return 'USDC';
  return mint.substring(0, 8) + '...';
}

async function getQuote(
  inputMint: string,
  outputMint: string,
  amount: number
): Promise<any> {
  const amountInSmallestUnit = Math.floor(amount * Math.pow(10, 6));

  const queryParams = new URLSearchParams({
    inputMint,
    outputMint,
    amount: amountInSmallestUnit.toString(),
    slippageBps: '50',
    onlyDirectRoutes: 'false',
  });

  const quoteUrl = `https://api.jup.ag/swap/v1/quote?${queryParams.toString()}`;

  const response = await fetch(quoteUrl, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'User-Agent': 'Solana-AI-Agent/1.0',
    },
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `Quote failed (${response.status}): ${errorBody.substring(0, 100)}`
    );
  }

  return response.json();
}

/**
 * Parse natural language swap commands
 * Supports: "swap 0.1 USDC for SOL", "buy 0.001 HdZh from Sol", etc.
 */
export function parseSwapCommand(userMessage: string): {
  valid: boolean;
  amount?: number;
  fromToken?: string;
  toToken?: string;
  error?: string;
} {
  const msg = userMessage.toLowerCase().trim();

  // Pattern: "buy X token from Y" or "swap X token for Y"
  const patterns = [
    /swap\s+([\d.]+)\s+(\S+)\s+for\s+(\S+)/i,
    /buy\s+([\d.]+)\s+(\S+)\s+from\s+(\w+)/i,
    /sell\s+([\d.]+)\s+(\S+)\s+for\s+(\S+)/i,
  ];

  for (const pattern of patterns) {
    const match = userMessage.match(pattern);
    if (match) {
      return {
        valid: true,
        amount: parseFloat(match[1]),
        fromToken: pattern === patterns[1] ? match[3] : match[2],
        toToken: pattern === patterns[1] ? match[2] : match[3],
      };
    }
  }

  return {
    valid: false,
    error: 'Could not understand swap command. Try: "swap 0.1 USDC for SOL"',
  };
}

/**
 * Execute swap - USER MUST SIGN THE TRANSACTION
 * No private keys stored on server
 */
export async function executeSwapWithUserWallet(request: SwapRequest): Promise<SwapResult> {
  try {
    if (!request.userWalletAddress) {
      return {
        success: false,
        message: '❌ Wallet address required. Please connect your wallet first.',
      };
    }

    const inputMint = resolveMint(request.fromToken);
    const outputMint = resolveMint(request.toToken);

    // Get quote
    const quote = await getQuote(inputMint, outputMint, request.amount);

    const outputAmount = parseInt(quote.outAmount) / Math.pow(10, 6);
    const inputSymbol = await getTokenSymbol(inputMint);
    const outputSymbol = await getTokenSymbol(outputMint);

    return {
      success: true,
      message: `✅ Ready to swap!

You will need to sign this transaction in your wallet:

📤 Send: ${request.amount} ${inputSymbol}
📥 Receive: ~${outputAmount.toFixed(6)} ${outputSymbol}

Exchange Rate: 1 ${inputSymbol} = ${(outputAmount / request.amount).toFixed(8)} ${outputSymbol}

Slippage Tolerance: 0.5%`,
      details: {
        sent: `${request.amount} ${inputSymbol}`,
        received: `${outputAmount.toFixed(6)} ${outputSymbol}`,
        rate: outputAmount / request.amount,
      },
    };
  } catch (error: any) {
    return {
      success: false,
      message: `❌ Swap preparation failed: ${error.message}`,
    };
  }
}

/**
 * elizaOS Plugin Export
 * Integrates with elizaOS for natural language processing
 */
export const solanaWalletSwapPlugin = {
  name: 'solana-wallet-swap',
  description:
    'Solana token swaps powered by Jupiter Protocol - Wallet connected, no private keys',
  actions: [
    {
      name: 'SWAP_WITH_WALLET',
      similes: [
        'swap tokens',
        'buy token',
        'sell token',
        'exchange',
        'trade',
      ],
      description:
        'Swap Solana tokens using user-connected wallet (requires wallet signature)',
      validate: async () => true,
      handler: async (runtime: any, message: any) => {
        try {
          const userMessage = message.content?.text || String(message.content);
          const parsed = parseSwapCommand(userMessage);

          if (!parsed.valid) {
            return {
              text: `❌ ${parsed.error}`,
              success: false,
            };
          }

          const result = await executeSwapWithUserWallet({
            fromToken: parsed.fromToken || 'SOL',
            toToken: parsed.toToken || 'USDC',
            amount: parsed.amount || 0.1,
            userWalletAddress: runtime.userWalletAddress, // From connected wallet
          });

          return {
            text: result.message,
            success: result.success,
          };
        } catch (error: any) {
          return {
            text: `❌ Error: ${error.message}`,
            success: false,
          };
        }
      },
    },
    {
      name: 'CHECK_BALANCE',
      similes: ['balance', 'how much', 'portfolio', 'holdings'],
      description:
        'Check token balances for connected wallet',
      validate: async () => true,
      handler: async (runtime: any) => {
        if (!runtime.userWalletAddress) {
          return {
            text: '❌ Please connect your wallet first',
            success: false,
          };
        }

        return {
          text: `💰 Connected Wallet: ${runtime.userWalletAddress.slice(0, 8)}...${runtime.userWalletAddress.slice(-8)}

Use the Solana wallet app to view your balance.`,
          success: true,
        };
      },
    },
  ],
};

export default solanaWalletSwapPlugin;
