import { EventBus, type SageEvent } from './EventBus.js';
import { OllamaProvider, OpenAICompatibleProvider, type LLMMessage, type LLMProvider } from './LLMProvider.js';

export type AssistantDecision =
  | { readonly kind: 'ignore'; readonly reason: string }
  | { readonly kind: 'respond'; readonly text: string };

export interface AssistantCoreOptions {
  readonly minInputLength?: number;
  readonly localProvider?: LLMProvider;
  readonly onlineProvider?: LLMProvider;
}

export class AssistantCore {
  private readonly minInputLength: number;
  private readonly memory = new Map<string, string>();
  private readonly local: LLMProvider;
  private readonly online: LLMProvider;
  private onlineAllowed = false;

  constructor(private readonly events: EventBus, options: AssistantCoreOptions = {}) {
    this.minInputLength = options.minInputLength ?? 1;
    this.local = options.localProvider ?? new OllamaProvider();
    this.online = options.onlineProvider ?? new OpenAICompatibleProvider();
    this.events.on('user.input', (event) => { void this.handleInput(event); });
  }

  setOnlineAllowed(allowed: boolean): void { this.onlineAllowed = Boolean(allowed); }

  decide(text: string): AssistantDecision {
    const normalized = text.trim();
    if (normalized.length < this.minInputLength) return { kind: 'ignore', reason: 'Input is empty or below the minimum length.' };
    const lower = normalized.toLowerCase();
    if (/^(hi|hello|hey|hiya)\b/.test(lower)) return { kind: 'respond', text: 'Hey. I’m Sage. I’m right here. What are we working on?' };
    if (lower.includes('who are you') || lower.includes('your name')) return { kind: 'respond', text: 'I’m Sage — your local desktop companion. I can stay with you offline, and online access can be enabled when you choose.' };
    if (lower.includes('offline')) return { kind: 'respond', text: 'Offline mode is my default. I can keep my local companion features running without the internet.' };
    if (lower.includes('remember ') || lower.includes('remember that ')) {
      const value = normalized.replace(/^.*?remember(?: that)?\s+/i, '').trim();
      if (value) { this.memory.set(`memory-${this.memory.size + 1}`, value); return { kind: 'respond', text: 'Got it. I’ll keep that in my local session memory.' }; }
    }
    if (lower.includes('thank')) return { kind: 'respond', text: 'Anytime. 🌱' };
    return { kind: 'respond', text: 'I’m listening. Tell me what you want to work on.' };
  }

  async respond(text: string): Promise<AssistantDecision> {
    const normalized = text.trim();
    if (normalized.length < this.minInputLength) return { kind: 'ignore', reason: 'Input is empty or below the minimum length.' };
    const system = 'You are Sage, a friendly desktop AI companion. Be calm, witty, proactive, concise, and helpful. You are a local-first assistant. Never claim to have performed an action unless a tool actually performed it.';
    const messages: LLMMessage[] = [
      { role: 'system', content: system },
      ...[...this.memory.values()].slice(-12).map((m) => ({ role: 'system' as const, content: `Remembered: ${m}` })),
      { role: 'user', content: normalized },
    ];
    try {
      if (this.onlineAllowed && await this.online.isAvailable()) return { kind: 'respond', text: await this.online.complete(messages) };
      if (await this.local.isAvailable()) return { kind: 'respond', text: await this.local.complete(messages) };
    } catch {
      // Fall through to deterministic local responses so the companion remains usable.
    }
    return this.decide(normalized);
  }

  private async handleInput(event: SageEvent<'user.input'>): Promise<void> {
    const decision = await this.respond(event.payload.text);
    if (decision.kind !== 'respond') return;
    this.events.emit({ type: 'assistant.response', payload: { text: decision.text, source: 'assistant' } });
  }
}
