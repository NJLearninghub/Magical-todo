'use strict';

const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const { parsePDF } = require('./parsers/pdfParser.cjs');
const { parseExcel } = require('./parsers/excelParser.cjs');
const { extractFromPdfText, extractFromExcelRows } = require('./parsers/transactionExtractor.cjs');

const isDev = process.env.NODE_ENV === 'development';

// Path to persist finance data
function getDataPath() {
  return path.join(app.getPath('userData'), 'finance-data.json');
}

function loadStoredData() {
  try {
    const p = getDataPath();
    if (fs.existsSync(p)) {
      return JSON.parse(fs.readFileSync(p, 'utf8'));
    }
  } catch (e) {
    console.error('Failed to load stored data:', e.message);
  }
  return { transactions: [], uploadedFiles: [] };
}

function saveStoredData(data) {
  try {
    fs.writeFileSync(getDataPath(), JSON.stringify(data), 'utf8');
  } catch (e) {
    console.error('Failed to save data:', e.message);
  }
}

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    title: 'Magical Finance Dashboard',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.on('closed', () => { mainWindow = null; });
}

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// --- IPC Handlers ---

ipcMain.handle('finance:open-file-dialog', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    title: 'Select Financial Statements',
    properties: ['openFile', 'multiSelections'],
    filters: [{ name: 'Financial Statements', extensions: ['pdf', 'xlsx', 'xls'] }],
  });
  if (result.canceled) return [];
  return result.filePaths.map(p => ({
    name: path.basename(p),
    path: p,
    type: p.toLowerCase().endsWith('.pdf') ? 'pdf' : 'excel',
  }));
});

ipcMain.handle('finance:parse-files', async (event, files) => {
  const allTransactions = [];

  for (const file of files) {
    mainWindow.webContents.send('finance:parse-progress', { file: file.name, status: 'parsing' });
    try {
      let transactions = [];
      if (file.type === 'pdf') {
        const text = await parsePDF(file.path);
        transactions = extractFromPdfText(text, file.name);
      } else {
        const sheets = parseExcel(file.path);
        transactions = extractFromExcelRows(sheets, file.name);
      }
      mainWindow.webContents.send('finance:parse-progress', {
        file: file.name, status: 'done', count: transactions.length,
      });
      allTransactions.push(...transactions);
    } catch (err) {
      console.error('Parse error for', file.name, err.message);
      mainWindow.webContents.send('finance:parse-progress', {
        file: file.name, status: 'error', error: err.message,
      });
    }
  }

  return allTransactions;
});

ipcMain.handle('finance:get-stored-data', () => {
  return loadStoredData();
});

ipcMain.handle('finance:save-data', (event, data) => {
  saveStoredData(data);
});

ipcMain.handle('finance:clear-data', () => {
  saveStoredData({ transactions: [], uploadedFiles: [] });
});
