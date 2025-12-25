'use client'

/**
 * ResponsivePreview - 统一响应式预览组件
 * Unified responsive preview component that auto-adapts to container
 */

import React, { useMemo } from 'react'
import { useContainerQuery } from './useContainerQuery'
import {
    type ResponsivePreviewProps,
    type AspectRatioPreset,
    ASPECT_RATIO_VALUES,
    selectOptimalRatio,
} from './types'

export function ResponsivePreview({
    children,
    aspectRatio = 'auto',
    lockedRatio,
    rounded = true,
    shadow = true,
    className = '',
    style,
}: ResponsivePreviewProps) {
    const { ref, container } = useContainerQuery()

    // 确定实际使用的比例
    const effectiveRatio = useMemo(() => {
        // 如果锁定了比例，直接使用
        if (lockedRatio) return lockedRatio

        // 自动模式：根据容器方向选择
        if (aspectRatio === 'auto') {
            const optimal = selectOptimalRatio(container.orientation)
            return optimal
        }

        return aspectRatio
    }, [aspectRatio, lockedRatio, container.orientation])

    // 计算内容区域的实际尺寸
    const contentSize = useMemo(() => {
        const { width: containerW, height: containerH } = container
        if (containerW <= 0 || containerH <= 0) {
            return { width: 0, height: 0 }
        }

        // 解析比例字符串
        const parseRatio = (ratio: string): number => {
            const parts = ratio.split('/')
            if (parts.length === 2) {
                return parseFloat(parts[0]) / parseFloat(parts[1])
            }
            return parseFloat(ratio) || 1
        }

        const targetRatio = parseRatio(effectiveRatio)

        // 计算最大适配尺寸
        let width = containerW
        let height = width / targetRatio

        if (height > containerH) {
            height = containerH
            width = height * targetRatio
        }

        return {
            width: Math.floor(width),
            height: Math.floor(height),
        }
    }, [container, effectiveRatio])

    // 容器样式
    const containerClasses = 'w-full h-full flex items-center justify-center'

    // 内容样式
    const contentClasses = [
        'relative overflow-hidden bg-black',
        rounded ? 'rounded-lg' : '',
        shadow ? 'shadow-2xl' : '',
        className,
    ].filter(Boolean).join(' ')

    const contentStyle: React.CSSProperties = {
        width: contentSize.width > 0 ? `${contentSize.width}px` : undefined,
        height: contentSize.height > 0 ? `${contentSize.height}px` : undefined,
        boxShadow: shadow
            ? '0 0 0 1px rgba(255,255,255,0.08), 0 25px 60px -15px rgba(0,0,0,0.5)'
            : undefined,
        ...style,
    }

    return (
        <div ref={ref} className={containerClasses}>
            <div className={contentClasses} style={contentStyle}>
                {children}
            </div>
        </div>
    )
}
