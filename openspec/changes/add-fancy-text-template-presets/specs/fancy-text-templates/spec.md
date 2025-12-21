## ADDED Requirements
### Requirement: Fancy Text Template Presets
The system SHALL provide a mechanism to load and apply pre-defined Fancy Text templates that include styling, animation scripts, and sound effects.

#### Scenario: Loading available templates
- **WHEN** the user opens the Fancy Text library
- **THEN** the system displays a list of available templates from the generated registry index
- **AND** filters can distinguish between "Simple" and "Advanced" types

#### Scenario: Applying an Advanced Template
- **WHEN** the user selects an "Advanced" template with animation and sound
- **THEN** the text object updates its style based on `meta.json`
- **AND** the animation system loads the `motion.json` DSL
- **AND** the audio system loads the specified `sfx` file

#### Scenario: Applying a Simple Template
- **WHEN** the user selects a "Simple" template
- **THEN** the text object updates its style
- **AND** the animation is set to static/none
- **AND** no audio is loaded, clearing any previous audio

### Requirement: Motion Script Support
The system SHALL support TypeScript-based Motion Scripts for defining complex text animations.

#### Scenario: Loading Motion Script
- **WHEN** a template with `motion.ts` is loaded
- **THEN** the system dynamically imports or executes the compiled script
- **AND** the script has access to the rendering context to draw frames

### Requirement: Template Validation
The system SHALL validate templates during the build process.

#### Scenario: Invalid Template Build
- **WHEN** a template has a `motion.ts` that does not conform to the expected interface
- **THEN** the build script throws a compilation or type error
- **AND** the template is NOT excluded from the distribution output (Fail safe: stop build)

