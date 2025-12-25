# Change: VEIR 单一真源（编辑保存 JSON）+ 预览/导出一致（浏览器端 WebCodecs/MediaBunny）+ 本地草稿存储

## Why
当前编辑器的“微调预览”与“导出成片”走的是两套不同的渲染逻辑：编辑页使用 `<video>` + 叠层/本地状态模拟，而导出使用 `VEIRComposer → ModernComposer → MediaBunny(WebCodecs) → MP4`。这会必然导致：
- 用户在编辑页看到的预览与最终导出视频不一致（尤其在：`sourceRange`、`timeWarp`、转场、字幕布局、PIP 定位、滤镜等场景）。
- 微调结果难以可靠保存、回放与再编辑（因为 UI 状态不是稳定的工程文件）。

本变更将 **VEIR JSON 作为唯一权威工程文件（Single Source of Truth）**：所有微调都写回 `VEIRProject`，预览与导出均读取同一份 VEIR，从根本上保证一致性，并为未来“草稿箱/账号同步/云端协作”奠定基础。

## What Changes
- **VEIR 作为单一真源**
  - 编辑器内所有剪辑与微调操作，最终都写回 `VEIRProject.timeline` 与/或 `VEIRProject.adjustments.clipOverrides`。
  - 避免“重建覆盖式”转换导致字段丢失：采用 **delta/patch** 方式将 UI 操作映射到 VEIR。

- **预览/导出一致**
  - 预览改为复用 `ModernComposer` 的帧渲染逻辑（同一套 timeWarp/转场/字幕布局/坐标换算），但不启动编码器。
  - 导出继续使用现有 `VEIRComposer`（浏览器端 WebCodecs/MediaBunny）导出 MP4。

- **本地草稿存储（为未来草稿箱铺垫）**
  - 当前无登录体系，先采用 **IndexedDB（local-first）** 存储 `VEIRProject`：每次“创作会话”生成一个 `draftId` 与对应 `veir.json`。
  - 后续接入账号体系时，可将同一 `draftId` 的存储层由本地扩展为“本地 + 云端同步”，而不改变 VEIR 作为真源的核心原则。

## Impact
- **Affected specs**: 新增 `veir-editing` 能力 spec（当前仓库尚无 `openspec/specs/`，先以 change spec 形式落地）
- **Affected code**
  - 预览/导出一致性：`components/editor/edit/video-preview-panel.tsx`、`lib/modern-composer/*`
  - VEIR 写回：`lib/timeline/veir-converter.ts`、`lib/timeline/store.ts`、编辑页的微调操作
  - 本地草稿：新增 `features/editor-drafts/*`（IndexedDB 封装、autosave、revision/etag）


