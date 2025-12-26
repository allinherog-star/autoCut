'use client'

/**
 * useCoordinateSystem Hook
 * 
 * 管理预览组件的坐标系统，实现 View ↔ Content 坐标转换
 * 参考 PR/AE/Figma 的三层坐标空间架构
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { RefObject } from 'react'
import {
    type CoordinateSystemContext,
    type ContentCoordinate,
    type ViewCoordinate,
    createDefaultContext,
    viewDeltaToContentDelta as _viewDeltaToContentDelta,
    contentDeltaToViewDelta,
    viewPosToContentPos,
    contentPosToViewPos,
    getCanvasScale,
} from '@/lib/preview/coordinate-system'
import { calculateFitSize } from '@/lib/preview/aspect-ratios'
import type { UseCoordinateSystemResult } from '../types'

interface UseCoordinateSystemOptions {
    /** 内容分辨率 [width, height] */
    contentResolution: [number, number]
    /** 初始缩放 */
    initialZoom?: number
    /** 初始偏移 */
    initialOffset?: { x: number; y: number }
}

/**
 * 坐标系统 Hook
 * 
 * 核心功能：
 * 1. 监听容器尺寸变化
 * 2. 计算适配后的渲染尺寸和缩放
 * 3. 提供 View ↔ Content 坐标转换函数
 */
export function useCoordinateSystem(
    containerRef: RefObject<HTMLElement | null>,
    options: UseCoordinateSystemOptions
): UseCoordinateSystemResult {
    const { contentResolution, initialZoom = 1, initialOffset = { x: 0, y: 0 } } = options

    // 容器尺寸
    const [containerSize, setContainerSize] = useState({ width: 0, height: 0 })

    // 视图缩放和偏移
    const [viewZoom, setViewZoom] = useState(initialZoom)
    const [viewOffset, setViewOffset] = useState(initialOffset)

    // 计算适配后的渲染尺寸
    const fitResult = useMemo(() => {
        const [contentW, contentH] = contentResolution
        return calculateFitSize(contentW, contentH, containerSize.width, containerSize.height)
    }, [contentResolution, containerSize])

    // 构建坐标系统上下文
    const context: CoordinateSystemContext = useMemo(() => {
        return {
            contentResolution,
            canvasSize: { width: fitResult.width, height: fitResult.height },
            viewZoom,
            viewOffset,
        }
    }, [contentResolution, fitResult.width, fitResult.height, viewZoom, viewOffset])

    // 监听容器尺寸变化
    useEffect(() => {
        const container = containerRef.current
        if (!container) return

        const updateSize = () => {
            const rect = container.getBoundingClientRect()
            setContainerSize(prev => {
                const newW = Math.floor(rect.width)
                const newH = Math.floor(rect.height)
                if (prev.width === newW && prev.height === newH) return prev
                return { width: newW, height: newH }
            })
        }

        // 初始计算
        updateSize()

        // ResizeObserver
        let observer: ResizeObserver | null = null
        try {
            observer = new ResizeObserver(() => {
                requestAnimationFrame(updateSize)
            })
            observer.observe(container)
        } catch {
            // 降级：窗口 resize 事件
            window.addEventListener('resize', updateSize)
        }

        return () => {
            observer?.disconnect()
            window.removeEventListener('resize', updateSize)
        }
    }, [containerRef])

    // View → Content 坐标转换（绝对位置）
    const viewToContent = useCallback(
        (viewPos: ViewCoordinate): ContentCoordinate => {
            return viewPosToContentPos(viewPos, context, {
                x: fitResult.offsetX,
                y: fitResult.offsetY,
            })
        },
        [context, fitResult.offsetX, fitResult.offsetY]
    )

    // Content → View 坐标转换（绝对位置）
    const contentToView = useCallback(
        (contentPos: ContentCoordinate): ViewCoordinate => {
            return contentPosToViewPos(contentPos, context, {
                x: fitResult.offsetX,
                y: fitResult.offsetY,
            })
        },
        [context, fitResult.offsetX, fitResult.offsetY]
    )

    // View → Content 增量转换（用于拖拽）
    const viewDeltaToContentDelta = useCallback(
        (delta: ViewCoordinate): ContentCoordinate => {
            return _viewDeltaToContentDelta(delta, context)
        },
        [context]
    )

    return {
        context,
        containerSize,
        renderSize: { width: fitResult.width, height: fitResult.height },
        scale: fitResult.scale,
        viewToContent,
        contentToView,
        viewDeltaToContentDelta,
    }
}
