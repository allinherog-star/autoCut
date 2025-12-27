# Change: refactor-perf-rsc-cache-images

## Why
素材库（`/library`）与模版库（`/templates`）当前以 Client Component 为主、首屏依赖大量客户端数据请求与运行时渲染/计算，并存在多处 `<img>`（绕过 Next Image 优化）。这会带来更高的首屏 JS、更多布局/重绘、以及缓存无法充分利用的问题。

## What Changes
- **RSC + 缓存**：将素材库/模版库页面拆分为「Server Component 外壳 + Client 交互组件」，在服务端完成首屏数据准备，并使用 `fetch()` 缓存（`revalidate`/`tags`）减少首屏 JS 与请求瀑布。
- **图片优化**：将列表缩略图统一为 `next/image`（包含 `sizes`/`quality`/占位策略），降低滚动重绘和图片解码开销。
- **懒加载**：对预览弹窗、较重的预览/渲染组件采用 `next/dynamic` 懒加载，避免在列表首屏提前打包/初始化。
- **避免重包**：确保 `modern-composer`/渲染引擎仅在编辑器或必要路径被动态加载，非编辑页不引入运行时代码（类型导入除外）。

## Impact
- **Affected specs (deltas)**:
  - `media-library`
  - `template-system`
  - `fancy-text-templates`
- **Affected code (expected)**:
  - `app/library/page.tsx` → `app/library/page.tsx`(RSC) + `app/library/library-client.tsx`
  - `app/templates/page.tsx` → `app/templates/page.tsx`(RSC) + `app/templates/templates-client.tsx`
  - `lib/api/media.ts` / `lib/api/categories.ts`（新增 server-safe fetch helper 或 server route 调用）
  - `components/media-preview-modal.tsx` 等（懒加载接入）






