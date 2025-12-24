## 1. Implementation
- [ ] 1.1 定义 VEIR 的空境语义：明确 `Asset.semanticRole` 约定（scene/broll/establishing/transition 等），补充示例数据
- [ ] 1.2 定义 VEIR 的转场语义：选择 `Clip.transitionOut` 或 `Timeline.transitions`，并与 `lib/types.ts` 的 `TransitionType` 对齐
- [ ] 1.3 扩展 VEIR JSON Schema：新增转场字段校验、约束 duration/easing/type 等
- [ ] 1.4 ModernComposer 支持转场渲染（最小集合：fade/dissolve/slide），并保持与现有逐帧渲染模型兼容
- [ ] 1.5 更新编辑器/模板侧的映射策略（TRANSITION/SCENE 标签 → VEIR semanticRole / transition preset）
- [ ] 1.6 更新 `example-project.json` 与 `test-projects` 覆盖：空境片段、带转场的相邻镜头、字幕轨道布局一致性
- [ ] 1.7 校验：AJV schema 校验通过；关键场景可视化回归（字幕对齐不漂、转场正确过渡）


