import { Request, Response } from 'express';
import { launchToken, createTokenMetadata, uploadToPumpIPFS } from '../services/pumpfun.js';

// 🚀 SIMPLE VERSION - NO EXTERNAL APIs for debug
// Full launch uses pumpfun service

export async function handleDebugLaunch(req: Request, res: Response) {
  console.log('\n[DEBUG] === SIMPLE DEBUG (No APIs) ===\n');
  
  try {
    const { userPrompt, override } = req.body;
    
    console.log('[DEBUG] Received prompt:', JSON.stringify(userPrompt, null, 2));
    
    // Generate token instantly from user input
    const tokenName = (userPrompt.idea || 'Test Token').substring(0, 20);
    const tokenSymbol = (userPrompt.symbolHint || 'TEST').toUpperCase().substring(0, 5);
    const tokenLore = `${userPrompt.idea}. ${userPrompt.tone} energy. Built on Solana.`;
    
    console.log('[DEBUG] Generated token:', {
      name: tokenName,
      symbol: tokenSymbol,
      lore: tokenLore
    });
    
    console.log('\n[DEBUG] === DEBUG COMPLETE (instant) ===\n');
    
    // Return immediately
    return res.json({
      status: 'preview',
      message: 'Token preview ready (debug mode - no external APIs)',
      mode: 'simple',
      trendConfidence: 85,
      narrative: {
        verdict: 'hot',
        reasoning: 'Debug mode - external validation skipped'
      },
      token: {
        name: tokenName,
        symbol: tokenSymbol,
        lore: tokenLore,
        tags: [userPrompt.tone, 'meme', 'solana']
      },
      nextStep: 'Use /api/agent/launch with image to actually create token'
    });
    
  } catch (error: any) {
    console.error('[DEBUG] Error:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
}

export async function handleFullLaunch(req: Request, res: Response) {
  console.log('\n[LAUNCH] === REAL TOKEN LAUNCH ===\n');
  
  try {
    const tokenName = (req.body.tokenName || 'Token').substring(0, 20);
    const tokenSymbol = (req.body.symbol || 'TKN').toUpperCase().substring(0, 5);
    const tokenDescription = req.body.tone || 'Launched on Solana via Shina AI';
    
    console.log('[LAUNCH] Token Name:', tokenName);
    console.log('[LAUNCH] Token Symbol:', tokenSymbol);
    console.log('[LAUNCH] Description:', tokenDescription);
    
    // Create metadata
    console.log('[LAUNCH] Creating token metadata...');
    const metadata = await createTokenMetadata(tokenName, tokenSymbol, tokenDescription);
    
    // Skip IPFS upload - use placeholder URI
    const metadataUri = `https://api.pump.fun/metadata/${tokenSymbol}`;
    console.log('[LAUNCH] Using metadata URI:', metadataUri);
    
    // Launch config
    const config = {
      devBuySol: 0.01,
      slippage: 10,
      priorityFee: 0.0005,
      pool: 'pump' as const
    };
    
    console.log('[LAUNCH] Launching with config:', config);
    console.log('[LAUNCH] Calling launchToken...');
    
    const result = await launchToken(metadata, metadataUri, config);
    
    console.log('[LAUNCH] Launch result:', result);
    
    if (result.success && result.mint && result.tx) {
      console.log('[LAUNCH] ✅ SUCCESS - Token launched!');
      return res.json({
        status: 'success',
        message: result.message || 'Token launched successfully!',
        token: {
          name: tokenName,
          symbol: tokenSymbol,
          mint: result.mint,
          tx: result.tx,
          explorer: `https://solscan.io/token/${result.mint}`,
          pumpfun: `https://pump.fun/coin/${result.mint}`
        }
      });
    } else {
      console.log('[LAUNCH] ❌ Launch failed - No mint/tx returned');
      throw new Error(result.message || 'Launch failed - no mint address returned');
    }
    
  } catch (error: any) {
    console.error('[LAUNCH] ❌ Caught error:', error.message || error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Launch failed',
      details: error.toString()
    });
  }
}
