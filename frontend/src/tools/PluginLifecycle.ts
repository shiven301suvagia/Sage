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
    for (const tool of plugin.tools) this.registry.register(tool);
    await plugin.activate?.();
    this.active.add(plugin.id);
  }

  async deactivate(plugin: SagePlugin): Promise<void> {
    if (!this.active.has(plugin.id)) return;
    await plugin.deactivate?.();
    this.active.delete(plugin.id);
  }

  isActive(pluginId: string): boolean { return this.active.has(pluginId); }
}
