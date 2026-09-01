import { shell } from 'electron';

const APP_TARGETS = Object.freeze({
  'vs code': 'vscode://', 'visual studio code': 'vscode://', vscode: 'vscode://',
  calculator: 'calc:', notepad: 'notepad', paint: 'mspaint',
});
const normalize = (value) => String(value ?? '').trim().toLowerCase().replace(/\s+/g, ' ');

export class SafeActions {
  constructor({ rootPath, logger = console } = {}) { this.rootPath = rootPath; this.logger = logger; }
  match(command) {
    const text = normalize(command);
    if (text === 'open vs code' || text === 'open visual studio code' || text === 'open vscode') return { id: 'open-vscode', label: 'VS Code' };
    if (text === 'open calculator' || text === 'open the calculator') return { id: 'open-calculator', label: 'Calculator' };
    if (text === 'open notepad') return { id: 'open-notepad', label: 'Notepad' };
    if (text === 'open paint' || text === 'open microsoft paint') return { id: 'open-paint', label: 'Paint' };
    if (text === 'open sage folder' || text === 'open project folder') return { id: 'open-sage-folder', label: 'SAGE project folder' };
    return undefined;
  }
  async execute(id) {
    switch (id) {
      case 'open-vscode': return this.#openExternal('VS Code', APP_TARGETS['vs code']);
      case 'open-calculator': return this.#openExternal('Calculator', APP_TARGETS.calculator);
      case 'open-notepad': return this.#openExternal('Notepad', APP_TARGETS.notepad);
      case 'open-paint': return this.#openExternal('Paint', APP_TARGETS.paint);
      case 'open-sage-folder': {
        if (!this.rootPath) return { ok: false, message: 'The SAGE project folder is not configured.' };
        try { const error = await shell.openPath(this.rootPath); return error ? { ok: false, message: `I couldn’t open the project folder: ${error}` } : { ok: true, message: 'Opening the SAGE project folder.' }; }
        catch (error) { this.logger.warn?.('SAGE folder action failed', error); return { ok: false, message: 'I couldn’t open the SAGE project folder.' }; }
      }
      default: return { ok: false, message: 'Unknown safe action.' };
    }
  }
  async #openExternal(label, target) { try { await shell.openExternal(target); return { ok: true, message: `Opening ${label}.` }; } catch (error) { this.logger.warn?.('SAGE safe action failed', error); return { ok: false, message: `I couldn’t open ${label}.` }; } }
}
