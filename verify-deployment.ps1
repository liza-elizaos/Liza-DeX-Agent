#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Verify and fix SWAP functionality on Vercel deployment

.DESCRIPTION
    This script checks:
    1. Local environment variables
    2. Vercel environment variables
    3. Build output includes api files
    4. Runs local API test
    5. Provides deployment steps

.NOTES
    Run from workspace root: .\verify-deployment.ps1
#>

$ErrorActionPreference = "Continue"

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "🔍 SWAP FUNCTIONALITY DEPLOYMENT VERIFICATION" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

# Step 1: Check local environment
Write-Host "`n📋 Step 1: Checking Local Environment Variables..." -ForegroundColor Yellow

$requiredVars = @(
    "SOLANA_PUBLIC_KEY",
    "SOLANA_PRIVATE_KEY",
    "SOLANA_RPC_URL",
    "JUPITER_API_URL",
    "JUPITER_API_KEY"
)

$envFile = Get-Content .env -ErrorAction SilentlyContinue
if ($envFile) {
    Write-Host "✅ .env file found" -ForegroundColor Green
    foreach ($var in $requiredVars) {
        $value = $envFile | Select-String "^$var=" | ForEach-Object { $_ -replace "^$var=", "" }
        if ($value) {
            $masked = if ($value.Length -gt 20) { $value.Substring(0, 20) + "..." } else { $value }
            Write-Host "  ✅ $var = $masked" -ForegroundColor Green
        } else {
            Write-Host "  ❌ $var = MISSING" -ForegroundColor Red
        }
    }
} else {
    Write-Host "❌ .env file not found!" -ForegroundColor Red
}

# Step 2: Check Vercel environment
Write-Host "`n📋 Step 2: Checking Vercel Environment Variables..." -ForegroundColor Yellow

try {
    $vercelEnv = & vercel env ls 2>&1
    if ($vercelEnv -match "error" -or $null -eq $vercelEnv) {
        Write-Host "⚠️  Vercel CLI not configured or no project linked" -ForegroundColor Yellow
        Write-Host "   Run: vercel link" -ForegroundColor Cyan
    } else {
        Write-Host "✅ Vercel environment check:" -ForegroundColor Green
        $vercelEnv | ForEach-Object {
            if ($_ -match "SOLANA|JUPITER") {
                Write-Host "  ✅ $_" -ForegroundColor Green
            }
        }
    }
} catch {
    Write-Host "⚠️  Vercel CLI not available (install with: npm install -g vercel)" -ForegroundColor Yellow
}

# Step 3: Check build output
Write-Host "`n📋 Step 3: Checking Build Output..." -ForegroundColor Yellow

$distExists = Test-Path dist
if ($distExists) {
    Write-Host "✅ dist/ directory exists" -ForegroundColor Green
    $files = Get-ChildItem dist -Recurse -File | Select-Object -First 10
    Write-Host "  Files in dist:" -ForegroundColor Cyan
    $files | ForEach-Object { Write-Host "    - $($_.Name)" }
} else {
    Write-Host "❌ dist/ directory not found. Run: npm run build" -ForegroundColor Red
}

# Step 4: Check api folder files
Write-Host "`n📋 Step 4: Checking API Files..." -ForegroundColor Yellow

$apiFiles = @("api/chat.ts", "api/swap.ts", "api/swap-utils.ts", "api/balance.ts")
foreach ($file in $apiFiles) {
    $exists = Test-Path $file
    if ($exists) {
        $size = (Get-Item $file).Length
        Write-Host "  [OK] $file ($size bytes)" -ForegroundColor Green
    } else {
        Write-Host "  [FAIL] $file NOT FOUND" -ForegroundColor Red
    }
}

# Step 5: Test imports
Write-Host "`n📋 Step 5: Testing TypeScript Imports..." -ForegroundColor Yellow

$testCode = @"
try {
  const chatModule = await import('./api/chat.ts');
  const swapUtils = await import('./api/swap-utils.ts');
  console.log('✅ All imports successful');
  process.exit(0);
} catch (e) {
  console.error('❌ Import error:', e.message);
  process.exit(1);
}
"@

# Try with Bun first
try {
    $result = & bun -e $testCode 2>&1
    Write-Host "✅ Bun import test: $result" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Bun test failed (optional)" -ForegroundColor Yellow
}

# Step 6: Provide deployment instructions
Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "📝 DEPLOYMENT STEPS" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

Write-Host @"

1. SET VERCEL ENVIRONMENT VARIABLES

   a) Push to git first:
      git add .
      git commit -m "Fix: swap functionality for Vercel deployment"
      git push

   b) Set environment on Vercel:
      
      vercel env add SOLANA_PUBLIC_KEY
      vercel env add SOLANA_PRIVATE_KEY
      vercel env add SOLANA_RPC_URL
      vercel env add JUPITER_API_URL
      vercel env add JUPITER_API_KEY
      
   c) Or use Vercel dashboard:
      https://vercel.com/dashboard
      Select your project
      Settings -> Environment Variables
      Add the 5 variables above

2. REDEPLOY TO VERCEL

   vercel deploy --prod

3. TEST THE DEPLOYMENT

   After deployment completes:
   Go to your Vercel URL
   Try: "check my balance"
   Then: "swap 0.01 USDC for SOL"

4. CHECK VERCEL LOGS

   If still not working:
   Vercel dashboard -> Deployments -> Click latest
   Check "Function Logs" tab
   Look for any errors in /api/chat logs

"@ -ForegroundColor Cyan

# Step 7: Generate command to set Vercel env vars
Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "⚡ QUICK SETUP COMMANDS" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

Write-Host "`nRun these commands in PowerShell:" -ForegroundColor Yellow
Write-Host @"

# 1. Link to Vercel (if not already linked)
vercel link

# 2. Set environment variables from .env
`$env = Get-Content .env | ConvertFrom-StringData
vercel env add SOLANA_PUBLIC_KEY `$env.SOLANA_PUBLIC_KEY
vercel env add SOLANA_PRIVATE_KEY `$env.SOLANA_PRIVATE_KEY
vercel env add SOLANA_RPC_URL `$env.SOLANA_RPC_URL
vercel env add JUPITER_API_URL `$env.JUPITER_API_URL
vercel env add JUPITER_API_KEY `$env.JUPITER_API_KEY

# 3. Deploy
git add .
git commit -m "Fix: SWAP deployment to Vercel"
git push
vercel deploy --prod

# 4. Watch logs in real-time
vercel logs [your-project-url] --follow

"@ -ForegroundColor Cyan

Write-Host "`n✅ Verification complete!" -ForegroundColor Green
