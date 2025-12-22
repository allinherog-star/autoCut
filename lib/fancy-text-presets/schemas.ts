import { z } from 'zod'

// --- Meta Schema ---

export const FancyTextMetaSchema = z.object({
    id: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "ID must be kebab-case"),
    name: z.string().min(1),
    description: z.string().optional(),
    level: z.enum(['simple', 'advanced']).default('simple'),
    tags: z.array(z.string()).default([]),
    category: z.string().optional(),
    language: z.enum(['zh', 'en']).optional(),

    textDefaults: z.object({
        text: z.string().optional(),
        fontSizeRange: z.tuple([z.number(), z.number()]).optional(),
        recommendLines: z.number().optional(),
        fontFamily: z.array(z.string()).optional(),
        stroke: z.object({
            enabled: z.boolean().optional(),
            color: z.string().optional(),
            width: z.number().optional(),
        }).optional(),
        shadow: z.object({
            enabled: z.boolean().optional(),
            color: z.string().optional(),
            blur: z.number().optional(),
            offsetX: z.number().optional(),
            offsetY: z.number().optional(),
        }).optional(),
    }).optional(),

    colorPresets: z.array(z.object({
        id: z.string(),
        name: z.string(),
        gradient: z.string().optional(),
        strokeColor: z.string().optional(),
        glowColor: z.string().optional(),
        frameColor: z.string().optional(),
        sunColor: z.string().optional(),
        textGradient: z.string().optional(),
        outerStrokeColor: z.string().optional(),
    })).optional(),

    assets: z.object({
        sfx: z.object({
            file: z.string(),
            cues: z.array(z.enum(['in', 'hit', 'loop', 'out'])).optional(),
        }).optional(),
    }).optional(),

    // 渲染配置 - 用于视频合成时的固定尺寸
    rendering: z.object({
        canvasWidth: z.number().default(1920),   // 画布宽度
        canvasHeight: z.number().default(400),   // 画布高度
        duration: z.number().default(2.0),       // 动画总时长 (秒)
        frameRate: z.number().default(30),       // 导出帧率
    }).optional(),

    compat: z.object({
        renderer: z.enum(['fancy-text', 'canvas-fancy-text', 'react-component']).default('fancy-text'),
        minAppVersion: z.string().optional(),
        componentPath: z.string().optional(),
    }).optional(),
})

export type FancyTextMeta = z.infer<typeof FancyTextMetaSchema>

// --- Combined Preset Schema (simplified, no motionPlan) ---

export const FancyTextPresetSchema = z.object({
    meta: FancyTextMetaSchema,
})

export type FancyTextPreset = z.infer<typeof FancyTextPresetSchema>
