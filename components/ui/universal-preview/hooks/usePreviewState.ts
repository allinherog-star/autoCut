'use client'

/**
 * usePreviewState Hook
 * 
 * 管理预览组件的状态（缩放、平移、选中元素等）
 */

import { useCallback, useState } from 'react'
import type { PreviewState, UsePreviewStateResult } from '../types'

interface UsePreviewStateOptions {
    /** 初始缩放 */
    initialZoom?: number
    /** 初始选中元素 */
    initialSelectedId?: string | null
    /** 缩放范围 */
    zoomRange?: { min: number; max: number }
}

const DEFAULT_ZOOM_RANGE = { min: 0.1, max: 5 }

/**
 * 预览状态 Hook
 */
export function usePreviewState(options: UsePreviewStateOptions = {}): UsePreviewStateResult {
    const {
        initialZoom = 1,
        initialSelectedId = null,
        zoomRange = DEFAULT_ZOOM_RANGE,
    } = options

    const [state, setState] = useState<PreviewState>({
        zoom: initialZoom,
        offset: { x: 0, y: 0 },
        isPanning: false,
        selectedElementId: initialSelectedId,
    })

    // 设置缩放（带范围限制）
    const setZoom = useCallback((zoom: number) => {
        setState(prev => ({
            ...prev,
            zoom: Math.max(zoomRange.min, Math.min(zoomRange.max, zoom)),
        }))
    }, [zoomRange])

    // 设置偏移
    const setOffset = useCallback((offset: { x: number; y: number }) => {
        setState(prev => ({ ...prev, offset }))
    }, [])

    // 开始平移
    const startPan = useCallback(() => {
        setState(prev => ({ ...prev, isPanning: true }))
    }, [])

    // 结束平移
    const endPan = useCallback(() => {
        setState(prev => ({ ...prev, isPanning: false }))
    }, [])

    // 选择元素
    const selectElement = useCallback((id: string | null) => {
        setState(prev => ({ ...prev, selectedElementId: id }))
    }, [])

    // 重置状态
    const reset = useCallback(() => {
        setState({
            zoom: initialZoom,
            offset: { x: 0, y: 0 },
            isPanning: false,
            selectedElementId: null,
        })
    }, [initialZoom])

    return {
        state,
        setZoom,
        setOffset,
        startPan,
        endPan,
        selectElement,
        reset,
    }
}
