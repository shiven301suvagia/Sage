export class CompanionRouter {
  constructor({ conversation, actions, complete, onState } = {}) {
    this.conversation = conversation;
    this.actions = actions;
    this.complete = complete;
    this.onState = onState;
  }

  async handle(text) {
    const clean = String(text ?? '').trim().slice(0, 4000);
    if (!clean) return { ok: false, text: 'Tell me what you need.' };

    const action = this.actions?.match?.(clean);
    if (action) {
      this.onState?.('working');
      const result = await this.actions.execute(action.id);
      this.onState?.('idle');
      return { ok: result.ok, text: result.message, action: action.id };
    }

    this.onState?.('thinking');
    this.conversation?.add?.('user', clean);
    const context = this.conversation?.context?.() ?? '';
    const prompt = context ? `Recent conversation:\n${context}` : clean;
    try {
      const response = await this.complete?.(prompt);
      const answer = String(response ?? '').trim();
      if (!answer) throw new Error('No assistant response.');
      this.conversation?.add?.('assistant', answer);
      this.onState?.('speaking');
      return { ok: true, text: answer };
    } catch {
      this.onState?.('idle');
      return { ok: false, text: 'I’m here, but my AI brain is unavailable right now.' };
    } finally {
      this.onState?.('idle');
    }
  }
}
