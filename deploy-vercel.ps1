#!/usr/bin/env pwsh

# Liza API Test Dashboard - Quick Deploy to Vercel
# This script builds and deploys the project to Vercel

Write-Host "🚀 Liza API Test Dashboard - Vercel Deployment" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Check if Vercel CLI is installed
$vercelCmd = Get-Command vercel -ErrorAction SilentlyContinue
if (-not $vercelCmd) {
    Write-Host "❌ Vercel CLI not found. Installing globally..." -ForegroundColor Yellow
    npm install -g vercel
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to install Vercel CLI" -ForegroundColor Red
        exit 1
    }
}

Write-Host "✅ Vercel CLI found" -ForegroundColor Green
Write-Host ""

# Step 1: Install dependencies
Write-Host "📦 Step 1: Installing dependencies..." -ForegroundColor Cyan
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ npm install failed" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Dependencies installed" -ForegroundColor Green
Write-Host ""

# Step 2: Build
Write-Host "🔨 Step 2: Building project..." -ForegroundColor Cyan
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Build successful" -ForegroundColor Green
Write-Host ""

# Step 3: Check environment variables
Write-Host "🔐 Step 3: Checking environment variables..." -ForegroundColor Cyan
$envVars = @(
    "SOLANA_RPC_URL",
    "BACKUP_RPC_URL",
    "OPENROUTER_API_KEY",
    "JUPITER_API_URL"
)

$missingVars = @()
foreach ($var in $envVars) {
    $value = [Environment]::GetEnvironmentVariable($var)
    if ([string]::IsNullOrEmpty($value)) {
        $missingVars += $var
        Write-Host "⚠️  $var - not set locally (OK if set in Vercel dashboard)" -ForegroundColor Yellow
    } else {
        Write-Host "✅ $var - configured" -ForegroundColor Green
    }
}
Write-Host ""

if ($missingVars.Count -gt 0) {
    Write-Host "⚠️  Missing environment variables: $($missingVars -join ', ')" -ForegroundColor Yellow
    Write-Host "   Add these to your Vercel project dashboard before deployment" -ForegroundColor Yellow
    Write-Host ""
}

# Step 4: Deploy
Write-Host "🚀 Step 4: Deploying to Vercel..." -ForegroundColor Cyan
Write-Host "   Choose deployment option:" -ForegroundColor Cyan
Write-Host "   1. Development deployment (will prompt you to select project)" -ForegroundColor Gray
Write-Host "   2. Production deployment (--prod flag)" -ForegroundColor Gray
Write-Host ""

$choice = Read-Host "Enter choice (1 or 2, or 'exit' to cancel)"

if ($choice -eq "exit" -or $choice -eq "") {
    Write-Host "❌ Deployment cancelled" -ForegroundColor Yellow
    exit 0
}

if ($choice -eq "2") {
    Write-Host ""
    Write-Host "⚠️  Production deployment will overwrite live project" -ForegroundColor Yellow
    $confirm = Read-Host "Are you sure? (yes/no)"
    if ($confirm -ne "yes") {
        Write-Host "❌ Production deployment cancelled" -ForegroundColor Yellow
        exit 0
    }
    Write-Host ""
    vercel --prod
} else {
    vercel
}

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Deployment successful!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Next steps:" -ForegroundColor Cyan
    Write-Host "  1. Check your Vercel dashboard: https://vercel.com/dashboard" -ForegroundColor Gray
    Write-Host "  2. Visit your deployment URL" -ForegroundColor Gray
    Write-Host "  3. Navigate to /test to access the dashboard" -ForegroundColor Gray
    Write-Host ""
    Write-Host "🧪 Test the APIs:" -ForegroundColor Cyan
    Write-Host "  • Balance Check" -ForegroundColor Gray
    Write-Host "  • Portfolio Analysis" -ForegroundColor Gray
    Write-Host "  • Swap Quote" -ForegroundColor Gray
} else {
    Write-Host ""
    Write-Host "❌ Deployment failed. Check the error messages above." -ForegroundColor Red
    exit 1
}
