# Change: 在 `editor/edit` 预览区按目标平台严格渲染手机/电脑尺寸比例

## Why
当前 `editor/edit` 的预览区是“填满容器”的布局，手机竖屏（9:16）素材在电脑端预览会被拉伸/裁切，导致用户无法获得所见即所得的构图反馈。

## What Changes
- `editor/edit` 右侧预览区（`VideoPreviewPanel`）新增 **目标平台驱动的严格比例预览框**：
  - **手机**：使用 9:16 的预览框（在可用区域内居中适配，不拉伸）
  - **电脑**：使用 16:9 的预览框（在可用区域内居中适配，不拉伸）
- 预览模式由用户在“上传素材”步骤选择的目标平台（`targetDevice`）决定，并贯通到后续步骤（含 `editor/edit`）。

## Impact
- Affected specs:
  - `openspec/changes/update-editor-preview-aspect-ratio/specs/editor-preview/spec.md`
- Affected code:
  - `app/editor/layout.tsx`（读取目标平台：`targetDevice/deviceConfig`）
  - `app/editor/edit/page.tsx`（将设备配置传入预览区，或在预览区内部读取 context）
  - `components/editor/edit/video-preview-panel.tsx`（实现严格比例的预览内框 + resize 适配）






