# Roadmap

The roadmap prioritizes a stable foundation before advanced autonomy. Each phase should produce a coherent, testable increment that can be reviewed and maintained.

## Phase 1: Foundation

- Establish repository structure, documentation, coding standards, and contribution practices.
- Define application boundaries for frontend, backend, database, character, plugins, assets, scripts, and tests.
- Select the desktop runtime, backend language, storage strategy, and packaging approach through documented decision records.

## Phase 2: Core Desktop Experience

- Build the primary desktop shell with conversation, command, settings, and status surfaces.
- Implement local configuration, session lifecycle management, accessibility standards, and basic telemetry controls.
- Create the first version of the Sage visual language and interaction states.

## Phase 3: Assistant Core

- Implement request orchestration, tool routing, permission checks, memory policies, and structured responses.
- Provide stable internal APIs between the frontend and backend.
- Add regression tests for critical assistant behaviors.

## Phase 4: Extensibility

- Introduce a plugin manifest format, capability permissions, sandboxing rules, and plugin lifecycle management.
- Ship reference plugins that demonstrate safe integrations.
- Document compatibility guarantees for plugin authors.

## Phase 5: Production Hardening

- Add release automation, signing, migration safety, observability, crash recovery, and performance budgets.
- Conduct privacy, security, accessibility, and usability reviews before public distribution.
