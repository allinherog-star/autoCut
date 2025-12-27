## 1. Implementation
- [ ] 1.1 在 `openspec/changes/update-editor-preview-aspect-ratio/specs/editor-preview/spec.md` 补齐需求与验收场景
- [ ] 1.2 在 `VideoPreviewPanel` 增加“严格比例预览内框”（按容器可用空间计算宽高，保证 phone=9:16 / pc=16:9）
- [ ] 1.3 将 `targetDevice/deviceConfig` 接入 `VideoPreviewPanel`（从 `useEditor()` 读取或从 `editor/edit/page.tsx` 透传）
- [ ] 1.4 回归验证：切换目标平台后预览框比例即时变化，拖拽坐标计算基于“内框”尺寸而非外层容器

## 2. Validation
- [ ] 2.1 `npx --yes openspec validate update-editor-preview-aspect-ratio --strict` 通过










