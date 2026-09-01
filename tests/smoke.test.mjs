import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { SageBrain } from '../app/brain.mjs';

test('SAGE answers greetings without an external model', async () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'sage-'));
  try {
    const brain = new SageBrain({ dataDir: dir, fetchImpl: async () => { throw new Error('network disabled'); } });
    const result = await brain.reply('hi');
    assert.equal(result.ok, true);
    assert.equal(result.source, 'sage');
    assert.match(result.text, /Sage/i);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test('SAGE handles normal conversation when no model is available', async () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'sage-'));
  try {
    const brain = new SageBrain({ dataDir: dir, fetchImpl: async () => { throw new Error('network disabled'); } });
    const result = await brain.reply('I had a rough day and need to talk');
    assert.equal(result.ok, true);
    assert.equal(result.source, 'sage');
    assert.ok(result.text.length > 10);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test('SAGE persists memory across instances', async () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'sage-'));
  try {
    const first = new SageBrain({ dataDir: dir });
    await first.reply('remember that I love painting');
    const second = new SageBrain({ dataDir: dir });
    assert.deepEqual(second.listMemory(), ['I love painting']);
    assert.match((await second.reply('what do you remember')).text, /painting/i);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});
