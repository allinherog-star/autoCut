## ADDED Requirements

### Requirement: Media Upload
The system SHALL allow users to upload media files (videos and images) to the server.

#### Scenario: Successful video upload
- **WHEN** user selects a video file and submits the upload
- **THEN** the system SHALL store the file on the server
- **AND** the system SHALL create a media record in the database
- **AND** the system SHALL return the media metadata including id, name, type, and path

#### Scenario: Successful image upload
- **WHEN** user selects an image file and submits the upload
- **THEN** the system SHALL store the file on the server
- **AND** the system SHALL create a media record in the database

#### Scenario: Unsupported file type
- **WHEN** user attempts to upload a file with unsupported type
- **THEN** the system SHALL reject the upload
- **AND** the system SHALL return an error message indicating supported formats

### Requirement: Media Library Listing
The system SHALL provide a listing of all uploaded media files.

#### Scenario: List all media
- **WHEN** user requests the media library
- **THEN** the system SHALL return a paginated list of media records
- **AND** each record SHALL include id, name, type, size, thumbnailPath, and createdAt

#### Scenario: Filter by type
- **WHEN** user filters media by type (video/image)
- **THEN** the system SHALL return only media matching the specified type

#### Scenario: Search by name
- **WHEN** user searches media by name
- **THEN** the system SHALL return media whose names contain the search term

### Requirement: Media Deletion
The system SHALL allow users to delete media from the library.

#### Scenario: Delete single media
- **WHEN** user requests to delete a media item
- **THEN** the system SHALL remove the file from storage
- **AND** the system SHALL delete the media record from database
- **AND** the system SHALL return a success confirmation

#### Scenario: Delete non-existent media
- **WHEN** user attempts to delete a media that does not exist
- **THEN** the system SHALL return a 404 error

### Requirement: Media Update
The system SHALL allow users to update media metadata.

#### Scenario: Rename media
- **WHEN** user provides a new name for a media item
- **THEN** the system SHALL update the media name in the database
- **AND** the system SHALL return the updated media record

### Requirement: Media Library Panel
The system SHALL provide a visual panel for browsing uploaded media.

#### Scenario: Display media grid
- **WHEN** user opens the media library panel
- **THEN** the system SHALL display media as a grid of thumbnails
- **AND** video media SHALL show a play icon overlay
- **AND** each item SHALL show name and file size

#### Scenario: Select media for project
- **WHEN** user clicks on a media item in the library
- **THEN** the system SHALL add the media to the current project
- **AND** the media SHALL appear in the project media list

### Requirement: File Storage
The system SHALL store uploaded files in a structured directory.

#### Scenario: Local storage structure
- **WHEN** a file is uploaded
- **THEN** videos SHALL be stored in `public/uploads/videos/`
- **AND** images SHALL be stored in `public/uploads/images/`
- **AND** filenames SHALL be UUIDs with original extension preserved









