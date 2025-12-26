## 1. Implementation
- [ ] 1.1 定义 `timeUs` 时间基准与 Render Plan TypeScript 类型（不破坏 VEIR v1.0）
- [ ] 1.2 实现 `compileVEIRToRenderPlan(project)`：归一化轨道、计算转场窗口、生成音频图拓扑
- [ ] 1.3 实现 Timeline Evaluator：按帧输出“画面指令”，按 chunk 输出“音频 PCM”
- [ ] 1.4 音频引擎 v1：clip/track/bus gain、fade/crossfade、pan、ducking（简化 envelope）、master limiter
- [ ] 1.5 TimeStretch 插件接口（Worker/WASM）+ 熔断回退（保证不爆噪、时间一致）
- [ ] 1.6 引入 WASM time-stretch 实现（音质优先）：加载/初始化/参数协议/性能档位（SAB 可选）
- [ ] 1.7 导出器：WebCodecs + MediaBunny，音频恒定参数与 gap padding
- [ ] 1.7 预览播放器：复用 Render Plan（画面 + 音频），确保与导出一致
- [ ] 1.8 新增导出诊断（peak/rms/non-finite/重采样次数/熔断次数），可开关
- [ ] 1.9 更新 VEIR schema（新增/扩展 audioMixer、bus、automation），并提供迁移默认值
- [ ] 1.10 测试：render-plan 快照测试、音画同步测试（黄金用例）、长时间轴 drift 测试、WASM 回退路径测试


