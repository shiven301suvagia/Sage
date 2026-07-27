import type { ActivationSource } from './types.js';

export interface KeyboardEventLike {
  readonly code: string;
  readonly ctrlKey: boolean;
  readonly shiftKey: boolean;
  readonly altKey: boolean;
  readonly metaKey: boolean;
  preventDefault(): void;
}

export interface KeyboardSource {
  addEventListener(type: 'keydown', listener: (event: KeyboardEventLike) => void): void;
  removeEventListener(type: 'keydown', listener: (event: KeyboardEventLike) => void): void;
}

export interface TraySource {
  onActivate(listener: () => void): void;
}

export interface ActivationTarget {
  requestWake(source: ActivationSource): void;
}

export class ActivationController {
  private readonly keydownListener = (event: KeyboardEventLike): void => {
    if (this.isWakeHotkey(event)) {
      event.preventDefault();
      this.target.requestWake('Hotkey');
    }
  };

  constructor(
    private readonly target: ActivationTarget,
    private readonly keyboardSource?: KeyboardSource,
    private readonly traySource?: TraySource,
  ) {}

  start(): void {
    this.keyboardSource?.addEventListener('keydown', this.keydownListener);
    this.traySource?.onActivate(() => {
      this.target.requestWake('SystemTray');
    });
  }

  stop(): void {
    this.keyboardSource?.removeEventListener('keydown', this.keydownListener);
  }

  private isWakeHotkey(event: KeyboardEventLike): boolean {
    return event.ctrlKey && event.shiftKey && !event.altKey && !event.metaKey && event.code === 'Space';
  }
}
