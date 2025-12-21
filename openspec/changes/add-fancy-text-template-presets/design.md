## Context
Users need high-quality text effects ("Fancy Text") that include styling, animation, and sound. Currently, we lack a unified structure to define these. We need a system that supports both simple static text and complex animated text with sound, distributable as presets.

## Goals / Non-Goals
- **Goals**:
  - Unified file structure for all fancy text types.
  - Safe, declarative Motion DSL (JSON based).
  - separation of source (dev-friendly) and dist (runtime-optimized).
  - Robust validation during build time.
- **Non-Goals**:
  - Real-time WYSIWYG editor for creating these templates (initially hand-coded JSON is acceptable).
  - Evaluating arbitrary JavaScript for animations.

## Decisions

### 1. Template Classification & Structure
Each template is a directory containing 3 key files. This structure unifies "Simple" and "Advanced" types.

- **Structure**:
  ```
  [template-id]/
  ├── meta.json      # Metadata (Required)
  ├── motion.ts      # Motion Script (Required, can be "export const none = ...")
  └── sfx.mp3        # Audio (Optional)
  ```

- **Classification**:
  - **Advanced**: Contains complex logic in `motion.ts` + `sfx` file.
  - **Simple**: `meta.json` present. `motion.ts` exports a static/none configuration. `sfx` file is absent.

### 2. Motion Script (TypeScript)
We choose TypeScript scripts over JSON DSL to allow for maximum creativity (Canvas API access, complex math, particles).

- **Interface**:
  - The script must default export a function or object conforming to the `FancyTextMotion` interface.
  - Access to `ctx` (CanvasContext) or `element` (DOM) and `progress` (0-1).
  - Lifecycle hooks: `enter`, `loop`, `exit`.
- **Safety**:
  - Since these are system presets, they are trusted code.
  - They are compiled at build time.

### 3. Build & Distribution
- **Source**: `assets/fancy-text-presets/<id>/` (Git tracked)
- **Dist**: `public/presets/fancy-text/<id>/` (Generated JS + Assets)
- **Registry**: `public/presets/fancy-text/index.json` generated at build time.
- **Compilation**: `motion.ts` is compiled to `motion.js` (ESM/SystemJS) during the build step so it can be dynamically imported or fetched at runtime.
## Risks / Trade-offs
- **Risk**: JSON DSL might be too limiting compared to code.
  - **Mitigation**: Start with common properties; extend DSL version later if needed.
- **Risk**: Audio sync issues.
  - **Mitigation**: Use relative time cues in DSL; preload audio for preview.

## Open Questions
- Specific easing function library integration (e.g., matching CSS or generic JS easing).

