import { contextBridge, ipcRenderer } from 'electron';
contextBridge.exposeInMainWorld('sage',Object.freeze({
 window:Object.freeze({resize:m=>ipcRenderer.invoke('window:resize',m),moveBy:(x,y)=>ipcRenderer.invoke('window:move-by',x,y),hide:()=>ipcRenderer.invoke('window:hide'),close:()=>ipcRenderer.invoke('window:close'),center:()=>ipcRenderer.invoke('window:center'),alwaysOnTop:()=>ipcRenderer.invoke('window:always-on-top')}),
 network:Object.freeze({get:()=>ipcRenderer.invoke('network:get'),set:v=>ipcRenderer.invoke('network:set',v)}),
 ask:t=>ipcRenderer.invoke('assistant:message',t),
 memory:Object.freeze({list:()=>ipcRenderer.invoke('memory:list'),clear:()=>ipcRenderer.invoke('memory:clear')}),
 reminders:Object.freeze({list:()=>ipcRenderer.invoke('reminder:list')}),
 onReminder:cb=>{const f=(_e,v)=>cb(v);ipcRenderer.on('reminder:fired',f);return()=>ipcRenderer.removeListener('reminder:fired',f)}
}));
