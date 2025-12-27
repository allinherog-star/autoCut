## ADDED Requirements

### Requirement: Fancy Text Preset Registry Server Preparation
花字预设 registry（来自 `assets/fancy-text-presets`）SHALL 支持在服务端生成首屏可用的模板列表数据，以降低客户端初始化成本。

#### Scenario: 服务端生成花字模板列表
- **WHEN** 用户访问花字模版列表页（`/templates` 的花字分类）
- **THEN** 系统 SHALL 在服务端读取 registry 并生成可序列化的模板列表数据
- **AND** 客户端仅负责交互（筛选/收藏/预览）而非首屏数据组装






