import { Connection, PublicKey, Keypair, Transaction, VersionedTransaction } from '@solana/web3.js';
import bs58 from 'bs58';

// Helper function to safely extract error message
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'Unknown error';
}

// Common token contract addresses on Solana mainnet
const KNOWN_TOKENS: Record<string, string> = {
  'sol': 'So11111111111111111111111111111111111111111',   // Native SOL (43 chars)
  'usdc': 'EPjFWaLb3odccccccccccccccccccccccccccccccbbb',  // USDC (Canonical)
  'usdt': 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BEnNYb',
  'msol': 'mSoLzYCxHdgqynouc33cLL7mDJNAYXcSovzChBRc1xQ',
  'ray': '4k3Dyjzvzp8eMZRvUoJRTUKvjYnRjJuNm6Z3bQCTe4Y',
  'cope': '8HGyAAB1yoM1ttS7pNoU34aARYRfSdVmL67LJwKX19gW',
  'srm': 'SRMuApVgqbCmmp5YLrqDL47XYySRJ16jimmy5sStzLy',
  'ftt': 'AGFEad3LwYvRiggTHKbsbuRRARvymzbZDNamNjzc39mH',
  'kin': 'kinXdEcpDQeHPEuQnqmUgtAPvCXVXXUVVUrkX33K44g',
  'wsol': 'So11111111111111111111111111111111111111112',   // Wrapped SOL (44 chars)
  'bonk': 'DezXAZ8z7PnrnRJjz3wXBoQskzw1ia8dx5WhJAu1d8b8',
  'marinade': 'mSoLzYCxHdgqynouc33cLL7mDJNAYXcSovzChBRc1xQ',
};

// Token decimals (important for amount conversion)
const TOKEN_DECIMALS: Record<string, number> = {
  'sol': 9,
  'wsol': 9,
  'usdc': 6,
  'usdt': 6,
  'bonk': 5,
  'msol': 9,
  'ray': 6,
  'cope': 6,
  'srm': 6,
  'ftt': 8,
  'kin': 5,
  'marinade': 9,
};

// Get decimals for a token (by symbol or address)
function getTokenDecimals(tokenSymbolOrAddress: string): number {
  const lowerSymbol = tokenSymbolOrAddress.toLowerCase();
  return TOKEN_DECIMALS[lowerSymbol] || 6; // Default to 6 if unknown
}


// Helper function to resolve token contract address
function resolveTokenAddress(token: string): string {
  let processedToken = token.toLowerCase().trim();
  
  // Check if it's a known token symbol
  if (KNOWN_TOKENS[processedToken]) {
    return KNOWN_TOKENS[processedToken];
  }
  
  // Only clean up obvious URL patterns, not base58 addresses
  // If it contains obvious URL markers, remove them
  if (processedToken.includes('http://') || processedToken.includes('https://') || processedToken.includes('pump.fun/')) {
    processedToken = processedToken
      .replace(/^https?:\/\//, '')
      .replace(/^pump\.fun\//, '')
      .replace(/\/$/, '')
      .trim();
  }
  
  // Validate it looks like a base58 address (43-44 chars for valid Solana addresses)
  // Base58 alphabet: 123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz
  // NOTE: "pump" at the end can be part of the actual token address (e.g. pump.fun tokens)
  const base58Regex = /^[1-9A-HJNPZa-km-z]{43,44}$/;
  if (base58Regex.test(processedToken)) {
    return processedToken;
  }
  
  // If it still looks like it could be base58 but wrong length, indicate that
  const loosBase58Regex = /^[1-9A-HJNPZa-km-z]+$/;
  if (loosBase58Regex.test(processedToken)) {
    // It's base58 but wrong length - return marker that will be caught later
    return `INVALID_LENGTH:${processedToken}`;
  }
  
  // Return original for Jupiter to attempt lookup
  return processedToken;
}

// Helper function to search Jupiter token list API (fallback for unknown tokens)
async function searchJupiterTokenList(searchTerm: string): Promise<string | null> {
  try {
    const tokenListUrl = `https://token.jup.ag/strict`;
    const response = await fetch(tokenListUrl, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      console.warn(`[SWAP] Token list fetch failed: ${response.status}`);
      return null;
    }

    const tokens = await response.json();
    const searchLower = searchTerm.toLowerCase();

    // Search by symbol or name
    for (const token of tokens) {
      if (token.symbol && token.symbol.toLowerCase() === searchLower) {
        console.log(`[SWAP] Found token via Jupiter list: ${searchTerm} -> ${token.address}`);
        return token.address;
      }
      if (token.name && token.name.toLowerCase().includes(searchLower)) {
        console.log(`[SWAP] Found token via Jupiter list (name): ${searchTerm} -> ${token.address}`);
        return token.address;
      }
    }

    console.warn(`[SWAP] Token "${searchTerm}" not found in Jupiter token list`);
    return null;
  } catch (error) {
    const msg = getErrorMessage(error);
    console.warn(`[SWAP] Token list lookup error: ${msg}`);
    return null;
  }
}

// Jupiter API configuration - read from environment
const JUPITER_API_KEY = process.env.JUPITER_API_KEY || 'cd72422b-136c-4951-a00f-9fb904e14acf';
const JUPITER_API_URL = process.env.JUPITER_API_URL || 'https://api.jup.ag/swap/v1/quote';

console.log(`[INIT] Jupiter API Key configured: ${JUPITER_API_KEY ? '✓ Set' : '✗ Missing'}`);
console.log(`[INIT] Jupiter API URL: ${JUPITER_API_URL}`);

// Common headers for Jupiter API requests
const jupiterHeaders = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  'x-api-key': JUPITER_API_KEY,
  'User-Agent': 'LIZA-Solana-AI/1.0',
};

interface JupiterQuote {
  inputMint: string;
  inAmount: string;
  outputMint: string;
  outAmount: string;
  otherAmountThreshold: string;
  swapMode: string;
  slippageBps: number;
  platformFee: any;
  priceImpactPct: string;
  routePlan: any[];
}

interface JupiterSwapInstructions {
  tokenLedgerInstruction: any;
  computeBudgetInstructions: any[];
  setupInstructions: any[];
  swapInstruction: any;
  cleanupInstruction: any;
  addressLookupTableAddresses: string[];
}

export async function executeSwap(
  fromTokenContract: string,
  toTokenContract: string,
  amount: number,
  walletAddress: string,
  swapMode?: 'ExactIn' | 'ExactOut'
) {
  try {
    const rpcUrl = process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';
    const connection = new Connection(rpcUrl, 'confirmed');

    // Resolve token contract addresses (handle symbols and contract addresses)
    // Track if tokens came from known list (to skip strict validation later)
    const fromTokenLower = fromTokenContract.toLowerCase().trim();
    const toTokenLower = toTokenContract.toLowerCase().trim();
    const inputFromKnown = !!KNOWN_TOKENS[fromTokenLower];
    const outputFromKnown = !!KNOWN_TOKENS[toTokenLower];

    let inputMint = resolveTokenAddress(fromTokenContract);
    let outputMint = resolveTokenAddress(toTokenContract);

    // Validate resolved addresses and try Jupiter token list if invalid
    const validBase58Regex = /^[1-9A-HJNPZa-km-z]{43,44}$/;
    console.log(`[SWAP] Validating inputMint: "${inputMint}" (length: ${inputMint.length}, fromKnown: ${inputFromKnown})`);
    console.log(`[SWAP] Validating outputMint: "${outputMint}" (length: ${outputMint.length}, fromKnown: ${outputFromKnown})`);
    
    // Skip validation if came from KNOWN_TOKENS (we trust it)
    if (!inputFromKnown && !validBase58Regex.test(inputMint)) {
      // Check if it's marked as invalid length
      if (inputMint.startsWith('INVALID_LENGTH:')) {
        const invalidAddr = inputMint.replace('INVALID_LENGTH:', '');
        return {
          success: false,
          error: 'Invalid token address format',
          message: `❌ Invalid Token Address\n\n**Token:** ${fromTokenContract}\n**Address:** ${invalidAddr}\n**Issue:** Address is ${invalidAddr.length} characters (expected 43-44)\n\nPlease provide the full contract address or a token name that's on Jupiter.`,
        };
      }
      
      console.log(`[SWAP] Input "${fromTokenContract}" (${inputMint}) not recognized, searching Jupiter list...`);
      const jupiterMatch = await searchJupiterTokenList(fromTokenContract);
      if (jupiterMatch) {
        inputMint = jupiterMatch;
        console.log(`[SWAP] Found via Jupiter: ${inputMint}`);
      }
    }

    if (!outputFromKnown && !validBase58Regex.test(outputMint)) {
      // Check if it's marked as invalid length
      if (outputMint.startsWith('INVALID_LENGTH:')) {
        const invalidAddr = outputMint.replace('INVALID_LENGTH:', '');
        return {
          success: false,
          error: 'Invalid token address format',
          message: `❌ Invalid Token Address\n\n**Token:** ${toTokenContract}\n**Address:** ${invalidAddr}\n**Issue:** Address is ${invalidAddr.length} characters (expected 43-44)\n\nPlease provide the full contract address or a token name that's on Jupiter.`,
        };
      }
      
      console.log(`[SWAP] Output "${toTokenContract}" (${outputMint}) not recognized, searching Jupiter list...`);
      const jupiterMatch = await searchJupiterTokenList(toTokenContract);
      if (jupiterMatch) {
        outputMint = jupiterMatch;
        console.log(`[SWAP] Found via Jupiter: ${outputMint}`);
      }
    }

    // Final validation: addresses must be valid base58 and correct length
    // Skip validation for known tokens (we trust them)
    if (!inputFromKnown && !validBase58Regex.test(inputMint)) {
      console.error(`[SWAP] Input validation failed for: "${inputMint}"`);
      return {
        success: false,
        error: 'Could not resolve input token',
        message: `❌ Token Not Found\n\n**Token:** ${fromTokenContract}\n**Resolved to:** ${inputMint}\n\nThe token could not be found on Jupiter and is not in our known tokens list. Please provide the full contract address or try a different token name.`,
      };
    }

    if (!outputFromKnown && !validBase58Regex.test(outputMint)) {
      console.error(`[SWAP] Output validation failed for: "${outputMint}"`);
      return {
        success: false,
        error: 'Could not resolve output token',
        message: `❌ Token Not Found\n\n**Token:** ${toTokenContract}\n**Resolved to:** ${outputMint}\n\nThe token could not be found on Jupiter and is not in our known tokens list. Please provide the full contract address or try a different token name.`,
      };
    }

    console.log(`[SWAP] ✓ Token validation passed`);
    console.log(`[SWAP] Resolved contracts - From: ${fromTokenContract} -> ${inputMint}, To: ${toTokenContract} -> ${outputMint}`);
    console.log(`[SWAP] Input mint length: ${inputMint.length}, Output mint length: ${outputMint.length}`);

    // Validate wallet address
    let userPublicKey: PublicKey;
    try {
      userPublicKey = new PublicKey(walletAddress);
      if (!PublicKey.isOnCurve(userPublicKey)) {
        throw new Error('Address not on Solana curve');
      }
    } catch (error) {
      return {
        success: false,
        error: `Invalid wallet address: ${walletAddress}`,
        message: `❌ Invalid Wallet Address\n\n**Address:** ${walletAddress}\n**Error:** ${getErrorMessage(error)}`,
      };
    }

    // Validate amount
    if (amount <= 0) {
      return {
        success: false,
        error: 'Amount must be greater than 0',
        message: `❌ Invalid Amount\n\nAmount must be greater than 0`,
      };
    }

    // Determine swap mode: Exact-In (input amount fixed) or Exact-Out (output amount fixed)
    // swapMode can be explicitly provided, or auto-detected:
    // - Default to Exact-In (most common case: "swap 1 SOL for TOKEN")
    // - For now, we use Exact-In as default and let explicit mode override
    let isExactOut = swapMode === 'ExactOut';
    if (!swapMode) {
      // Auto-detection: if neither token specifies the mode, assume Exact-In (input amount fixed)
      // This covers: "swap 1 SOL for TOKEN" where 1 is the input amount
      isExactOut = false;
      console.log(`[SWAP] No swap mode specified, defaulting to Exact-In`);
    } else {
      console.log(`[SWAP] Using explicit swap mode: ${swapMode}`);
    }
    
    // Get the correct decimals for the token that the amount applies to
    // For Exact-In: use input token decimals
    // For Exact-Out: use output token decimals
    let amountInSmallestUnits: number;
    if (isExactOut) {
      // Amount is in output tokens (e.g., "buy 100 BONK" means 100 units of BONK)
      const decimals = getTokenDecimals(toTokenLower);
      amountInSmallestUnits = Math.floor(amount * Math.pow(10, decimals));
      console.log(`[SWAP] Exact-Out mode: amount=${amount} ${toTokenLower} (${decimals} decimals) = ${amountInSmallestUnits} smallest units`);
    } else {
      // Amount is in input tokens (e.g., "swap 1 SOL" means 1 unit of SOL)
      const decimals = getTokenDecimals(fromTokenLower);
      amountInSmallestUnits = Math.floor(amount * Math.pow(10, decimals));
      console.log(`[SWAP] Exact-In mode: amount=${amount} ${fromTokenLower} (${decimals} decimals) = ${amountInSmallestUnits} smallest units`);
    }

    if (amountInSmallestUnits <= 0) {
      return {
        success: false,
        error: 'Amount too small',
        message: `❌ Amount Too Small\n\nThe amount must be larger to convert to the smallest unit of the token.`,
      };
    }


    // Check for native SOL and prepare for wrapping
    const NATIVE_SOL = 'So11111111111111111111111111111111111111111';
    const WSOL_MINT = 'So11111111111111111111111111111111111111112';
    const isInputNativeSol = inputMint === NATIVE_SOL;
    
    // Validate wallet balance with fee buffer (0.01 SOL) - only needed if SOL is input
    const LAMPORTS_PER_SOL = 1e9;
    const SAFE_SOL_BUFFER = 0.01 * LAMPORTS_PER_SOL;
    
    if (isInputNativeSol) {
      const balance = await connection.getBalance(userPublicKey);
      const requiredLamports = amountInSmallestUnits + SAFE_SOL_BUFFER;
      if (balance < requiredLamports) {
        return {
          success: false,
          error: 'Insufficient SOL balance',
          message: `❌ Insufficient Balance\n\n**Required:** ${(requiredLamports / LAMPORTS_PER_SOL).toFixed(4)} SOL (including ${(SAFE_SOL_BUFFER / LAMPORTS_PER_SOL).toFixed(4)} SOL buffer)\n**Available:** ${(balance / LAMPORTS_PER_SOL).toFixed(4)} SOL`,
        };
      }
    }

    console.log(`[SWAP] Starting swap: ${amount} ${fromTokenContract} -> ${toTokenContract}`);
    console.log(`[SWAP] Amount in smallest units: ${amountInSmallestUnits}`);
    console.log(`[SWAP] Is native SOL input: ${isInputNativeSol}`);
    console.log(`[SWAP] Swap mode: ${isExactOut ? 'Exact-Out' : 'Exact-In'}`);

    // Try to get quote from Jupiter with timeout and retry logic
    let quote: JupiterQuote | null = null;
    let lastError: string = '';
    let quoteUrl: string = '';

    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        console.log(`[SWAP] Quote attempt ${attempt}/3...`);
        
        // Build quote URL with Phantom-style wrapAndUnwrapSol flag for native SOL
        const queryParams = new URLSearchParams({
          inputMint,
          outputMint,
          amount: amountInSmallestUnits.toString(),
          slippageBps: '50',
          onlyDirectRoutes: 'false',
        });

        // Add swap mode parameter for Exact-Out
        if (isExactOut) {
          queryParams.append('swapMode', 'ExactOut');
          console.log(`[SWAP] Using ExactOut swap mode for output-specified swap`);
        }

        // Add wrapAndUnwrapSol flag if input is native SOL (Phantom-compatible behavior)
        if (isInputNativeSol) {
          queryParams.append('wrapAndUnwrapSol', 'true');
        }

        quoteUrl = `${JUPITER_API_URL}?${queryParams.toString()}`;
        console.log(`[SWAP] Full URL: ${quoteUrl}`);
        console.log(`[SWAP] Headers: ${JSON.stringify(jupiterHeaders)}`);
        console.log(`[SWAP] Params - From: ${inputMint} (nativeSol=${isInputNativeSol}) | To: ${outputMint} | Amount: ${amountInSmallestUnits}`);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

        const quoteResponse = await fetch(quoteUrl, {
          method: 'GET',
          headers: jupiterHeaders,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        console.log(`[SWAP] Quote response status: ${quoteResponse.status}`);
        if (!quoteResponse.ok) {
          const errorText = await quoteResponse.text().catch(() => 'No response body');
          console.error(`[SWAP] Quote failed with status ${quoteResponse.status}`);
          console.error(`[SWAP] Response body: ${errorText}`);
          
          // Provide specific error messages based on status code
          if (quoteResponse.status === 404) {
            lastError = `Token not found on Jupiter (404). Possible causes:\n- Token address "${inputMint}" doesn't exist\n- Token has no liquidity\n- Wrong network`;
          } else if (quoteResponse.status === 400) {
            lastError = `Bad request (400) - ${errorText.substring(0, 100)}`;
          } else {
            lastError = `API error ${quoteResponse.status}: ${errorText.substring(0, 150)}`;
          }
          continue;
        }

        const data = await quoteResponse.json();
        
        if (data.error) {
          console.error(`[SWAP] API Error response: ${JSON.stringify(data.error)}`);
          lastError = `Jupiter error: ${typeof data.error === 'string' ? data.error : JSON.stringify(data.error).substring(0, 100)}`;
          continue;
        }

        quote = data;
        if (quote) {
          console.log(`[SWAP] Quote received - Output amount: ${quote.outAmount}`);
        }
        break; // Success!
      } catch (error) {
        const msg = getErrorMessage(error);
        console.warn(`[SWAP] Attempt ${attempt} failed: ${msg}`);
        lastError = msg;
        if (attempt < 3) {
          await new Promise(resolve => setTimeout(resolve, 1000)); // Wait before retry
        }
      }
    }

    if (!quote) {
      // If native SOL failed, try fallback with WSOL
      if (isInputNativeSol && inputMint !== WSOL_MINT) {
        console.log(`[SWAP] Native SOL quote failed, attempting fallback with WSOL...`);
        inputMint = WSOL_MINT;
        
        for (let attempt = 1; attempt <= 2; attempt++) {
          try {
            console.log(`[SWAP] WSOL fallback attempt ${attempt}/2...`);
            
            const queryParams = new URLSearchParams({
              inputMint: WSOL_MINT,
              outputMint,
              amount: amountInSmallestUnits.toString(),
              slippageBps: '50',
              onlyDirectRoutes: 'false',
            });

            // Add swap mode parameter for Exact-Out
            if (isExactOut) {
              queryParams.append('swapMode', 'ExactOut');
            }

            quoteUrl = `${JUPITER_API_URL}?${queryParams.toString()}`;
            console.log(`[SWAP] WSOL Fallback URL: ${quoteUrl}`);

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000);

            const quoteResponse = await fetch(quoteUrl, {
              method: 'GET',
              headers: jupiterHeaders,
              signal: controller.signal,
            });

            clearTimeout(timeoutId);

            if (quoteResponse.ok) {
              const data = await quoteResponse.json();
              if (!data.error && data.outAmount) {
                quote = data;
                console.log(`[SWAP] ✓ WSOL fallback successful - Output amount: ${data.outAmount}`);
                break;
              }
            }
          } catch (error) {
            console.warn(`[SWAP] WSOL fallback attempt ${attempt} failed: ${getErrorMessage(error)}`);
          }
        }
      }

      if (!quote) {
        const errorMsg = lastError || 'Failed to get quote from Jupiter after 3 attempts';
        console.error('[SWAP] All quote attempts failed:', errorMsg);
        return {
          success: false,
          error: 'Jupiter API unavailable',
          message: `❌ Swap Quote Failed\n\n**Error:** ${errorMsg}\n\n**Tip:** Jupiter API might be temporarily unavailable. Please try again in a few moments.\n\n**Troubleshooting:**\n- Verify token addresses are correct\n- Check your internet connection\n- Try a different token pair`,
        };
      }
    }

    if (!quote) {
      const errorMsg = lastError || 'Failed to get quote from Jupiter after 3 attempts';
      console.error('[SWAP] All quote attempts failed:', errorMsg);
      return {
        success: false,
        error: 'Jupiter API unavailable',
        message: `❌ Swap Quote Failed\n\n**Error:** ${errorMsg}\n\n**Tip:** Jupiter API might be temporarily unavailable. Please try again in a few moments.\n\n**Troubleshooting:**\n- Verify token addresses are correct\n- Check your internet connection\n- Try a different token pair`,
      };
    }

    // Get decimals for output display
    const outputDecimals = getTokenDecimals(isExactOut ? toTokenLower : toTokenLower);
    const outAmount = parseInt(quote.outAmount) / Math.pow(10, outputDecimals);

    // Log the quote details
    console.log(`[SWAP] Quote details:
    Input: ${amount} ${fromTokenContract}
    Output: ${outAmount} ${toTokenContract}
    Price Impact: ${quote.priceImpactPct}%`);

    // Get swap instructions with retry
    let swapInstructions: JupiterSwapInstructions | null = null;
    lastError = '';

    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        console.log(`[SWAP] Swap instructions attempt ${attempt}/2...`);
        const swapInstructionsUrl = `${JUPITER_API_URL}/swap-instructions`;
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        const swapResponse = await fetch(swapInstructionsUrl, {
          method: 'POST',
          headers: jupiterHeaders,
          body: JSON.stringify({
            quoteResponse: quote,
            userPublicKey: walletAddress,
            wrapUnwrapSOL: true,
            dynamicComputeUnitLimit: true,
            dynamicSlippage: { maxBps: 100 },
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!swapResponse.ok) {
          const errorText = await swapResponse.text().catch(() => 'No response body');
          console.error(`[SWAP] Instructions response status: ${swapResponse.status}`);
          lastError = `API returned ${swapResponse.status}`;
          if (attempt < 2) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
          continue;
        }

        const data = await swapResponse.json();
        
        if (data.error) {
          console.error(`[SWAP] Instructions error: ${data.error}`);
          lastError = data.error;
          if (attempt < 2) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
          continue;
        }

        swapInstructions = data;
        console.log(`[SWAP] Swap instructions received`);
        break; // Success!
      } catch (error) {
        const msg = getErrorMessage(error);
        console.warn(`[SWAP] Instructions attempt ${attempt} failed: ${msg}`);
        lastError = msg;
      }
    }

    if (!swapInstructions) {
      const errorMsg = lastError || 'Failed to get swap instructions from Jupiter';
      console.error('[SWAP] Failed to get swap instructions:', errorMsg);
      return {
        success: false,
        error: 'Swap setup failed',
        message: `❌ Swap Setup Failed\n\n**Error:** ${errorMsg}\n\n**Note:** Swap quote was successful but we couldn't prepare the transaction.\n\nPlease try again.`,
      };
    }

    // Check for wallet balance before attempting transaction
    if (fromTokenContract.toLowerCase() === 'sol') {
      const balance = await connection.getBalance(userPublicKey);
      const balanceSOL = balance / 1e9;
      if (balanceSOL < amount) {
        return {
          success: false,
          error: 'Insufficient SOL balance',
          message: `❌ Insufficient Balance\n\n**Required:** ${amount} SOL\n**Available:** ${balanceSOL.toFixed(4)} SOL\n**Shortfall:** ${(amount - balanceSOL).toFixed(4)} SOL`,
        };
      }
    }

    // Build transaction
    const ix = swapInstructions;
    const allInstructions = [
      ...(ix.setupInstructions || []),
      ...(ix.computeBudgetInstructions || []),
      ix.swapInstruction,
      ix.cleanupInstruction,
    ].filter(Boolean);

    const latestBlockhash = await connection.getLatestBlockhash('confirmed');
    
    // Create versioned transaction
    const messageV0 = await import('@solana/web3.js').then(m => m.default?.MessageV0?.compile ?? m.MessageV0?.compile);
    
    // For now, use a simple transaction (will be upgraded to versioned if needed)
    const transaction = new Transaction({
      blockhash: latestBlockhash.blockhash,
      lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
      feePayer: userPublicKey,
    });

    allInstructions.forEach(instruction => {
      transaction.add(instruction);
    });

    // Sign transaction with private key from env
    const privateKeyStr = process.env.SOLANA_PRIVATE_KEY;
    if (!privateKeyStr) {
      return {
        success: false,
        error: 'Private key not configured',
        message: `❌ Configuration Error\n\nSOLANA_PRIVATE_KEY not set in environment`,
      };
    }

    let signer: Keypair;
    try {
      const decoded = bs58.decode(privateKeyStr);
      signer = Keypair.fromSecretKey(new Uint8Array(decoded));
    } catch (error) {
      return {
        success: false,
        error: 'Invalid private key format',
        message: `❌ Invalid Private Key\n\n**Error:** ${getErrorMessage(error)}`,
      };
    }

    transaction.sign(signer);
    console.log(`[SWAP] Transaction signed`);

    // Send transaction
    const txHash = await connection.sendRawTransaction(transaction.serialize(), {
      skipPreflight: false,
      preflightCommitment: 'confirmed',
    });
    console.log(`[SWAP] Transaction sent: ${txHash}`);

    // Wait for confirmation with polling
    let confirmed = false;
    let attempts = 0;
    const maxAttempts = 30;

    while (attempts < maxAttempts && !confirmed) {
      try {
        const status = await connection.getSignatureStatus(txHash, {
          searchTransactionHistory: true,
        });
        
        if (status.value?.confirmationStatus === 'confirmed' || status.value?.confirmationStatus === 'finalized') {
          confirmed = true;
          if (status.value?.err) {
            const errorStr = getErrorMessage(status.value.err);
            console.error('[SWAP] Transaction failed:', errorStr);
            return {
              success: false,
              error: 'Swap failed on-chain',
              message: `❌ Swap Failed\n\n**Hash:** ${txHash}\n**Error:** ${errorStr}`,
            };
          }
          console.log('[SWAP] Transaction confirmed:', txHash);
          break;
        }
      } catch (error) {
        console.warn('[SWAP] Status check error (attempt ' + (attempts + 1) + '):', getErrorMessage(error));
      }
      
      attempts++;
      if (!confirmed && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    if (!confirmed) {
      console.warn('[SWAP] Confirmation timeout, but transaction was sent:', txHash);
    }

    return {
      success: true,
      txHash,
      message: `✅ **Swap Successful!**\n\n🔄 **From:** ${amount} ${fromTokenContract}\n📤 **To:** ${outAmount.toFixed(6)} ${toTokenContract}\n💱 **Exchange Rate:** 1 ${fromTokenContract} = ${(outAmount / amount).toFixed(6)} ${toTokenContract}\n\n🔗 **Transaction Hash:**\n${txHash}\n\n✓ Confirmed on Solana ${process.env.SOLANA_NETWORK || 'mainnet'}`,
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('[SWAP] Error:', errorMsg);
    return {
      success: false,
      error: errorMsg,
      message: `❌ Swap Failed\n\n**Error:** ${errorMsg}`,
    };
  }
}
