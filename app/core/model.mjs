const DEFAULT_MODEL = process.env.SAGE_OLLAMA_MODEL || 'llama3.2:3b';

export class ModelAdapter {
  constructor({ policy }) {
    this.policy = policy;
    this.provider = process.env.SAGE_MODEL_PROVIDER || 'ollama';
    this.ollamaUrl = process.env.SAGE_OLLAMA_URL || 'http://127.0.0.1:11434/api/chat';
    this.model = DEFAULT_MODEL;
  }

  async chat(messages) {
    if (this.provider === 'openai') return this.#openAI(messages);
    return this.#ollama(messages);
  }

  async #ollama(messages) {
    const response = await fetch(this.ollamaUrl, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ model: this.model, messages, stream: false, options: { temperature: 0.7 } })
    });
    if (!response.ok) throw new Error(`Local model unavailable (${response.status})`);
    const data = await response.json();
    return String(data?.message?.content || '').trim();
  }

  async #openAI(messages) {
    if (!this.policy.networkAllowed) throw new Error('Online access is disabled.');
    const key = process.env.OPENAI_API_KEY;
    if (!key) throw new Error('OPENAI_API_KEY is not configured.');
    const response = await fetch(process.env.SAGE_OPENAI_URL || 'https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { authorization: `Bearer ${key}`, 'content-type': 'application/json' },
      body: JSON.stringify({ model: process.env.SAGE_OPENAI_MODEL || 'gpt-5-mini', messages, temperature: 0.7 })
    });
    if (!response.ok) throw new Error(`Online model unavailable (${response.status})`);
    const data = await response.json();
    return String(data?.choices?.[0]?.message?.content || '').trim();
  }
}
