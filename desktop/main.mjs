import { app, BrowserWindow, globalShortcut, ipcMain, screen } from 'electron';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
let mainWindow;
let assistant;
let networkAllowed = false;

async function loadAssistant() {
  try {
    const [{ EventBus }, { AssistantCore }] = await Promise.all([
      import('../dist/frontend/src/assistant/EventBus.js'),
      import('../dist/frontend/src/assistant/AssistantCore.js'),
    ]);
    assistant = new AssistantCore(new EventBus());
  } catch {
    assistant = undefined;
  }
}

function workArea() { return screen.getPrimaryDisplay().workArea; }

function placeNearCorner() {
  if (!mainWindow) return;
  const bounds = workArea();
  const [width, height] = mainWindow.getSize();
  mainWindow.setPosition(bounds.x + bounds.width - width - 28, bounds.y + bounds.height - height - 28);
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 240,
    height: 360,
    minWidth: 210,
    minHeight: 300,
    maxWidth: 300,
    maxHeight: 430,
    frame: false,
    transparent: true,
    resizable: false,
    movable: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    hasShadow: false,
    backgroundColor: '#00000000',
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });
  mainWindow.setAlwaysOnTop(true, 'floating');
  mainWindow.setMenuBarVisibility(false);
  mainWindow.loadFile(path.join(__dirname, 'index.html'));
  mainWindow.once('ready-to-show', placeNearCorner);
}

app.whenReady().then(async () => {
  await loadAssistant();
  createWindow();

  globalShortcut.register('CommandOrControl+Shift+S', () => {
    if (!mainWindow) return;
    mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
  });

  ipcMain.handle('window:hide', () => mainWindow?.hide());
  ipcMain.handle('window:close', () => app.quit());
  ipcMain.handle('window:toggle-always-on-top', () => {
    if (!mainWindow) return false;
    const next = !mainWindow.isAlwaysOnTop();
    mainWindow.setAlwaysOnTop(next, 'floating');
    return next;
  });
  ipcMain.handle('window:center', placeNearCorner);
  ipcMain.handle('window:move', (_event, x, y) => {
    if (!mainWindow || !Number.isFinite(x) || !Number.isFinite(y)) return false;
    const bounds = workArea();
    const [width, height] = mainWindow.getSize();
    const nextX = Math.max(bounds.x, Math.min(Math.round(x), bounds.x + bounds.width - width));
    const nextY = Math.max(bounds.y, Math.min(Math.round(y), bounds.y + bounds.height - height));
    mainWindow.setPosition(nextX, nextY);
    return true;
  });
  ipcMain.handle('window:move-by', (_event, dx, dy) => {
    if (!mainWindow || !Number.isFinite(dx) || !Number.isFinite(dy)) return false;
    const [x, y] = mainWindow.getPosition();
    const bounds = workArea();
    const [width, height] = mainWindow.getSize();
    const nextX = Math.max(bounds.x, Math.min(Math.round(x + dx), bounds.x + bounds.width - width));
    const nextY = Math.max(bounds.y, Math.min(Math.round(y + dy), bounds.y + bounds.height - height));
    mainWindow.setPosition(nextX, nextY);
    return true;
  });
  ipcMain.handle('window:set-interactive', (_event, interactive) => {
    mainWindow?.setIgnoreMouseEvents(!Boolean(interactive), { forward: true });
    return Boolean(interactive);
  });
  ipcMain.handle('network:get', () => networkAllowed);
  ipcMain.handle('network:set', (_event, allowed) => {
    networkAllowed = Boolean(allowed);
    return networkAllowed;
  });
  ipcMain.handle('assistant:message', (_event, rawText) => {
    if (typeof rawText !== 'string') return { ok: false, text: 'I could not read that message.' };
    const text = rawText.trim().slice(0, 4000);
    if (!text) return { ok: false, text: '' };
    const decision = assistant?.decide(text);
    if (!decision || decision.kind !== 'respond') return { ok: false, text: '' };
    return { ok: true, text: decision.text, networkAllowed };
  });
});

app.on('will-quit', () => globalShortcut.unregisterAll());
app.on('window-all-closed', (event) => event.preventDefault());
