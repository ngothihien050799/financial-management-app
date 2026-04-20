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
