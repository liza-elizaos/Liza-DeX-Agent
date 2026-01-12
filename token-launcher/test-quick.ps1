# Ultra-fast test script
Write-Host "`n[TEST] QUICK TEST`n" -ForegroundColor Cyan

# Test 1: Can we reach the server at all?
Write-Host "[1] Checking if server is alive..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/health" -Method GET -TimeoutSec 2
    Write-Host "    [OK] Server is UP (Status: $($response.StatusCode))" -ForegroundColor Green
    Write-Host "    Response: $($response.Content)" -ForegroundColor Gray
} catch {
    Write-Host "    [FAIL] Server not responding!" -ForegroundColor Red
    Write-Host "    Error: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Test 2: POST to debug endpoint
Write-Host "[2] Testing debug endpoint..." -ForegroundColor Yellow
Write-Host "    Time: $(Get-Date -Format 'HH:mm:ss.fff')" -ForegroundColor Gray

$json = @"
{
  "userPrompt": {
    "idea": "test token",
    "tone": "fun",
    "symbolHint": "TST"
  },
  "override": false
}
"@

try {
    $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
    
    $response = Invoke-WebRequest `
        -Uri "http://localhost:3001/api/agent/debug" `
        -Method POST `
        -Body $json `
        -ContentType "application/json" `
        -TimeoutSec 10 `
        -UseBasicParsing
    
    $stopwatch.Stop()
    
    Write-Host "    [OK] Response in $($stopwatch.ElapsedMilliseconds)ms" -ForegroundColor Green
    Write-Host "    Status: $($response.StatusCode)" -ForegroundColor Gray
    Write-Host ""
    Write-Host "[Response]" -ForegroundColor Cyan
    $response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 5
    
} catch {
    Write-Host "    [FAIL] Request failed" -ForegroundColor Red
    Write-Host "    Error: $($_.Exception.Message)" -ForegroundColor Red
    
    if ($_.Exception.Response) {
        Write-Host "    Status: $($_.Exception.Response.StatusCode)" -ForegroundColor Yellow
    }
}

Write-Host "`n[Complete]`n" -ForegroundColor Cyan
