@echo off
chcp 65001 >nul
REM Financial Management Dashboard - Start and Open

echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║     💰 Financial Management Dashboard - QUICK START 💰      ║
echo ║                                                              ║
echo ║  1. Khởi động server...                                     ║
echo ║  2. Mở trình duyệt...                                       ║
echo ║  3. Truy cập http://localhost:5173                          ║
echo ║                                                              ║
echo ║  Chú ý: Hãy giữ cửa sổ này mở để server chạy               ║
echo ║                                                              ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.

REM Check if node_modules exists
if not exist "node_modules" (
    echo ⚠️  Dependencies chưa được cài đặt. Đang cài...
    call npm install
)

echo ✓ Khởi động server...
REM Start server in background
start npm run dev

REM Wait for server to start
timeout /t 3 /nobreak

REM Open browser
start http://localhost:5173

echo.
echo ✓ Server đã khởi động tại http://localhost:5173
echo ✓ Trình duyệt sẽ mở sau giây lát...
echo.
echo 💡 Gợi ý:
echo    - Giữ cửa sổ này mở để server chạy
echo    - Nếu server không mở được, chạy start-dev.bat
echo    - Nhấn Ctrl+C để dừng server
echo.

pause
