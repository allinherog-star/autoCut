## Context
本变更聚焦于「列表型页面」的首屏性能与可维护性：素材库与模版库存在较重的 Client 逻辑与 `<img>` 直出，无法充分利用 Next.js 15 的 RSC 与数据缓存能力。

## Goals / Non-Goals
- Goals
  - 首屏数据由 Server Components 预取，减少 client-side waterfall 与 loading 闪烁
  - 缩略图走 `next/image`，降低滚动时解码/重绘成本
  - 预览弹窗/重组件懒加载，减少首屏 bundle
  - 保持交互体验一致，不改变功能行为
- Non-Goals
  - 不在本变更中重写素材库/模版库全部交互逻辑（筛选、分页、上传、收藏等仍由 client 负责）
  - 不引入新的外部依赖（除非必要）

## Decisions
- **RSC 外壳 + Client 交互组件**
  - `page.tsx` 保持 Server Component（默认），仅负责首屏数据 fetch + 传递 `initial*` props
  - 将现有页面主体迁移为 `*-client.tsx` 并保留 `"use client"` 与交互
- **缓存策略**
  - 列表首屏使用 `fetch(url, { next: { revalidate, tags } })`
  - 上传/删除后通过 Route Handler 返回的客户端刷新触发 revalidate（后续可升级为 Server Actions + `revalidateTag()`）
- **图片策略**
  - 列表缩略图统一 `next/image`，必须提供 `sizes`，并基于布局选择 `fill` + `object-fit`
  - 对外链/用户上传路径确保 `next.config` 的 `images` 配置满足
- **懒加载**
  - 预览弹窗（Modal）与重渲染组件使用 `next/dynamic`，仅在打开/进入视口时加载

## Risks / Trade-offs
- RSC 传参需要确保可序列化（FancyTextTemplate/MediaListResponse 必须是纯 JSON）
- `next/image` 对部分动态路径可能需要补充 `remotePatterns` 或确保走本域静态路径
- 过度拆分可能增加文件数量；本次保持最小可行拆分（两个 client 文件 + 少量 server helpers）

## Migration Plan
1. 增加 server-side fetch helpers（不影响现有 client）
2. 引入 `LibraryClient` / `TemplatesClient` 并逐步迁移 UI
3. 替换缩略图为 `next/image`
4. 引入懒加载与 bundle 检查
5. lint/build/手动验证

## Open Questions
- `/library` 的「系统素材」与「数据库素材」合并逻辑是否允许服务端做首屏合并，还是继续保留 client 计算？
- `media.thumbnailPath` 是否保证为站内路径（`/uploads/...`），以避免配置 remotePatterns？






