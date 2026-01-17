#!/usr/bin/env pwsh

# Liza API Test Dashboard - Vercel Deployment Script
# Fixed version for PowerShell

Write-Host "🚀 Liza API Test Dashboard - Vercel Deployment" -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check Vercel CLI
Write-Host "📦 Step 1: Checking Vercel CLI..." -ForegroundColor Cyan
$vercelCmd = Get-Command vercel -ErrorAction SilentlyContinue
if (-not $vercelCmd) {
    Write-Host "❌ Vercel CLI not found. Installing globally..." -ForegroundColor Yellow
    npm install -g vercel
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to install Vercel CLI" -ForegroundColor Red
        exit 1
    }
}
Write-Host "✅ Vercel CLI ready" -ForegroundColor Green
Write-Host ""

# Step 2: Install dependencies
Write-Host "📦 Step 2: Installing dependencies..." -ForegroundColor Cyan
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ npm install failed" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Dependencies installed" -ForegroundColor Green
Write-Host ""

# Step 3: Build
Write-Host "🔨 Step 3: Building project..." -ForegroundColor Cyan
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Build successful" -ForegroundColor Green
Write-Host ""

# Step 4: Check environment variables
Write-Host "🔐 Step 4: Environment variables..." -ForegroundColor Cyan
Write-Host "Make sure these are set in Vercel dashboard:" -ForegroundColor Yellow
Write-Host "  • SOLANA_RPC_URL" -ForegroundColor Gray
Write-Host "  • BACKUP_RPC_URL" -ForegroundColor Gray
Write-Host "  • JUPITER_API_URL" -ForegroundColor Gray
Write-Host "  • SOLANA_NETWORK" -ForegroundColor Gray
Write-Host ""

# Step 5: Deploy
Write-Host "🚀 Step 5: Deploying to Vercel..." -ForegroundColor Cyan
Write-Host "Choose deployment type:" -ForegroundColor Cyan
Write-Host "  1. Development (preview)" -ForegroundColor Gray
Write-Host "  2. Production (live)" -ForegroundColor Gray
Write-Host ""

$choice = Read-Host "Enter 1 or 2 (default: 1)"

if ($choice -eq "2") {
    Write-Host ""
    Write-Host "⚠️  Production deployment will go live!" -ForegroundColor Yellow
    $confirm = Read-Host "Are you sure? Type 'yes' to confirm"
    if ($confirm -ne "yes") {
        Write-Host "❌ Deployment cancelled" -ForegroundColor Yellow
        exit 0
    }
    Write-Host ""
    Write-Host "Deploying to production..." -ForegroundColor Cyan
    vercel --prod
} else {
    Write-Host ""
    Write-Host "Deploying preview version..." -ForegroundColor Cyan
    vercel
}

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Deployment successful!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🎉 Next steps:" -ForegroundColor Cyan
    Write-Host "  1. Check Vercel dashboard: https://vercel.com/dashboard" -ForegroundColor Gray
    Write-Host "  2. Add environment variables if not already set" -ForegroundColor Gray
    Write-Host "  3. Visit: https://your-project.vercel.app/test" -ForegroundColor Gray
    Write-Host ""
    Write-Host "🧪 Test the APIs:" -ForegroundColor Cyan
    Write-Host "  • Balance Check - Enter wallet address" -ForegroundColor Gray
    Write-Host "  • Portfolio Check - View all holdings" -ForegroundColor Gray
    Write-Host "  • Swap Quote - Get Jupiter quotes" -ForegroundColor Gray
} else {
    Write-Host ""
    Write-Host "❌ Deployment failed" -ForegroundColor Red
    exit 1
}
