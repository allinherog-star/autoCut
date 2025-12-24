## Context
素材库/模板库已定义 `TRANSITION`（转场素材）与 `SCENE`（场景标签维度），但 VEIR 作为渲染 IR 尚未提供足够语义表达“镜头间转场”和“空境片段”的用途。

同时，字幕需要严格对齐（safe-area、换行宽度、底部锚点一致），花字/情绪强调则更自由；两者混用会导致字幕对齐不稳定。

## Goals / Non-Goals
- Goals
  - VEIR 明确表达：**空境用途** 与 **转场规则**，让编辑器与模板系统有可依赖的语义。
  - 渲染侧（ModernComposer）实现最小、可靠的转场集合，并保证字幕稳定对齐。
  - 保持 VEIR 的职责边界：**VEIR 是“已选材/已决策”的渲染 IR**，选材与匹配在 VEIR 生成前完成。
- Non-Goals
  - 不在 VEIR/渲染器中实现“AI 自动选空境素材”的策略与召回。
  - 不在第一期实现复杂转场素材（mp4/json）直渲；这属于素材映射层（TRANSITION → transition preset）。

## Decisions
### Decision 1: 空境用 `Asset.semanticRole` 表达，时间轴仍是 video clip
- **Why**：空境本质仍是视频片段；其“用途”应由模板/AI/素材库识别与替换，不需要新增 clip 类型。
- **约定**（建议）：
  - `semanticRole = 'scene.establishing' | 'scene.cutaway' | 'scene.broll' | 'scene.pause'`
  - 允许结合分类系统：将 `SCENE` 维度标签映射到上述 semanticRole 或扩展字段（如 `tags`）。

### Decision 2: 转场作为“相邻镜头的关系”表达（推荐 `Clip.transitionOut`）
- **Why**：
  - 编辑器 UI 的操作对象是“镜头间的缝”，而非单个 clip 内部样式；
  - `transitionOut` 放在 clip 上实现更简单（不引入全局 transitions 数组的复杂约束），且易于序列化。
- **数据结构**（建议）：
  - `clip.transitionOut?: { type: TransitionType; duration: number; easing?: string }`
  - `TransitionType` 与 `lib/types.ts` 保持一致：fade/dissolve/wipe/slide/zoom/blur

### Decision 3: 渲染实现采用“逻辑转场窗口”而非强制修改 clip time
- **Why**：当前逐帧渲染依赖 clip.time 判断 active；强制改 time 会影响其他系统（音画同步、锚点、微调）。
- **做法**：
  - 在渲染阶段，对存在 transitionOut 的 clip，计算一个 transition window：
    - outgoing: \([end - duration, end]\)
    - incoming: \([next.start, next.start + duration]\)
  - 在该窗口内同时渲染 outgoing/incoming，并按 type 混合 opacity/transform。

### Decision 4: 字幕轨道独立（已落地）+ 轨道级布局约束
- `track.type='subtitle'` + `track.layout`，并在渲染器中强制 Textbox 自动换行与 safe-area 定位。

## Risks / Trade-offs
- 转场同时渲染两段视频会增加每帧对象数量 → 需要在实现中做对象复用与最小重绘。
- Fabric 对视频的 blend/滤镜能力有限 → 第一阶段优先做 opacity/transform 类转场。
- 语义字段（semanticRole/tags）需要与素材库/模板系统达成一致命名 → 建议在一处集中定义映射表。

## Migration Plan
- 新项目直接使用新 schema（不考虑旧数据）。
- 编辑器侧：在插入空境素材时写入 `semanticRole`；添加转场时写入 `transitionOut`。

## Open Questions
- 是否需要在 VEIR 中引入 `Asset.tags?: string[]` 来承载维度标签（EMOTION/SCENE/STYLE…）？
- 是否需要支持“转场素材（mp4/json）”作为可替换资源，并映射到 `transitionOut`？


