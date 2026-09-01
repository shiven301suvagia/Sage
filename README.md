# SAGE — Your AI Companion

> Half brilliance. Half calm. 100% yours.

SAGE is a Windows desktop AI companion designed to feel present without getting in the way. She is a character-first companion inspired by the balance of JARVIS's capability and FRIDAY's calmness, with her own warm, playful identity.

## Fresh rebuild

The active runtime is intentionally small and deterministic. The product foundation is:

- transparent desktop character
- real bundled SAGE artwork
- safe explicit dragging
- compact presence + expanded chat modes
- normal conversation without requiring an API key
- persistent local memory and conversation history
- persistent reminders + Windows notifications
- optional Ollama/local LLM
- optional OpenAI-compatible LLM
- optional voice input and speech output
- explicit online permission
- allowlisted desktop actions
- keyboard hide/show shortcut

## Run on Windows

Requirements: Node.js 22+.

```bat
npm install
npm run check
npm start
```

Do **not** run `npm audit fix --force` as part of setup.

## How SAGE works

1. SAGE launches as a small transparent desktop companion.
2. Drag the character to move the SAGE window; browser/file dragging is disabled.
3. Double-click SAGE to open the full conversation surface.
4. Type normally. Basic conversation works locally even with no model installed.
5. `Remember that ...` stores local memory.
6. `What do you remember?` reads local memory.
7. `Remind me in 5 minutes to ...` creates a local reminder.
8. The **Offline / Online allowed** control explicitly controls online model access.
9. Optional Ollama or OpenAI-compatible providers upgrade open-ended reasoning.
10. `Ctrl+Shift+S` hides or shows SAGE.

## Optional AI

### Ollama

Install Ollama separately and set an installed model if desired:

```bat
set SAGE_OLLAMA_MODEL=llama3.2:3b
```

SAGE will attempt the local endpoint at `http://127.0.0.1:11434`.

### OpenAI-compatible provider

Set an API key and optionally model/base URL:

```bat
set SAGE_OPENAI_API_KEY=your_key
set SAGE_OPENAI_MODEL=gpt-4o-mini
```

Online access remains opt-in inside SAGE.

## Repository structure

```text
app/
  main.mjs          Electron main process
  preload.mjs       secure renderer bridge
  brain.mjs         conversation, memory, model adapters
  index.html        desktop presence + chat UI

desktop/assets/
  sage-fullbody.webp  bundled finalized character artwork

docs/product/
  PRD.md
  REQUIREMENTS.md
  ARCHITECTURE.md
  UI-UX.md
  DEVELOPMENT-PLAN.md

tests/
  smoke.test.mjs
```

## Product source of truth

The detailed product specifications under `docs/product/` define the intended behavior and release direction. The character documentation defines the visual language: warm gold/cream accents, dark hair, amber eyes, oversized cream hoodie, star/flower motifs, and companion states such as listening, thinking, happy, concerned, excited, focus, and sleep.

## Design principles

**Companion first.** SAGE should feel like a desktop presence, not a website in a window.

**Offline first.** The application must remain useful when no network or model is available.

**User control.** Online access, persistent memory, and desktop actions must be understandable and controllable.

**Safe by default.** The action surface is deliberately allowlisted and can be expanded only through explicit contracts.

**Character driven.** SAGE's personality and visual behavior are part of the product, not decoration.
