'use client'

/**
 * useCoordinateSystem Hook
 * 
 * 管理预览组件的坐标系统，实现 View ↔ Content 坐标转换
 * 参考 PR/AE/Figma 的三层坐标空间架构
 */

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
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
    /**
     * 当前视图缩放（受控）
     * - 该值应与渲染层实际使用的 zoom 保持一致（例如 CSS transform: scale）
     * - 用于确保坐标换算与视觉缩放一致，避免拖拽“越拉越远”等比例误差
     */
    zoom?: number
    /**
     * 当前视图偏移（受控，屏幕像素）
     * - 未来支持平移时使用；目前默认 0
     */
    offset?: { x: number; y: number }
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
    const { contentResolution, zoom = 1, offset = { x: 0, y: 0 } } = options

    // 容器尺寸
    const [containerSize, setContainerSize] = useState({ width: 0, height: 0 })

    // 视图缩放/偏移由外部受控（与渲染层保持一致）
    const viewZoom = zoom
    const viewOffset = offset

    // 计算适配后的渲染尺寸
    const fitResult = useMemo(() => {
        const [contentW, contentH] = contentResolution
        return calculateFitSize(contentW, contentH, containerSize.width, containerSize.height)
    }, [contentResolution, containerSize])

    // 构建坐标系统上下文
    // 关键修复：将 fitResult.scale 传入 context，避免 canvasSize 为 0 时计算错误
    // 这解决了"首次拖动素材时坐标偏移"的问题
    const context: CoordinateSystemContext = useMemo(() => {
        return {
            contentResolution,
            canvasSize: { width: fitResult.width, height: fitResult.height },
            viewZoom,
            viewOffset,
            canvasScale: fitResult.scale, // 预计算的缩放比例
        }
    }, [contentResolution, fitResult.width, fitResult.height, fitResult.scale, viewZoom, viewOffset])

    // 监听容器尺寸变化
    // 使用 useLayoutEffect 确保尺寸在浏览器重绘之前同步计算
    // 这是修复"首次拖动素材时坐标偏移"问题的关键
    // 因为 useEffect 是异步的，可能导致用户在尺寸更新前就开始拖动
    useLayoutEffect(() => {
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

        // 初始计算（同步执行，确保在用户交互前完成）
        updateSize()

        // ResizeObserver 监听后续变化
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
