# SAGE - Product Requirements Document

**Document status:** Final baseline  
**Product:** SAGE Desktop AI Companion  
**Version:** 1.0  
**Audience:** Product, engineering, design, QA, security, future contributors

## 1. Executive Summary

SAGE is a persistent desktop AI companion designed to help a user think, create, plan, research, communicate, and automate routine computer work without turning the desktop into an intrusive chatbot interface.

The product combines capable assistant behavior with a calm, friendly character presence. SAGE should support both purposeful tasks and ordinary conversation. The companion remains visually quiet when not needed, becomes attentive when the user interacts, and communicates state through character animation, concise UI, and optional voice.

The product is explicitly local-first and permission-aware. SAGE must preserve user agency: consequential actions require appropriate authorization, memory is controllable, and failures are visible rather than hidden behind personality.

## 2. Product Vision

Make advanced personal computing feel calm, competent, personal, and trustworthy.

## 3. Product Principles

1. **Companion, not mascot.** The character is an interaction surface for real utility.
2. **Useful before clever.** Reliability and task completion matter more than novelty.
3. **Proactive, not intrusive.** SAGE may surface useful reminders or context, but must respect attention and cooldown policies.
4. **Human conversation is first-class.** The user can talk to SAGE without needing to phrase every request as a command.
5. **User control is explicit.** Permissions, memory, network access, automation, and visibility are controllable.
6. **Privacy by design.** Local data stays local unless the user permits an external service or integration.
7. **Recoverable actions.** Consequential operations should be previewable, confirmable, and reversible where practical.
8. **Honest intelligence.** SAGE distinguishes known information, uncertainty, unavailable capabilities, and completed actions.

## 4. Target User

The primary user is a technically comfortable desktop user who wants an always-available assistant for creative work, study, productivity, research, file-oriented tasks, planning, and casual conversation.

Secondary users include developers and power users who want a modular desktop assistant with controlled integrations.

## 5. Core User Problems

- Switching between applications to perform small repetitive tasks.
- Losing context across projects, conversations, and reminders.
- Needing an assistant that can stay available without dominating the screen.
- Wanting conversational help as well as explicit commands.
- Wanting automation without surrendering control of the computer.
- Wanting persistent memory without giving up privacy.

## 6. Goals

### Must achieve

- Provide a stable desktop companion runtime.
- Support natural conversation and structured requests.
- Maintain user-controlled persistent memory.
- Support planning, research, summarization, and safe tool execution.
- Provide clear permission boundaries for integrations and actions.
- Provide an expressive character state system with dormant, wake, idle, thinking, speaking, concern, excitement, and sleep behaviors.
- Work predictably on supported Windows desktop environments.

### Success indicators

- Launch reliability: >=99% successful starts in supported environments.
- Critical assistant actions: >=99% policy enforcement in automated tests.
- No silent execution of restricted actions.
- Memory operations are inspectable and deletable.
- Core UI interactions remain responsive under normal desktop load.
- Release candidates pass build, unit, integration, security, accessibility, and packaging gates.

## 7. Scope

### In scope

- Desktop presence and character runtime.
- Conversational assistant.
- Memory and context management.
- Planning and proactive assistance.
- Safe tool/action routing.
- Local preferences and data persistence.
- Network permission controls.
- Voice input/output as a modular capability.
- Plugin/integration framework.
- Notifications and reminders.
- Research and summarization workflows.
- Developer and diagnostic surfaces.

### Out of scope for the initial production release

- Fully autonomous unrestricted computer control.
- Hidden background surveillance.
- Silent collection of sensitive user activity.
- Financial transactions without explicit authorization.
- Destructive actions without confirmation.
- Pretending to be a human.

## 8. Core Experience

SAGE has three broad modes of presence:

**Dormant:** minimal or hidden presence; no attention demand.  
**Awake/Active:** visible, responsive, expressive, and ready to interact.  
**Working:** visually communicates thinking, tool use, speaking, or task progress.

A typical interaction is:

1. SAGE is dormant or quietly idle.
2. User interacts with SAGE or invokes a shortcut.
3. SAGE wakes with a short character animation.
4. User speaks or types naturally.
5. SAGE interprets intent and determines whether a response or tool action is appropriate.
6. If an action is sensitive, SAGE requests confirmation.
7. SAGE performs the permitted operation and reports the outcome.
8. SAGE returns to idle and eventually sleeps when attention decays.

## 9. Feature Requirements

### 9.1 Desktop presence

- Frameless, transparent desktop window.
- Character can be positioned without affecting other applications.
- SAGE must not behave as a normal draggable browser image or create files when moved.
- Always-on-top is user-controllable.
- Visibility can be toggled by shortcut.
- Window placement is bounded to the usable display area.

### 9.2 Conversation

- Text conversation is mandatory.
- Natural, ordinary conversation is supported.
- Responses should preserve context when useful.
- Empty or malformed requests must be handled gracefully.
- The system must expose model availability and capability failures clearly.

### 9.3 Memory

- Store useful user-approved facts and conversation context.
- Support retrieval by relevance.
- Bound storage growth.
- Track access/update metadata needed for lifecycle management.
- Allow users to inspect, correct, and delete stored memory.
- Memory must never become an implicit permission to perform actions.

### 9.4 Planning and proactive assistance

- SAGE can organize tasks and prepare plans.
- Proactive events use priority, relevance, and cooldown policies.
- The user can disable or reduce proactive behavior.
- Repeated interruptions must be throttled.

### 9.5 Tools and automation

- Tools use explicit contracts and permission metadata.
- Safe read-only actions may be executed when authorized by policy.
- Sensitive actions require confirmation.
- Restricted capabilities are denied by default.
- Tool execution produces auditable outcomes in the local session context.

### 9.6 Character and expression

- Character runtime supports deterministic, testable state transitions.
- Visual expression communicates attention and emotional tone without pretending SAGE has human feelings.
- Idle breathing, blinking, cursor awareness, wake/sleep transitions, and expression blending are supported by the runtime.
- Animation must not block assistant logic.

### 9.7 Voice

- Voice output is optional and can be disabled.
- Speech rate, pitch, and voice selection are user settings where supported.
- Voice input is a modular integration and must not silently transmit audio externally.

### 9.8 Network and privacy

- Network access is permissioned.
- Offline operation remains meaningful for local capabilities.
- External model/service use must be explicit in product settings or policy.
- Sensitive data must not be sent externally without authorization.

## 10. Security and Trust

SAGE must never treat convenience as permission. Destructive, public, financial, credential-related, privacy-sensitive, or otherwise restricted operations require the appropriate confirmation and policy checks. Failures must be surfaced accurately.

## 11. Accessibility

- Keyboard access for all primary interactions.
- Visible focus states.
- Adequate contrast.
- Reduced-motion option.
- Text alternatives for status communicated only through animation.
- UI must remain usable at supported display scaling levels.

## 12. Performance Targets

- Fast startup after dependency initialization.
- Character animation should remain smooth without monopolizing CPU/GPU.
- UI interactions should feel immediate under normal workload.
- Background polling must be bounded and pausable.
- Memory retrieval must be bounded by configured limits.

## 13. Telemetry

Telemetry is opt-in and privacy-preserving. Diagnostic logs should default to local storage and avoid raw sensitive content. The product must not depend on telemetry to function.

## 14. Release Acceptance Criteria

A production release is acceptable only when:

- Build succeeds from a clean checkout.
- Automated test suite passes.
- Desktop launch succeeds on supported Windows environments.
- SAGE uses the finalized character asset.
- Dragging does not affect files or other windows.
- Double-click/shortcut interaction reliably wakes SAGE.
- Conversation works with configured local/fallback capability.
- Permission checks block restricted actions.
- Memory can be created, retrieved, updated, and deleted.
- Network permission is respected.
- No known release-blocking security or accessibility defects remain.
- Documentation matches the shipped implementation.

## 15. Risks

- Model availability or provider changes.
- Desktop OS/window-manager differences.
- Excessive proactive behavior.
- Privacy leakage through plugins or external models.
- Character asset and animation performance.
- Complexity growth from unrestricted integrations.

## 16. Product North Star

**SAGE should feel like someone useful is quietly there when you need her, and almost invisible when you do not.**
