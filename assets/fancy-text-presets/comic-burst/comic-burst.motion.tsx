'use client'

/**
 * 漫画爆炸大字特效 - Comic Burst Text
 * 
 * 综艺节目爆笑瞬间大字特效：
 * - 漫画拟声词风格（BOOM/WOW）
 * - 超粗字体，大号字号占满画面
 * - 渐变填充 + 多层描边 + 爆炸底板
 * - 高速飞入 + 弹性缩放 + 速度线 + 星星装饰
 */

import React, { useEffect, useState, useMemo } from 'react'
import { motion, AnimatePresence, Variants, useAnimationControls } from 'framer-motion'

// ============================================
// 类型定义
// ============================================

export interface ComicBurstTextProps {
    /** 显示的文字内容 */
    text: string
    /** 缩放比例 (默认: 1) */
    scale?: number
    /** 渐变填充 */
    gradient?: string
    /** 描边颜色 */
    strokeColor?: string
    /** 发光颜色 */
    glowColor?: string
    /** 是否自动播放 */
    autoPlay?: boolean
    /** 动画完成回调 */
    onComplete?: () => void
    /** 额外的 CSS 类名 */
    className?: string
}

// 配色预设
export interface ColorPreset {
    id: string
    name: string
    gradient: string
    strokeColor: string
    glowColor: string
}

export const COLOR_PRESETS: ColorPreset[] = [
    {
        id: 'orange-fire',
        name: '橙色火焰',
        gradient: 'linear-gradient(180deg, #FFE066 0%, #FFAA00 40%, #FF6600 100%)',
        strokeColor: '#4a0080',
        glowColor: '#FF6600',
    },
    {
        id: 'pink-pop',
        name: '粉色炸裂',
        gradient: 'linear-gradient(180deg, #FFCCFF 0%, #FF66CC 40%, #FF0099 100%)',
        strokeColor: '#660066',
        glowColor: '#FF0099',
    },
    {
        id: 'golden-boom',
        name: '金色BOOM',
        gradient: 'linear-gradient(180deg, #FFFFCC 0%, #FFD700 40%, #FF9900 100%)',
        strokeColor: '#663300',
        glowColor: '#FFD700',
    },
    {
        id: 'cyan-shock',
        name: '青色冲击',
        gradient: 'linear-gradient(180deg, #CCFFFF 0%, #00CCFF 40%, #0066CC 100%)',
        strokeColor: '#003366',
        glowColor: '#00CCFF',
    },
]

// ============================================
// 爆炸底板组件
// ============================================

function ExplosionPlate({
    width,
    height,
    color = '#FFD700',
    strokeColor = '#FF6600',
}: {
    width: number
    height: number
    color?: string
    strokeColor?: string
}) {
    // 生成不规则爆炸形状的路径
    const path = useMemo(() => {
        const cx = width / 2
        const cy = height / 2
        const points = 16
        const innerRadius = Math.min(width, height) * 0.4
        const outerRadius = Math.min(width, height) * 0.6

        let d = ''
        for (let i = 0; i < points; i++) {
            const angle = (i / points) * Math.PI * 2
            const radius = i % 2 === 0 ? outerRadius : innerRadius
            // 添加随机扰动
            const jitter = 1 + (Math.sin(i * 3.7) * 0.15)
            const x = cx + Math.cos(angle) * radius * jitter
            const y = cy + Math.sin(angle) * radius * jitter
            d += (i === 0 ? 'M' : 'L') + `${x},${y}`
        }
        d += 'Z'
        return d
    }, [width, height])

    return (
        <motion.svg
            width={width}
            height={height}
            viewBox={`0 0 ${width} ${height}`}
            className="absolute"
            style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}
            initial={{ scale: 0, rotate: -15, opacity: 0 }}
            animate={{
                scale: [0, 1.2, 1],
                rotate: [-15, 5, 0],
                opacity: 1
            }}
            transition={{
                duration: 0.4,
                times: [0, 0.6, 1],
                ease: [0.34, 1.56, 0.64, 1] // spring-like
            }}
        >
            <defs>
                <linearGradient id="explosionGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FFFF00" />
                    <stop offset="50%" stopColor={color} />
                    <stop offset="100%" stopColor="#FF9900" />
                </linearGradient>
                <filter id="explosionGlow">
                    <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                    <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
            </defs>
            <path
                d={path}
                fill="url(#explosionGradient)"
                stroke={strokeColor}
                strokeWidth={4}
                filter="url(#explosionGlow)"
            />
        </motion.svg>
    )
}

// ============================================
// 速度线组件
// ============================================

function SpeedLines({ count = 12, color = '#FFCC00' }: { count?: number; color?: string }) {
    const lines = useMemo(() => {
        return Array.from({ length: count }).map((_, i) => {
            const angle = (i / count) * Math.PI * 2
            const length = 80 + Math.random() * 60
            const startRadius = 120 + Math.random() * 40
            return {
                id: i,
                angle,
                length,
                startRadius,
                width: 2 + Math.random() * 3,
                delay: Math.random() * 0.1,
            }
        })
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
                        height: line.width,
                        background: `linear-gradient(90deg, ${color}, transparent)`,
                        transformOrigin: 'left center',
                        transform: `rotate(${line.angle}rad) translateX(${line.startRadius}px)`,
                    }}
                    initial={{ scaleX: 0, opacity: 0 }}
                    animate={{ scaleX: [0, 1, 0], opacity: [0, 1, 0] }}
                    transition={{
                        duration: 0.5,
                        delay: 0.3 + line.delay,
                        times: [0, 0.4, 1],
                    }}
                />
            ))}
        </div>
    )
}

// ============================================
// 星星装饰组件
// ============================================

function StarBurst({ count = 8, color = '#FFFF00' }: { count?: number; color?: string }) {
    const stars = useMemo(() => {
        return Array.from({ length: count }).map((_, i) => ({
            id: i,
            x: (Math.random() - 0.5) * 300,
            y: (Math.random() - 0.5) * 200,
            size: 12 + Math.random() * 16,
            delay: 0.2 + Math.random() * 0.3,
            rotation: Math.random() * 360,
        }))
    }, [count])

    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {stars.map((star) => (
                <motion.div
                    key={star.id}
                    className="absolute text-yellow-400"
                    style={{
                        left: `calc(50% + ${star.x}px)`,
                        top: `calc(50% + ${star.y}px)`,
                        fontSize: star.size,
                        transform: `translate(-50%, -50%) rotate(${star.rotation}deg)`,
                    }}
                    initial={{ scale: 0, opacity: 0, rotate: 0 }}
                    animate={{
                        scale: [0, 1.5, 0],
                        opacity: [0, 1, 0],
                        rotate: [0, 180, 360]
                    }}
                    transition={{
                        duration: 0.6,
                        delay: star.delay,
                        ease: 'easeOut',
                    }}
                >
                    ✦
                </motion.div>
            ))}
        </div>
    )
}

// ============================================
// 点状噪点组件
// ============================================

function DotNoise({ count = 20, color = '#FFFFFF' }: { count?: number; color?: string }) {
    const dots = useMemo(() => {
        return Array.from({ length: count }).map((_, i) => ({
            id: i,
            x: (Math.random() - 0.5) * 400,
            y: (Math.random() - 0.5) * 300,
            size: 2 + Math.random() * 4,
            delay: 0.1 + Math.random() * 0.4,
        }))
    }, [count])

    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {dots.map((dot) => (
                <motion.div
                    key={dot.id}
                    className="absolute rounded-full"
                    style={{
                        left: `calc(50% + ${dot.x}px)`,
                        top: `calc(50% + ${dot.y}px)`,
                        width: dot.size,
                        height: dot.size,
                        backgroundColor: color,
                    }}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: [0, 1, 0], opacity: [0, 0.8, 0] }}
                    transition={{
                        duration: 0.4,
                        delay: dot.delay,
                    }}
                />
            ))}
        </div>
    )
}

// ============================================
// 主组件
// ============================================

export function ComicBurstText({
    text,
    scale = 1,
    gradient = 'linear-gradient(180deg, #FFE066 0%, #FFAA00 40%, #FF6600 100%)',
    strokeColor = '#4a0080',
    glowColor = '#FF6600',
    autoPlay = true,
    onComplete,
    className = '',
}: ComicBurstTextProps) {
    const [isVisible, setIsVisible] = useState(false)
    const controls = useAnimationControls()

    useEffect(() => {
        if (autoPlay) {
            setIsVisible(true)
        }
    }, [autoPlay])

    // 文字动画变体
    const textVariants: Variants = {
        hidden: {
            opacity: 0,
            scale: 0.3,
            x: -100,
            rotate: -15,
        },
        visible: {
            opacity: 1,
            scale: [0.3, 1.3, 0.9, 1.05, 1],
            x: 0,
            rotate: [-15, 5, -2, 0],
            transition: {
                duration: 0.6,
                times: [0, 0.4, 0.6, 0.8, 1],
                ease: [0.34, 1.56, 0.64, 1],
            },
        },
    }

    // 计算文字尺寸
    const fontSize = 80 * scale
    const textWidth = text.length * fontSize * 0.9
    const plateWidth = textWidth + 80
    const plateHeight = fontSize * 1.8

    return (
        <div
            className={`relative inline-flex items-center justify-center ${className}`}
            style={{
                minWidth: plateWidth,
                minHeight: plateHeight,
                transform: `scale(${scale})`,
                transformOrigin: 'center center',
            }}
        >
            <AnimatePresence>
                {isVisible && (
                    <>
                        {/* 爆炸底板 */}
                        <ExplosionPlate
                            width={plateWidth}
                            height={plateHeight}
                            color="#FFD700"
                            strokeColor={glowColor}
                        />

                        {/* 速度线 */}
                        <SpeedLines count={14} color={glowColor} />

                        {/* 星星装饰 */}
                        <StarBurst count={10} color="#FFFF00" />

                        {/* 点状噪点 */}
                        <DotNoise count={25} color="#FFFFFF" />

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
                                        0 0 40px ${glowColor}80,
                                        0 0 60px ${glowColor}40
                                    `,
                                    // 多层描边效果通过 SVG filter 或伪元素实现
                                    filter: `drop-shadow(0 4px 0 ${strokeColor}) drop-shadow(0 -2px 0 white) drop-shadow(2px 0 0 white) drop-shadow(-2px 0 0 white)`,
                                    letterSpacing: '0.05em',
                                    display: 'inline-block',
                                    whiteSpace: 'nowrap',
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

// 默认导出
export default ComicBurstText
