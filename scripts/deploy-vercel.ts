#!/usr/bin/env bun
/**
 * LIZA - One-Click Vercel Deployment
 * 
 * This script prepares everything for Vercel deployment
 * Run: bun run scripts/deploy-vercel.ts
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync } from 'fs';

console.log('🚀 LIZA - Vercel Deployment Assistant\n');

// Step 1: Verify project state
console.log('📋 Verifying project state...');
try {
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Build successful\n');
} catch (error) {
  console.error('❌ Build failed. Fix errors and try again.');
  process.exit(1);
}

// Step 2: Check git status
console.log('📦 Checking git status...');
try {
  const status = execSync('git status --porcelain', { encoding: 'utf-8' });
  if (status) {
    console.log('⚠️ Uncommitted changes detected:');
    console.log(status);
    console.log('\nCommit changes before deploying:');
    console.log('  git add .');
    console.log('  git commit -m "Deploy to Vercel"');
    console.log('  git push origin main');
  } else {
    console.log('✅ All changes committed\n');
  }
} catch (error) {
  console.log('⚠️ Not a git repository\n');
}

// Step 3: Create .env guide
console.log('📝 Creating environment variable guide...');
const envGuide = `.env Variables Required for Vercel
====================================

# REQUIRED: Solana Configuration
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
SOLANA_PUBLIC_KEY=<your_solana_wallet_address>
SOLANA_PRIVATE_KEY=<your_private_key_base58>

# OPTIONAL: Backup RPC
BACKUP_RPC_URL=https://solana-api.projectserum.com

# AI/Chat (OpenRouter)
OPENROUTER_API_KEY=<get_from_openrouter.ai>
OPENROUTER_MODEL=meta-llama/llama-2-7b-chat

# Alternative LLM Providers (optional)
ANTHROPIC_API_KEY=<api_key>
OPENAI_API_KEY=<api_key>

# Discord/Telegram Integration (optional)
DISCORD_TOKEN=<bot_token>
TELEGRAM_TOKEN=<bot_token>

# Database (optional)
DATABASE_URL=postgresql://user:pass@host/db

Configuration Instructions:
===========================

1. Get SOLANA_PUBLIC_KEY:
   - Use your Phantom wallet address
   - Or create new: solana-cli keygen

2. Get OPENROUTER_API_KEY:
   - Sign up: https://openrouter.ai
   - Create API key in dashboard
   
3. Set in Vercel Dashboard:
   - Go to https://vercel.com/dashboard
   - Select your project
   - Settings → Environment Variables
   - Add each variable above
   
4. Redeploy after setting variables:
   - vercel --prod
`;

writeFileSync('.env.vercel.guide', envGuide);
console.log('✅ Created .env.vercel.guide\n');

// Step 4: Display deployment instructions
console.log('🎯 Deployment Instructions:\n');
console.log('OPTION 1: Using Vercel CLI (Quick)\n');
console.log('  1. Install Vercel CLI:');
console.log('     npm i -g vercel\n');
console.log('  2. Login to Vercel:');
console.log('     vercel login\n');
console.log('  3. Deploy:');
console.log('     vercel --prod\n');

console.log('OPTION 2: GitHub Integration (Recommended)\n');
console.log('  1. Push to GitHub:');
console.log('     git add .');
console.log('     git commit -m "Ready for Vercel deployment"');
console.log('     git push origin main\n');
console.log('  2. Import in Vercel:');
console.log('     - Go to vercel.com');
console.log('     - Click "Add New" → "Project"');
console.log('     - Select your GitHub repo');
console.log('     - Add environment variables\n');
console.log('  3. Auto-deploys on every push!\n');

// Step 5: Test endpoints locally
console.log('✅ Before deploying, test locally:');
console.log('   npm run dev');
console.log('   bun run scripts/test-all-apis.ts\n');

// Step 6: Verify live endpoints
console.log('📡 After deployment, test live endpoints:');
console.log('   curl https://your-app.vercel.app/health\n');

console.log('🎉 You\'re ready to deploy!');
console.log('\nQuestions? Check VERCEL_DEPLOYMENT_GUIDE.md');
