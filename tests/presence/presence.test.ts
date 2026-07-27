import assert from 'node:assert/strict';
import test from 'node:test';
import { ActivationController, EventBus, PresenceEngine, StateMachine, WindowController } from '../../frontend/src/presence/index.js';
import type { AnimationPort, AnimationSequence, KeyboardEventLike, Scheduler, TimerHandle } from '../../frontend/src/presence/index.js';

class InstantAnimation implements AnimationPort {
  readonly played: AnimationSequence[] = [];
  idleActive = false;

  async play(sequence: AnimationSequence): Promise<void> {
    this.played.push(sequence);
  }

  startIdle(): void {
    this.idleActive = true;
  }

  stopIdle(): void {
    this.idleActive = false;
  }
}

class ManualScheduler implements Scheduler {
  private callback: (() => void) | undefined;

  delay(_milliseconds: number, callback: () => void): TimerHandle {
    this.callback = callback;
    return {
      cancel: () => {
        this.callback = undefined;
      },
    };
  }

  fire(): void {
    this.callback?.();
  }
}

class KeyboardSpy {
  listener: ((event: KeyboardEventLike) => void) | undefined;

  addEventListener(_type: 'keydown', listener: (event: KeyboardEventLike) => void): void {
    this.listener = listener;
  }

  removeEventListener(_type: 'keydown', listener: (event: KeyboardEventLike) => void): void {
    if (this.listener === listener) {
      this.listener = undefined;
    }
  }
}

test('application launch starts in Dormant with hidden window and no character', () => {
  const eventBus = new EventBus();
  const stateMachine = new StateMachine(eventBus);
  const windowController = new WindowController();
  const animation = new InstantAnimation();
  const scheduler = new ManualScheduler();
  const engine = new PresenceEngine(eventBus, stateMachine, windowController, animation, scheduler);

  engine.launch();

  assert.equal(stateMachine.state, 'Dormant');
  assert.equal(windowController.isVisible, false);
  assert.equal(windowController.hasCharacter, false);
  assert.equal(animation.idleActive, false);
});

test('Ctrl+Shift+Space activates Sage through Awakening into Idle', async () => {
  const eventBus = new EventBus();
  const stateMachine = new StateMachine(eventBus);
  const windowController = new WindowController();
  const animation = new InstantAnimation();
  const scheduler = new ManualScheduler();
  const engine = new PresenceEngine(eventBus, stateMachine, windowController, animation, scheduler);
  const keyboard = new KeyboardSpy();
  const activation = new ActivationController(engine, keyboard);
  const states: string[] = [];
  eventBus.subscribe('StateChanged', (event) => states.push(`${event.from}->${event.to}`));

  activation.start();
  keyboard.listener?.({
    code: 'Space',
    ctrlKey: true,
    shiftKey: true,
    altKey: false,
    metaKey: false,
    preventDefault: () => undefined,
  });
  await Promise.resolve();

  assert.deepEqual(states, ['Dormant->Awakening', 'Awakening->Idle']);
  assert.equal(stateMachine.state, 'Idle');
  assert.equal(windowController.isVisible, true);
  assert.equal(windowController.hasCharacter, true);
  assert.deepEqual(animation.played, ['Awakening']);
  assert.equal(animation.idleActive, true);
});

test('inactivity sleeps Sage and returns to Dormant', async () => {
  const eventBus = new EventBus();
  const stateMachine = new StateMachine(eventBus);
  const windowController = new WindowController();
  const animation = new InstantAnimation();
  const scheduler = new ManualScheduler();
  const engine = new PresenceEngine(eventBus, stateMachine, windowController, animation, scheduler, { inactivityTimeoutMs: 1 });

  engine.requestWake('Hotkey');
  await Promise.resolve();
  scheduler.fire();
  await Promise.resolve();

  assert.equal(stateMachine.state, 'Dormant');
  assert.equal(windowController.isVisible, false);
  assert.equal(windowController.hasCharacter, false);
  assert.deepEqual(animation.played, ['Awakening', 'Sleeping']);
});

test('state machine rejects transitions outside the configured transition map', () => {
  const stateMachine = new StateMachine(new EventBus());

  assert.throws(() => stateMachine.transitionTo('Speaking', 'not allowed'), /Invalid presence transition/);
});
