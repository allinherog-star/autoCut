'use client'

/**
 * PreviewViewport - 严格比例预览容器
 * Maintains strict aspect ratio for preview content
 */

import React, { useRef, useState, useEffect } from 'react'
import type { PreviewViewportProps } from './types'

export function PreviewViewport({
    aspectRatio,
    children,
    maxWidth,
    maxHeight,
    fillContainer = false,
    rounded = true,
    shadow = true,
    className = '',
    style,
}: PreviewViewportProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const [size, setSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 })

    // 解析 aspectRatio (e.g. "9/16" -> 9/16)
    const parseAspectRatio = (ratio: string): number => {
        const parts = ratio.split('/')
        if (parts.length === 2) {
            return parseFloat(parts[0]) / parseFloat(parts[1])
        }
        return parseFloat(ratio) || 1
    }

    // 计算尺寸以适配容器
    useEffect(() => {
        const container = containerRef.current
        if (!container) return

        const ratio = parseAspectRatio(aspectRatio)

        const compute = () => {
            const rect = container.getBoundingClientRect()
            let availableW = rect.width
            let availableH = rect.height

            // 应用最大约束
            if (maxWidth && availableW > maxWidth) availableW = maxWidth
            if (maxHeight && availableH > maxHeight) availableH = maxHeight

            if (availableW <= 0 || availableH <= 0) return

            // 计算适配尺寸
            let width = availableW
            let height = width / ratio

            if (height > availableH) {
                height = availableH
                width = height * ratio
            }

            const next = { width: Math.floor(width), height: Math.floor(height) }
            setSize(prev => (prev.width === next.width && prev.height === next.height ? prev : next))
        }

        // 延迟计算避免初始布局问题
        const timer = requestAnimationFrame(compute)

        // 监听容器大小变化
        let ro: ResizeObserver | null = null
        try {
            ro = new ResizeObserver(() => requestAnimationFrame(compute))
            ro.observe(container)
        } catch {
            // 降级处理
        }

        return () => {
            cancelAnimationFrame(timer)
            ro?.disconnect()
        }
    }, [aspectRatio, maxWidth, maxHeight])

    const baseClasses = [
        'relative overflow-hidden bg-black',
        rounded ? 'rounded-lg' : '',
        shadow ? 'shadow-2xl' : '',
        className,
    ].filter(Boolean).join(' ')

    // 始终使用计算后的尺寸，确保有具体的宽高值
    const combinedStyle: React.CSSProperties = {
        width: size.width > 0 ? `${size.width}px` : undefined,
        height: size.height > 0 ? `${size.height}px` : undefined,
        boxShadow: shadow ? '0 0 0 1px rgba(255,255,255,0.08), 0 25px 60px -15px rgba(0,0,0,0.5)' : undefined,
        ...style,
    }

    return (
        <div
            ref={containerRef}
            className="w-full h-full flex items-center justify-center"
        >
            <div className={baseClasses} style={combinedStyle}>
                {children}
            </div>
        </div>
    )
}

