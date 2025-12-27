## ADDED Requirements

### Requirement: Media Library RSC First Paint
素材库页面（`/library`）SHALL 使用 Server Components 预取首屏列表数据，并将其作为 `initial` props 传递给客户端交互组件，以减少首屏加载时的请求瀑布与 loading 闪烁。

#### Scenario: 初次进入素材库获得可用首屏数据
- **WHEN** 用户首次访问 `/library`
- **THEN** 系统 SHALL 在服务端获取默认筛选条件下的素材列表第一页
- **AND** 页面首屏 SHALL 直接渲染出素材网格（无需等待客户端 `useEffect` 取数）

#### Scenario: 切换筛选条件仍由客户端增量请求
- **WHEN** 用户在客户端切换筛选条件（类型/搜索/标签/分页）
- **THEN** 系统 SHALL 通过 Route Handlers 获取最新列表数据
- **AND** 仅更新列表区域，避免整页重载

### Requirement: Media Thumbnails Use Next Image
素材库中的图片/视频缩略图 SHALL 使用 `next/image` 渲染，并提供合理的 `sizes` 与质量参数，以降低滚动时解码与重绘开销。

#### Scenario: 网格视图缩略图响应式加载
- **WHEN** 素材库以网格视图展示缩略图
- **THEN** 系统 SHALL 使用 `next/image` 的响应式 `sizes` 以匹配不同断点列数
- **AND** 浏览器 SHALL 优先下载合适分辨率的图片资源

#### Scenario: 缩略图加载失败的兜底
- **WHEN** 某个缩略图资源 404/加载失败
- **THEN** 系统 SHALL 展示类型图标占位（而非注入 innerHTML）






