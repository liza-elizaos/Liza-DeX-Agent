#!/usr/bin/env pwsh
# Push README to GitHub

Write-Host "`n" -NoNewline
Write-Host "================================" -ForegroundColor Cyan
Write-Host "  PUSHING TO GITHUB" -ForegroundColor Cyan
Write-Host "================================`n" -ForegroundColor Cyan

Set-Location "d:\shina"

# Stage README
Write-Host "📋 Staging README.md..." -ForegroundColor Yellow
git add README.md
Write-Host "✓ Staged`n" -ForegroundColor Green

# Commit
Write-Host "📝 Creating commit..." -ForegroundColor Yellow
git commit -m "docs: Add official social links and website badges - Liza_ElizaOS, 0xblockXBT, liza-dexagent.xyz"
Write-Host ""

# Push
Write-Host "🔗 Pushing to GitHub..." -ForegroundColor Yellow
git push origin main
Write-Host ""

# Verify
Write-Host "✅ PUSHED SUCCESSFULLY!" -ForegroundColor Green
Write-Host "`n📊 Commit Details:" -ForegroundColor Cyan
git log --oneline | Select-Object -First 3

Write-Host "`n🔍 Repository Status:" -ForegroundColor Cyan
Write-Host "Branch: $(git rev-parse --abbrev-ref HEAD)" -ForegroundColor White
Write-Host "Remote: $(git config --get remote.origin.url)" -ForegroundColor White
Write-Host "Latest Commit: $(git log --format=%h -1)" -ForegroundColor White

Write-Host "`n🎉 README is now live on GitHub!" -ForegroundColor Green
Write-Host "View at: https://github.com/liza-elizaos/Liza-DeX-Agent/blob/main/README.md`n" -ForegroundColor Cyan
