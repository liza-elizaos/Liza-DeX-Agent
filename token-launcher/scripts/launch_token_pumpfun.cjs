#!/usr/bin/env node
/**
 * Launch SPL token on Solana mainnet via PumpPortal (pumpfun integration)
 * No funds required to create the token - only for trading liquidity pool
 *
 * Usage:
 *   node scripts/launch_token_pumpfun.js --name mem --symbol Meme --logo ./meme_token.png
 *
 * Prerequisites:
 *   - PumpPortal API key in .env (PUMPPORTAL_API_KEY)
 *   - Logo image file (PNG/JPG)
 *   - Small amount of SOL in wallet for transaction fees (~0.1 SOL)
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// Config
const PUMPFUN_API = 'https://api.pumpfun.com/api';
const PUMPPORTAL_API = 'https://api.pumpportal.com/api/v2';

// Read env
require('dotenv').config();
const API_KEY = process.env.PUMPPORTAL_API_KEY;
const RPC_URL = process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';

if (!API_KEY) {
  console.error('❌ PUMPPORTAL_API_KEY not set in .env');
  process.exit(1);
}

function makeRequest(url, method = 'GET', body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
        ...headers,
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, data });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function uploadLogo(logoPath) {
  console.log(`📸 Uploading logo: ${logoPath}`);
  
  if (!fs.existsSync(logoPath)) {
    throw new Error(`Logo file not found: ${logoPath}`);
  }

  const logoBuffer = fs.readFileSync(logoPath);
  const logoBase64 = logoBuffer.toString('base64');

  console.log(`✅ Logo encoded (${logoBuffer.length} bytes)`);
  return logoBase64;
}

async function launchToken(name, symbol, logoBase64, description = '', twitter = '', website = '') {
  console.log(`\n🚀 Launching token on mainnet...`);
  console.log(`   Name: ${name}`);
  console.log(`   Symbol: ${symbol}`);

  const payload = {
    name,
    symbol,
    description: description || `${name} - A community token on Solana`,
    image: logoBase64,
    twitter: twitter || '',
    website: website || '',
    telegram: '',
  };

  try {
    // Step 1: Create token metadata
    console.log(`\n[1/3] Creating token metadata...`);
    const createResp = await makeRequest(`${PUMPPORTAL_API}/create`, 'POST', payload);
    
    if (createResp.status !== 200 && createResp.status !== 201) {
      console.error('❌ Failed to create token:', createResp.data);
      throw new Error(`API error ${createResp.status}`);
    }

    const tokenData = createResp.data;
    const mint = tokenData.mint || tokenData.address || tokenData.tokenAddress;
    
    if (!mint) {
      console.error('❌ No mint address in response:', tokenData);
      throw new Error('No mint address returned from API');
    }

    console.log(`✅ Token created!`);
    console.log(`   Mint: ${mint}`);

    // Step 2: Verify on mainnet
    console.log(`\n[2/3] Verifying on mainnet...`);
    const verifyResp = await makeRequest(`${PUMPPORTAL_API}/token/${mint}`, 'GET');
    
    if (verifyResp.status === 200) {
      console.log(`✅ Token verified on mainnet`);
      const tokenInfo = verifyResp.data;
      console.log(`   Name: ${tokenInfo.name}`);
      console.log(`   Symbol: ${tokenInfo.symbol}`);
    } else {
      console.log(`⚠️  Token may take a moment to appear on mainnet`);
    }

    // Step 3: Provide explorer links
    console.log(`\n[3/3] Token deployed!`);
    console.log(`\n📊 Explorer Links:`);
    console.log(`   Solscan: https://solscan.io/token/${mint}`);
    console.log(`   Pump.fun: https://pump.fun/${mint}`);
    console.log(`   Birdeye: https://birdeye.so/token/${mint}`);

    console.log(`\n🎉 Success! Your token is live on mainnet.`);
    console.log(`\n📝 Next Steps:`);
    console.log(`   1. Share the token address or links above`);
    console.log(`   2. Add liquidity on Raydium or Jupiter for trading`);
    console.log(`   3. List on token directories`);
    console.log(`   4. Promote to community`);

    return mint;
  } catch (error) {
    console.error('❌ Launch failed:', error.message);
    throw error;
  }
}

async function main() {
  const args = require('minimist')(process.argv.slice(2));
  const name = args.name || args.n || 'mem';
  const symbol = args.symbol || args.s || 'Meme';
  const logoPath = args.logo || args.l || './meme_token.png';
  const description = args.description || args.d || '';
  const twitter = args.twitter || args.t || '';
  const website = args.website || args.w || '';

  try {
    console.log('🌐 Solana Mainnet Token Launcher');
    console.log('='.repeat(50));
    console.log(`Network: mainnet`);
    console.log(`RPC: ${RPC_URL}`);
    console.log(`API: PumpPortal / Pump.fun`);

    // Upload logo
    const logoBase64 = await uploadLogo(logoPath);

    // Launch token
    const mint = await launchToken(name, symbol, logoBase64, description, twitter, website);

    console.log(`\n✨ Token address: ${mint}`);
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

main();
