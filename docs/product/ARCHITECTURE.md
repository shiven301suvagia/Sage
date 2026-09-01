# SAGE - Architecture Specification

**Version:** 1.0  
**Status:** Final baseline

## 1. Architectural Intent

SAGE is organized as a layered desktop assistant. Presentation, character behavior, assistant orchestration, policy, persistence, and integrations are separated so each can evolve independently.

## 2. System Context

```text
+----------------------- User -----------------------+
| pointer | keyboard | text | voice | desktop context |
+--------------------------+--------------------------+
                           |
                           v
+-----------------------------------------------------+
| Desktop Presentation / Electron Shell              |
| transparent window | UI | character | status      |
+--------------------------+--------------------------+
                           | IPC / typed bridge
                           v
+-----------------------------------------------------+
| Assistant Application Layer                         |
| conversation | context | planning | proactive      |
+--------------------------+--------------------------+
                           |
              +------------+------------+
              |                         |
              v                         v
+----------------------+      +----------------------+
| Policy / Tool Router |      | Memory / Persistence |
| permissions          |      | preferences         |
| confirmations       |      | conversation state  |
+----------+-----------+      +----------------------+
           |
           v
+-----------------------------------------------------+
| Integration Boundary                               |
| model providers | speech | plugins | OS adapters   |
+-----------------------------------------------------+
```

## 3. Component Responsibilities

### Desktop shell
Owns Electron lifecycle, transparent window configuration, positioning, visibility, global shortcuts, IPC registration, and OS-specific window behavior. It must not contain assistant business rules.

### Frontend
Owns conversation UI, character presentation, status indicators, input controls, settings surfaces, and interaction state. It consumes typed application results.

### Character runtime
Owns normalized visual state and animation blending: presence, opacity, glow, expression, breathing, blinking, cursor awareness, wake/sleep transitions, and future animation layers.

### Assistant core
Owns request interpretation, conversation orchestration, context assembly, response generation, planning, and coordination with memory and tools.

### Policy and router
Owns permission checks, confirmation boundaries, tool eligibility, restricted execution, and safe dispatch. This is a security boundary and cannot be bypassed by the UI.

### Memory
Owns durable user-approved memory, relevance retrieval, bounded storage, lifecycle, and deletion.

### Database/persistence
Owns schema, migrations, storage adapters, and data lifecycle rules. The assistant must not embed storage-specific details throughout business logic.

### Plugins/integrations
Expose capabilities through explicit contracts and manifests. External providers are treated as untrusted dependencies.

## 4. Request Lifecycle

1. User submits text, voice transcript, shortcut, or UI action.
2. Frontend validates basic input and sends a typed request through the preload bridge.
3. Application layer creates request/session context.
4. Context manager retrieves only relevant approved memory and preferences.
5. Assistant determines whether the request is conversational, informational, planning-oriented, or an action.
6. Conversational requests are answered through the configured model/local responder.
7. Action requests are converted into structured tool intents.
8. Policy engine checks permission, risk, network state, and confirmation requirements.
9. Approved tool executes through its adapter.
10. Result is normalized and returned to the assistant.
11. Assistant produces a concise user-facing response.
12. Relevant memory may be persisted according to memory policy.
13. Character runtime reflects working/speaking/idle state.

## 5. IPC Boundary

The preload bridge is the only renderer-to-main privileged interface. Exposed methods should be narrow, typed, and capability-oriented. Renderer code must not gain Node.js or filesystem access.

Current categories include window lifecycle/positioning, interaction mode, network permission, and assistant messaging. New privileged capabilities should follow the same boundary.

## 6. State Model

SAGE presence is a state machine rather than a collection of independent UI booleans.

```text
Dormant -> Awakening -> Idle
Idle -> Thinking -> Speaking -> Idle
Idle -> Working -> Idle
Idle -> Sleeping -> Dormant
Any active state -> Dormant on shutdown
```

Transitions must be explicit and invalid transitions rejected.

## 7. Data Model

Core durable entities:

- User preferences.
- Memory records.
- Conversation turns.
- Tool/integration configuration.
- Permission decisions.
- Schema/version metadata.

Data retention should be bounded and configurable. Memory and conversation are separate concepts: conversation history is not automatically permanent memory.

## 8. Model Abstraction

Model providers are behind an adapter. The assistant core must not depend directly on a single vendor SDK. A provider may be local or remote. The provider boundary exposes request, response, availability, error, and usage metadata in a normalized form.

## 9. Tool Architecture

Each tool should declare:

- stable identifier;
- description and input schema;
- risk class;
- required permissions;
- network requirement;
- confirmation requirement;
- execution adapter;
- normalized result/error contract.

The router is responsible for policy evaluation before execution.

## 10. Plugin Architecture

Plugins are extensions, not privileged peers. They communicate through versioned contracts and declared capabilities. Future production implementation should isolate plugin execution from the main process wherever practical.

## 11. Security Boundaries

Trust decreases as data moves outward:

```text
User intent
   |
Application logic
   |
Policy / confirmation
   |
Local tool adapters
   |
Plugin boundary
   |
External service / model
```

No external response is itself an authorization signal. Sensitive operations require local policy approval.

## 12. Failure Strategy

Optional dependencies must fail independently. If network access fails, local functionality remains available where possible. If a model fails, the UI reports the failure and may use an approved fallback. If a plugin fails, the core assistant remains operational.

## 13. Testing Strategy

- Unit tests for pure business logic.
- State-machine tests for lifecycle transitions.
- Policy tests for allow/deny/confirm decisions.
- Memory tests for retrieval, bounds, and deletion.
- IPC contract tests.
- Character runtime regression tests.
- Integration tests for model/tool adapters.
- Desktop smoke tests for packaging and launch.

## 14. Performance Architecture

Character animation runs independently from assistant request processing. Expensive work is asynchronous. Background tasks use bounded intervals and cancellation. Persistence writes should not block the UI thread.

## 15. Deployment

Development: TypeScript build + Electron desktop runtime.  
Production target: signed, reproducible desktop package with versioned migrations and release checks.

The repository's current roadmap explicitly prioritizes foundation, core desktop experience, assistant core, extensibility, and production hardening. This architecture preserves that progression. fileciteturn605file0
