'use client'

/**
 * useContainerQuery - 容器尺寸检测 Hook
 * Detects container dimensions and orientation using ResizeObserver
 */

import { useRef, useState, useEffect, useCallback, type RefObject } from 'react'
import type { ContainerInfo, ContainerOrientation } from './types'

export function useContainerQuery<T extends HTMLElement = HTMLDivElement>(): {
    ref: RefObject<T | null>
    container: ContainerInfo
} {
    const ref = useRef<T>(null)
    const [container, setContainer] = useState<ContainerInfo>({
        width: 0,
        height: 0,
        orientation: 'portrait',
        aspectRatio: 0,
    })

    const getOrientation = useCallback((width: number, height: number): ContainerOrientation => {
        if (width === 0 || height === 0) return 'portrait'
        const ratio = width / height
        if (ratio > 1.1) return 'landscape'
        if (ratio < 0.9) return 'portrait'
        return 'square'
    }, [])

    useEffect(() => {
        const element = ref.current
        if (!element) return

        const updateSize = () => {
            const rect = element.getBoundingClientRect()
            const { width, height } = rect
            const orientation = getOrientation(width, height)
            const aspectRatio = height > 0 ? width / height : 0

            setContainer(prev => {
                // 避免不必要的更新
                if (
                    prev.width === Math.floor(width) &&
                    prev.height === Math.floor(height)
                ) {
                    return prev
                }
                return {
                    width: Math.floor(width),
                    height: Math.floor(height),
                    orientation,
                    aspectRatio,
                }
            })
        }

        // 初始测量
        const raf = requestAnimationFrame(updateSize)

        // ResizeObserver 监听
        let ro: ResizeObserver | null = null
        try {
            ro = new ResizeObserver(() => {
                requestAnimationFrame(updateSize)
            })
            ro.observe(element)
        } catch {
            // 降级：使用 window resize
            window.addEventListener('resize', updateSize)
        }

        return () => {
            cancelAnimationFrame(raf)
            ro?.disconnect()
            window.removeEventListener('resize', updateSize)
        }
    }, [getOrientation])

    return { ref, container }
}
