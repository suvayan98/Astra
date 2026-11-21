Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "  Deploying TerraCity AI to Firebase Project: project--astra" -ForegroundColor Cyan
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Step 1: Building latest production frontend..." -ForegroundColor Yellow
Set-Location frontend
npm.cmd run build
Set-Location ..
Write-Host ""
Write-Host "Step 2: Deploying to Firebase Hosting..." -ForegroundColor Yellow
npx.cmd firebase-tools deploy --only hosting --project project--astra
Write-Host ""
Write-Host "Live URL: https://project--astra.web.app" -ForegroundColor Green
