# 🚀 Hướng Dẫn Truy Cập Nhanh

## Cách 1: Click để Khởi Động + Mở Browser (LỮA CHỌN)

**Cách dễ nhất - Chỉ cần double-click:**

- Tìm file `start-app.bat` trong thư mục dự án
- Double-click vào file này
- Server sẽ khởi động và tự động mở ứng dụng trong browser

```
📁 testai
└── start-app.bat  👈 Double-click file này!
```

## Cách 2: Chỉ Khởi Động Server

Nếu bạn muốn khởi động server mà không mở browser:

- Double-click vào `start-dev.bat`
- Mở browser và truy cập: http://localhost:5173

## Cách 3: Tạo Desktop Shortcut với Icon 💰 (KHUYẾN NGHỊ)

### Phương pháp A: Double-click file tạo shortcut (DỄ NHẤT) ⭐

1. Tìm file `create-desktop-shortcut.bat` trong thư mục dự án
2. **Double-click** file này
3. Shortcut sẽ được tạo tự động trên Desktop với icon và tiêu đề

```
📁 testai
├── start-app.bat                    # Khởi động app
├── create-desktop-shortcut.bat      # 👈 Double-click để tạo shortcut!
├── create-shortcut-improved.ps1     # Script PowerShell (được gọi bởi .bat)
└── create-shortcut.ps1              # Script PowerShell cũ
```

**Result:**

- ✓ Shortcut được tạo trên Desktop
- ✓ Icon tự động được đặt
- ✓ Bạn có thể double-click shortcut để khởi động ứng dụng

### Phương pháp B: Chạy PowerShell Script trực tiếp (Yêu cầu Admin)

1. Click chuột phải vào `create-shortcut-improved.ps1`
2. Chọn **Run with PowerShell**
3. Hoặc mở PowerShell Admin và chạy:

```powershell
# Trong thư mục dự án, chạy như Admin
.\create-shortcut-improved.ps1
```

**Kết quả:** Shortcut "Financial Management" sẽ xuất hiện trên Desktop!

### Phương pháp C: Dùng File PowerShell cũ

1. Click chuột phải vào `create-shortcut.ps1`
2. Chọn **Run with PowerShell**
3. Hoặc chạy: `.\create-shortcut.ps1`

### Phương pháp D: Tạo Manual (Không cần script)

1. Nhấp chuột phải vào `start-app.bat`
2. Chọn **Send to** > **Desktop (create shortcut)**

Hoặc:

1. Nhấp chuột phải trên desktop
2. Chọn **New** > **Shortcut**
3. Paste đường dẫn:

```
cmd.exe /c "C:\ADMIN\Code CPC1HN\testai\start-app.bat"
```

4. Đặt tên: **Financial Management**
5. Nhấp **Finish**

## 💡 Mẹo Sử Dụng

### Giữ Server Chạy

File batch sẽ tự động:

- ✓ Check dependencies (npm packages)
- ✓ Khởi động server
- ✓ Mở browser
- ✓ Hiển thị thông tin hữu ích

**Quan trọng:** Giữ cửa sổ Command Prompt/PowerShell mở để server chạy liên tục.

### Dừng Server

- Nhấp vào cửa sổ command
- Nhấn **Ctrl + C**
- Gõ **Y** rồi nhấn **Enter**

### Lỗi "Port 5173 đang sử dụng"

Nếu cổng 5173 đã được sử dụng:

```bash
# Tìm process sử dụng port
netstat -ano | findstr :5173

# Hoặc thay port trong vite.config.ts
# Đổi port: 5173 thành port khác (vd: 5174)
```

## 📋 Checklist Lần Đầu

- [ ] Cấu hình Firebase (nếu muốn lưu dữ liệu)
  - [ ] Tạo `.env.local`
  - [ ] Thêm Firebase config
- [ ] Double-click `start-app.bat`
- [ ] Ứng dụng mở tại http://localhost:5173
- [ ] Thử thêm giao dịch mới

## 🔗 URLs Hữu Ích

- **App:** http://localhost:5173
- **Firebase Console:** https://console.firebase.google.com
- **Documentation:** Xem file SETUP.md

---

**Bạn đã sẵn sàng!** Chỉ cần double-click `start-app.bat` để bắt đầu! 🚀
