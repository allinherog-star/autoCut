'use client'

/**
 * Responsive Preview - 类型定义
 * Types for the unified responsive preview component
 */

export type AspectRatioPreset = '9/16' | '16/9' | '3/4' | '4/3' | '1/1' | 'auto'

export type ContainerOrientation = 'portrait' | 'landscape' | 'square'

export interface ContainerInfo {
    width: number
    height: number
    orientation: ContainerOrientation
    aspectRatio: number  // width / height
}

export interface ResponsivePreviewProps {
    /** 子内容 */
    children: React.ReactNode
    /** 宽高比预设，'auto' 时根据容器自动选择 */
    aspectRatio?: AspectRatioPreset
    /** 强制锁定特定比例 (覆盖 aspectRatio) */
    lockedRatio?: string
    /** 是否圆角 */
    rounded?: boolean
    /** 是否显示阴影 */
    shadow?: boolean
    /** 自定义类名 */
    className?: string
    /** 自定义样式 */
    style?: React.CSSProperties
}

/**
 * 预设比例到数值的映射
 */
export const ASPECT_RATIO_VALUES: Record<Exclude<AspectRatioPreset, 'auto'>, number> = {
    '9/16': 9 / 16,
    '16/9': 16 / 9,
    '3/4': 3 / 4,
    '4/3': 4 / 3,
    '1/1': 1,
}

/**
 * 根据容器方向选择最优比例
 */
export function selectOptimalRatio(orientation: ContainerOrientation): AspectRatioPreset {
    switch (orientation) {
        case 'portrait':
            return '9/16'
        case 'landscape':
            return '16/9'
        case 'square':
            return '1/1'
    }
}
