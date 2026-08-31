import type { EventBus } from './EventBus.js';
import { ProactiveEngine, type ProactiveSignal } from './ProactiveEngine.js';

export type ProactiveSignalSource = () => ProactiveSignal | undefined;

export class ProactiveScheduler {
  private timer: ReturnType<typeof setInterval> | undefined;
  private readonly engine: ProactiveEngine;

  constructor(
    private readonly events: EventBus,
    engine = new ProactiveEngine(),
    private readonly source?: ProactiveSignalSource,
  ) {
    this.engine = engine;
  }

  start(intervalMs = 10_000): void {
    if (!Number.isFinite(intervalMs) || intervalMs <= 0) {
      throw new RangeError('intervalMs must be a positive finite number');
    }
    this.stop();
    this.timer = setInterval(() => {
      const signal = this.source?.();
      if (signal) this.emit(signal);
    }, intervalMs);
  }

  stop(): void {
    if (this.timer !== undefined) clearInterval(this.timer);
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
