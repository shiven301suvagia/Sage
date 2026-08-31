export type MemoryKind = 'preference' | 'fact' | 'conversation';

export interface MemoryEntry {
  readonly id: string;
  readonly kind: MemoryKind;
  readonly content: string;
  readonly createdAtMs: number;
  readonly lastAccessedAtMs: number;
  readonly importance: number;
}

export interface MemoryStoreOptions { readonly maxEntries?: number; }

export class MemoryStore {
  private readonly entries = new Map<string, MemoryEntry>();
  private readonly maxEntries: number;

  constructor(options: MemoryStoreOptions = {}) {
    this.maxEntries = Math.max(1, Math.floor(options.maxEntries ?? 100));
  }

  remember(input: Omit<MemoryEntry, 'lastAccessedAtMs'>): MemoryEntry {
    if (!input.id.trim()) throw new Error('Memory id is required.');
    if (!input.content.trim()) throw new Error('Memory content is required.');
    if (!Number.isFinite(input.createdAtMs)) throw new RangeError('Memory timestamp must be finite.');
    if (!Number.isFinite(input.importance)) throw new RangeError('Memory importance must be finite.');
    const entry: MemoryEntry = { ...input, lastAccessedAtMs: input.createdAtMs };
    this.entries.set(entry.id, entry);
    this.trim();
    return entry;
  }

  get(id: string, nowMs: number): MemoryEntry | undefined {
    if (!Number.isFinite(nowMs)) return undefined;
    const entry = this.entries.get(id);
    if (!entry) return undefined;
    const accessed = { ...entry, lastAccessedAtMs: Math.max(entry.lastAccessedAtMs, nowMs) };
    this.entries.set(id, accessed);
    return accessed;
  }

  search(query: string, nowMs: number, limit = 5): MemoryEntry[] {
    if (!Number.isFinite(nowMs) || !Number.isFinite(limit)) return [];
    const terms = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
    if (terms.length === 0) return [];
    const safeLimit = Math.max(0, Math.floor(limit));

    return [...this.entries.values()]
      .map((entry) => ({ entry, score: terms.reduce((score, term) => score + (entry.content.toLowerCase().includes(term) ? 1 : 0), 0) }))
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score || b.entry.importance - a.entry.importance || b.entry.lastAccessedAtMs - a.entry.lastAccessedAtMs)
      .slice(0, safeLimit)
      .map(({ entry }) => this.get(entry.id, nowMs) as MemoryEntry);
  }

  list(): MemoryEntry[] { return [...this.entries.values()]; }
  forget(id: string): boolean { return this.entries.delete(id); }
  clear(): void { this.entries.clear(); }

  private trim(): void {
    while (this.entries.size > this.maxEntries) {
      const oldest = [...this.entries.values()].sort((a, b) => a.importance - b.importance || a.lastAccessedAtMs - b.lastAccessedAtMs)[0];
      if (!oldest) return;
      this.entries.delete(oldest.id);
    }
  }
}
