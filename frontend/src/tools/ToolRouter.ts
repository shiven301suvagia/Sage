import type { PermissionGate } from '../assistant/PermissionGate.js';
import type { Capability } from '../assistant/PermissionGate.js';
import type { ToolContext, ToolResult } from './ToolContracts.js';
import { ToolRegistry } from './ToolRegistry.js';

export class ToolRouter {
  constructor(private readonly registry: ToolRegistry, private readonly permissions: PermissionGate) {}

  async execute<T>(toolId: string, input: unknown, context: ToolContext): Promise<ToolResult<T>> {
    const tool = this.registry.get(toolId);
    if (!tool) return { ok: false, error: `Unknown tool: ${toolId}` };

    const capability: Capability = tool.risk === 'safe' ? 'read_context' : tool.risk === 'requires-confirmation' ? 'notify_user' : 'execute_action';
    const permission = this.permissions.check(capability);
    if (!permission.allowed) return { ok: false, error: permission.reason };

    try {
      return { ok: true, output: await tool.execute(input, context) as T };
    } catch (error) {
      return { ok: false, error: error instanceof Error ? error.message : 'Tool execution failed.' };
    }
  }
}
