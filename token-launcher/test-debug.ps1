# Simple token launch test - calls debug endpoint first

Write-Host "Token Launch Test" -ForegroundColor Cyan
Write-Host "================" -ForegroundColor Cyan

# Wait for backend to start
Start-Sleep -Seconds 3

Write-Host "`n[1] Testing Debug Endpoint (Agent only)" -ForegroundColor Yellow

$debugBody = @{
    userPrompt = @{
        idea = "SHINA - AI cryptocurrency intelligence"
        tone = "professional"
        symbolHint = "SHINA"
        notes = "Solana trading signals"
    }
    override = $false
} | ConvertTo-Json -Compress

Write-Host "Sending request..." -ForegroundColor Gray
Write-Host $debugBody -ForegroundColor Gray

try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/agent/debug" `
        -Method POST `
        -Body $debugBody `
        -ContentType "application/json" `
        -TimeoutSec 60 `
        -ErrorAction Stop
    
    $data = $response.Content | ConvertFrom-Json
    
    Write-Host "`n[SUCCESS] Response received:" -ForegroundColor Green
    Write-Host "Status: $($data.status)" -ForegroundColor Green
    Write-Host "Confidence: $($data.trendConfidence)%" -ForegroundColor Green
    Write-Host "Verdict: $($data.trendVerdict)" -ForegroundColor Green
    Write-Host "Message: $($data.message)" -ForegroundColor Green
    
    if ($data.token) {
        Write-Host "`nToken Generated:" -ForegroundColor Cyan
        Write-Host "  Name: $($data.token.name)" -ForegroundColor Green
        Write-Host "  Symbol: $($data.token.symbol)" -ForegroundColor Green
    }
    
} catch {
    Write-Host "`n[ERROR] Request failed: $_" -ForegroundColor Red
    exit 1
}
