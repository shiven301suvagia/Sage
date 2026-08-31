import test from 'node:test';
import assert from 'node:assert/strict';
import { CharacterRuntime } from './CharacterRuntime.js';
import { CharacterBehaviorController } from './CharacterBehaviorController.js';

test('behavior controller maps reactions to moods and wakes the runtime', () => {
  const runtime = new CharacterRuntime({ seed: 1 });
  const behavior = new CharacterBehaviorController(runtime);
  behavior.react('celebrate', 100, 500);
  assert.equal(runtime.currentState, 'Waking');
  assert.equal(behavior.current.mood, 'happy');
  assert.equal(behavior.current.reaction, 'celebrate');
});

test('behavior controller returns the character to sleep after a reaction expires', () => {
  const runtime = new CharacterRuntime({ seed: 1 });
  const behavior = new CharacterBehaviorController(runtime);
  behavior.react('think', 100, 500);
  behavior.update(601);
  assert.equal(runtime.currentState, 'Sleeping');
  assert.equal(behavior.current.reaction, 'rest');
});
