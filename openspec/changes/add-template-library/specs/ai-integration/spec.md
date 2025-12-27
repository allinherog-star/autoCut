## ADDED Requirements

### Requirement: AI Asset Crawling
The system SHALL allow users to discover and import assets from the web via AI-powered crawling.

#### Scenario: Trigger asset crawl
- **WHEN** user cannot find desired asset in library
- **AND** user clicks "AI Summon" button
- **THEN** the system SHALL display crawl request form
- **AND** form SHALL include: asset type, tags, keyword input

#### Scenario: Execute crawl request
- **WHEN** user submits crawl request with type, tags, and keyword
- **THEN** the system SHALL search web sources for matching assets
- **AND** the system SHALL return preview results without storing
- **AND** results SHALL include previewUrl, sourceUrl, and metadata

#### Scenario: Preview crawled assets
- **WHEN** crawl results are returned
- **THEN** user SHALL be able to preview each result
- **AND** preview SHALL NOT consume storage quota

#### Scenario: Import crawled asset
- **WHEN** user selects a crawled asset and confirms import
- **THEN** the system SHALL download asset from sourceUrl
- **AND** the system SHALL store asset in user's library
- **AND** the system SHALL set source = `AI_CRAWL` and store sourceUrl

#### Scenario: Crawl with no results
- **WHEN** crawl finds no matching assets
- **THEN** the system SHALL display "No results found" message
- **AND** the system SHALL suggest refining search criteria

### Requirement: AI Template Generation
The system SHALL allow users to create templates via natural language prompts.

#### Scenario: Initiate template generation
- **WHEN** user clicks "AI Create Template" button
- **THEN** the system SHALL display template generation form
- **AND** form SHALL include: template type selector, prompt input, optional reference assets

#### Scenario: Generate fancy text template from prompt
- **WHEN** user submits prompt for fancy text template (e.g., "活泼可爱的标题动画，带弹跳效果")
- **THEN** the system SHALL call LLM to generate FancyTextTemplate JSON
- **AND** the system SHALL render preview from generated JSON
- **AND** user SHALL be able to preview animation

#### Scenario: Confirm and save AI template
- **WHEN** user previews AI-generated template and clicks confirm
- **THEN** the system SHALL create template with source = `AI_GENERATED`
- **AND** template SHALL be added to user's template library

#### Scenario: Regenerate template
- **WHEN** user is not satisfied with generated template
- **THEN** user SHALL be able to refine prompt and regenerate
- **AND** previous preview SHALL be replaced with new result

#### Scenario: Generate image/video template
- **WHEN** user requests image or video template generation
- **THEN** the system SHALL call appropriate AI provider (DALL-E, Stability, Runway)
- **AND** the system SHALL download generated media
- **AND** the system SHALL create template with generated media as base

### Requirement: AI Provider Adapter
The system SHALL support multiple AI providers through adapter pattern.

#### Scenario: Register AI providers
- **WHEN** system initializes
- **THEN** the system SHALL register available providers:
  - OpenAI (image generation, text completion)
  - Stability AI (image generation)
  - Runway (video generation)
  - Web Crawler (asset search)

#### Scenario: Provider fallback
- **WHEN** primary provider fails
- **THEN** the system SHALL attempt fallback to secondary provider
- **AND** the system SHALL log provider failure for monitoring

#### Scenario: Provider configuration
- **WHEN** admin configures AI providers
- **THEN** each provider SHALL have: API key, endpoint, rate limits, priority

### Requirement: LLM Fancy Text Script Protocol
The system SHALL define a protocol for LLM to generate fancy text template scripts.

#### Scenario: Script generation prompt
- **WHEN** system requests fancy text script from LLM
- **THEN** the system SHALL provide structured prompt with:
  - Available entrance types: fade, slide_up, slide_down, bounce, typewriter, etc.
  - Available animation types: pulse, shake, glow, bounce
  - Available decoration types: underline, highlight, box
  - Parameter constraints: fontSize 12-200, rotation 0-360, etc.

#### Scenario: Script validation
- **WHEN** LLM returns fancy text script JSON
- **THEN** the system SHALL validate JSON against FancyTextTemplate schema
- **AND** the system SHALL reject invalid scripts with error details

#### Scenario: Script rendering
- **WHEN** valid script is received
- **THEN** the system SHALL render preview using FancyTextRenderer
- **AND** preview SHALL accurately reflect script configuration

### Requirement: AI Integration API
The system SHALL provide REST API for AI features.

#### Scenario: Crawl assets API
- **WHEN** client calls `POST /api/ai/crawl-assets`
- **WITH** body: `{ assetType, tags, keyword, count? }`
- **THEN** the system SHALL return: `{ results: [{ previewUrl, sourceUrl, metadata }] }`

#### Scenario: Import crawled asset API
- **WHEN** client calls `POST /api/ai/import-crawled`
- **WITH** body: `{ previewUrl, sourceUrl, name, tags }`
- **THEN** the system SHALL download and store asset
- **AND** the system SHALL return created asset record

#### Scenario: Generate template API
- **WHEN** client calls `POST /api/ai/generate-template`
- **WITH** body: `{ templateType, prompt, referenceAssetIds? }`
- **THEN** the system SHALL generate template
- **AND** the system SHALL return: `{ previewUrl, templateConfig }`

#### Scenario: Save generated template API
- **WHEN** client calls `POST /api/ai/save-template`
- **WITH** body: `{ templateConfig, name, tags }`
- **THEN** the system SHALL create template record
- **AND** the system SHALL return created template

### Requirement: AI Usage Limits
The system SHALL enforce usage limits for AI features to prevent abuse.

#### Scenario: Crawl rate limiting
- **WHEN** user exceeds crawl request limit (e.g., 10 per hour)
- **THEN** the system SHALL reject request with rate limit error
- **AND** the system SHALL indicate when limit resets

#### Scenario: Generation quota
- **WHEN** user exceeds generation quota (e.g., 20 per day)
- **THEN** the system SHALL reject request with quota exceeded error
- **AND** the system SHALL suggest upgrading plan for more quota

#### Scenario: Track AI usage
- **WHEN** AI feature is used
- **THEN** the system SHALL log usage for billing and analytics
- **AND** the system SHALL track: userId, feature, timestamp, provider, cost
























