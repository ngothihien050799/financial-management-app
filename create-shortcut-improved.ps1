# Create Desktop Shortcut for Financial Management App
# Run as Administrator

# Get desktop path using the Registry method (more reliable)
try {
    $RegPath = "HKCU:\Software\Microsoft\Windows\CurrentVersion\Explorer\Shell Folders"
    $DesktopPath = (Get-ItemProperty -Path $RegPath -Name Desktop).Desktop
    
    # Handle OneDrive and special characters
    if (-not (Test-Path $DesktopPath)) {
        $DesktopPath = [Environment]::GetFolderPath("Desktop")
    }
    
    $ShortcutPath = Join-Path -Path $DesktopPath -ChildPath "Financial Management.lnk"
    
    # Check if batch file exists
    $BatchFile = "$PSScriptRoot\start-app.bat"
    if (-not (Test-Path $BatchFile)) {
        Write-Host "❌ Lỗi: File $BatchFile không tìm thấy!" -ForegroundColor Red
        Write-Host ""
        Write-Host "Vui lòng đảm bảo bạn đang chạy script từ thư mục dự án."
        exit 1
    }

    # Create WScript Shell object and shortcut
    $WshShell = New-Object -ComObject WScript.Shell
    $Shortcut = $WshShell.CreateShortcut($ShortcutPath)
    $Shortcut.TargetPath = $BatchFile
    $Shortcut.WorkingDirectory = $PSScriptRoot
    $Shortcut.Description = "Financial Management Dashboard - Quản lý thu chi tài chính"
    $Shortcut.IconLocation = "C:\Windows\System32\cmd.exe, 0"
    $Shortcut.WindowStyle = 1
    $Shortcut.Save()

    Write-Host ""
    Write-Host "✓ Shortcut đã được tạo thành công!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📍 Vị trí: $ShortcutPath" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "✅ Bây giờ bạn có thể:" -ForegroundColor Green
    Write-Host "   1. Tìm 'Financial Management' trên Desktop"
    Write-Host "   2. Double-click để mở ứng dụng"
    Write-Host "   3. Server sẽ tự động khởi động"
    Write-Host "   4. Browser sẽ mở ứng dụng", -ForegroundColor Green
    Write-Host ""
    Write-Host "💡 Tip: Nhấp chuột phải shortcut + 'Pin to Start' để thêm vào Start Menu" -ForegroundColor Yellow
}
catch {
    Write-Host ""
    Write-Host "❌ Lỗi khi tạo shortcut: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "Cách khắc phục:" -ForegroundColor Yellow
    Write-Host "1. Đảm bảo bạn đang chạy PowerShell như Admin"
    Write-Host "2. Chạy lệnh này trước:"
    Write-Host "   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser" -ForegroundColor Cyan
    Write-Host ""
    exit 1
}
