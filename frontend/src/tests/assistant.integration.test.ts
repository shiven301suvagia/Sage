import assert from 'node:assert/strict';
import test from 'node:test';
import { AssistantCore } from '../assistant/AssistantCore.js';
import { CharacterAssistantBridge } from '../assistant/CharacterAssistantBridge.js';
import { EventBus } from '../assistant/EventBus.js';
import { InteractionPolicy } from '../assistant/InteractionPolicy.js';
import { CharacterRuntime } from '../rendering/CharacterRuntime.js';

test('assistant response wakes the character and schedules sleep', async () => {
  const events = new EventBus();
  const assistant = new AssistantCore(events);
  const runtime = new CharacterRuntime({ seed: 1 });
  const bridge = new CharacterAssistantBridge(events, runtime, assistant, { responseHoldMs: 5, now: () => 1000 });

  events.emit({ type: 'user.input', payload: { text: 'hello', timestampMs: 1000 } });
  assert.equal(runtime.currentState, 'Waking');

  await new Promise((resolve) => setTimeout(resolve, 15));
  assert.equal(runtime.currentState, 'Sleeping');
  bridge.dispose();
});

test('interaction policy responds to user input and throttles recent activity', () => {
  const policy = new InteractionPolicy({ cooldownMs: 30_000, minActivityGapMs: 10_000 });
  assert.deepEqual(policy.evaluate({ type: 'user.input', payload: { text: 'hello', timestampMs: 1000 } }), { kind: 'respond', reason: 'user-input' });
  assert.equal(policy.evaluate({ type: 'system.activity', payload: { kind: 'work', timestampMs: 2000 } }).kind, 'ignore');
});
