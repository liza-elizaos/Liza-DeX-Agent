@echo off
REM Token Launcher Test - Without Image
REM Simple JSON POST test

setlocal enabledelayedexpansion

echo.
echo ======================================
echo    Token Launcher On-Chain Test
echo ======================================
echo.

REM Give server time to start
timeout /t 2 /nobreak

echo [1/2] Testing health endpoint...
curl -s http://localhost:3001/health
echo.
echo.

echo [2/2] Launching token WITHOUT image...
echo Sending request to /api/agent/launch
echo.

curl -X POST http://localhost:3001/api/agent/launch ^
  -H "Content-Type: application/json" ^
  -d "{\"userPrompt\":{\"idea\":\"SHINA AI Token - Revolutionary crypto intelligence\",\"tone\":\"professional\",\"symbolHint\":\"SHINA\",\"notes\":\"Advanced market analysis platform\"},\"launchConfig\":{\"devBuySol\":0.1,\"slippage\":10,\"priorityFee\":0.0005,\"pool\":\"pump\"}}" ^
  -w "\n\nHTTP Status: %%{http_code}\n"

echo.
echo Done!
pause
