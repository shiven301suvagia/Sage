import {contextBridge,ipcRenderer} from 'electron';
contextBridge.exposeInMainWorld('sage',Object.freeze({
  window:Object.freeze({toggleVisibility:()=>ipcRenderer.invoke('window:toggle-visibility'),setInteractive:v=>ipcRenderer.invoke('window:set-interactive',Boolean(v)),moveBy:(x,y)=>ipcRenderer.invoke('window:move-by',Number(x),Number(y)),resizeForChat:v=>ipcRenderer.invoke('window:resize-chat',Boolean(v)),close:()=>ipcRenderer.invoke('window:close'),alwaysOnTop:()=>ipcRenderer.invoke('window:toggle-always-on-top')}),
  assistant:Object.freeze({ask:t=>ipcRenderer.invoke('assistant:ask',String(t))}),
  memory:Object.freeze({list:()=>ipcRenderer.invoke('memory:list'),search:q=>ipcRenderer.invoke('memory:search',String(q)),clear:()=>ipcRenderer.invoke('memory:clear')}),
  network:Object.freeze({get:()=>ipcRenderer.invoke('network:get'),set:v=>ipcRenderer.invoke('network:set',Boolean(v))})
}));
