'use client'

/**
 * 震屏冲击特效 - Screen Shake Text
 * 
 * 综艺节目震撼时刻特效：
 * - 屏幕震动效果
 * - 冲击波扩散
 * - 高能预警风格
 */

import React, { useEffect, useState, useMemo } from 'react'
import { motion, AnimatePresence, Variants } from 'framer-motion'

// ============================================
// 类型定义
// ============================================

export interface ScreenShakeTextProps {
    text: string
    scale?: number
    gradient?: string
    strokeColor?: string
    glowColor?: string
    autoPlay?: boolean
    onComplete?: () => void
    className?: string
}

export interface ColorPreset {
    id: string
    name: string
    gradient: string
    strokeColor: string
    glowColor: string
}

export const COLOR_PRESETS: ColorPreset[] = [
    {
        id: 'warning-orange',
        name: '警告橙',
        gradient: 'linear-gradient(180deg, #FFFF00 0%, #FFCC00 30%, #FF6600 70%, #CC0000 100%)',
        strokeColor: '#330000',
        glowColor: '#FF6600',
    },
    {
        id: 'danger-red',
        name: '危险红',
        gradient: 'linear-gradient(180deg, #FFFFFF 0%, #FF6666 30%, #FF0000 70%, #660000 100%)',
        strokeColor: '#000000',
        glowColor: '#FF0000',
    },
]

// ============================================
// 冲击波组件
// ============================================

function ShockWave({ color = '#FF6600', count = 3 }: { color?: string; count?: number }) {
    return (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            {Array.from({ length: count }).map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute rounded-full border-4"
                    style={{
                        borderColor: color,
                        width: 100,
                        height: 100,
                    }}
                    initial={{ scale: 0.5, opacity: 1 }}
                    animate={{
                        scale: [0.5, 3],
                        opacity: [1, 0]
                    }}
                    transition={{
                        duration: 0.8,
                        delay: i * 0.15,
                        ease: 'easeOut',
                    }}
                />
            ))}
        </div>
    )
}

// ============================================
// 警告条纹
// ============================================

function WarningStripes({ color = '#FF6600' }: { color?: string }) {
    return (
        <motion.div
            className="absolute inset-x-0 top-0 h-2 overflow-hidden"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.3 }}
        >
            <div
                className="w-full h-full"
                style={{
                    background: `repeating-linear-gradient(
                        45deg,
                        ${color},
                        ${color} 10px,
                        #000000 10px,
                        #000000 20px
                    )`,
                }}
            />
        </motion.div>
    )
}

// ============================================
// 主组件
// ============================================

export function ScreenShakeText({
    text,
    scale = 1,
    gradient = 'linear-gradient(180deg, #FFFF00 0%, #FFCC00 30%, #FF6600 70%, #CC0000 100%)',
    strokeColor = '#330000',
    glowColor = '#FF6600',
    autoPlay = true,
    onComplete,
    className = '',
}: ScreenShakeTextProps) {
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        if (autoPlay) {
            setIsVisible(true)
        }
    }, [autoPlay])

    // 震动动画
    const shakeVariants: Variants = {
        hidden: {
            opacity: 0,
            y: -50,
        },
        visible: {
            opacity: 1,
            y: 0,
            x: [0, -8, 8, -6, 6, -4, 4, -2, 2, 0],
            transition: {
                y: { duration: 0.2, ease: 'easeOut' },
                x: { duration: 0.5, delay: 0.2 },
            },
        },
    }

    const fontSize = 64 * scale

    return (
        <div
            className={`relative inline-flex items-center justify-center ${className}`}
            style={{
                minWidth: 350 * scale,
                minHeight: 120 * scale,
            }}
        >
            <AnimatePresence>
                {isVisible && (
                    <>
                        {/* 警告条纹 */}
                        <WarningStripes color={glowColor} />

                        {/* 冲击波 */}
                        <ShockWave color={glowColor} count={3} />

                        {/* 主文字 */}
                        <motion.div
                            className="relative z-10"
                            variants={shakeVariants}
                            initial="hidden"
                            animate="visible"
                            onAnimationComplete={() => onComplete?.()}
                        >
                            <span
                                style={{
                                    fontSize,
                                    fontWeight: 900,
                                    fontFamily: '"PingFang SC", "Microsoft YaHei", sans-serif',
                                    background: gradient,
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    backgroundClip: 'text',
                                    textShadow: `
                                        0 0 15px ${glowColor},
                                        0 0 30px ${glowColor}80
                                    `,
                                    filter: `drop-shadow(0 4px 0 ${strokeColor})`,
                                    letterSpacing: '0.1em',
                                }}
                            >
                                {text}
                            </span>
                        </motion.div>

                        {/* 底部警告条纹 */}
                        <motion.div
                            className="absolute inset-x-0 bottom-0 h-2 overflow-hidden"
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: 1 }}
                            transition={{ duration: 0.3 }}
                        >
                            <div
                                className="w-full h-full"
                                style={{
                                    background: `repeating-linear-gradient(
                                        -45deg,
                                        ${glowColor},
                                        ${glowColor} 10px,
                                        #000000 10px,
                                        #000000 20px
                                    )`,
                                }}
                            />
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    )
}

export default ScreenShakeText
