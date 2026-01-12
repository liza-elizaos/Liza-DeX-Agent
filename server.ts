#!/usr/bin/env bun
import { createServer } from 'http';
import { parse as parseUrl } from 'url';
import { join } from 'path';
import { readFile } from 'fs/promises';
import { Connection, PublicKey } from '@solana/web3.js';

// Use dynamic imports to load the handlers
async function loadHandlers() {
  const chatModule = await import('./api/chat.ts');
  const balanceModule = await import('./api/balance.ts');
  const swapModule = await import('./api/swap.ts');
  const walletModule = await import('./api/wallet-connect.ts');
  
  return {
    chatHandler: chatModule.default,
    balanceHandler: balanceModule.default,
    swapHandler: swapModule.default,
    walletHandler: walletModule.default,
  };
}

const PORT = parseInt(process.env.PORT || '3000', 10);
let handlers: any = null;

// Create HTTP server
const server = createServer(async (req, res) => {
  const parsedUrl = parseUrl(req.url || '', true);
  const pathname = parsedUrl.pathname || '';

  // Set CORS headers for all responses
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Parse JSON body for all requests
  let body = '';
  let dataTimeout: any;
  
  req.on('data', (chunk: Buffer) => {
    body += chunk.toString();
    
    // Reset timeout on each data chunk
    if (dataTimeout) clearTimeout(dataTimeout);
    dataTimeout = setTimeout(() => {
      console.warn(`[SERVER] Request timeout for ${pathname}`);
      if (!res.headersSent) {
        res.writeHead(408, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Request timeout' }));
      }
    }, 5000); // 5 second timeout
  });

  req.on('end', async () => {
    if (dataTimeout) clearTimeout(dataTimeout);
    console.log(`[SERVER] Received ${req.method} ${pathname}`);
    try {
      // Parse request body if present
      if (body) {
        try {
          const parsedBody = JSON.parse(body);
          (req as any).body = parsedBody;
        } catch (e) {
          (req as any).body = {};
        }
      } else {
        (req as any).body = {};
      }

      // Create a res wrapper that matches Vercel's format
      let statusCode = 200;
      let headersSent = false;
      
      const vercelRes = {
        statusCode,
        status: (code: number) => {
          statusCode = code;
          return vercelRes;
        },
        json: (data: any) => {
          if (!headersSent) {
            res.writeHead(statusCode, { 'Content-Type': 'application/json' });
            headersSent = true;
          }
          res.end(JSON.stringify(data));
        },
        end: (data?: any) => {
          if (!headersSent) {
            res.writeHead(statusCode);
            headersSent = true;
          }
          if (data) {
            res.end(data);
          } else {
            res.end();
          }
        },
        send: (data: any) => {
          if (!headersSent) {
            res.writeHead(statusCode, { 'Content-Type': 'application/json' });
            headersSent = true;
          }
          res.end(typeof data === 'string' ? data : JSON.stringify(data));
        },
        setHeader: (key: string, value: string) => {
          if (!headersSent) {
            res.setHeader(key, value);
          }
          return vercelRes;
        },
        write: (data: any) => {
          if (!headersSent) {
            res.writeHead(statusCode);
            headersSent = true;
          }
          res.write(data);
          return vercelRes;
        },
        get headersSent() {
          return headersSent;
        },
        get headers() {
          return {};
        },
        _res: res,
      } as any;

      // Load handlers on first request
      if (!handlers) {
        handlers = await loadHandlers();
        console.log('[SERVER] Handlers loaded');
      }

      // Route API requests
      if (pathname === '/model/balance') {
        await handlers.balanceHandler(req as any, vercelRes);
      } else if (pathname === '/model/chat') {
        await handlers.chatHandler(req as any, vercelRes);
      } else if (pathname === '/model/swap') {
        await handlers.swapHandler(req as any, vercelRes);
      } else if (pathname === '/model/wallet-connect') {
        await handlers.walletHandler(req as any, vercelRes);
      } else if (pathname === '/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }));
      } else if (pathname === '/') {
        // Serve index.html
        try {
          const content = await readFile(join('dist', 'frontend', 'index.html'), 'utf-8');
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(content);
        } catch {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Frontend not found. Run: npm run build' }));
        }
      } else {
        // Try to serve static files from dist/frontend
        try {
          let filePath = pathname === '/' ? join('dist', 'frontend', 'index.html') : join('dist', 'frontend', pathname.replace(/^\//, ''));
          const content = await readFile(filePath, 'utf-8');
          const contentType = filePath.endsWith('.js') ? 'application/javascript' :
                             filePath.endsWith('.css') ? 'text/css' :
                             filePath.endsWith('.html') ? 'text/html' :
                             filePath.endsWith('.json') ? 'application/json' :
                             'application/octet-stream';
          res.writeHead(200, { 'Content-Type': contentType });
          res.end(content);
        } catch {
          // Fallback to index.html for SPA routing
          try {
            const content = await readFile(join('dist', 'frontend', 'index.html'), 'utf-8');
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(content);
          } catch {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Not found' }));
          }
        }
      }
    } catch (error) {
      console.error('[SERVER] Request error:', error);
      if (!res.headersSent) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
      }
      res.end(JSON.stringify({
        error: 'Internal server error',
        details: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      }));
    }
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📡 API endpoints:`);
  console.log(`   POST http://localhost:${PORT}/api/chat`);
  console.log(`   POST http://localhost:${PORT}/api/balance`);
  console.log(`   POST http://localhost:${PORT}/api/swap`);
  console.log(`   POST http://localhost:${PORT}/api/wallet-connect`);
  console.log(`🌐 Frontend: http://localhost:${PORT}`);
});

server.on('error', (error: Error) => {
  console.error('[SERVER] Error:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('[SERVER] Unhandled Rejection:', reason, promise);
});
