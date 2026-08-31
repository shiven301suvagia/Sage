# SAGE Release Checklist

## Pre-release
- Run `npm run check`.
- Review security policy and permissions.
- Confirm voice, proactive behavior, memory, tools, and character runtime are wired to their intended boundaries.
- Review generated release contents before distribution.

## Package
- Run `npm run package`.
- Verify `release/VERSION` matches `package.json`.
- Distribute only the generated release bundle.

## Post-release
- Record the release version and commit SHA.
- Keep user data and credentials outside the release bundle.
- Roll back to the previous known-good release if a regression is discovered.
