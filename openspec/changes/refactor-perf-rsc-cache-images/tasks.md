## 1. Implementation
- [ ] 1.1 新增 Server 侧数据获取模块（media list / categories / fancy-text preset registry），使用 `fetch()` caching（`revalidate` + `tags`）
- [ ] 1.2 重构 `app/library`：拆分为 RSC 外壳 + `LibraryClient`，消除首屏 client-side loadMedia waterfall
- [ ] 1.3 重构 `app/templates`：拆分为 RSC 外壳 + `TemplatesClient`，服务端预生成 fancy text templates（静态资产）并缓存
- [ ] 1.4 将素材/模板缩略图替换为 `next/image`（包含 `sizes`、合理 `quality`、错误兜底）
- [ ] 1.5 对预览弹窗/重组件引入 `next/dynamic` 懒加载，避免非必要首屏打包
- [ ] 1.6 检查并修复非编辑页对 `@/lib/modern-composer` 的运行时引用（仅保留 type import 或改为动态 import）
- [ ] 1.7 运行 `npm run lint`（必要时 `npm run build`）并在浏览器验证 `/library`、`/templates`、`/editor/edit` 无回归






