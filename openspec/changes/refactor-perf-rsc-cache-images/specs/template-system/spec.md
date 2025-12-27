## ADDED Requirements

### Requirement: Template Library RSC First Paint
模版库页面（`/templates`）SHALL 使用 Server Components 为首屏准备可序列化的模版列表数据，并通过缓存策略减少重复计算与首屏 JS。

#### Scenario: 初次进入模版库首屏无 client-side 加载瀑布
- **WHEN** 用户首次访问 `/templates`
- **THEN** 系统 SHALL 在服务端准备默认分类下的模版列表（至少包含花字模版）
- **AND** 页面首屏 SHALL 直接渲染出可浏览的模版网格

#### Scenario: 交互筛选在客户端增量更新
- **WHEN** 用户在客户端执行搜索/筛选/收藏切换
- **THEN** 系统 SHALL 在客户端进行增量筛选或请求
- **AND** 不阻塞首屏渲染

### Requirement: Template Preview Components Lazy Loaded
模版预览弹窗及其重渲染组件（如花字播放器/预览卡片）SHALL 采用懒加载策略，避免在模版库首屏打包并初始化。

#### Scenario: 未打开预览时不加载重组件
- **WHEN** 用户仅浏览模版列表但未打开预览弹窗
- **THEN** 系统 SHALL 不加载预览弹窗模块与其依赖的重渲染模块






