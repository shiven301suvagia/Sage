import test from 'node:test';
import assert from 'node:assert/strict';
import { ToolRegistry } from './ToolRegistry.js';
import { ToolRouter } from './ToolRouter.js';
import { createEchoTool } from './BuiltinTools.js';
import { PermissionGate } from '../assistant/PermissionGate.js';

test('registry registers and rejects duplicate tools', () => {
  const registry = new ToolRegistry();
  registry.register(createEchoTool());
  assert.equal(registry.has('utility.echo'), true);
  assert.throws(() => registry.register(createEchoTool()));
});

test('router blocks tools without permission', async () => {
  const router = new ToolRouter(new ToolRegistry(), new PermissionGate());
  const result = await router.execute('utility.echo', { text: 'hello' }, { requestId: '1', timestampMs: 1 });
  assert.equal(result.ok, false);
});

test('router executes a permitted safe tool', async () => {
  const registry = new ToolRegistry();
  registry.register(createEchoTool());
  const permissions = new PermissionGate(new Set(['read_context']));
  const result = await new ToolRouter(registry, permissions).execute<{ text: string }>('utility.echo', { text: 'hello' }, { requestId: '2', timestampMs: 2 });
  assert.deepEqual(result, { ok: true, output: { text: 'hello' } });
});
