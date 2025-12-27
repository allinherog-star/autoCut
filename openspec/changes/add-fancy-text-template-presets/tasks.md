## 0. Prerequisite & Design
- [x] 0.1 Finalize Requirements & Design (Completed in Proposal/Design)
- [x] 0.2 Create OpenSpec Proposal (This file)

## 1. Directory & File Standards
- [x] 1.1 Create Source Directory Structure (`assets/fancy-text-presets/`)
- [x] 1.2 Create Dist Directory Structure (`public/presets/fancy-text/`)
- [x] 1.3 Define Template ID and Versioning conventions

## 2. Schema Definitions (Zod)
- [x] 2.1 Implement `meta.json` Schema (Text defaults, tags, assets, compatibility)
- [x] 2.2 Implement `motion.json` DSL Schema (Version 1)
- [x] 2.3 Implement Error Handling & Validation Logic

## 3. Build & Synchronization System
- [x] 3.1 Create `scripts/build-fancy-text-presets.ts`
- [x] 3.2 Implement `meta.json` and `motion.json` validation in build script
- [x] 3.3 Implement asset existence and size checks
- [x] 3.4 Implement generation of `index.json` registry
- [x] 3.5 Add `pnpm build:presets` to package.json and build pipeline

## 4. Runtime Loading & API
- [x] 4.1 Create `lib/fancy-text-presets/registry.ts` for loading `index.json`
- [x] 4.2 Implement fallback logic (handle missing motion/sfx gracefully)
- [x] 4.3 (Optional) Add API route `app/api/fancy-text-presets/route.ts` if needed for server-side index serving

## 5. Rendering Engine Integration
- [x] 5.1 Implement DSL to Renderer Parameter Converter
- [x] 5.2 Integrate Motion DSL with existing Fancy Text Renderer
- [ ] 5.3 Implement Audio Playback System (WebAudio/HTMLAudio) with cue triggers
- [x] 5.4 Support "None" motion mode for Simple Templates

## 6. UI Implementation
- [ ] 6.1 Update Media Library / Template Panel to display Fancy Text presets
- [ ] 6.2 Implement Hover Preview (throttled/low-fps)
- [ ] 6.3 Implement "Apply Template" action (merge template props with user text)

## 7. Default Content
- [ ] 7.1 Create 2 Simple Templates (Static, no sfx)
- [ ] 7.2 Create 4-8 Advanced Templates (Entrance/Exit, Loops, SFX, Decoration)

## 8. Quality Assurance
- [ ] 8.1 Write Unit Tests for Schemas and DSL Converter
- [ ] 8.2 Verify Build Script fails on invalid data
- [ ] 8.3 Write Documentation (`docs/creating-fancy-text-presets.md`)



















