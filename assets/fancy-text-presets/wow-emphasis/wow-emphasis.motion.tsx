'use client'

/**
 * 惊叹强调特效 - Wow Emphasis Text
 * 
 * 综艺节目惊叹/强调大字特效：
 * - 震撼视觉冲击
 * - 渐变填充 + 发光描边
 * - 脉冲缩放 + 闪光效果
 */

import React, { useEffect, useState, useMemo } from 'react'
import { motion, AnimatePresence, Variants } from 'framer-motion'

// ============================================
// 类型定义
// ============================================

export interface WowEmphasisTextProps {
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
        id: 'electric-blue',
        name: '电光蓝',
        gradient: 'linear-gradient(180deg, #FFFFFF 0%, #00CCFF 30%, #0066FF 70%, #0033CC 100%)',
        strokeColor: '#000066',
        glowColor: '#00CCFF',
    },
    {
        id: 'hot-red',
        name: '热力红',
        gradient: 'linear-gradient(180deg, #FFFFFF 0%, #FF6666 30%, #FF0000 70%, #990000 100%)',
        strokeColor: '#330000',
        glowColor: '#FF3300',
    },
    {
        id: 'neon-green',
        name: '霓虹绿',
        gradient: 'linear-gradient(180deg, #FFFFFF 0%, #66FF66 30%, #00FF00 70%, #009900 100%)',
        strokeColor: '#003300',
        glowColor: '#00FF00',
    },
]

// ============================================
// 闪光线组件
// ============================================

function FlashLines({ count = 8, color = '#FFFFFF' }: { count?: number; color?: string }) {
    const lines = useMemo(() => {
        return Array.from({ length: count }).map((_, i) => ({
            id: i,
            angle: (i / count) * 360,
            length: 60 + Math.random() * 40,
            delay: i * 0.02,
        }))
    }, [count])

    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {lines.map((line) => (
                <motion.div
                    key={line.id}
                    className="absolute"
                    style={{
                        left: '50%',
                        top: '50%',
                        width: line.length,
                        height: 3,
                        background: `linear-gradient(90deg, ${color}, transparent)`,
                        transformOrigin: 'left center',
                        transform: `rotate(${line.angle}deg)`,
                    }}
                    initial={{ scaleX: 0, opacity: 0 }}
                    animate={{
                        scaleX: [0, 1.2, 0],
                        opacity: [0, 1, 0]
                    }}
                    transition={{
                        duration: 0.4,
                        delay: 0.1 + line.delay,
                    }}
                />
            ))}
        </div>
    )
}

// ============================================
// 光环组件
// ============================================

function GlowRing({ color = '#00CCFF', size = 200 }: { color?: string; size?: number }) {
    return (
        <motion.div
            className="absolute rounded-full"
            style={{
                left: '50%',
                top: '50%',
                width: size,
                height: size,
                border: `4px solid ${color}`,
                transform: 'translate(-50%, -50%)',
                boxShadow: `0 0 30px ${color}, 0 0 60px ${color}50`,
            }}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{
                scale: [0.5, 1.5, 2],
                opacity: [0, 1, 0]
            }}
            transition={{
                duration: 0.6,
                ease: 'easeOut',
            }}
        />
    )
}

// ============================================
// 主组件
// ============================================

export function WowEmphasisText({
    text,
    scale = 1,
    gradient = 'linear-gradient(180deg, #FFFFFF 0%, #00CCFF 30%, #0066FF 70%, #0033CC 100%)',
    strokeColor = '#000066',
    glowColor = '#00CCFF',
    autoPlay = true,
    onComplete,
    className = '',
}: WowEmphasisTextProps) {
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        if (autoPlay) {
            setIsVisible(true)
        }
    }, [autoPlay])

    const textVariants: Variants = {
        hidden: {
            opacity: 0,
            scale: 0,
            filter: 'blur(20px)',
        },
        visible: {
            opacity: 1,
            scale: [0, 1.3, 0.95, 1.1, 1],
            filter: 'blur(0px)',
            transition: {
                duration: 0.5,
                times: [0, 0.3, 0.5, 0.7, 1],
                ease: [0.34, 1.56, 0.64, 1],
            },
        },
    }

    const fontSize = 72 * scale

    return (
        <div
            className={`relative inline-flex items-center justify-center ${className}`}
            style={{
                minWidth: 300 * scale,
                minHeight: 150 * scale,
            }}
        >
            <AnimatePresence>
                {isVisible && (
                    <>
                        {/* 光环 */}
                        <GlowRing color={glowColor} size={200 * scale} />

                        {/* 闪光线 */}
                        <FlashLines count={12} color={glowColor} />

                        {/* 主文字 */}
                        <motion.div
                            className="relative z-10"
                            variants={textVariants}
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
                                        0 0 20px ${glowColor},
                                        0 0 40px ${glowColor}80
                                    `,
                                    filter: `drop-shadow(0 3px 0 ${strokeColor}) drop-shadow(0 -2px 0 white)`,
                                    letterSpacing: '0.08em',
                                }}
                            >
                                {text}
                            </span>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    )
}

export default WowEmphasisText
