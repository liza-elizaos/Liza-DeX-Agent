# SWAP Deployment Verification for Vercel
$ErrorActionPreference = "Continue"

Write-Host "`n================================" -ForegroundColor Cyan
Write-Host "SWAP DEPLOYMENT VERIFICATION" -ForegroundColor Cyan
Write-Host "================================`n" -ForegroundColor Cyan

# Check local env
Write-Host "Step 1: Checking Local Environment Variables..." -ForegroundColor Yellow
Get-Content .env | Select-String -Pattern "SOLANA|JUPITER" | Select-Object -First 5

# Check API files
Write-Host "`nStep 2: Checking API Files..." -ForegroundColor Yellow
Test-Path "api/chat.ts" | ForEach-Object { Write-Host "  api/chat.ts: $_" }
Test-Path "api/swap-utils.ts" | ForEach-Object { Write-Host "  api/swap-utils.ts: $_" }
Test-Path "api/swap.ts" | ForEach-Object { Write-Host "  api/swap.ts: $_" }
Test-Path "api/balance.ts" | ForEach-Object { Write-Host "  api/balance.ts: $_" }

# Check dist
Write-Host "`nStep 3: Checking Build Output..." -ForegroundColor Yellow
Test-Path "dist" | ForEach-Object { Write-Host "  dist exists: $_" }

# Vercel check
Write-Host "`nStep 4: Checking Vercel Link..." -ForegroundColor Yellow
try {
    $project = & vercel project list 2>&1 | Select-Object -First 1
    Write-Host "  Vercel projects: $project"
} catch {
    Write-Host "  Vercel CLI: Not configured"
}

Write-Host "`n================================" -ForegroundColor Green
Write-Host "REQUIRED ACTIONS FOR DEPLOYMENT" -ForegroundColor Green
Write-Host "================================`n" -ForegroundColor Green

Write-Host "1. Ensure environment variables are set on Vercel:" -ForegroundColor Yellow
Write-Host "   - SOLANA_PUBLIC_KEY"
Write-Host "   - SOLANA_PRIVATE_KEY"
Write-Host "   - SOLANA_RPC_URL"
Write-Host "   - JUPITER_API_URL"
Write-Host "   - JUPITER_API_KEY`n"

Write-Host "2. Set via CLI:" -ForegroundColor Cyan
Write-Host "   vercel env add SOLANA_PUBLIC_KEY" 
Write-Host "   vercel env add SOLANA_PRIVATE_KEY"
Write-Host "   vercel env add SOLANA_RPC_URL"
Write-Host "   vercel env add JUPITER_API_URL"
Write-Host "   vercel env add JUPITER_API_KEY`n"

Write-Host "3. Commit and deploy:" -ForegroundColor Cyan
Write-Host "   git add ."
Write-Host "   git commit -m 'Fix: Swap functionality for Vercel'"
Write-Host "   git push"
Write-Host "   vercel deploy --prod`n"

Write-Host "4. Test swap after deployment:" -ForegroundColor Cyan
Write-Host "   Message: 'swap 0.01 USDC for SOL'"
Write-Host "   or 'check my balance'`n"

Write-Host "================================" -ForegroundColor Green
