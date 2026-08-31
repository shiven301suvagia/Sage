import type { ToolDefinition } from './ToolContracts.js';
import { ToolRegistry } from './ToolRegistry.js';

export interface SagePlugin {
  readonly id: string;
  readonly version: string;
  readonly tools: readonly ToolDefinition[];
  activate?(): void | Promise<void>;
  deactivate?(): void | Promise<void>;
}

export class PluginLifecycle {
  private readonly active = new Set<string>();

  constructor(private readonly registry: ToolRegistry) {}

  async activate(plugin: SagePlugin): Promise<void> {
    if (this.active.has(plugin.id)) return;
    if (!plugin.id.trim() || !plugin.version.trim()) throw new Error('Plugin id and version are required.');

    const registered: string[] = [];
    try {
      for (const tool of plugin.tools) {
        this.registry.register(tool);
        registered.push(tool.id);
      }
      await plugin.activate?.();
      this.active.add(plugin.id);
    } catch (error) {
      for (const toolId of registered) this.registry.unregister(toolId);
      throw error;
    }
  }

  async deactivate(plugin: SagePlugin): Promise<void> {
    if (!this.active.has(plugin.id)) return;
    try {
      await plugin.deactivate?.();
    } finally {
      for (const tool of plugin.tools) this.registry.unregister(tool.id);
      this.active.delete(plugin.id);
    }
  }

  isActive(pluginId: string): boolean { return this.active.has(pluginId); }
}
