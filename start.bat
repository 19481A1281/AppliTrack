@echo off
echo ============================================
echo   AppliTrack - Inbox Pipeline Scanner Setup
echo ============================================
echo.
echo Installing dependencies...
cd /d "%~dp0"
npm install --legacy-peer-deps
echo.
echo Starting development server...
npm run dev
