#!/usr/bin/env node

/**
 * INTERACTIVE SETUP CHECKLIST
 * Run this to verify your environment is ready for token launching
 */

import * as fs from 'fs';
import * as path from 'path';

const checks = [
  {
    name: 'Node.js installed',
    check: () => {
      try {
        require('child_process').execSync('node --version');
        return true;
      } catch {
        return false;
      }
    },
    fix: 'Install Node.js from https://nodejs.org',
  },
  {
    name: 'Bun installed',
    check: () => {
      try {
        require('child_process').execSync('bun --version');
        return true;
      } catch {
        return false;
      }
    },
    fix: 'Install Bun from https://bun.sh',
  },
  {
    name: '.env file exists',
    check: () => fs.existsSync('.env'),
    fix: 'Create .env file with SOLANA_PRIVATE_KEY and SOLANA_RPC_URL',
  },
  {
    name: 'Pump.fun SDK installed',
    check: () => {
      try {
        const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
        return !!packageJson.dependencies?.['@pump-fun/pump-sdk'];
      } catch {
        return false;
      }
    },
    fix: 'Run: npm install @pump-fun/pump-sdk @pump-fun/pump-swap-sdk',
  },
  {
    name: 'Solana Web3.js installed',
    check: () => {
      try {
        const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
        return !!packageJson.dependencies?.['@solana/web3.js'];
      } catch {
        return false;
      }
    },
    fix: 'Run: npm install @solana/web3.js bs58 dotenv',
  },
  {
    name: 'Launcher scripts exist',
    check: () =>
      fs.existsSync('test-pumpfun-claude.ts') &&
      fs.existsSync('unified-launcher.ts') &&
      fs.existsSync('quick-launch.ts'),
    fix: 'Scripts should be in token-launcher/ directory',
  },
];

async function runChecks() {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║   ✓ SETUP READINESS CHECK                                ║');
  console.log('║   Verify you\'re ready to launch tokens                   ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  let allPass = true;
  const results: Array<{ name: string; pass: boolean; fix?: string }> = [];

  for (const check of checks) {
    try {
      const pass = check.check();
      const icon = pass ? '✅' : '❌';
      console.log(`${icon} ${check.name}`);

      if (!pass) {
        console.log(`   Fix: ${check.fix}`);
        allPass = false;
      }

      results.push({ name: check.name, pass, fix: check.fix });
    } catch (error) {
      console.log(`❌ ${check.name}`);
      console.log(`   Fix: ${check.fix}`);
      allPass = false;
      results.push({ name: check.name, pass: false, fix: check.fix });
    }
  }

  console.log('\n' + '─'.repeat(70));

  if (allPass) {
    console.log('\n✅ ALL CHECKS PASSED!\n');
    console.log('You\'re ready to launch tokens!\n');
    console.log('Next steps:');
    console.log('  1. Configure .env with your wallet');
    console.log('  2. Test on devnet: export SOLANA_RPC_URL=https://api.devnet.solana.com');
    console.log('  3. Run: bun test-pumpfun-claude.ts');
    console.log('  4. When ready: bun unified-launcher.ts (mainnet)\n');
  } else {
    console.log('\n❌ SOME CHECKS FAILED\n');
    console.log('Fix the issues above, then run this again.\n');
    process.exit(1);
  }

  // Print summary
  console.log('═'.repeat(70));
  console.log('SUMMARY\n');

  const passed = results.filter((r) => r.pass).length;
  const total = results.length;

  console.log(`Status: ${passed}/${total} checks passed`);

  if (allPass) {
    console.log('\n🚀 You can now run:\n');
    console.log('  # Test on devnet (safe, free)');
    console.log('  export SOLANA_RPC_URL=https://api.devnet.solana.com');
    console.log('  bun test-pumpfun-claude.ts\n');
    console.log('  # Or launch on mainnet (real tokens)');
    console.log('  bun unified-launcher.ts\n');
  }
}

// Run checks
runChecks().catch(console.error);
