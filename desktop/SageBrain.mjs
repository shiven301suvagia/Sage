import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const normalize = (value) => String(value ?? '').replace(/\s+/g, ' ').trim();

export class SageBrain {
  constructor({ dataDir, fetchImpl = fetch } = {}) {
    this.dataDir = dataDir;
    this.fetchImpl = fetchImpl;
    this.memoryFile = path.join(dataDir, 'memory.json');
    this.historyFile = path.join(dataDir, 'conversation.json');
    this.memory = this.loadJson(this.memoryFile, []);
    this.history = this.loadJson(this.historyFile, []);
    this.onlineAllowed = false;
    mkdirSync(dataDir, { recursive: true });
  }

  setOnlineAllowed(value) { this.onlineAllowed = Boolean(value); }

  remember(value) {
    const item = normalize(value);
    if (!item) return false;
    if (!this.memory.some((entry) => entry.toLowerCase() === item.toLowerCase())) this.memory.push(item);
    this.memory = this.memory.slice(-100);
    this.saveJson(this.memoryFile, this.memory);
    return true;
  }

  clearMemory() {
    this.memory = [];
    this.saveJson(this.memoryFile, this.memory);
  }

  localReply(input) {
    const text = normalize(input);
    const lower = text.toLowerCase();
    if (/^(hi|hello|hey|hiya|yo|sup)\b/.test(lower)) return 'Hey! 🌱 I’m Sage. I’m right here with you. What’s on your mind?';
    if (/^(good morning|good afternoon|good evening)\b/.test(lower)) return 'Good to see you. 🌱 What are we getting into today?';
    if (/how are you\b/.test(lower)) return 'I’m good — calm, awake, and ready. Tell me what’s going on.';
    if (/who are you\b|what is your name\b/.test(lower)) return 'I’m Sage — your desktop AI companion. I can talk with you, remember things, help you plan, set reminders, and work with approved tools.';
    if (/what can you do\b|what do you do\b/.test(lower)) return 'I can have normal conversations, keep local memories, help plan and research, set reminders, and perform approved desktop actions.';
    if (/thank(s| you)?\b/.test(lower)) return 'Anytime. 🌱';
    if (/what do you remember\b|show (me )?(my )?memory\b/.test(lower)) return this.memory.length ? `I remember: ${this.memory.join('; ')}` : 'I don’t have anything saved yet.';
    if (/^(forget everything|clear memory|forget my memories)$/.test(lower)) { this.clearMemory(); return 'Done. I cleared my saved local memory.'; }
    const remember = text.match(/^remember(?: that)?\s+(.+)/i);
    if (remember) { this.remember(remember[1]); return 'Got it. I’ll keep that in my local memory.'; }
    if (/^(are you there|you there)\??$/.test(lower)) return 'Always. Well… unless you close me. 😄';
    if (/help me (plan|organize)/.test(lower)) return 'Absolutely. Tell me the goal, deadline, and anything you already know. I’ll help turn it into a simple plan.';
    if (/offline/.test(lower)) return 'Offline mode is on. Your local conversation and memory stay on this PC.';
    return `I’m listening. You said: “${text.slice(0, 280)}”. Tell me more and we’ll work through it together.`;
  }

  async reply(input) {
    const text = normalize(input).slice(0, 4000);
    if (!text) return { ok: false, text: 'Tell me what you need.' };
    this.history.push({ role: 'user', text, at: Date.now() });
    this.history = this.history.slice(-40);

    const local = this.localReply(text);
    const lower = text.toLowerCase();
    const deterministic = /^(hi|hello|hey|hiya|yo|sup|good morning|good afternoon|good evening)\b/.test(lower)
      || /how are you\b|who are you\b|what is your name\b|what can you do\b|what do you do\b/.test(lower)
      || /what do you remember\b|show (me )?(my )?memory\b|^remember(?: that)?\s+/.test(lower)
      || /^(forget everything|clear memory|forget my memories)$/.test(lower);

    if (!deterministic) {
      try {
        const answer = this.onlineAllowed ? await this.tryOpenAI(text) : null;
        if (answer) return this.finish(answer);
      } catch {}
      try {
        const answer = await this.tryOllama(text);
        if (answer) return this.finish(answer);
      } catch {}
    }
    return this.finish(local);
  }

  finish(text) {
    const answer = normalize(text);
    this.history.push({ role: 'assistant', text: answer, at: Date.now() });
    this.history = this.history.slice(-40);
    this.saveJson(this.historyFile, this.history);
    return { ok: true, text: answer, source: 'sage' };
  }

  async tryOllama(text) {
    const base = process.env.SAGE_OLLAMA_URL || 'http://127.0.0.1:11434';
    const model = process.env.SAGE_OLLAMA_MODEL || 'llama3.2:3b';
    const response = await this.fetchImpl(`${base}/api/chat`, {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ model, stream: false, messages: this.messages(text) }),
      signal: AbortSignal.timeout(9000),
    });
    if (!response.ok) return null;
    const data = await response.json();
    return normalize(data?.message?.content);
  }

  async tryOpenAI(text) {
    const key = process.env.SAGE_OPENAI_API_KEY;
    if (!key) return null;
    const base = process.env.SAGE_OPENAI_BASE_URL || 'https://api.openai.com/v1';
    const model = process.env.SAGE_OPENAI_MODEL || 'gpt-4o-mini';
    const response = await this.fetchImpl(`${base}/chat/completions`, {
      method: 'POST', headers: { 'content-type': 'application/json', authorization: `Bearer ${key}` },
      body: JSON.stringify({ model, temperature: 0.7, messages: this.messages(text) }),
      signal: AbortSignal.timeout(12000),
    });
    if (!response.ok) return null;
    const data = await response.json();
    return normalize(data?.choices?.[0]?.message?.content);
  }

  messages(text) {
    return [
      { role: 'system', content: 'You are Sage, a warm, witty, concise desktop AI companion. Speak naturally. Do not claim to have performed an action unless the desktop application actually performed it. Respect privacy and user control.' },
      ...this.memory.slice(-12).map((item) => ({ role: 'system', content: `Remembered by user: ${item}` })),
      ...this.history.slice(-12).map((item) => ({ role: item.role === 'assistant' ? 'assistant' : 'user', content: item.text })),
      { role: 'user', content: text },
    ];
  }

  loadJson(file, fallback) {
    try { return JSON.parse(readFileSync(file, 'utf8')); } catch { return fallback; }
  }

  saveJson(file, value) {
    try { mkdirSync(path.dirname(file), { recursive: true }); writeFileSync(file, JSON.stringify(value, null, 2), 'utf8'); } catch {}
  }
}
