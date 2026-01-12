import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';

interface PumpFunCreateParams {
  name: string;
  symbol: string;
  description: string;
  imagePath?: string;
  twitter?: string;
  telegram?: string;
  website?: string;
}

interface PumpFunCreateResult {
  success: boolean;
  mint?: string;
  transaction?: string;
  error?: string;
  message: string;
}

/**
 * Create a token using Pump.fun's free API
 * No SOL required - completely free!
 */
export async function createTokenViaPumpFun(
  params: PumpFunCreateParams
): Promise<PumpFunCreateResult> {
  try {
    console.log('[PUMPFUN] Creating token:', params.name);

    const apiKey = process.env.PUMPPORTAL_API_KEY;
    if (!apiKey) {
      throw new Error('PUMPPORTAL_API_KEY not set in environment');
    }

    const walletAddress = process.env.DEV_WALLET_ADDRESS;
    if (!walletAddress) {
      throw new Error('DEV_WALLET_ADDRESS not set in environment');
    }

    console.log('[PUMPFUN] Using API key and wallet address');

    // Step 1: Upload metadata to Pump.fun
    console.log('[PUMPFUN] Uploading metadata to Pump.fun IPFS...');

    const metadataForm = new FormData();
    metadataForm.append('name', params.name);
    metadataForm.append('symbol', params.symbol);
    metadataForm.append('description', params.description);
    metadataForm.append('showName', 'true');

    // Add image if provided
    if (params.imagePath && fs.existsSync(params.imagePath)) {
      console.log('[PUMPFUN] Adding image to metadata');
      metadataForm.append('image', fs.createReadStream(params.imagePath));
    }

    if (params.twitter) metadataForm.append('twitter', params.twitter);
    if (params.telegram) metadataForm.append('telegram', params.telegram);
    if (params.website) metadataForm.append('website', params.website);

    // Upload metadata
    let metadataUri: string;
    try {
      const metadataResponse = await axios.post(
        'https://pump.fun/api/ipfs',
        metadataForm,
        {
          headers: metadataForm.getHeaders(),
          timeout: 30000,
        }
      );

      console.log('[PUMPFUN] Metadata response status:', metadataResponse.status);
      console.log('[PUMPFUN] Metadata response data:', JSON.stringify(metadataResponse.data, null, 2));

      metadataUri = metadataResponse.data.metadataUri || metadataResponse.data.uri;
      
      if (!metadataUri) {
        throw new Error('Metadata upload returned empty URI. Response: ' + JSON.stringify(metadataResponse.data));
      }
      
      console.log('[PUMPFUN] ✅ Metadata uploaded. URI:', metadataUri);
    } catch (err) {
      console.error('[PUMPFUN] ❌ Metadata upload failed!');
      console.error('[PUMPFUN] Error details:', {
        message: err instanceof Error ? err.message : String(err),
        code: (err as any)?.code,
        response: (err as any)?.response?.data,
        status: (err as any)?.response?.status,
      });
      // DO NOT use fallback - throw error to prevent fake token creation
      throw new Error(`Metadata upload failed: ${err instanceof Error ? err.message : String(err)}`);
    }

    // Step 2: Create token via Pump.fun API
    console.log('[PUMPFUN] Calling Pump.fun create API...');

    const createUrl = `https://pumpportal.fun/api/trade?api-key=${apiKey}`;

    const createPayload = {
      action: 'create',
      tokenMetadata: {
        name: params.name.substring(0, 20),
        symbol: params.symbol.substring(0, 10).toUpperCase(),
        uri: metadataUri,
      },
      denominatedInSol: 'true',
      amount: '0.001',
      slippage: 10,
      priorityFee: 0.001,
      pool: 'pump',
    };

    console.log('[PUMPFUN] 📤 API Endpoint:', createUrl.split('?')[0]);
    console.log('[PUMPFUN] 📦 Request Payload:', JSON.stringify(createPayload, null, 2));

    let createResponse;
    try {
      createResponse = await axios.post(createUrl, createPayload, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 60000,
        validateStatus: () => true, // Accept all status codes
      });
    } catch (err) {
      console.error('[PUMPFUN] ❌ Network error calling API:');
      console.error({
        message: err instanceof Error ? err.message : String(err),
        code: (err as any)?.code,
      });
      throw err;
    }

    console.log('[PUMPFUN] 📨 Response Status:', createResponse.status);
    console.log('[PUMPFUN] 📨 Response Data:', JSON.stringify(createResponse.data, null, 2));

    // Validate response
    if (createResponse.status !== 200) {
      throw new Error(
        `API returned status ${createResponse.status}: ${JSON.stringify(createResponse.data)}`
      );
    }

    if (!createResponse.data) {
      throw new Error('API returned empty response');
    }

    // Check for error in response
    if (createResponse.data.error) {
      throw new Error(`API error: ${createResponse.data.error}`);
    }

    // Extract mint from response
    const mint =
      createResponse.data.mint ||
      createResponse.data.tokenAddress ||
      createResponse.data.token ||
      createResponse.data.address;

    const signature =
      createResponse.data.signature ||
      createResponse.data.tx ||
      createResponse.data.transaction ||
      createResponse.data.txId;

    if (!mint) {
      throw new Error(
        `No mint address in response. Got: ${JSON.stringify(createResponse.data)}`
      );
    }

    // Validate mint format (should be 43-44 chars base58)
    if (mint.length < 30) {
      throw new Error(
        `Invalid mint format "${mint}" (too short). Expected 43-44 character base58 string`
      );
    }

    console.log('[PUMPFUN] ✅ Token created successfully!');
    console.log('[PUMPFUN] Mint:', mint);
    console.log('[PUMPFUN] Signature:', signature);

    return {
      success: true,
      mint,
      transaction: signature,
      message: `✅ Token ${params.name} (${params.symbol}) created successfully on Pump.fun!`,
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('[PUMPFUN] ❌ ERROR:', errorMsg);
    console.error('[PUMPFUN] Stack:', error instanceof Error ? error.stack : 'N/A');

    // Return explicit failure - DO NOT return success with fake data
    return {
      success: false,
      error: errorMsg,
      message: `❌ Failed to create token: ${errorMsg}`,
    };
  }
}

/**
 * Check if a token was created successfully
 */
export async function checkTokenCreation(mint: string): Promise<{
  exists: boolean;
  details?: any;
}> {
  try {
    console.log('[PUMPFUN] Checking token:', mint);

    // Check on Solscan
    const response = await axios.get(`https://api.solscan.io/token/${mint}`, {
      timeout: 5000,
    });

    return {
      exists: true,
      details: response.data,
    };
  } catch (error) {
    console.error('[PUMPFUN] Token check error:', error instanceof Error ? error.message : error);
    return { exists: false };
  }
}
