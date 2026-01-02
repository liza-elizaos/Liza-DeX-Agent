#!/usr/bin/env bun
/**
 * LIZA Swap Help & Quick Start Guide
 * Shows usage information for all swap scripts
 */

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
};

function print(text: string = '') {
  console.log(text);
}

function header(title: string) {
  print(`\n${colors.bright}${colors.magenta}${title}${colors.reset}`);
  print(`${colors.magenta}${'='.repeat(title.length)}${colors.reset}`);
}

function section(title: string) {
  print(`\n${colors.bright}${colors.cyan}${title}${colors.reset}`);
  print(`${colors.cyan}${'-'.repeat(title.length)}${colors.reset}`);
}

function command(cmd: string, desc: string = '') {
  print(`${colors.yellow}  $ ${cmd}${colors.reset}`);
  if (desc) print(`${colors.blue}    ${desc}${colors.reset}`);
}

function tip(text: string) {
  print(`${colors.green}💡 ${text}${colors.reset}`);
}

function warning(text: string) {
  print(`${colors.red}⚠️  ${text}${colors.reset}`);
}

function main() {
  header('🚀 LIZA Token Swap Scripts - Quick Start Guide');

  section('📦 Three Ways to Swap');

  print(`
${colors.bright}1. Quick Swap (Command Line)${colors.reset}
   For single, quick swaps with balance checking`);
  command('bun swap.ts USDC 0.001', 'Swap 0.001 SOL for USDC');
  command('bun swap.ts BONK 0.5', 'Swap 0.5 SOL for BONK');
  command('npm run swap -- USDT 1.0', 'Using npm alias');

  print(`
${colors.bright}2. Interactive Terminal${colors.reset}
   Full-featured menu for manual control`);
  command('bun swap-interactive.ts', 'Launch interactive menu');
  command('npm run swap:interactive', 'Using npm alias');
  print(`   Features: Quick swap, check balance, batch swaps, token info`);

  print(`
${colors.bright}3. Batch from Config File${colors.reset}
   Execute multiple swaps from JSON config`);
  command('bun swap-batch.ts swaps.json', 'Run batch from config');
  command('npm run swap:batch swaps.json', 'Using npm alias');
  print(`   Perfect for: DCA strategies, portfolio diversification`);

  section('🎯 Common Use Cases');

  print(`
${colors.bright}Single Swap:${colors.reset}`);
  command('bun swap.ts USDC 0.001');

  print(`
${colors.bright}Check Balance First:${colors.reset}`);
  command('bun swap-interactive.ts', 'Select option 2');

  print(`
${colors.bright}Multiple Swaps (Interactive):${colors.reset}`);
  command('bun swap-interactive.ts', 'Select option 3: Batch Swap');

  print(`
${colors.bright}Recurring Batch (Daily):${colors.reset}`);
  command('echo \'{"swaps":[{"amount":0.001,"toToken":"BONK"}]}\' > dca.json');
  command('bun swap-batch.ts dca.json');

  section('⚙️  Setup & Configuration');

  print(`
${colors.yellow}Set your wallet address (optional):${colors.reset}`);
  command('export SOLANA_PUBLIC_KEY="your_wallet_address"');

  print(`
${colors.yellow}Or create a .env file:${colors.reset}`);
  command('echo SOLANA_PUBLIC_KEY=your_address > .env');

  print(`
${colors.yellow}Make sure server is running:${colors.reset}`);
  command('npm run server', 'In another terminal');

  section('📊 Supported Tokens');

  print(`${colors.cyan}
  SOL, USDC, USDT, MSOL, RAY, COPE, SRM, FTT, KIN, WSOL, BONK, MARINADE
${colors.reset}

  View all tokens with: ${colors.yellow}bun swap-interactive.ts${colors.reset} → option 4
  `);

  section('🚀 Quick Examples');

  print(`
${colors.bright}Example 1: Test swap${colors.reset}
  Small amount to verify setup`);
  command('bun swap.ts USDC 0.001');

  print(`
${colors.bright}Example 2: Dollar-Cost Averaging${colors.reset}
  Create config file:`);
  print(`  ${colors.cyan}{
    "swaps": [
      {"amount": 0.002, "toToken": "BONK"},
      {"amount": 0.002, "toToken": "BONK"},
      {"amount": 0.002, "toToken": "BONK"}
    ]
  }${colors.reset}`);
  command('bun swap-batch.ts dca.json');

  print(`
${colors.bright}Example 3: Portfolio diversification${colors.reset}
  Create config file:`);
  print(`  ${colors.cyan}{
    "swaps": [
      {"amount": 0.003, "toToken": "USDC"},
      {"amount": 0.002, "toToken": "BONK"},
      {"amount": 0.002, "toToken": "RAY"}
    ]
  }${colors.reset}`);
  command('bun swap-batch.ts portfolio.json');

  section('✅ Check List');

  print(`
${colors.green}✓${colors.reset} Server running (${colors.yellow}npm run server${colors.reset})
${colors.green}✓${colors.reset} Wallet has sufficient SOL balance
${colors.green}✓${colors.reset} Token is supported (check option 4 in interactive mode)
${colors.green}✓${colors.reset} For batch: config file is valid JSON
  `);

  section('⚠️  Important Notes');

  warning('Always test with small amounts first');
  warning('Keep 0.01 SOL for transaction fees');
  warning('Check wallet balance before large swaps');
  warning('Verify token addresses in supported tokens list');

  tip('Start small: bun swap.ts USDC 0.001');
  tip('Use interactive mode to explore: bun swap-interactive.ts');
  tip('Check server logs: npm run server (in another terminal)');
  tip('Batch scripts add 2-second delays between swaps');

  section('📚 Documentation');

  print(`
  Full documentation: ${colors.yellow}SWAP_SCRIPTS.md${colors.reset}
  
  ${colors.cyan}Main Scripts:${colors.reset}
    - swap.ts                 Quick swap from CLI
    - swap-interactive.ts     Interactive menu
    - swap-batch.ts           Batch from config file
    - swaps.example.json      Example configuration

  ${colors.cyan}Server:${colors.reset}
    - server.ts              Main HTTP server
    - api/swap-utils.ts      Core swap logic
  `);

  print(`
${colors.bright}${colors.green}Ready to swap! 🎉${colors.reset}

Try this now:
${colors.yellow}  npm run server${colors.reset}           # In terminal 1
${colors.yellow}  bun swap-interactive.ts${colors.reset}  # In terminal 2
  `);
}

main();
