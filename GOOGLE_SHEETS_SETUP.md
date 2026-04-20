# Google Sheets Sync Setup

Đã thêm tính năng đồng bộ giao dịch vào Google Sheets trong `src/stores/transactionStore.ts`.
Mỗi giao dịch sẽ gửi POST đến một webhook Google Apps Script, và mỗi ví sẽ tạo/ghi vào một sheet riêng.

## Bước 1: Tạo Google Apps Script

1. Mở Google Drive.
2. Chọn `New` → `More` → `Google Apps Script`.
3. Dán mã dưới đây vào file `Code.gs`:

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
    for (let i = 1; i < values.length; i++) {
      if (values[i][6] === data.transaction.id) {
        sheet.getRange(i + 1, 1, 1, row.length).setValues([row]);
        return ContentService.createTextOutput(
          JSON.stringify({ status: "updated" }),
        ).setMimeType(ContentService.MimeType.JSON);
      }
    }
    sheet.appendRow(row);
  } else if (data.action === "delete") {
    const values = sheet.getDataRange().getValues();
    for (let i = values.length - 1; i >= 1; i--) {
      if (values[i][6] === data.transaction.id) {
        sheet.deleteRow(i + 1);
        return ContentService.createTextOutput(
          JSON.stringify({ status: "deleted" }),
        ).setMimeType(ContentService.MimeType.JSON);
      }
    }
  }

  return ContentService.createTextOutput(
    JSON.stringify({ status: "ok" }),
  ).setMimeType(ContentService.MimeType.JSON);
}
```

## Bước 2: Triển khai webhook

1. Chọn `Deploy` → `New deployment`.
2. Chọn `Web app`.
3. Trong `Execute as`, chọn `Me`.
4. Trong `Who has access`, chọn `Anyone`.
5. Nhấn `Deploy` và sao chép URL deployment.

## Bước 3: Cấu hình ứng dụng

1. Mở file `.env` hoặc tạo file mới nếu chưa có.
2. Thêm:

```env
VITE_GOOGLE_SHEETS_SCRIPT_URL=https://script.google.com/macros/s/xxx/exec
VITE_GOOGLE_SHEET_ID=1L1d_xjUQYGJpzo2xVIQm1cZPRwvZGmNOfaOsdvj6cK8
```

3. Khởi động lại dev server:

```bash
npm run dev
```

## Ghi chú

- Mỗi ví trong ứng dụng sẽ được ghi vào một sheet con riêng theo tên ví.
- Nếu `VITE_GOOGLE_SHEETS_SCRIPT_URL` không được cấu hình, ứng dụng vẫn hoạt động bình thường nhưng không đồng bộ lên Google Sheets.
