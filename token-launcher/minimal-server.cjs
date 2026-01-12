// Minimal server for testing - NO TypeScript, NO external imports
const express = require('express');
const app = express();

// Middleware
app.use(express.json());

// Add request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
  next();
});

// Health check - instant response
app.get('/api/health', (req, res) => {
  console.log('OK Health check');
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Debug endpoint - instant response
app.post('/api/agent/debug', (req, res) => {
  console.log('OK Debug endpoint hit');
  console.log('Body:', JSON.stringify(req.body, null, 2));
  
  const { userPrompt } = req.body;
  
  if (!userPrompt) {
    console.log('FAIL Missing userPrompt');
    return res.status(400).json({
      status: 'error',
      message: 'userPrompt is required'
    });
  }
  
  // Generate response instantly
  const token = {
    name: (userPrompt.idea || 'Test Token').substring(0, 20),
    symbol: (userPrompt.symbolHint || 'TEST').toUpperCase().substring(0, 5),
    lore: `${userPrompt.idea}. ${userPrompt.tone} vibes. Built on Solana.`,
    tags: [userPrompt.tone, 'meme', 'solana']
  };
  
  console.log('OK Responding with:', token);
  
  // Send response
  res.json({
    status: 'preview',
    message: 'Token preview ready (minimal server)',
    trendConfidence: 85,
    narrative: {
      verdict: 'hot',
      reasoning: 'Minimal server - no validation'
    },
    token: token
  });
});

// Launch endpoint - instant mock response
app.post('/api/agent/launch', (req, res) => {
  console.log('OK Launch endpoint hit');
  console.log('Body:', JSON.stringify(req.body, null, 2));
  
  res.json({
    status: 'mock_success',
    message: 'Mock launch response',
    token: {
      name: 'Mock Token',
      symbol: 'MOCK',
      mint: 'MockMintAddress123',
      tx: 'MockTxSignature123'
    }
  });
});

// Catch all
app.use((req, res) => {
  console.log('FAIL 404:', req.url);
  res.status(404).json({
    status: 'error',
    message: 'Endpoint not found',
    url: req.url
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('FAIL Error:', err);
  res.status(500).json({
    status: 'error',
    message: err.message
  });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log('\nOK Minimal server running');
  console.log(`   http://localhost:${PORT}\n`);
  console.log('Endpoints:');
  console.log('   GET  /api/health');
  console.log('   POST /api/agent/debug');
  console.log('   POST /api/agent/launch\n');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down...');
  process.exit(0);
});
