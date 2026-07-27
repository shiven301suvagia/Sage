import type { RenderAnimationName } from './types.js';

export interface RenderAnimationDefinition {
  readonly name: RenderAnimationName;
  readonly durationMs: number;
  readonly easing: 'linear' | 'easeIn' | 'easeOut' | 'easeInOut';
  readonly loops: boolean;
}

export const renderAnimations: Readonly<Record<RenderAnimationName, RenderAnimationDefinition>> = {
  Idle: { name: 'Idle', durationMs: 3200, easing: 'easeInOut', loops: true },
  FadeIn: { name: 'FadeIn', durationMs: 260, easing: 'easeOut', loops: false },
  FadeOut: { name: 'FadeOut', durationMs: 220, easing: 'easeIn', loops: false },
  Wake: { name: 'Wake', durationMs: 520, easing: 'easeOut', loops: false },
  Sleep: { name: 'Sleep', durationMs: 360, easing: 'easeIn', loops: false },
  Hover: { name: 'Hover', durationMs: 900, easing: 'easeInOut', loops: true },
};

export class RenderAnimationSystem {
  private activeAnimation: RenderAnimationName = 'Idle';
  private startedAtMs = 0;

  play(animation: RenderAnimationName, nowMs = 0): void {
    this.activeAnimation = animation;
    this.startedAtMs = nowMs;
  }

  get current(): RenderAnimationName {
    return this.activeAnimation;
  }

  progress(nowMs: number): number {
    const definition = renderAnimations[this.activeAnimation];
    const elapsed = Math.max(0, nowMs - this.startedAtMs);
    const raw = definition.loops ? (elapsed % definition.durationMs) / definition.durationMs : Math.min(1, elapsed / definition.durationMs);
    return this.applyEasing(raw, definition.easing);
  }

  private applyEasing(progress: number, easing: RenderAnimationDefinition['easing']): number {
    if (easing === 'linear') return progress;
    if (easing === 'easeIn') return progress * progress;
    if (easing === 'easeOut') return 1 - (1 - progress) * (1 - progress);
    return progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2;
  }
}
