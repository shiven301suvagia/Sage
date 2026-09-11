# SAGE Release Checklist

This checklist is the final gate for producing a distributable Windows build.

## 1. Source and dependency integrity

- [ ] Release from the intended `main` commit.
- [ ] `npm run validate:package` passes.
- [ ] `npm run check` passes.
- [ ] `npm audit --omit=dev --audit-level=high` passes.
- [ ] A generated `package-lock.json` is committed before claiming reproducible dependency installation.
- [ ] Once a lockfile exists, CI/release should prefer `npm ci --ignore-scripts` where compatible with Electron packaging.

## 2. Security gate

- [ ] Renderer remains sandboxed with context isolation and Node integration disabled.
- [ ] Privileged IPC handlers authenticate the current renderer sender.
- [ ] Consequential actions remain confirmation-gated.
- [ ] Network-dependent actions remain blocked when network access is disabled.
- [ ] Persisted memory, reminders, and experience state are schema-validated and recoverable.
- [ ] Third-party plugins are not treated as sandboxed unless the plugin isolation architecture has been upgraded.

## 3. Windows build

- [ ] Run the Windows release workflow from a clean checkout/tag.
- [ ] Installer build succeeds.
- [ ] Exactly one non-empty `*Setup*.exe` artifact is produced.
- [ ] SHA-256 checksum is generated beside the installer.
- [ ] Installer and checksum are inspected before publication.
- [ ] Test installation on a clean Windows machine before public distribution.
- [ ] Verify launch, wake, chat, safe actions, denied/confirmed actions, movement, restart, and persistence.

## 4. Signing and publication

- [ ] Configure official Windows code-signing credentials in GitHub Actions secrets/environment before distribution.
- [ ] Verify the published installer signature on a clean Windows machine.
- [ ] Publish the checksum with the installer.
- [ ] Keep the release source commit and artifact version traceable.
- [ ] Do not publish an unsigned build as an official production release.

## 5. Rollback

If a release is found to be unsafe or broken:

1. Stop distribution immediately.
2. Record the affected version and commit.
3. Revert to the last known-good signed release.
4. Preserve the failing artifact/checksum and CI logs for diagnosis.
5. Fix and rerun the complete release gate before publishing again.
