# SAGE — Your AI Companion

> Half brilliance. Half calm. 100% yours.

SAGE is a local-first Windows desktop AI companion. She lives quietly on the desktop, wakes when needed, converses naturally, remembers what matters, helps with work, and becomes proactive only when useful.

## Clean rebuild baseline

This branch is intentionally treated as a fresh product foundation. The finalized character sheet is the visual source of truth; the application is built around a real desktop runtime rather than a browser-like chat window.

### Product principles

- **Companion first:** SAGE is a living desktop presence, not a web page trapped in a window.
- **Offline first:** basic conversation, memory, reminders, and presence work without internet.
- **Internet by permission:** online models and research tools are opt-in.
- **Safe by design:** desktop actions are allowlisted and consequential actions require confirmation.
- **Character driven:** the character board defines SAGE's appearance, expressions, interactions, and personality.

### Core experience

SAGE starts dormant and unobtrusive. Intentional interaction or configured activity wakes her. She can idle, follow the cursor with her eyes/head, react to clicks, think, speak, sleep, and provide lightweight proactive assistance. Double-clicking expands into a properly sized conversation surface and closing chat returns her to desktop presence.

### Core capabilities

1. Natural conversation with deterministic offline fallback
2. Local persistent memory and conversation history
3. Reminders and desktop notifications
4. Optional Ollama/local LLM
5. Optional OpenAI-compatible provider
6. Explicit online/offline permission
7. Safe desktop tools and confirmations
8. Voice input/output where supported
9. Character states, expressions, and motion
10. Focus and sleep modes

## Clean setup

```bat
npm install
npm run check
npm start
```

Node 22+ is recommended. Electron is pinned for reproducible installations.

## Source of truth

The product specifications live under `docs/product/`. The character board in the connected project materials defines the finalized SAGE visual language: warm gold/cream accents, dark hair, amber eyes, oversized cream hoodie, star/flower motifs, and expressions including Listening, Thinking, Excited, Concerned, and Happy. It also defines interactions including cursor following, click reactions, petting, sitting on windows, Focus Mode, and Sleep Mode.
