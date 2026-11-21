@echo off
title TerraAI Frontend
color 0b
cd /d "%~dp0frontend"
echo Starting TerraAI Vite React Frontend on port 3000...
npm run dev -- --host 0.0.0.0 --port 3000
pause
