import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('sageDesktop', Object.freeze({
  hide: () => ipcRenderer.invoke('window:hide'),
  close: () => ipcRenderer.invoke('window:close'),
  center: () => ipcRenderer.invoke('window:center'),
  toggleAlwaysOnTop: () => ipcRenderer.invoke('window:toggle-always-on-top'),
}));
