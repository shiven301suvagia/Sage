# Architecture

Sage uses a modular architecture that separates interface, orchestration, persistence, personality, and extensions. Each module should expose explicit contracts and avoid hidden dependencies.

## Layers

### Frontend

The frontend owns desktop presentation, interaction state, accessibility behavior, and local user workflows. It should communicate with the backend through documented APIs rather than reaching into implementation details.

### Backend

The backend owns assistant orchestration, model routing, policy enforcement, tool execution, plugin coordination, and application services. It should provide deterministic boundaries around nondeterministic model behavior.

### Database

The database layer owns durable state, migrations, indexing, retention, and recovery. It should support local-first operation and make user-controlled deletion reliable.

### Character

The character layer defines tone, behavioral constraints, response shape, escalation rules, and conversational boundaries. It should be versioned as product logic because personality changes affect user trust.

### Plugins

Plugins extend Sage through explicit permissions and stable interfaces. They must not bypass policy checks, persistence rules, or user consent flows.

## Design Constraints

- Prefer small services and composable interfaces over broad shared modules.
- Treat permission checks and user consent as backend responsibilities.
- Keep model prompts, character rules, and tool policies reviewable.
- Design for offline degradation where possible.
- Make failures visible, recoverable, and understandable.
