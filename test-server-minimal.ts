#!/usr/bin/env bun
/**
 * Minimal test server to verify port is listening
 */

import { createServer } from 'http';

const server = createServer((req, res) => {
  console.log(`[TEST] ${req.method} ${req.url}`);
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ status: 'ok', message: 'Test server is working!' }));
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`✅ Test server listening on http://localhost:${PORT}`);
});

server.on('error', (err) => {
  console.error('❌ Server error:', err);
  process.exit(1);
});
