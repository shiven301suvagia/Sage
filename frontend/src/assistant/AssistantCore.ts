import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { EventBus, type SageEvent } from './EventBus.js';
import { OllamaProvider, OpenAICompatibleProvider, type LLMMessage, type LLMProvider } from './LLMProvider.js';

export type AssistantDecision =
  | { readonly kind: 'ignore'; readonly reason: string }
  | { readonly kind: 'respond'; readonly text: string };

export interface AssistantCoreOptions {
  readonly minInputLength?: number;
  readonly localProvider?: LLMProvider;
  readonly onlineProvider?: LLMProvider;
  readonly memoryFile?: string;
}

type StoredMemory = Record<string, string>;

function defaultMemoryFile(): string {
  const base = process.env.APPDATA ?? process.env.XDG_DATA_HOME ?? path.join(process.env.HOME ?? process.cwd(), '.local', 'share');
  return path.join(base, 'Sage', 'memory.json');
}

export class AssistantCore {
  private readonly minInputLength: number;
  private readonly memory = new Map<string, string>();
  private readonly memoryFile: string;
  private readonly local: LLMProvider;
  private readonly online: LLMProvider;
  private onlineAllowed = false;

  constructor(private readonly events: EventBus, options: AssistantCoreOptions = {}) {
    this.minInputLength = options.minInputLength ?? 1;
    this.memoryFile = options.memoryFile ?? defaultMemoryFile();
    this.local = options.localProvider ?? new OllamaProvider();
    this.online = options.onlineProvider ?? new OpenAICompatibleProvider();
    this.loadMemory();
    this.events.on('user.input', (event) => { void this.handleInput(event); });
  }

  setOnlineAllowed(allowed: boolean): void { this.onlineAllowed = Boolean(allowed); }

  listMemory(): readonly string[] { return [...this.memory.values()]; }

  clearMemory(): void { this.memory.clear(); this.persistMemory(); }

  decide(text: string): AssistantDecision {
    const normalized = text.trim();
    if (normalized.length < this.minInputLength) return { kind: 'ignore', reason: 'Input is empty or below the minimum length.' };
    const lower = normalized.toLowerCase();
    if (/^(hi|hello|hey|hiya)\b/.test(lower)) return { kind: 'respond', text: 'Hey. I’m Sage. I’m right here. What are we working on?' };
    if (lower.includes('who are you') || lower.includes('your name')) return { kind: 'respond', text: 'I’m Sage — your local desktop companion. I can stay with you offline, and online access can be enabled when you choose.' };
    if (lower.includes('offline')) return { kind: 'respond', text: 'Offline mode is my default. I can keep my local companion features running without the internet.' };
    if (lower.includes('forget everything') || lower.includes('clear memory')) { this.clearMemory(); return { kind: 'respond', text: 'Done. I cleared my saved local memory.' }; }
    if (lower.includes('what do you remember') || lower.includes('show memory')) { const memories = this.listMemory(); return { kind: 'respond', text: memories.length ? `I remember: ${memories.join('; ')}` : 'I don’t have anything saved yet.' }; }
    if (lower.includes('remember ') || lower.includes('remember that ')) {
      const value = normalized.replace(/^.*?remember(?: that)?\s+/i, '').trim();
      if (value) { this.memory.set(`memory-${Date.now()}`, value); this.persistMemory(); return { kind: 'respond', text: 'Got it. I’ll keep that in my local memory.' }; }
    }
    if (lower.includes('thank')) return { kind: 'respond', text: 'Anytime. 🌱' };
    return { kind: 'respond', text: 'I’m listening. Tell me what you want to work on.' };
  }

  async respond(text: string): Promise<AssistantDecision> {
    const normalized = text.trim();
    if (normalized.length < this.minInputLength) return { kind: 'ignore', reason: 'Input is empty or below the minimum length.' };
    const lower = normalized.toLowerCase();
    if (lower.includes('remember ') || lower.includes('remember that ') || lower.includes('clear memory') || lower.includes('forget everything') || lower.includes('what do you remember') || lower.includes('show memory')) return this.decide(normalized);
    const messages: LLMMessage[] = [
      { role: 'system', content: 'You are Sage, a friendly desktop AI companion. Be calm, witty, proactive, concise, and helpful. You are local-first. Never claim an action happened unless a tool actually performed it.' },
      ...[...this.memory.values()].slice(-12).map((m) => ({ role: 'system' as const, content: `Remembered: ${m}` })),
      { role: 'user', content: normalized },
    ];
    try {
      if (this.onlineAllowed && await this.online.isAvailable()) return { kind: 'respond', text: await this.online.complete(messages) };
      if (await this.local.isAvailable()) return { kind: 'respond', text: await this.local.complete(messages) };
    } catch { /* graceful fallback */ }
    return this.decide(normalized);
  }

  private loadMemory(): void {
    try {
      if (!existsSync(this.memoryFile)) return;
      const parsed = JSON.parse(readFileSync(this.memoryFile, 'utf8')) as unknown;
      if (!parsed || typeof parsed !== 'object') return;
      for (const [key, value] of Object.entries(parsed as StoredMemory)) if (typeof value === 'string' && value.trim()) this.memory.set(key, value);
    } catch { /* never block startup */ }
  }

  private persistMemory(): void {
    try {
      mkdirSync(path.dirname(this.memoryFile), { recursive: true });
      const temp = `${this.memoryFile}.tmp`;
      writeFileSync(temp, JSON.stringify(Object.fromEntries(this.memory), null, 2), 'utf8');
      renameSync(temp, this.memoryFile);
    } catch { /* best effort */ }
  }

  private async handleInput(event: SageEvent<'user.input'>): Promise<void> {
    const decision = await this.respond(event.payload.text);
    if (decision.kind !== 'respond') return;
    this.events.emit({ type: 'assistant.response', payload: { text: decision.text, source: 'assistant' } });
  }
}
