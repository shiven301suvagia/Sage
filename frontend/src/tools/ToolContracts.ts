export type ToolRisk = 'safe' | 'requires-confirmation' | 'restricted';

export interface ToolContext {
  readonly requestId: string;
  readonly timestampMs: number;
  /** True only when the user explicitly approved this individual action. */
  readonly confirmed?: boolean;
}

export interface ToolDefinition<TInput = unknown, TOutput = unknown> {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly risk: ToolRisk;
  readonly execute: (input: TInput, context: ToolContext) => Promise<TOutput> | TOutput;
}

export type ToolResult<T = unknown> =
  | { readonly ok: true; readonly output: T }
  | { readonly ok: false; readonly error: string };
