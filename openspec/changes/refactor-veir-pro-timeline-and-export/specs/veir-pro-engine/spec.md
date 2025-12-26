## ADDED Requirements

### Requirement: 整数时间基准（timeUs）与确定性采样
系统 MUST 使用整数微秒（`timeUs`）作为剪辑引擎内部的唯一时间基准，以保证预览/导出/再导出在长序列与多次 timeWarp 下不会累计漂移。

#### Scenario: 视频帧时间戳确定性
- **WHEN** 项目帧率为 `fps`
- **THEN** 系统 MUST 以 \(tUs = round(frameIndex * 1_000_000 / fps)\) 生成每一帧的时间戳
- **AND THEN** 相同输入 VEIRProject 在不同设备/不同运行时 MUST 生成相同的帧时间戳序列

#### Scenario: 音频采样时间戳确定性
- **WHEN** 输出采样率为 `sampleRate`
- **THEN** 系统 MUST 以 sampleIndex 与 `sampleRate` 映射到 `timeUs`（µs）并保持单调递增
- **AND THEN** 音频参数（sampleRate/channels）在一次导出过程中 MUST 保持恒定

---

### Requirement: Render Plan（编译产物）作为唯一渲染输入
系统 MUST 将 `VEIRProject` 编译为 `RenderPlan`，并将 `RenderPlan` 作为预览与导出的唯一渲染输入（Single Executable Truth）。

#### Scenario: 预览与导出复用同一 Render Plan
- **WHEN** 用户预览时间点 \(t\) 或导出整个序列
- **THEN** 系统 MUST 使用同一份 `RenderPlan`（或其不可变拷贝）进行评估
- **AND THEN** 预览画面/导出画面/导出音频 MUST 在相同时间戳 \(tUs\) 上可对齐（允许编码压缩导致的轻微像素差异）

---

### Requirement: 专业级音频图（Clip → Track/Bus → Master）
系统 MUST 支持专业剪辑所需的音频图结构，包括：clip 音量/淡入淡出、track 音量、bus 混音、send、ducking（sidechain）以及 master limiter。

#### Scenario: Clip gain 与淡入淡出
- **WHEN** 某个 audio/video clip 存在音频输出
- **THEN** 系统 MUST 支持 clip-level 的 gain（含 automation）与 fade-in/fade-out
- **AND THEN** 相邻 clip 的转场窗口 MUST 自动计算并应用 crossfade（若存在 transitionOut）

#### Scenario: Bus sends 与 ducking
- **WHEN** BGM bus 被设置为对 VO（人声）sidechain ducking
- **THEN** 系统 MUST 在 VO 有能量时降低 BGM 的有效增益，并在 VO 结束后恢复

#### Scenario: Master limiter 防爆音
- **WHEN** 混音总线的峰值可能超过 0 dBFS
- **THEN** 系统 MUST 在 master 输出应用 limiter（或等效的峰值保护）
- **AND THEN** 导出产物 MUST 不出现明显削波爆音

---

### Requirement: TimeStretch 插件化 + 必须可回退
系统 MUST 将保音高变速（TimeStretch）设计为可插拔引擎，并优先采用 WASM 实现（音质优先）；在任何异常情况下必须回退到“非保音高重采样”，以保证不爆噪且时间一致。

#### Scenario: 保音高变速正常工作
- **WHEN** 用户为 clip 设置 `maintainPitch=true` 且存在 timeWarp
- **THEN** 系统 SHOULD 使用 WASM TimeStretch 引擎产生保音高的输出

#### Scenario: 异常熔断回退
- **WHEN** TimeStretch 输出包含 NaN/Inf、异常峰值或异常 RMS
- **THEN** 系统 MUST 熔断该 clip 的 TimeStretch 输出并回退到非保音高重采样
- **AND THEN** 回退后的输出 MUST 保证时间对齐（不漂移、不爆噪）

---

### Requirement: 导出音频不得引入隐式音源（例如麦克风）
系统 MUST 保证导出音频只来源于 VEIR 的 asset 轨道与生成音频（如音效合成），不得在导出过程中隐式采集麦克风或系统输入源。

#### Scenario: 安全导出
- **WHEN** 用户导出视频
- **THEN** 导出过程 MUST 不调用 `getUserMedia` 或任何麦克风采集 API

---

### Requirement: 100% 浏览器端导出（无服务端兜底）
系统 MUST 在浏览器端完成预览与导出（WebCodecs + MediaBunny），不得依赖服务端渲染或转码作为兜底路径。

#### Scenario: 浏览器端导出约束
- **WHEN** 用户点击导出
- **THEN** 系统 MUST 在浏览器端生成输出文件（Blob/下载链接）
- **AND THEN** 系统 MUST NOT 将渲染/转码任务发送到服务端作为回退方案

---

### Requirement: 可观测性与可诊断性
系统 SHALL 在导出期间提供可选的音频诊断数据，用于快速定位漂移、爆音、空洞填充与降级路径。

#### Scenario: 导出输出诊断摘要
- **WHEN** 开启导出诊断
- **THEN** 系统 SHOULD 输出包含 peak、RMS、non-finite count、gap padding count、resample count、timeStretch fallback count 的摘要


