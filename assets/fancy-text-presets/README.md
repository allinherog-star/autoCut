# Fancy Text Presets

花字预设目录，包含所有花字模版的源文件。

## 目录结构

```
assets/fancy-text-presets/
├── {preset-id}/                        # 模版ID目录 (kebab-case)
│   ├── {preset-id}.meta.json           # 必须 - 元数据配置
│   ├── {preset-id}.scene.ts            # 推荐 - Canvas 2D 场景配置 (主渲染器)
│   ├── {preset-id}.motion.tsx          # 可选 - React 组件 (降级/预览方案)
│   └── {preset-id}.thumbnail.png       # 推荐 - 预览缩略图
└── index.ts                            # 预设注册表 (自动导出所有预设)
```

## 添加新预设

1. 创建目录 `assets/fancy-text-presets/{preset-id}/`
2. 创建 `{preset-id}.meta.json` 元数据
3. 创建 `{preset-id}.scene.ts` Canvas 场景配置 **(推荐)**
4. 在 `index.ts` 中添加导入和注册

## meta.json 格式

```json
{
    "id": "comic-burst",
    "name": "漫画爆炸大字",
    "description": "综艺节目爆笑瞬间大字特效",
    "level": "advanced",
    "tags": ["comic", "variety", "explosion"],
    "category": "variety",
    "textDefaults": {
        "text": "笑死我了",
        "fontFamily": ["PingFang SC", "Microsoft YaHei"]
    },
    "colorPresets": [
        {
            "id": "orange-fire",
            "name": "橙色火焰",
            "gradient": "linear-gradient(180deg, #FFE066 0%, #FF6600 100%)"
        }
    ],
    "compat": {
        "renderer": "canvas-fancy-text",
        "scenePath": "comic-burst.scene"
    }
}
```

## scene.ts 格式 (Canvas 2D - 推荐)

```typescript
import type { CanvasFancyTextScene, RenderLayer } from '@/lib/canvas-fancy-text/types'

export interface CreateSceneOptions {
    text: string
    colorPresetId?: string
    width?: number
    height?: number
}

export function createMyPresetScene(options: CreateSceneOptions): CanvasFancyTextScene {
    const { text, width = 800, height = 400 } = options

    const layers: RenderLayer[] = [
        { id: 'plate', type: 'shape', zIndex: 1, visible: true, opacity: 1, config: { ... } },
        { id: 'text', type: 'text', zIndex: 10, visible: true, opacity: 1, config: { ... } },
    ]

    return {
        id: 'my-preset',
        name: '我的预设',
        description: '预设描述',
        renderConfig: { width, height, fps: 30, devicePixelRatio: 2, antialias: true, transparent: true },
        layers,
        duration: 1.5,
        loop: false,
    }
}

export default createMyPresetScene
```

## 渲染器类型

| 类型 | 文件 | 说明 | 状态 |
|------|------|------|------|
| `canvas-fancy-text` | `scene.ts` | Canvas 2D 渲染器场景配置 | **推荐** |
| `react-component` | `motion.tsx` | React + Framer Motion 组件 | 降级/预览 |

