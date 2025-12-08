# Design: 素材库功能技术方案

## Context

AutoCut 需要从纯前端应用升级为全栈应用，支持素材的持久化存储。用户使用 MySQL 数据库。

## Goals / Non-Goals

### Goals
- 用户能上传视频/图片素材到服务器
- 素材信息持久化到 MySQL 数据库
- 用户能浏览、管理自己的素材库
- 支持素材的基本 CRUD 操作

### Non-Goals
- 用户认证（本次不实现，所有素材共享）
- 分片上传/断点续传（后续优化）
- 素材转码/处理（后续实现）
- CDN 分发（后续实现）

## Decisions

### 1. ORM 选择：Prisma

**选择**: Prisma ORM
**原因**:
- 类型安全：自动生成 TypeScript 类型
- 开发体验好：声明式 schema，强大的迁移系统
- 与 Next.js 集成良好
- 支持 MySQL

**替代方案**:
- TypeORM：装饰器风格，配置较繁琐
- Drizzle：较新，生态不如 Prisma 成熟
- mysql2 直接操作：缺乏类型安全，开发效率低

### 2. 文件存储方案：本地存储 + 抽象层

**选择**: 本地存储 (`public/uploads`) + 存储抽象层
**原因**:
- 开发阶段简单直接
- 通过抽象层预留扩展能力（OSS/S3）
- 无需额外配置第三方服务

**文件目录结构**:
```
public/uploads/
├── videos/
│   └── {uuid}.{ext}
└── images/
    └── {uuid}.{ext}
```

### 3. API 设计：RESTful + Next.js App Router

**选择**: Next.js API Routes (App Router)
**原因**:
- 无需额外后端服务
- 与前端同仓库，开发便捷
- 支持流式响应，适合大文件上传

**API 端点设计**:
```
POST   /api/media          # 上传素材
GET    /api/media          # 获取素材列表
GET    /api/media/[id]     # 获取单个素材
DELETE /api/media/[id]     # 删除素材
PATCH  /api/media/[id]     # 更新素材信息
```

### 4. 数据库 Schema 设计

```prisma
model Media {
  id          String   @id @default(uuid())
  name        String   // 显示名称
  filename    String   // 存储文件名
  type        MediaType
  mimeType    String
  size        Int      // 字节数
  path        String   // 相对路径
  duration    Float?   // 视频时长（秒）
  width       Int?     // 宽度
  height      Int?     // 高度
  thumbnailPath String? // 缩略图路径
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  tags        MediaTag[]
  projects    ProjectMedia[]
}

enum MediaType {
  VIDEO
  IMAGE
  AUDIO
}

model MediaTag {
  id        String   @id @default(uuid())
  name      String   @unique
  color     String?
  createdAt DateTime @default(now())
  
  media     Media[]
}

model Project {
  id          String   @id @default(uuid())
  name        String
  description String?
  targetDevice String  @default("phone")
  videoType   String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  media       ProjectMedia[]
}

model ProjectMedia {
  id        String   @id @default(uuid())
  projectId String
  mediaId   String
  order     Int      @default(0)
  isMain    Boolean  @default(false)
  
  project   Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
  media     Media    @relation(fields: [mediaId], references: [id], onDelete: Cascade)
  
  @@unique([projectId, mediaId])
}
```

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| 大文件上传可能超时 | 设置合理的 bodyParser 限制，后续实现分片上传 |
| 本地存储磁盘空间有限 | 预留 OSS 接口，设置上传限制 |
| 无用户认证导致数据共享 | 本地开发可接受，生产环境需增加认证 |
| 数据库连接池问题 | 使用 Prisma 连接池管理，Next.js 单例模式 |

## Migration Plan

1. 安装 Prisma 和 mysql2 依赖
2. 创建 Prisma schema
3. 运行数据库迁移
4. 实现存储服务抽象层
5. 实现 API 路由
6. 重构前端上传组件
7. 新增素材库面板

## Open Questions

- [ ] 生产环境文件存储方案（OSS/S3）选型
- [ ] 是否需要视频缩略图自动生成
- [ ] 上传文件大小限制（建议单文件 500MB）




