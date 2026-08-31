import type { ToolDefinition } from './ToolContracts.js';

export class ToolRegistry {
  private readonly tools = new Map<string, ToolDefinition<any, any>>();

  register<TInput, TOutput>(tool: ToolDefinition<TInput, TOutput>): void {
    if (!tool.id.trim()) throw new Error('Tool id is required.');
    if (this.tools.has(tool.id)) throw new Error(`Tool already registered: ${tool.id}`);
    this.tools.set(tool.id, tool);
  }

  unregister(id: string): boolean { return this.tools.delete(id); }
  get(id: string): ToolDefinition | undefined { return this.tools.get(id); }
  list(): readonly ToolDefinition[] { return [...this.tools.values()]; }
  has(id: string): boolean { return this.tools.has(id); }
}
