# SAGE

SAGE is a local-first Windows desktop AI companion. The five documents in `docs/product/` remain the product source of truth.

## Current baseline

SAGE currently includes:

- Transparent always-on-top desktop companion with safe bounded dragging.
- Deterministic character lifecycle and expressive idle/interaction states.
- Expandable conversational UI with local fallback behavior.
- Ollama-first local reasoning with an explicit online OpenAI-compatible path.
- Persistent local memory with relevance search, individual deletion, clear-all, and JSON export.
- Persistent network, proactive-help, and voice preferences.
- Permission-gated voice input and local speech output.
- Persistent local reminders and native desktop notifications.
- Safe tool registry with default-deny network policy and explicit confirmation for consequential actions.
- No arbitrary shell or command execution exposed to the assistant.
- Birthday-driven experience tracking and proactive companion behavior.

## Run

```powershell
npm install
npm start
```

## Verify

```powershell
npm run check
```

The quality workflow also validates the project on a Windows runner.

`Ctrl+Shift+S` hides/shows SAGE.

## Privacy and safety

SAGE is offline by default. Local memory, reminders, preferences, and experience data are stored under Electron's local application data directory. Online model access and voice input are separately gated by explicit settings.

The desktop renderer runs with context isolation, sandboxing, a restrictive content security policy, blocked popup navigation, and no Node.js integration.

## Development

See `docs/product/DEVELOPMENT-PLAN.md` for the phased roadmap and release gates. Production packaging, signing, accessibility validation, dependency hardening, and final character binary asset delivery remain release-hardening work rather than being represented as complete in this baseline.
