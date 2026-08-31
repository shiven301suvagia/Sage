export type ConversationRole = 'user' | 'sage';

export interface ConversationTurn {
  readonly role: ConversationRole;
  readonly text: string;
  readonly timestamp: number;
}

export interface SageMemoryStore {
  load(): ConversationTurn[];
  save(turns: ConversationTurn[]): void;
}

export class InMemorySageMemory implements SageMemoryStore {
  private turns: ConversationTurn[] = [];
  load(): ConversationTurn[] { return this.turns.map((turn) => ({ ...turn })); }
  save(turns: ConversationTurn[]): void { this.turns = turns.map((turn) => ({ ...turn })); }
}

export interface SageResponder {
  respond(input: string, history: ConversationTurn[]): Promise<string>;
}

export class SageConversation {
  private readonly memory: SageMemoryStore;
  private readonly responder: SageResponder;

  constructor(responder: SageResponder, memory: SageMemoryStore = new InMemorySageMemory()) {
    this.responder = responder;
    this.memory = memory;
  }

  history(): ConversationTurn[] { return this.memory.load(); }

  async send(input: string, now = Date.now()): Promise<string> {
    const text = input.trim();
    if (!text) throw new RangeError('Message cannot be empty');
    if (!Number.isFinite(now)) throw new RangeError('Invalid timestamp');

    const history = this.memory.load();
    const userTurn: ConversationTurn = { role: 'user', text, timestamp: now };
    const answer = (await this.responder.respond(text, history)).trim();
    if (!answer) throw new Error('SAGE returned an empty response');

    this.memory.save([...history, userTurn, { role: 'sage', text: answer, timestamp: now }]);
    return answer;
  }
}
