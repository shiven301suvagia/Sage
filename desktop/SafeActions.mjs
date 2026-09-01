import { shell } from 'electron';

const APP_TARGETS = Object.freeze({
  'vs code': 'vscode://',
  'visual studio code': 'vscode://',
  vscode: 'vscode://',
  calculator: 'calc:',
  notepad: 'notepad',
  paint: 'mspaint',
});

const normalize = (value) => String(value ?? '').trim().toLowerCase().replace(/\s+/g, ' ');

export class SafeActions {
  constructor({ rootPath, logger = console } = {}) {
    this.rootPath = rootPath;
    this.logger = logger;
  }

  async execute(command) {
    const text = normalize(command);
    if (text === 'open vs code' || text === 'open visual studio code' || text === 'open vscode') return this.#openExternal('VS Code', APP_TARGETS['vs code']);
    if (text === 'open calculator' || text === 'open the calculator') return this.#openExternal('Calculator', APP_TARGETS.calculator);
    if (text === 'open notepad') return this.#openExternal('Notepad', APP_TARGETS.notepad);
    if (text === 'open paint' || text === 'open microsoft paint') return this.#openExternal('Paint', APP_TARGETS.paint);
    if (text === 'open sage folder' || text === 'open project folder') {
      if (!this.rootPath) return { ok: false, message: 'The SAGE project folder is not configured.' };
      const error = await shell.openPath(this.rootPath);
      return error ? { ok: false, message: `I couldn’t open the project folder: ${error}` } : { ok: true, message: 'Opening the SAGE project folder.' };
    }
    return undefined;
  }

  async #openExternal(label, target) {
    try { await shell.openExternal(target); return { ok: true, message: `Opening ${label}.` }; }
    catch (error) { this.logger.warn?.('SAGE safe action failed', error); return { ok: false, message: `I couldn’t open ${label}.` }; }
  }
}
