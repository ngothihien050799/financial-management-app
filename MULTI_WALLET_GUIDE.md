# Multi-Wallet Feature - Upgrade Guide

## Overview
Ứng dụng Financial Management Dashboard đã được nâng cấp để hỗ trợ **quản lý nhiều ví** (multi-wallet), tương tự như ứng dụng Misa.

## Features Mới

### 1. **Multiple Wallets**
- Tạo và quản lý nhiều ví khác nhau
- Mỗi ví có tên, mô tả và icon riêng
- Tracking số dư tự động cho mỗi ví

### 2. **Ví Mặc Định**
- **Quản lý Thu Chi**: Ví mặc định cho giao dịch hàng ngày
- Có thể tạo thêm ví cho các mục đích khác:
  - 💰 Quản lý Thu Chi (default)
  - 🏠 Quản lý Tiền Nhà, Điện Nước
  - 🏦 Quản lý Quỹ Tiết Kiệm
  - 💳 Quản lý Chi Phí Cá Nhân
  - v.v...

### 3. **Quản Lý Ví**
- **Chọn ví**: Click vào menu ví trên App Bar để chọn ví
- **Tạo ví mới**: Click "Thêm ví mới" → Nhập tên, mô tả, chọn icon
- **Xóa ví**: (Sắp tới) Xóa toàn bộ ví và giao dịch của nó
- **Chỉnh sửa**: (Sắp tới) Chỉnh sửa thông tin ví

### 4. **Automatic Balance Tracking**
- Số dư của mỗi ví được tính tự động:
  - `Balance = Total Income - Total Expense`
- Hiển thị trong menu chọn ví

### 5. **Separate Transactions by Wallet**
- Mỗi giao dịch gắn liền với một ví
- Dashboard, Analytics, Income/Expense chỉ hiển thị dữ liệu của ví hiện tại

## Cách Sử Dụng

### Tạo Ví Mới
1. Click vào nút **"Chọn ví"** trên App Bar


2. Chọn **"Thêm ví mới"**
3. Nhập:
   - **Tên ví**: "Tiền Nhà", "Quỹ Tiết Kiệm", v.v...
   - **Mô tả**: Chi tiết về ví (tùy chọn)
   - **Icon**: Chữ emoji như 🏠, 🏦, 💳, v.v...
4. Click **"Tạo ví"**

### Chuyển Đổi Giữa Các Ví
1. Click vào nút **"Chọn ví"** trên App Bar
2. Chọn ví từ danh sách
3. Tất cả data sẽ tự động cập nhật cho ví đó

### Thêm Giao Dịch
1. Chọn ví bạn muốn thêm giao dịch
2. Đi tới **"Quản Lý Thu Chi"**
3. Click **"Thêm Thu Nhập"** hoặc **"Thêm Chi Tiêu"**
4. Giao dịch sẽ tự động gắn với ví hiện tại

## Database Structure

### Firestore Collections

#### `wallets` Collection
```javascript
{
  id: "wallet_id",
  name: "Quản lý Thu Chi",
  description: "Quản lý thu chi hàng ngày",
  icon: "💰",
  balance: 1000000,
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

#### `transactions` Collection
```javascript
{
  id: "transaction_id",
  walletId: "wallet_id",  // NEW: Link to wallet
  type: "income" | "expense",
  category: "Lương",
  amount: 5000000,
  description: "Lương tháng 4",
  date: "2024-04-15",
  createdAt: Timestamp
}
```

## API Changes

### Store Methods

#### Wallet Methods (NEW)
```typescript
store.addWallet(wallet)              // Tạo ví mới
store.deleteWallet(walletId)          // Xóa ví
store.updateWallet(walletId, updates) // Cập nhật ví
store.setCurrentWallet(walletId)      // Chọn ví hiện tại
store.getWallets()                    // Lấy danh sách ví
store.getCurrentWallet()              // Lấy ví hiện tại
store.loadWallets()                   // Tải ví từ Firebase
```

#### Updated Transaction Methods
```typescript
store.addTransaction(transaction)        // walletId bắt buộc
store.getTransactions()                  // Lấy giao dịch của ví hiện tại
store.getTransactionsByWallet(walletId)  // Lấy giao dịch của ví cụ thể
store.getMetrics()                       // Metrics của ví hiện tại
```

#### Reactive Properties
```typescript
store.currentWalletId       // ID ví hiện tại (reactive)
store.state.wallets         // Danh sách ví
store.state.transactions    // Tất cả giao dịch (filter by wallet)
```

## Type Updates

### New Types
```typescript
interface Wallet {
  id: string
  name: string
  description: string
  icon: string
  balance: number
  createdAt: Date
  updatedAt: Date
}
```

### Updated Types
```typescript
interface Transaction {
  id: string
  walletId: string       // NEW
  type: 'income' | 'expense'
  category: string
  amount: number
  description: string
  date: string
  createdAt: Date
}
```

## Migration Notes

### For Existing Users
- Khi update, tất cả giao dịch cũ sẽ được gán vào ví default: `"default"`
- Ví default là: **"Quản lý Thu Chi"** 🏠
- Bạn có thể tạo ví mới và di chuyển giao dịch (sắp tới)

### Firebase Setup
Không cần thay đổi gì nếu đã có Firebase config.
App sẽ tự động tạo collection `wallets` khi tạo ví đầu tiên.

## Future Enhancements

1. **Edit Wallet Dialog**: Chỉnh sửa tên, mô tả, icon ví
2. **Delete Wallet Dialog**: Xóa ví với xác nhận
3. **Transfer Transactions**: Di chuyển giao dịch giữa ví
4. **Wallet Analytics**: Số liệu chi tiết cho từng ví
5. **Wallet Templates**: Mẫu ví dựa sẵn (e.g., "Tiền Nhà")
6. **Budget per Wallet**: Đặt budget riêng cho mỗi ví
7. **Wallet Export**: Xuất dữ liệu ví thành PDF/Excel

## Troubleshooting

### Ví không hiển thị
- Ensure Firestore có permission `read & write`
- Kiểm tra browser console cho lỗi

### Giao dịch thêm vào sai ví
- Kiểm tra ví hiện tại bằng cách xem button "Chọn ví"
- Chọn ví đúng trước khi thêm giao dịch

### App bị lỗi sau update
- Clear browser cache (Ctrl+Shift+Delete)
- Reload app (F5)
- Kiểm tra console.log trong devtools

## Support
Nếu gặp vấn đề, vui lòng báo cáo trên GitHub Issues.
