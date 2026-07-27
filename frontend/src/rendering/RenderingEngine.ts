import { RenderAnimationSystem } from './AnimationSystem.js';
import type { DpiScale, Particle, PlaceholderFrame, RenderLayer, RenderPoint, RenderSize, RenderWindowState } from './types.js';

export const renderLayers: readonly RenderLayer[] = [
  { name: 'Rendering', zIndex: 10, enabled: true, reservedForFutureUse: false },
  { name: 'Particle', zIndex: 20, enabled: true, reservedForFutureUse: false },
  { name: 'FutureCharacter', zIndex: 30, enabled: false, reservedForFutureUse: true },
  { name: 'FutureUI', zIndex: 40, enabled: false, reservedForFutureUse: true },
  { name: 'FutureNotification', zIndex: 50, enabled: false, reservedForFutureUse: true },
];

const supportedScales: readonly DpiScale[] = [1, 1.25, 1.5, 2];

export class RenderingEngine {
  private readonly animationSystem = new RenderAnimationSystem();
  private visible = false;
  private position: RenderPoint = { x: 120, y: 120 };
  private scale: DpiScale = 1;
  private readonly baseSize: RenderSize = { width: 320, height: 320 };
  private readonly particles: readonly Particle[] = this.createParticles();

  show(nowMs = 0): void {
    this.visible = true;
    this.animationSystem.play('FadeIn', nowMs);
  }

  hide(nowMs = 0): void {
    this.animationSystem.play('FadeOut', nowMs);
    this.visible = false;
  }

  wake(nowMs = 0): void {
    this.visible = true;
    this.animationSystem.play('Wake', nowMs);
  }

  sleep(nowMs = 0): void {
    this.animationSystem.play('Sleep', nowMs);
  }

  idle(nowMs = 0): void {
    this.animationSystem.play('Idle', nowMs);
  }

  hover(nowMs = 0): void {
    this.animationSystem.play('Hover', nowMs);
  }

  setPosition(position: RenderPoint): void {
    this.position = position;
  }

  setScale(scale: number): void {
    const nearest = supportedScales.reduce((current, candidate) =>
      Math.abs(candidate - scale) < Math.abs(current - scale) ? candidate : current,
    );
    this.scale = nearest;
  }

  windowState(nowMs = 0): RenderWindowState {
    return {
      visible: this.visible,
      opacity: this.opacityAt(nowMs),
      position: this.position,
      size: { width: this.baseSize.width * this.scale, height: this.baseSize.height * this.scale },
      scale: this.scale,
      options: {
        transparent: true,
        frameless: true,
        alwaysOnTop: true,
        resizable: false,
        hasShadow: false,
        skipTaskbar: true,
        titleBarStyle: 'hidden',
        backgroundColor: '#00000000',
      },
    };
  }

  layerStack(): readonly RenderLayer[] {
    return renderLayers;
  }

  particlesFrame(): readonly Particle[] {
    return this.visible ? this.particles : [];
  }

  placeholderFrame(nowMs: number): PlaceholderFrame {
    const progress = this.animationSystem.progress(nowMs);
    const pulse = 0.5 + Math.sin(progress * Math.PI * 2) * 0.5;
    return {
      coreRadius: 42 * this.scale,
      glowRadius: (92 + pulse * 10) * this.scale,
      glowOpacity: 0.38 + pulse * 0.18,
      floatOffsetY: Math.sin(progress * Math.PI * 2) * 7 * this.scale,
      particleOpacity: this.visible ? 0.34 : 0,
    };
  }

  opacityAt(nowMs: number): number {
    const progress = this.animationSystem.progress(nowMs);
    if (this.animationSystem.current === 'FadeIn' || this.animationSystem.current === 'Wake') {
      return progress;
    }
    if (this.animationSystem.current === 'FadeOut' || this.animationSystem.current === 'Sleep') {
      return 1 - progress;
    }
    return this.visible ? 1 : 0;
  }

  private createParticles(): readonly Particle[] {
    return Array.from({ length: 18 }, (_, index) => ({
      id: index,
      x: (index * 47) % this.baseSize.width,
      y: (index * 83) % this.baseSize.height,
      radius: 1 + (index % 3) * 0.45,
      opacity: 0.18 + (index % 4) * 0.04,
      driftX: ((index % 5) - 2) * 0.018,
      driftY: -0.018 - (index % 3) * 0.01,
    }));
  }
}
