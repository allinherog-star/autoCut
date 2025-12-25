## 1. Implementation
- [ ] 1.1 设计并实现本地草稿存储（IndexedDB）：`draftId`、`veir`、`revision`、`createdAt/updatedAt`
- [ ] 1.2 编辑器路由与上下文调整：支持以 `draftId` 打开编辑/导出（例如 `/editor/[draftId]/edit`、`/editor/[draftId]/export`）
- [ ] 1.3 UI 操作 → VEIR Patch：将时间轴编辑（trim/split/move）与微调（位置/缩放/滤镜/变速）写回 `VEIRProject`
- [ ] 1.4 防抖 autosave：VEIR 变更后自动持久化到 IndexedDB，并维护 `revision` 单调递增
- [ ] 1.5 预览一致性：新增 `VEIRPreviewPlayer`，复用 `ModernComposer` 的帧渲染逻辑（不启动编码器）
- [ ] 1.6 导出一致性：导出页面仅读取 VEIR（来自 draft），并使用 `VEIRComposer` 导出 MP4（WebCodecs/MediaBunny）
- [ ] 1.7 验收用例：覆盖 `sourceRange`、`timeWarp`、转场、字幕布局、PIP 定位、滤镜；对比“预览 vs 导出”一致


