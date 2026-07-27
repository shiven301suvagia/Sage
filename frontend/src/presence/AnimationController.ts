import type { AnimationPort, AnimationSequence } from './types.js';

export interface AnimationStep {
  name: string;
  durationMs: number;
}

export const awakeningSequence: readonly AnimationStep[] = [
  { name: 'Fade in', durationMs: 160 },
  { name: 'Glow', durationMs: 140 },
  { name: 'Materialize', durationMs: 180 },
  { name: 'Stretch placeholder', durationMs: 120 },
  { name: 'Blink placeholder', durationMs: 80 },
];

export const sleepingSequence: readonly AnimationStep[] = [
  { name: 'Smile', durationMs: 100 },
  { name: 'Close eyes', durationMs: 120 },
  { name: 'Fade out', durationMs: 180 },
];

export class AnimationController implements AnimationPort {
  private idleActive = false;

  async play(sequence: AnimationSequence): Promise<void> {
    const steps = sequence === 'Awakening' ? awakeningSequence : sleepingSequence;
    for (const step of steps) {
      await this.wait(step.durationMs);
    }
  }

  startIdle(): void {
    this.idleActive = true;
  }

  stopIdle(): void {
    this.idleActive = false;
  }

  get isIdleActive(): boolean {
    return this.idleActive;
  }

  private async wait(milliseconds: number): Promise<void> {
    await new Promise<void>((resolve) => {
      globalThis.setTimeout(resolve, milliseconds);
    });
  }
}
