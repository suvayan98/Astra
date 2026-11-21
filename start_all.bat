@echo off
echo ========================================================
echo Starting TerraAI Platform (Backend + Frontend)
echo ========================================================
echo.
echo 1. Launching Backend (FastAPI on port 8000)...
start "TerraAI Backend (FastAPI)" cmd /k "cd /d %~dp0backend && python run.py"

echo 2. Launching Frontend (Vite on port 5173)...
start "TerraAI Frontend (Vite)" cmd /k "set PATH=C:\Program Files\nodejs;%%PATH%% && cd /d %~dp0frontend && npm run dev"

echo.
echo ========================================================
echo TerraAI is running!
echo Frontend: http://localhost:5173
echo Backend:  http://127.0.0.1:8000
echo API Docs: http://127.0.0.1:8000/docs
echo ========================================================
echo.
pause
