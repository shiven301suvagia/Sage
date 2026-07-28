export type RenderLayerName =
  | 'Rendering'
  | 'Particle'
  | 'FutureCharacter'
  | 'FutureUI'
  | 'FutureNotification';

export type RenderAnimationName = 'Idle' | 'FadeIn' | 'FadeOut' | 'Wake' | 'Sleep' | 'Hover';

export interface RenderSize {
  readonly width: number;
  readonly height: number;
}

export interface RenderPoint {
  readonly x: number;
  readonly y: number;
}

export interface RenderWindowOptions {
  readonly transparent: true;
  readonly frameless: true;
  readonly alwaysOnTop: true;
  readonly resizable: false;
  readonly hasShadow: false;
  readonly skipTaskbar: true;
  readonly titleBarStyle: 'hidden';
  readonly backgroundColor: '#00000000';
}

export interface RenderWindowState {
  readonly visible: boolean;
  readonly opacity: number;
  readonly position: RenderPoint;
  readonly size: RenderSize;
  readonly scale: DpiScale;
  readonly options: RenderWindowOptions;
}

export type DpiScale = 1 | 1.25 | 1.5 | 2;

export interface RenderLayer {
  readonly name: RenderLayerName;
  readonly zIndex: number;
  readonly enabled: boolean;
  readonly reservedForFutureUse: boolean;
}

export interface Particle {
  readonly id: number;
  readonly x: number;
  readonly y: number;
  readonly radius: number;
  readonly opacity: number;
  readonly driftX: number;
  readonly driftY: number;
}

export interface PlaceholderFrame {
  readonly coreRadius: number;
  readonly glowRadius: number;
  readonly glowOpacity: number;
  readonly floatOffsetY: number;
  readonly particleOpacity: number;
}

export type CharacterRuntimeState = 'Dormant' | 'Waking' | 'Idle' | 'Sleeping';

export interface CursorPoint {
  readonly x: number;
  readonly y: number;
}

export interface CharacterMotionLayer {
  readonly name: 'Idle' | 'Breathing' | 'Blink' | 'CursorFollow' | CharacterRuntimeState;
  readonly weight: number;
}

export interface CharacterFrame {
  readonly state: CharacterRuntimeState;
  readonly opacity: number;
  readonly glow: number;
  readonly scaleX: number;
  readonly scaleY: number;
  readonly offsetY: number;
  readonly eyeOpen: number;
  readonly smile: number;
  readonly eyeX: number;
  readonly eyeY: number;
  readonly headX: number;
  readonly headY: number;
  readonly layers: readonly CharacterMotionLayer[];
}
