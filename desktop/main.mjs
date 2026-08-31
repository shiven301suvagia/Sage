import { app, BrowserWindow, globalShortcut, ipcMain, screen } from 'electron';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
let mainWindow;
let assistant;

async function loadAssistant() {
  try {
    const [{ EventBus }, { AssistantCore }] = await Promise.all([
      import('../dist/frontend/src/assistant/EventBus.js'),
      import('../dist/frontend/src/assistant/AssistantCore.js'),
    ]);
    const events = new EventBus();
    assistant = new AssistantCore(events);
    return true;
  } catch {
    assistant = undefined;
    return false;
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 420,
    height: 620,
    minWidth: 320,
    minHeight: 420,
    frame: false,
    transparent: true,
    resizable: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    backgroundColor: '#00000000',
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  mainWindow.loadFile(path.join(__dirname, 'index.html'));
  mainWindow.setAlwaysOnTop(true, 'floating');
}

app.whenReady().then(async () => {
  await loadAssistant();
  createWindow();

  globalShortcut.register('CommandOrControl+Shift+S', () => {
    if (!mainWindow) return;
    if (mainWindow.isVisible()) mainWindow.hide(); else mainWindow.show();
  });

  ipcMain.handle('window:hide', () => mainWindow?.hide());
  ipcMain.handle('window:close', () => app.quit());
  ipcMain.handle('window:toggle-always-on-top', () => {
    if (!mainWindow) return false;
    const next = !mainWindow.isAlwaysOnTop();
    mainWindow.setAlwaysOnTop(next, 'floating');
    return next;
  });
  ipcMain.handle('window:center', () => {
    if (!mainWindow) return;
    const display = screen.getPrimaryDisplay();
    const bounds = display.workArea;
    const [width, height] = mainWindow.getSize();
    mainWindow.setPosition(Math.round(bounds.x + bounds.width - width - 28), Math.round(bounds.y + bounds.height - height - 28));
  });
  ipcMain.handle('assistant:message', (_event, rawText) => {
    if (typeof rawText !== 'string') return { ok: false, text: 'I could not read that message.' };
    const text = rawText.trim().slice(0, 4000);
    if (!text) return { ok: false, text: '' };
    const decision = assistant?.decide(text);
    if (!decision || decision.kind !== 'respond') return { ok: false, text: '' };
    return { ok: true, text: decision.text };
  });
});

app.on('will-quit', () => globalShortcut.unregisterAll());
app.on('window-all-closed', (event) => event.preventDefault());
