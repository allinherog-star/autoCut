/**
 * 视频比例预设定义
 * Video Aspect Ratio Presets
 * 
 * 支持常见的视频平台比例，参考 PR/AE
 */

// ============================================================================
// Types
// ============================================================================

/**
 * 比例预设配置
 */
export interface AspectRatioPreset {
    /** 唯一标识 */
    id: string
    /** 显示名称 */
    name: string
    /** 比例值 (width / height) */
    ratio: number
    /** 标准分辨率 [width, height] */
    resolution: [number, number]
    /** 描述 */
    description: string
    /** 适用平台 */
    platforms: string[]
    /** 图标（可选） */
    icon?: 'horizontal' | 'vertical' | 'square'
}

/**
 * 比例类别
 */
export type AspectRatioCategory = 'horizontal' | 'vertical' | 'square'

// ============================================================================
// Presets
// ============================================================================

/**
 * 预设比例配置
 */
export const ASPECT_RATIO_PRESETS: Record<string, AspectRatioPreset> = {
    '16:9': {
        id: '16:9',
        name: '横屏 16:9',
        ratio: 16 / 9,
        resolution: [1920, 1080],
        description: '标准高清横屏，最常用的视频格式',
        platforms: ['YouTube', 'B站', '电视', '网页'],
        icon: 'horizontal',
    },
    '9:16': {
        id: '9:16',
        name: '竖屏 9:16',
        ratio: 9 / 16,
        resolution: [1080, 1920],
        description: '手机竖屏视频，短视频平台主流格式',
        platforms: ['抖音', '快手', 'Reels', 'TikTok', '小红书'],
        icon: 'vertical',
    },
    '1:1': {
        id: '1:1',
        name: '方形 1:1',
        ratio: 1,
        resolution: [1080, 1080],
        description: '方形视频，适合社交媒体支撑',
        platforms: ['Instagram', '微信朋友圈', '微博'],
        icon: 'square',
    },
}

/**
 * 按类别分组的预设
 */
export const PRESETS_BY_CATEGORY: Record<AspectRatioCategory, AspectRatioPreset[]> = {
    horizontal: [
        ASPECT_RATIO_PRESETS['16:9'],
    ],
    vertical: [
        ASPECT_RATIO_PRESETS['9:16'],
    ],
    square: [
        ASPECT_RATIO_PRESETS['1:1'],
    ],
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * 根据分辨率检测最接近的比例预设
 * @param width 宽度
 * @param height 高度
 * @returns 最接近的比例预设，如果没有匹配则返回 null
 */
export function detectAspectRatio(width: number, height: number): AspectRatioPreset | null {
    if (width <= 0 || height <= 0) return null

    const ratio = width / height
    let closest: AspectRatioPreset | null = null
    let minDiff = Infinity

    for (const preset of Object.values(ASPECT_RATIO_PRESETS)) {
        const diff = Math.abs(preset.ratio - ratio)
        if (diff < minDiff && diff < 0.1) { // 允许 10% 的容差
            minDiff = diff
            closest = preset
        }
    }

    return closest
}

/**
 * 根据比例 ID 获取预设
 */
export function getPresetById(id: string): AspectRatioPreset | undefined {
    return ASPECT_RATIO_PRESETS[id]
}

/**
 * 获取所有预设列表
 */
export function getAllPresets(): AspectRatioPreset[] {
    return Object.values(ASPECT_RATIO_PRESETS)
}

/**
 * 计算在容器中等比缩放后的显示尺寸
 * 
 * @param contentWidth 内容宽度
 * @param contentHeight 内容高度
 * @param containerWidth 容器宽度
 * @param containerHeight 容器高度
 * @returns 适配后的尺寸和缩放比例
 */
export function calculateFitSize(
    contentWidth: number,
    contentHeight: number,
    containerWidth: number,
    containerHeight: number
): {
    width: number
    height: number
    scale: number
    offsetX: number
    offsetY: number
} {
    if (contentWidth <= 0 || contentHeight <= 0 || containerWidth <= 0 || containerHeight <= 0) {
        return { width: 0, height: 0, scale: 1, offsetX: 0, offsetY: 0 }
    }

    const contentRatio = contentWidth / contentHeight
    const containerRatio = containerWidth / containerHeight

    let width: number
    let height: number
    let scale: number

    if (contentRatio > containerRatio) {
        // 内容更宽，以宽度为准
        width = containerWidth
        scale = containerWidth / contentWidth
        height = contentHeight * scale
    } else {
        // 内容更高，以高度为准
        height = containerHeight
        scale = containerHeight / contentHeight
        width = contentWidth * scale
    }

    // 居中偏移
    const offsetX = (containerWidth - width) / 2
    const offsetY = (containerHeight - height) / 2

    return {
        width: Math.floor(width),
        height: Math.floor(height),
        scale,
        offsetX,
        offsetY,
    }
}

/**
 * 根据目标分辨率和比例计算实际分辨率
 * 保持比例不变，调整到最接近的标准分辨率
 * 
 * @param targetWidth 目标宽度
 * @param targetHeight 目标高度
 * @param preset 比例预设
 * @returns 调整后的分辨率
 */
export function calculateResolution(
    targetWidth: number,
    targetHeight: number,
    preset: AspectRatioPreset
): [number, number] {
    // 使用预设的标准分辨率
    const [presetW, presetH] = preset.resolution

    // 找到最接近的缩放级别
    const scaleW = targetWidth / presetW
    const scaleH = targetHeight / presetH
    const scale = Math.min(scaleW, scaleH)

    if (scale >= 1) {
        // 目标大于等于预设，使用预设分辨率
        return preset.resolution
    }

    // 目标小于预设，按比例缩小
    return [
        Math.round(presetW * scale),
        Math.round(presetH * scale),
    ]
}
