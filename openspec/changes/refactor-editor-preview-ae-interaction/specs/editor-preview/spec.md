## ADDED Requirements

### Requirement: Edit 预览区提供 PR/AE 级选中与变换交互（Fabric 交互层）
系统 MUST 在 `editor/edit` 的预览区提供可预测的“所见即所拖”交互体验，支持选中、拖拽移动、缩放、旋转，并将最终变换结果写入 `VEIRProject.adjustments.clipOverrides` 以保证预览与导出一致。

#### Scenario: 用户选中可交互素材后出现选中框与控制点
- **GIVEN** `editor/edit` 预览区存在可交互叠加素材（如画中画/贴纸/文本/字幕）
- **WHEN** 用户点击该素材
- **THEN** 系统 MUST 显示选中框
- **AND** 系统 MUST 显示用于缩放/旋转的控制点（至少包含缩放控制点）

#### Scenario: 用户拖拽移动素材并写回 VEIR transform
- **GIVEN** 用户已选中一个可交互素材
- **WHEN** 用户在预览区拖拽该素材改变位置
- **THEN** 素材 MUST 实时跟随指针移动
- **AND** 松手后系统 MUST 将位置写回 `clipOverrides[clipId].video.transform.offset`

#### Scenario: 拖拽时自动暂停播放，结束后按需恢复
- **GIVEN** 预览区正在播放
- **WHEN** 用户开始拖拽素材
- **THEN** 系统 MUST 自动暂停播放
- **AND** **WHEN** 用户结束拖拽
- **THEN** 若拖拽开始前处于播放态，系统 MUST 恢复播放

#### Scenario: 吸附与对齐线（中心线/边缘/三分线/安全区）
- **GIVEN** 用户拖拽或缩放素材
- **WHEN** 素材边界或中心接近预览画面中心线/边缘/三分线/安全区边界
- **THEN** 系统 MUST 在阈值范围内触发吸附
- **AND** 系统 MUST 显示对应的对齐参考线

#### Scenario: Alt/Option 临时禁用吸附
- **GIVEN** 用户正在拖拽或缩放素材
- **WHEN** 用户按住 `Alt/Option`
- **THEN** 系统 MUST 临时禁用吸附（参考线可选显示，但不改变位置）

#### Scenario: 方向键微调位置（支持加速/微调）
- **GIVEN** 用户已选中素材且焦点不在输入框中
- **WHEN** 用户按下方向键
- **THEN** 系统 MUST 以小步长移动素材位置
- **AND** **WHEN** 用户按住 `Shift` 再按方向键
- **THEN** 系统 MUST 使用更大步长移动
- **AND** **WHEN** 用户按住 `Alt/Option` 再按方向键
- **THEN** 系统 MUST 使用更小步长移动






