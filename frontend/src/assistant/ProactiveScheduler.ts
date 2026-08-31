import type { EventBus } from './EventBus.js';
import { ProactiveEngine, type ProactiveSignal } from './ProactiveEngine.js';

export class ProactiveScheduler {
  private timer: ReturnType<typeof setInterval> | undefined;
  private readonly engine: ProactiveEngine;

  constructor(private readonly events: EventBus, engine = new ProactiveEngine()) {
    this.engine = engine;
  }

  start(intervalMs = 10_000): void {
    this.stop();
    this.timer = setInterval(() => undefined, intervalMs);
  }

  stop(): void {
    if (this.timer) clearInterval(this.timer);
    this.timer = undefined;
  }

  emit(signal: ProactiveSignal): boolean {
    if (!this.engine.evaluate(signal)) return false;
    this.events.emit({
      type: 'assistant.response',
      payload: { text: signal.message, source: 'assistant' },
    });
    return true;
  }
}
