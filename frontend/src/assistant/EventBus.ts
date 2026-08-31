export type SageEventMap = {
  readonly 'user.input': { readonly text: string; readonly timestampMs: number };
  readonly 'system.activity': { readonly kind: string; readonly timestampMs: number };
  readonly 'assistant.response': { readonly text: string; readonly source: 'assistant' | 'system' };
};

export type SageEvent<T extends keyof SageEventMap = keyof SageEventMap> = {
  readonly type: T;
  readonly payload: SageEventMap[T];
};

type Handler<T> = (event: SageEvent<T>) => void;

export class EventBus {
  private readonly handlers = new Map<keyof SageEventMap, Set<Handler<any>>>();

  on<T extends keyof SageEventMap>(type: T, handler: Handler<T>): () => void {
    const listeners = this.handlers.get(type) ?? new Set<Handler<any>>();
    listeners.add(handler);
    this.handlers.set(type, listeners);
    return () => listeners.delete(handler);
  }

  emit<T extends keyof SageEventMap>(event: SageEvent<T>): void {
    this.handlers.get(event.type)?.forEach((handler) => handler(event));
  }
}
