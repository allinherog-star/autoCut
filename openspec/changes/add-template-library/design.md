# Design: 模版库系统技术设计

## Context

AutoCut 需要建立模版系统，让用户能够：
1. 通过参数化模版快速生成素材
2. 系统能够自动调用模版生成素材（用于 AI 自动剪辑场景）
3. 支持 AI 生成和网络爬取素材

核心技术挑战：
- 花字模版的动态渲染和导出
- 模版参数标准化，支持函数调用
- AI 服务多供应商适配

## Goals / Non-Goals

### Goals
- 建立统一的模版参数协议，支持系统自动调用
- 实现花字模版的实时预览和视频导出
- 支持 AI 生成花字脚本并导入
- 建立素材/模版的统一标签体系

### Non-Goals
- 不实现复杂的视频非线性编辑功能
- 不实现 AI 模型训练（仅调用现有服务）
- 不实现实时协作编辑

## Decisions

### 1. 模版参数协议

**决策**: 使用 JSON Schema 风格的参数定义

```typescript
interface TemplateParameter {
  name: string;           // 参数名
  type: 'string' | 'number' | 'boolean' | 'color' | 'asset' | 'enum' | 'array';
  label: string;          // 显示标签
  defaultValue: any;
  required: boolean;
  constraints?: {
    min?: number;
    max?: number;
    options?: { value: string; label: string }[];
    pattern?: string;
    assetType?: string;
  };
}
```

**理由**: 
- 与 JSON Schema 兼容，易于校验
- 支持自动生成 UI 表单
- 便于 AI 理解和调用

### 2. 花字渲染技术选型

**决策**: 使用 Canvas 2D + Web Animations API，复杂场景降级到 CSS 动画

**理由**:
- Canvas 2D 性能好，浏览器兼容性强
- Web Animations API 原生支持，无需额外依赖
- 可导出为视频帧序列，配合 FFmpeg 生成视频

**替代方案考虑**:
- WebGL + Three.js：过于复杂，花字场景不需要 3D
- Lottie：需要预制动画，不够灵活
- PixiJS：增加依赖体积，性能优势在花字场景不明显

### 3. 花字导出方案

**决策**: Canvas 逐帧捕获 + WebCodecs 编码

```
用户调整参数 → Canvas 实时预览 → 确认生成 → 逐帧捕获 → WebCodecs 编码 → MP4/WebM
```

**理由**:
- WebCodecs 是 W3C 标准，性能优于纯 JS 方案
- 支持硬件加速编码
- 可在浏览器端完成，减少服务端压力

**降级方案**: 不支持 WebCodecs 的浏览器使用服务端 FFmpeg

### 4. AI 服务适配架构

**决策**: 适配器模式 + 统一协议

```typescript
interface AIProviderAdapter {
  name: string;
  
  // 图片生成
  generateImage?(prompt: string, options: ImageGenOptions): Promise<string>;
  
  // 视频生成
  generateVideo?(prompt: string, options: VideoGenOptions): Promise<string>;
  
  // 花字脚本生成（文本 → JSON）
  generateFancyTextScript?(prompt: string): Promise<FancyTextTemplate>;
  
  // 素材搜索/爬取
  searchAssets?(query: AssetSearchQuery): Promise<AssetSearchResult[]>;
}

// 注册多个供应商
const providers = {
  openai: new OpenAIAdapter(),
  stability: new StabilityAdapter(),
  runway: new RunwayAdapter(),
  crawler: new WebCrawlerAdapter(),
};
```

**理由**:
- 解耦业务逻辑与 AI 供应商
- 支持多供应商切换/降级
- 便于后续扩展

### 5. 素材来源与存储

**决策**: 统一存储 + 来源标记

```
所有素材统一存储在 public/uploads/{type}/
来源通过 source 字段区分：SYSTEM | USER | AI_CRAWL
AI 召唤素材：预览时不存储，确认后下载存储
```

**理由**:
- 简化存储结构
- AI 召唤素材按需存储，节省空间
- 统一的素材访问路径

### 6. 表情包数据结构

**决策**: 表情包(Pack) + 表情(Sticker) 两层结构

```prisma
model StickerPack {
  id        String    @id
  name      String
  source    String    // SYSTEM | USER
  stickers  Sticker[]
}

model Sticker {
  id       String @id
  packId   String
  name     String
  filePath String
  keywords String[]  // 快速搜索关键词
}
```

**理由**:
- 支持表情包整体导入/导出
- 关键词搜索提升查找效率

## Risks / Trade-offs

| 风险 | 影响 | 缓解措施 |
|------|------|----------|
| WebCodecs 兼容性 | 部分浏览器不支持导出 | 降级到服务端 FFmpeg |
| AI 服务不稳定 | 生成/召唤功能失效 | 多供应商降级 + 缓存 |
| 花字渲染性能 | 复杂动画卡顿 | 限制动画复杂度 + 预渲染 |
| 网络爬取合规 | 版权风险 | 仅爬取无版权/CC 素材源 |

## Migration Plan

1. **Phase 1**: 扩展数据库模型（Template、UserFavorite、StickerPack）
2. **Phase 2**: 实现模版 CRUD API
3. **Phase 3**: 实现花字渲染引擎 + 导出
4. **Phase 4**: 实现 AI 适配层 + 召唤/生成功能
5. **Phase 5**: 重构前端 UI（素材库、模版库页面）

**回滚策略**: 各 Phase 独立部署，可单独回滚

## Open Questions

1. 是否需要支持模版版本管理？（暂不实现）
2. AI 召唤素材的版权声明如何处理？（待法务确认）
3. 花字逐字动画的参数上限？（建议单次最多 20 字）











