# Tasks: 模版库系统实施任务

## 1. 数据库模型扩展

- [ ] 1.1 新增 `Template` 模型（类型、参数定义、配置）
- [ ] 1.2 新增 `TemplateType` 枚举（VIDEO_TEMPLATE, IMAGE_TEMPLATE, FANCY_TEXT_TEMPLATE）
- [ ] 1.3 新增 `UserFavorite` 模型（用户收藏素材/模版）
- [ ] 1.4 新增 `StickerPack` 和 `Sticker` 模型（表情包管理）
- [ ] 1.5 扩展 `Media` 模型：增加 `source`、`sourceTemplateId`、`usageLabels` 字段
- [ ] 1.6 扩展 `CategoryTag` 模型：增加 `USAGE` 维度
- [ ] 1.7 运行数据库迁移

## 2. 模版系统 API

- [ ] 2.1 实现 `POST /api/templates` 创建模版
- [ ] 2.2 实现 `GET /api/templates` 列表查询（支持类型、标签筛选）
- [ ] 2.3 实现 `GET /api/templates/[id]` 获取模版详情
- [ ] 2.4 实现 `PUT /api/templates/[id]` 更新模版
- [ ] 2.5 实现 `DELETE /api/templates/[id]` 删除模版
- [ ] 2.6 实现 `POST /api/templates/[id]/render` 渲染模版生成素材

## 3. 花字渲染引擎

- [ ] 3.1 创建 `lib/fancy-text-engine/` 目录结构
- [ ] 3.2 实现花字参数解析器 `parseTemplate(config)`
- [ ] 3.3 实现 Canvas 渲染器 `FancyTextRenderer`
- [ ] 3.4 实现入场动画库（fade, slide, bounce, typewriter 等）
- [ ] 3.5 实现持续动画库（pulse, shake, glow 等）
- [ ] 3.6 实现装饰元素渲染（underline, highlight, box）
- [ ] 3.7 实现逐字参数控制（offsetY, scale, rotation, delay）
- [ ] 3.8 实现视频导出（WebCodecs 编码）
- [ ] 3.9 实现降级方案（服务端 FFmpeg）

## 4. 素材库增强

- [ ] 4.1 实现首帧封面截取（视频/GIF 上传时自动生成）
- [ ] 4.2 实现 Hover 预览组件 `MediaPreviewHover`
- [ ] 4.3 实现点击放大 Modal `MediaPreviewModal`
- [ ] 4.4 实现用户收藏 API `POST/DELETE /api/favorites`
- [ ] 4.5 实现收藏列表查询 `GET /api/favorites`
- [ ] 4.6 扩展素材列表 API 支持 Tab 筛选（all, system, user, favorites）
- [ ] 4.7 实现用途标签筛选（花字专用）

## 5. 表情包管理

- [ ] 5.1 实现表情包 CRUD API `/api/sticker-packs`
- [ ] 5.2 实现表情 CRUD API `/api/stickers`
- [ ] 5.3 实现表情包批量导入（上传文件夹）
- [ ] 5.4 实现表情关键词搜索
- [ ] 5.5 预置系统表情包种子数据

## 6. AI 能力集成

- [ ] 6.1 创建 `lib/ai-adapter/` 适配器架构
- [ ] 6.2 实现 AI 召唤素材 API `POST /api/ai/crawl-assets`
- [ ] 6.3 实现 AI 召唤结果导入 `POST /api/ai/import-crawled`
- [ ] 6.4 实现 AI 生成模版 API `POST /api/ai/generate-template`
- [ ] 6.5 实现花字脚本 AI 生成（调用 LLM 生成 JSON）
- [ ] 6.6 实现图片/视频 AI 生成适配（OpenAI DALL-E、Stability 等）

## 7. 前端 UI 重构

- [ ] 7.1 重构素材库页面 `/library`
  - [ ] 7.1.1 实现 Tab 切换（全部/系统/我的/收藏）
  - [ ] 7.1.2 实现素材类型侧边栏
  - [ ] 7.1.3 实现标签多维筛选
  - [ ] 7.1.4 实现 AI 召唤入口
- [ ] 7.2 重构模版库页面 `/templates`
  - [ ] 7.2.1 实现模版类型侧边栏（视频/图片/花字）
  - [ ] 7.2.2 实现模版卡片列表
  - [ ] 7.2.3 实现 AI 创作模版入口
- [ ] 7.3 实现模版参数编辑器 `TemplateParamEditor`
  - [ ] 7.3.1 根据参数类型自动生成表单
  - [ ] 7.3.2 实现实时预览
  - [ ] 7.3.3 实现生成素材按钮
- [ ] 7.4 实现花字编辑器 `FancyTextEditor`
  - [ ] 7.4.1 整体参数面板
  - [ ] 7.4.2 逐字参数面板
  - [ ] 7.4.3 动画预览画布

## 8. 模版函数调用接口

- [ ] 8.1 定义 `renderTemplate(templateId, params)` 函数
- [ ] 8.2 定义 `generateFancyText(templateId, options)` 便捷函数
- [ ] 8.3 定义 `batchGenerateFancyText(templateId, textList, options)` 批量函数
- [ ] 8.4 实现函数调用的错误处理和重试机制
- [ ] 8.5 编写函数调用文档和示例

## 9. 种子数据与测试

- [ ] 9.1 创建系统预设花字模版（标题、章节、指引、强调、人物介绍）
- [ ] 9.2 创建系统预设视频/图片模版
- [ ] 9.3 创建用途标签种子数据
- [ ] 9.4 编写模版渲染单元测试
- [ ] 9.5 编写 AI 适配器集成测试





