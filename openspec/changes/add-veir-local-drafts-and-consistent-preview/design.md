## Context
仓库内已经具备浏览器端导出链路：`VEIRComposer → ModernComposer → MediaBunny(WebCodecs) → MP4`，并且 `ModernComposer` 已实现 `sourceRange`、`timeWarp`、转场窗口、字幕布局等关键渲染逻辑。

当前主要问题在于编辑页预览并未复用该渲染内核，且编辑 UI 的状态并未可靠写回 VEIR JSON，导致：
- 预览与导出必然不一致；
- 微调结果不可稳定回放/重现；
- 难以落地“草稿箱/多端同步/协作”等未来能力。

用户明确约束：
- **导出必须在浏览器端完成**，采用 WebCodecs/MediaBunny；
- 当前**无登录体系**，草稿箱 UI 可后续做，但需要为未来目标预留可扩展数据与边界。

## Goals / Non-Goals
- Goals
  - VEIR JSON 成为编辑工程文件的单一真源（SSoT）。
  - 预览与导出共用同一渲染/时间系统（同一内核、同一语义），保证一致性。
  - 本地草稿存储（IndexedDB）提供“每次创作一个 VEIR JSON”的持久化基础。
- Non-Goals
  - 不在本期实现账号体系/云端草稿箱 UI/跨端同步。
  - 不引入后端渲染（与当前用户约束冲突）。

## Decisions
### Decision 1: VEIR = Single Source of Truth（编辑不再以 UI state 为权威）
- **Why**：确保可复现、可导出、可回放、可迁移；任何时候只要有 VEIR 就能得到一致结果。
- **Rule**：UI 仅维护交互态（hover/dragging/selection），所有“用户可见改动”必须写回 VEIR。

### Decision 2: 结构性编辑与表现微调分层存储
- **结构性编辑**：写入 `VEIRProject.timeline`（如：clip 增删、移动、分割、`sourceRange`、转场 `transitionOut`）
- **表现/微调**：写入 `VEIRProject.adjustments.clipOverrides[clipId]`
  - `video.transform`：位置/缩放/旋转（与渲染坐标转换保持一致）
  - `video.filter`：滤镜
  - `video.motion`：关键帧运动（如需要）
  - `video.timeWarp`：变速（constant/ramp）
  - `audio.timeWarp` / `audio.maintainPitch`：音频对标 PR

### Decision 3: 预览复用 ModernComposer 的帧渲染逻辑（不启动编码器）
- **Why**：一致性的根本解法。预览与导出共享同一渲染路径，避免“双实现漂移”。
- **Approach**：
  - 新增 `VEIRPreviewPlayer`（browser-only）：
    - 内部持有 `ModernComposer`（或其 `FabricEngine`/渲染函数）
    - `requestAnimationFrame` 驱动 `renderFrameFromVEIR(project, time)`
    - 输出到 Canvas（CSS 缩放适配设备外观，但内部分辨率 = `project.meta.resolution`）

### Decision 4: VEIR 写回采用 Patch/Delta，不做“重建覆盖”
- **Why**：现有 `convertTimelineToVEIR()` 会构造新的 `Clip` 对象，容易丢字段（如 `sourceRange`、`transitionOut`、未来扩展字段）。
- **Rule**：
  - UI 操作 → 生成 VEIR Patch（只改动目标字段）
  - 仅在“首次从 VEIR 初始化 UI”时做一次 `VEIR → UI` 转换

### Decision 5: 本地草稿存储使用 IndexedDB + revision
- **Why**：local-first、容量更大、性能稳定、可扩展同步。
- **Data model（本期）**：
  - `draftId: string`
  - `veir: VEIRProject`
  - `revision: number`（单调递增）
  - `createdAt/updatedAt`
  - （可选）`name/thumbnail/duration` 作为列表索引字段（草稿箱 UI 后续使用）

## Architecture
### State Flow（单向数据流）
1. `draftId` → 读取 `VEIRProject`
2. VEIR 初始化时间轴 UI（只初始化一次）
3. 用户操作产生 `UIEvent` → 转换成 `VEIRPatch` → 更新内存中的 VEIR
4. 预览播放器订阅 VEIR 变化并渲染
5. 导出页面读取同一份 VEIR，走 `VEIRComposer.compose({ format:'mp4' })`
6. autosave 将 VEIR 持久化到 IndexedDB（debounce + revision）

## Risks / Trade-offs
- 预览复用 `ModernComposer` 会带来更高 CPU/GPU 消耗 → 需要节流/按需渲染（暂停时只在 seek/变更时渲染一帧）。
- 浏览器端导出对长视频/高分辨率可能耗时且占用内存 → 需要给出 UX 提示与降级策略（例如质量 preset、分段导出后续再议）。
- IndexedDB schema 迁移需要版本化 → 设计 `dbVersion` 与向后兼容读取策略。

## Migration Plan
- 第 1 阶段：落地 VEIR 本地草稿存储 + 编辑写回 VEIR（先不做草稿箱 UI）。
- 第 2 阶段：预览替换为 `VEIRPreviewPlayer`（ModernComposer 渲染），并保留旧预览为 fallback（feature flag）。
- 第 3 阶段：完善一致性验收（抽样时间点帧对比/关键场景回归）。

## Open Questions
- 预览音频是否必须与导出完全一致（timeWarp + maintainPitch + crossfade）？若必须，本期需引入 WebAudio 侧的同构混音。
- 多设备预览（phone/pc）与项目分辨率不一致时，是否允许“仅显示缩放”，还是需要生成不同 resolution 的 VEIR（建议：VEIR resolution 固定，UI 只做缩放展示）。


