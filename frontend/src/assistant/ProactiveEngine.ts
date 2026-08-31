export type ProactiveReason = 'reminder' | 'idle' | 'milestone' | 'system';

export interface ProactiveSignal {
  readonly reason: ProactiveReason;
  readonly timestampMs: number;
  readonly message: string;
  readonly priority: number;
}

export interface ProactiveEngineOptions {
  readonly cooldownMs?: number;
  readonly minimumPriority?: number;
}

export class ProactiveEngine {
  private readonly cooldownMs: number;
  private readonly minimumPriority: number;
  private lastEmittedAtMs = Number.NEGATIVE_INFINITY;

  constructor(options: ProactiveEngineOptions = {}) {
    this.cooldownMs = options.cooldownMs ?? 30_000;
    this.minimumPriority = options.minimumPriority ?? 0;
  }

  evaluate(signal: ProactiveSignal): boolean {
    if (signal.priority < this.minimumPriority) return false;
    if (signal.timestampMs - this.lastEmittedAtMs < this.cooldownMs) return false;
    this.lastEmittedAtMs = signal.timestampMs;
    return true;
  }

  reset(): void {
    this.lastEmittedAtMs = Number.NEGATIVE_INFINITY;
  }
}
