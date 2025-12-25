/**
 * 预览坐标系统 - 三层坐标空间分离架构
 * Preview Coordinate System - Three-layer coordinate space separation
 * 
 * 对标达芬奇/AE/Figma/PS 等专业软件的实现
 * 
 * 三层坐标空间：
 * 1. Content Space (内容坐标系) - VEIR 的世界，基于 meta.resolution
 * 2. Canvas Space (画布坐标系) - 实际渲染尺寸
 * 3. View Space (视图坐标系) - 预览缩放/拖拽，仅用于 UI
 */

// ============================================================================
// Types - 坐标类型定义
// ============================================================================

/**
 * 内容坐标（Content Space）
 * - 基于 VEIR meta.resolution
 * - 使用归一化坐标（0-1）
 * - 原点在左上角
 * - 所有 Transform/offset 都定义在这里
 */
export interface ContentCoordinate {
    /** 归一化 X 坐标 (0-1) */
    x: number
    /** 归一化 Y 坐标 (0-1) */
    y: number
}

/**
 * 画布坐标（Canvas Space）
 * - 实际 Canvas 的像素尺寸
 * - 基于当前渲染 canvas 的大小
 */
export interface CanvasCoordinate {
    /** 画布像素 X */
    x: number
    /** 画布像素 Y */
    y: number
}

/**
 * 视图坐标（View Space）
 * - 屏幕像素坐标
 * - 用于用户交互（鼠标位置等）
 */
export interface ViewCoordinate {
    /** 屏幕像素 X */
    x: number
    /** 屏幕像素 Y */
    y: number
}

/**
 * 坐标系统上下文
 * 包含所有坐标转换所需的参数
 */
export interface CoordinateSystemContext {
    /** VEIR meta.resolution [width, height] */
    contentResolution: [number, number]
    /** 实际 Canvas 渲染尺寸 */
    canvasSize: { width: number; height: number }
    /** 预览缩放级别（1 = 100%） */
    viewZoom: number
    /** 预览平移偏移（屏幕像素） */
    viewOffset: { x: number; y: number }
}

// ============================================================================
// Derived Values - 派生值计算
// ============================================================================

/**
 * 计算 Canvas 适配缩放比例
 * Content → Canvas 的等比缩放
 */
export function getCanvasScale(ctx: CoordinateSystemContext): number {
    const [contentW, contentH] = ctx.contentResolution
    const { width: canvasW, height: canvasH } = ctx.canvasSize

    if (contentW <= 0 || contentH <= 0 || canvasW <= 0 || canvasH <= 0) {
        return 1
    }

    return Math.min(canvasW / contentW, canvasH / contentH)
}

/**
 * 计算总缩放系数
 * View → Content 的综合缩放
 */
export function getTotalScale(ctx: CoordinateSystemContext): number {
    return getCanvasScale(ctx) * ctx.viewZoom
}

// ============================================================================
// Coordinate Transforms - 坐标转换函数
// ============================================================================

/**
 * View Space → Content Space (增量)
 * 将视图坐标系的位移转换为内容坐标系的位移
 * 
 * 典型用途：用户拖拽素材时，将鼠标移动距离转换为内容坐标系的偏移量
 * 
 * @param viewDelta - 视图坐标系的位移（屏幕像素）
 * @param ctx - 坐标系统上下文
 * @returns 内容坐标系的位移（归一化 0-1）
 */
export function viewDeltaToContentDelta(
    viewDelta: ViewCoordinate,
    ctx: CoordinateSystemContext
): ContentCoordinate {
    const totalScale = getTotalScale(ctx)
    const [contentW, contentH] = ctx.contentResolution

    if (totalScale <= 0 || contentW <= 0 || contentH <= 0) {
        return { x: 0, y: 0 }
    }

    // 1. 视图像素 → 内容像素（除以总缩放）
    const contentPixelDeltaX = viewDelta.x / totalScale
    const contentPixelDeltaY = viewDelta.y / totalScale

    // 2. 内容像素 → 归一化坐标
    return {
        x: contentPixelDeltaX / contentW,
        y: contentPixelDeltaY / contentH,
    }
}

/**
 * Content Space → View Space (增量)
 * 将内容坐标系的位移转换为视图坐标系的位移
 * 
 * 典型用途：渲染时将 VEIR 的 offset 转换为屏幕位置
 * 
 * @param contentDelta - 内容坐标系的位移（归一化 0-1）
 * @param ctx - 坐标系统上下文
 * @returns 视图坐标系的位移（屏幕像素）
 */
export function contentDeltaToViewDelta(
    contentDelta: ContentCoordinate,
    ctx: CoordinateSystemContext
): ViewCoordinate {
    const totalScale = getTotalScale(ctx)
    const [contentW, contentH] = ctx.contentResolution

    // 1. 归一化坐标 → 内容像素
    const contentPixelDeltaX = contentDelta.x * contentW
    const contentPixelDeltaY = contentDelta.y * contentH

    // 2. 内容像素 → 视图像素（乘以总缩放）
    return {
        x: contentPixelDeltaX * totalScale,
        y: contentPixelDeltaY * totalScale,
    }
}

/**
 * View Space → Content Space (绝对位置)
 * 将视图中的点击位置转换为内容坐标系的位置
 * 
 * @param viewPos - 相对于视图容器左上角的屏幕像素位置
 * @param ctx - 坐标系统上下文
 * @param containerOffset - 视图容器相对于画布中心的偏移（用于居中布局）
 * @returns 内容坐标系的位置（归一化 0-1）
 */
export function viewPosToContentPos(
    viewPos: ViewCoordinate,
    ctx: CoordinateSystemContext,
    containerOffset: { x: number; y: number } = { x: 0, y: 0 }
): ContentCoordinate {
    const totalScale = getTotalScale(ctx)
    const [contentW, contentH] = ctx.contentResolution

    if (totalScale <= 0 || contentW <= 0 || contentH <= 0) {
        return { x: 0, y: 0 }
    }

    // 考虑视图偏移和容器偏移
    const adjustedX = (viewPos.x - ctx.viewOffset.x - containerOffset.x) / totalScale
    const adjustedY = (viewPos.y - ctx.viewOffset.y - containerOffset.y) / totalScale

    return {
        x: adjustedX / contentW,
        y: adjustedY / contentH,
    }
}

/**
 * Content Space → View Space (绝对位置)
 * 将内容坐标系的位置转换为视图中的渲染位置
 * 
 * @param contentPos - 内容坐标系的位置（归一化 0-1）
 * @param ctx - 坐标系统上下文
 * @param containerOffset - 视图容器相对于画布中心的偏移
 * @returns 相对于视图容器左上角的屏幕像素位置
 */
export function contentPosToViewPos(
    contentPos: ContentCoordinate,
    ctx: CoordinateSystemContext,
    containerOffset: { x: number; y: number } = { x: 0, y: 0 }
): ViewCoordinate {
    const totalScale = getTotalScale(ctx)
    const [contentW, contentH] = ctx.contentResolution

    // 归一化 → 内容像素 → 视图像素
    const viewX = contentPos.x * contentW * totalScale + ctx.viewOffset.x + containerOffset.x
    const viewY = contentPos.y * contentH * totalScale + ctx.viewOffset.y + containerOffset.y

    return { x: viewX, y: viewY }
}

// ============================================================================
// Utility Functions - 工具函数
// ============================================================================

/**
 * 创建默认坐标系统上下文
 */
export function createDefaultContext(
    contentResolution: [number, number] = [1920, 1080],
    canvasSize: { width: number; height: number } = { width: 1920, height: 1080 }
): CoordinateSystemContext {
    return {
        contentResolution,
        canvasSize,
        viewZoom: 1,
        viewOffset: { x: 0, y: 0 },
    }
}

/**
 * 归一化坐标 → 百分比（0-100）
 * 用于与现有代码兼容
 */
export function normalizedToPercent(normalized: ContentCoordinate): { x: number; y: number } {
    return {
        x: normalized.x * 100,
        y: normalized.y * 100,
    }
}

/**
 * 百分比（0-100）→ 归一化坐标
 * 用于与现有代码兼容
 */
export function percentToNormalized(percent: { x: number; y: number }): ContentCoordinate {
    return {
        x: percent.x / 100,
        y: percent.y / 100,
    }
}

/**
 * 将归一化坐标转换为 VEIR Transform.offset 格式
 * VEIR offset 使用像素单位，基于 meta.resolution
 */
export function normalizedToVeirOffset(
    normalized: ContentCoordinate,
    resolution: [number, number]
): [number, number] {
    return [
        normalized.x * resolution[0],
        normalized.y * resolution[1],
    ]
}

/**
 * 将 VEIR Transform.offset 转换为归一化坐标
 */
export function veirOffsetToNormalized(
    offset: [number, number],
    resolution: [number, number]
): ContentCoordinate {
    return {
        x: offset[0] / resolution[0],
        y: offset[1] / resolution[1],
    }
}

// ============================================================================
// Export Composer Integration - 导出合成器集成
// ============================================================================

/**
 * 百分比坐标 → 画布像素坐标（中心原点）
 * 用于导出合成器渲染，确保预览和导出效果一致
 * 
 * 预览组件使用：left/top: ${percent}% (左上角原点)
 * 导出合成器使用：x/y 像素 (中心原点)
 * 
 * 这个函数将预览的百分比坐标转换为导出合成器的像素坐标
 * 
 * @param percentX - 百分比 X (0-100)
 * @param percentY - 百分比 Y (0-100)
 * @param canvasWidth - 画布宽度（像素）
 * @param canvasHeight - 画布高度（像素）
 * @returns 画布像素坐标（中心原点）
 */
export function percentToCanvasPixel(
    percentX: number,
    percentY: number,
    canvasWidth: number,
    canvasHeight: number
): { x: number; y: number } {
    // 百分比 → 像素（左上角原点）
    const pixelX = (percentX / 100) * canvasWidth
    const pixelY = (percentY / 100) * canvasHeight

    // 无需额外转换，导出合成器的 Fabric.js 使用 originX/originY='center'
    // 所以传入的坐标就是元素中心的位置
    return { x: pixelX, y: pixelY }
}

/**
 * 画布像素坐标（中心原点）→ 百分比坐标
 * 用于从导出合成器的位置反推到预览组件的位置
 * 
 * @param pixelX - 像素 X
 * @param pixelY - 像素 Y
 * @param canvasWidth - 画布宽度（像素）
 * @param canvasHeight - 画布高度（像素）
 * @returns 百分比坐标 (0-100)
 */
export function canvasPixelToPercent(
    pixelX: number,
    pixelY: number,
    canvasWidth: number,
    canvasHeight: number
): { x: number; y: number } {
    return {
        x: (pixelX / canvasWidth) * 100,
        y: (pixelY / canvasHeight) * 100,
    }
}

/**
 * 确保预览和导出使用相同的定位逻辑
 * 
 * 核心原则：
 * 1. 内容坐标系使用归一化坐标 (0-1) 或百分比 (0-100)
 * 2. 预览组件：CSS left/top 百分比，translate(-50%, -50%) 居中
 * 3. 导出合成器：Fabric.js 像素坐标，originX/originY='center'
 * 4. 两者视觉效果完全一致
 */
export function getUnifiedPosition(
    percentX: number,
    percentY: number,
    canvasWidth: number,
    canvasHeight: number,
    elementWidth: number = 0,
    elementHeight: number = 0
): {
    // 用于预览组件的 CSS
    previewStyle: { left: string; top: string; transform: string };
    // 用于导出合成器的 Fabric.js
    exportPosition: { x: number; y: number };
} {
    return {
        previewStyle: {
            left: `${percentX}%`,
            top: `${percentY}%`,
            transform: 'translate(-50%, -50%)', // 居中对齐
        },
        exportPosition: percentToCanvasPixel(percentX, percentY, canvasWidth, canvasHeight),
    }
}

