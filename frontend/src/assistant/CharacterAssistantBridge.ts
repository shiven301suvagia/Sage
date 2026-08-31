import type { AssistantCore } from './AssistantCore.js';
import type { EventBus } from './EventBus.js';
import type { CharacterRuntime } from '../rendering/CharacterRuntime.js';

export interface CharacterAssistantBridgeOptions {
  readonly responseHoldMs?: number;
}

/** Connects assistant responses to the character runtime without giving the
 * assistant direct control over rendering internals. */
export class CharacterAssistantBridge {
  private readonly responseHoldMs: number;
  private unsubscribe: (() => void) | undefined;
  private sleepTimer: ReturnType<typeof setTimeout> | undefined;

  constructor(
    private readonly events: EventBus,
    private readonly runtime: CharacterRuntime,
    _assistant: AssistantCore,
    options: CharacterAssistantBridgeOptions = {},
  ) {
    this.responseHoldMs = options.responseHoldMs ?? 2500;
    this.unsubscribe = this.events.on('assistant.response', () => this.onResponse());
  }

  dispose(): void {
    this.unsubscribe?.();
    this.unsubscribe = undefined;
    if (this.sleepTimer) clearTimeout(this.sleepTimer);
    this.sleepTimer = undefined;
  }

  private onResponse(): void {
    this.runtime.wake();

    if (this.sleepTimer) clearTimeout(this.sleepTimer);
    this.sleepTimer = setTimeout(() => {
      this.runtime.sleep();
      this.sleepTimer = undefined;
    }, this.responseHoldMs);
  }
}
