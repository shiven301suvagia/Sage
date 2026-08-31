import type { ToolDefinition } from './ToolContracts.js';

export const createGetTimeTool = (): ToolDefinition<Record<string, never>, { timestampMs: number }> => ({
  id: 'system.time',
  name: 'Get Time',
  description: 'Returns the current runtime timestamp.',
  risk: 'safe',
  execute: (_input, context) => ({ timestampMs: context.timestampMs }),
});

export const createEchoTool = (): ToolDefinition<{ text: string }, { text: string }> => ({
  id: 'utility.echo',
  name: 'Echo',
  description: 'Returns text without performing a system action.',
  risk: 'safe',
  execute: (input) => ({ text: input.text }),
});
