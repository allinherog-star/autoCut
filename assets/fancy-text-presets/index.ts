/**
 * Fancy Text Presets Registry
 * 
 * 自动导出所有预设的元数据和组件
 * 使用静态 import 而非 HTTP fetch
 */

// ============================================
// 元数据导入
// ============================================

import comicBurstMeta from './comic-burst/comic-burst.meta.json'
import hilariousBurstMeta from './hilarious-burst/hilarious-burst.meta.json'
import screenShakeMeta from './screen-shake/screen-shake.meta.json'
import shockWaveMeta from './shock-wave/shock-wave.meta.json'
import varietyFrameMeta from './variety-frame/variety-frame.meta.json'
import varietyMainTitleMeta from './variety-main-title/variety-main-title.meta.json'
import varietyTitleBounceMeta from './variety-title-bounce/variety-title-bounce.meta.json'
import varietyTitleBurstMeta from './variety-title-burst/variety-title-burst.meta.json'
import wowEmphasisMeta from './wow-emphasis/wow-emphasis.meta.json'
import explosiveLaughMeta from './explosive-laugh/explosive-laugh.meta.json'
// 一见你就笑 - 软糖系列花字预设
import candyMainTitleMeta from './candy-main-title/candy-main-title.meta.json'
import candySegmentTitleMeta from './candy-segment-title/candy-segment-title.meta.json'
import candyGuestNameMeta from './candy-guest-name/candy-guest-name.meta.json'
import candyFunnyBurstMeta from './candy-funny-burst/candy-funny-burst.meta.json'

// ============================================
// 组件导入 (lazy)
// ============================================

export const PRESET_COMPONENTS = {
    'comic-burst': () => import('./comic-burst/comic-burst.motion'),
    'wow-emphasis': () => import('./wow-emphasis/wow-emphasis.motion'),
    'screen-shake': () => import('./screen-shake/screen-shake.motion'),
    'variety-frame': () => import('./variety-frame/variety-frame.motion'),
    // Canvas presets don't have React components
    'variety-main-title': null,
    'hilarious-burst': null,
    'shock-wave': null,
    'variety-title-bounce': null,
    'variety-title-burst': null,
    'explosive-laugh': () => import('./explosive-laugh/explosive-laugh.motion'),
    // 一见你就笑 - 软糖系列花字预设
    'candy-main-title': () => import('./candy-main-title/candy-main-title.motion'),
    'candy-segment-title': () => import('./candy-segment-title/candy-segment-title.motion'),
    'candy-guest-name': () => import('./candy-guest-name/candy-guest-name.motion'),
    'candy-funny-burst': () => import('./candy-funny-burst/candy-funny-burst.motion'),
} as const

// ============================================
// 预设注册表
// ============================================

export interface PresetMeta {
    id: string
    name: string
    description?: string
    level: string
    tags: string[]
    category?: string
    textDefaults?: {
        text?: string
        fontSizeRange?: number[]  // [min, max] - using array for JSON compatibility
        recommendLines?: number
        fontFamily?: string[]
        stroke?: { enabled?: boolean; color?: string; width?: number }
        shadow?: { enabled?: boolean; color?: string; blur?: number; offsetX?: number; offsetY?: number }
    }
    colorPresets?: Array<{
        id: string
        name: string
        gradient?: string
        strokeColor?: string
        glowColor?: string
        frameColor?: string
        sunColor?: string
        textGradient?: string
        outerStrokeColor?: string
    }>
    // 渲染配置 - 用于视频合成时的自适应尺寸
    rendering?: {
        aspectRatio?: number     // 宽高比 (默认 4.8)
        heightRatio?: number     // 相对视频高度比例 (0.0-1.0, 默认 0.35)
        duration?: number        // 动画总时长 (秒, 默认 2.0)
        frameRate?: number       // 导出帧率 (默认 30)
    }
    compat?: {
        renderer?: 'fancy-text' | 'canvas-fancy-text' | 'react-component'
        componentPath?: string
    }
}

export interface PresetEntry {
    meta: PresetMeta
    hasComponent: boolean
}

// 所有预设的静态注册表
export const PRESET_REGISTRY: PresetEntry[] = [
    { meta: comicBurstMeta as PresetMeta, hasComponent: true },
    { meta: hilariousBurstMeta as PresetMeta, hasComponent: false },
    { meta: screenShakeMeta as PresetMeta, hasComponent: true },
    { meta: shockWaveMeta as PresetMeta, hasComponent: false },
    { meta: varietyFrameMeta as PresetMeta, hasComponent: true },
    { meta: varietyMainTitleMeta as PresetMeta, hasComponent: false },
    { meta: varietyTitleBounceMeta as PresetMeta, hasComponent: false },
    { meta: varietyTitleBurstMeta as PresetMeta, hasComponent: false },
    { meta: wowEmphasisMeta as PresetMeta, hasComponent: true },
    { meta: explosiveLaughMeta as PresetMeta, hasComponent: true },
    // 一见你就笑 - 软糖系列花字预设
    { meta: candyMainTitleMeta as PresetMeta, hasComponent: true },
    { meta: candySegmentTitleMeta as PresetMeta, hasComponent: true },
    { meta: candyGuestNameMeta as PresetMeta, hasComponent: true },
    { meta: candyFunnyBurstMeta as PresetMeta, hasComponent: true },
]

// 按 ID 查找预设
export function getPresetMeta(id: string): PresetMeta | undefined {
    return PRESET_REGISTRY.find(p => p.meta.id === id)?.meta
}

// 获取所有预设元数据
export function getAllPresetMetas(): PresetMeta[] {
    return PRESET_REGISTRY.map(p => p.meta)
}

// 动态加载预设组件
export async function loadPresetComponent(id: string): Promise<React.ComponentType<unknown> | null> {
    const loader = PRESET_COMPONENTS[id as keyof typeof PRESET_COMPONENTS]
    if (!loader) return null

    try {
        const module = await loader()
        return module.default || null
    } catch (error) {
        console.error(`Failed to load component for preset ${id}:`, error)
        return null
    }
}
