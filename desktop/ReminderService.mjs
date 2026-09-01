import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const MAX_DELAY_MS = 31_536_000_000;

export class ReminderService {
  #file;
  #notify;
  #timers = new Map();
  #items = new Map();

  constructor(file, notify) {
    this.#file = file;
    this.#notify = notify;
    this.#load();
    this.#scheduleAll();
  }

  list() {
    return [...this.#items.values()].sort((a, b) => a.atMs - b.atMs).map((item) => ({ ...item }));
  }

  add(text, atMs) {
    const clean = String(text ?? '').trim().slice(0, 500);
    if (!clean || !Number.isFinite(atMs)) throw new Error('Reminder text and time are required.');
    const safeAt = Math.round(atMs);
    if (safeAt <= Date.now()) throw new Error('Reminder time must be in the future.');
    if (safeAt - Date.now() > MAX_DELAY_MS) throw new Error('Reminder is too far in the future.');
    const id = `reminder-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const item = { id, text: clean, atMs: safeAt, createdAtMs: Date.now() };
    this.#items.set(id, item);
    this.#persist();
    this.#schedule(item);
    return { ...item };
  }

  remove(id) {
    const key = String(id ?? '');
    const timer = this.#timers.get(key);
    if (timer) clearTimeout(timer);
    this.#timers.delete(key);
    const removed = this.#items.delete(key);
    if (removed) this.#persist();
    return removed;
  }

  clear() {
    for (const timer of this.#timers.values()) clearTimeout(timer);
    this.#timers.clear();
    this.#items.clear();
    this.#persist();
  }

  dispose() {
    for (const timer of this.#timers.values()) clearTimeout(timer);
    this.#timers.clear();
  }

  #scheduleAll() {
    for (const item of this.#items.values()) {
      if (item.atMs > Date.now()) this.#schedule(item);
      else this.remove(item.id);
    }
  }

  #schedule(item) {
    if (this.#timers.has(item.id)) clearTimeout(this.#timers.get(item.id));
    const delay = Math.max(0, Math.min(item.atMs - Date.now(), MAX_DELAY_MS));
    const timer = setTimeout(() => {
      this.#timers.delete(item.id);
      if (!this.#items.has(item.id)) return;
      this.#items.delete(item.id);
      this.#persist();
      try { this.#notify(item); } catch { /* notification failures never crash SAGE */ }
    }, delay);
    this.#timers.set(item.id, timer);
  }

  #load() {
    try {
      if (!existsSync(this.#file)) return;
      const parsed = JSON.parse(readFileSync(this.#file, 'utf8'));
      if (!Array.isArray(parsed)) return;
      for (const item of parsed) {
        if (item && typeof item.id === 'string' && typeof item.text === 'string' && Number.isFinite(item.atMs) && item.atMs > Date.now()) this.#items.set(item.id, { id: item.id, text: item.text.slice(0, 500), atMs: Math.round(item.atMs), createdAtMs: Number.isFinite(item.createdAtMs) ? Math.round(item.createdAtMs) : Date.now() });
      }
    } catch { /* corrupt reminder data is ignored so startup remains safe */ }
  }

  #persist() {
    try {
      mkdirSync(path.dirname(this.#file), { recursive: true });
      const temp = `${this.#file}.tmp`;
      writeFileSync(temp, JSON.stringify(this.list(), null, 2), 'utf8');
      renameSync(temp, this.#file);
    } catch { /* best effort persistence */ }
  }
}

export function parseRelativeReminder(command, nowMs = Date.now()) {
  const text = String(command ?? '').trim();
  const match = text.match(/^remind me in\s+(\d+)\s*(seconds?|minutes?|hours?|days?)\s*(?:to|about|-)\s*(.+)$/i);
  if (!match) return undefined;
  const amount = Number(match[1]);
  const unit = match[2].toLowerCase();
  const reminderText = match[3].trim();
  const multipliers = { second: 1000, seconds: 1000, minute: 60_000, minutes: 60_000, hour: 3_600_000, hours: 3_600_000, day: 86_400_000, days: 86_400_000 };
  if (!Number.isFinite(amount) || amount <= 0 || !reminderText || !multipliers[unit]) return undefined;
  return { text: reminderText, atMs: nowMs + amount * multipliers[unit] };
}
