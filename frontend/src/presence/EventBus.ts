import type { EventHandler, PresenceEvent, Subscription } from './types.js';

type EventOfType<TType extends PresenceEvent['type']> = Extract<PresenceEvent, { type: TType }>;

export class EventBus {
  private readonly handlers = new Map<PresenceEvent['type'], Set<EventHandler>>();

  publish<TEvent extends PresenceEvent>(event: TEvent): void {
    const eventHandlers = this.handlers.get(event.type);
    if (!eventHandlers) {
      return;
    }

    for (const handler of [...eventHandlers]) {
      handler(event);
    }
  }

  subscribe<TType extends PresenceEvent['type']>(
    eventType: TType,
    handler: EventHandler<EventOfType<TType>>,
  ): Subscription {
    const handlers = this.handlers.get(eventType) ?? new Set<EventHandler>();
    handlers.add(handler as EventHandler);
    this.handlers.set(eventType, handlers);

    return {
      unsubscribe: () => {
        handlers.delete(handler as EventHandler);
        if (handlers.size === 0) {
          this.handlers.delete(eventType);
        }
      },
    };
  }
}
