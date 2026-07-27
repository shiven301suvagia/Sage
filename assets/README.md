# Assets

This directory is reserved for source references and documentation for Sage visual, audio, motion, and brand assets.

Do not commit generated binary assets to this repository. Desktop package artifacts such as `.ico`, `.icns`, generated `.png` files, installers, and compiled bundles should be generated locally or in release automation after cloning the repository.

When application icons are needed, add text-based source instructions here and generate the platform-specific files locally, for example:

- `assets/generated/app.ico` for Windows packaging.
- `assets/generated/app.icns` for macOS packaging.
- `assets/generated/app.png` or size-specific PNG exports for Linux packaging.

Keep only source code, text-based asset manifests, design notes, licensing notes, and placeholder references under version control.
