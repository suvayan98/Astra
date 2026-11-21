@echo off
title TerraAI — Smart City Planning Platform Launcher
color 0b
cd /d "%~dp0"

echo ===================================================================
echo           TERRAAI — SMART CITY PLANNING PLATFORM LAUNCHER
echo ===================================================================
echo.
echo [1/3] Starting FastAPI Geospatial Backend on http://127.0.0.1:8000 ...
start "TerraAI Backend (FastAPI)" cmd /k "cd /d "%~dp0" && python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload"

timeout /t 3 /nobreak >nul

echo [2/3] Starting Vite React Frontend on http://localhost:3000 ...
start "TerraAI Frontend (Vite React)" cmd /k "cd /d "%~dp0frontend" && npm run dev -- --host 0.0.0.0 --port 3000"

timeout /t 3 /nobreak >nul

echo [3/3] Opening default browser at http://localhost:3000 ...
start http://localhost:3000

echo.
echo ===================================================================
echo TerraAI is now actively running!
echo - Frontend URL: http://localhost:3000  (or http://127.0.0.1:3000)
echo - Backend API:  http://127.0.0.1:8000
echo - Swagger Docs: http://127.0.0.1:8000/docs
echo.
echo Keep both terminal windows open while exploring TerraAI.
echo Press any key in this window to close this launcher.
echo ===================================================================
pause >nul
