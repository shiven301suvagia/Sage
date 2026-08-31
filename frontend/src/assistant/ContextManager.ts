import type { MemoryEntry, MemoryStore } from './MemoryStore.js';

export interface ContextSnapshot {
  readonly query: string;
  readonly relevantMemories: readonly MemoryEntry[];
  readonly createdAtMs: number;
}

export class ContextManager {
  constructor(private readonly memory: MemoryStore, private readonly maxMemories = 5) {}

  build(query: string, nowMs: number): ContextSnapshot {
    return {
      query: query.trim(),
      relevantMemories: this.memory.search(query, nowMs, this.maxMemories),
      createdAtMs: nowMs,
    };
  }

  rememberConversation(id: string, content: string, nowMs: number, importance = 0.25): MemoryEntry {
    return this.memory.remember({ id, kind: 'conversation', content, createdAtMs: nowMs, importance });
  }
}
