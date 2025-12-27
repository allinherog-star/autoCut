## Context
`editor/edit` 的预览区需要“预览 = 导出”的一致性，因此画面渲染复用 `ModernComposer.renderFrame()`。与此同时，专业编辑体验要求高质量交互：命中测试准确、拖拽/变换稳定、吸附/对齐线清晰、键盘微调可预测，并且交互结果必须可序列化、可回放、可导出。

当前实现已经具备：
- Canvas 渲染：`VEIRCanvasPreview` 以 `project.meta.resolution` 作为真实画布尺寸渲染帧
- 基础交互：`ModernComposer(interactive=true)` 通过 Fabric 事件回传拖拽位置（百分比）
- WYSIWYG 选框：按每帧 bounds 回传给 UI 层绘制选中框

但缺少：
- 变换控件（缩放/旋转）与更系统的吸附/对齐线
- 更明确的“渲染层 vs 交互层”职责边界，避免 UI 层重复计算坐标/包围盒

## Goals / Non-Goals
- Goals:
  - 提供对标 PR/AE 的基础交互：选中/拖拽/缩放/旋转 + 辅助线/吸附 + 键盘微调
  - 交互结果统一写回 `VEIRProject.adjustments.clipOverrides`（offset/scale/rotation）
  - 性能可控：拖拽/播放过程中避免 React 频繁重渲染，采用 RAF 与最小状态更新
- Non-Goals:
  - 复杂多选与对齐分布（后续迭代）
  - 关键帧动画编辑（后续迭代）

## Decisions
### Decision: 采用“渲染层(ModernComposer) + 交互层(Fabric)”双层架构
- **渲染层**负责画面：视频帧、文字、字幕、贴纸等——以 Content Space 像素渲染，保证与导出一致
- **交互层**负责操作：命中/选择、控制点变换、吸附/对齐线——同样工作在 Content Space，避免坐标系转换误差
- UI 层（React）只负责“壳”：工具栏、播放控制、以及将 Fabric/Composer 的状态以最小代价呈现（例如：选中 clipId、辅助线显示状态）

### Decision: 统一坐标系与持久化协议
- 交互层输出统一为 `TransformPatch`：
  - `offset`: Content Space 像素坐标（中心点或指定 origin）
  - `scale`: 归一化倍率（例如 1 = 100%）
  - `rotation`: 角度（度）
- 写回 `VEIRProject.adjustments.clipOverrides[clipId].video.transform`，确保“预览 = 导出”

### Decision: 吸附/对齐线实现策略
- 吸附目标集合：
  - 画面中心线（50%/50%）
  - 画面边缘（0%/100%）
  - 三分线（33.33%/66.67%）
  - Safe Area（由 UniversalPreview 或配置提供）
- 吸附阈值以 Content Space 像素为基准（随着缩放保持一致体感）
- `Alt/Option` 临时禁用吸附

## Risks / Trade-offs
- Fabric 控件自定义与浏览器差异：
  - Mitigation: 先实现默认控制点 + 轻量定制（颜色/大小/鼠标样式），复杂外观后置
- 拖拽/播放并发导致掉帧：
  - Mitigation: `VEIRCanvasPreview` 保持“最多 1 个 renderFrame in-flight + 丢帧策略”；拖拽期间自动暂停播放

## Migration Plan
1. 保留现有 `VideoPreviewPanel` API，先在 Fabric 引擎开启控件与 transform 回写（不影响旧路径）
2. 将吸附/对齐线逻辑从 UI 层逐步下沉到 Fabric 交互层（或由 ModernComposer 暴露 hook）
3. 稳定后再扩展多选/分布/裁切等高级能力


