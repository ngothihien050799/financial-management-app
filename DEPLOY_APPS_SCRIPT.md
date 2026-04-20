# Hướng Dẫn Deploy Lại Google Apps Script

## Bước 1: Mở Google Apps Script Editor

1. Truy cập vào project Apps Script của bạn
2. Link: `https://script.google.com/` → Tìm project liên kết với webhook

## Bước 2: Xóa Mã Cũ & Dán Mã Mới

1. Mở file `Code.gs`
2. **Xóa toàn bộ** nội dung hiện tại
3. Dán toàn bộ mã dưới đây:

```javascript
function doGet(e) {
  try {
    const payload = e.parameter.payload;
    if (!payload) {
      return ContentService.createTextOutput(
        JSON.stringify({ error: "Missing payload" }),
      ).setMimeType(ContentService.MimeType.JSON);
    }

    const data = JSON.parse(payload);
    return handleRequest(data);
  } catch (error) {
    return ContentService.createTextOutput(
      JSON.stringify({ error: error.message }),
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    return handleRequest(data);
  } catch (error) {
    return ContentService.createTextOutput(
      JSON.stringify({ error: error.message }),
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

function handleRequest(data) {
  const spreadsheet = SpreadsheetApp.openById(data.sheetId);
  const sheetName = data.sheetName || "Default";
  let sheet = spreadsheet.getSheetByName(sheetName);

  if (!sheet) {
    sheet = spreadsheet.insertSheet(sheetName);
    sheet.appendRow([
      "Giờ Tạo",
      "Ngày",
      "Loại",
      "Danh Mục",
      "Mô Tả",
      "Số Tiền",
      "Ví",
      "ID Giao Dịch",
    ]);
  }

  const row = [
    data.transaction.createdTime,
    data.transaction.date,
    data.transaction.type,
    data.transaction.category,
    data.transaction.description,
    data.transaction.amount,
    data.transaction.walletName,
    data.transaction.id,
  ];

  if (data.action === "add") {
    sheet.appendRow(row);
  } else if (data.action === "update") {
    const values = sheet.getDataRange().getValues();
    let updated = false;
    for (let i = 1; i < values.length; i++) {
      if (values[i][7] === data.transaction.id) {
        sheet.getRange(i + 1, 1, 1, row.length).setValues([row]);
        updated = true;
        break;
      }
    }
    if (!updated) {
      sheet.appendRow(row);
    }
  } else if (data.action === "delete") {
    const values = sheet.getDataRange().getValues();
    for (let i = values.length - 1; i >= 1; i--) {
      if (values[i][7] === data.transaction.id) {
        sheet.deleteRow(i + 1);
        break;
      }
    }
  }

  return ContentService.createTextOutput(
    JSON.stringify({ status: "ok" }),
  ).setMimeType(ContentService.MimeType.JSON);
}
```

## Bước 3: Lưu & Deploy

1. Nhấn `Ctrl + S` để lưu
2. Chọn menu `Deploy` → `New deployment`
3. Chọn `Web app`
4. Đặt `Execute as`: Tài khoản Google của bạn
5. Đặt `Who has access`: `Anyone`
6. Nhấn `Deploy`
7. **Sao chép URL deployment** (dạng `https://script.google.com/macros/s/AKfycbz.../exec`)

## Bước 4: Cập Nhật `.env`

1. Mở file `.env` trong editor
2. Cập nhật dòng:

```env
VITE_GOOGLE_SHEETS_SCRIPT_URL=https://script.google.com/macros/s/YOUR_ID/exec
```

Thay `YOUR_ID` bằng ID từ URL deployment bạn vừa sao chép.

## Bước 5: Khởi Động Lại Ứng Dụng

1. Dừng `npm run dev` (nếu đang chạy)
2. Chạy lại: `npm run dev`
3. Thêm giao dịch mới
4. Kiểm tra Google Sheet - cột `Giờ Tạo` phải có giá trị

---

**Lưu ý quan trọng:**

- Mỗi ví sẽ tạo 1 sheet con riêng
- Header của sheet sẽ là: `Giờ Tạo | Ngày | Loại | Danh Mục | Mô Tả | Số Tiền | Ví | ID Giao Dịch`
- Ngày hiển thị dạng `dd/MM/yyyy` (ví dụ: `20/04/2026`)
- Giờ hiển thị dạng `HH:mm` (ví dụ: `14:30`)
- Loại hiển thị là `Thu` hoặc `Chi` thay vì `income`/`expense`
