# Tasks: 素材库功能实现清单

## 1. 后端基础设施

- [x] 1.1 安装 Prisma 和相关依赖
- [x] 1.2 配置 Prisma 连接 MySQL
- [x] 1.3 创建数据库 Schema（Media, MediaTag, Project, ProjectMedia）
- [ ] 1.4 运行数据库迁移（需要用户配置 .env）
- [x] 1.5 创建 Prisma 客户端单例 (`lib/prisma.ts`)

## 2. 文件存储服务

- [x] 2.1 创建存储服务抽象层 (`lib/storage.ts`)
- [x] 2.2 实现本地文件存储
- [x] 2.3 创建上传目录结构 (`public/uploads/videos`, `public/uploads/images`)

## 3. API 路由实现

- [x] 3.1 实现素材上传 API (`POST /api/media`)
- [x] 3.2 实现素材列表 API (`GET /api/media`)
- [x] 3.3 实现单个素材查询 API (`GET /api/media/[id]`)
- [x] 3.4 实现素材删除 API (`DELETE /api/media/[id]`)
- [x] 3.5 实现素材更新 API (`PATCH /api/media/[id]`)

## 4. 前端组件开发

- [x] 4.1 创建素材库面板组件 (`components/media-library-panel.tsx`)
- [x] 4.2 重构上传页面，集成真实上传功能
- [x] 4.3 添加素材删除确认弹窗
- [x] 4.4 实现素材库搜索/筛选功能

## 5. 集成测试

- [ ] 5.1 测试素材上传流程
- [ ] 5.2 测试素材列表展示
- [ ] 5.3 测试素材删除功能
- [ ] 5.4 测试上传到素材库的完整流程

