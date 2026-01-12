// src/plugins/creator-rewards.ts
// Creator rewards claim system for Liza ElizaOS

import { Action, IAgentRuntime, Memory, State, ActionResult } from "@elizaos/core";

const claimRewardsAction: Action = {
  name: "CLAIM_REWARDS",
  similes: [
    "claim my rewards",
    "get my fees",
    "withdraw earnings",
    "cash out creator fees",
    "claim my sol",
  ],
  description:
    "Claim accumulated creator fees from tokens you created. Shows how much is available to claim.",
  validate: async (runtime: IAgentRuntime, message: Memory) => {
    return message.content.text?.toLowerCase().includes("claim") ?? false;
  },
  handler: async (runtime: IAgentRuntime, message: Memory): Promise<ActionResult> => {
    const extractWallet = (text: string): string | null => {
      const walletRegex = /[1-9A-HJ-NP-Z]{32,34}/;
      const match = text.match(walletRegex);
      return match ? match[0] : null;
    };

    const userWallet = extractWallet(message.content.text || "") || message.agentId || "unknown";

    try {
      // Fetch creator rewards from API
      const rewardsResponse = await fetch(
        `${process.env.API_BASE_URL}/api/creator-rewards?wallet=${userWallet}`
      );

      if (!rewardsResponse.ok) {
        return {
          success: true,
          text: `❌ Could not find any rewards for wallet ${userWallet}. Have you created any tokens yet?`,
        };
      }

      const rewards = await rewardsResponse.json();
      const { totalAccumulated, totalClaimed, claimable, tokens } = rewards;

      if (!claimable || claimable <= 0) {
        return {
          success: true,
          text: `💰 **Your Creator Stats:**\n• Total Accumulated: ${totalAccumulated.toFixed(4)} SOL\n• Total Claimed: ${totalClaimed.toFixed(4)} SOL\n• Available to Claim: **0 SOL**\n\nKeep creating and trading tokens to earn more rewards!`,
        };
      }

      // Format token details
      const tokenDetails = tokens
        .map(
          (t: any) =>
            `  • ${t.name}: ${(t.accumulatedFees - t.claimedFees).toFixed(4)} SOL`
        )
        .join("\n");

      const response = `💰 **Your Creator Rewards:**\n• Total Accumulated: ${totalAccumulated.toFixed(4)} SOL\n• Total Claimed: ${totalClaimed.toFixed(4)} SOL\n• **Available to Claim: ${claimable.toFixed(4)} SOL** ✨\n\n**Breakdown by Token:**\n${tokenDetails}\n\n🎯 To claim your rewards:\n1. Go to https://autofun-launcher.vercel.app/dashboard\n2. Connect your wallet\n3. Click "Claim Your Rewards"\n4. Approve the transaction in Phantom\n\nAll claimed fees go directly to your wallet!`;

      return { 
        success: true,
        text: response 
      };
    } catch (error) {
      return {
        success: false,
        text: `⚠️ Error fetching rewards: ${error instanceof Error ? error.message : "Unknown error"}`,
      };
    }
  },
};

const claimSpecificAction: Action = {
  name: "CLAIM_SPECIFIC",
  similes: [
    "claim 0.5 sol",
    "withdraw 1 sol",
    "get my 0.1 sol",
  ],
  description:
    "Claim a specific amount of your accumulated creator fees.",
  validate: async (runtime: IAgentRuntime, message: Memory) => {
    const hasClaimKeyword = (message.content.text || "").toLowerCase().includes("claim");
    const hasAmount = /\d+\.?\d*/.test(message.content.text || "");
    return hasClaimKeyword && hasAmount;
  },
  handler: async (runtime: IAgentRuntime, message: Memory) => {
    const extractWallet = (text: string): string | null => {
      const walletRegex = /[1-9A-HJ-NP-Z]{32,34}/;
      const match = text.match(walletRegex);
      return match ? match[0] : null;
    };

    const extractAmount = (text: string): number | null => {
      const amountRegex = /(\d+\.?\d*)\s*sol/i;
      const match = text.match(amountRegex);
      return match ? parseFloat(match[1]) : null;
    };

    const userWallet = extractWallet((message.content.text || "")) || "unknown";
    const amount = extractAmount(message.content.text || "");

    if (!amount || amount <= 0) {
      return {
        success: false,
        text: "❌ Please specify a valid amount to claim (e.g., 'claim 0.5 sol')",
      };
    }

    try {
      // Check if amount is available
      const rewardsResponse = await fetch(
        `${process.env.API_BASE_URL}/api/creator-rewards?wallet=${userWallet}`
      );

      if (!rewardsResponse.ok) {
        return {
          success: false,
          text: `❌ Could not find rewards for wallet ${userWallet}`,
        };
      }

      const rewards = await rewardsResponse.json();
      const { claimable } = rewards;

      if (amount > claimable) {
        return {
          success: true,
          text: `❌ You don't have that much available!\n• Requested: ${amount.toFixed(4)} SOL\n• Available: ${claimable.toFixed(4)} SOL`,
        };
      }

      return {
        success: true,
        text: `✅ **Claim Request Created:**\n• Amount: ${amount.toFixed(4)} SOL\n• Wallet: ${userWallet}\n\n📱 Complete your claim at: https://autofun-launcher.vercel.app/dashboard\n\nYou'll be prompted to approve the transaction in Phantom Wallet.`,
      };
    } catch (error) {
      return {
        success: false,
        text: `⚠️ Error processing claim: ${error instanceof Error ? error.message : "Unknown error"}`,
      };
    }
  },
};

const rewardStatsAction: Action = {
  name: "REWARD_STATS",
  similes: [
    "show my stats",
    "how much have i earned",
    "my token earnings",
    "show earnings",
  ],
  description:
    "Display detailed statistics about your creator earnings.",
  validate: async (runtime: IAgentRuntime, message: Memory) => {
    const keywords = ["stats", "earnings", "earned", "how much"];
    return keywords.some((k) =>
      message.content.text?.toLowerCase().includes(k) ?? false
    );
  },
  handler: async (runtime: IAgentRuntime, message: Memory): Promise<ActionResult> => {
    const extractWallet = (text: string): string | null => {
      const walletRegex = /[1-9A-HJ-NP-Z]{32,34}/;
      const match = text.match(walletRegex);
      return match ? match[0] : null;
    };

    const userWallet = extractWallet(message.content.text || "") || (message.agentId || "unknown");

    try {
      const rewardsResponse = await fetch(
        `${process.env.API_BASE_URL}/api/creator-rewards?wallet=${userWallet}`
      );

      if (!rewardsResponse.ok) {
        return {
          success: true,
          text: `📊 No creator history found for ${userWallet}. Start by creating your first token!`,
        };
      }

      const rewards = await rewardsResponse.json();
      const {
        totalAccumulated,
        totalClaimed,
        claimable,
        tokens,
      } = rewards;

      const statsTable = `
📊 **CREATOR EARNINGS SUMMARY**
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💰 Total Accumulated: ${totalAccumulated.toFixed(4)} SOL
✅ Total Claimed: ${totalClaimed.toFixed(4)} SOL
⏳ Available: ${claimable.toFixed(4)} SOL

📈 **Tokens Created: ${tokens.length}**
${
  tokens.length > 0
    ? tokens
        .map(
          (t: any, i: number) => `
  ${i + 1}. ${t.name}
     ├─ Accumulated: ${t.accumulatedFees.toFixed(4)} SOL
     ├─ Claimed: ${t.claimedFees.toFixed(4)} SOL
     └─ Pending: ${(t.accumulatedFees - t.claimedFees).toFixed(4)} SOL`
        )
        .join("\n")
    : "  No tokens created yet"
}
`;

      return { success: true, text: statsTable };
    } catch (error) {
      return {
        success: false,
        text: `⚠️ Error fetching stats: ${error instanceof Error ? error.message : "Unknown error"}`,
      };
    }
  },
};

export const rewardActions = [claimRewardsAction, claimSpecificAction, rewardStatsAction];

/**
 * Hook to integrate with Liza event system
 */
export function setupCreatorRewards(runtime: IAgentRuntime) {
  console.log("✅ Creator Rewards System initialized");

  // Could add periodic checks for accumulated fees, webhooks, etc.
  // Example: Every hour, check if creators have new fees to claim
  setInterval(async () => {
    try {
      // Example webhook notification
      console.log("🔔 Checking for new creator earnings...");
    } catch (error) {
      console.error("Error in rewards check:", error);
    }
  }, 3600000); // Every hour
}
