@echo off
setlocal enabledelayedexpansion

REM ============================================
REM Create Desktop Shortcut for Financial App
REM ============================================

echo.
echo ╔════════════════════════════════════════╗
echo ║  Creating Desktop Shortcut...          ║
echo ║  Financial Management Dashboard        ║
echo ╚════════════════════════════════════════╝
echo.

REM Run the improved PowerShell script
powershell -NoProfile -ExecutionPolicy Bypass -File "create-shortcut-improved.ps1"

pause
endlocal


