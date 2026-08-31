import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('sageDesktop', Object.freeze({
  hide: () => ipcRenderer.invoke('window:hide'),
  close: () => ipcRenderer.invoke('window:close'),
  center: () => ipcRenderer.invoke('window:center'),
  toggleAlwaysOnTop: () => ipcRenderer.invoke('window:toggle-always-on-top'),
  move: (x, y) => ipcRenderer.invoke('window:move', x, y),
  setInteractive: (interactive) => ipcRenderer.invoke('window:set-interactive', interactive),
  network: {
    get: () => ipcRenderer.invoke('network:get'),
    set: (allowed) => ipcRenderer.invoke('network:set', allowed),
  },
  ask: (text) => ipcRenderer.invoke('assistant:message', text),
}));
