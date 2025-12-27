## 1. Implementation
- [ ] 1.1 在 `openspec/changes/refactor-editor-preview-ae-interaction/specs/editor-preview/spec.md` 补齐需求与验收场景（拖拽/缩放/旋转/吸附/键盘微调）
- [ ] 1.2 明确预览区分层：`VideoPreviewPanel` 作为组合容器；`VEIRCanvasPreview` 负责渲染；Fabric 负责交互（命中/变换/辅助线）
- [ ] 1.3 在 `lib/modern-composer/fabric` 增强交互能力：启用缩放/旋转控件、对齐/吸附策略、事件回写（transform patch）
- [ ] 1.4 将 Fabric 交互产生的 transform 统一映射为 `VEIRProject.adjustments.clipOverrides[clipId].video.transform`（offset/scale/rotation），保证预览=导出
- [ ] 1.5 回归：拖拽中暂停播放、拖拽结束恢复；`Alt/Option` 禁用吸附；方向键微调稳定；选中框与实际渲染 bounds 一致

## 2. Validation
- [ ] 2.1 `npx --yes openspec validate refactor-editor-preview-ae-interaction --strict` 通过






