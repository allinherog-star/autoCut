## ADDED Requirements

### Requirement: Asset Source Classification
The system SHALL classify assets by their source origin.

#### Scenario: System preset assets
- **WHEN** system provides preset assets
- **THEN** assets SHALL have source = `SYSTEM`
- **AND** assets SHALL be available to all users

#### Scenario: User uploaded assets
- **WHEN** user uploads an asset
- **THEN** asset SHALL have source = `USER`
- **AND** asset SHALL be associated with userId

#### Scenario: Template-generated assets
- **WHEN** asset is generated from template
- **THEN** asset SHALL have sourceTemplateId referencing the template
- **AND** asset SHALL inherit tags from template

#### Scenario: AI crawled assets
- **WHEN** asset is imported from AI crawl
- **THEN** asset SHALL have source = `AI_CRAWL`
- **AND** asset SHALL store original sourceUrl for attribution

### Requirement: Asset Preview Interactions
The system SHALL provide rich preview interactions for asset browsing.

#### Scenario: First frame thumbnail
- **WHEN** video or animated asset is uploaded
- **THEN** the system SHALL extract first frame as thumbnail
- **AND** thumbnail SHALL be stored in thumbnailPath

#### Scenario: Hover preview
- **WHEN** user hovers over video/animation asset for 500ms
- **THEN** the system SHALL start playing preview
- **AND** preview SHALL loop until hover ends

#### Scenario: Click to enlarge
- **WHEN** user clicks on asset
- **THEN** the system SHALL open full-screen preview modal
- **AND** modal SHALL show asset at original resolution
- **AND** modal SHALL include asset metadata (name, size, duration)

### Requirement: User Favorites
The system SHALL allow users to favorite assets and templates.

#### Scenario: Add asset to favorites
- **WHEN** user clicks favorite button on asset
- **THEN** the system SHALL create UserFavorite record
- **AND** the system SHALL increment asset favoriteCount

#### Scenario: Remove asset from favorites
- **WHEN** user clicks unfavorite button on favorited asset
- **THEN** the system SHALL delete UserFavorite record
- **AND** the system SHALL decrement asset favoriteCount

#### Scenario: List user favorites
- **WHEN** user requests favorites list
- **THEN** the system SHALL return all favorited assets and templates
- **AND** results SHALL be ordered by favorited time descending

### Requirement: Asset Library Tab Structure
The system SHALL provide filtered views of asset library.

#### Scenario: All assets tab
- **WHEN** user selects "All Assets" tab
- **THEN** the system SHALL display all accessible assets
- **AND** results SHALL include system and user assets

#### Scenario: System assets tab
- **WHEN** user selects "System Assets" tab
- **THEN** the system SHALL display only assets with source = `SYSTEM`

#### Scenario: My assets tab
- **WHEN** user selects "My Assets" tab
- **THEN** the system SHALL display only assets with source = `USER` belonging to current user

#### Scenario: My favorites tab
- **WHEN** user selects "My Favorites" tab
- **THEN** the system SHALL display only user's favorited assets

### Requirement: Sticker Pack Management
The system SHALL support sticker pack organization for emoji/sticker assets.

#### Scenario: Create sticker pack
- **WHEN** user creates a sticker pack with name
- **THEN** the system SHALL create StickerPack record
- **AND** pack SHALL be associated with userId if user-created

#### Scenario: Add stickers to pack
- **WHEN** user uploads stickers to a pack
- **THEN** the system SHALL create Sticker records linked to pack
- **AND** each sticker SHALL extract keywords from filename

#### Scenario: Batch import sticker pack
- **WHEN** user uploads a folder of images
- **THEN** the system SHALL create StickerPack
- **AND** the system SHALL create Sticker for each image
- **AND** the system SHALL auto-generate keywords from filenames

#### Scenario: Search stickers by keyword
- **WHEN** user searches stickers with keyword
- **THEN** the system SHALL return stickers matching keyword
- **AND** search SHALL be case-insensitive and partial match

#### Scenario: System preset sticker packs
- **WHEN** system provides preset sticker packs
- **THEN** packs SHALL have source = `SYSTEM`
- **AND** users SHALL NOT be able to modify system packs

### Requirement: Usage Labels for Fancy Text Assets
The system SHALL support usage-specific labels for fancy text categorization.

#### Scenario: Define usage labels
- **WHEN** system initializes
- **THEN** the system SHALL provide predefined usage labels:
  - `TITLE` - 标题
  - `CHAPTER_TITLE` - 章节步骤标题
  - `OPERATION_GUIDE` - 操作指引
  - `EMPHASIS` - 强调特写
  - `CHARACTER_INTRO` - 人物介绍

#### Scenario: Assign usage labels to fancy text
- **WHEN** fancy text asset or template is created
- **THEN** user SHALL be able to assign one or more usage labels
- **AND** labels SHALL be stored in usageLabels array

#### Scenario: Filter by usage labels
- **WHEN** user filters fancy text by usage label
- **THEN** the system SHALL return assets/templates with matching label

### Requirement: Enhanced Tag System
The system SHALL support multi-dimensional tagging for assets and templates.

#### Scenario: Tag dimensions
- **WHEN** system provides tag categories
- **THEN** the system SHALL support dimensions:
  - EMOTION (情绪): happy, sad, excited, calm
  - INDUSTRY (行业): food, travel, tech, education
  - STYLE (风格): minimal, retro, anime, business
  - SCENE (场景): opening, ending, transition, climax
  - PLATFORM (平台): douyin, bilibili, xiaohongshu, weixin
  - TEMPO (节奏): fast, slow, gradual
  - USAGE (用途): title, chapter, guide, emphasis

#### Scenario: Multi-dimensional filtering
- **WHEN** user applies filters from multiple dimensions
- **THEN** the system SHALL return assets matching ALL selected tags (AND logic)

#### Scenario: Mandatory tagging
- **WHEN** asset or template is created
- **THEN** the system SHALL require at least one tag
- **AND** the system SHALL suggest tags based on content analysis














