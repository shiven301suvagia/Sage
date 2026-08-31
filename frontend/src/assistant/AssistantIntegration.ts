import { AssistantCore } from './AssistantCore.js';
import { CharacterAssistantBridge } from './CharacterAssistantBridge.js';
import { EventBus } from './EventBus.js';
import { InteractionPolicy } from './InteractionPolicy.js';
import type { CharacterRuntime } from '../rendering/CharacterRuntime.js';

export interface AssistantIntegration {
  readonly events: EventBus;
  readonly assistant: AssistantCore;
  readonly policy: InteractionPolicy;
  readonly characterBridge: CharacterAssistantBridge;
  dispose(): void;
}

export function createAssistantIntegration(runtime: CharacterRuntime): AssistantIntegration {
  const events = new EventBus();
  const assistant = new AssistantCore(events);
  const policy = new InteractionPolicy();
  const characterBridge = new CharacterAssistantBridge(events, runtime, assistant);

  const disposePolicy = events.on('user.input', (event) => {
    policy.evaluate(event);
  });

  return {
    events,
    assistant,
    policy,
    characterBridge,
    dispose(): void {
      disposePolicy();
      characterBridge.dispose();
    },
  };
}
