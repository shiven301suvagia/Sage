import { app, BrowserWindow, globalShortcut, ipcMain, Notification, screen, shell } from 'electron';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { SageBrain } from './SageBrain.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const COMPACT = { width: 250, height: 380 };
const CHAT = { width: 460, height: 610 };
let win;
let brain;
let networkAllowed = false;
let reminders = [];
let reminderTimer;

const dataDir = () => path.join(app.getPath('userData'), 'Sage');
function loadReminders() { try { return JSON.parse(readFileSync(path.join(dataDir(), 'reminders.json'), 'utf8')); } catch { return []; } }
function saveReminders() { try { mkdirSync(dataDir(), { recursive: true }); writeFileSync(path.join(dataDir(), 'reminders.json'), JSON.stringify(reminders, null, 2)); } catch {} }
function scheduleReminders() {
  clearInterval(reminderTimer);
  reminderTimer = setInterval(() => {
    const now = Date.now();
    const due = reminders.filter((r) => r.atMs <= now && !r.fired);
    for (const item of due) {
      item.fired = true;
      if (Notification.isSupported()) new Notification({ title: 'SAGE reminder', body: item.text }).show();
      win?.webContents.send('reminder:fired', item);
    }
    if (due.length) saveReminders();
  }, 1000);
}
function area() { return screen.getPrimaryDisplay().workArea; }
function clamp(x, y, w, h) { const b = area(); return { x: Math.max(b.x, Math.min(Math.round(x), b.x + b.width - w)), y: Math.max(b.y, Math.min(Math.round(y), b.y + b.height - h)) }; }
function moveTo(x, y) { if (!win) return false; const [w, h] = win.getSize(); const p = clamp(x, y, w, h); win.setPosition(p.x, p.y); return true; }
function resize(mode) { if (!win) return false; const s = mode === 'chat' ? CHAT : COMPACT; win.setSize(s.width, s.height, true); const [x, y] = win.getPosition(); const p = clamp(x, y, s.width, s.height); win.setPosition(p.x, p.y); return true; }
function parseReminder(text) {
  const m = text.match(/^remind me in\s+(\d+)\s*(seconds?|secs?|minutes?|mins?|hours?|hrs?)\s+(?:to\s+)?(.+)$/i);
  if (!m) return null;
  const n = Number(m[1]); const unit = m[2].toLowerCase(); const ms = /hour|hr/.test(unit) ? n * 3600000 : /minute|min/.test(unit) ? n * 60000 : n * 1000;
  return { text: m[3].trim(), atMs: Date.now() + ms };
}
function createWindow() {
  win = new BrowserWindow({ ...COMPACT, frame: false, transparent: true, resizable: false, movable: false, alwaysOnTop: true, skipTaskbar: true, hasShadow: false, backgroundColor: '#00000000', webPreferences: { preload: path.join(__dirname, 'preload.mjs'), contextIsolation: true, nodeIntegration: false, sandbox: true } });
  win.setAlwaysOnTop(true, 'floating');
  win.setMenuBarVisibility(false);
  win.loadFile(path.join(__dirname, 'index.html'));
  win.webContents.on('did-fail-load', (_e, code, desc) => console.error('SAGE UI failed to load', code, desc));
  win.once('ready-to-show', () => { const b = area(); win.setPosition(b.x + b.width - COMPACT.width - 28, b.y + b.height - COMPACT.height - 28); });
}
app.whenReady().then(() => {
  brain = new SageBrain({ dataDir: dataDir() });
  reminders = loadReminders().filter((r) => !r.fired);
  scheduleReminders();
  createWindow();
  globalShortcut.register('CommandOrControl+Shift+S', () => { if (win) win.isVisible() ? win.hide() : win.show(); });

  ipcMain.handle('window:close', () => app.quit());
  ipcMain.handle('window:hide', () => win?.hide());
  ipcMain.handle('window:center', () => { const b = area(); return moveTo(b.x + b.width - win.getSize()[0] - 28, b.y + b.height - win.getSize()[1] - 28); });
  ipcMain.handle('window:move-by', (_e, dx, dy) => { const [x, y] = win.getPosition(); return moveTo(x + Number(dx), y + Number(dy)); });
  ipcMain.handle('window:resize-mode', (_e, mode) => resize(mode));
  ipcMain.handle('window:toggle-always-on-top', () => { const next = !win.isAlwaysOnTop(); win.setAlwaysOnTop(next, 'floating'); return next; });
  ipcMain.handle('window:set-interactive', () => { win?.setIgnoreMouseEvents(false); return true; });
  ipcMain.handle('network:get', () => networkAllowed);
  ipcMain.handle('network:set', (_e, allowed) => { networkAllowed = Boolean(allowed); brain?.setOnlineAllowed(networkAllowed); return networkAllowed; });
  ipcMain.handle('memory:list', () => brain?.memory ?? []);
  ipcMain.handle('memory:clear', () => { brain?.clearMemory(); return true; });
  ipcMain.handle('reminder:list', () => reminders);
  ipcMain.handle('reminder:remove', (_e, id) => { reminders = reminders.filter((r) => r.id !== id); saveReminders(); return true; });
  ipcMain.handle('assistant:message', async (_e, raw) => {
    const text = String(raw ?? '').trim().slice(0, 4000);
    if (!text) return { ok: false, text: 'Tell me what you need.' };
    const reminder = parseReminder(text);
    if (reminder) { const item = { id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, ...reminder, fired: false }; reminders.push(item); saveReminders(); return { ok: true, text: `Done. I’ll remind you in ${text.match(/^remind me in\s+\d+\s*\w+/i)?.[0].replace(/^remind me in\s+/i, '')}.`, reminder }; }
    const result = await brain.reply(text);
    return { ...result, networkAllowed };
  });
  ipcMain.handle('open:external', (_e, url) => { if (typeof url !== 'string' || !/^https?:\/\//i.test(url)) return false; void shell.openExternal(url); return true; });
});
app.on('will-quit', () => { globalShortcut.unregisterAll(); clearInterval(reminderTimer); });
app.on('window-all-closed', (event) => event.preventDefault());
