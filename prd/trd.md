# VEIR Specification v1.0
## Video Editing Intermediate Representation

> 面向 AI 的多模态视频剪辑中间表示规范  
> Version: 1.0.0-draft  
> Status: Draft  
> Audience: AI 系统、视频引擎、前端/后端工程师、产品架构师

---

## 0. 前言（Foreword）

### 0.1 背景
随着短视频与多模态内容创作的自动化程度不断提升，传统以人工时间轴为中心的剪辑模型难以被 AI 稳定生成与维护。现有方案通常在「内容理解」与「渲染执行」之间缺乏一个明确、稳定、可校验的中间表达层。

### 0.2 目标
VEIR（Video Editing Intermediate Representation）旨在定义一种：

- 面向 AI 生成（AI-first）
- 引擎无关（Engine-agnostic）
- 可演进（Evolvable）
- 支持用户低成本微调

的视频剪辑中间表示规范。

### 0.3 非目标
- 不定义具体渲染算法
- 不绑定 Canvas / WebGL / FFmpeg
- 不试图替代专业剪辑软件的完整 UI

---

## 1. 术语与定义（Terminology）

| 术语 | 定义 |
|---|---|
| VEIR | Video Editing Intermediate Representation |
| Track | 同类 Clip 的时间组织单元 |
| Clip | 时间轴上的一次素材使用实例 |
| Expression | 抽象的行为/动效语义 |
| Preset | 抽象的视觉或布局模板 |
| Filter | 抽象的画面风格映射 |
| Adjustment Layer | 对 VEIR 的受控差量修正层 |
| Annotation | 对可修改点的显式标注 |
| Anchor | Annotation 中的可编辑锚点 |
| Motion Segment | 带时间区间的画面状态变化 |

---

## 2. 设计原则（Design Principles）

### 2.1 语义优先（Semantic-first）
VEIR 描述“发生了什么”和“如何表达”，而不是“如何渲染”。

### 2.2 AI 优先（AI-first）
- 使用离散词汇
- 明确可用范围
- 可被 Schema 严格校验

### 2.3 结构稳定（Structural Stability）
- 剪辑结构与表达微调分离
- 支持重复生成与覆盖

### 2.4 可演进（Evolvability）
- 新能力通过词汇与扩展实现
- 不破坏既有工程与历史数据

---

## 3. 系统总体架构（System Architecture）

### 3.1 分层模型

# VEIR Specification v1.0 (Draft)
## Video Editing Intermediate Representation

> 面向 AI 的多模态视频剪辑中间表示规范  
> Version: 1.0.0-draft  
> Status: Draft  
> Audience: AI 系统、视频引擎、前端/后端工程师、产品架构师

---

## 0. 前言（Foreword）

### 0.1 背景
随着短视频与多模态内容创作的自动化程度不断提升，传统以人工时间轴为中心的剪辑模型难以被 AI 稳定生成与维护。现有方案通常在「内容理解」与「渲染执行」之间缺乏一个明确、稳定、可校验的中间表达层。

### 0.2 目标
VEIR（Video Editing Intermediate Representation）旨在定义一种：

- 面向 AI 生成（AI-first）
- 引擎无关（Engine-agnostic）
- 可演进（Evolvable）
- 支持用户低成本微调

的视频剪辑中间表示规范。

### 0.3 非目标
- 不定义具体渲染算法
- 不绑定 Canvas / WebGL / FFmpeg
- 不试图替代专业剪辑软件的完整 UI

---

## 1. 术语与定义（Terminology）

| 术语 | 定义 |
|---|---|
| VEIR | Video Editing Intermediate Representation |
| Track | 同类 Clip 的时间组织单元 |
| Clip | 时间轴上的一次素材使用实例 |
| Expression | 抽象的行为/动效语义 |
| Preset | 抽象的视觉或布局模板 |
| Filter | 抽象的画面风格映射 |
| Adjustment Layer | 对 VEIR 的受控差量修正层 |
| Annotation | 对可修改点的显式标注 |
| Anchor | Annotation 中的可编辑锚点 |
| Motion Segment | 带时间区间的画面状态变化 |

---

## 2. 设计原则（Design Principles）

### 2.1 语义优先（Semantic-first）
VEIR 描述“发生了什么”和“如何表达”，而不是“如何渲染”。

### 2.2 AI 优先（AI-first）
- 使用离散词汇
- 明确可用范围
- 可被 Schema 严格校验

### 2.3 结构稳定（Structural Stability）
- 剪辑结构与表达微调分离
- 支持重复生成与覆盖

### 2.4 可演进（Evolvability）
- 新能力通过词汇与扩展实现
- 不破坏既有工程与历史数据

---

## 3. 系统总体架构（System Architecture）

### 3.1 分层模型

L1 内容理解（Understanding）
L2 语义结构（Semantics）
L3 表达规划（Expression Planning）
L4 VEIR（剪辑中间表示）
L5 Adjustment（表达微调）
L6 执行器（Renderer / Encoder）

### 3.2 VEIR 的位置
VEIR 是 **最后一个智能层**，也是 **第一个工程层**。

---

## 4. VEIR Project 结构（Project Structure）

### 4.1 项目目录规范

veir-project/
├─ index.json
├─ meta.json
├─ assets.json
├─ vocabulary/
│ ├─ expressions.json
│ ├─ presets.json
│ └─ filters.json
├─ timeline.json
├─ annotations.json
├─ adjustments.json
└─ schemas/


### 4.2 核心文件说明

| 文件 | 职责 |
|---|---|
| timeline.json | 剪辑中间表示（核心 IR） |
| annotations.json | 用户可修改点标注 |
| adjustments.json | 用户/AI 微调差量 |

---

## 5. Meta 规范（Environment Specification）

### 职责
定义运行环境假设，不参与剪辑表达。

### 示例字段
- resolution
- fps
- duration
- colorSpace

---

## 6. Asset 规范（Asset Specification）

### 职责
声明可用素材，不定义使用方式。

### 素材类型
- video
- audio
- text
- image

### 扩展语义
- optional
- semanticRole
- autoReplace

---

## 7. 词汇层规范（Vocabulary）

### 7.1 Expression Vocabulary
定义“可以怎么动”。

- entrance / exit / emphasis
- intensityRange
- 不包含动画参数

### 7.2 Preset Vocabulary
定义“可以长什么样 / 放在哪”。

- 文本样式
- 画中画布局
- 相对表达

### 7.3 Filter Vocabulary
定义“画面整体风格”。

- filter id
- intensity
- 不暴露颜色参数

---

## 8. Timeline 规范（VEIR Core）

### 职责
定义“这个视频怎么被剪出来”。

### 核心概念
- Track
- Clip
- Time Range
- Asset Reference
- Expression Reference

### 约束
- 不包含微调
- 不包含参数
- 用户不可直接编辑

---

## 9. Annotation 规范（Editable Anchors）

### 设计目的
解决“用户不知道从第几秒开始改”的问题。

### Anchor 特性
- 基于 frame（非秒）
- 绑定 clip
- 声明可编辑能力

### UI 语义
Anchor 是用户交互入口，而非剪辑逻辑。

---

## 10. Adjustment Layer 规范（Expression Adjustment）

### 职责
对 VEIR 的受控差量修正。

### 允许修改
- 时间微移
- 布局微调
- 视频画面调整
- 滤镜
- 关键帧运动（Motion）

### 禁止修改
- 不增删 clip
- 不更换素材
- 不改变语义决策

---

## 11. 视频画面 Adjustment 规范

### 11.1 全局画面调整
- crop
- transform
- color
- blur
- mask
- filter

### 11.2 时间分段 Adjustment（Segments）
- 相对于 clip 的时间区间
- 局部覆盖全局设置

### 11.3 Motion Segment（关键帧动画）
- from / to 画面状态
- when 时间区间
- easing 语义

---

## 12. 合并与执行模型（Execution Model）

### 12.1 合并顺序

timeline
→ annotations（仅 UI 参考）
→ adjustments
→ effective timeline


### 12.2 执行职责
执行器只负责翻译与渲染，不参与决策。

---

## 13. 前端 / 后端执行建议（Non-normative）

### 前端
- Canvas / WebGL 渲染
- WebCodecs 编码
- 实时预览

### 服务端
- 二次封装
- 加密 / 水印
- 分发控制

---

## 14. 校验与 Schema（Validation）

- JSON Schema Draft 2020-12
- 强制字段校验
- 约束 AI 输出合法性

---

## 15. 版本演进策略（Versioning）

- 主版本冻结结构
- 新能力通过 vocabulary / adjustment 扩展
- 保证向后兼容

---

## 16. 安全与版权考虑（Security Considerations）

- 前端合成的边界
- 素材分级策略
- 最终产物加密与追溯

---

## 17. 附录 A：示例工程（Examples）

- 最小示例
- 综艺字幕示例
- 画中画示例
- Motion 示例

---

## 18. 附录 B：设计动机与对比（Rationale）

- 与传统 NLE 的差异
- 与模板系统的差异
- 与纯 AIGC 视频的差异

---

## 结语

VEIR 不是一个剪辑工具，也不是一个渲染框架。  
它是一种面向 AI 的视频剪辑表达语言，用于在自动化生成与人类微调之间建立稳定、可控、可演进的桥梁。


# VEIR 前端架构设计文档 (Frontend Architecture Design)

## 1. 架构愿景
构建一个高性能、响应式且高度模块化的视频编辑前端引擎，旨在完美实现 VEIR 协议，支持实时预览、帧级精确操作以及跨端一致的渲染表现。

## 2. 技术栈选型
- **框架**: React 18+ (Concurrent Mode)
- **语言**: TypeScript 5.0+ (严格类型检查)
- **状态管理**: Zustand + Immer (高性能原子化状态管理，处理复杂的 Timeline 树)
- **渲染引擎**: WebGL 2.0 / WebGPU (用于 Shader 特效与合成)
- **解码/编码**: WebCodecs API (原生硬件加速)
- **样式**: Tailwind CSS + Headless UI
- **构建工具**: Vite (极速开发响应)

## 3. 核心分层架构

### 3.1 协议解析层 (Parser Layer)
- **职责**: 将标准 VEIR JSON 转换为前端内部可操作的不可变状态树。
- **校验**: 集成 JSON Schema 校验，确保 AI 生成内容的合法性。
- **转换**: 处理版本兼容性（Migration Logic）。

### 3.2 状态管理层 (State Layer)
- **Timeline Store**: 维护 Clip、Anchor、Adjustment 的扁平化索引，优化查找效率。
- **Undo/Redo**: 基于快照的状态回溯机制。
- **Reactive System**: 确保 UI 组件（如时间轴刻度）与渲染引擎同步。

### 3.3 渲染引擎层 (Rendering Engine - "VEIR Core")
- **Scheduler**: 基于 `requestVideoFrameCallback` 的高精度调度器。
- **Composition Engine**: 
  - 实现 Section 12 定义的合并逻辑。
  - 采用图层合成算法：`Base Layer -> Adjustment Layer -> Annotation Layer`。
- **Worker Pool**: 使用 Web Workers 处理非阻塞式素材预加载与元数据解析。

### 3.4 UI 组件层 (UI Layer)
- **Canvas Previewer**: 响应式画布，支持交互式 Transform 句柄。
- **Virtual Timeline**: 虚拟滚动技术处理超长视频轨道，支持帧级缩放。
- **Property Inspector**: 动态表单，根据 VEIR Schema 自动生成调整面板。

## 4. 关键技术方案

### 4.1 帧精确度保障 (Frame-Level Precision)
- 内部逻辑完全基于 `Frame Index` 计算，仅在 UI 显示层转换为 `HH:MM:SS:FF`。
- 解决 JavaScript 浮点数精度导致的音画不同步问题。

### 4.2 渲染管线优化
- **LRU Cache**: 针对视频帧与纹理的缓存策略。
- **OffscreenCanvas**: 在独立 Worker 中执行复杂滤镜（Blur, Color Grading），释放主线程。

### 4.3 实时预览与代理模式
- 智能检测带宽，自动切换 `Proxy (低分辨率)` 与 `Original (高分辨率)` 素材。
- 支持基于 WebCodecs 的流式预取。

## 5. 性能指标 (SLAs)
- **首屏渲染**: < 1.5s (加载基础编辑器环境)
- **操作延迟**: 时间轴拖拽响应 < 16ms (60FPS)
- **渲染一致性**: 前端预览与后端合成结果像素误差 < 1%

## 6. 安全与合规
- **CORS/COEP/COOP**: 配置跨域策略以启用 `SharedArrayBuffer`。
- **Content Security Policy (CSP)**: 限制非授权素材加载。

