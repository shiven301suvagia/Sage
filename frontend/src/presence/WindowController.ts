import type { WindowPort } from './types.js';

export class WindowController implements WindowPort {
  private visible = false;
  private characterRendered = false;

  show(): void {
    this.visible = true;
  }

  hide(): void {
    this.visible = false;
  }

  renderCharacter(): void {
    this.characterRendered = true;
  }

  clearCharacter(): void {
    this.characterRendered = false;
  }

  get isVisible(): boolean {
    return this.visible;
  }

  get hasCharacter(): boolean {
    return this.characterRendered;
  }
}
