// Trend detector - simplified for the new agent flow
// This is now handled directly in agentController via dexService.getTrendingTokens()

export async function detectTrends() {
  return {
    summary: 'Market trends detection - check dexscreener for latest activity'
  };
}
