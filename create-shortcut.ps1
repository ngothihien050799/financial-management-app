# Create Desktop Shortcut for Financial Management App
# Run as Administrator

$AppName = "Financial Management"
$BatchFile = "$PSScriptRoot\start-app.bat"
$DesktopPath = [Environment]::GetFolderPath("Desktop")
$ShortcutPath = "$DesktopPath\$AppName.lnk"

try {
    # Check if batch file exists
    if (-not (Test-Path $BatchFile)) {
        Write-Host "❌ Lỗi: File $BatchFile không tìm thấy!" -ForegroundColor Red
        exit 1
    }

    # Create shortcut
    $WshShell = New-Object -ComObject WScript.Shell
    $Shortcut = $WshShell.CreateShortcut($ShortcutPath)
    $Shortcut.TargetPath = $BatchFile
    $Shortcut.WorkingDirectory = $PSScriptRoot
    $Shortcut.Description = "Financial Management Dashboard - Quản lý thu chi tài chính"
    $Shortcut.IconLocation = "C:\Windows\System32\cmd.exe, 0"
    $Shortcut.WindowStyle = 1  # Normal window
    $Shortcut.Save()

    Write-Host "✓ Shortcut đã được tạo thành công!" -ForegroundColor Green
    Write-Host "✓ Vị trí: $ShortcutPath" -ForegroundColor Green
    Write-Host "`n💡 Bây giờ bạn có thể:" -ForegroundColor Cyan
    Write-Host "   1. Tìm shortcut trên desktop"
    Write-Host "   2. Double-click để mở ứng dụng"
    Write-Host "   3. Server sẽ tự động khởi động"
    Write-Host "   4. Browser sẽ mở ứng dụng", -ForegroundColor Cyan
}
catch {
    Write-Host "❌ Lỗi: $_" -ForegroundColor Red
    exit 1
}
