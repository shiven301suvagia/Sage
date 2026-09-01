import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('sage', Object.freeze({
  window: Object.freeze({
    resize: (mode) => ipcRenderer.invoke('window:resize', mode),
    moveBy: (dx, dy) => ipcRenderer.invoke('window:move-by', dx, dy),
    hide: () => ipcRenderer.invoke('window:hide'),
    close: () => ipcRenderer.invoke('window:close'),
    center: () => ipcRenderer.invoke('window:center'),
    alwaysOnTop: () => ipcRenderer.invoke('window:always-on-top')
  }),
  network: Object.freeze({ get: () => ipcRenderer.invoke('network:get'), set: (value) => ipcRenderer.invoke('network:set', value) }),
  ask: (text) => ipcRenderer.invoke('assistant:message', text),
  memory: Object.freeze({ list: () => ipcRenderer.invoke('memory:list'), clear: () => ipcRenderer.invoke('memory:clear') }),
  reminders: Object.freeze({ list: () => ipcRenderer.invoke('reminder:list') }),
  onReminder: (callback) => { const listener = (_event, item) => callback(item); ipcRenderer.on('reminder:fired', listener); return () => ipcRenderer.removeListener('reminder:fired', listener); }
}));
