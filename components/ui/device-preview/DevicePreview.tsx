'use client'

/**
 * DevicePreview - 通用设备预览组件
 * Universal device preview component for mobile and PC
 */

import React, { useState, useEffect } from 'react'
import { PreviewViewport } from './PreviewViewport'
import { DeviceFrame } from './DeviceFrame'
import { DEVICE_CONFIGS, type DevicePreviewProps } from './types'

export function DevicePreview({
    device,
    children,
    maxWidth,
    maxHeight,
    fillContainer = false,
    showFrame = false,
    frameStyle = 'minimal',
    rounded = true,
    shadow = true,
    className = '',
    style,
    onClick,
}: DevicePreviewProps) {
    // 客户端挂载标志（避免 SSR hydration mismatch）
    const [isMounted, setIsMounted] = useState(false)
    useEffect(() => {
        setIsMounted(true)
    }, [])

    const config = DEVICE_CONFIGS[device]

    // SSR 安全：初始渲染使用默认值
    const effectiveDevice = isMounted ? device : 'phone'
    const effectiveConfig = DEVICE_CONFIGS[effectiveDevice]

    const viewport = (
        <PreviewViewport
            aspectRatio={effectiveConfig.aspectRatio}
            maxWidth={maxWidth}
            maxHeight={maxHeight}
            fillContainer={fillContainer}
            rounded={rounded && !showFrame}
            shadow={shadow && !showFrame}
            className={showFrame ? '' : className}
            style={showFrame ? undefined : style}
        >
            {children}
        </PreviewViewport>
    )

    // 带外框
    if (showFrame && frameStyle !== 'none') {
        return (
            <div className={`${fillContainer ? 'w-full h-full' : ''} ${className}`} style={style} onClick={onClick}>
                <DeviceFrame device={effectiveDevice} frameStyle={frameStyle}>
                    {viewport}
                </DeviceFrame>
            </div>
        )
    }

    // 无外框
    return (
        <div className={`${fillContainer ? 'w-full h-full' : ''} ${className}`} style={style} onClick={onClick}>
            {viewport}
        </div>
    )
}
