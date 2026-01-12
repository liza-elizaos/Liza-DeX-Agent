import type { Action, ActionResult, Content, HandlerCallback, IAgentRuntime, Memory, State } from '@elizaos/core';
import { logger } from '@elizaos/core';
import { z } from 'zod';

/**
 * Schema for validating token launch parameters
 */
const tokenLaunchSchema = z.object({
  name: z.string().min(1).max(32, 'Token name must be 32 characters or less'),
  symbol: z.string().min(1).max(10, 'Token symbol must be 10 characters or less').toUpperCase(),
  description: z.string().min(1).max(500),
  imageUrl: z.string().optional(),
});

type TokenLaunchParams = z.infer<typeof tokenLaunchSchema>;

/**
 * Token Launch Action - Allows users to launch tokens via PumpFun SDK
 * Triggered by: /launch, "launch token", "create token", "launch my token"
 */
export const tokenLaunchAction: Action = {
  name: 'TOKEN_LAUNCH',
  similes: ['LAUNCH_TOKEN', 'CREATE_TOKEN', 'START_TOKEN', 'LAUNCH_NEW_TOKEN'],
  description: 'Launch a new Solana SPL token on mainnet using PumpFun SDK',
  
  validate: async (runtime: IAgentRuntime, message: Memory, _state: State): Promise<boolean> => {
    try {
      // Check if message contains launch-related keywords
      const text = message.content.text?.toLowerCase() || '';
      const hasLaunchKeyword =
        text.includes('/launch') ||
        text.includes('launch token') ||
        text.includes('create token') ||
        text.includes('launch') ||
        text.includes('new token');

      if (!hasLaunchKeyword) {
        return false;
      }

      // Check if required environment variables are set
      const hasRequiredEnv =
        process.env.DEV_WALLET_PRIVATE_KEY &&
        process.env.DEV_WALLET_ADDRESS &&
        process.env.SOLANA_RPC_URL;

      if (!hasRequiredEnv) {
        logger.error('TOKEN_LAUNCH: Missing required environment variables');
        return false;
      }

      return true;
    } catch (error) {
      logger.error('TOKEN_LAUNCH validation error:', error);
      return false;
    }
  },

  handler: async (
    runtime: IAgentRuntime,
    message: Memory,
    state: State,
    _options: any,
    callback: HandlerCallback,
    _responses: Memory[]
  ): Promise<ActionResult> => {
    try {
      const text = message.content.text || '';
      
      // Parse launch parameters from user message
      // Format: /launch name:MyToken symbol:MT description:My awesome token
      const params = await parseTokenLaunchParams(text);

      if (!params) {
        const errorContent: Content = {
          text: `❌ Invalid launch parameters. Please use format:\n/launch name:YourToken symbol:YT description:"Your token description"`,
          actions: ['TOKEN_LAUNCH'],
          source: message.content.source,
        };
        await callback(errorContent);

        return {
          text: 'Invalid token launch parameters',
          success: false,
        };
      }

      // Validate parsed parameters
      const validated = tokenLaunchSchema.parse(params);

      logger.info(`TOKEN_LAUNCH: Launching token - ${validated.name} (${validated.symbol})`);

      // Call token launch service
      const launchResult = await launchTokenOnMainnet(validated, runtime);

      if (!launchResult.success) {
        const errorContent: Content = {
          text: `❌ Token launch failed: ${launchResult.error}`,
          actions: ['TOKEN_LAUNCH'],
          source: message.content.source,
        };
        await callback(errorContent);

        return {
          text: `Token launch failed: ${launchResult.error}`,
          success: false,
        };
      }

      // Success response
      const successContent: Content = {
        text: `✅ **Token Launched Successfully!**\n\n` +
          `🪙 Token: ${validated.name} (${validated.symbol})\n` +
          `📍 Mint Address: \`${launchResult.mint}\`\n` +
          `💾 Signature: \`${launchResult.txSignature}\`\n` +
          `💰 Cost: ~0.002 SOL (rent + transaction fee)\n\n` +
          `**Explorer Links:**\n` +
          `🔗 Solscan: https://solscan.io/token/${launchResult.mint}\n` +
          `🔗 Pump.fun: https://pump.fun/coin/${launchResult.mint}\n` +
          `🔗 Solana Beach: https://solanabeach.io/token/${launchResult.mint}`,
        actions: ['TOKEN_LAUNCH'],
        source: message.content.source,
      };

      await callback(successContent);

      return {
        text: `Token ${validated.symbol} launched successfully at ${launchResult.mint}`,
        success: true,
        data: {
          mint: launchResult.mint,
          txSignature: launchResult.txSignature,
          name: validated.name,
          symbol: validated.symbol,
        },
      };
    } catch (error) {
      logger.error('TOKEN_LAUNCH handler error:', error);

      const errorContent: Content = {
        text: `❌ Error launching token: ${error instanceof Error ? error.message : 'Unknown error'}`,
        actions: ['TOKEN_LAUNCH'],
        source: message.content.source,
      };
      await callback(errorContent);

      return {
        text: `Token launch error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        success: false,
      };
    }
  },
};

/**
 * Parse token launch parameters from user message
 */
async function parseTokenLaunchParams(text: string): Promise<TokenLaunchParams | null> {
  try {
    // Extract parameters from different formats
    // Format 1: /launch name:Token symbol:TKN description:Description
    const namedFormat = /name:([^\s]+)\s+symbol:([^\s]+)\s+description:(.+?)(?=\s+image:|$)/i.exec(text);
    if (namedFormat) {
      return {
        name: namedFormat[1],
        symbol: namedFormat[2].toUpperCase(),
        description: namedFormat[3].trim(),
      };
    }

    // Format 2: /launch Token TKN "Full description here"
    const spacedFormat = /\/launch\s+([^\s]+)\s+([^\s]+)\s+"?([^"]+)"?/i.exec(text);
    if (spacedFormat) {
      return {
        name: spacedFormat[1],
        symbol: spacedFormat[2].toUpperCase(),
        description: spacedFormat[3],
      };
    }

    // Format 3: "launch" "token" "name" "symbol" "description"
    const keywordFormat = /launch(?:\s+token)?\s+([^\s]+)\s+([^\s]+)\s+(.+?)(?:\s*$|\s+image:)/i.exec(text);
    if (keywordFormat) {
      return {
        name: keywordFormat[1],
        symbol: keywordFormat[2].toUpperCase(),
        description: keywordFormat[3].trim(),
      };
    }

    return null;
  } catch (error) {
    logger.error('Error parsing token launch params:', error);
    return null;
  }
}

/**
 * Launch token on Solana mainnet via API endpoint
 */
async function launchTokenOnMainnet(
  params: TokenLaunchParams,
  runtime: IAgentRuntime
): Promise<{ success: boolean; mint?: string; txSignature?: string; error?: string }> {
  try {
    // Determine the API endpoint based on environment
    let apiUrl = process.env.TOKEN_CREATE_API_URL;
    
    if (!apiUrl) {
      // Try common Vercel deployment URL patterns
      if (process.env.VERCEL_URL) {
        apiUrl = `https://${process.env.VERCEL_URL}/api/token-create`;
      } else if (process.env.NEXT_PUBLIC_API_URL) {
        apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/token-create`;
      } else {
        // Local development fallback
        apiUrl = process.env.NODE_ENV === 'production' 
          ? 'https://your-domain.com/api/token-create'
          : 'http://localhost:3001/api/token/create';
      }
    }

    logger.info(`TOKEN_LAUNCH: Calling token creation API - ${apiUrl}`);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 120000);
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: params.name,
        symbol: params.symbol,
        description: params.description,
      }),
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || errorData.message || `API error: ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.success || !data.mint) {
      throw new Error(data.error || data.message || 'Token creation failed');
    }

    logger.info(`TOKEN_LAUNCH: Token created successfully - mint: ${data.mint}`);

    return {
      success: true,
      mint: data.mint,
      txSignature: data.transaction || data.txSignature,
    };
  } catch (error) {
    logger.error('TOKEN_LAUNCH: Error launching token', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

export default tokenLaunchAction;
