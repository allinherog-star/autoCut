# Change: 添加素材库功能与后端服务

## Why

当前 AutoCut 是纯前端应用，用户上传的素材只存在于浏览器内存中，刷新页面后就会丢失。需要建立后端服务和数据库，实现素材的持久化存储和管理，让用户可以：
- 上传并保存素材到服务器
- 管理自己的素材库（查看、删除、分类）
- 在不同项目中复用素材

## What Changes

### 后端基础设施
- **BREAKING**: 新增 Prisma ORM 和 MySQL 数据库依赖
- 新增 Next.js API Routes 处理素材上传/管理
- 新增文件存储方案（本地开发用 `public/uploads`，生产环境可扩展到 OSS）

### 数据模型
- 新增 `Media` 表：存储素材元数据（文件名、类型、大小、路径等）
- 新增 `MediaTag` 表：素材标签/分类
- 新增 `Project` 表：项目信息（为后续功能预留）
- 新增 `ProjectMedia` 关联表：项目与素材的多对多关系

### 前端改造
- 重构 Upload 页面，支持真实的文件上传
- 新增素材库面板组件，展示用户已上传的素材
- 新增素材管理功能（删除、重命名、添加标签）

## Impact

- Affected specs: `media-library`（新增）
- Affected code:
  - `app/api/media/**`: 新增 API 路由
  - `app/editor/upload/page.tsx`: 重构上传逻辑
  - `components/media-library.tsx`: 新增素材库组件
  - `lib/prisma.ts`: 新增数据库客户端
  - `prisma/schema.prisma`: 新增数据库 schema




















