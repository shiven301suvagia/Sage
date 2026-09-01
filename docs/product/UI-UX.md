# SAGE - UI/UX Specification

**Version:** 1.0  
**Status:** Final baseline

## 1. Experience Goal

SAGE should feel present without feeling like an application window pasted on top of the desktop. The character is the primary visual anchor; controls appear when needed and retreat when not needed.

## 2. Personality in UI

SAGE is calm, intelligent, warm, concise, and lightly playful. She should not use exaggerated assistant clichés or imply human emotions as facts. Errors should be direct and helpful.

## 3. Visual Language

- Dark neutral desktop surfaces with warm gold accenting.
- Soft glow used to communicate active attention, not decoration everywhere.
- Rounded panels with restrained borders.
- High legibility typography.
- Character remains visually dominant over controls.
- Transparency should preserve desktop context without reducing readability.

## 4. Character Presentation

The finalized SAGE CG character is the canonical desktop representation. It should be rendered as a transparent asset with no background panel.

Recommended presentation states:

| State | Character treatment | UI status |
|---|---|---|
| Dormant | hidden/minimal | none |
| Awakening | fade + subtle scale/glow | Awakening |
| Idle | low-intensity breathing/blink | Idle |
| Thinking | attentive expression + subtle motion | Thinking |
| Speaking | active expression/voice cue | Speaking |
| Concerned | concerned expression | Needs attention |
| Excited | brighter expression/motion | Ready/Success |
| Sleep | reduced opacity/rest posture | Sleeping |

## 5. Primary Interaction Model

### Wake
- Global shortcut.
- Direct character interaction.
- Future optional voice wake mode, subject to explicit privacy settings.

### Open conversation
- Double-click character.
- Keyboard activation.
- Shortcut.

### Move
- Press and drag the character body.
- Movement must manipulate the Electron window position only.
- Native image drag behavior is prohibited.
- Movement is clamped to the usable desktop area.

### Converse
Conversation panel contains:

- text input;
- send action;
- optional microphone control;
- response/status area;
- close control.

### Action confirmation
For consequential actions, show a compact confirmation card:

**What SAGE will do**  
**Why it needs permission**  
**[Cancel] [Allow once]**

Avoid dark patterns, preselected dangerous actions, or ambiguous confirmation labels.

## 6. Status Communication

Status must be visible without requiring the user to infer it from animation. Suggested labels:

- Idle
- Awakening
- Thinking
- Working
- Speaking
- Needs confirmation
- Offline
- Online allowed
- Error

## 7. Conversation UX

Natural conversation should look and feel like talking to a helpful companion. Users should not need command syntax.

Example:

> User: "I'm stuck on this design. Can I talk it through with you?"
>
> SAGE: responds conversationally without opening a tool workflow.

For tasks:

> User: "Remind me tomorrow at 11 to submit the form."
>
> SAGE: confirms the scheduled reminder and communicates any required permission.

## 8. Proactive UX

Proactive messages should be sparse and context-sensitive. Use cooldowns and priority. A proactive card must provide an obvious dismiss action and should not steal focus for routine events.

## 9. Motion

Motion should be soft and purposeful. Avoid continuous high-frequency animation when idle. Respect reduced-motion settings.

## 10. Accessibility

- Full keyboard path for conversation and settings.
- Visible focus indicators.
- Text status equivalents for character-only cues.
- Sufficient contrast.
- Reduced-motion mode.
- Screen-reader labels for icon-only controls.
- No essential interaction dependent on precise cursor tracking.

## 11. Window Behavior

The desktop window should:

- be transparent and frameless;
- stay above other windows only when the user chooses;
- not appear in the taskbar when configured as a companion surface;
- preserve position across normal sessions where appropriate;
- never intercept clicks outside the interactive character/control region unless intentionally enabled;
- never cause file drops or other unintended OS actions during drag.

## 12. Responsive Desktop Layout

The character scale should adapt to available screen space while maintaining a consistent minimum readable size. Conversation controls should be sized for mouse and keyboard use.

## 13. UX Error States

Every error should answer three questions:

1. What happened?
2. Can SAGE continue?
3. What can the user do next?

Example: "I could not reach the online model. SAGE is still available in offline mode. Check Network Access in Settings or try again later."

## 14. UX Quality Bar

The product is not considered polished if users can accidentally drag files, close unrelated windows, lose interaction because of click-through state, mistake an offline state for a working assistant, or trigger a consequential action without understanding what will happen.
