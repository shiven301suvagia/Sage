import type { AssistantCore } from './AssistantCore.js';
import type { EventBus } from './EventBus.js';
import type { CharacterRuntime } from '../rendering/CharacterRuntime.js';

export interface CharacterAssistantBridgeOptions {
  readonly responseHoldMs?: number;
  readonly now?: () => number;
}

/** Connects assistant responses to the character runtime without giving the assistant direct control over rendering internals. */
export class CharacterAssistantBridge {
  private readonly responseHoldMs: number;
  private readonly now: () => number;
  private readonly unsubscribe: () => void;
  private sleepTimer: ReturnType<typeof setTimeout> | undefined;

  constructor(
    private readonly events: EventBus,
    private readonly runtime: CharacterRuntime,
    _assistant: AssistantCore,
    options: CharacterAssistantBridgeOptions = {},
  ) {
    this.responseHoldMs = Math.max(0, options.responseHoldMs ?? 2500);
    this.now = options.now ?? (() => Date.now());
    this.unsubscribe = this.events.on('assistant.response', () => this.onResponse());
  }

  dispose(): void {
    this.unsubscribe();
    if (this.sleepTimer) clearTimeout(this.sleepTimer);
    this.sleepTimer = undefined;
  }

  private onResponse(): void {
    this.runtime.wake(this.now());
    if (this.sleepTimer) clearTimeout(this.sleepTimer);
    this.sleepTimer = setTimeout(() => {
      this.runtime.sleep(this.now());
      this.sleepTimer = undefined;
    }, this.responseHoldMs);
  }
}
