# Test script for token launcher API
Write-Host "`n[TEST] Token Launcher API`n" -ForegroundColor Cyan

# Test 1: Health check
Write-Host "[1] Testing health endpoint..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "http://localhost:3001/api/health" -Method GET -TimeoutSec 5
    Write-Host "[OK] Health: $($health.status)" -ForegroundColor Green
} catch {
    Write-Host "[FAIL] Health check failed: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Test 2: Debug endpoint
Write-Host "[2] Testing debug endpoint..." -ForegroundColor Yellow

$body = @{
    userPrompt = @{
        idea = "AI terminal meme"
        tone = "degen"
        symbolHint = "AI"
    }
    override = $false
} | ConvertTo-Json -Depth 10

Write-Host "[Request]" -ForegroundColor Gray
Write-Host $body -ForegroundColor DarkGray
Write-Host ""

try {
    Write-Host "[Request] Sending (30s timeout)..." -ForegroundColor Gray
    
    $response = Invoke-RestMethod `
        -Uri "http://localhost:3001/api/agent/debug" `
        -Method POST `
        -Body $body `
        -ContentType "application/json" `
        -TimeoutSec 30
    
    Write-Host "[OK] Success!" -ForegroundColor Green
    Write-Host ""
    Write-Host "[Response]" -ForegroundColor Cyan
    $response | ConvertTo-Json -Depth 10 | Write-Host
    
} catch {
    Write-Host "[FAIL] Request failed: $_" -ForegroundColor Red
}

Write-Host "`n[Complete]`n" -ForegroundColor Cyan
