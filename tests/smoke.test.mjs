import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { SageBrain } from '../app/brain.mjs';

test('SAGE answers a greeting offline', async () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'sage-'));
  try {
    const brain = new SageBrain({ dataDir: dir });
    const result = await brain.reply('hi');
    assert.equal(result.ok, true);
    assert.match(result.text, /Sage/i);
    assert.equal(result.source, 'sage');
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test('SAGE persists memory locally', async () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'sage-'));
  try {
    const brain = new SageBrain({ dataDir: dir });
    await brain.reply('remember that I love painting');
    const restored = new SageBrain({ dataDir: dir });
    assert.deepEqual(restored.memory, ['I love painting']);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test('SAGE has a deterministic fallback for ordinary conversation', async () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'sage-'));
  try {
    const brain = new SageBrain({ dataDir: dir });
    const result = await brain.reply('I had a rough day');
    assert.equal(result.ok, true);
    assert.ok(result.text.length > 10);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});
