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

function placeNearCorner() {
  if (!mainWindow) return;
  const bounds = screen.getPrimaryDisplay().workArea;
  const [width, height] = mainWindow.getSize();
  mainWindow.setPosition(bounds.x + bounds.width - width - 24, bounds.y + bounds.height - height - 24);
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 280,
    height: 330,
    minWidth: 240,
    minHeight: 280,
    maxWidth: 360,
    maxHeight: 440,
    frame: false,
    transparent: true,
    resizable: true,
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
    const bounds = screen.getPrimaryDisplay().workArea;
    const [width, height] = mainWindow.getSize();
    const nextX = Math.max(bounds.x, Math.min(Math.round(x), bounds.x + bounds.width - width));
    const nextY = Math.max(bounds.y, Math.min(Math.round(y), bounds.y + bounds.height - height));
    mainWindow.setPosition(nextX, nextY);
    return true;
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
