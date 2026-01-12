# Token Launcher On-Chain Test Script

Write-Host "Token Launcher On-Chain Test" -ForegroundColor Cyan
Write-Host "================================`n" -ForegroundColor Cyan

# Step 1: Health Check
Write-Host "Step 1: Health Check" -ForegroundColor Yellow
try {
    $healthResponse = Invoke-RestMethod -Uri "http://localhost:3001/health" -TimeoutSec 5 -ErrorAction Stop
    Write-Host "[OK] Backend is healthy: $($healthResponse.status)" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Backend health check failed: $_" -ForegroundColor Red
    exit 1
}

# Step 2: Create test image
Write-Host "`nStep 2: Create Test Image" -ForegroundColor Yellow
$base64Png = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
$pngBytes = [System.Convert]::FromBase64String($base64Png)

# Ensure temp directory exists
if (-not (Test-Path "C:\temp")) {
    New-Item -ItemType Directory -Path "C:\temp" -Force | Out-Null
}

[System.IO.File]::WriteAllBytes("C:\temp\token.png", $pngBytes)
Write-Host "[OK] Test image created at C:\temp\token.png" -ForegroundColor Green

# Step 3: Prepare token launch request
Write-Host "`nStep 3: Launch Token on Pump.fun" -ForegroundColor Yellow
Write-Host "Preparing multipart form data..." -ForegroundColor Gray

$userPrompt = @{
    idea = "SHINA - Revolutionary AI-powered crypto intelligence platform"
    tone = "professional"
    symbolHint = "SHINA"
    notes = "Advanced market analysis and trading signals for Solana traders"
}

$launchConfig = @{
    devBuySol = 0.1
    slippage = 10
    priorityFee = 0.0005
    pool = "pump"
}

# Create multipart form data
$boundary = [System.Guid]::NewGuid().ToString()
$multipartContent = @()

# Add userPrompt field
$userPromptJson = $userPrompt | ConvertTo-Json -Compress
$multipartContent += "--$boundary"
$multipartContent += 'Content-Disposition: form-data; name="userPrompt"'
$multipartContent += ""
$multipartContent += $userPromptJson

# Add launchConfig field
$launchConfigJson = $launchConfig | ConvertTo-Json -Compress
$multipartContent += "--$boundary"
$multipartContent += 'Content-Disposition: form-data; name="launchConfig"'
$multipartContent += ""
$multipartContent += $launchConfigJson

# Add image file
$imageBytes = [System.IO.File]::ReadAllBytes("C:\temp\token.png")
$imageBase64 = [System.Convert]::ToBase64String($imageBytes)

$multipartContent += "--$boundary"
$multipartContent += 'Content-Disposition: form-data; name="image"; filename="token.png"'
$multipartContent += 'Content-Type: image/png'
$multipartContent += ""
$multipartContent += $imageBase64

$multipartContent += "--$boundary--"
$multipartContent += ""

$body = $multipartContent -join "`r`n"

try {
    Write-Host "[REQUEST] Sending to /api/agent/launch..." -ForegroundColor Cyan
    
    $response = Invoke-WebRequest `
        -Uri "http://localhost:3001/api/agent/launch" `
        -Method POST `
        -Body $body `
        -ContentType "multipart/form-data; boundary=$boundary" `
        -TimeoutSec 30 `
        -ErrorAction Stop

    $responseJson = $response.Content | ConvertFrom-Json
    
    Write-Host "`n[SUCCESS] Token Launch Successful!" -ForegroundColor Green
    Write-Host "=================================================" -ForegroundColor Green
    
    Write-Host "`nResponse Details:" -ForegroundColor Cyan
    Write-Host "  Status: $($responseJson.status)" -ForegroundColor Green
    Write-Host "  Confidence: $($responseJson.confidence)%" -ForegroundColor Green
    Write-Host "  Verdict: $($responseJson.verdict)" -ForegroundColor Green
    
    if ($responseJson.verdict -eq "hot") {
        Write-Host "  [HOT] Market looks promising!" -ForegroundColor Yellow
    }
    
    Write-Host "`nToken Details:" -ForegroundColor Cyan
    Write-Host "  Name: $($responseJson.tokenName)" -ForegroundColor Green
    Write-Host "  Symbol: $($responseJson.tokenSymbol)" -ForegroundColor Green
    Write-Host "  Mint Address: $($responseJson.mint)" -ForegroundColor Green
    Write-Host "  Transaction: $($responseJson.tx)" -ForegroundColor Green
    
    Write-Host "`nVerify On-Chain:" -ForegroundColor Cyan
    Write-Host "  Solscan: https://solscan.io/token/$($responseJson.mint)" -ForegroundColor Blue
    Write-Host "  Transaction: https://solscan.io/tx/$($responseJson.tx)" -ForegroundColor Blue
    
    Write-Host "`n=================================================" -ForegroundColor Green
    
} catch {
    Write-Host "[ERROR] Launch failed: $_" -ForegroundColor Red
    if ($_.Exception.Response) {
        $streamReader = [System.IO.StreamReader]::new($_.Exception.Response.GetResponseStream())
        $errorBody = $streamReader.ReadToEnd()
        Write-Host "`nError details: $errorBody" -ForegroundColor Red
    }
    exit 1
}
