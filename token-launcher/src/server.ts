import app from './app.js';

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🚀 Token Launcher Backend`);
  console.log(`📍 Server running on http://localhost:${PORT}`);
  console.log(`${'='.repeat(60)}\n`);

  console.log('✅ Environment loaded:');
  console.log(`   - OPENROUTER_API_KEY: ${process.env.OPENROUTER_API_KEY ? '✓' : '✗'}`);
  console.log(`   - PUMPPORTAL_API_KEY: ${process.env.PUMPPORTAL_API_KEY ? '✓' : '✗'}`);
  console.log(`   - SOLANA_RPC_URL: ${process.env.SOLANA_RPC_URL ? '✓' : '✗'}`);
  console.log(`   - DEV_WALLET_ADDRESS: ${process.env.DEV_WALLET_ADDRESS ? '✓' : '✗'}\n`);

  console.log('📋 API Endpoints:');
  console.log(`   POST /api/agent/launch - Launch a new token`);
  console.log(`   GET /health - Health check\n`);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});
