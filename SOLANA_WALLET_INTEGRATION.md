# Solana Wallet Integration Guide

## Overview

To enable the Solana plugin to check wallet balances, you must pass the user's wallet public key through the API request to ElizaOS.

## Frontend Implementation

### Step 1: Connect Phantom Wallet

```typescript
// Frontend: Connect to Phantom wallet
async function connectWallet() {
  if (!window.solana) {
    alert('Please install Phantom wallet');
    return;
  }
  
  const resp = await window.solana.connect();
  const publicKey = resp.publicKey.toString();
  
  // Store in state or session
  sessionStorage.setItem('walletPublicKey', publicKey);
  
  return publicKey;
}
```

### Step 2: Send API Request with Wallet Public Key

```typescript
// Frontend: Send message with wallet context
async function sendChatMessage(message: string) {
  const walletPublicKey = sessionStorage.getItem('walletPublicKey');
  
  const response = await fetch('http://localhost:3000/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sessionId: walletPublicKey || 'guest-session',
      walletPublicKey: walletPublicKey, // IMPORTANT: Pass the wallet public key
      message: message
    }),
  });
  
  const data = await response.json();
  return data;
}
```

## Backend Implementation

The ElizaOS server automatically handles API requests through its built-in HTTP server.

When the client sends a POST request to `/api/chat`, it should include:

```json
{
  "sessionId": "user-session-id",
  "walletPublicKey": "SolanaPublicKeyHere",
  "message": "Check my wallet balance"
}
```

The ElizaOS server will:
1. ✅ Receive the request
2. ✅ Extract `walletPublicKey` from the body
3. ✅ Pass it to the agent via context
4. ✅ Agent reads the prompt instruction to use `walletPublicKey`
5. ✅ Agent calls `GET_BALANCE` with the wallet key
6. ✅ Plugin returns real balance data
7. ✅ Response sent back to client

## Character Prompt Update

The character system prompt has been updated to:
- Read `walletPublicKey` from the request context
- Use it directly in Solana plugin tool calls
- NOT ask the user to provide the wallet if it's already in context

```typescript
system: `You are Shina...
The user's wallet public key is available in the request context as "walletPublicKey".
When the user asks about THEIR wallet balance, you MUST call GET_BALANCE with their walletPublicKey.
Do NOT ask for the wallet if it's already provided in context.`
```

## Example Chat Flow

**User Request:**
```json
{
  "sessionId": "session123",
  "walletPublicKey": "ExampleSolanaPublicKey123",
  "message": "Check my wallet balance"
}
```

**Agent Response:**
```
[TOOL_CALL: GET_BALANCE with args: {"wallet": "ExampleSolanaPublicKey123"}]

Your wallet has 2.45 SOL
```

## Environment Setup

Make sure your `.env` file has:

```
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
```

## Testing

1. Start ElizaOS:
```bash
npm run build && elizaos start
```

2. Open browser: http://localhost:3000

3. Connect Phantom wallet (if using the UI)

4. Ask: "Check my wallet balance"

5. Agent should call the Solana plugin and return real balance

## Important Notes

⚠️ **Never store private keys** - Only pass public keys in the request  
⚠️ **Wallet public key must come from client** - Do not hardcode in backend  
⚠️ **Use HTTPS in production** - Never send keys over unencrypted HTTP  
✅ **Context is per-request** - Each request has its own isolated context  
✅ **Multi-user safe** - Different users can have different wallets in different requests
