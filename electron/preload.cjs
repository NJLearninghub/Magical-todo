'use strict';

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  openFileDialog: () => ipcRenderer.invoke('finance:open-file-dialog'),
  parseFiles: (files) => ipcRenderer.invoke('finance:parse-files', files),
  getStoredData: () => ipcRenderer.invoke('finance:get-stored-data'),
  saveData: (data) => ipcRenderer.invoke('finance:save-data', data),
  clearData: () => ipcRenderer.invoke('finance:clear-data'),
  onParseProgress: (cb) => ipcRenderer.on('finance:parse-progress', (_, d) => cb(d)),
  offParseProgress: () => ipcRenderer.removeAllListeners('finance:parse-progress'),
});
