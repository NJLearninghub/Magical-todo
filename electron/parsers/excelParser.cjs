'use strict';

const XLSX = require('xlsx');

function parseExcel(filePath) {
  const workbook = XLSX.readFile(filePath);
  const sheets = [];
  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
    if (rows.length > 1) {
      sheets.push({ sheetName, rows });
    }
  }
  return sheets;
}

module.exports = { parseExcel };
