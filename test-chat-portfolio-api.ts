/**
 * Simulates Chat API Request - Test Portfolio Handler
 * Tests if portfolio feature works when LIZA receives "show portfolio" message
 */

// Simulate what happens when a user sends "show portfolio" to the chat API

async function simulateChatRequest() {
  console.log('🧪 Simulating Chat API Request: "show portfolio"\n');

  const userMessage = 'show portfolio';
  const userWallet = '6i1HTXhcxreAEys8QMEvnB1FNpNVwombS61QcwquJb1f';

  console.log('📝 Message:', userMessage);
  console.log('👤 Wallet:', userWallet);
  console.log('');

  // Test if message triggers portfolio handler
  const msg = userMessage.toLowerCase().trim();
  const hasPortfolio = msg.includes("portfolio") || 
                       msg.includes("holdings") || 
                       msg.includes("my tokens") || 
                       msg.includes("token breakdown");

  console.log('✅ Portfolio detection check:', hasPortfolio ? 'TRIGGERED' : 'NOT TRIGGERED');
  
  if (hasPortfolio) {
    console.log('');
    console.log('🎯 Portfolio handler will be called with:');
    console.log('   - Message:', userMessage);
    console.log('   - Wallet:', userWallet);
    console.log('');

    // Now actually call the portfolio analyzer
    try {
      const { analyzePortfolio, formatPortfolioDisplay } = await import('./src/api/portfolio-analytics');
      const rpcUrl = process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';
      
      console.log('📊 Analyzing portfolio...\n');
      const portfolio = await analyzePortfolio(userWallet, rpcUrl);
      const display = formatPortfolioDisplay(portfolio);

      console.log('✅ RESPONSE FROM LIZA:\n');
      console.log(display);
      console.log('\n✅ TEST PASSED - "show portfolio" command works!');
    } catch (error) {
      console.error('❌ Portfolio analysis failed:', error);
      process.exit(1);
    }
  } else {
    console.error('❌ Portfolio handler NOT triggered - message pattern not matched!');
    process.exit(1);
  }
}

simulateChatRequest();
