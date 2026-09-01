# SAGE - Development Plan

**Version:** 1.0  
**Status:** Final baseline

## 1. Delivery Strategy

Development follows vertical slices: each phase must produce a coherent, testable improvement rather than accumulating disconnected infrastructure. Product documentation, implementation, tests, and release checks move together.

## 2. Workstreams

### WS-01 Product and character
Own product requirements, personality, character states, interaction principles, and acceptance criteria.

### WS-02 Desktop shell
Own Electron lifecycle, windowing, shortcuts, positioning, input capture, packaging, and OS adapters.

### WS-03 Assistant core
Own conversation, context, model abstraction, response orchestration, planning, and proactive behavior.

### WS-04 Memory and data
Own storage schema, memory retrieval, conversation persistence, preferences, migrations, and deletion.

### WS-05 Tools and integrations
Own registry, routing, permission model, confirmation flow, plugin contracts, and integrations.

### WS-06 UI/UX
Own character presentation, conversation UI, settings, accessibility, motion, and visual polish.

### WS-07 Quality and security
Own automated tests, threat modeling, dependency review, performance checks, packaging validation, and release gates.

## 3. Phases

### Phase 0 - Specification baseline
Deliver this five-document product specification set and reconcile it with existing repository documentation.

**Exit:** all teams can implement against a shared source of truth.

### Phase 1 - Desktop foundation
- Stable Electron startup/shutdown.
- Transparent character window.
- Safe positioning and drag.
- Global shortcut.
- Reliable renderer/main IPC.
- Final character asset packaging.

**Exit:** SAGE can launch, move, wake, interact, and close without affecting unrelated desktop applications.

### Phase 2 - Conversational companion
- Text conversation.
- Model adapter.
- Local/fallback response path.
- Session context.
- Speaking/typing states.
- Voice output abstraction.

**Exit:** SAGE supports both ordinary conversation and structured requests.

### Phase 3 - Memory and personalization
- Persistent memory.
- Relevance search.
- Memory inspection/deletion.
- Preferences.
- Conversation lifecycle.

**Exit:** SAGE remembers only according to policy and the user can control that memory.

### Phase 4 - Safe action system
- Tool registry.
- Permission evaluation.
- Confirmation UX.
- Network gating.
- Action results/errors.
- Audit-oriented local diagnostics.

**Exit:** SAGE can perform useful safe actions while restricted actions remain protected.

### Phase 5 - Proactive companion
- Reminder engine.
- Priority/cooldown policy.
- Context-aware suggestions.
- Attention decay.
- Sleep/dormant transitions.

**Exit:** SAGE is helpful without becoming disruptive.

### Phase 6 - Integrations and plugins
- Versioned plugin manifest.
- Capability declarations.
- Isolation/sandboxing strategy.
- Reference integrations.
- Compatibility policy.

**Exit:** integrations can evolve without weakening core security boundaries.

### Phase 7 - Production hardening
- Packaging/signing.
- Crash recovery.
- Migration safety.
- Performance budgets.
- Accessibility audit.
- Security review.
- Release automation.

**Exit:** repeatable production release from a clean checkout.

## 4. Definition of Done

A feature is done when:

1. Requirement is linked to this documentation set.
2. Design/architecture impact is documented.
3. Implementation is complete.
4. Automated tests cover critical behavior.
5. Failure paths are handled.
6. Security/privacy impact is reviewed.
7. Accessibility impact is reviewed where applicable.
8. Documentation is updated.
9. Clean build/check succeeds.
10. Release-impacting changes are manually smoke-tested.

## 5. Testing Gates

Every merge should run type checking/build and automated tests. Feature branches add focused tests. Release candidates additionally run packaging smoke tests, security/dependency checks, accessibility review, and representative manual desktop flows.

Critical regression suite includes lifecycle, window interaction, IPC, memory, conversation persistence, policy enforcement, tool routing, character runtime, and proactive cooldown behavior.

## 6. Manual Smoke Test

From a clean machine or clean project directory:

```text
install dependencies
build
run automated checks
launch desktop app
verify final SAGE asset
wake via shortcut
open conversation
send ordinary conversational message
send safe structured request
attempt restricted action and verify confirmation/denial
move SAGE around desktop
verify no file drops or unrelated window changes
close/reopen app
verify persisted settings/memory behavior
```

## 7. Release Checklist

- [ ] Requirements current.
- [ ] Architecture current.
- [ ] UI/UX current.
- [ ] Character assets present and licensed.
- [ ] Clean build passes.
- [ ] Automated tests pass.
- [ ] Security review complete.
- [ ] Privacy review complete.
- [ ] Accessibility review complete.
- [ ] Performance budget acceptable.
- [ ] Packaging succeeds.
- [ ] Upgrade/migration path tested.
- [ ] Rollback/recovery strategy documented.
- [ ] Release notes prepared.

## 8. Change Management

Product changes update the PRD first. Architectural changes update the architecture specification and, where significant, a decision record. Requirement changes update the requirements specification. UI changes update the UI/UX specification. Delivery changes update this development plan.

No implementation should silently redefine a requirement.

## 9. Current Baseline

The repository already establishes a long-term production structure across docs, frontend, backend, character, database, plugins, assets, scripts, and tests. The existing roadmap also prioritizes foundation, desktop experience, assistant core, extensibility, and production hardening. This plan turns that direction into an execution sequence.
