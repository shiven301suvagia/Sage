import { EventBus, type SageEvent } from './EventBus.js';

export type AssistantDecision =
  | { readonly kind: 'ignore'; readonly reason: string }
  | { readonly kind: 'respond'; readonly text: string };

export interface AssistantCoreOptions {
  readonly minInputLength?: number;
}

/**
 * Deterministic assistant boundary. Model/tool integrations can be added later
 * without allowing them to directly control the character runtime.
 */
export class AssistantCore {
  private readonly minInputLength: number;

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
      return { kind: 'respond', text: 'Hey. I’m here. What are we working on?' };
    }

    if (lower.includes('thank')) {
      return { kind: 'respond', text: 'Anytime. 🌱' };
    }

    return {
      kind: 'respond',
      text: 'I heard you. I’m ready for the next step.',
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
