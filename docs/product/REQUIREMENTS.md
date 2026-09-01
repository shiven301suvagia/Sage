# SAGE - Requirements Specification

**Version:** 1.0  
**Status:** Final baseline

## 1. Requirement Conventions

- **FR** = functional requirement.
- **NFR** = non-functional requirement.
- **SEC** = security requirement.
- **PRV** = privacy requirement.
- **A11Y** = accessibility requirement.
- **OPS** = operational/release requirement.
- **MUST** is mandatory for release.
- **SHOULD** is important but deferrable by explicit decision.
- **MAY** is optional.

## 2. Functional Requirements

### FR-001 Desktop lifecycle
SAGE MUST launch into a defined lifecycle state and MUST expose deterministic transitions between dormant, awake, idle, working, speaking, and sleep states.

### FR-002 Presence
SAGE MUST render as a transparent desktop companion and MUST remain within the usable display work area when moved programmatically or by the user.

### FR-003 Interaction
SAGE MUST accept pointer, keyboard, and shortcut interaction for primary actions. Dragging the character MUST move the SAGE window rather than invoke browser/file drag behavior.

### FR-004 Conversation
SAGE MUST accept natural-language text and MUST return a useful response when a conversational capability is available. Ordinary conversation is a supported product use case, not an error path.

### FR-005 Intent handling
The assistant MUST distinguish conversational responses from tool/action requests and MUST route them through the appropriate policy boundary.

### FR-006 Memory
The memory subsystem MUST support create, retrieve/search, update, lifecycle management, and deletion. It MUST enforce configured bounds.

### FR-007 Context
The context subsystem MUST build a bounded relevant context snapshot from the current request, approved memory, preferences, and active session state.

### FR-008 Planning
SAGE MUST support structured task planning and MUST represent incomplete or uncertain plans honestly.

### FR-009 Proactive assistance
The proactive engine MUST apply priority, relevance, and cooldown rules before interrupting the user.

### FR-010 Tool registry
Tools MUST be registered through explicit contracts. Duplicate or malformed registrations MUST be rejected.

### FR-011 Tool policy
The router MUST evaluate permissions before executing a tool. Restricted tools MUST be denied unless the required authorization is present.

### FR-012 Confirmation
Sensitive or consequential operations MUST request confirmation before execution.

### FR-013 Network permission
SAGE MUST expose a clear network permission state. Network-dependent capabilities MUST respect that state.

### FR-014 Voice
Voice output SHOULD be available through a modular speech interface. Voice input MAY be implemented through a pluggable provider.

### FR-015 Character runtime
Character rendering MUST consume a normalized character frame/state rather than embedding assistant logic in visual components.

### FR-016 Animation
Idle breathing, blinking, cursor awareness, wake/sleep transitions, and expression blending MUST be deterministic enough to test and MUST not block assistant orchestration.

### FR-017 Preferences
User preferences MUST have safe defaults and MUST support validated updates.

### FR-018 Error handling
Invalid input, unavailable capability, tool failure, permission denial, and network failure MUST result in explicit user-visible states where relevant.

### FR-019 Shutdown
The application MUST release global shortcuts and other process-level resources during shutdown.

### FR-020 Documentation
Major product and architectural decisions MUST be reflected in repository documentation.

## 3. Non-Functional Requirements

### NFR-001 Reliability
Critical lifecycle and policy paths MUST be covered by automated tests.

### NFR-002 Responsiveness
Primary UI interactions SHOULD respond within 100 ms under normal workload; assistant responses may take longer but MUST provide progress/working feedback when appropriate.

### NFR-003 Resource use
Idle animation and polling MUST be lightweight and bounded.

### NFR-004 Maintainability
Modules MUST have clear responsibilities and stable interfaces. Frontend presentation MUST remain separated from policy and business logic.

### NFR-005 Portability
The desktop layer MUST isolate OS-specific behavior behind a small adapter boundary where practical.

### NFR-006 Testability
State machines, policy decisions, memory behavior, routing, and animation calculations MUST be independently testable without requiring a full desktop session.

### NFR-007 Observability
Diagnostic logs SHOULD include lifecycle, policy, tool, and failure events while avoiding unnecessary sensitive content.

### NFR-008 Accessibility
Primary interactions MUST be keyboard accessible and visual-only states MUST have a non-visual equivalent.

## 4. Security Requirements

### SEC-001 Least privilege
Integrations MUST request only capabilities required for their function.

### SEC-002 Default deny
Restricted execution MUST be denied by default.

### SEC-003 Confirmation boundary
The confirmation mechanism MUST be enforced below the UI so a UI bug cannot silently bypass it.

### SEC-004 Input validation
IPC and tool inputs MUST be type-checked and bounded before use.

### SEC-005 External content
External content MUST be treated as untrusted input and MUST NOT directly authorize actions.

### SEC-006 Secret handling
Credentials, API keys, and authentication material MUST NOT be written to ordinary conversation logs.

### SEC-007 Plugin isolation
Plugins MUST operate through explicit contracts and permission boundaries. Direct unrestricted access to privileged application internals is prohibited.

## 5. Privacy Requirements

### PRV-001 Local-first storage
User memory and preferences SHOULD remain local by default.

### PRV-002 User control
Users MUST be able to inspect and delete persistent memory.

### PRV-003 Network disclosure
The product MUST clearly distinguish local/offline operation from network-enabled operation.

### PRV-004 Data minimization
Only data required for a defined feature SHOULD be retained.

### PRV-005 Sensitive data
Sensitive data MUST NOT be transmitted to external services without the required user authorization.

### PRV-006 Logs
Diagnostic logs MUST avoid raw sensitive content by default.

## 6. Accessibility Requirements

### A11Y-001 Keyboard
All primary controls MUST have keyboard equivalents.

### A11Y-002 Focus
Interactive controls MUST expose visible focus.

### A11Y-003 Contrast
Text and controls MUST meet an appropriate contrast standard for supported themes.

### A11Y-004 Motion
Reduced-motion settings MUST reduce or disable non-essential animation.

### A11Y-005 Status
Important state changes MUST be available through text/status indicators, not animation alone.

## 7. Operational Requirements

### OPS-001 Clean build
A clean checkout MUST install and build successfully using documented versions.

### OPS-002 Automated checks
The release pipeline MUST run type checking/build, automated tests, and security checks.

### OPS-003 Packaging
Production builds MUST produce a repeatable desktop artifact.

### OPS-004 Recovery
The application MUST fail gracefully when optional model, network, plugin, or speech capabilities are unavailable.

### OPS-005 Migration
Persistent schema changes MUST be versioned and safely migratable.

## 8. Traceability Priorities

P0 requirements are release blockers: FR-001 through FR-006, FR-010 through FR-013, SEC-001 through SEC-004, PRV-001 through PRV-005, OPS-001 through OPS-004.

P1 requirements define a polished production companion: planning, proactive assistance, voice, advanced animation, plugin isolation, observability, and accessibility refinements.
