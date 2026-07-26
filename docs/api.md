# API

Sage APIs define the contracts between the desktop frontend, backend services, persistence layer, and plugins. APIs should be versioned, documented, and designed for clear failure handling.

## Internal API Principles

- Use explicit request and response schemas.
- Return structured errors with actionable messages.
- Include correlation identifiers for tracing user-visible operations.
- Separate read, write, and destructive operations.
- Require permission context for tool and plugin actions.

## Initial Domains

### Conversation

Handles user messages, assistant responses, streaming updates, attachments, citations, and response metadata.

### Tasks

Tracks long-running operations, progress, cancellation, retries, and final outcomes.

### Memory

Manages user-approved durable context, retention policies, search, updates, and deletion.

### Plugins

Handles discovery, installation, permission grants, execution, health checks, and compatibility.

### Settings

Stores user preferences, privacy configuration, accessibility settings, and application behavior controls.

## Compatibility

Breaking API changes should be intentional, documented, and paired with migrations or compatibility layers when persistent user data or plugins are affected.
