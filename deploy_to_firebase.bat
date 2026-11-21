@echo off
title Deploy TerraCity AI to Firebase
echo ======================================================================
echo   Deploying TerraCity AI to Firebase Project: project--astra
echo ======================================================================
echo.
echo Step 1: Building latest frontend...
cd frontend
call npm.cmd run build
cd ..
echo.
echo Step 2: Deploying to Firebase Hosting...
call npx.cmd firebase-tools deploy --only hosting --project project--astra
echo.
echo ======================================================================
echo Live URL: https://project--astra.web.app
echo ======================================================================
pause
