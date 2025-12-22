# Fancy Text Presets

This directory contains the source files for Fancy Text Templates.

## Directory Structure

Presets are organized by preset ID directly under this directory. Category information is stored in `meta.json`.

```
assets/fancy-text-presets/
├── {preset-id}/                        # 模版ID目录 (kebab-case)
│   ├── {preset-id}.meta.json           # 必须 - 元数据配置
│   ├── {preset-id}.motion.tsx          # 动效脚本 - React组件 (与scene.ts二选一)
│   ├── {preset-id}.scene.ts            # 动效脚本 - Canvas渲染器 (与motion.tsx二选一)
│   ├── {preset-id}.thumbnail.png       # 推荐 - 预览缩略图
│   └── assets/                         # 可选 - 本地资源目录
│       ├── sfx/                        # 音效文件
│       └── images/                     # 图片资源
└── README.md
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
