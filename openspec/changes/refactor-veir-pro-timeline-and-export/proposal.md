# Change: 重构 VEIR 为专业级时间轴与音视频导出引擎（对标 PR / AE）

## Why
当前 `lib/veir` 的“预览 / 导出”在音频维度无法做到工程级确定性：时间基准（float 秒）、变速/保音高实现、混音/母带链路、编码/封装边界都缺少严格约束，导致在真实剪辑场景出现“导出音频与预览不一致 / 爆噪 / 失真 / 漂移”等不可接受问题。

对标 PR / AE 的专业剪辑体验，需要把“时间轴评估 → 音视频渲染 → 导出封装”收敛为一条可重复、可验证、可回放、可调试的确定性管线。

## What Changes
- **约束明确**：导出与预览 MUST 100% 在浏览器端完成（WebCodecs + MediaBunny），不引入服务端渲染兜底
- 引入 **统一时间基准**（整数 timebase，避免 float drift），并为导出/预览提供同一套时间采样策略
- 增加 **VEIR 渲染计划（Render Plan）**：从 `VEIRProject` 编译出可执行的、确定性的音视频渲染 DAG
- 重做 **音频引擎**（对标 PR / AE 的“轨道/片段/总线/自动化/母带”）：支持 clip/track gain、fade、crossfade、pan、bus sends、ducking、基础母带（limiter/normalize）
- 增加 **可插拔 TimeStretch 引擎**：优先引入 WASM time-stretch（音质优先）；必须具备熔断与回退策略以保证“无爆噪、时间一致”
- 导出侧统一使用 WebCodecs + MediaBunny，但以“音频参数恒定、无隐式音源、可校验”为硬约束
- 增强可观测性：导出产物包含可选的调试统计（峰值/RMS/空洞填充/重采样次数等）

## Impact
- Affected specs: `veir-pro-engine`（新增），并与现有 `veir-editing` 的一致性要求对齐
- Affected code: `lib/veir/**`（新增 engine/compile 层）、`lib/modern-composer/**`（音频/时间基准对接）、`app/editor/**`（预览播放器与导出页接入 Render Plan）


