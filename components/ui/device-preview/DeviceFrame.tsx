'use client'

/**
 * DeviceFrame - 可选设备外框装饰
 * Optional decorative frame for device preview
 */

import React from 'react'
import type { DeviceFrameProps } from './types'

export function DeviceFrame({
    device,
    frameStyle,
    children,
    className = '',
}: DeviceFrameProps) {
    // 无外框直接返回内容
    if (frameStyle === 'none') {
        return <>{children}</>
    }

    // 最小外框样式
    if (frameStyle === 'minimal') {
        return (
            <div
                className={`relative ${className}`}
                style={{
                    padding: '4px',
                    background: 'linear-gradient(145deg, #2a2a2e, #1a1a1e)',
                    borderRadius: device === 'phone' ? '1.5rem' : '0.75rem',
                    boxShadow: '0 0 0 1px rgba(255,255,255,0.05), 0 20px 40px -10px rgba(0,0,0,0.4)',
                }}
            >
                {children}
            </div>
        )
    }

    // 设备外框样式
    if (device === 'phone') {
        return (
            <div
                className={`relative bg-black select-none ${className}`}
                style={{
                    padding: '8px',
                    borderRadius: '3rem',
                    boxShadow: '0 0 0 2px #333, 0 0 0 5px #1a1a1a, 0 25px 50px -12px rgba(0,0,0,0.5)',
                }}
            >
                {/* 灵动岛 */}
                <div
                    className="absolute top-[14px] left-1/2 -translate-x-1/2 w-[28%] h-[22px] bg-black rounded-full z-20 pointer-events-none"
                    style={{ boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.05)' }}
                />
                {/* 内容 */}
                <div className="relative rounded-[2.5rem] overflow-hidden">
                    {children}
                </div>
            </div>
        )
    }

    // PC 显示器外框
    return (
        <div
            className={`relative bg-[#1a1a1e] select-none ${className}`}
            style={{
                padding: '6px',
                borderRadius: '0.75rem',
                boxShadow: '0 0 0 1px #333, 0 20px 40px -10px rgba(0,0,0,0.4)',
            }}
        >
            {/* 顶部状态栏指示 */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-[#333]" />
            {/* 内容 */}
            <div className="relative rounded-md overflow-hidden">
                {children}
            </div>
        </div>
    )
}
