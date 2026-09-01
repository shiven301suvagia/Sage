import { app, BrowserWindow, Notification, globalShortcut, ipcMain, screen } from 'electron';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { SageBrain } from './brain.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const COMPACT = { width: 240, height: 390 };
const CHAT = { width: 520, height: 700 };
let win = null;
let brain = null;
let online = false;
let reminders = [];
let reminderTimer = null;

function dataDir() { return path.join(app.getPath('userData'), 'SAGE'); }
function readJson(file, fallback) { try { return JSON.parse(readFileSync(file, 'utf8')); } catch { return fallback; } }
function writeJson(file, value) { mkdirSync(path.dirname(file), { recursive: true }); writeFileSync(file, JSON.stringify(value, null, 2), 'utf8'); }
function workArea() { return screen.getPrimaryDisplay().workArea; }
function clamp(x, y, w, h) { const b = workArea(); return { x: Math.max(b.x, Math.min(Math.round(x), b.x + b.width - w)), y: Math.max(b.y, Math.min(Math.round(y), b.y + b.height - h)) }; }
function moveTo(x, y) { if (!win) return false; const [w, h] = win.getSize(); const p = clamp(x, y, w, h); win.setPosition(p.x, p.y); return true; }
function resize(mode) { if (!win) return false; const size = mode === 'chat' ? CHAT : COMPACT; const [x, y] = win.getPosition(); win.setSize(size.width, size.height, true); const p = clamp(x, y, size.width, size.height); win.setPosition(p.x, p.y); return true; }
function parseReminder(text) {
  const m = text.match(/^remind me in\s+(\d+)\s*(seconds?|secs?|minutes?|mins?|hours?|hrs?)\s+(?:to\s+)?(.+)$/i);
  if (!m) return null;
  const n = Number(m[1]); const unit = m[2].toLowerCase();
  const ms = /hour|hr/.test(unit) ? n * 3600000 : /minute|min/.test(unit) ? n * 60000 : n * 1000;
  return { text: m[3].trim(), atMs: Date.now() + ms };
}
function createWindow() {
  win = new BrowserWindow({ ...COMPACT, show: false, frame: false, transparent: true, resizable: false, movable: false, skipTaskbar: true, alwaysOnTop: true, hasShadow: false, backgroundColor: '#00000000', webPreferences: { preload: path.join(__dirname, 'preload.mjs'), contextIsolation: true, nodeIntegration: false, sandbox: true } });
  win.setAlwaysOnTop(true, 'floating');
  win.setMenuBarVisibility(false);
  win.loadFile(path.join(__dirname, 'index.html'));
  win.webContents.on('did-fail-load', (_e, code, desc) => console.error('SAGE load failed:', code, desc));
  win.once('ready-to-show', () => { const b = workArea(); win.setPosition(b.x + b.width - COMPACT.width - 28, b.y + b.height - COMPACT.height - 28); win.show(); });
}
function saveReminders() { writeJson(path.join(dataDir(), 'reminders.json'), reminders); }
function startReminderLoop() {
  clearInterval(reminderTimer);
  reminderTimer = setInterval(() => {
    const now = Date.now();
    for (const r of reminders.filter((x) => !x.fired && x.atMs <= now)) {
      r.fired = true;
      if (Notification.isSupported()) new Notification({ title: 'SAGE reminder', body: r.text }).show();
      win?.webContents.send('reminder:fired', r);
    }
    saveReminders();
  }, 1000);
}
app.whenReady().then(() => {
  brain = new SageBrain({ dataDir: dataDir() });
  reminders = readJson(path.join(dataDir(), 'reminders.json'), []).filter((r) => !r.fired);
  startReminderLoop();
  createWindow();
  globalShortcut.register('CommandOrControl+Shift+S', () => { if (!win) return; win.isVisible() ? win.hide() : win.show(); });
  ipcMain.handle('window:close', () => app.quit());
  ipcMain.handle('window:hide', () => win?.hide());
  ipcMain.handle('window:resize', (_e, mode) => resize(mode));
  ipcMain.handle('window:move-by', (_e, dx, dy) => { const [x, y] = win.getPosition(); return moveTo(x + Number(dx), y + Number(dy)); });
  ipcMain.handle('window:center', () => { const b = workArea(); return moveTo(b.x + b.width - win.getSize()[0] - 28, b.y + b.height - win.getSize()[1] - 28); });
  ipcMain.handle('window:always-on-top', () => { const next = !win.isAlwaysOnTop(); win.setAlwaysOnTop(next, 'floating'); return next; });
  ipcMain.handle('network:get', () => online);
  ipcMain.handle('network:set', (_e, value) => { online = Boolean(value); brain.setOnlineAllowed(online); return online; });
  ipcMain.handle('memory:list', () => brain.memory.slice());
  ipcMain.handle('memory:clear', () => { brain.clearMemory(); return true; });
  ipcMain.handle('reminder:list', () => reminders.slice());
  ipcMain.handle('assistant:message', async (_e, raw) => {
    const text = String(raw ?? '').trim().slice(0, 4000);
    if (!text) return { ok: false, text: 'I’m listening. Tell me what you need.' };
    const parsed = parseReminder(text);
    if (parsed) {
      const item = { id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, ...parsed, fired: false };
      reminders.push(item); saveReminders();
      return { ok: true, text: `Done. I’ll remind you in ${text.match(/^remind me in\s+\d+\s*\w+/i)?.[0].replace(/^remind me in\s+/i, '')}.`, source: 'reminder' };
    }
    return { ...(await brain.reply(text)), online };
  });
});
app.on('will-quit', () => { globalShortcut.unregisterAll(); clearInterval(reminderTimer); });
app.on('window-all-closed', (event) => event.preventDefault());
