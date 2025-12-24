# Change: VEIR 支持空境(Scene/B-roll)与转场(Transition)，并强化字幕/花字分流

## Why
当前 VEIR 的时间轴表达更偏“通用贴图”，难以清晰表达两类剪辑必备能力：
- **空境/过场镜头（Scene / B-roll）**：用于节奏、叙事过渡、遮盖跳切，需要被模板/AI/素材库明确识别与替换，但渲染层不应承担选材逻辑。
- **转场（Transition）**：本质是**相邻镜头的过渡规则**（而非单个 clip 的样式），需要更好的数据语义用于编辑器操作与稳定渲染。

同时，字幕需要稳定对齐（safe-area / baseline / 换行宽度），而花字/情绪强调更自由；两者混用会导致对齐不可控。

## What Changes
- **新增/明确 VEIR 时间轴语义**
  - **空境**：使用 `Asset.semanticRole`（以及可选扩展标签字段）标注 `scene/broll/establishing` 等用途；时间轴仍以 `video` clip 表达，模板/AI 在 VEIR 生成前完成选材与替换。
  - **转场**：引入“镜头间过渡”的一等表达（推荐：`Clip.transitionOut` 或 `Timeline.transitions`），对齐全局 `TransitionType`（fade/dissolve/wipe/slide/zoom/blur）。
- **字幕/花字分流（已在代码中落地）**
  - `track.type = 'subtitle'` + `track.layout`（safe-area/maxWidth/lineHeight/alignment），字幕强制统一定位与换行；花字/强调仍用 `text`。
- **渲染边界清晰化**
  - ModernComposer 负责：字幕布局约束、基础转场效果（fade/dissolve/slide 等）。
  - 模板/AI 负责：空境素材选择、场景标签匹配、转场素材（如 mp4/json）到“转场预设”的映射。

## Impact
- **Affected specs**: 新增 `veir-ir` 能力 spec（目前 `openspec/specs/` 为空，先以 change spec 形式落地）
- **Affected code**
  - `lib/veir/types.ts`、`lib/veir/schemas/timeline.schema.json`（扩展 timeine 表达）
  - `lib/modern-composer/index.ts`、`lib/modern-composer/fabric/index.ts`（字幕布局 + 转场渲染）
  - `lib/veir/example-project.json`、`lib/veir/test-projects/*.json`（示例升级）


