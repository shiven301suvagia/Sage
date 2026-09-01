import { app, BrowserWindow, globalShortcut, ipcMain, Notification, screen } from 'electron';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ReminderService, parseRelativeReminder } from './ReminderService.mjs';
import { SafeActions } from './SafeActions.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
let mainWindow;
let assistant;
let reminders;
let actions;
let conversation;
let networkAllowed = false;

async function loadAssistant() {
  try {
    const [{ EventBus }, { AssistantCore }, { ConversationSession }] = await Promise.all([
      import('../dist/frontend/src/assistant/EventBus.js'),
      import('../dist/frontend/src/assistant/AssistantCore.js'),
      import('../dist/frontend/src/assistant/ConversationSession.js'),
    ]);
    assistant = new AssistantCore(new EventBus());
    conversation = new ConversationSession(12);
    assistant.setOnlineAllowed(networkAllowed);
  } catch {
    assistant = undefined;
    conversation = undefined;
  }
}

function workArea() { return screen.getPrimaryDisplay().workArea; }
function placeNearCorner() {
  if (!mainWindow) return;
  const bounds = workArea();
  const [width, height] = mainWindow.getSize();
  mainWindow.setPosition(bounds.x + bounds.width - width - 28, bounds.y + bounds.height - height - 28);
}
function moveBy(dx, dy) {
  if (!mainWindow || !Number.isFinite(dx) || !Number.isFinite(dy)) return false;
  const bounds = workArea();
  const [x, y] = mainWindow.getPosition();
  const [width, height] = mainWindow.getSize();
  mainWindow.setPosition(Math.max(bounds.x, Math.min(Math.round(x + dx), bounds.x + bounds.width - width)), Math.max(bounds.y, Math.min(Math.round(y + dy), bounds.y + bounds.height - height)));
  return true;
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 220, height: 330, minWidth: 190, minHeight: 270, maxWidth: 280, maxHeight: 400,
    frame: false, transparent: true, resizable: false, movable: true, alwaysOnTop: true,
    skipTaskbar: true, hasShadow: false, backgroundColor: '#00000000',
    webPreferences: { preload: path.join(__dirname, 'preload.mjs'), contextIsolation: true, nodeIntegration: false, sandbox: true },
  });
  mainWindow.setAlwaysOnTop(true, 'floating');
  mainWindow.setMenuBarVisibility(false);
  mainWindow.loadFile(path.join(__dirname, 'index.html'));
  mainWindow.once('ready-to-show', placeNearCorner);
}

app.whenReady().then(async () => {
  await loadAssistant();
  const memoryDir = path.join(app.getPath('userData'), 'Sage');
  actions = new SafeActions({ rootPath: app.getAppPath() });
  reminders = new ReminderService(path.join(memoryDir, 'reminders.json'), (item) => {
    if (Notification.isSupported()) new Notification({ title: 'SAGE reminder', body: item.text }).show();
    mainWindow?.webContents.send('reminder:fired', { id: item.id, text: item.text, atMs: item.atMs });
  });
  createWindow();
  globalShortcut.register('CommandOrControl+Shift+S', () => { if (!mainWindow) return; mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show(); });
  ipcMain.handle('window:hide', () => mainWindow?.hide());
  ipcMain.handle('window:close', () => app.quit());
  ipcMain.handle('window:toggle-always-on-top', () => { if (!mainWindow) return false; const next = !mainWindow.isAlwaysOnTop(); mainWindow.setAlwaysOnTop(next, 'floating'); return next; });
  ipcMain.handle('window:center', placeNearCorner);
  ipcMain.handle('window:move', (_event, x, y) => { if (!mainWindow || !Number.isFinite(x) || !Number.isFinite(y)) return false; const bounds = workArea(); const [width, height] = mainWindow.getSize(); mainWindow.setPosition(Math.max(bounds.x, Math.min(Math.round(x), bounds.x + bounds.width - width)), Math.max(bounds.y, Math.min(Math.round(y), bounds.y + bounds.height - height))); return true; });
  ipcMain.handle('window:move-by', (_event, dx, dy) => moveBy(Number(dx), Number(dy)));
  ipcMain.handle('window:set-interactive', (_event, interactive) => { mainWindow?.setIgnoreMouseEvents(!Boolean(interactive), { forward: true }); return Boolean(interactive); });
  ipcMain.handle('network:get', () => networkAllowed);
  ipcMain.handle('network:set', (_event, allowed) => { networkAllowed = Boolean(allowed); assistant?.setOnlineAllowed(networkAllowed); return networkAllowed; });
  ipcMain.handle('reminder:list', () => reminders.list());
  ipcMain.handle('reminder:add', (_event, text, atMs) => { try { return { ok: true, reminder: reminders.add(text, Number(atMs)) }; } catch (error) { return { ok: false, error: error instanceof Error ? error.message : 'Could not create reminder.' }; } });
  ipcMain.handle('reminder:remove', (_event, id) => reminders.remove(id));
  ipcMain.handle('reminder:clear', () => { reminders.clear(); return true; });
  ipcMain.handle('assistant:message', async (_event, rawText) => {
    if (typeof rawText !== 'string') return { ok: false, text: 'I could not read that message.' };
    const text = rawText.trim().slice(0, 4000);
    if (!text) return { ok: false, text: '' };

    const relative = parseRelativeReminder(text);
    if (relative) {
      const reminder = reminders.add(relative.text, relative.atMs);
      return { ok: true, text: `Done. I’ll remind you in ${text.match(/^remind me in\s+\d+\s*\w+/i)?.[0].replace(/^remind me in\s+/i, '') ?? 'a little while'}.`, reminder, networkAllowed };
    }

    const action = actions?.match(text);
    if (action) {
      const result = await actions.execute(action.id);
      return { ok: result.ok, text: result.message, action: action.id, networkAllowed };
    }

    if (!assistant) return { ok: false, text: 'SAGE is still starting. Please try again in a moment.' };
    conversation?.add('user', text);
    const context = conversation?.context() ?? '';
    const decision = await assistant.respond(context ? `Use this recent conversation for context. Respond naturally to the latest user message.\n${context}` : text);
    if (decision.kind !== 'respond') return { ok: false, text: '' };
    conversation?.add('assistant', decision.text);
    return { ok: true, text: decision.text, networkAllowed };
  });
});

app.on('will-quit', () => { globalShortcut.unregisterAll(); reminders?.dispose(); });
app.on('window-all-closed', event => event.preventDefault());
