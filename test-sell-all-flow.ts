#!/usr/bin/env bun
/**
 * Complete Test Flow:
 * 1. Buy 0.01 USDC with SOL
 * 2. Check balance
 * 3. Sell ALL USDC back to SOL
 * 4. Verify flow works
 */

import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

console.log(`
╔════════════════════════════════════════════════════════════════╗
║          🧪 COMPLETE SWAP TEST - SELL ALL FLOW                ║
╚════════════════════════════════════════════════════════════════╝
`);

async function runCommand(cmd: string, label: string): Promise<string> {
  console.log(`\n${label}`);
  console.log('─'.repeat(60));
  
  try {
    const { stdout, stderr } = await execPromise(cmd, { 
      cwd: process.cwd(),
      shell: 'powershell.exe'
    });
    
    if (stderr) console.error(stderr);
    console.log(stdout);
    return stdout;
  } catch (error: any) {
    console.error(`❌ Error: ${error.message}`);
    throw error;
  }
}

async function main() {
  try {
    // Step 1: Buy some USDC first
    console.log(`
╔════════════════════════════════════════════════════════════════╗
║  STEP 1: Buy 0.01 USDC with SOL (to have USDC to sell)       ║
╚════════════════════════════════════════════════════════════════╝
    `);
    
    await runCommand(
      'bun swap-implementation.ts USDC 0.001',
      '📤 [1/4] BUYING USDC...'
    );

    // Wait a bit for confirmation
    console.log('\n⏳ Waiting for confirmation...');
    await new Promise(r => setTimeout(r, 2000));

    // Step 2: Check balance
    console.log(`
╔════════════════════════════════════════════════════════════════╗
║  STEP 2: Check USDC Balance                                   ║
╚════════════════════════════════════════════════════════════════╝
    `);
    
    const balanceOutput = await runCommand(
      'bun -e "import * as fs from \"fs\"; import * as path from \"path\"; import { Connection, PublicKey } from \"@solana/web3.js\"; const env = {}; fs.readFileSync(path.join(process.cwd(), \".env\"), \"utf-8\").split(\"\\n\").forEach(line => { const [key, ...valueParts] = line.split(\"=\"); if (key && !key.startsWith(\"#\")) env[key.trim()] = valueParts.join(\"=\").trim(); }); const conn = new Connection(env.SOLANA_RPC_URL); const bal = await conn.getParsedTokenAccountsByOwner(new PublicKey(env.SOLANA_PUBLIC_KEY), { mint: new PublicKey(\"EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v\") }); if (bal.value.length > 0) console.log(\"USDC Balance: \" + bal.value[0].account.data.parsed.info.tokenAmount.uiAmount); else console.log(\"No USDC account\");"',
      '💰 [2/4] CHECKING BALANCE...'
    );

    // Step 3: Sell ALL USDC
    console.log(`
╔════════════════════════════════════════════════════════════════╗
║  STEP 3: Sell ALL USDC to SOL (Automated)                     ║
╚════════════════════════════════════════════════════════════════╝
    `);
    
    await runCommand(
      'bun sell-all-usdc.ts',
      '🔄 [3/4] SELLING ALL USDC...'
    );

    // Step 4: Final message
    console.log(`
╔════════════════════════════════════════════════════════════════╗
║           ✅ TEST FLOW COMPLETED!                             ║
╚════════════════════════════════════════════════════════════════╝

✨ What happened:
   1. ✅ Bought 0.001 SOL → USDC (automatic conversion)
   2. ✅ Checked USDC balance
   3. ✅ Sold ALL USDC → SOL (automatic detection & execution)

🎯 Next Steps:
   1. Check your wallet balance on Solscan
   2. Verify all swaps executed on mainnet
   3. Ready for elizaOS integration!

📝 Commands to remember:
   • bun sell-all-usdc.ts          - Sell all USDC
   • bun swap-by-mint.ts [mint1] [mint2] [amount] - Flexible swaps
   • bun swap-implementation.ts USDC 0.001         - Buy USDC
    `);

  } catch (error: any) {
    console.error(`\n❌ TEST FAILED: ${error.message}`);
    process.exit(1);
  }
}

main();
