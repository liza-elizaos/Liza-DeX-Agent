@echo off
setlocal enabledelayedexpansion

echo.
echo ========================================
echo Testing Token Creation API
echo ========================================
echo.

echo Waiting for server to be ready...
timeout /t 2 /nobreak

echo.
echo Testing health endpoint...
curl -s http://localhost:3001/health | more

echo.
echo.
echo ========================================
echo Test complete!
echo ========================================
echo.
