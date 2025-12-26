## Context
目标是把 `lib/veir/` 升级为“专业级剪辑引擎”的内核，满足：
- 预览与导出在**画面/时间/音频**三维一致（单一真源、单一评估内核）
- 音频链路稳定可控：不引入爆噪、漂移、失真；具备母带与调试能力
- 允许功能逐步增强（TimeStretch / effects），但必须有明确降级与一致性策略
 - **约束**：导出与预览 100% 浏览器端完成，不使用服务端渲染兜底

## Goals / Non-Goals
- Goals
  - 统一时间基准（整数 timebase）
  - 统一评估器（Timeline Evaluator）输出 Render Plan
  - 专业级音频：clip/track/bus、automation、crossfade、ducking、limiter/normalize
  - 导出：WebCodecs + MediaBunny，音频参数恒定与可校验
  - 可观测：导出时可输出统计与诊断
- Non-Goals
  - 不承诺一次性实现完整 PR/AE 的全部效果器生态（以插件方式扩展）
  - 不引入后端渲染兜底（本 change 明确要求 100% 浏览器端）

## Decisions
### Decision: Timebase 采用整数微秒（timeUs）
- **Why**：浮点秒在长时间轴/多次映射/变速下会造成累计误差；微秒是 WebCodecs timestamp 的天然单位（µs）。
- **How**：IR 层统一以 `timeUs: number` 表示时间；视频帧采样使用 \(t = frameIndex * 1e6 / fps\) 取整；音频采样使用 sampleIndex 与 sampleRate 映射到 µs。

### Decision: Render Plan（编译产物）作为唯一可执行渲染输入
- **Why**：避免导出与预览分叉实现；把“解析/校验/归一化/排序/窗口计算”前置到 compile 阶段。
- **How**：`compileVEIR(project) -> RenderPlan`，内部做：
  - clip 实例化与 track/bus 归一化
  - 转场窗口与 crossfade 窗口计算（不改变原 timeRange）
  - audio graph 拓扑（buses、sends、sidechain）
  - 生成确定性的采样策略（frame/time grid）

### Decision: 音频引擎分三层（Clip → Track/Bus → Master）
- Clip layer：sourceRange、timeWarp、gain automation、fade in/out、pan
- Track/Bus layer：gain、mute/solo、sends、ducking（sidechain envelope）
- Master layer：peak normalize（可选）、limiter（必选）、输出对齐（gap padding）

### Decision: TimeStretch 采用插件接口 + 必须可回退
- **Why**：保音高变速在浏览器端实现复杂；必须允许不同实现（WSOLA/WASM/PhaseVocoder）。
- **Contract**：插件输出必须满足：
  - 不产生 NaN/Inf
  - 输出峰值可控（<= 1.0，带 limiter）
  - 在相同输入下确定性一致
  - 不满足则立即回退到非保音高重采样（时间一致优先于音质）

### Decision: 优先 WASM TimeStretch（音质优先），并以 Worker 隔离执行
- **Why**：对标 PR/AE 的音质，浏览器端纯 JS WSOLA/PhaseVocoder 在复杂音频（BGM+人声+变速+转场）上更容易出伪影；WASM 可提供更高质量与更稳定的数值行为。
- **How**
  - TimeStretch 在 `WebWorker` 内运行，主线程只负责调度与拷贝（避免卡 UI）
  - 优先使用 `SharedArrayBuffer`（跨线程零拷贝）与 `Atomics`（需要 COOP/COEP）；若不可用则退化为结构化拷贝但保持正确性
  - 维持“确定性”原则：相同输入 PCM 与参数，输出必须一致（避免随机 seed/线程不确定）
  - 任何异常（耗时超阈值、输出异常、WASM 加载失败）必须回退到非保音高重采样

## Risks / Trade-offs
- **风险：性能压力（长序列 + 多轨音频）**
  - 缓解：分段渲染（chunk）、解码缓存、可选 downmix/preview quality
- **风险：不同浏览器 WebCodecs 音频实现差异**
  - 缓解：尽量走 MediaBunny 原生 `AudioSample` 的 f32-planar 路径；所有音频参数恒定；强校验 + fallback
- **风险：现有 VEIR v1.0 结构不足以表达专业音频**
  - 缓解：新增 `audioMixer` 扩展段（向后兼容），或通过 `adjustments` 承载新字段；迁移工具提供自动填充默认值
- **风险：WASM 线程与跨域隔离要求（SharedArrayBuffer）**
  - 缓解：默认不强依赖 SAB；在未隔离环境下退化为拷贝与更粗的 chunk；提供“音质优先但可控”的性能档位

## Migration Plan
1. 仅新增：在 `lib/veir/engine/*` 实现 compile/evaluate/export，不破坏现有调用
2. 导出页面切换到新 pipeline（保留旧 pipeline 可配置回退）
3. 预览播放器接入相同 Render Plan（逐步替换 `<video>` 直播的音频路径）
4. 将关键能力写入 VEIR JSON（扩展字段 + schema 更新）

## Open Questions
- WASM TimeStretch：选 RubberBand（更高音质）还是 SoundTouch（更轻量）？是否需要自研最小实现？
- 预览音频：走 WebAudio 实时图（AudioWorklet）还是简化为导出级离线渲染 + 播放？
- 是否需要“离线渲染缓存”落盘到 IndexedDB（大项目加速）？


