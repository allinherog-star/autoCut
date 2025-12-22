'use client'

/**
 * 软糖主标题特效 - Candy Main Title
 * 
 * 《一见你就笑》综艺片头主标题效果:
 * - 软糖质感渐变填充（亮黄色为主）
 * - 多层圆角描边（白色外描边 + 紫色内描边）
 * - 卡通爆炸变形底板（手绘感星形）
 * - 强烈弹跳感 + squash & stretch 缩放变形
 * - 速度线 + 彩色粒子 + 星星/闪电/感叹号装饰
 * - 时长 2.5 秒
 */

import React, { useEffect, useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence, useAnimationControls } from 'framer-motion'

// ============================================
// 类型定义
// ============================================

export interface CandyMainTitleProps {
    /** 显示的文字内容 */
    text: string
    /** 缩放比例 (默认: 1) */
    scale?: number
    /** 渐变填充 */
    gradient?: string
    /** 内描边颜色 (紫色) */
    strokeColor?: string
    /** 外描边颜色 (白色) */
    outerStrokeColor?: string
    /** 发光颜色 */
    glowColor?: string
    /** 爆炸底板颜色 */
    plateColor?: string
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
// 卡通爆炸底板 SVG
// ============================================

function CartoonExplosionPlate({
    size,
    color = '#FFE135',
    strokeColor = '#FF9900',
    animate = true,
}: {
    size: number
    color?: string
    strokeColor?: string
    animate?: boolean
}) {
    const path = useMemo(() => {
        const cx = size / 2
        const cy = size / 2
        const points = 16
        const outerRadius = size * 0.46
        const innerRadius = size * 0.30

        let d = ''
        for (let i = 0; i < points * 2; i++) {
            const angle = (i / (points * 2)) * Math.PI * 2 - Math.PI / 2
            const radius = i % 2 === 0 ? outerRadius : innerRadius
            // 手绘感扰动
            const jitter = 1 + (Math.sin(i * 2.3 + 0.5) * 0.15) + (Math.cos(i * 1.7) * 0.08)
            const x = cx + Math.cos(angle) * radius * jitter
            const y = cy + Math.sin(angle) * radius * jitter
            d += (i === 0 ? 'M' : 'L') + `${x.toFixed(1)},${y.toFixed(1)}`
        }
        d += 'Z'
        return d
    }, [size])

    const gradientId = `candyPlateGrad-${size}`
    const glowId = `candyPlateGlow-${size}`

    if (!animate) {
        return (
            <svg
                width={size}
                height={size}
                viewBox={`0 0 ${size} ${size}`}
                className="absolute"
                style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}
            >
                <defs>
                    <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#FFFACD" />
                        <stop offset="40%" stopColor={color} />
                        <stop offset="100%" stopColor="#FFA500" />
                    </linearGradient>
                    <filter id={glowId} x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="8" result="blur" />
                        <feMerge>
                            <feMergeNode in="blur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>
                <path
                    d={path}
                    fill={`url(#${gradientId})`}
                    stroke={strokeColor}
                    strokeWidth={6}
                    strokeLinejoin="round"
                    filter={`url(#${glowId})`}
                />
            </svg>
        )
    }

    return (
        <motion.svg
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            className="absolute"
            style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}
            initial={{ scale: 0, rotate: -30, opacity: 0 }}
            animate={{
                scale: [0, 1.35, 0.92, 1.08, 0.97, 1],
                rotate: [-30, 12, -5, 3, 0],
                opacity: [0, 1, 1, 1, 1, 1]
            }}
            transition={{
                duration: 0.55,
                times: [0, 0.35, 0.5, 0.65, 0.8, 1],
                ease: [0.25, 1.5, 0.5, 1]
            }}
        >
            <defs>
                <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FFFACD" />
                    <stop offset="40%" stopColor={color} />
                    <stop offset="100%" stopColor="#FFA500" />
                </linearGradient>
                <filter id={glowId} x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="8" result="blur" />
                    <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
            </defs>
            <path
                d={path}
                fill={`url(#${gradientId})`}
                stroke={strokeColor}
                strokeWidth={6}
                strokeLinejoin="round"
                filter={`url(#${glowId})`}
            />
        </motion.svg>
    )
}

// ============================================
// 速度线 - 从中心放射
// ============================================

function RadialSpeedLines({
    count = 20,
    colors = ['#FFD700', '#FF6347', '#00CED1', '#FF69B4'],
    delay = 0.1
}: {
    count?: number
    colors?: string[]
    delay?: number
}) {
    const lines = useMemo(() => {
        return Array.from({ length: count }).map((_, i) => {
            const angle = (i / count) * Math.PI * 2
            const length = 70 + Math.random() * 100
            const startRadius = 90 + Math.random() * 60
            return {
                id: i,
                angle,
                length,
                startRadius,
                width: 3 + Math.random() * 5,
                delay: delay + Math.random() * 0.12,
                color: colors[Math.floor(Math.random() * colors.length)],
            }
        })
    }, [count, colors, delay])

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
                        background: `linear-gradient(90deg, ${line.color} 0%, ${line.color}90 40%, transparent 100%)`,
                        transformOrigin: 'left center',
                        transform: `rotate(${line.angle}rad) translateX(${line.startRadius}px)`,
                        borderRadius: line.width / 2,
                    }}
                    initial={{ scaleX: 0, opacity: 0 }}
                    animate={{
                        scaleX: [0, 1.3, 0],
                        opacity: [0, 1, 0]
                    }}
                    transition={{
                        duration: 0.45,
                        delay: line.delay,
                        times: [0, 0.45, 1],
                        ease: 'easeOut',
                    }}
                />
            ))}
        </div>
    )
}

// ============================================
// 彩色粒子爆炸
// ============================================

function ColorfulParticles({
    count = 40,
    colors = ['#FFD700', '#FF6347', '#00CED1', '#FF69B4', '#ADFF2F', '#FFFFFF'],
    delay = 0.08
}: {
    count?: number
    colors?: string[]
    delay?: number
}) {
    const particles = useMemo(() => {
        return Array.from({ length: count }).map((_, i) => {
            const angle = Math.random() * Math.PI * 2
            const distance = 80 + Math.random() * 200
            return {
                id: i,
                startX: 0,
                startY: 0,
                endX: Math.cos(angle) * distance,
                endY: Math.sin(angle) * distance,
                size: 4 + Math.random() * 10,
                delay: delay + Math.random() * 0.25,
                color: colors[Math.floor(Math.random() * colors.length)],
                shape: Math.random() > 0.5 ? 'circle' : 'rect',
                rotation: Math.random() * 360,
            }
        })
    }, [count, colors, delay])

    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {particles.map((p) => (
                <motion.div
                    key={p.id}
                    className="absolute"
                    style={{
                        left: '50%',
                        top: '50%',
                        width: p.size,
                        height: p.size,
                        backgroundColor: p.color,
                        borderRadius: p.shape === 'circle' ? '50%' : '2px',
                        boxShadow: `0 0 ${p.size * 2}px ${p.color}`,
                    }}
                    initial={{
                        x: p.startX,
                        y: p.startY,
                        scale: 0,
                        opacity: 0,
                        rotate: 0,
                    }}
                    animate={{
                        x: p.endX,
                        y: p.endY,
                        scale: [0, 1.5, 0.8, 0],
                        opacity: [0, 1, 0.8, 0],
                        rotate: p.rotation,
                    }}
                    transition={{
                        duration: 0.6,
                        delay: p.delay,
                        ease: 'easeOut',
                    }}
                />
            ))}
        </div>
    )
}

// ============================================
// 漫画装饰元素：星星、闪电、感叹号
// ============================================

function ComicDecorations({
    delay = 0.25
}: {
    delay?: number
}) {
    const decorations = useMemo(() => [
        { id: 0, emoji: '⚡', x: -200, y: -100, size: 50, delay: delay + 0.05, rotation: -15 },
        { id: 1, emoji: '⚡', x: 200, y: -80, size: 45, delay: delay + 0.1, rotation: 20 },
        { id: 2, emoji: '✨', x: -180, y: 90, size: 42, delay: delay + 0.15, rotation: 0 },
        { id: 3, emoji: '✨', x: 180, y: 100, size: 48, delay: delay + 0.2, rotation: 10 },
        { id: 4, emoji: '💥', x: 0, y: -130, size: 55, delay: delay + 0.12, rotation: 0 },
        { id: 5, emoji: '❗', x: -250, y: 0, size: 40, delay: delay + 0.18, rotation: -20 },
        { id: 6, emoji: '❗', x: 250, y: 10, size: 38, delay: delay + 0.22, rotation: 15 },
        { id: 7, emoji: '★', x: -150, y: -140, size: 35, delay: delay + 0.08, rotation: 20 },
        { id: 8, emoji: '★', x: 160, y: -130, size: 38, delay: delay + 0.14, rotation: -10 },
        { id: 9, emoji: '★', x: 0, y: 140, size: 40, delay: delay + 0.25, rotation: 0 },
    ], [delay])

    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {decorations.map((d) => (
                <motion.div
                    key={d.id}
                    className="absolute select-none"
                    style={{
                        left: `calc(50% + ${d.x}px)`,
                        top: `calc(50% + ${d.y}px)`,
                        fontSize: d.size,
                        filter: 'drop-shadow(0 0 8px rgba(255,255,0,0.8))',
                    }}
                    initial={{ scale: 0, opacity: 0, rotate: d.rotation - 30 }}
                    animate={{
                        scale: [0, 1.4, 1, 1.1, 1],
                        opacity: [0, 1, 1, 1, 1],
                        rotate: [d.rotation - 30, d.rotation + 10, d.rotation - 5, d.rotation]
                    }}
                    transition={{
                        duration: 0.5,
                        delay: d.delay,
                        times: [0, 0.4, 0.6, 0.8, 1],
                        ease: 'easeOut',
                    }}
                >
                    {d.emoji}
                </motion.div>
            ))}
        </div>
    )
}

// ============================================
// 主组件 - 软糖主标题
// ============================================

export function CandyMainTitle({
    text,
    scale = 1,
    gradient = 'linear-gradient(180deg, #FFFACD 0%, #FFE135 30%, #FFD700 60%, #FFA500 100%)',
    strokeColor = '#5500AA',
    outerStrokeColor = '#FFFFFF',
    glowColor = '#FFD700',
    plateColor = '#FFE135',
    autoPlay = true,
    skipToEnd = false,
    onComplete,
    className = '',
}: CandyMainTitleProps) {
    const [isVisible, setIsVisible] = useState(false)
    const controls = useAnimationControls()

    useEffect(() => {
        if (autoPlay || skipToEnd) {
            setIsVisible(true)
        }
    }, [autoPlay, skipToEnd])

    const handleAnimationComplete = useCallback(() => {
        onComplete?.()
    }, [onComplete])

    // 计算尺寸
    const fontSize = 110 * scale
    const plateSize = Math.max(text.length * fontSize * 0.75, fontSize * 3)

    // 静态模式
    if (skipToEnd) {
        return (
            <div
                className={`relative inline-flex items-center justify-center ${className}`}
                style={{
                    minWidth: plateSize + 180,
                    minHeight: plateSize * 0.65,
                }}
            >
                <CartoonExplosionPlate
                    size={plateSize}
                    color={plateColor}
                    strokeColor={glowColor}
                    animate={false}
                />

                {/* 静态文字 */}
                <div className="relative z-10">
                    {/* 最外层白色描边 */}
                    <span
                        style={{
                            position: 'absolute',
                            left: 0,
                            top: 0,
                            fontSize,
                            fontWeight: 900,
                            fontFamily: '"Zcool KuaiLe", "Zcool QingKe HuangYou", "PingFang SC", sans-serif',
                            color: 'transparent',
                            WebkitTextStroke: `16px ${outerStrokeColor}`,
                            letterSpacing: '0.06em',
                            whiteSpace: 'nowrap',
                            zIndex: 1,
                        }}
                    >
                        {text}
                    </span>

                    {/* 内层紫色描边 */}
                    <span
                        style={{
                            position: 'absolute',
                            left: 0,
                            top: 0,
                            fontSize,
                            fontWeight: 900,
                            fontFamily: '"Zcool KuaiLe", "Zcool QingKe HuangYou", "PingFang SC", sans-serif',
                            color: 'transparent',
                            WebkitTextStroke: `8px ${strokeColor}`,
                            letterSpacing: '0.06em',
                            whiteSpace: 'nowrap',
                            zIndex: 2,
                        }}
                    >
                        {text}
                    </span>

                    {/* 渐变填充文字 */}
                    <span
                        style={{
                            position: 'relative',
                            fontSize,
                            fontWeight: 900,
                            fontFamily: '"Zcool KuaiLe", "Zcool QingKe HuangYou", "PingFang SC", sans-serif',
                            background: gradient,
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                            letterSpacing: '0.06em',
                            whiteSpace: 'nowrap',
                            zIndex: 3,
                            filter: `drop-shadow(0 0 25px ${glowColor}) drop-shadow(0 6px 0 rgba(0,0,0,0.3))`,
                        }}
                    >
                        {text}
                    </span>
                </div>
            </div>
        )
    }

    return (
        <div
            className={`relative inline-flex items-center justify-center ${className}`}
            style={{
                minWidth: plateSize + 180,
                minHeight: plateSize * 0.65,
            }}
        >
            <AnimatePresence>
                {isVisible && (
                    <>
                        {/* 爆炸底板 */}
                        <CartoonExplosionPlate
                            size={plateSize}
                            color={plateColor}
                            strokeColor={glowColor}
                        />

                        {/* 速度线 */}
                        <RadialSpeedLines
                            count={22}
                            colors={['#FFD700', '#FF6347', '#00CED1', '#FF69B4', '#ADFF2F']}
                            delay={0.1}
                        />

                        {/* 彩色粒子 */}
                        <ColorfulParticles
                            count={45}
                            colors={['#FFD700', '#FF6347', '#00CED1', '#FF69B4', '#ADFF2F', '#FFF']}
                            delay={0.05}
                        />

                        {/* 漫画装饰 */}
                        <ComicDecorations delay={0.2} />

                        {/* 主文字 - 弹跳 + squash & stretch */}
                        <motion.div
                            className="relative z-10"
                            initial={{
                                opacity: 0,
                                scale: 0.15,
                                y: 80,
                                rotate: -20,
                                scaleX: 1.3,
                                scaleY: 0.7,
                            }}
                            animate={{
                                opacity: [0, 1, 1, 1, 1],
                                // squash & stretch 弹性变形
                                scale: [0.15, 1.25, 0.88, 1.12, 0.96, 1],
                                y: [80, -30, 15, -8, 4, 0],
                                rotate: [-20, 10, -6, 4, -2, 0],
                                scaleX: [1.3, 0.85, 1.15, 0.95, 1.02, 1],
                                scaleY: [0.7, 1.2, 0.9, 1.08, 0.98, 1],
                            }}
                            transition={{
                                duration: 0.7,
                                times: [0, 0.3, 0.45, 0.6, 0.78, 1],
                                ease: [0.22, 1.3, 0.36, 1],
                            }}
                            onAnimationComplete={handleAnimationComplete}
                        >
                            {/* 最外层白色描边 */}
                            <span
                                style={{
                                    position: 'absolute',
                                    left: 0,
                                    top: 0,
                                    fontSize,
                                    fontWeight: 900,
                                    fontFamily: '"Zcool KuaiLe", "Zcool QingKe HuangYou", "PingFang SC", sans-serif',
                                    color: 'transparent',
                                    WebkitTextStroke: `16px ${outerStrokeColor}`,
                                    letterSpacing: '0.06em',
                                    whiteSpace: 'nowrap',
                                    zIndex: 1,
                                }}
                            >
                                {text}
                            </span>

                            {/* 内层紫色描边 */}
                            <span
                                style={{
                                    position: 'absolute',
                                    left: 0,
                                    top: 0,
                                    fontSize,
                                    fontWeight: 900,
                                    fontFamily: '"Zcool KuaiLe", "Zcool QingKe HuangYou", "PingFang SC", sans-serif',
                                    color: 'transparent',
                                    WebkitTextStroke: `8px ${strokeColor}`,
                                    letterSpacing: '0.06em',
                                    whiteSpace: 'nowrap',
                                    zIndex: 2,
                                }}
                            >
                                {text}
                            </span>

                            {/* 渐变填充文字 */}
                            <span
                                style={{
                                    position: 'relative',
                                    fontSize,
                                    fontWeight: 900,
                                    fontFamily: '"Zcool KuaiLe", "Zcool QingKe HuangYou", "PingFang SC", sans-serif',
                                    background: gradient,
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    backgroundClip: 'text',
                                    letterSpacing: '0.06em',
                                    whiteSpace: 'nowrap',
                                    zIndex: 3,
                                    filter: `drop-shadow(0 0 25px ${glowColor}) drop-shadow(0 6px 0 rgba(0,0,0,0.3))`,
                                }}
                            >
                                {text}
                            </span>
                        </motion.div>

                        {/* 呼吸循环动画层 (持续轻微脉动) */}
                        <motion.div
                            className="absolute inset-0 z-0"
                            animate={{
                                scale: [1, 1.02, 1],
                            }}
                            transition={{
                                duration: 1.2,
                                delay: 0.8,
                                repeat: Infinity,
                                repeatType: 'loop',
                                ease: 'easeInOut',
                            }}
                        />
                    </>
                )}
            </AnimatePresence>
        </div>
    )
}

export default CandyMainTitle

