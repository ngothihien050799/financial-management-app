s # Financial Management Dashboard

Một ứng dụng quản lý thu chi tài chính hiện đại xây dựng bằng Vue 3, Vite và Vuetify.

## Tính Năng

- 📊 **Dashboard thời gian thực**: Hiển thị các chỉ số tài chính chính
- 💰 **Quản lý Thu Chi**: Thêm, sửa, xóa các giao dịch thu chi
- 📈 **Biểu đồ và Thống Kê**: Phân tích chi tiêu theo danh mục, xu hướng hàng tháng
- 🎨 **Giao diện hiện đại**: Thiết kế Material Design với Vuetify
- 🔍 **Tìm kiếm và Lọc**: Tìm kiếm và lọc giao dịch theo danh mục, loại
- 📱 **Responsive Design**: Hoạt động tốt trên mọi kích thước màn hình

## Cài Đặt

### Yêu Cầu

- Node.js >= 16.x
- npm hoặc yarn

### Bước Cài Đặt

1. **Clone hoặc tạo dự án**

```bash
cd testai
```

2. **Cài đặt các gói phụ thuộc**

```bash
npm install
```

3. **Chạy máy chủ phát triển**

```bash
npm run dev
```

Ứng dụng sẽ mở tại `http://localhost:5173`

4. **Build cho production**

```bash
npm run build
```

## Cấu Trúc Dự Án

```
src/
├── components/          # Các component tái sử dụng
├── pages/              # Các trang chính
│   ├── Dashboard.vue   # Trang tổng quan
│   ├── IncomeExpense.vue  # Quản lý thu chi
│   └── Analytics.vue   # Thống kê & phân tích
├── stores/             # Quản lý trạng thái
│   └── transactionStore.ts
├── types/              # Định nghĩa TypeScript
│   └── index.ts
├── App.vue            # Component chính
└── main.ts            # Điểm nhập vào
```

## Công Nghệ

- **Vue 3**: Framework JavaScript hiện đại
- **Vite**: Build tool nhanh
- **Vuetify**: Thư viện UI Material Design
- **Chart.js**: Thư viện vẽ biểu đồ
- **TypeScript**: Ngôn ngữ lập trình an toàn kiểu

## Các Danh Mục Mặc Định

### Thu Nhập

- Lương
- Phụ cấp
- Tiền thưởng
- Đầu tư
- Khác

### Chi Tiêu

- Ăn uống
- Giao thông
- Sức khỏe
- Giáo dục
- Giải trí
- Mua sắm
- Nhà cửa
- Khác

## Sử Dụng

### Dashboard

- Xem tổng thu nhập, chi tiêu, số dư
- Xem biểu đồ phân tích chi tiêu và thu nhập theo danh mục
- Xem xu hướng thu chi hàng tháng
- Xem 5 giao dịch gần đây nhất

### Quản Lý Thu Chi

- Thêm giao dịch mới (chọn loại là Thu hoặc Chi)
- Tìm kiếm giao dịch theo mô tả
- Lọc theo loại hoặc danh mục
- Chỉnh sửa thông tin giao dịch
- Xóa giao dịch

### Thống Kê & Báo Cáo

- Xem biểu đồ phân tích chi tiêu và thu nhập
- So sánh thu chi theo tháng
- Xem thống kê chi tiết theo danh mục
- Xem báo cáo tóm tắt (tỷ lệ chi/thu, số dư)

## Cấu Hình Firebase 🔥

Ứng dụng sử dụng Firebase Firestore để lưu trữ dữ liệu giao dịch một cách persistent.

### Bước 1: Tạo Project Firebase

1. Truy cập [Firebase Console](https://console.firebase.google.com)
2. Nhấp vào "Create Project" hoặc chọn một project hiện có
3. Kích hoạt Firestore Database:
   - Chọn "Build" > "Firestore Database"
   - Nhấp "Create Database"
   - Chọn chế độ "Test Mode" (cho development) hoặc "Production"
   - Chọn vị trí (ví dụ: asia-southeast1)

### Bước 2: Lấy Firebase Config

1. Trong Firebase Console, chọn Project Settings ⚙️
2. Chọn tab "Your apps"
3. Nếu chưa có web app, nhấp "Add app" > "Web"
4. Lấy config object

### Bước 3: Cấu Hình Environment Variables

1. Sao chép file `.env.example` thành `.env.local`:

```bash
cp .env.example .env.local
```

2. Điền các giá trị Firebase vào `.env.local`:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### Bước 4: Cấu Hình Firestore Security Rules

Thay thế rules trong Firebase Console:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Cho phép đọc/ghi cho tất cả (development)
    match /transactions/{document=**} {
      allow read, write: if true;
    }

    // Hoặc với authentication (production):
    // match /transactions/{document=**} {
    //   allow read, write: if request.auth != null;
    // }
  }
}
```

### Bước 5: Chạy Ứng Dụng

```bash
npm run dev
```

Các giao dịch bây giờ sẽ được lưu trong Firebase Firestore!

## Lưu Ý

- Dữ liệu được lưu trữ an toàn trong Firebase Firestore
- Các giao dịch mẫu sẽ được tải lên khi lần đầu khởi động
- Nếu Firebase không được cấu hình, ứng dụng sẽ sử dụng dữ liệu local
- Đảm bảo bạn đã cấu hình `.env.local` trước khi chạy

## Triển Khai

Để deploy lên production, build ứng dụng và upload thư mục `dist` lên web server của bạn.

```bash
npm run build
# Các file sẵn sàng ở thư mục dist/
```

## Tương Lai

- [x] Firebase Firestore integration
- [x] Persistent data storage
- [ ] User authentication
- [ ] Export reports (PDF/Excel)
- [ ] Multi-currency support
- [ ] Budget planning
- [ ] Recurring transactions
- [ ] Dark theme support

## License

MIT

## Author

Financial Management Dashboard - 2024
