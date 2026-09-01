import { app, BrowserWindow, Notification, globalShortcut, ipcMain, screen } from 'electron';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { SageBrain } from './brain.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const COMPACT = { width: 250, height: 410 };
const CHAT = { width: 520, height: 700 };
let win=null, brain=null, online=false, reminders=[], reminderTimer=null;
function dataDir(){return path.join(app.getPath('userData'),'SAGE')}
function readJson(file,fallback){try{return JSON.parse(readFileSync(file,'utf8'))??fallback}catch{return fallback}}
function writeJson(file,value){mkdirSync(path.dirname(file),{recursive:true});writeFileSync(file,JSON.stringify(value,null,2),'utf8')}
function workArea(){return screen.getPrimaryDisplay().workArea}
function clamp(x,y,w,h){const b=workArea();return{x:Math.max(b.x,Math.min(Math.round(x),b.x+b.width-w)),y:Math.max(b.y,Math.min(Math.round(y),b.y+b.height-h))}}
function moveTo(x,y){if(!win)return false;const[w,h]=win.getSize(),p=clamp(x,y,w,h);win.setPosition(p.x,p.y);return true}
function resize(mode){if(!win)return false;const s=mode==='chat'?CHAT:COMPACT,[x,y]=win.getPosition();win.setSize(s.width,s.height,true);const p=clamp(x,y,s.width,s.height);win.setPosition(p.x,p.y);return true}
function parseReminder(text){const m=text.match(/^remind me in\s+(\d+)\s*(seconds?|secs?|minutes?|mins?|hours?|hrs?)\s+(?:to\s+)?(.+)$/i);if(!m)return null;const n=Number(m[1]),u=m[2].toLowerCase();const ms=/hour|hr/.test(u)?n*3600000:/minute|min/.test(u)?n*60000:n*1000;return{text:m[3].trim(),atMs:Date.now()+ms}}
function createWindow(){win=new BrowserWindow({...COMPACT,show:false,frame:false,transparent:true,resizable:false,movable:false,skipTaskbar:true,alwaysOnTop:true,hasShadow:false,backgroundColor:'#00000000',webPreferences:{preload:path.join(__dirname,'preload.mjs'),contextIsolation:true,nodeIntegration:false,sandbox:true}});win.setAlwaysOnTop(true,'floating');win.setMenuBarVisibility(false);win.loadFile(path.join(__dirname,'index.html'));win.webContents.on('did-fail-load',(_e,c,d)=>console.error('SAGE load failed',c,d));win.once('ready-to-show',()=>{const b=workArea();win.setPosition(b.x+b.width-COMPACT.width-32,b.y+b.height-COMPACT.height-32);win.show()})}
function saveReminders(){writeJson(path.join(dataDir(),'reminders.json'),reminders)}
function startReminderLoop(){clearInterval(reminderTimer);reminderTimer=setInterval(()=>{const now=Date.now();for(const r of reminders.filter(x=>!x.fired&&x.atMs<=now)){r.fired=true;if(Notification.isSupported())new Notification({title:'SAGE reminder',body:r.text}).show();win?.webContents.send('reminder:fired',r)}if(reminders.length)saveReminders()},1000)}
app.whenReady().then(()=>{brain=new SageBrain({dataDir:dataDir()});reminders=readJson(path.join(dataDir(),'reminders.json'),[]).filter(r=>!r.fired);startReminderLoop();createWindow();globalShortcut.register('CommandOrControl+Shift+S',()=>win&&(win.isVisible()?win.hide():win.show()));
  ipcMain.handle('window:close',()=>app.quit());
  ipcMain.handle('window:hide',()=>win?.hide());
  ipcMain.handle('window:resize',(_e,mode)=>resize(mode));
  ipcMain.handle('window:move-by',(_e,dx,dy)=>{if(!win)return false;const[x,y]=win.getPosition();return moveTo(x+Number(dx),y+Number(dy))});
  ipcMain.handle('window:center',()=>{if(!win)return false;const b=workArea(),[w,h]=win.getSize();return moveTo(b.x+b.width-w-32,b.y+b.height-h-32)});
  ipcMain.handle('window:always-on-top',()=>{if(!win)return false;const n=!win.isAlwaysOnTop();win.setAlwaysOnTop(n,'floating');return n});
  ipcMain.handle('network:get',()=>online);ipcMain.handle('network:set',(_e,v)=>{online=Boolean(v);brain.setOnlineAllowed(online);return online});
  ipcMain.handle('memory:list',()=>brain.listMemory());ipcMain.handle('memory:clear',()=>{brain.clearMemory();return true});ipcMain.handle('reminder:list',()=>reminders.filter(r=>!r.fired));
  ipcMain.handle('assistant:message',async(_e,raw)=>{const text=String(raw??'').trim().slice(0,4000);if(!text)return{ok:false,text:'I’m listening. Tell me what you need.'};const parsed=parseReminder(text);if(parsed){const item={id:`${Date.now()}-${Math.random().toString(36).slice(2,7)}`,...parsed,fired:false};reminders.push(item);saveReminders();return{ok:true,text:`Done. I’ll remind you in ${text.match(/^remind me in\s+\d+\s*\w+/i)?.[0].replace(/^remind me in\s+/i,'')}.`,source:'reminder'}}return{...(await brain.reply(text)),online}})
});
app.on('will-quit',()=>{globalShortcut.unregisterAll();clearInterval(reminderTimer)});app.on('window-all-closed',e=>e.preventDefault());
