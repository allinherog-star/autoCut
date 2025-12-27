'use client'

/**
 * UniversalPreview - 通用预览组件
 * 
 * 支持多种视频比例的专业预览组件，参考 PR/AE/Figma 设计
 * 
 * 核心功能：
 * 1. 自动适配容器，保持内容比例
 * 2. 支持缩放和平移
 * 3. 提供坐标转换 API
 * 4. 显示网格、安全区、中心线等辅助元素
 */

import React, { useRef, useMemo, useCallback, forwardRef, useImperativeHandle } from 'react'
import type { UniversalPreviewProps, ElementTransformEvent, ElementDragEvent } from './types'
import { useCoordinateSystem } from './hooks/useCoordinateSystem'
import { usePreviewState } from './hooks/usePreviewState'
import { detectAspectRatio } from '@/lib/preview/aspect-ratios'
import type { ContentCoordinate } from '@/lib/preview/coordinate-system'

// ============================================================================
// Grid Component
// ============================================================================

function PreviewGrid({ show }: { show: boolean }) {
    if (!show) return null

    return (
        <div className="absolute inset-0 pointer-events-none">
            {/* 三分线 */}
            <div className="absolute top-1/3 left-0 right-0 h-px bg-white/10" />
            <div className="absolute top-2/3 left-0 right-0 h-px bg-white/10" />
            <div className="absolute left-1/3 top-0 bottom-0 w-px bg-white/10" />
            <div className="absolute left-2/3 top-0 bottom-0 w-px bg-white/10" />
        </div>
    )
}

// ============================================================================
// Center Lines Component  
// ============================================================================

function PreviewCenterLines({ show }: { show: boolean }) {
    if (!show) return null

    return (
        <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-0 right-0 h-px bg-violet-500/30" />
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-violet-500/30" />
        </div>
    )
}

// ============================================================================
// Safe Area Component
// ============================================================================

function PreviewSafeArea({ show }: { show: boolean }) {
    if (!show) return null

    return (
        <div className="absolute inset-2 border border-dashed border-[#333] rounded-md pointer-events-none opacity-30" />
    )
}

// ============================================================================
// Info Bar Component
// ============================================================================

function PreviewInfoBar({
    resolution,
    zoom,
    onZoomChange,
}: {
    resolution: [number, number]
    zoom: number
    onZoomChange: (zoom: number) => void
}) {
    const [w, h] = resolution
    const preset = detectAspectRatio(w, h)

    return (
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-black/60 backdrop-blur-sm flex items-center justify-between px-3 text-xs">
            {/* 左侧：分辨率信息 */}
            <div className="flex items-center gap-2">
                <span className="text-[#9aa]">{preset?.name || '自定义'}</span>
                <span className="text-[#666] font-mono">{w}×{h}</span>
            </div>

            {/* 右侧：缩放控制 */}
            <div className="flex items-center gap-2">
                <button
                    onClick={() => onZoomChange(Math.max(0.1, zoom - 0.1))}
                    className="w-5 h-5 flex items-center justify-center rounded hover:bg-white/10 transition-colors text-[#888]"
                >
                    −
                </button>
                <span className="text-[#888] font-mono w-12 text-center">
                    {Math.round(zoom * 100)}%
                </span>
                <button
                    onClick={() => onZoomChange(Math.min(5, zoom + 0.1))}
                    className="w-5 h-5 flex items-center justify-center rounded hover:bg-white/10 transition-colors text-[#888]"
                >
                    +
                </button>
                <button
                    onClick={() => onZoomChange(1)}
                    className="px-2 py-0.5 rounded hover:bg-white/10 transition-colors text-[#888]"
                >
                    重置
                </button>
            </div>
        </div>
    )
}

// ============================================================================
// Main Component
// ============================================================================

export interface UniversalPreviewRef {
    /** 坐标转换 */
    viewToContent: (viewPos: { x: number; y: number }) => ContentCoordinate
    contentToView: (contentPos: ContentCoordinate) => { x: number; y: number }
    /** 增量转换（用于拖拽） */
    viewDeltaToContentDelta: (delta: { x: number; y: number }) => ContentCoordinate
    /** 渲染尺寸 */
    renderSize: { width: number; height: number }
    /** 缩放比例 */
    scale: number
    /** 状态 */
    getZoom: () => number
    setZoom: (zoom: number) => void
    resetView: () => void
}

export const UniversalPreview = forwardRef<UniversalPreviewRef, UniversalPreviewProps>(
    function UniversalPreview(props, ref) {
        const {
            contentResolution,
            children,
            zoom: controlledZoom,
            onZoomChange,
            showGrid = false,
            showSafeArea = false,
            showCenterLines = false,
            showControls = true,
            className = '',
            style,
        } = props

        // Refs
        const containerRef = useRef<HTMLDivElement>(null)

        // 预览状态 (如果没有外部控制，使用内部状态)
        // 关键：先计算 currentZoom，再传给 useCoordinateSystem
        const { state, setZoom, reset } = usePreviewState({
            initialZoom: controlledZoom ?? 1,
        })

        const currentZoom = controlledZoom ?? state.zoom
        const handleZoomChange = onZoomChange ?? setZoom

        // 坐标系统
        // 关键修复：传入 currentZoom，确保坐标换算与视觉缩放一致
        const {
            context,
            containerSize,
            renderSize,
            scale,
            viewToContent,
            contentToView,
            viewDeltaToContentDelta,
        } = useCoordinateSystem(containerRef, { contentResolution, zoom: currentZoom })

        // 暴露给外部的方法
        useImperativeHandle(ref, () => ({
            viewToContent,
            contentToView,
            viewDeltaToContentDelta,
            renderSize,
            scale,
            getZoom: () => currentZoom,
            setZoom: handleZoomChange,
            resetView: reset,
        }), [viewToContent, contentToView, viewDeltaToContentDelta, renderSize, scale, currentZoom, handleZoomChange, reset])

        // 渲染区域样式
        const renderAreaStyle = useMemo(() => ({
            width: renderSize.width > 0 ? `${renderSize.width}px` : undefined,
            height: renderSize.height > 0 ? `${renderSize.height}px` : undefined,
            transform: currentZoom !== 1 ? `scale(${currentZoom})` : undefined,
            transformOrigin: 'center',
        }), [renderSize, currentZoom])

        return (
            <div
                ref={containerRef}
                className={`relative w-full h-full flex items-center justify-center overflow-hidden bg-[#0a0a0a] ${className}`}
                style={style}
            >
                {/* 渲染区域 */}
                {renderSize.width > 0 && renderSize.height > 0 && (
                    <div
                        className="relative bg-black shadow-2xl overflow-hidden"
                        style={renderAreaStyle}
                    >
                        {/* 内容 */}
                        {children}

                        {/* 辅助元素 */}
                        <PreviewGrid show={showGrid} />
                        <PreviewCenterLines show={showCenterLines} />
                        <PreviewSafeArea show={showSafeArea} />
                    </div>
                )}

                {/* 控制栏 */}
                {showControls && renderSize.width > 0 && (
                    <PreviewInfoBar
                        resolution={contentResolution}
                        zoom={currentZoom}
                        onZoomChange={handleZoomChange}
                    />
                )}
            </div>
        )
    }
)
