import type { ToolDefinition } from './ToolContracts.js';

export class ToolRegistry {
  private readonly tools = new Map<string, ToolDefinition<any, any>>();

  register<TInput, TOutput>(tool: ToolDefinition<TInput, TOutput>): void {
    if (this.tools.has(tool.id)) throw new Error(`Tool already registered: ${tool.id}`);
    this.tools.set(tool.id, tool);
  }

  get(id: string): ToolDefinition | undefined { return this.tools.get(id); }
  list(): readonly ToolDefinition[] { return [...this.tools.values()]; }
  has(id: string): boolean { return this.tools.has(id); }
}
