'use client'

/**
 * Device Preview - 类型定义
 * Types for the universal device preview component
 */

export type DeviceType = 'phone' | 'pc'

export type FrameStyle = 'minimal' | 'device' | 'none'

export interface DeviceConfig {
    id: DeviceType
    name: string
    description?: string
    aspectRatio: string      // CSS aspect-ratio value, e.g. "9/16"
    width: number            // Reference width in pixels
    height: number           // Reference height in pixels
}

/**
 * 预定义设备配置
 */
export const DEVICE_CONFIGS: Record<DeviceType, DeviceConfig> = {
    phone: {
        id: 'phone',
        name: '手机竖屏',
        description: '适用于抖音、快手、小红书等短视频平台',
        aspectRatio: '9/16',
        width: 1080,
        height: 1920,
    },
    pc: {
        id: 'pc',
        name: 'PC横屏',
        description: '适用于B站、YouTube等长视频平台',
        aspectRatio: '16/9',
        width: 1920,
        height: 1080,
    },
}

/**
 * DevicePreview 组件属性
 */
export interface DevicePreviewProps {
    /** 设备类型 */
    device: DeviceType
    /** 子内容 */
    children: React.ReactNode
    /** 最大宽度约束 */
    maxWidth?: number
    /** 最大高度约束 */
    maxHeight?: number
    /** 是否填充父容器 */
    fillContainer?: boolean
    /** 是否显示设备外框 */
    showFrame?: boolean
    /** 外框样式 */
    frameStyle?: FrameStyle
    /** 是否圆角 */
    rounded?: boolean
    /** 是否显示阴影 */
    shadow?: boolean
    /** 自定义类名 */
    className?: string
    /** 自定义样式 */
    style?: React.CSSProperties
    /** 点击回调 */
    onClick?: () => void
}

/**
 * PreviewViewport 组件属性
 */
export interface PreviewViewportProps {
    /** 宽高比 (CSS aspect-ratio) */
    aspectRatio: string
    /** 子内容 */
    children: React.ReactNode
    /** 最大宽度 */
    maxWidth?: number
    /** 最大高度 */
    maxHeight?: number
    /** 是否填充容器 */
    fillContainer?: boolean
    /** 圆角 */
    rounded?: boolean
    /** 阴影 */
    shadow?: boolean
    /** 自定义类名 */
    className?: string
    /** 自定义样式 */
    style?: React.CSSProperties
}

/**
 * DeviceFrame 组件属性
 */
export interface DeviceFrameProps {
    /** 设备类型 */
    device: DeviceType
    /** 外框样式 */
    frameStyle: FrameStyle
    /** 子内容 (viewport) */
    children: React.ReactNode
    /** 自定义类名 */
    className?: string
}
