import test from 'node:test';
import assert from 'node:assert/strict';
import { InMemorySageMemory, SageConversation, type SageResponder } from './SageConversation.js';

test('conversation persists user and SAGE turns', async () => {
  const responder: SageResponder = { async respond(input) { return `I heard: ${input}`; } };
  const memory = new InMemorySageMemory();
  const sage = new SageConversation(responder, memory);

  assert.equal(await sage.send('Hello', 1000), 'I heard: Hello');
  assert.deepEqual(sage.history(), [
    { role: 'user', text: 'Hello', timestamp: 1000 },
    { role: 'sage', text: 'I heard: Hello', timestamp: 1000 },
  ]);
});

test('conversation rejects empty messages and invalid timestamps', async () => {
  const responder: SageResponder = { async respond() { return 'ok'; } };
  const sage = new SageConversation(responder);
  await assert.rejects(() => sage.send('   '), RangeError);
  await assert.rejects(() => sage.send('hello', Number.NaN), RangeError);
});

test('empty responder output is not persisted', async () => {
  const memory = new InMemorySageMemory();
  const responder: SageResponder = { async respond() { return '   '; } };
  const sage = new SageConversation(responder, memory);
  await assert.rejects(() => sage.send('hello'), /empty response/);
  assert.deepEqual(sage.history(), []);
});
