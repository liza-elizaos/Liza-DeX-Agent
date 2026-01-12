#!/usr/bin/env pwsh

# Token Launcher Test Script for Windows PowerShell

Write-Host "
╔════════════════════════════════════════════════════════════╗
║        🚀 TOKEN LAUNCHER - LOCAL TEST SCRIPT               ║
║                 For Windows PowerShell                      ║
╚════════════════════════════════════════════════════════════╝
" -ForegroundColor Cyan

# Configuration
$BACKEND_URL = "http://localhost:3001"
$TEST_IMAGE_PATH = "$PSScriptRoot\test-image.png"

Write-Host "`n📍 Testing Token Launcher Backend..." -ForegroundColor Yellow

# Test 1: Health Check
Write-Host "`n[1/3] Testing Health Endpoint..." -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri "$BACKEND_URL/health" -Method GET -ErrorAction Stop
    Write-Host "✅ Health Check Passed" -ForegroundColor Green
    Write-Host "Response: $($response | ConvertTo-Json)" -ForegroundColor DarkGreen
}
catch {
    Write-Host "❌ Health Check Failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Make sure backend is running on $BACKEND_URL" -ForegroundColor Yellow
    exit 1
}

# Test 2: Prepare Test Image
Write-Host "`n[2/3] Preparing Test Image..." -ForegroundColor Cyan

if (Test-Path $TEST_IMAGE_PATH) {
    Write-Host "✅ Test image already exists: $TEST_IMAGE_PATH" -ForegroundColor Green
}
else {
    Write-Host "Creating minimal test PNG..." -ForegroundColor Yellow
    # 1x1 transparent PNG in base64
    $imageBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
    $imageBytes = [Convert]::FromBase64String($imageBase64)
    [System.IO.File]::WriteAllBytes($TEST_IMAGE_PATH, $imageBytes)
    Write-Host "✅ Test image created: $TEST_IMAGE_PATH" -ForegroundColor Green
}

# Test 3: Launch Token
Write-Host "`n[3/3] Testing Token Launch Endpoint..." -ForegroundColor Cyan

$userPrompt = @{
    idea = "AI-powered meme token for crypto traders"
    tone = "degen"
    symbolHint = "AIME"
    notes = "Should trend with current AI narratives"
} | ConvertTo-Json -Compress

$launchConfig = @{
    devBuySol = 0.2
    slippage = 10
    priorityFee = 0.0005
    pool = "pump"
} | ConvertTo-Json -Compress

Write-Host "Sending launch request..." -ForegroundColor Gray

try {
    $form = @{
        userPrompt = $userPrompt
        launchConfig = $launchConfig
        image = Get-Item $TEST_IMAGE_PATH
    }
    
    $response = Invoke-RestMethod -Uri "$BACKEND_URL/api/agent/launch" `
        -Method POST `
        -Form $form `
        -ErrorAction Stop
    
    Write-Host "✅ Launch Request Succeeded!" -ForegroundColor Green
    
    Write-Host "`n📊 Response Details:" -ForegroundColor Yellow
    Write-Host "Status: $($response.status)" -ForegroundColor Cyan
    Write-Host "Message: $($response.message)" -ForegroundColor Cyan
    
    if ($response.trendConfidence) {
        Write-Host "Trend Confidence: $($response.trendConfidence)%" -ForegroundColor $(
            if ($response.trendConfidence -ge 70) { "Green" }
            elseif ($response.trendConfidence -ge 40) { "Yellow" }
            else { "Red" }
        )
    }
    
    if ($response.trendVerdict) {
        $verdictColor = @{
            "hot" = "Green"
            "neutral" = "Yellow"
            "dead" = "Red"
        }[$response.trendVerdict]
        Write-Host "Trend Verdict: $($response.trendVerdict)" -ForegroundColor $verdictColor
    }
    
    if ($response.trendReasoning) {
        Write-Host "Reasoning: $($response.trendReasoning)" -ForegroundColor DarkGray
    }
    
    if ($response.status -eq "success" -and $response.token) {
        Write-Host "`n🎉 Token Generated:" -ForegroundColor Green
        Write-Host "  Name: $($response.token.name)"
        Write-Host "  Symbol: $($response.token.symbol)"
        Write-Host "  Lore: $($response.token.lore)"
        if ($response.token.mint) {
            Write-Host "  Mint: $($response.token.mint)"
        }
        if ($response.token.tx) {
            Write-Host "  TX: $($response.token.tx)"
        }
        if ($response.token.tags) {
            Write-Host "  Tags: $($response.token.tags -join ', ')"
        }
    }
    
    Write-Host "`n📋 Full Response:" -ForegroundColor Yellow
    Write-Host ($response | ConvertTo-Json -Depth 10) -ForegroundColor DarkGreen
}
catch {
    Write-Host "❌ Launch Request Failed!" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    
    # Try to parse error response
    try {
        $errorContent = $_.Exception.Response.Content.ReadAsStringAsync().Result
        Write-Host "Details: $errorContent" -ForegroundColor Yellow
    }
    catch {
        # Silent
    }
}

# Summary
Write-Host "`
╔════════════════════════════════════════════════════════════╗
║                    TEST COMPLETE                           ║
╚════════════════════════════════════════════════════════════╝

📍 Backend: $BACKEND_URL
🖼️  Test Image: $TEST_IMAGE_PATH

✅ If all tests passed, your token launcher is working!

Next steps:
1. ✅ Test with Postman using real images
2. ✅ Integrate TokenLauncher.tsx component into main app
3. ✅ Deploy backend to production
4. ✅ Update API URL in frontend component
5. ✅ Test end-to-end launch

See QUICK_START.md for more details.
" -ForegroundColor Cyan

Write-Host ""
