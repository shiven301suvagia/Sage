import test from 'node:test';
import assert from 'node:assert/strict';
import { SecurityPolicy } from './SecurityPolicy.js';

test('security policy allows reads', () => {
  assert.equal(new SecurityPolicy().check('read').allowed, true);
});

test('security policy requires confirmation for notifications', () => {
  assert.equal(new SecurityPolicy().check('notify', true, false).allowed, false);
  assert.equal(new SecurityPolicy().check('notify', true, true).allowed, true);
});

test('restricted execution is denied by default', () => {
  assert.equal(new SecurityPolicy().check('execute', false, true).allowed, false);
});
