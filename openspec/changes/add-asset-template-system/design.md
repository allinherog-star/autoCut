# Design: 素材库与模版库系统技术设计

## Context

AutoCut 需要构建一套完整的素材库和模版库系统，核心挑战：
1. 花字渲染引擎需要高性能、高质量
2. 模版参数化需要灵活且易于扩展
3. AI 集成需要标准化协议

## Goals / Non-Goals

### Goals
- 构建高质量、高性能的花字渲染引擎
- 实现参数化模版系统，支持系统调用
- 提供流畅的用户体验（预览、编辑、导出）
- 为 AI 集成预留标准接口

### Non-Goals
- 本期不实现视频/图片模版的人物/背景替换（需 AI 能力）
- 本期不实现完整的 AI 召唤功能（依赖外部 API）

## Decisions

### 1. 花字渲染引擎架构

**Decision**: 采用 Canvas 2D + requestAnimationFrame 实现，预留 WebGL 升级路径

**Rationale**:
- Canvas 2D 已足够满足当前需求
- 兼容性好，调试方便
- 后续可升级到 WebGL 提升性能

```typescript
// 渲染器架构
class FancyTextRenderer {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private animationFrame: number
  
  // 渲染管线
  render(template: FancyTextTemplate, params: FancyTextParams) {
    this.clear()
    this.renderBackground()
    this.renderDecorations('behind')
    this.renderText()
    this.renderDecorations('front')
  }
  
  // 动画循环
  startAnimation() {
    const animate = (timestamp: number) => {
      this.updateAnimationState(timestamp)
      this.render()
      this.animationFrame = requestAnimationFrame(animate)
    }
    this.animationFrame = requestAnimationFrame(animate)
  }
}
```

### 2. 模版参数系统

**Decision**: 使用 JSON Schema 风格的参数定义 + Zod 运行时验证

```typescript
// 模版参数定义
interface TemplateParameterDef {
  type: 'string' | 'number' | 'color' | 'select' | 'multi-select' | 'slider'
  label: string
  description?: string
  default: any
  validation?: {
    min?: number
    max?: number
    options?: Array<{ value: string; label: string }>
    required?: boolean
  }
}

// 花字模版参数
const FANCY_TEXT_PARAMS: Record<string, TemplateParameterDef> = {
  text: {
    type: 'string',
    label: '文字内容',
    default: '示例文字',
    validation: { required: true, maxLength: 50 }
  },
  fontSize: {
    type: 'slider',
    label: '字号',
    default: 48,
    validation: { min: 12, max: 200 }
  },
  // ...
}
```

### 3. 动画系统

**Decision**: 采用声明式动画定义 + 插值引擎

```typescript
// 动画定义
interface AnimationDef {
  name: string
  keyframes: Array<{
    offset: number // 0-1
    properties: Record<string, number | string>
    easing?: string
  }>
  duration: number
}

// 入场动画示例
const ENTRANCE_ANIMATIONS: Record<string, AnimationDef> = {
  'scale-bounce': {
    name: '放大弹跳',
    duration: 400,
    keyframes: [
      { offset: 0, properties: { scale: 0, opacity: 0 } },
      { offset: 0.6, properties: { scale: 1.2, opacity: 1 }, easing: 'ease-out' },
      { offset: 0.8, properties: { scale: 0.9 } },
      { offset: 1, properties: { scale: 1 } }
    ]
  },
  // ...
}
```

### 4. 模版渲染 API

**Decision**: 提供同步预览 + 异步导出两种模式

```typescript
interface TemplateRenderAPI {
  // 预览模式：返回渲染器实例，用于实时预览
  createPreview(
    templateId: string,
    params: FancyTextParams
  ): FancyTextRenderer
  
  // 导出模式：异步渲染并导出文件
  exportAsVideo(
    templateId: string,
    params: FancyTextParams,
    options: ExportOptions
  ): Promise<{
    url: string
    duration: number
    size: number
  }>
  
  // 批量导出（用于章节标题等场景）
  batchExport(
    templateId: string,
    items: Array<{ text: string; params?: Partial<FancyTextParams> }>
  ): Promise<Array<ExportResult>>
}
```

### 5. 文件存储结构

```
public/
├── uploads/
│   ├── media/           # 用户上传素材
│   ├── templates/       # 模版资源
│   │   ├── thumbnails/  # 模版缩略图
│   │   └── previews/    # 模版预览视频
│   ├── renders/         # 渲染输出
│   │   ├── fancy-text/  # 花字渲染结果
│   │   └── temp/        # 临时文件
│   └── stickers/        # 表情包
└── system/              # 系统预设资源
    ├── fonts/           # 字体文件
    ├── sounds/          # 音效文件
    └── decorations/     # 装饰元素
```

## Risks / Trade-offs

### Risk 1: Canvas 性能瓶颈
- **Mitigation**: 
  - 使用 OffscreenCanvas 在 Worker 中渲染
  - 实现帧缓存，避免重复计算
  - 复杂场景降级到 WebGL

### Risk 2: 导出视频耗时长
- **Mitigation**:
  - 实现渲染队列，后台处理
  - 提供进度反馈
  - 支持取消操作

### Risk 3: 字体加载问题
- **Mitigation**:
  - 字体文件预加载
  - 提供字体加载状态反馈
  - 备选字体 fallback

## Component Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        App Layer                             │
├─────────────────────────────────────────────────────────────┤
│  LibraryPage  │  TemplatesPage  │  FancyTextEditorPage      │
├───────────────┴─────────────────┴───────────────────────────┤
│                     Component Layer                          │
├─────────────────────────────────────────────────────────────┤
│ MediaCard │ TemplateCard │ FancyTextPreview │ ParamEditor   │
├─────────────────────────────────────────────────────────────┤
│                      Engine Layer                            │
├─────────────────────────────────────────────────────────────┤
│ FancyTextRenderer │ AnimationEngine │ ExportEngine          │
├─────────────────────────────────────────────────────────────┤
│                       Data Layer                             │
├─────────────────────────────────────────────────────────────┤
│ Templates │ Media │ Favorites │ StickerPacks                │
└─────────────────────────────────────────────────────────────┘
```

## Open Questions

1. 是否需要支持离线模式？
2. 模版版本管理策略？
3. AI 生成的版权归属？





