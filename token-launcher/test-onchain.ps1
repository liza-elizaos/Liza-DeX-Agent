#!/usr/bin/env pwsh
# On-Chain Token Launch Test Script

Write-Host "`n╔════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║     🚀 ON-CHAIN TOKEN LAUNCHER TEST                    ║" -ForegroundColor Cyan
Write-Host "║     Testing Real Token Launch on Pump.fun              ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

$API_URL = "http://localhost:3001"
$IMAGE_PATH = "C:\temp\test_onchain_token.png"

# Create test image
Write-Host "[1/4] Creating test image..." -ForegroundColor Yellow
$imageBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
$imageBytes = [Convert]::FromBase64String($imageBase64)
New-Item -ItemType Directory -Path "C:\temp" -Force -ErrorAction SilentlyContinue | Out-Null
[System.IO.File]::WriteAllBytes($IMAGE_PATH, $imageBytes)
Write-Host "✅ Test image created: $IMAGE_PATH`n" -ForegroundColor Green

# Test 1: Health Check
Write-Host "[2/4] Verifying backend health..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "$API_URL/health" -Method GET -ErrorAction Stop
    Write-Host "✅ Backend is ONLINE" -ForegroundColor Green
    Write-Host "   Status: $($health.status)" -ForegroundColor Green
    Write-Host "   Time: $($health.timestamp)`n" -ForegroundColor Green
} catch {
    Write-Host "❌ Backend OFFLINE: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Test 2: Launch Token (First Attempt)
Write-Host "[3/4] Attempting on-chain token launch..." -ForegroundColor Yellow
Write-Host "Concept: Revolutionary AI meme token" -ForegroundColor Gray
Write-Host "Dev Buy: 0.3 SOL" -ForegroundColor Gray
Write-Host ""

$userPromptObj = @{
    idea = "Revolutionary AI meme token for crypto degens"
    tone = "degen"
    symbolHint = "AITRX"
    notes = "Combining artificial intelligence with meme culture for maximum utility"
}

$launchConfigObj = @{
    devBuySol = 0.3
    slippage = 10
    priorityFee = 0.0005
    pool = "pump"
}

$userPromptJson = ConvertTo-Json -InputObject $userPromptObj -Compress
$launchConfigJson = ConvertTo-Json -InputObject $launchConfigObj -Compress

Write-Host "Sending multipart request to $API_URL/api/agent/launch...`n" -ForegroundColor Cyan

try {
    # Use WebClient for multipart form
    $client = New-Object System.Net.Http.HttpClient
    $content = New-Object System.Net.Http.MultipartFormDataContent
    
    # Add form fields
    $content.Add((New-Object System.Net.Http.StringContent($userPromptJson)), "userPrompt")
    $content.Add((New-Object System.Net.Http.StringContent($launchConfigJson)), "launchConfig")
    
    # Add file
    $fileContent = New-Object System.Net.Http.ByteArrayContent([System.IO.File]::ReadAllBytes($IMAGE_PATH))
    $fileContent.Headers.ContentType = "image/png"
    $content.Add($fileContent, "image", "test_token.png")
    
    $response = $client.PostAsync("$API_URL/api/agent/launch", $content).Result
    $responseContent = $response.Content.ReadAsStringAsync().Result
    
    $result = $responseContent | ConvertFrom-Json
    
    Write-Host "════════════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host "📊 RESPONSE FROM BLOCKCHAIN" -ForegroundColor Cyan
    Write-Host "════════════════════════════════════════════════════════`n" -ForegroundColor Cyan
    
    Write-Host "Status: $($result.status)" -ForegroundColor $(if ($result.status -eq "success") { "Green" } else { "Yellow" })
    Write-Host "Message: $($result.message)" -ForegroundColor White
    Write-Host ""
    
    if ($result.trendConfidence) {
        $confColor = if ($result.trendConfidence -ge 70) { "Green" } elseif ($result.trendConfidence -ge 40) { "Yellow" } else { "Red" }
        Write-Host "Trend Confidence: $($result.trendConfidence)%" -ForegroundColor $confColor
    }
    
    if ($result.trendVerdict) {
        $verdictColor = @{ "hot" = "Green"; "neutral" = "Yellow"; "dead" = "Red" }[$result.trendVerdict]
        Write-Host "Trend Verdict: $($result.trendVerdict)" -ForegroundColor $verdictColor
    }
    
    if ($result.trendReasoning) {
        Write-Host "Analysis: $($result.trendReasoning)" -ForegroundColor White
    }
    
    Write-Host ""
    
    if ($result.status -eq "success" -and $result.token) {
        Write-Host "════════════════════════════════════════════════════════" -ForegroundColor Green
        Write-Host "🎉 TOKEN SUCCESSFULLY LAUNCHED ON-CHAIN!" -ForegroundColor Green
        Write-Host "════════════════════════════════════════════════════════" -ForegroundColor Green
        Write-Host ""
        Write-Host "Token Information:" -ForegroundColor Green
        Write-Host "  Name: $($result.token.name)" -ForegroundColor White
        Write-Host "  Symbol: $($result.token.symbol)" -ForegroundColor White
        Write-Host "  Lore: $($result.token.lore)" -ForegroundColor White
        Write-Host ""
        
        if ($result.token.mint) {
            Write-Host "Blockchain Details:" -ForegroundColor Green
            Write-Host "  Mint Address: $($result.token.mint)" -ForegroundColor Cyan
            Write-Host "  🔗 View: https://solscan.io/token/$($result.token.mint)" -ForegroundColor Cyan
        }
        
        if ($result.token.tx) {
            Write-Host "  Transaction: $($result.token.tx)" -ForegroundColor Cyan
            Write-Host "  🔗 View: https://solscan.io/tx/$($result.token.tx)" -ForegroundColor Cyan
        }
        
        if ($result.token.tags) {
            Write-Host "  Tags: $($result.token.tags -join ', ')" -ForegroundColor White
        }
        Write-Host ""
    }
    elseif ($result.status -eq "rejected") {
        Write-Host "════════════════════════════════════════════════════════" -ForegroundColor Yellow
        Write-Host "⚠️ TREND VALIDATION REJECTED" -ForegroundColor Yellow
        Write-Host "════════════════════════════════════════════════════════" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "The token concept doesn't match current market trends." -ForegroundColor Yellow
        Write-Host ""
        Write-Host "To force launch despite trend warnings, use override=true" -ForegroundColor Cyan
        Write-Host ""
    }
    
    Write-Host "Full JSON Response:" -ForegroundColor Cyan
    Write-Host ($result | ConvertTo-Json -Depth 10) -ForegroundColor DarkGray
}
catch {
    Write-Host "❌ Request Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host $_.Exception -ForegroundColor Red
}

Write-Host "`n[4/4] Test complete!" -ForegroundColor Yellow
Write-Host "`n════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "✅ ON-CHAIN TEST FINISHED" -ForegroundColor Cyan
Write-Host "════════════════════════════════════════════════════════`n" -ForegroundColor Cyan
