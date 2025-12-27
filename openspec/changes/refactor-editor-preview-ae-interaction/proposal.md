# Change: 重构 `editor/edit` 预览区为 AE/PR 级拖拽与变换体验（Fabric 交互层）

## Why
当前 `editor/edit` 的预览区已经具备基础的 WYSIWYG 选框与拖拽能力，但在“专业剪辑”体验上仍存在明显差距：缺少缩放/旋转手柄、缺少更完整的吸附/对齐线体系、交互与渲染职责耦合导致后续扩展（遮罩/裁切/对齐/多选）成本偏高。

本变更旨在将预览区拖拽/变换体验对标 PR/AE：**所见即所拖、拖拽即暂停、吸附明确、反馈柔和、可预测**，同时保持导出一致性（预览 = 导出）。

## What Changes
- 在 `editor/edit` 预览区引入 **Fabric 交互层** 的明确职责边界：
  - **渲染层**：继续由 `ModernComposer.renderFrame()` 绘制“导出同源画面”（视频/文字/字幕/贴纸等）。
  - **交互层**：由 Fabric 负责命中测试、选中态、拖拽/缩放/旋转（含辅助线/吸附），并将变换结果以规范化形式写回 `VEIRProject.adjustments.clipOverrides`.
- 新增 AE/PR 风格交互能力：
  - 选中框 + 控制点（缩放）+ 旋转手柄（可选）
  - 吸附：画面中心线、边缘、三分线、Safe Area（可配置），支持 `Alt/Option` 临时禁用吸附
  - 键盘微调：方向键移动（支持 `Shift` 加速、`Alt` 微调）
  - 拖拽时自动暂停播放，拖拽结束按需恢复
- 保持向后兼容：在不破坏现有 `VideoPreviewPanel` API 的前提下，逐步迁移交互逻辑到 Fabric 交互层。

## Impact
- Affected specs:
  - `openspec/changes/refactor-editor-preview-ae-interaction/specs/editor-preview/spec.md`
- Affected code (expected):
  - `components/editor/edit/video-preview-panel.tsx`
  - `components/editor/edit/veir-canvas-preview.tsx`
  - `lib/modern-composer/fabric/index.ts`
  - `lib/modern-composer/*`（如需暴露更细粒度的 bounds/transform 事件）


