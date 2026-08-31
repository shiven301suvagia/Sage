export type CompanionState = 'dormant' | 'waking' | 'present' | 'sleeping';

export interface CompanionSnapshot {
  readonly state: CompanionState;
  readonly attention: number;
  readonly lastInteractionAt: number | null;
}

const clamp = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, value));

export class CompanionPresence {
  private snapshot: CompanionSnapshot = { state: 'dormant', attention: 0, lastInteractionAt: null };

  get(): CompanionSnapshot { return { ...this.snapshot }; }

  interact(now = Date.now()): CompanionSnapshot {
    if (!Number.isFinite(now)) throw new RangeError('Invalid interaction time');
    this.snapshot = { state: 'present', attention: 1, lastInteractionAt: now };
    return this.get();
  }

  wake(): CompanionSnapshot {
    this.snapshot = { ...this.snapshot, state: 'waking' };
    return this.get();
  }

  finishWake(): CompanionSnapshot {
    this.snapshot = { ...this.snapshot, state: 'present', attention: Math.max(this.snapshot.attention, 0.7) };
    return this.get();
  }

  tick(deltaMs: number): CompanionSnapshot {
    if (!Number.isFinite(deltaMs) || deltaMs < 0) throw new RangeError('Invalid delta');
    const decay = Math.min(0.35, deltaMs / 30000);
    const attention = clamp(this.snapshot.attention - decay, 0, 1);
    this.snapshot = { ...this.snapshot, attention, state: attention === 0 ? 'sleeping' : this.snapshot.state };
    return this.get();
  }

  sleep(): CompanionSnapshot {
    this.snapshot = { ...this.snapshot, state: 'sleeping', attention: 0 };
    return this.get();
  }

  hide(): CompanionSnapshot {
    this.snapshot = { ...this.snapshot, state: 'dormant', attention: 0 };
    return this.get();
  }
}
