'use client'

/**
 * 爆笑大字特效 - Explosive Laugh Big Text
 * 
 * 综艺节目爆笑瞬间大字特效:
 * - 漫画拟声词风格（BOOM/WOW）
 * - 超粗字体，大号字号占满画面
 * - 渐变填充 + 深紫+白双边描边 + 爆炸底板
 * - 高速飞入 + squash & stretch 弹性缩放
 * - 速度线 + 点状噪点 + 星星装饰
 * - 0.8-1秒快速动画
 */

import React, { useEffect, useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence, useAnimationControls } from 'framer-motion'

// ============================================
// 类型定义
// ============================================

export interface ExplosiveLaughTextProps {
    /** 显示的文字内容 */
    text: string
    /** 缩放比例 (默认: 1) */
    scale?: number
    /** 渐变填充 */
    gradient?: string
    /** 描边颜色 (深紫) */
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

// ============================================
// 爆炸底板 SVG 组件
// ============================================

function ExplosionPlate({
    size,
    color = '#FFD700',
    strokeColor = '#FF6600',
}: {
    size: number
    color?: string
    strokeColor?: string
}) {
    // 生成不规则爆炸星形路径
    const path = useMemo(() => {
        const cx = size / 2
        const cy = size / 2
        const points = 14 // 14个尖角
        const outerRadius = size * 0.48
        const innerRadius = size * 0.32

        let d = ''
        for (let i = 0; i < points * 2; i++) {
            const angle = (i / (points * 2)) * Math.PI * 2 - Math.PI / 2
            const radius = i % 2 === 0 ? outerRadius : innerRadius
            // 添加随机扰动
            const jitter = 1 + (Math.sin(i * 2.7) * 0.12)
            const x = cx + Math.cos(angle) * radius * jitter
            const y = cy + Math.sin(angle) * radius * jitter
            d += (i === 0 ? 'M' : 'L') + `${x.toFixed(1)},${y.toFixed(1)}`
        }
        d += 'Z'
        return d
    }, [size])

    return (
        <motion.svg
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            className="absolute"
            style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}
            initial={{ scale: 0, rotate: -20, opacity: 0 }}
            animate={{
                scale: [0, 1.3, 0.95, 1.05, 1],
                rotate: [-20, 8, -3, 0],
                opacity: [0, 1, 1, 1, 1]
            }}
            transition={{
                duration: 0.45,
                times: [0, 0.4, 0.6, 0.8, 1],
                ease: [0.34, 1.56, 0.64, 1]
            }}
        >
            <defs>
                <linearGradient id="explosionGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FFFF66" />
                    <stop offset="50%" stopColor={color} />
                    <stop offset="100%" stopColor="#FF9900" />
                </linearGradient>
                <filter id="explosionGlow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="6" result="blur" />
                    <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
            </defs>
            <path
                d={path}
                fill="url(#explosionGrad)"
                stroke={strokeColor}
                strokeWidth={5}
                filter="url(#explosionGlow)"
            />
        </motion.svg>
    )
}

// ============================================
// 速度线组件 - 从中心向外辐射
// ============================================

function SpeedLines({
    count = 16,
    color = '#FFCC00',
    delay = 0.15
}: {
    count?: number
    color?: string
    delay?: number
}) {
    const lines = useMemo(() => {
        return Array.from({ length: count }).map((_, i) => {
            const angle = (i / count) * Math.PI * 2
            const length = 60 + Math.random() * 80
            const startRadius = 100 + Math.random() * 50
            return {
                id: i,
                angle,
                length,
                startRadius,
                width: 3 + Math.random() * 4,
                delay: delay + Math.random() * 0.08,
            }
        })
    }, [count, delay])

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
                        background: `linear-gradient(90deg, ${color} 0%, ${color}80 50%, transparent 100%)`,
                        transformOrigin: 'left center',
                        transform: `rotate(${line.angle}rad) translateX(${line.startRadius}px)`,
                        borderRadius: line.width / 2,
                    }}
                    initial={{ scaleX: 0, opacity: 0 }}
                    animate={{
                        scaleX: [0, 1.2, 0],
                        opacity: [0, 1, 0]
                    }}
                    transition={{
                        duration: 0.4,
                        delay: line.delay,
                        times: [0, 0.5, 1],
                        ease: 'easeOut',
                    }}
                />
            ))}
        </div>
    )
}

// ============================================
// 星星装饰组件
// ============================================

function StarBurst({
    count = 10,
    colors = ['#FFFF00', '#FF6600', '#FFFFFF'],
    delay = 0.2
}: {
    count?: number
    colors?: string[]
    delay?: number
}) {
    const stars = useMemo(() => {
        return Array.from({ length: count }).map((_, i) => ({
            id: i,
            x: (Math.random() - 0.5) * 350,
            y: (Math.random() - 0.5) * 250,
            size: 14 + Math.random() * 20,
            delay: delay + Math.random() * 0.25,
            rotation: Math.random() * 360,
            color: colors[Math.floor(Math.random() * colors.length)],
            type: Math.random() > 0.5 ? '✦' : '★',
        }))
    }, [count, colors, delay])

    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {stars.map((star) => (
                <motion.div
                    key={star.id}
                    className="absolute"
                    style={{
                        left: `calc(50% + ${star.x}px)`,
                        top: `calc(50% + ${star.y}px)`,
                        fontSize: star.size,
                        color: star.color,
                        textShadow: `0 0 10px ${star.color}`,
                        transform: `translate(-50%, -50%)`,
                    }}
                    initial={{ scale: 0, opacity: 0, rotate: 0 }}
                    animate={{
                        scale: [0, 1.5, 1, 0],
                        opacity: [0, 1, 1, 0],
                        rotate: [star.rotation, star.rotation + 180]
                    }}
                    transition={{
                        duration: 0.5,
                        delay: star.delay,
                        times: [0, 0.3, 0.7, 1],
                        ease: 'easeOut',
                    }}
                >
                    {star.type}
                </motion.div>
            ))}
        </div>
    )
}

// ============================================
// 点状噪点组件
// ============================================

function DotNoise({
    count = 30,
    colors = ['#FFFFFF', '#FFFF00', '#FF6600'],
    delay = 0.1
}: {
    count?: number
    colors?: string[]
    delay?: number
}) {
    const dots = useMemo(() => {
        return Array.from({ length: count }).map((_, i) => ({
            id: i,
            x: (Math.random() - 0.5) * 450,
            y: (Math.random() - 0.5) * 350,
            size: 3 + Math.random() * 6,
            delay: delay + Math.random() * 0.3,
            color: colors[Math.floor(Math.random() * colors.length)],
        }))
    }, [count, colors, delay])

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
                        backgroundColor: dot.color,
                        boxShadow: `0 0 ${dot.size}px ${dot.color}`,
                    }}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{
                        scale: [0, 1.5, 0],
                        opacity: [0, 0.9, 0]
                    }}
                    transition={{
                        duration: 0.35,
                        delay: dot.delay,
                        ease: 'easeOut',
                    }}
                />
            ))}
        </div>
    )
}

// ============================================
// 主组件 - 爆笑大字
// ============================================

export function ExplosiveLaughText({
    text,
    scale = 1,
    gradient = 'linear-gradient(180deg, #FFE066 0%, #FFAA00 50%, #FF6600 100%)',
    strokeColor = '#4a0080',
    glowColor = '#FF6600',
    autoPlay = true,
    onComplete,
    className = '',
}: ExplosiveLaughTextProps) {
    const [isVisible, setIsVisible] = useState(false)
    const controls = useAnimationControls()

    useEffect(() => {
        if (autoPlay) {
            setIsVisible(true)
        }
    }, [autoPlay])

    const handleAnimationComplete = useCallback(() => {
        onComplete?.()
    }, [onComplete])

    // 计算尺寸
    const fontSize = 100 * scale
    const plateSize = Math.max(text.length * fontSize * 0.8, fontSize * 2.5)

    return (
        <div
            className={`relative inline-flex items-center justify-center ${className}`}
            style={{
                minWidth: plateSize + 100,
                minHeight: plateSize * 0.7,
                transform: `scale(${scale})`,
                transformOrigin: 'center center',
            }}
        >
            <AnimatePresence>
                {isVisible && (
                    <>
                        {/* 爆炸底板 */}
                        <ExplosionPlate
                            size={plateSize}
                            color="#FFD700"
                            strokeColor={glowColor}
                        />

                        {/* 速度线 */}
                        <SpeedLines count={18} color={glowColor} delay={0.12} />

                        {/* 星星装饰 */}
                        <StarBurst
                            count={12}
                            colors={['#FFFF00', '#FF6600', '#FFFFFF', glowColor]}
                            delay={0.18}
                        />

                        {/* 点状噪点 */}
                        <DotNoise
                            count={35}
                            colors={['#FFFFFF', '#FFFF00', glowColor]}
                            delay={0.08}
                        />

                        {/* 主文字 - 高速飞入 + squash & stretch */}
                        <motion.div
                            className="relative z-10"
                            initial={{
                                opacity: 0,
                                scale: 0.2,
                                x: -300,
                                rotate: -25,
                                skewX: 15,
                            }}
                            animate={{
                                opacity: [0, 1, 1, 1],
                                // squash & stretch 弹性效果
                                scale: [0.2, 1.4, 0.85, 1.1, 0.95, 1],
                                x: [-300, 20, -10, 5, 0],
                                rotate: [-25, 8, -4, 2, 0],
                                skewX: [15, -8, 4, -2, 0],
                            }}
                            transition={{
                                duration: 0.6,
                                times: [0, 0.35, 0.5, 0.7, 0.85, 1],
                                ease: [0.22, 1.2, 0.36, 1],
                            }}
                            onAnimationComplete={handleAnimationComplete}
                        >
                            {/* 外层白色描边 (通过伪元素模拟) */}
                            <span
                                style={{
                                    position: 'absolute',
                                    left: 0,
                                    top: 0,
                                    fontSize,
                                    fontWeight: 900,
                                    fontFamily: '"PingFang SC", "Microsoft YaHei", "Noto Sans SC", sans-serif',
                                    color: 'transparent',
                                    WebkitTextStroke: `12px white`,
                                    letterSpacing: '0.08em',
                                    whiteSpace: 'nowrap',
                                    zIndex: 1,
                                }}
                            >
                                {text}
                            </span>

                            {/* 深紫描边层 */}
                            <span
                                style={{
                                    position: 'absolute',
                                    left: 0,
                                    top: 0,
                                    fontSize,
                                    fontWeight: 900,
                                    fontFamily: '"PingFang SC", "Microsoft YaHei", "Noto Sans SC", sans-serif',
                                    color: 'transparent',
                                    WebkitTextStroke: `6px ${strokeColor}`,
                                    letterSpacing: '0.08em',
                                    whiteSpace: 'nowrap',
                                    zIndex: 2,
                                }}
                            >
                                {text}
                            </span>

                            {/* 主文字 - 渐变填充 */}
                            <span
                                style={{
                                    position: 'relative',
                                    fontSize,
                                    fontWeight: 900,
                                    fontFamily: '"PingFang SC", "Microsoft YaHei", "Noto Sans SC", sans-serif',
                                    background: gradient,
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    backgroundClip: 'text',
                                    letterSpacing: '0.08em',
                                    whiteSpace: 'nowrap',
                                    zIndex: 3,
                                    filter: `drop-shadow(0 0 30px ${glowColor}) drop-shadow(0 0 60px ${glowColor}50)`,
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
export default ExplosiveLaughText
