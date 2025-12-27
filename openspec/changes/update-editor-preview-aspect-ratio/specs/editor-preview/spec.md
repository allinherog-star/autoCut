## ADDED Requirements

### Requirement: Edit 预览区按目标平台严格使用对应尺寸比例
系统 MUST 在 `editor/edit` 的预览区中，基于用户在“上传素材”步骤选择的目标平台（`targetDevice`），使用对应的设备尺寸比例渲染预览画面，且不得因容器尺寸变化而发生非等比拉伸。

#### Scenario: 用户选择手机竖屏（9:16）目标平台
- **WHEN** 用户在“上传素材”步骤选择 `targetDevice = phone`
- **AND** 用户进入 `editor/edit`
- **THEN** 预览画面容器 MUST 以 9:16 的比例渲染（在可用区域内居中适配）
- **AND** 预览画面不得被非等比拉伸（只允许等比缩放或等比裁切策略）

#### Scenario: 用户选择电脑横屏（16:9）目标平台
- **WHEN** 用户在“上传素材”步骤选择 `targetDevice = pc`
- **AND** 用户进入 `editor/edit`
- **THEN** 预览画面容器 MUST 以 16:9 的比例渲染（在可用区域内居中适配）
- **AND** 预览画面不得被非等比拉伸（只允许等比缩放或等比裁切策略）

#### Scenario: 用户在编辑页切换目标平台后预览比例立即更新
- **GIVEN** 用户已进入 `editor/edit`
- **WHEN** 用户在任意步骤或入口切换 `targetDevice`
- **THEN** `editor/edit` 预览区 MUST 立即切换到对应比例（无需刷新页面）

#### Scenario: 拖拽定位基于严格比例内框计算
- **GIVEN** `editor/edit` 存在可拖拽素材（如画中画/贴纸/字幕）
- **WHEN** 用户拖拽素材改变位置
- **THEN** 位置百分比计算 MUST 基于“严格比例预览内框”的实际宽高（而非外层面板容器），以保证不同平台预览结果一致










