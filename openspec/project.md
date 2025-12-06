# Project Context

## Purpose

AutoCut 是一款 AI 视频剪辑工具，通过智能引导步骤，帮助用户从基础素材（视频、图片、文字）或零素材开始，结合 AI 内容理解、智能分割、素材匹配、热点分析等能力，自动生成高质量爆款视频。

### 目标用户

- **普通用户**：不懂视频编辑，想快速制作高质量视频
- **内容创作者**：需要高效生成符合个性化需求的视频

### 核心价值

真正的「一键成片」体验，让每个人都能轻松创作专业视频。

## Tech Stack

### 前端

- **框架**: Next.js 15 (App Router)
- **语言**: TypeScript 5.x (严格模式)
- **样式**: Tailwind CSS 3.4
- **动画**: Framer Motion 11
- **组件**: Radix UI 原语 + 自定义设计系统
- **图标**: Lucide React

### 状态管理

- 服务端状态：Server Components + Server Actions
- 客户端状态：React useState/useReducer（轻量场景）
- 全局状态：Zustand（如需要）

### 代码规范

- ESLint + Next.js 规则
- Prettier + Tailwind CSS 插件
- TypeScript 严格模式

## Project Conventions

### Code Style

```typescript
// 1. 组件命名：PascalCase
export function VideoPlayer() {}

// 2. 文件命名：kebab-case
// components/ui/video-player.tsx

// 3. 类型定义：使用 interface 优先，type 用于联合类型
interface VideoClip {
  id: string
  startTime: number
  endTime: number
}

type MediaType = 'video' | 'audio' | 'image'

// 4. 导出：具名导出优先
export { VideoPlayer }
export type { VideoClip }
```

### 目录结构

```
autocut/
├── app/                    # Next.js App Router
│   ├── (marketing)/        # 营销页面组
│   ├── (editor)/           # 编辑器页面组
│   ├── api/                # API 路由
│   ├── layout.tsx          # 根布局
│   └── globals.css         # 全局样式
├── components/
│   ├── ui/                 # 基础 UI 组件
│   ├── editor/             # 编辑器组件
│   └── [feature]/          # 功能组件
├── features/               # 功能模块（按业务划分）
├── lib/                    # 工具函数、类型定义
├── hooks/                  # 自定义 Hooks
├── stores/                 # 状态管理
└── public/                 # 静态资源
```

### Architecture Patterns

1. **Server Components 优先**：默认使用 RSC，仅在需要交互时添加 `'use client'`
2. **数据获取**：使用 Server Actions 和 Route Handlers
3. **组件组合**：优先使用组合而非继承
4. **样式方案**：Tailwind CSS 原子类 + CSS 变量

### API 规范

- 所有 API 放在 `app/api/**/route.ts`
- 使用标准 HTTP 方法（GET, POST, PUT, DELETE）
- 返回统一的响应格式

```typescript
// 成功响应
{ data: T, success: true }

// 错误响应
{ error: string, code: string, success: false }
```

### Testing Strategy

- 单元测试：Vitest + Testing Library
- E2E 测试：Playwright
- 组件测试：Storybook

### Git Workflow

- 分支命名：`feat/xxx`, `fix/xxx`, `refactor/xxx`
- 提交规范：Conventional Commits
- PR 流程：代码审查 + CI 通过后合并

## Domain Context

### 剪辑流程（10 步）

1. **上传素材**：基础素材上传，支持视频、图片、文字
2. **理解视频**：AI 分析视频内容，智能分割，提取价值片段
3. **字幕推荐**：语音识别 + 内容理解 + 热点关键词
4. **标题推荐**：基于内容和热点的标题建议
5. **音乐卡点**：智能配乐，音乐与画面同步
6. **特效渲染**：标题动画、字幕动效、关键字高亮
7. **情绪增强**：情绪渲染、音效配合
8. **音画同步**：自动校准视频、音频、字幕轨道
9. **剪辑微调**：时间轴编辑，精细调整
10. **完成导出**：多分辨率、多帧率导出

### 关键概念

- **基础素材**：用户上传的原始视频/图片/文字
- **辅助素材**：平台提供的转场、滤镜、音效等
- **用户偏好**：保存的常用素材风格、片头片尾、字幕样式
- **热点关联**：根据平台趋势推荐相关内容

## Important Constraints

- 视频处理在后端完成，前端仅做预览和交互
- 大文件上传需要分片和断点续传
- 实时预览需要优化性能（虚拟化、懒加载）
- 支持移动端响应式布局

## External Dependencies

- **AI 服务**：视频理解、语音识别、内容推荐
- **存储服务**：素材存储、项目存储
- **CDN**：静态资源和素材分发
- **热点 API**：获取平台趋势数据
