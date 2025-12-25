## ADDED Requirements

### Requirement: VEIR 作为编辑工程文件的单一真源
系统 MUST 将 `VEIRProject` JSON 作为编辑工程文件的唯一权威来源（Single Source of Truth）。

#### Scenario: 编辑器加载项目
- **WHEN** 用户进入剪辑微调页面并打开某个 `draftId`
- **THEN** 系统 MUST 读取并反序列化该 `draftId` 对应的 `VEIRProject`
- **AND THEN** 时间轴 UI、预览播放器、导出页面 MUST 使用同一份 `VEIRProject`（允许在内存中有不可变拷贝，但语义一致）

#### Scenario: 任何可见改动都可被 VEIR 表达
- **WHEN** 用户执行剪辑/微调（裁剪 in/out、分割、移动、转场、滤镜、变速、位置/缩放/旋转、字幕布局等）
- **THEN** 系统 MUST 将变更写入 `VEIRProject.timeline` 与/或 `VEIRProject.adjustments.clipOverrides`
- **AND THEN** 变更后的 `VEIRProject` MUST 通过 VEIR schema 校验（至少通过客户端的结构性校验；服务端 AJV 校验可选）

---

### Requirement: 预览与导出渲染一致
系统 MUST 保证预览结果与导出 MP4 的画面/时间一致（在相同输入 VEIR 的情况下）。

#### Scenario: 预览与导出使用同一渲染内核
- **WHEN** 预览播放器渲染任意时间点 \(t\)
- **THEN** 预览 MUST 复用导出渲染内核的帧渲染逻辑（同一套 timeWarp、sourceRange、转场窗口、字幕布局、坐标换算）
- **AND THEN** 用户在预览中看到的结果 MUST 与导出 MP4 的对应帧保持一致（允许存在编码压缩导致的轻微像素差异）

#### Scenario: clip 实例化（同一素材多次引用）
- **WHEN** 同一个素材 asset 在时间轴中被多个 clip 引用（可能同时出现，如 PIP 与主视频重叠）
- **THEN** 渲染系统 MUST 以 clip 为实例渲染（而非以 asset 为实例），确保预览与导出对齐

---

### Requirement: 浏览器端导出 MP4（WebCodecs/MediaBunny）
系统 MUST 在浏览器端使用 WebCodecs/MediaBunny 完成 MP4 导出，不依赖后端渲染。

#### Scenario: 用户导出 MP4
- **WHEN** 用户在导出页面点击“开始导出”
- **THEN** 系统 MUST 使用 `VEIRProject` 作为唯一输入，通过 WebCodecs/MediaBunny 生成 MP4 Blob
- **AND THEN** 系统 MUST 提供下载链接并允许用户下载文件

---

### Requirement: 本地草稿存储（为未来草稿箱/登录扩展预留）
系统 SHALL 提供本地草稿存储能力：每次创作会话对应一个 `draftId`，并持久化对应的 `VEIRProject` JSON。

#### Scenario: 创建新的创作会话
- **WHEN** 用户开始一次新的创作
- **THEN** 系统 MUST 创建一个新的 `draftId`
- **AND THEN** 系统 MUST 生成并保存一份初始 `VEIRProject`（例如从模板/示例/用户素材生成）

#### Scenario: 自动保存
- **WHEN** `VEIRProject` 发生变更
- **THEN** 系统 MUST 在防抖窗口后将其保存到 IndexedDB
- **AND THEN** 系统 MUST 维护 `revision`（单调递增）以避免并发覆盖


