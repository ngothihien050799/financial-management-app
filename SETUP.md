# Firebase Integration Setup Guide

## ✅ Firebase Integration Complete!

Ứng dụng của bạn hiện đã được tích hợp hoàn toàn với Firebase Firestore để lưu trữ dữ liệu giao dịch persistent.

## 🔧 Setup Instructions

### Bước 1: Tạo Firebase Project

1. Truy cập [Firebase Console](https://console.firebase.google.com)
2. Nhấp "Create Project" hoặc chọn project hiện có
3. Đặt tên project (ví dụ: "Financial Management App")
4. Bật Google Analytics (tùy chọn)
5. Nếu được hỏi, chọn hoặc tạo Google Cloud Project

### Bước 2: Tạo Firestore Database

1. Trong Firebase Console, chọn **Build** > **Firestore Database**
2. Nhấp **Create Database**
3. Chọn chế độ:
   - **Test Mode**: Cho phát triển (cho phép đọc/ghi tất cả)
   - **Production Mode**: Cho production (bảo mật hơn)
4. Chọn vị trí: `asia-southeast1` (hoặc gần bạn nhất)
5. Nhấp **Create**

### Bước 3: Lấy Firebase Config

1. Trong Firebase Console, chọn ⚙️ **Project Settings** (góc trên cùng)
2. Chọn tab **Your apps**
3. Nếu chưa có web app:
   - Nhấp **Add app** > **Web** (</> icon)
   - Đặt tên ứng dụng
   - Nhấp **Register**
4. Sao chép Firebase config:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
};
```

### Bước 4: Cấu Hình Environment Variables

1. Tạo hoặc chỉnh sửa file `.env.local` trong thư mục gốc dự án:

```bash
# Lấy từ Firebase Config ở Bước 3
VITE_FIREBASE_API_KEY=YOUR_API_KEY
VITE_FIREBASE_AUTH_DOMAIN=YOUR_PROJECT.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=YOUR_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET=YOUR_PROJECT.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=YOUR_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID=YOUR_APP_ID
```

**⚠️ LƯU Ý:**

- File `.env.local` không nên commit lên Git (đã được thêm vào `.gitignore`)
- Giữ bí mật API Key của bạn!

### Bước 5: Cấu Hình Firestore Security Rules

1. Trong Firebase Console, chọn **Firestore Database**
2. Chọn tab **Rules**
3. Thay thế tất cả rules bằng:

**Cho Development (Test Mode):**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /transactions/{document=**} {
      allow read, write: if true;
    }
  }
}
```

**Cho Production (Authenticated Users):**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /transactions/{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

4. Nhấp **Publish**

### Bước 6: Khỏi động ứng dụng

```bash
npm run dev
```

Truy cập http://localhost:5173 trong trình duyệt

## 🧪 Test Firebase Integration

### Thêm Giao Dịch:

1. Nhấp vào tab "Quản Lý Thu Chi"
2. Nhấp "Thêm Chi Tiêu" hoặc "Thêm Thu Nhập"
3. Điền thông tin và nhấp "Lưu"
4. Giao dịch sẽ được lưu trong Firestore

### Kiểm tra Firestore:

1. Trong Firebase Console, chọn **Firestore Database**
2. Chọn tab **Data**
3. Bạn sẽ thấy collection `transactions` với các document

### Khác thiết bị:

- Mở ứng dụng trên thiết bị khác với cùng Firebase config
- Chuyến giao dịch sẽ tự động đồng bộ!

## 🔍 Troubleshooting

### Lỗi: "ERR_ABORTED" từ Firestore

**Nguyên nhân:**

- Firebase config sai
- Project ID không tồn tại
- Rules chưa được cấu hình

**Giải pháp:**

1. Kiểm tra `.env.local` đã sao chép đúng config
2. Xác minh Project ID trong Firebase Console
3. Đảm bảo Firestore Rules đã được Publish

### Giao dịch không sync giữa các thiết bị

**Kiểm tra:**

1. Đảm bảo cùng Firebase Project ID
2. Kiểm tra Firestore Rules cho phép truy cập
3. Kiểm tra kết nối mạng

### App chạy chậm

**Tối ưu:**

1. Xem xét dùng Firestore Indexes
2. Giảm số firestore subscriptions
3. Cache dữ liệu locally

## 📱 Local Development Setup

### Option 1: Dùng Firebase Emulator (Khuyến khích)

```bash
# Cài đặt Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Khởi động emulator
firebase emulators:start

# Vào file src/lib/firebase.ts và uncomment emulator code
```

### Option 2: Dùng Firebase Production (Hiện tại)

- Phù hợp cho development nhanh
- Tất cả dữ liệu sẽ được lưu trong production

## 🚀 Deployment

### Build cho Production:

```bash
npm run build
```

### Deploy lên Hosting:

**Option A: Firebase Hosting**

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Deploy
firebase deploy
```

**Option B: Vercel**

```bash
npm run build
# Upload thư mục dist/ lên Vercel
```

**Option C: Netlify**

```bash
npm run build
# Upload thư mục dist/ lên Netlify
```

## 📚 Các tài nguyên hữu ích

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Getting Started](https://firebase.google.com/docs/firestore/quickstart)
- [Vue 3 + Firebase Patterns](https://firebase.google.com/docs/database/web/start)
- [Firebase Emulator Suite](https://firebase.google.com/docs/emulator-suite)

## ✨ Tính năng tiếp theo

Các tính năng có thể được thêm:

- [ ] User Authentication với Firebase Auth
- [ ] Real-time Sync giữa các tab browser
- [ ] Offline Support với IndexedDB
- [ ] Image Upload với Firebase Storage
- [ ] Notification với Firebase Cloud Messaging
- [ ] Analytics với Firebase Analytics

## 💡 Ghi chú

- Dữ liệu được lưu an toàn trong Firestore
- Có thể xóa collection `transactions` từ Firebase Console bất cứ lúc nào
- Hãy kiểm tra Firestore Cost Calculator trước production
- Test Rules kỹ lưỡng trước publish

---

**Hoàn tất setup? Bắt đầu tạo giao dịch!** 🎉
