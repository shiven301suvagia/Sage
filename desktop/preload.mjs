import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('sageDesktop', Object.freeze({
  hide: () => ipcRenderer.invoke('window:hide'),
  close: () => ipcRenderer.invoke('window:close'),
  center: () => ipcRenderer.invoke('window:center'),
  toggleAlwaysOnTop: () => ipcRenderer.invoke('window:toggle-always-on-top'),
  move: (x, y) => ipcRenderer.invoke('window:move', x, y),
  moveBy: (dx, dy) => ipcRenderer.invoke('window:move-by', dx, dy),
  setInteractive: (interactive) => ipcRenderer.invoke('window:set-interactive', interactive),
  network: { get: () => ipcRenderer.invoke('network:get'), set: (allowed) => ipcRenderer.invoke('network:set', allowed) },
  reminders: {
    list: () => ipcRenderer.invoke('reminder:list'),
    add: (text, atMs) => ipcRenderer.invoke('reminder:add', text, atMs),
    remove: (id) => ipcRenderer.invoke('reminder:remove', id),
    clear: () => ipcRenderer.invoke('reminder:clear'),
    onFired: (callback) => {
      if (typeof callback !== 'function') return () => {};
      const listener = (_event, item) => callback(item);
      ipcRenderer.on('reminder:fired', listener);
      return () => ipcRenderer.removeListener('reminder:fired', listener);
    },
  },
  ask: (text) => ipcRenderer.invoke('assistant:message', text),
}));
