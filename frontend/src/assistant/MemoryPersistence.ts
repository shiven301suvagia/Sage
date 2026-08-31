import type { MemoryEntry, MemoryStore } from './MemoryStore.js';

export interface MemoryPersistence {
  load(): MemoryEntry[];
  save(entries: readonly MemoryEntry[]): void;
}

/** In-memory persistence adapter. Desktop-specific storage can implement this
 * interface later without changing MemoryStore or ContextManager. */
export class VolatileMemoryPersistence implements MemoryPersistence {
  private snapshot: MemoryEntry[] = [];

  load(): MemoryEntry[] {
    return this.snapshot.map((entry) => ({ ...entry }));
  }

  save(entries: readonly MemoryEntry[]): void {
    this.snapshot = entries.map((entry) => ({ ...entry }));
  }
}

export const hydrateMemoryStore = (
  store: MemoryStore,
  persistence: MemoryPersistence,
): void => {
  persistence.load().forEach((entry) => store.remember({
    id: entry.id,
    kind: entry.kind,
    content: entry.content,
    createdAtMs: entry.createdAtMs,
    importance: entry.importance,
  }));
};
