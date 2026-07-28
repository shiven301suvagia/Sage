import type { CharacterFrame, CharacterRuntimeState, CursorPoint } from './types.js';

export interface CharacterRuntimeOptions {
  readonly seed?: number;
  readonly reducedMotion?: boolean;
}

interface TimedEvent {
  readonly startsAtMs: number;
  readonly durationMs: number;
}

const clamp = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, value));
const lerp = (from: number, to: number, amount: number): number => from + (to - from) * amount;
const smooth = (progress: number): number => progress * progress * (3 - 2 * progress);

export class CharacterRuntime {
  private state: CharacterRuntimeState = 'Dormant';
  private stateStartedAtMs = 0;
  private randomState: number;
  private nextBlinkAtMs = 0;
  private blink: TimedEvent | undefined;
  private nextHeadDriftAtMs = 0;
  private headDrift: TimedEvent | undefined;
  private headDriftTarget = { x: 0, y: 0 };
  private cursorTarget: CursorPoint = { x: 0.5, y: 0.5 };
  private smoothedCursor: CursorPoint = { x: 0.5, y: 0.5 };

  constructor(private readonly options: CharacterRuntimeOptions = {}) {
    this.randomState = options.seed ?? 0x5a9e_004;
    this.scheduleBlink(0);
    this.scheduleHeadDrift(0);
  }

  wake(nowMs: number): void {
    this.transitionTo('Waking', nowMs);
  }

  sleep(nowMs: number): void {
    this.transitionTo('Sleeping', nowMs);
  }

  idle(nowMs: number): void {
    this.transitionTo('Idle', nowMs);
  }

  dormant(nowMs: number): void {
    this.transitionTo('Dormant', nowMs);
  }

  updateCursor(point: CursorPoint): void {
    this.cursorTarget = {
      x: clamp(point.x, 0, 1),
      y: clamp(point.y, 0, 1),
    };
  }

  frame(nowMs: number): CharacterFrame {
    this.advanceTimers(nowMs);
    const stateElapsed = Math.max(0, nowMs - this.stateStartedAtMs);
    const wake = this.state === 'Waking' ? smooth(clamp(stateElapsed / 700, 0, 1)) : this.state === 'Dormant' ? 0 : 1;
    const sleep = this.state === 'Sleeping' ? smooth(clamp(stateElapsed / 620, 0, 1)) : 0;
    const presence = clamp(wake * (1 - sleep), 0, 1);
    const reduced = this.options.reducedMotion === true;
    const breathPhase = nowMs / 3900;
    const floatPhase = nowMs / 5300 + 0.17;
    const breathing = reduced ? 0 : Math.sin(breathPhase * Math.PI * 2);
    const floating = reduced ? 0 : Math.sin(floatPhase * Math.PI * 2);
    const blinkAmount = this.blinkAmount(nowMs);
    const cursor = this.cursorLayer();
    const drift = this.headDriftLayer(nowMs);
    const stretch = this.state === 'Waking' ? Math.sin(clamp(stateElapsed / 700, 0, 1) * Math.PI) : 0;
    const smile = this.state === 'Waking' ? smooth(clamp((stateElapsed - 420) / 220, 0, 1)) : 0;

    return {
      state: this.state,
      opacity: presence,
      glow: clamp(0.36 + presence * 0.28 + stretch * 0.18, 0, 1),
      scaleX: 1 + stretch * 0.018,
      scaleY: 1 + breathing * 0.012 + stretch * 0.032,
      offsetY: floating * 5 * presence,
      eyeOpen: clamp(1 - blinkAmount - sleep, 0, 1),
      smile: clamp(smile * presence, 0, 1),
      eyeX: cursor.eyeX,
      eyeY: cursor.eyeY,
      headX: clamp(cursor.headX + drift.x, -8, 8),
      headY: clamp(cursor.headY + drift.y, -6, 6),
      layers: [
        { name: 'Idle', weight: presence },
        { name: 'Breathing', weight: reduced ? 0 : presence },
        { name: 'Blink', weight: blinkAmount },
        { name: 'CursorFollow', weight: presence },
        { name: this.state, weight: 1 },
      ],
    };
  }

  get currentState(): CharacterRuntimeState {
    return this.state;
  }

  private transitionTo(state: CharacterRuntimeState, nowMs: number): void {
    this.state = state;
    this.stateStartedAtMs = nowMs;
  }

  private cursorLayer(): { eyeX: number; eyeY: number; headX: number; headY: number } {
    this.smoothedCursor = {
      x: lerp(this.smoothedCursor.x, this.cursorTarget.x, 0.12),
      y: lerp(this.smoothedCursor.y, this.cursorTarget.y, 0.12),
    };
    const centeredX = this.smoothedCursor.x - 0.5;
    const centeredY = this.smoothedCursor.y - 0.5;
    return {
      eyeX: clamp(centeredX * 12, -6, 6),
      eyeY: clamp(centeredY * 8, -4, 4),
      headX: clamp(centeredX * 7, -3.5, 3.5),
      headY: clamp(centeredY * 5, -2.5, 2.5),
    };
  }

  private advanceTimers(nowMs: number): void {
    if (!this.blink && nowMs >= this.nextBlinkAtMs) {
      this.blink = { startsAtMs: nowMs, durationMs: 150 + this.random() * 70 };
      this.scheduleBlink(nowMs + this.blink.durationMs);
    }
    if (this.blink && nowMs > this.blink.startsAtMs + this.blink.durationMs) this.blink = undefined;
    if (!this.headDrift && nowMs >= this.nextHeadDriftAtMs) {
      this.headDrift = { startsAtMs: nowMs, durationMs: 900 + this.random() * 700 };
      this.headDriftTarget = { x: (this.random() - 0.5) * 2.4, y: (this.random() - 0.5) * 1.6 };
      this.scheduleHeadDrift(nowMs + this.headDrift.durationMs);
    }
    if (this.headDrift && nowMs > this.headDrift.startsAtMs + this.headDrift.durationMs) this.headDrift = undefined;
  }

  private blinkAmount(nowMs: number): number {
    if (this.state === 'Sleeping') return 1;
    if (!this.blink) return 0;
    const progress = clamp((nowMs - this.blink.startsAtMs) / this.blink.durationMs, 0, 1);
    return Math.sin(progress * Math.PI);
  }

  private headDriftLayer(nowMs: number): { x: number; y: number } {
    if (!this.headDrift || this.options.reducedMotion) return { x: 0, y: 0 };
    const progress = smooth(clamp((nowMs - this.headDrift.startsAtMs) / this.headDrift.durationMs, 0, 1));
    const envelope = Math.sin(progress * Math.PI);
    return { x: this.headDriftTarget.x * envelope, y: this.headDriftTarget.y * envelope };
  }

  private scheduleBlink(afterMs: number): void {
    this.nextBlinkAtMs = afterMs + 2400 + this.random() * 3600;
  }

  private scheduleHeadDrift(afterMs: number): void {
    this.nextHeadDriftAtMs = afterMs + 3600 + this.random() * 5200;
  }

  private random(): number {
    this.randomState = (1664525 * this.randomState + 1013904223) >>> 0;
    return this.randomState / 0x1_0000_0000;
  }
}
