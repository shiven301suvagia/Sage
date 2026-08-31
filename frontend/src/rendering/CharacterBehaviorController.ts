import type { CharacterRuntime } from './CharacterRuntime.js';

export type CharacterMood = 'calm' | 'happy' | 'curious' | 'focused' | 'sleepy';
export type CharacterReaction = 'greet' | 'listen' | 'celebrate' | 'think' | 'focus' | 'rest';

export interface CharacterBehaviorState {
  readonly mood: CharacterMood;
  readonly reaction: CharacterReaction;
  readonly expiresAtMs: number;
}

export class CharacterBehaviorController {
  private state: CharacterBehaviorState = {
    mood: 'calm', reaction: 'rest', expiresAtMs: 0,
  };

  constructor(private readonly runtime: CharacterRuntime) {}

  react(reaction: CharacterReaction, nowMs: number, durationMs = 1800): void {
    const mood: CharacterMood = reaction === 'celebrate' || reaction === 'greet' ? 'happy'
      : reaction === 'think' || reaction === 'listen' ? 'curious'
      : reaction === 'focus' ? 'focused' : 'sleepy';
    this.state = { mood, reaction, expiresAtMs: nowMs + Math.max(0, durationMs) };
    this.runtime.wake(nowMs);
  }

  update(nowMs: number): CharacterBehaviorState {
    if (nowMs >= this.state.expiresAtMs && this.runtime.currentState !== 'Sleeping') {
      this.state = { mood: 'sleepy', reaction: 'rest', expiresAtMs: nowMs };
      this.runtime.sleep(nowMs);
    }
    return this.state;
  }

  get current(): CharacterBehaviorState { return this.state; }
}
