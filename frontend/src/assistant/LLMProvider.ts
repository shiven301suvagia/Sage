export interface LLMMessage {
  readonly role: 'system' | 'user' | 'assistant';
  readonly content: string;
}

export interface LLMProvider {
  readonly name: string;
  isAvailable(): boolean | Promise<boolean>;
  complete(messages: readonly LLMMessage[]): Promise<string>;
}

const fetchJson = async (url: string, init: RequestInit, timeoutMs = 20_000): Promise<any> => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...init, signal: controller.signal });
    const text = await response.text();
    let payload: any;
    try { payload = text ? JSON.parse(text) : undefined; } catch { payload = undefined; }
    if (!response.ok) throw new Error(typeof payload?.error === 'string' ? payload.error : `HTTP ${response.status}`);
    return payload;
  } finally {
    clearTimeout(timeout);
  }
};

export class OllamaProvider implements LLMProvider {
  readonly name = 'ollama';
  constructor(
    private readonly baseUrl = process.env.SAGE_OLLAMA_URL ?? 'http://127.0.0.1:11434',
    private readonly model = process.env.SAGE_LOCAL_MODEL ?? 'llama3.2',
  ) {}

  async isAvailable(): Promise<boolean> {
    try {
      await fetch(`${this.baseUrl}/api/tags`, { signal: AbortSignal.timeout(1500) });
      return true;
    } catch {
      return false;
    }
  }

  async complete(messages: readonly LLMMessage[]): Promise<string> {
    const payload = await fetchJson(`${this.baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ model: this.model, messages, stream: false, options: { temperature: 0.7 } }),
    });
    const content = payload?.message?.content;
    if (typeof content !== 'string' || !content.trim()) throw new Error('Local model returned no text.');
    return content.trim();
  }
}

export class OpenAICompatibleProvider implements LLMProvider {
  readonly name = 'online';
  private readonly apiKey = process.env.SAGE_OPENAI_API_KEY;
  private readonly model = process.env.SAGE_OPENAI_MODEL ?? 'gpt-4o-mini';
  private readonly baseUrl = (process.env.SAGE_OPENAI_BASE_URL ?? 'https://api.openai.com/v1').replace(/\/$/, '');

  isAvailable(): boolean {
    return typeof this.apiKey === 'string' && this.apiKey.length > 0;
  }

  async complete(messages: readonly LLMMessage[]): Promise<string> {
    if (!this.apiKey) throw new Error('Online model is not configured.');
    const payload = await fetchJson(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${this.apiKey}` },
      body: JSON.stringify({ model: this.model, messages, temperature: 0.7 }),
    });
    const content = payload?.choices?.[0]?.message?.content;
    if (typeof content !== 'string' || !content.trim()) throw new Error('Online model returned no text.');
    return content.trim();
  }
}
