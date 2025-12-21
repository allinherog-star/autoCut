# Change: Add Fancy Text Template Presets

## Why
Currently, the system lacks a unified, extensible mechanism for "Fancy Text" templates that support both simple styles and advanced animations with sound effects. We need a standardized way to define, distribute, and load these templates to enhance the video editing experience with high-quality, pre-designed text effects.

## What Changes
- **New Template System**: Introduces a file-based template structure supporting both "Simple" and "Advanced" fancy text.
- **Template Structure**: Each template consists of `meta.json` (metadata), `motion.ts` (animation script), and optional `sfx` (audio) files.
- **Motion Script**: Uses TypeScript files to define animation logic, offering maximum creative freedom compared to a restricted JSON DSL.
- **Build System**: Adds a build step to validate and compile source templates (`assets/`) into a runtime-ready format (`public/presets/`).
- **Loaders & Rendering**: Updates the rendering pipeline to dynamically load and execute template scripts.

## Impact
- **Affected Specs**: `fancy-text-templates` (New Capability)
- **Affected Code**:
  - `lib/fancy-text-presets/`: New logic for loading and registry.
  - `scripts/`: New build scripts to compile TS motions.
  - `components/fancy-text/`: Updates to renderers to support script-based animations.
  - `public/presets/`: New output directory for runtime assets.

