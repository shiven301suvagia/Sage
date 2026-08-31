import { EventBus, type SageEvent } from './EventBus.js';

export type AssistantDecision =
  | { readonly kind: 'ignore'; readonly reason: string }
  | { readonly kind: 'respond'; readonly text: string };

export interface AssistantCoreOptions {
  readonly minInputLength?: number;
}

/**
 * Offline-first assistant boundary. The desktop runtime owns permissions;
 * this core never performs network access itself.
 */
export class AssistantCore {
  private readonly minInputLength: number;
  private readonly memory = new Map<string, string>();

  constructor(
    private readonly events: EventBus,
    options: AssistantCoreOptions = {},
  ) {
    this.minInputLength = options.minInputLength ?? 1;
    this.events.on('user.input', (event) => this.handleInput(event));
  }

  decide(text: string): AssistantDecision {
    const normalized = text.trim();
    if (normalized.length < this.minInputLength) {
      return { kind: 'ignore', reason: 'Input is empty or below the minimum length.' };
    }

    const lower = normalized.toLowerCase();

    if (/^(hi|hello|hey|hiya)\b/.test(lower)) {
      return { kind: 'respond', text: 'Hey. I’m Sage. I’m right here. What are we working on?' };
    }

    if (lower.includes('who are you') || lower.includes('your name')) {
      return { kind: 'respond', text: 'I’m Sage — your local desktop companion. I can stay with you offline, and online access can be enabled when you choose.' };
    }

    if (lower.includes('offline')) {
      return { kind: 'respond', text: 'Offline mode is my default. I can keep my local companion features running without the internet.' };
    }

    if (lower.includes('remember ') || lower.includes('remember that ')) {
      const value = normalized.replace(/^.*?remember(?: that)?\s+/i, '').trim();
      if (value) {
        this.memory.set(`memory-${this.memory.size + 1}`, value);
        return { kind: 'respond', text: 'Got it. I’ll keep that in my local session memory.' };
      }
    }

    if (lower.includes('thank')) {
      return { kind: 'respond', text: 'Anytime. 🌱' };
    }

    return {
      kind: 'respond',
      text: 'I’m listening. Tell me what you want to work on.',
    };
  }

  private handleInput(event: SageEvent<'user.input'>): void {
    const decision = this.decide(event.payload.text);
    if (decision.kind !== 'respond') return;

    this.events.emit({
      type: 'assistant.response',
      payload: { text: decision.text, source: 'assistant' },
    });
  }
}
