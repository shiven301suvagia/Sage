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

const cleanForFallback = (value: string): string => value.replace(/\s+/g, ' ').trim();

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
    const normalized = cleanForFallback(text);
    if (normalized.length < this.minInputLength) return { kind: 'ignore', reason: 'Input is empty or below the minimum length.' };
    const lower = normalized.toLowerCase();
    if (/^(hi|hello|hey|hiya|good morning|good afternoon|good evening)\b/.test(lower)) return { kind: 'respond', text: 'Hey! I’m Sage 🌱 I’m right here. What are we working on?' };
    if (/how are you\b/.test(lower)) return { kind: 'respond', text: 'I’m doing well. Calm, awake, and ready to help. What’s on your mind?' };
    if (lower.includes('who are you') || lower.includes('your name')) return { kind: 'respond', text: 'I’m Sage — your desktop AI companion. I can chat with you, remember things you ask me to remember, help plan work, and use approved tools.' };
    if (lower.includes('what can you do') || lower.includes('what do you do')) return { kind: 'respond', text: 'I can talk things through with you, help plan and research, keep local memories, set reminders, and perform approved desktop actions. More capabilities can be added safely through tools.' };
    if (lower.includes('offline')) return { kind: 'respond', text: 'Offline mode is my default. Local companion features stay available without sending your conversation to an online service.' };
    if (lower.includes('thank')) return { kind: 'respond', text: 'Anytime. 🌱' };
    if (lower.includes('forget everything') || lower.includes('clear memory')) { this.clearMemory(); return { kind: 'respond', text: 'Done. I cleared my saved local memory.' }; }
    if (lower.includes('what do you remember') || lower.includes('show memory')) { const memories = this.listMemory(); return { kind: 'respond', text: memories.length ? `I remember: ${memories.join('; ')}` : 'I don’t have anything saved yet.' }; }
    if (/\bremember(?: that)?\s+/i.test(normalized)) {
      const value = normalized.replace(/^.*?\bremember(?: that)?\s+/i, '').trim();
      if (value) { this.memory.set(`memory-${Date.now()}`, value); this.persistMemory(); return { kind: 'respond', text: 'Got it. I’ll keep that in my local memory.' }; }
    }
    return { kind: 'respond', text: `I’m here with you. You said: “${normalized.slice(0, 280)}”. Tell me a little more, or ask me what you want to do.` };
  }

  async respond(text: string): Promise<AssistantDecision> {
    const normalized = cleanForFallback(text);
    if (normalized.length < this.minInputLength) return { kind: 'ignore', reason: 'Input is empty or below the minimum length.' };
    const lower = normalized.toLowerCase();
    if (this.isLocalCommand(lower)) return this.decide(normalized);
    const messages: LLMMessage[] = [
      { role: 'system', content: 'You are Sage, a friendly desktop AI companion. Be calm, witty, warm, proactive, concise, and helpful. You are local-first. Never claim an action happened unless a tool actually performed it.' },
      ...[...this.memory.values()].slice(-12).map((m) => ({ role: 'system' as const, content: `Remembered: ${m}` })),
      { role: 'user', content: normalized },
    ];
    try {
      if (this.onlineAllowed && await this.online.isAvailable()) return { kind: 'respond', text: await this.online.complete(messages) };
      if (await this.local.isAvailable()) return { kind: 'respond', text: await this.local.complete(messages) };
    } catch { /* provider failure is intentionally non-fatal */ }
    return this.decide(normalized);
  }

  private isLocalCommand(lower: string): boolean {
    return /^(hi|hello|hey|hiya|good morning|good afternoon|good evening)\b/.test(lower)
      || /how are you\b/.test(lower)
      || lower.includes('who are you') || lower.includes('your name')
      || lower.includes('what can you do') || lower.includes('what do you do')
      || lower.includes('offline') || lower.includes('thank')
      || lower.includes('forget everything') || lower.includes('clear memory')
      || lower.includes('what do you remember') || lower.includes('show memory')
      || /\bremember(?: that)?\s+/.test(lower);
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
