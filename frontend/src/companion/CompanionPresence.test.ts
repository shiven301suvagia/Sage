import test from 'node:test';
import assert from 'node:assert/strict';
import { CompanionPresence } from './CompanionPresence.js';

test('companion begins dormant', () => {
  assert.equal(new CompanionPresence().get().state, 'dormant');
});

test('interaction wakes companion into presence', () => {
  const sage = new CompanionPresence();
  sage.interact(1000);
  assert.equal(sage.get().state, 'present');
  assert.equal(sage.get().attention, 1);
  assert.equal(sage.get().lastInteractionAt, 1000);
});

test('attention decays and eventually sleeps', () => {
  const sage = new CompanionPresence();
  sage.interact(1000);
  sage.tick(30000);
  sage.tick(30000);
  sage.tick(30000);
  assert.equal(sage.get().state, 'sleeping');
  assert.equal(sage.get().attention, 0);
});

test('invalid time and delta are rejected', () => {
  const sage = new CompanionPresence();
  assert.throws(() => sage.interact(Number.NaN), RangeError);
  assert.throws(() => sage.tick(-1), RangeError);
});
