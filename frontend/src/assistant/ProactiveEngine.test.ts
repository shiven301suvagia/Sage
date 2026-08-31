import test from 'node:test';
import assert from 'node:assert/strict';
import { ProactiveEngine } from './ProactiveEngine.js';

test('proactive engine enforces priority and cooldown', () => {
  const engine = new ProactiveEngine({ cooldownMs: 1000, minimumPriority: 2 });
  const signal = { reason: 'idle' as const, timestampMs: 1000, message: 'Still there?', priority: 2 };
  assert.equal(engine.evaluate(signal), true);
  assert.equal(engine.evaluate({ ...signal, timestampMs: 1500 }), false);
  assert.equal(engine.evaluate({ ...signal, timestampMs: 2000 }), true);
  assert.equal(engine.evaluate({ ...signal, timestampMs: 3000, priority: 1 }), false);
});
