# SAGE Clean Rebuild Baseline

## Purpose

This branch establishes the clean runtime baseline for the SAGE desktop companion. It replaces fragmented prototype behavior with one coherent desktop flow.

## Runtime contract

1. A clean checkout installs with Node 22+ and Electron 37.10.3.
2. `npm run check` must pass before launch.
3. `npm start` launches a transparent desktop companion using the packaged SAGE character asset.
4. The compact window contains only the character/status surface.
5. Clicking the character wakes SAGE; double-clicking opens an expanded conversation surface.
6. Dragging the character moves the Electron window. It must never invoke browser/image/file drag behavior.
7. Conversation works in three tiers: configured online provider, available local provider, or deterministic local fallback.
8. Closing conversation returns to the compact companion window.
9. Memory and reminders remain local by default.
10. Restricted desktop actions remain allowlisted and permission-aware.

## Definition of success

The application is not considered usable until a clean Windows checkout can launch, show the character, move it safely, open chat without clipping, answer a greeting without a model installed, and recover cleanly when optional providers are unavailable.
