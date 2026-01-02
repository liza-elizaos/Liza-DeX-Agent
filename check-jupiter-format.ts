#!/usr/bin/env bun
/**
 * Check what Jupiter API actually returns
 */

const WALLET = 'CMVrzdso4SShQm2irrc7jMCN9Vw5QxXvrZKB79cYPPJT';
const JUPITER_KEY = 'cd72422b-136c-4951-a00f-9fb904e14acf';
const WSOL = 'So11111111111111111111111111111111111111112';
const USDC = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';

console.log(`Fetching Jupiter quote...`);

// Get quote first
const quoteParams = new URLSearchParams({
  inputMint: WSOL,
  outputMint: USDC,
  amount: '1000000',
  slippageBps: '50',
});

const quoteUrl = `https://api.jup.ag/swap/v1/quote?${quoteParams.toString()}`;

const quoteResponse = await fetch(quoteUrl, {
  headers: {
    'Accept': 'application/json',
    'x-api-key': JUPITER_KEY,
  }
});

const quote = await quoteResponse.json();
console.log(`Quote received:`, JSON.stringify(quote, null, 2).substring(0, 500));

// Now get swap instructions
console.log(`\n\nFetching swap instructions...`);

const swapUrl = `https://api.jup.ag/swap/v1/swap`;

const swapResponse = await fetch(swapUrl, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'x-api-key': JUPITER_KEY,
  },
  body: JSON.stringify({
    quoteResponse: quote,
    userPublicKey: WALLET,
    wrapUnwrapSOL: true,
    dynamicComputeUnitLimit: true,
  }),
});

const swapData = await swapResponse.json();
console.log(`\nSwap Instructions Response:`, JSON.stringify(swapData, null, 2));
