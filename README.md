# Sage

Sage is a desktop AI companion designed for focused, trustworthy assistance. It is inspired by the intelligence of advanced cinematic assistants and the calm professionalism of executive support systems, while maintaining a distinct identity: measured, capable, privacy-aware, and grounded.

The project is organized as a long-term production codebase. Its structure separates product direction, user experience, application surfaces, service logic, data, character design, plugins, assets, automation, and tests so each area can evolve independently without losing architectural clarity.

## Project Goals

- Provide a dependable desktop companion that helps users reason, plan, create, automate, and stay informed.
- Maintain a calm, professional, and human-respecting personality across every interaction surface.
- Support modular integrations through a controlled plugin system.
- Keep local-first privacy and user control as core design principles.
- Build incrementally with testable, observable, and maintainable systems.

## Repository Structure

```text
docs/        Product, architecture, API, design, and operating documentation.
frontend/    Desktop application shell, interface components, visual states, and client orchestration.
backend/     Core services, model orchestration, tools, permissions, and application APIs.
character/   Personality specification, dialogue behavior, tone rules, and interaction patterns.
database/    Schema design, migrations, persistence adapters, and data lifecycle policies.
plugins/     Plugin contracts, manifests, sandbox policies, and integration modules.
assets/      Brand assets, icons, sounds, animation resources, and packaged media.
scripts/     Developer automation for setup, checks, builds, releases, and maintenance.
tests/       Automated test suites, fixtures, integration scenarios, and quality gates.
```

## Development Principles

Sage is built around clear boundaries. The frontend owns presentation and local interaction flow. The backend owns business logic, orchestration, policy enforcement, and integration coordination. The database layer owns durable state and migration safety. Plugins extend capability only through explicit contracts. Character and design documentation are treated as product requirements, not afterthoughts.

## Documentation Index

- [Vision](docs/vision.md)
- [Roadmap](docs/roadmap.md)
- [Architecture](docs/architecture.md)
- [Personality](docs/personality.md)
- [UI Guidelines](docs/ui-guidelines.md)
- [Animation Guide](docs/animation-guide.md)
- [API](docs/api.md)
- [Non-Negotiables](docs/non-negotiables.md)

## License

Sage is released under the MIT License. See [LICENSE](LICENSE) for details.
