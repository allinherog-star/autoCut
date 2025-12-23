/**
 * Fancy Text Presets Registry
 * 
 * 自动导出所有预设的元数据和组件/场景
 * 使用静态 import 而非 HTTP fetch
 */

// ============================================
// 元数据导入
// ============================================

import neonPulseSwirlMeta from './neon-pulse-swirl/neon-pulse-swirl.meta.json'

// Variety Comedy Pack - 《一见你就笑》风格综艺花字套件
import showTitleBurstMeta from './variety-comedy-pack/show-title-burst.meta.json'
import segmentTitlePopMeta from './variety-comedy-pack/segment-title-pop.meta.json'
import guestNameSlideMeta from './variety-comedy-pack/guest-name-slide.meta.json'
import laughExplosionMeta from './variety-comedy-pack/laugh-explosion.meta.json'

// ============================================
// 场景导入 (lazy) - Canvas 2D 渲染
// ============================================

export const PRESET_SCENES = {
    'neon-pulse-swirl': () => import('./neon-pulse-swirl/neon-pulse-swirl.scene'),
    // Variety Comedy Pack
    'show-title-burst': () => import('./variety-comedy-pack/show-title-burst.scene'),
    'segment-title-pop': () => import('./variety-comedy-pack/segment-title-pop.scene'),
    'guest-name-slide': () => import('./variety-comedy-pack/guest-name-slide.scene'),
    'laugh-explosion': () => import('./variety-comedy-pack/laugh-explosion.scene'),
} as const

// ============================================
// 组件导入 (lazy) - React/Framer Motion (降级方案)
// ============================================

export const PRESET_COMPONENTS = {
    'neon-pulse-swirl': () => import('./neon-pulse-swirl/neon-pulse-swirl.motion'),
    // Variety Comedy Pack
    'show-title-burst': () => import('./variety-comedy-pack/show-title-burst.motion'),
    'segment-title-pop': () => import('./variety-comedy-pack/segment-title-pop.motion'),
    'guest-name-slide': () => import('./variety-comedy-pack/guest-name-slide.motion'),
    'laugh-explosion': () => import('./variety-comedy-pack/laugh-explosion.motion'),
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
        scenePath?: string       // Canvas 场景文件路径
    }
}

export interface PresetEntry {
    meta: PresetMeta
    hasComponent: boolean
    hasScene: boolean           // Canvas 2D 场景支持
}

// 所有预设的静态注册表
export const PRESET_REGISTRY: PresetEntry[] = [
    { meta: neonPulseSwirlMeta as PresetMeta, hasComponent: true, hasScene: true },
    // Variety Comedy Pack - 《一见你就笑》风格综艺花字套件
    { meta: showTitleBurstMeta as PresetMeta, hasComponent: true, hasScene: true },
    { meta: segmentTitlePopMeta as PresetMeta, hasComponent: true, hasScene: true },
    { meta: guestNameSlideMeta as PresetMeta, hasComponent: true, hasScene: true },
    { meta: laughExplosionMeta as PresetMeta, hasComponent: true, hasScene: true },
]

// 按 ID 查找预设
export function getPresetMeta(id: string): PresetMeta | undefined {
    return PRESET_REGISTRY.find(p => p.meta.id === id)?.meta
}

// 获取所有预设元数据
export function getAllPresetMetas(): PresetMeta[] {
    return PRESET_REGISTRY.map(p => p.meta)
}

// 动态加载预设场景 (Canvas 2D)
export async function loadPresetScene(id: string, options: { text: string; colorPresetId?: string; width?: number; height?: number }): Promise<import('@/lib/canvas-fancy-text/types').CanvasFancyTextScene | null> {
    const loader = PRESET_SCENES[id as keyof typeof PRESET_SCENES]
    if (!loader) return null

    try {
        const module = await loader()
        // 场景模块导出 createXxxScene 函数
        const createScene = module.default
        if (typeof createScene === 'function') {
            return createScene(options)
        }
        return null
    } catch (error) {
        console.error(`Failed to load scene for preset ${id}:`, error)
        return null
    }
}

// 动态加载预设组件 (React/Framer Motion - 降级方案)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function loadPresetComponent(id: string): Promise<React.ComponentType<any> | null> {
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

