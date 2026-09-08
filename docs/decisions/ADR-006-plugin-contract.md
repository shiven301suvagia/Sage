# ADR-006: Versioned plugin contract boundary

**Status:** Accepted
**Scope:** Phase 6 — Integrations and plugins

## Decision

SAGE plugins use a versioned manifest with an explicit identifier, bounded description, declared capabilities, risk class, network requirement, and permission list. Plugin registration validates the manifest before a handler becomes executable.

Plugins are capabilities behind the SAGE policy boundary, not peers of the core application. A plugin never receives renderer privileges or direct access to Electron internals through this contract.

## Security rules

- Manifest version must be supported explicitly.
- Plugin identifiers and capabilities use a restricted naming format.
- Duplicate identifiers are rejected.
- Capability lists and descriptive fields are bounded.
- Unknown or restricted plugin actions are denied by policy.
- Network-dependent plugins remain subject to the global network permission.
- Consequential plugins require confirmation through the existing policy boundary.
- Plugin failures must not terminate the assistant core.

## Next evolution

The registry is intentionally in-process for this stage. Production isolation will move plugin execution behind a separate process/sandbox boundary before third-party plugins are trusted.
