export const presenceStates = [
  'Dormant',
  'Awakening',
  'Idle',
  'Listening',
  'Thinking',
  'Speaking',
  'Working',
  'Reminder',
  'Gaming',
  'Sleeping',
] as const;

export type PresenceState = (typeof presenceStates)[number];

export type PresenceEvent =
  | { type: 'WakeRequested'; source: ActivationSource }
  | { type: 'SleepRequested'; reason: SleepReason }
  | { type: 'ReminderTriggered'; reminderId: string }
  | { type: 'GameStarted'; gameId?: string }
  | { type: 'GameEnded'; gameId?: string }
  | { type: 'StateTransitionRequested'; target: PresenceState; reason: string }
  | { type: 'StateChanged'; from: PresenceState; to: PresenceState; reason: string };

export type ActivationSource =
  | 'Hotkey'
  | 'SystemTray'
  | 'WakeWord'
  | 'DesktopShortcut'
  | 'Api';

export type SleepReason = 'Inactivity' | 'UserRequested' | 'SystemRequested';

export type EventHandler<TEvent extends PresenceEvent = PresenceEvent> = (event: TEvent) => void;

export interface Subscription {
  unsubscribe(): void;
}

export interface TimerHandle {
  cancel(): void;
}

export interface Scheduler {
  delay(milliseconds: number, callback: () => void): TimerHandle;
}

export interface WindowPort {
  show(): void;
  hide(): void;
  renderCharacter(): void;
  clearCharacter(): void;
}

export interface AnimationPort {
  play(sequence: AnimationSequence): Promise<void>;
  startIdle(): void;
  stopIdle(): void;
}

export type AnimationSequence = 'Awakening' | 'Sleeping';
