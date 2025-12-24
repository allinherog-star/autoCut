## ADDED Requirements

### Requirement: Subtitle Track Layout Isolation
The system SHALL represent subtitles on a dedicated timeline track type so that subtitle layout is stable and independent from fancy/emphasis text.

#### Scenario: Subtitle track enforces consistent alignment
- **WHEN** a track is declared with `type = "subtitle"`
- **THEN** the track SHALL support a `layout` object to define safe-area, max width and line height
- **AND** all subtitle clips on this track SHALL render using the same layout constraints

### Requirement: Scene / B-roll Semantic Role
The system SHALL support marking assets as scene/b-roll so that templates and AI can recognize and replace them before rendering.

#### Scenario: Mark a clip as establishing shot via asset semantic role
- **WHEN** an asset used for a filler/transition shot is added
- **THEN** the asset SHOULD include `semanticRole` such as `scene.establishing` or `scene.broll`
- **AND** the clip SHALL remain a normal `video` clip for rendering purposes

### Requirement: Transition Between Adjacent Clips
The system SHALL support expressing a transition between adjacent video clips using a compact, serializable structure.

#### Scenario: Define an outgoing transition on a clip
- **WHEN** a clip is followed by another clip on the same video track
- **THEN** the clip MAY define `transitionOut` with `{ type, duration, easing }`
- **AND** the transition type SHALL be one of: `fade`, `dissolve`, `wipe`, `slide`, `zoom`, `blur`

#### Scenario: Renderer applies transition over a logical window
- **WHEN** `transitionOut` is present
- **THEN** the renderer SHALL apply the transition over the computed time window without mutating the original clip `time` ranges


