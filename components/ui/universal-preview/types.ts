/**
 * 通用预览组件 - 类型定义
 * Universal Preview Component - Type Definitions
 */

import type { CoordinateSystemContext, ContentCoordinate, ViewCoordinate } from '@/lib/preview/coordinate-system'
import type { AspectRatioPreset } from '@/lib/preview/aspect-ratios'

// ============================================================================
// Core Types
// ============================================================================

/**
 * 预览状态
 */
export interface PreviewState {
    /** 缩放级别 (1 = 100%) */
    zoom: number
    /** 平移偏移 */
    offset: { x: number; y: number }
    /** 是否正在拖拽画布 */
    isPanning: boolean
    /** 选中的元素 ID */
    selectedElementId: string | null
}

/**
 * 播放状态
 */
export interface PlaybackState {
    /** 是否正在播放 */
    isPlaying: boolean
    /** 当前时间 (秒) */
    currentTime: number
    /** 总时长 (秒) */
    duration: number
    /** 是否静音 */
    isMuted: boolean
    /** 音量 (0-1) */
    volume: number
}

/**
 * 元素拖拽事件
 */
export interface ElementDragEvent {
    /** 元素 ID */
    elementId: string
    /** 内容坐标系的位移 (归一化 0-1) */
    delta: ContentCoordinate
    /** 新的绝对位置 (归一化 0-1) */
    position: ContentCoordinate
}

/**
 * 元素变换事件
 */
export interface ElementTransformEvent {
    /** 元素 ID */
    elementId: string
    /** 位置百分比 (0-100) */
    xPercent?: number
    yPercent?: number
    /** 缩放 */
    scale?: number
    /** 旋转角度 */
    rotation?: number
}

// ============================================================================
// Component Props
// ============================================================================

/**
 * UniversalPreview 组件属性
 */
export interface UniversalPreviewProps {
    // 内容配置
    /** 内容分辨率 (VEIR meta.resolution) [width, height] */
    contentResolution: [number, number]
    /** 内容渲染 */
    children: React.ReactNode

    // 播放控制
    /** 是否正在播放 */
    isPlaying?: boolean
    /** 当前时间 (秒) */
    currentTime?: number
    /** 总时长 (秒) */
    duration?: number
    /** 时间变化回调 */
    onTimeChange?: (time: number) => void
    /** 播放/暂停切换回调 */
    onPlayPauseToggle?: () => void

    // 视图控制
    /** 缩放级别 */
    zoom?: number
    /** 缩放变化回调 */
    onZoomChange?: (zoom: number) => void
    /** 是否允许画布平移 */
    allowPan?: boolean

    // 元素交互
    /** 选中的元素 ID */
    selectedElementId?: string | null
    /** 元素选择回调 */
    onElementSelect?: (elementId: string | null) => void
    /** 元素拖拽回调 */
    onElementDrag?: (event: ElementDragEvent) => void
    /** 元素变换回调 (兼容现有 API) */
    onElementTransform?: (event: ElementTransformEvent) => void

    // 显示选项
    /** 是否显示网格 */
    showGrid?: boolean
    /** 是否显示安全区 */
    showSafeArea?: boolean
    /** 是否显示中心线 */
    showCenterLines?: boolean
    /** 是否显示控制栏 */
    showControls?: boolean

    // 样式
    className?: string
    style?: React.CSSProperties
}

/**
 * PreviewCanvas 组件属性
 */
export interface PreviewCanvasProps {
    /** 内容分辨率 */
    contentResolution: [number, number]
    /** Canvas 渲染内容 */
    children: React.ReactNode
    /** 坐标系统上下文 */
    coordinateContext: CoordinateSystemContext
    /** 是否显示网格 */
    showGrid?: boolean
    /** 是否显示安全区 */
    showSafeArea?: boolean
    /** 是否显示中心线 */
    showCenterLines?: boolean
    /** 容器类名 */
    className?: string
}

/**
 * PreviewControls 组件属性
 */
export interface PreviewControlsProps {
    /** 分辨率 */
    resolution: [number, number]
    /** 检测到的比例预设 */
    aspectRatioPreset?: AspectRatioPreset | null
    /** 缩放级别 */
    zoom: number
    /** 缩放变化回调 */
    onZoomChange: (zoom: number) => void
    /** 适应容器 */
    onFitToContainer: () => void
    /** 重置缩放 */
    onResetZoom: () => void
    /** 显示选项 */
    showGrid?: boolean
    onToggleGrid?: () => void
    showSafeArea?: boolean
    onToggleSafeArea?: () => void
    /** 容器类名 */
    className?: string
}

// ============================================================================
// Hook Types
// ============================================================================

/**
 * useCoordinateSystem Hook 返回值
 */
export interface UseCoordinateSystemResult {
    /** 坐标系统上下文 */
    context: CoordinateSystemContext
    /** 容器尺寸 */
    containerSize: { width: number; height: number }
    /** 渲染尺寸 (适配后) */
    renderSize: { width: number; height: number }
    /** 缩放比例 */
    scale: number
    /** View → Content 坐标转换 */
    viewToContent: (viewPos: ViewCoordinate) => ContentCoordinate
    /** Content → View 坐标转换 */
    contentToView: (contentPos: ContentCoordinate) => ViewCoordinate
    /** View → Content 增量转换 (用于拖拽) */
    viewDeltaToContentDelta: (delta: ViewCoordinate) => ContentCoordinate
}

/**
 * usePreviewState Hook 返回值
 */
export interface UsePreviewStateResult {
    /** 预览状态 */
    state: PreviewState
    /** 设置缩放 */
    setZoom: (zoom: number) => void
    /** 设置偏移 */
    setOffset: (offset: { x: number; y: number }) => void
    /** 开始平移 */
    startPan: () => void
    /** 结束平移 */
    endPan: () => void
    /** 选择元素 */
    selectElement: (id: string | null) => void
    /** 重置状态 */
    reset: () => void
}
