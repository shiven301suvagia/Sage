import { RenderingEngine } from '../rendering/index.js';
import type { CharacterFrame, CursorPoint, DpiScale, RenderPoint, RenderWindowState } from '../rendering/index.js';
import type { WindowPort } from './types.js';

export class WindowController implements WindowPort {
  private visible = false;
  private characterRendered = false;

  constructor(private readonly renderer: RenderingEngine = new RenderingEngine()) {}

  show(): void {
    this.visible = true;
    this.renderer.show();
  }

  hide(): void {
    this.visible = false;
    this.renderer.hide();
  }

  renderCharacter(): void {
    this.characterRendered = true;
    this.renderer.wake();
  }

  clearCharacter(): void {
    this.characterRendered = false;
    this.renderer.sleep();
  }

  moveTo(position: RenderPoint): void {
    this.renderer.setPosition(position);
  }

  setDpiScale(scale: DpiScale): void {
    this.renderer.setScale(scale);
  }

  updateCursor(point: CursorPoint): void {
    this.renderer.updateCursor(point);
  }

  characterFrame(nowMs: number): CharacterFrame {
    return this.renderer.characterFrame(nowMs);
  }

  get renderState(): RenderWindowState {
    return this.renderer.windowState();
  }

  get isVisible(): boolean {
    return this.visible;
  }

  get hasCharacter(): boolean {
    return this.characterRendered;
  }
}
