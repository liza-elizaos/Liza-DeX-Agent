#!/usr/bin/env bun
/**
 * LIZA Server
 * Bun-native HTTP server for token swaps
 */

import { parse as parseUrl } from 'url';
import { join } from 'path';
import { readFile } from 'fs/promises';
import { Connection, PublicKey } from '@solana/web3.js';

console.log(`🚀 Starting LIZA Server...`);

// Use dynamic imports to load the handlers
async function loadHandlers() {
  const chatModule = await import('./api/chat.ts');
  const balanceModule = await import('./api/balance.ts');
  
  return {
    chatHandler: chatModule.default,
    balanceHandler: balanceModule.default,
  };
}

// Request handler
async function handleRequest(req: Request): Promise<Response> {
  const url = new URL(req.url, `http://${req.headers.get('host')}`);
  const pathname = url.pathname;
  
  console.log(`[SERVER] Received ${req.method} ${pathname}`);
  
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, DELETE',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
  
  // Handle OPTIONS
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }
  
  // Load handlers
  let handlers: any;
  try {
    handlers = await loadHandlers();
  } catch (err) {
    console.error('[SERVER] Failed to load handlers:', err);
    return new Response(
      JSON.stringify({ error: 'Failed to load handlers' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
  
  // Route handling
  if (pathname === '/api/chat' && req.method === 'POST') {
    try {
      const body = await req.json();
      console.log('[CHAT] Request:', body);
      
      const response = await handlers.chatHandler({
        body,
        headers: req.headers,
      }, {
        setHeader: () => {},
        end: () => {},
        statusCode: 200,
      });
      
      return new Response(
        JSON.stringify(response),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (err) {
      console.error('[SERVER] Chat error:', err);
      return new Response(
        JSON.stringify({ error: err instanceof Error ? err.message : 'Unknown error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  }
  
  if (pathname === '/api/balance' && req.method === 'POST') {
    try {
      const body = await req.json();
      const response = await handlers.balanceHandler({
        body,
        headers: req.headers,
      }, {
        setHeader: () => {},
        end: () => {},
        statusCode: 200,
      });
      
      return new Response(
        JSON.stringify(response),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (err) {
      console.error('[SERVER] Balance error:', err);
      return new Response(
        JSON.stringify({ error: err instanceof Error ? err.message : 'Unknown error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  }
  
  // Socket.io polling bypass
  if (pathname.includes('socket.io')) {
    return new Response(null, { status: 404, headers: corsHeaders });
  }
  
  // Static files
  if (pathname === '/' || pathname === '') {
    return new Response(
      `<html><body><h1>🚀 LIZA Server Running</h1><p>API: /api/chat</p></body></html>`,
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'text/html' } }
    );
  }
  
  return new Response(
    JSON.stringify({ error: 'Not found' }),
    { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

// Start server
const port = process.env.PORT || 3000;
const server = Bun.serve({
  port,
  async fetch(req) {
    try {
      return await handleRequest(req);
    } catch (err) {
      console.error('[SERVER] Error:', err);
      return new Response(
        JSON.stringify({ error: 'Internal server error' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
  },
});

console.log(`✅ Server running on http://localhost:${port}`);
console.log(`📡 API endpoints:`);
console.log(`   POST http://localhost:${port}/api/chat`);
console.log(`   POST http://localhost:${port}/api/balance`);
