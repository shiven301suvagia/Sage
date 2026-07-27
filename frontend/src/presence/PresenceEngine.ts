import { EventBus } from './EventBus.js';
import { StateMachine } from './StateMachine.js';
import type { ActivationSource, AnimationPort, Scheduler, SleepReason, TimerHandle, WindowPort } from './types.js';

export interface PresenceEngineOptions {
  inactivityTimeoutMs: number;
}

export class PresenceEngine {
  private inactivityTimer: TimerHandle | undefined;

  constructor(
    private readonly eventBus: EventBus,
    private readonly stateMachine: StateMachine,
    private readonly windowController: WindowPort,
    private readonly animationController: AnimationPort,
    private readonly scheduler: Scheduler,
    private readonly options: PresenceEngineOptions = { inactivityTimeoutMs: 90_000 },
  ) {
    this.bindEvents();
  }

  launch(): void {
    this.enterDormant();
  }

  requestWake(source: ActivationSource): void {
    this.eventBus.publish({ type: 'WakeRequested', source });
  }

  requestSleep(reason: SleepReason): void {
    this.eventBus.publish({ type: 'SleepRequested', reason });
  }

  private bindEvents(): void {
    this.eventBus.subscribe('WakeRequested', (event) => {
      void this.awaken(event.source);
    });
    this.eventBus.subscribe('SleepRequested', (event) => {
      void this.sleep(event.reason);
    });
    this.eventBus.subscribe('ReminderTriggered', () => {
      this.stateMachine.transitionTo('Reminder', 'Reminder triggered');
    });
    this.eventBus.subscribe('GameStarted', () => {
      this.stateMachine.transitionTo('Gaming', 'Game started');
    });
    this.eventBus.subscribe('GameEnded', () => {
      this.stateMachine.transitionTo('Idle', 'Game ended');
      this.scheduleInactivitySleep();
    });
  }

  private async awaken(source: ActivationSource): Promise<void> {
    if (this.stateMachine.state !== 'Dormant') {
      return;
    }

    this.stateMachine.transitionTo('Awakening', `Wake requested by ${source}`);
    this.windowController.show();
    this.windowController.renderCharacter();
    await this.animationController.play('Awakening');
    this.stateMachine.transitionTo('Idle', 'Awakening sequence completed');
    this.animationController.startIdle();
    this.scheduleInactivitySleep();
  }

  private async sleep(reason: SleepReason): Promise<void> {
    if (this.stateMachine.state === 'Dormant' || this.stateMachine.state === 'Sleeping') {
      return;
    }

    this.clearInactivityTimer();
    this.animationController.stopIdle();
    this.stateMachine.transitionTo('Sleeping', `Sleep requested: ${reason}`);
    await this.animationController.play('Sleeping');
    this.windowController.clearCharacter();
    this.windowController.hide();
    this.stateMachine.transitionTo('Dormant', 'Sleeping sequence completed');
  }

  private enterDormant(): void {
    this.clearInactivityTimer();
    this.animationController.stopIdle();
    this.windowController.clearCharacter();
    this.windowController.hide();
  }

  private scheduleInactivitySleep(): void {
    this.clearInactivityTimer();
    this.inactivityTimer = this.scheduler.delay(this.options.inactivityTimeoutMs, () => {
      this.requestSleep('Inactivity');
    });
  }

  private clearInactivityTimer(): void {
    this.inactivityTimer?.cancel();
    this.inactivityTimer = undefined;
  }
}
