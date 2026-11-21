@echo off
title TerraAI Backend
color 0a
cd /d "%~dp0"
echo Starting TerraAI FastAPI Geospatial Backend on port 8000...
python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
pause
