import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('sageDesktop', Object.freeze({
  hide: () => ipcRenderer.invoke('window:hide'),
  close: () => ipcRenderer.invoke('window:close'),
  center: () => ipcRenderer.invoke('window:center'),
  moveBy: (dx, dy) => ipcRenderer.invoke('window:move-by', dx, dy),
  resizeMode: (mode) => ipcRenderer.invoke('window:resize-mode', mode),
  toggleAlwaysOnTop: () => ipcRenderer.invoke('window:toggle-always-on-top'),
  setInteractive: () => ipcRenderer.invoke('window:set-interactive'),
  network: { get: () => ipcRenderer.invoke('network:get'), set: (allowed) => ipcRenderer.invoke('network:set', allowed) },
  ask: (text) => ipcRenderer.invoke('assistant:message', text),
  onReminder: (callback) => { const listener = (_event, item) => callback(item); ipcRenderer.on('reminder:fired', listener); return () => ipcRenderer.removeListener('reminder:fired', listener); },
}));
