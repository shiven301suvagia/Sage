import { EventBus } from './EventBus.js';
import type { PresenceState } from './types.js';

export type TransitionMap = Readonly<Record<PresenceState, readonly PresenceState[]>>;

export const defaultTransitionMap: TransitionMap = {
  Dormant: ['Awakening'],
  Awakening: ['Idle'],
  Idle: ['Sleeping', 'Listening', 'Thinking', 'Working', 'Reminder', 'Gaming'],
  Listening: ['Idle', 'Thinking', 'Sleeping'],
  Thinking: ['Idle', 'Speaking', 'Working', 'Sleeping'],
  Speaking: ['Idle', 'Listening', 'Sleeping'],
  Working: ['Idle', 'Thinking', 'Sleeping'],
  Reminder: ['Idle', 'Sleeping'],
  Gaming: ['Idle', 'Sleeping'],
  Sleeping: ['Dormant'],
};

export class StateMachine {
  private currentState: PresenceState;

  constructor(
    private readonly eventBus: EventBus,
    private readonly transitions: TransitionMap = defaultTransitionMap,
    initialState: PresenceState = 'Dormant',
  ) {
    this.currentState = initialState;
  }

  get state(): PresenceState {
    return this.currentState;
  }

  canTransitionTo(target: PresenceState): boolean {
    return this.currentState === target || this.transitions[this.currentState].includes(target);
  }

  transitionTo(target: PresenceState, reason: string): void {
    if (this.currentState === target) {
      return;
    }

    if (!this.canTransitionTo(target)) {
      throw new Error(`Invalid presence transition from ${this.currentState} to ${target}`);
    }

    const from = this.currentState;
    this.currentState = target;
    this.eventBus.publish({ type: 'StateChanged', from, to: target, reason });
  }
}
