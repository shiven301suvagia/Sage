import type { SystemContextProvider } from './SystemContext.js';
import type { ToolDefinition } from '../tools/ToolContracts.js';

export const createSystemContextTool = (provider: SystemContextProvider): ToolDefinition<Record<string, never>> => ({
  id: 'system.context',
  name: 'System Context',
  description: 'Returns a minimal, non-sensitive runtime system snapshot.',
  risk: 'safe',
  execute: () => provider.snapshot(),
});
