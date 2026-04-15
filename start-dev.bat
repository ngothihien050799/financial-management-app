@echo off
chcp 65001 >nul
REM Financial Management Dashboard - Start Server

echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║     💰 Financial Management Dashboard - DEV SERVER 💰      ║
echo ║                                                              ║
echo ║  Khởi động server phát triển...                             ║
echo ║  Server sẽ chạy tại: http://localhost:5173                  ║
echo ║                                                              ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.

REM Check if node_modules exists
if not exist "node_modules" (
    echo ⚠️  Dependencies chưa được cài đặt. Đang cài...
    call npm install
)

echo ✓ Khởi động server...
echo.

REM Start dev server
npm run dev

pause
