export type ConversationRole = 'user' | 'assistant';
export interface ConversationTurn { readonly role: ConversationRole; readonly text: string; readonly timestampMs: number; }

export class ConversationSession {
  private readonly turns: ConversationTurn[] = [];
  constructor(private readonly maxTurns = 12) {}
  add(role: ConversationRole, text: string, timestampMs = Date.now()): ConversationTurn {
    const clean = text.trim();
    if (!clean) throw new Error('Conversation text is required.');
    const turn = { role, text: clean.slice(0, 4000), timestampMs };
    this.turns.push(turn);
    while (this.turns.length > Math.max(2, this.maxTurns)) this.turns.shift();
    return turn;
  }
  list(): readonly ConversationTurn[] { return [...this.turns]; }
  clear(): void { this.turns.length = 0; }
  context(): string { return this.turns.map((t) => `${t.role === 'user' ? 'User' : 'SAGE'}: ${t.text}`).join('\n'); }
}
