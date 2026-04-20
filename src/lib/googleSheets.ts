import type { Transaction, Wallet } from '@/types'

const GOOGLE_SHEETS_SCRIPT_URL = import.meta.env.VITE_GOOGLE_SHEETS_SCRIPT_URL as string
const GOOGLE_SHEET_ID = import.meta.env.VITE_GOOGLE_SHEET_ID as string || '1L1d_xjUQYGJpzo2xVIQm1cZPRwvZGmNOfaOsdvj6cK8'

const sanitizeSheetName = (name: string) => {
  return name
    .trim()
    .replace(/[\\/:*?"<>|\[\]]/g, '_')
    .slice(0, 100)
}

const formatSheetDate = (dateValue: string | Date) => {
  const date = typeof dateValue === 'string' ? new Date(dateValue) : dateValue
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  return `${day}/${month}/${year}`
}

const formatSheetTime = (dateValue: string | Date) => {
  const date = typeof dateValue === 'string' ? new Date(dateValue) : dateValue
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${hours}:${minutes}`
}

const translateType = (type: 'income' | 'expense') =>
  type === 'income' ? 'Thu' : 'Chi'

const buildPayload = (
  transaction: Transaction,
  walletName: string,
  action: 'add' | 'update' | 'delete'
) => {
  const createdAtDate =
    transaction.createdAt instanceof Date
      ? transaction.createdAt
      : new Date(transaction.createdAt)

  return {
    action,
    sheetId: GOOGLE_SHEET_ID,
    sheetName: sanitizeSheetName(walletName),
    transaction: {
      id: transaction.id,
      walletId: transaction.walletId,
      walletName,
      type: translateType(transaction.type),
      category: transaction.category,
      description: transaction.description,
      amount: transaction.amount,
      date: formatSheetDate(transaction.date),
      createdTime: formatSheetTime(createdAtDate)
    }
  }
}

export const syncTransactionToGoogleSheet = async (
  transaction: Transaction,
  wallet: Wallet,
  action: 'add' | 'update' | 'delete' = 'add'
) => {
  if (!GOOGLE_SHEETS_SCRIPT_URL) {
    console.warn('[GoogleSheets] VITE_GOOGLE_SHEETS_SCRIPT_URL chưa được cấu hình. Bỏ qua đồng bộ.');
    return
  }

  const payload = buildPayload(transaction, wallet.name, action)
  const url = new URL(GOOGLE_SHEETS_SCRIPT_URL)
  url.searchParams.set('payload', JSON.stringify(payload))

  const response = await fetch(url.toString(), {
    method: 'GET',
    redirect: 'follow'
  })

  const text = await response.text()
  let body: any
  try {
    body = JSON.parse(text)
  } catch {
    body = null
  }

  if (!response.ok) {
    throw new Error(`Google Sheets sync failed: ${response.status} ${response.statusText} - ${text}`)
  }

  if (body?.error) {
    throw new Error(`Google Sheets sync error: ${body.error}`)
  }

  if (body && body.status && body.status !== 'ok') {
    console.warn('[GoogleSheets] Unexpected response status:', body.status)
  }
}

/*
  Hướng dẫn triển khai Google Apps Script webhook:

  function doGet(e) {
    try {
      const payload = e.parameter.payload
      if (!payload) {
        return ContentService
          .createTextOutput(JSON.stringify({ error: 'Missing payload' }))
          .setMimeType(ContentService.MimeType.JSON)
      }

      const data = JSON.parse(payload)
      return handleRequest(data)
    } catch (error) {
      return ContentService
        .createTextOutput(JSON.stringify({ error: error.message }))
        .setMimeType(ContentService.MimeType.JSON)
    }
  }

  function doPost(e) {
    try {
      const data = JSON.parse(e.postData.contents)
      return handleRequest(data)
    } catch (error) {
      return ContentService
        .createTextOutput(JSON.stringify({ error: error.message }))
        .setMimeType(ContentService.MimeType.JSON)
    }
  }

  function handleRequest(data) {
    const spreadsheet = SpreadsheetApp.openById(data.sheetId)
    const sheetName = data.sheetName || 'Default'
    let sheet = spreadsheet.getSheetByName(sheetName)
    if (!sheet) {
      sheet = spreadsheet.insertSheet(sheetName)
      sheet.appendRow(['Giờ Tạo', 'Ngày', 'Loại', 'Danh Mục', 'Mô Tả', 'Số Tiền', 'Ví', 'ID Giao Dịch'])
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
    ]

    if (data.action === 'add') {
      sheet.appendRow(row)
    } else if (data.action === 'update') {
      const values = sheet.getDataRange().getValues()
      for (let i = 1; i < values.length; i++) {
        if (values[i][6] === data.transaction.id) {
          sheet.getRange(i + 1, 1, 1, row.length).setValues([row])
          return ContentService
            .createTextOutput(JSON.stringify({ status: 'updated' }))
            .setMimeType(ContentService.MimeType.JSON)
        }
      }
      sheet.appendRow(row)
    } else if (data.action === 'delete') {
      const values = sheet.getDataRange().getValues()
      for (let i = values.length - 1; i >= 1; i--) {
        if (values[i][6] === data.transaction.id) {
          sheet.deleteRow(i + 1)
          return ContentService
            .createTextOutput(JSON.stringify({ status: 'deleted' }))
            .setMimeType(ContentService.MimeType.JSON)
        }
      }
    }

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'ok' }))
      .setMimeType(ContentService.MimeType.JSON)
  }
*/
