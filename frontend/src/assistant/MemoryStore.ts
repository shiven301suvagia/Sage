export type MemoryKind = 'preference' | 'fact' | 'conversation';

export interface MemoryEntry {
  readonly id: string;
  readonly kind: MemoryKind;
  readonly content: string;
  readonly createdAtMs: number;
  readonly lastAccessedAtMs: number;
  readonly importance: number;
}

export interface MemoryStoreOptions {
  readonly maxEntries?: number;
}

export class MemoryStore {
  private readonly entries = new Map<string, MemoryEntry>();
  private readonly maxEntries: number;

  constructor(options: MemoryStoreOptions = {}) {
    this.maxEntries = Math.max(1, options.maxEntries ?? 100);
  }

  remember(input: Omit<MemoryEntry, 'lastAccessedAtMs'>): MemoryEntry {
    const entry: MemoryEntry = { ...input, lastAccessedAtMs: input.createdAtMs };
    this.entries.set(entry.id, entry);
    this.trim();
    return entry;
  }

  get(id: string, nowMs: number): MemoryEntry | undefined {
    const entry = this.entries.get(id);
    if (!entry) return undefined;
    const accessed = { ...entry, lastAccessedAtMs: nowMs };
    this.entries.set(id, accessed);
    return accessed;
  }

  search(query: string, nowMs: number, limit = 5): MemoryEntry[] {
    const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
    if (terms.length === 0) return [];

    return [...this.entries.values()]
      .map((entry) => ({
        entry,
        score: terms.reduce((score, term) => score + (entry.content.toLowerCase().includes(term) ? 1 : 0), 0),
      }))
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score || b.entry.importance - a.entry.importance || b.entry.lastAccessedAtMs - a.entry.lastAccessedAtMs)
      .slice(0, Math.max(0, limit))
      .map(({ entry }) => this.get(entry.id, nowMs) as MemoryEntry);
  }

  list(): MemoryEntry[] {
    return [...this.entries.values()];
  }

  forget(id: string): boolean {
    return this.entries.delete(id);
  }

  clear(): void {
    this.entries.clear();
  }

  private trim(): void {
    while (this.entries.size > this.maxEntries) {
      const oldest = [...this.entries.values()].sort((a, b) => a.importance - b.importance || a.lastAccessedAtMs - b.lastAccessedAtMs)[0];
      if (!oldest) return;
      this.entries.delete(oldest.id);
    }
  }
}
