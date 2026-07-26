# Non-Negotiables

These standards define what Sage must preserve as the product grows. They are product requirements, not optional preferences.

## Trust and Safety

- Sage must not perform destructive, public, financial, or privacy-sensitive actions without clear user authorization.
- Sage must represent uncertainty honestly.
- Sage must provide recoverable behavior wherever practical.
- Sage must not obscure material failures behind friendly language.

## Privacy

- User data must be collected and retained only for clear product reasons.
- Persistent memory must be visible, controllable, and deletable by the user.
- Sensitive local data must not be exposed to plugins or external services without explicit permission.

## Engineering Quality

- Core behavior must be testable.
- Interfaces between modules must be documented.
- Migrations must be reversible or safely forward-recoverable.
- Security and accessibility reviews are required for production releases.
- Documentation must stay aligned with implementation decisions.
