import { app, BrowserWindow, globalShortcut, ipcMain, screen } from 'electron';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
let mainWindow;

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

app.whenReady().then(() => {
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
});

app.on('will-quit', () => globalShortcut.unregisterAll());
app.on('window-all-closed', (event) => event.preventDefault());
