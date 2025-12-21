# Fancy Text Presets

This directory contains the source files for Fancy Text Templates.

## Directory Structure

Presets are organized by category and then by preset ID:

```
assets/fancy-text-presets/
├── {category}/              # e.g., emotions, variety, vlog
│   ├── {preset-id}/         # e.g., anger-01, happy-burst
│   │   ├── meta.json        # Metadata (id, name, version, defaults)
│   │   ├── motion.json      # Motion DSL definition
│   │   ├── thumbnail.png    # Preview image (optional but recommended)
│   │   └── assets/          # Local assets for this preset (images/audio)
```

## Conventions

### Preset ID
- **Format:** `kebab-case`
- **Pattern:** `^[a-z0-9]+(-[a-z0-9]+)*$`
- **Uniqueness:** Must be unique within the entire system (not just category).
- **Example:** `hilarious-burst`, `sad-rain-01`

### Versioning
- **Format:** Semantic Versioning (`Major.Minor.Patch`)
- **Field:** `version` in `meta.json`
- **Rules:**
    - Increment Patch for bug fixes or asset tweaks.
    - Increment Minor for backward-compatible motion changes.
    - Increment Major for breaking changes (e.g., DSL v2 requirement).

### meta.json Schema
```json
{
  "id": "hilarious-burst",
  "name": "Hilarious Burst",
  "version": "1.0.0",
  "tags": ["funny", "explosion"],
  "compatibility": {
    "engine": "^1.0.0"
  },
  "defaults": {
    "text": "BOOM!"
  }
}
```
