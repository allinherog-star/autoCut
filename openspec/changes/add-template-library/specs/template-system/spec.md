## ADDED Requirements

### Requirement: Template Data Model
The system SHALL support three types of templates: Video Template, Image Template, and Fancy Text Template.

#### Scenario: Create video template
- **WHEN** admin creates a video template
- **THEN** the system SHALL store template with type `VIDEO_TEMPLATE`
- **AND** the template SHALL support replaceable regions for character and background
- **AND** the template SHALL support speed curve configuration with keyframes

#### Scenario: Create image template
- **WHEN** admin creates an image template
- **THEN** the system SHALL store template with type `IMAGE_TEMPLATE`
- **AND** the template SHALL support replaceable regions for character and background
- **AND** each region SHALL define mask and blend mode

#### Scenario: Create fancy text template
- **WHEN** admin creates a fancy text template
- **THEN** the system SHALL store template with type `FANCY_TEXT_TEMPLATE`
- **AND** the template SHALL support global parameters (text, font, color, animation, decoration, sound effect)
- **AND** the template SHALL support per-character parameters (offsetY, offsetZ, scale, rotation, delay)

### Requirement: Template Parameter Protocol
The system SHALL define a standard parameter protocol for all templates, enabling programmatic template rendering.

#### Scenario: Define template parameters
- **WHEN** a template is created
- **THEN** each parameter SHALL have: name, type, label, defaultValue, required flag
- **AND** parameter type SHALL be one of: string, number, boolean, color, asset, enum, array
- **AND** parameters MAY have constraints: min, max, options, pattern, assetType

#### Scenario: Validate parameter input
- **WHEN** user provides parameter values for rendering
- **THEN** the system SHALL validate values against parameter constraints
- **AND** the system SHALL reject invalid values with descriptive error messages

### Requirement: Template CRUD API
The system SHALL provide REST API for template management.

#### Scenario: Create template
- **WHEN** user submits a new template with name, type, parameters, and config
- **THEN** the system SHALL create template record in database
- **AND** the system SHALL return the created template with id

#### Scenario: List templates with filters
- **WHEN** user requests template list with type and tag filters
- **THEN** the system SHALL return paginated list matching filters
- **AND** each template SHALL include id, name, type, thumbnailPath, tags, usageLabels

#### Scenario: Get template detail
- **WHEN** user requests template by id
- **THEN** the system SHALL return full template including parameters definition and config

#### Scenario: Update template
- **WHEN** user updates template parameters or config
- **THEN** the system SHALL update the record
- **AND** the system SHALL return updated template

#### Scenario: Delete template
- **WHEN** user deletes a user-created template
- **THEN** the system SHALL remove the template record
- **AND** the system SHALL NOT delete system preset templates

### Requirement: Template Rendering
The system SHALL render templates with provided parameters to generate assets.

#### Scenario: Render fancy text template
- **WHEN** user calls render API with templateId and parameters (text, color, fontSize, etc.)
- **THEN** the system SHALL generate animated text asset
- **AND** the system SHALL create asset record with sourceTemplateId
- **AND** the system SHALL return asset id and preview URL

#### Scenario: Batch render fancy text
- **WHEN** user calls batch render API with templateId and text array
- **THEN** the system SHALL generate multiple assets with same style
- **AND** the system SHALL return array of asset ids

#### Scenario: Render with invalid parameters
- **WHEN** user calls render with missing required parameters
- **THEN** the system SHALL return validation error
- **AND** the system SHALL NOT create any asset

### Requirement: Fancy Text Rendering Engine
The system SHALL provide a client-side rendering engine for fancy text preview and export.

#### Scenario: Real-time preview
- **WHEN** user adjusts fancy text parameters in editor
- **THEN** the system SHALL render preview in Canvas within 100ms
- **AND** preview SHALL reflect all parameter changes immediately

#### Scenario: Entrance animation rendering
- **WHEN** fancy text has entrance animation configured
- **THEN** the system SHALL support animation types: fade, slide_up, slide_down, slide_left, slide_right, bounce, typewriter, scale, rotate
- **AND** each animation SHALL respect duration, delay, and easing settings

#### Scenario: Per-character animation
- **WHEN** fancy text has per-character parameters enabled
- **THEN** each character SHALL render with individual offsetY, offsetZ, scale, rotation
- **AND** each character SHALL have independent entrance delay

#### Scenario: Export to video
- **WHEN** user confirms fancy text generation
- **THEN** the system SHALL capture Canvas frames at 30fps minimum
- **AND** the system SHALL encode frames to MP4/WebM using WebCodecs
- **AND** the system SHALL fallback to server-side FFmpeg if WebCodecs unavailable

### Requirement: Fancy Text Usage Labels
The system SHALL support usage labels specific to fancy text for categorization.

#### Scenario: Assign usage labels
- **WHEN** user creates or edits fancy text template
- **THEN** user SHALL be able to assign usage labels: TITLE, CHAPTER_TITLE, OPERATION_GUIDE, EMPHASIS, CHARACTER_INTRO
- **AND** usage labels SHALL be stored with template

#### Scenario: Filter by usage labels
- **WHEN** user filters fancy text templates by usage label
- **THEN** the system SHALL return only templates with matching label

### Requirement: Template Source Classification
The system SHALL classify templates by source.

#### Scenario: System preset templates
- **WHEN** system provides preset templates
- **THEN** templates SHALL have source = `SYSTEM`
- **AND** users SHALL NOT be able to delete system templates

#### Scenario: User created templates
- **WHEN** user creates a template
- **THEN** template SHALL have source = `USER`
- **AND** template SHALL be associated with userId

#### Scenario: AI generated templates
- **WHEN** AI generates a template from user prompt
- **THEN** template SHALL have source = `AI_GENERATED`
- **AND** user SHALL be able to save it to their template library

### Requirement: Template Function Call Interface
The system SHALL provide programmatic interfaces for automated template rendering.

#### Scenario: Call renderTemplate function
- **WHEN** system calls `renderTemplate(templateId, params)`
- **THEN** the function SHALL validate parameters
- **AND** the function SHALL render template
- **AND** the function SHALL return generated asset

#### Scenario: Call generateFancyText convenience function
- **WHEN** system calls `generateFancyText(templateId, { text, color?, fontSize?, usageLabel? })`
- **THEN** the function SHALL render fancy text with simplified parameters
- **AND** the function SHALL apply usage-specific defaults

#### Scenario: Call batchGenerateFancyText function
- **WHEN** system calls `batchGenerateFancyText(templateId, ['Step 1', 'Step 2', 'Step 3'], options)`
- **THEN** the function SHALL generate array of assets
- **AND** each asset SHALL have sequential naming








