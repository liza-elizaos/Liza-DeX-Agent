@echo off
setlocal enabledelayedexpansion

echo 🚀 Pump.fun Dashboard Setup (Windows)
echo ====================================
echo.

REM Check Node.js
node -v >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed
    echo Download from: https://nodejs.org
    exit /b 1
)

for /f "tokens=*" %%i in ('node -v') do set NODE_VERSION=%%i
for /f "tokens=*" %%i in ('npm -v') do set NPM_VERSION=%%i

echo ✅ Node.js: %NODE_VERSION%
echo ✅ npm: %NPM_VERSION%
echo.

REM Install dependencies
echo 📦 Installing dependencies...
call npm install

if errorlevel 1 (
    echo ❌ Failed to install dependencies
    exit /b 1
)

echo ✅ Dependencies installed
echo.
echo ✅ Setup complete!
echo.
echo 🚀 To start development:
echo    npm run dev
echo.
echo 📦 To build for production:
echo    npm run build
echo.
echo 🌐 To deploy to Vercel:
echo    npm run deploy
echo.

pause
