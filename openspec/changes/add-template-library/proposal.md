# Change: 添加模版库系统与素材库增强

## Why

当前 AutoCut 的素材库仅支持基础的文件上传和存储。为了实现真正的「一键成片」体验，需要建立完整的**模版系统**，让用户可以：
- 通过参数化模版快速生成定制素材（特别是花字、标题等高频使用场景）
- 基于模版库批量生成章节标题、操作指引等系列素材
- 通过 AI 能力召唤网络素材或生成自定义模版
- 收藏常用素材，提升创作效率

## What Changes

### 1. 模版系统（核心新增）

- 新增 `Template` 数据模型，支持三种模版类型：
  - **视频模版**：支持替换人物、替换背景、变速曲线
  - **图片模版**：支持替换人物、替换背景
  - **花字模版**：支持整体参数（文字、颜色、字体、动画等）和逐字参数（高低、远近、旋转等）
- 新增模版可控参数标准接口 `TemplateParameter`
- 新增模版渲染引擎，支持实时预览和素材生成
- 新增模版函数调用接口，供系统自动调用生成素材

### 2. 素材库增强

- 新增素材类型：`FANCY_TEXT`（花字）、`STICKER`（表情）扩展
- 新增素材来源分类：`SYSTEM`（系统预设）、`USER`（用户创建）、`AI_CRAWL`（AI召唤）
- 新增**用途标签**（花字专用）：标题、章节步骤标题、操作指引、强调特写、人物介绍
- 新增用户收藏功能，Tab 结构：全部素材 | 系统素材 | 我的素材 | 我的收藏
- 新增首帧封面截取、Hover 预览、点击放大交互
- 新增表情包管理：系统预设 + 用户导入

### 3. AI 能力集成

- **AI 召唤素材**：根据类型+标签+关键词实时爬取网络素材，用户确认后导入
- **AI 生成模版**：用户描述需求 → AI 生成模版脚本（特别是花字） → 预览确认 → 导入模版库
- 新增大模型协议适配层（视频、图片、花字脚本生成）

### 4. 统一标签系统增强

- 扩展标签维度：情绪、行业、风格、场景、平台、节奏、用途
- 所有素材和模版强制打标签
- 支持多维度交叉筛选检索

## Impact

- Affected specs: 
  - `template-system`（新增）
  - `asset-enhancement`（新增，扩展 media-library）
  - `ai-integration`（新增）

- Affected code:
  - `prisma/schema.prisma`: 新增 Template、UserFavorite、StickerPack 等模型
  - `app/api/templates/**`: 新增模版 CRUD API
  - `app/api/ai/**`: 新增 AI 召唤/生成 API
  - `app/library/page.tsx`: 重构素材库页面
  - `app/templates/page.tsx`: 重构模版库页面
  - `components/template-editor.tsx`: 新增模版参数编辑器
  - `components/fancy-text-renderer.tsx`: 新增花字渲染引擎
  - `lib/template-engine/`: 新增模版渲染核心逻辑
  - `lib/ai-adapter/`: 新增 AI 服务适配层




