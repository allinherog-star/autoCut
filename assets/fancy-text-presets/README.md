# Fancy Text Presets

花字预设目录，包含所有花字模版的源文件。

## 目录结构

```
assets/fancy-text-presets/
├── {preset-id}/                        # 模版ID目录 (kebab-case)
│   ├── {preset-id}.meta.json           # 必须 - 元数据配置
│   ├── {preset-id}.motion.tsx          # 动效脚本 - React组件 (与scene.ts二选一)
│   ├── {preset-id}.scene.ts            # 动效脚本 - Canvas渲染器 (与motion.tsx二选一)
│   └── {preset-id}.thumbnail.png       # 推荐 - 预览缩略图
└── index.ts                            # 预设注册表 (自动导出所有预设)
```

## 添加新预设

1. 创建目录 `assets/fancy-text-presets/{preset-id}/`
2. 创建 `{preset-id}.meta.json` 元数据
3. 创建 `{preset-id}.motion.tsx` 动效组件
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
        "renderer": "react-component",
        "componentPath": "ComicBurstText"
    }
}
```

## motion.tsx 格式

```tsx
'use client'

import React from 'react'
import { motion } from 'framer-motion'

export interface MyPresetTextProps {
    text: string
    scale?: number
    autoPlay?: boolean
    onComplete?: () => void
}

export function MyPresetText({ text, scale = 1, autoPlay = true, onComplete }: MyPresetTextProps) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            onAnimationComplete={onComplete}
        >
            {text}
        </motion.div>
    )
}

export default MyPresetText
```

## 渲染器类型

| 类型 | 文件 | 说明 |
|------|------|------|
| `react-component` | `motion.tsx` | React + Framer Motion 组件 |
| `canvas-fancy-text` | `scene.ts` | Canvas 2D 渲染器场景配置 |
