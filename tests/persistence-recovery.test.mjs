import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { MemoryStore } from '../app/core/memory.mjs';

test('MemoryStore quarantines malformed persistence and starts clean', async () => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'sage-memory-'));
  const file = path.join(dir, 'memory.json');
  await fs.writeFile(file, '{not valid json', 'utf8');
  const store = new MemoryStore(file);
  const snapshot = await store.load();
  assert.deepEqual(snapshot, []);
  const names = await fs.readdir(dir);
  assert.equal(names.filter(name => name.startsWith('memory.json.corrupt-')).length, 1);
  assert.equal(await fs.readFile(file, 'utf8'), '{"schemaVersion":1,"entries":[]}');
  await fs.rm(dir, { recursive: true, force: true });
});
