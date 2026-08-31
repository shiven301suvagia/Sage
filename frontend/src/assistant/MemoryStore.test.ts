import test from 'node:test';
import assert from 'node:assert/strict';
import { MemoryStore } from './MemoryStore.js';
import { ContextManager } from './ContextManager.js';

test('MemoryStore searches relevant memories and updates access time', () => {
  const store = new MemoryStore({ maxEntries: 3 });
  store.remember({ id: 'design', kind: 'preference', content: 'SAGE should use a calm design', createdAtMs: 10, importance: 0.8 });
  store.remember({ id: 'gaming', kind: 'fact', content: 'User plays games', createdAtMs: 20, importance: 0.2 });

  const result = store.search('calm design', 100, 5);
  assert.equal(result[0]?.id, 'design');
  assert.equal(result[0]?.lastAccessedAtMs, 100);
});

test('MemoryStore remains bounded', () => {
  const store = new MemoryStore({ maxEntries: 2 });
  store.remember({ id: 'low', kind: 'fact', content: 'low', createdAtMs: 1, importance: 0.1 });
  store.remember({ id: 'high', kind: 'fact', content: 'high', createdAtMs: 2, importance: 0.9 });
  store.remember({ id: 'new', kind: 'fact', content: 'new', createdAtMs: 3, importance: 0.5 });

  assert.equal(store.list().length, 2);
  assert.equal(store.get('low', 4), undefined);
});

test('ContextManager builds a relevant context snapshot', () => {
  const store = new MemoryStore();
  const context = new ContextManager(store);
  context.rememberConversation('c1', 'We are building the SAGE assistant', 10, 0.7);

  const snapshot = context.build('SAGE assistant', 20);
  assert.equal(snapshot.relevantMemories.length, 1);
  assert.equal(snapshot.relevantMemories[0]?.id, 'c1');
  assert.equal(snapshot.createdAtMs, 20);
});
