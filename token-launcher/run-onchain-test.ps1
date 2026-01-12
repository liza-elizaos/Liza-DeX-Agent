Write-Host "`n🚀 ON-CHAIN TOKEN LAUNCH TEST" -ForegroundColor Cyan
Write-Host "=============================" -ForegroundColor Cyan
Write-Host ""

$API_URL = "http://localhost:3001"
$IMAGE_PATH = "C:\temp\test_onchain.png"

# Create test image
Write-Host "[1/3] Creating test image..." -ForegroundColor Yellow
$imageBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
$imageBytes = [Convert]::FromBase64String($imageBase64)
New-Item -ItemType Directory -Path "C:\temp" -Force -ErrorAction SilentlyContinue | Out-Null
[System.IO.File]::WriteAllBytes($IMAGE_PATH, $imageBytes)
Write-Host "✅ Image created: $IMAGE_PATH`n" -ForegroundColor Green

# Test health
Write-Host "[2/3] Checking backend health..." -ForegroundColor Yellow
$health = Invoke-RestMethod -Uri "$API_URL/health" -Method GET -ErrorAction Stop
Write-Host "✅ Backend online - Status: $($health.status)`n" -ForegroundColor Green

# Launch token
Write-Host "[3/3] Launching token on-chain..." -ForegroundColor Yellow
Write-Host "Concept: Revolutionary AI meme token" -ForegroundColor Gray
Write-Host "Dev Buy: 0.3 SOL`n" -ForegroundColor Gray

$userPrompt = '{"idea":"Revolutionary AI meme token for crypto traders","tone":"degen","symbolHint":"AITRX","notes":"AI and meme culture"}'
$launchConfig = '{"devBuySol":0.3,"slippage":10,"priorityFee":0.0005,"pool":"pump"}'

# Create multipart form
$client = New-Object System.Net.Http.HttpClient
$content = New-Object System.Net.Http.MultipartFormDataContent

$content.Add((New-Object System.Net.Http.StringContent($userPrompt)), "userPrompt")
$content.Add((New-Object System.Net.Http.StringContent($launchConfig)), "launchConfig")

$fileBytes = [System.IO.File]::ReadAllBytes($IMAGE_PATH)
$fileContent = New-Object System.Net.Http.ByteArrayContent($fileBytes)
$fileContent.Headers.ContentType = "image/png"
$content.Add($fileContent, "image", "token.png")

# Send request
Write-Host "Sending request to API..." -ForegroundColor Cyan
$response = $client.PostAsync("$API_URL/api/agent/launch", $content).Result
$responseContent = $response.Content.ReadAsStringAsync().Result

$result = $responseContent | ConvertFrom-Json

Write-Host "`n════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "✅ RESPONSE RECEIVED" -ForegroundColor Green
Write-Host "════════════════════════════════════════════`n" -ForegroundColor Cyan

Write-Host "Status: $($result.status)" -ForegroundColor $(if ($result.status -eq "success") { "Green" } else { "Yellow" })
Write-Host "Message: $($result.message)" -ForegroundColor White

if ($result.trendConfidence) {
    $confColor = if ($result.trendConfidence -ge 70) { "Green" } else { "Yellow" }
    Write-Host "Trend Confidence: $($result.trendConfidence)%" -ForegroundColor $confColor
}

if ($result.trendVerdict) {
    $verdictColor = @{ "hot" = "Green"; "neutral" = "Yellow"; "dead" = "Red" }[$result.trendVerdict]
    Write-Host "Verdict: $($result.trendVerdict)" -ForegroundColor $verdictColor
}

if ($result.trendReasoning) {
    Write-Host "Reasoning: $($result.trendReasoning)" -ForegroundColor White
}

if ($result.status -eq "success" -and $result.token) {
    Write-Host "`n🎉 TOKEN LAUNCHED!" -ForegroundColor Green
    Write-Host "  Name: $($result.token.name)"
    Write-Host "  Symbol: $($result.token.symbol)"
    Write-Host "  Lore: $($result.token.lore)"
    
    if ($result.token.mint) {
        Write-Host "  Mint: $($result.token.mint)" -ForegroundColor Cyan
        Write-Host "  View: https://solscan.io/token/$($result.token.mint)" -ForegroundColor Cyan
    }
    
    if ($result.token.tx) {
        Write-Host "  TX: $($result.token.tx)" -ForegroundColor Cyan
        Write-Host "  View: https://solscan.io/tx/$($result.token.tx)" -ForegroundColor Cyan
    }
}

Write-Host "`nFull Response:`n" -ForegroundColor Cyan
Write-Host ($result | ConvertTo-Json -Depth 10) -ForegroundColor DarkGray
Write-Host ""
