import type { PermissionGate } from '../assistant/PermissionGate.js';
import type { Capability } from '../assistant/PermissionGate.js';
import type { SecurityPolicy } from '../assistant/SecurityPolicy.js';
import type { ToolContext, ToolResult } from './ToolContracts.js';
import { ToolRegistry } from './ToolRegistry.js';

export class ToolRouter {
  constructor(
    private readonly registry: ToolRegistry,
    private readonly permissions: PermissionGate,
    private readonly security?: SecurityPolicy,
  ) {}

  async execute<T>(toolId: string, input: unknown, context: ToolContext): Promise<ToolResult<T>> {
    if (!toolId.trim()) return { ok: false, error: 'Tool id is required.' };
    if (!Number.isFinite(context.timestampMs)) return { ok: false, error: 'Invalid request timestamp.' };

    const tool = this.registry.get(toolId);
    if (!tool) return { ok: false, error: `Unknown tool: ${toolId}` };

    const capability: Capability = tool.risk === 'safe'
      ? 'read_context'
      : tool.risk === 'requires-confirmation'
        ? 'notify_user'
        : 'execute_action';
    const permission = this.permissions.check(capability);
    if (!permission.allowed) return { ok: false, error: permission.reason };

    if (this.security) {
      const decision = this.security.check(
        tool.risk === 'safe' ? 'read' : tool.risk === 'requires-confirmation' ? 'notify' : 'execute',
        tool.risk !== 'safe',
        context.confirmed === true,
      );
      if (!decision.allowed) return { ok: false, error: decision.reason };
    } else if (tool.risk !== 'safe' && context.confirmed !== true) {
      return { ok: false, error: 'Explicit user confirmation required.' };
    }

    try {
      return { ok: true, output: await tool.execute(input, context) as T };
    } catch (error) {
      return { ok: false, error: error instanceof Error ? error.message : 'Tool execution failed.' };
    }
  }
}
