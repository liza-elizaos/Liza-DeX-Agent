#!/usr/bin/env bun
/**
 * LIZA Deployment Checklist & Verification Script
 * Run this before deploying to Vercel
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const checks = [];

function log(status: string, message: string, details?: string) {
  console.log(`${status} ${message}`);
  if (details) console.log(`   └─ ${details}`);
  checks.push({ status, message, details });
}

console.log('🚀 LIZA - Vercel Deployment Checklist\n');
console.log('Checking essential files...\n');

// 1. Check API files exist
const apiFiles = [
  'src/api/chat.ts',
  'src/api/balance.ts',
  'src/api/swap.ts',
  'src/api/wallet-connect.ts',
  'src/api/portfolio.ts',
  'src/api/portfolio-analytics.ts',
];

let apiOK = true;
for (const file of apiFiles) {
  const path = join(process.cwd(), file);
  if (existsSync(path)) {
    log('✅', `${file} exists`);
  } else {
    log('❌', `${file} MISSING`, 'This file is required');
    apiOK = false;
  }
}

// 2. Check server.ts routing
const serverPath = join(process.cwd(), 'server.ts');
if (existsSync(serverPath)) {
  const content = readFileSync(serverPath, 'utf-8');
  
  if (content.includes('/api/balance')) {
    log('✅', 'server.ts has /api/balance route');
  } else {
    log('❌', 'server.ts missing /api/balance route');
  }
  
  if (content.includes('/api/chat')) {
    log('✅', 'server.ts has /api/chat route');
  } else {
    log('❌', 'server.ts missing /api/chat route');
  }
  
  if (content.includes('/api/swap')) {
    log('✅', 'server.ts has /api/swap route');
  } else {
    log('❌', 'server.ts missing /api/swap route');
  }
  
  if (content.includes('/api/portfolio')) {
    log('✅', 'server.ts has /api/portfolio route');
  } else {
    log('❌', 'server.ts missing /api/portfolio route');
  }
}

// 3. Check package.json scripts
const pkgPath = join(process.cwd(), 'package.json');
if (existsSync(pkgPath)) {
  const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
  
  if (pkg.scripts?.build) {
    log('✅', 'package.json has build script');
  } else {
    log('❌', 'package.json missing build script');
  }
  
  if (pkg.scripts?.dev) {
    log('✅', 'package.json has dev script');
  } else {
    log('❌', 'package.json missing dev script');
  }
  
  if (pkg.dependencies?.['@solana/web3.js']) {
    log('✅', '@solana/web3.js is installed');
  } else {
    log('❌', '@solana/web3.js not in dependencies');
  }
}

// 4. Check environment template
const envPath = join(process.cwd(), '.env.example');
if (existsSync(envPath)) {
  log('✅', '.env.example exists', 'Users can reference this');
} else {
  log('⚠️', '.env.example does not exist', 'Create one for documentation');
}

// 5. Check vercel.json
const vercelPath = join(process.cwd(), 'vercel.json');
if (existsSync(vercelPath)) {
  log('✅', 'vercel.json exists');
} else {
  log('⚠️', 'vercel.json missing', 'Vercel will use defaults');
}

// Summary
console.log('\n' + '='.repeat(50));
const passCount = checks.filter(c => c.status === '✅').length;
const failCount = checks.filter(c => c.status === '❌').length;
const warnCount = checks.filter(c => c.status === '⚠️').length;

console.log(`\n📊 Summary:`);
console.log(`  ✅ Passed: ${passCount}`);
console.log(`  ❌ Failed: ${failCount}`);
console.log(`  ⚠️  Warnings: ${warnCount}`);

if (failCount === 0) {
  console.log('\n✨ Ready for Vercel deployment! 🚀');
  console.log('\nNext steps:');
  console.log('1. Commit changes: git add . && git commit -m "Ready for Vercel"');
  console.log('2. Push to GitHub/GitLab: git push origin main');
  console.log('3. Deploy: vercel --prod');
  console.log('4. Set environment variables in Vercel dashboard');
  console.log('5. Test live endpoints\n');
  process.exit(0);
} else {
  console.log('\n❌ Fix errors before deploying!');
  process.exit(1);
}
