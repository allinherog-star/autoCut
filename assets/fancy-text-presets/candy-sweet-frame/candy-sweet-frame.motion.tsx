'use client'

/**
 * 甜蜜边框花字特效 - Candy Sweet Frame Text
 * 
 * 粉色圆角边框 + 白字粉描边，甜蜜综艺风格:
 * - 粉红/玫红圆角矩形边框
 * - 白色填充 + 粉色描边文字
 * - 边框缩放入场 + 文字滑入
 * - 支持多行文字
 * - 可选爱心装饰
 */

import React, { useEffect, useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// ============================================
// 类型定义
// ============================================

export interface CandySweetFrameTextProps {
    /** 显示的文字内容 (支持 \n 换行) */
    text: string
    /** 缩放比例 (默认: 1) */
    scale?: number
    /** 描边颜色 (粉色) */
    strokeColor?: string
    /** 边框颜色 */
    frameColor?: string
    /** 发光颜色 */
    glowColor?: string
    /** 是否自动播放 */
    autoPlay?: boolean
    /** 跳过动画直接显示最终帧 */
    skipToEnd?: boolean
    /** 动画完成回调 */
    onComplete?: () => void
    /** 额外的 CSS 类名 */
    className?: string
}

// ============================================
// 爱心装饰组件
// ============================================

function HeartDecorations({
    color = '#FF3366',
    count = 6,
    containerWidth,
    containerHeight,
    skipToEnd = false,
}: {
    color?: string
    count?: number
    containerWidth: number
    containerHeight: number
    skipToEnd?: boolean
}) {
    const hearts = useMemo(() => {
        return Array.from({ length: count }).map((_, i) => {
            // 分布在边框四周
            const positions = [
                { x: -20, y: containerHeight * 0.3 },
                { x: -15, y: containerHeight * 0.7 },
                { x: containerWidth + 10, y: containerHeight * 0.3 },
                { x: containerWidth + 5, y: containerHeight * 0.7 },
                { x: containerWidth * 0.3, y: -15 },
                { x: containerWidth * 0.7, y: containerHeight + 10 },
            ]
            const pos = positions[i % positions.length]
            return {
                id: i,
                x: pos.x,
                y: pos.y,
                size: 14 + Math.random() * 10,
                delay: 0.3 + i * 0.08,
                rotation: -15 + Math.random() * 30,
            }
        })
    }, [count, containerWidth, containerHeight])

    if (skipToEnd) {
        // 静态显示
        return (
            <div className="absolute inset-0 pointer-events-none overflow-visible">
                {hearts.slice(0, 4).map((heart) => (
                    <div
                        key={heart.id}
                        className="absolute"
                        style={{
                            left: heart.x,
                            top: heart.y,
                            fontSize: heart.size,
                            color: color,
                            transform: `rotate(${heart.rotation}deg)`,
                            filter: `drop-shadow(0 0 4px ${color})`,
                        }}
                    >
                        ♥
                    </div>
                ))}
            </div>
        )
    }

    return (
        <div className="absolute inset-0 pointer-events-none overflow-visible">
            {hearts.map((heart) => (
                <motion.div
                    key={heart.id}
                    className="absolute"
                    style={{
                        left: heart.x,
                        top: heart.y,
                        fontSize: heart.size,
                        color: color,
                        filter: `drop-shadow(0 0 4px ${color})`,
                    }}
                    initial={{ scale: 0, opacity: 0, rotate: heart.rotation - 20 }}
                    animate={{
                        scale: [0, 1.3, 1],
                        opacity: [0, 1, 1],
                        rotate: [heart.rotation - 20, heart.rotation + 5, heart.rotation],
                    }}
                    transition={{
                        duration: 0.4,
                        delay: heart.delay,
                        ease: 'easeOut',
                    }}
                >
                    ♥
                </motion.div>
            ))}
        </div>
    )
}

// ============================================
// 主组件 - 甜蜜边框花字
// ============================================

export function CandySweetFrameText({
    text,
    scale = 1,
    strokeColor = '#FF3366',
    frameColor = '#FF3366',
    glowColor = '#FF69B4',
    autoPlay = true,
    skipToEnd = false,
    onComplete,
    className = '',
}: CandySweetFrameTextProps) {
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        if (autoPlay || skipToEnd) {
            setIsVisible(true)
        }
    }, [autoPlay, skipToEnd])

    const handleAnimationComplete = useCallback(() => {
        onComplete?.()
    }, [onComplete])

    // 解析文字行
    const lines = useMemo(() => text.split('\n'), [text])

    // 计算尺寸
    const fontSize = 56 * scale
    const lineHeight = 1.3
    const paddingX = 24 * scale
    const paddingY = 16 * scale
    const borderRadius = 12 * scale
    const borderWidth = 4 * scale

    // 估算容器尺寸
    const maxLineLength = Math.max(...lines.map(l => l.length))
    const containerWidth = maxLineLength * fontSize * 0.9 + paddingX * 2
    const containerHeight = lines.length * fontSize * lineHeight + paddingY * 2

    // 静态模式 - 直接显示最终状态
    if (skipToEnd) {
        return (
            <div
                className={`relative inline-flex flex-col items-center justify-center ${className}`}
                style={{
                    transform: `scale(${scale})`,
                    transformOrigin: 'center center',
                }}
            >
                {/* 边框 */}
                <div
                    style={{
                        position: 'relative',
                        padding: `${paddingY}px ${paddingX}px`,
                        border: `${borderWidth}px solid ${frameColor}`,
                        borderRadius: borderRadius,
                        boxShadow: `0 0 20px ${glowColor}40, inset 0 0 10px ${glowColor}20`,
                    }}
                >
                    {/* 爱心装饰 */}
                    <HeartDecorations
                        color={frameColor}
                        count={4}
                        containerWidth={containerWidth}
                        containerHeight={containerHeight}
                        skipToEnd={true}
                    />

                    {/* 文字 */}
                    <div className="relative z-10 flex flex-col items-center gap-1">
                        {lines.map((line, index) => (
                            <div key={index} className="relative">
                                {/* 描边层 */}
                                <span
                                    style={{
                                        position: 'absolute',
                                        left: 0,
                                        top: 0,
                                        fontSize,
                                        fontWeight: 900,
                                        fontFamily: '"PingFang SC", "Microsoft YaHei", "Noto Sans SC", sans-serif',
                                        color: 'transparent',
                                        WebkitTextStroke: `${6 * scale}px ${strokeColor}`,
                                        letterSpacing: '0.05em',
                                        whiteSpace: 'nowrap',
                                        lineHeight: lineHeight,
                                    }}
                                >
                                    {line}
                                </span>
                                {/* 填充层 */}
                                <span
                                    style={{
                                        position: 'relative',
                                        fontSize,
                                        fontWeight: 900,
                                        fontFamily: '"PingFang SC", "Microsoft YaHei", "Noto Sans SC", sans-serif',
                                        color: '#FFFFFF',
                                        letterSpacing: '0.05em',
                                        whiteSpace: 'nowrap',
                                        lineHeight: lineHeight,
                                        textShadow: `0 2px 8px ${glowColor}60`,
                                    }}
                                >
                                    {line}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    // 动画模式
    return (
        <div
            className={`relative inline-flex flex-col items-center justify-center ${className}`}
            style={{
                transform: `scale(${scale})`,
                transformOrigin: 'center center',
            }}
        >
            <AnimatePresence>
                {isVisible && (
                    <>
                        {/* 边框 - 缩放入场 */}
                        <motion.div
                            style={{
                                position: 'relative',
                                padding: `${paddingY}px ${paddingX}px`,
                                border: `${borderWidth}px solid ${frameColor}`,
                                borderRadius: borderRadius,
                            }}
                            initial={{
                                scale: 0,
                                opacity: 0,
                                boxShadow: `0 0 0px ${glowColor}00`,
                            }}
                            animate={{
                                scale: [0, 1.05, 0.98, 1],
                                opacity: [0, 1, 1, 1],
                                boxShadow: [
                                    `0 0 0px ${glowColor}00`,
                                    `0 0 30px ${glowColor}60`,
                                    `0 0 20px ${glowColor}40`,
                                    `0 0 20px ${glowColor}40, inset 0 0 10px ${glowColor}20`,
                                ],
                            }}
                            transition={{
                                duration: 0.5,
                                times: [0, 0.5, 0.75, 1],
                                ease: [0.34, 1.56, 0.64, 1],
                            }}
                        >
                            {/* 爱心装饰 */}
                            <HeartDecorations
                                color={frameColor}
                                count={6}
                                containerWidth={containerWidth}
                                containerHeight={containerHeight}
                            />

                            {/* 文字 - 逐行滑入 */}
                            <div className="relative z-10 flex flex-col items-center gap-1">
                                {lines.map((line, index) => (
                                    <motion.div
                                        key={index}
                                        className="relative"
                                        initial={{ y: 30, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{
                                            duration: 0.4,
                                            delay: 0.25 + index * 0.12,
                                            ease: [0.34, 1.56, 0.64, 1],
                                        }}
                                        onAnimationComplete={
                                            index === lines.length - 1 ? handleAnimationComplete : undefined
                                        }
                                    >
                                        {/* 描边层 */}
                                        <span
                                            style={{
                                                position: 'absolute',
                                                left: 0,
                                                top: 0,
                                                fontSize,
                                                fontWeight: 900,
                                                fontFamily: '"PingFang SC", "Microsoft YaHei", "Noto Sans SC", sans-serif',
                                                color: 'transparent',
                                                WebkitTextStroke: `${6 * scale}px ${strokeColor}`,
                                                letterSpacing: '0.05em',
                                                whiteSpace: 'nowrap',
                                                lineHeight: lineHeight,
                                            }}
                                        >
                                            {line}
                                        </span>
                                        {/* 填充层 */}
                                        <span
                                            style={{
                                                position: 'relative',
                                                fontSize,
                                                fontWeight: 900,
                                                fontFamily: '"PingFang SC", "Microsoft YaHei", "Noto Sans SC", sans-serif',
                                                color: '#FFFFFF',
                                                letterSpacing: '0.05em',
                                                whiteSpace: 'nowrap',
                                                lineHeight: lineHeight,
                                                textShadow: `0 2px 8px ${glowColor}60`,
                                            }}
                                        >
                                            {line}
                                        </span>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    )
}

// 默认导出
export default CandySweetFrameText
