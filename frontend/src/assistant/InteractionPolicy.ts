import type { SageEventMap } from './EventBus.js';

export type InteractionDecision =
  | { readonly kind: 'respond'; readonly reason: 'user-input' | 'useful-activity' }
  | { readonly kind: 'ignore'; readonly reason: string };

export interface InteractionPolicyOptions {
  readonly cooldownMs?: number;
  readonly minActivityGapMs?: number;
}

/** Keeps SAGE helpful without making her constantly interrupt the user. */
export class InteractionPolicy {
  private readonly cooldownMs: number;
  private readonly minActivityGapMs: number;
  private lastInteractionMs = Number.NEGATIVE_INFINITY;
  private lastActivityMs = Number.NEGATIVE_INFINITY;

  constructor(options: InteractionPolicyOptions = {}) {
    this.cooldownMs = Math.max(0, options.cooldownMs ?? 30_000);
    this.minActivityGapMs = Math.max(0, options.minActivityGapMs ?? 10_000);
  }

  evaluate(event: { readonly type: 'user.input'; readonly payload: SageEventMap['user.input'] } | { readonly type: 'system.activity'; readonly payload: SageEventMap['system.activity'] }): InteractionDecision {
    const now = event.payload.timestampMs;

    if (event.type === 'user.input') {
      if (event.payload.text.trim().length === 0) return { kind: 'ignore', reason: 'Empty input.' };
      this.lastInteractionMs = now;
      return { kind: 'respond', reason: 'user-input' };
    }

    this.lastActivityMs = now;
    if (now - this.lastInteractionMs < this.cooldownMs) {
      return { kind: 'ignore', reason: 'Interaction cooldown is active.' };
    }
    if (now - this.lastActivityMs < this.minActivityGapMs) {
      return { kind: 'ignore', reason: 'Activity is too recent.' };
    }
    return { kind: 'ignore', reason: 'Background activity is passive by default.' };
  }
}
