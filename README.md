# SAGE

SAGE is a local-first Windows desktop AI companion. The five documents in `docs/product/` remain the product source of truth.

## Build 001 — Desktop Companion Foundation

The first code layer establishes SAGE as a real desktop presence: transparent always-on-top shell, bounded positioning, safe character dragging, expressive idle/react behavior, compact speech bubbles, expandable chat, local speech output, explicit network permission state, deterministic character lifecycle logic, and persistent local memory foundations.

The implementation keeps presentation, character runtime, assistant core, memory, and policy separated so SAGE can be upgraded without rebuilding her body.

## Run

```powershell
npm install
npm start
```

## Verify

```powershell
npm run check
```

`Ctrl+Shift+S` hides/shows SAGE.
