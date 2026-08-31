import type { AssistantCore } from './AssistantCore.js';
import type { ContextManager, ContextSnapshot } from './ContextManager.js';
import type { EventBus } from './EventBus.js';

export interface MemoryBackedAssistantOptions {
  readonly clock?: () => number;
}

export class MemoryBackedAssistant {
  private readonly clock: () => number;
  private unsubscribe: (() => void) | undefined;

  constructor(
    private readonly events: EventBus,
    private readonly assistant: AssistantCore,
    private readonly context: ContextManager,
    options: MemoryBackedAssistantOptions = {},
  ) {
    this.clock = options.clock ?? Date.now;
    this.unsubscribe = events.on('user.input', (event) => {
      const snapshot = context.build(event.payload.text, event.payload.timestampMs);
      this.rememberInput(event.payload.text, snapshot);
    });
  }

  dispose(): void {
    this.unsubscribe?.();
    this.unsubscribe = undefined;
  }

  buildContext(query: string): ContextSnapshot {
    return this.context.build(query, this.clock());
  }

  private rememberInput(text: string, snapshot: ContextSnapshot): void {
    const result = this.assistant.decide(text);
    if (result.kind !== 'respond') return;

    this.context.rememberConversation(
      `conversation-${snapshot.createdAtMs}`,
      `User: ${text}\nSAGE: ${result.text}`,
      snapshot.createdAtMs,
    );
  }
}
