import type { EventBus } from '../assistant/EventBus.js';
import type { ToolContext } from './ToolContracts.js';
import { ToolRouter } from './ToolRouter.js';

export interface ToolRequest {
  readonly toolId: string;
  readonly input: unknown;
  readonly requestId: string;
  readonly timestampMs: number;
}

export class AssistantToolBridge {
  constructor(private readonly events: EventBus, private readonly router: ToolRouter) {}

  async execute(request: ToolRequest): Promise<void> {
    const context: ToolContext = { requestId: request.requestId, timestampMs: request.timestampMs };
    const result = await this.router.execute(request.toolId, request.input, context);
    this.events.emit({
      type: 'assistant.response',
      payload: {
        text: result.ok ? `Tool ${request.toolId} completed.` : `Tool ${request.toolId} was blocked: ${result.error}`,
        source: 'assistant',
      },
    });
  }
}
