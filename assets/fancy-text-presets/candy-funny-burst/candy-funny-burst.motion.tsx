'use client'

/**
 * 软糖爆笑大字特效 - Candy Funny Burst
 * 
 * 《一见你就笑》综艺爆笑大字效果:
 * - 适用于【笑死我了】【绝了】【好会玩】等爆笑瞬间
 * - 软糖质感彩虹渐变 + 超粗描边
 * - 极致弹跳感 + squash & stretch 变形
 * - 漫画爆炸底板 + 速度线 + 彩色粒子
 * - 表情包图标（🤣😂😹）+ 漫画元素
 * - 时长 1.2 秒（快速强调）
 */

import React, { useEffect, useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// ============================================
// 类型定义
// ============================================

export interface CandyFunnyBurstProps {
    /** 显示的文字内容 */
    text: string
    /** 缩放比例 (默认: 1) */
    scale?: number
    /** 渐变填充 */
    gradient?: string
    /** 内描边颜色 */
    strokeColor?: string
    /** 外描边颜色 */
    outerStrokeColor?: string
    /** 发光颜色 */
    glowColor?: string
    /** 爆炸底板颜色 */
    plateColor?: string
    /** 是否自动播放 */
    autoPlay?: boolean
    /** 跳过动画 */
    skipToEnd?: boolean
    /** 动画完成回调 */
    onComplete?: () => void
    /** 额外的 CSS 类名 */
    className?: string
}

// ============================================
// 漫画爆炸底板
// ============================================

function ComicExplosionPlate({
    size,
    color = '#FFE66D',
    strokeColor = '#FF6B6B',
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
        const points = 18 // 更多尖角，更卡通
        const outerRadius = size * 0.47
        const innerRadius = size * 0.28

        let d = ''
        for (let i = 0; i < points * 2; i++) {
            const angle = (i / (points * 2)) * Math.PI * 2 - Math.PI / 2
            const radius = i % 2 === 0 ? outerRadius : innerRadius
            // 手绘感扰动
            const jitter = 1 + (Math.sin(i * 2.1 + 1.3) * 0.18) + (Math.cos(i * 3.7) * 0.1)
            const x = cx + Math.cos(angle) * radius * jitter
            const y = cy + Math.sin(angle) * radius * jitter
            d += (i === 0 ? 'M' : 'L') + `${x.toFixed(1)},${y.toFixed(1)}`
        }
        d += 'Z'
        return d
    }, [size])

    const gradientId = `funnyPlateGrad-${size}`
    const glowId = `funnyPlateGlow-${size}`

    const content = (
        <>
            <defs>
                <radialGradient id={gradientId} cx="30%" cy="30%" r="70%">
                    <stop offset="0%" stopColor="#FFFFFF" stopOpacity={0.6} />
                    <stop offset="40%" stopColor={color} />
                    <stop offset="100%" stopColor={strokeColor} stopOpacity={0.8} />
                </radialGradient>
                <filter id={glowId} x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="10" result="blur" />
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
                strokeWidth={7}
                strokeLinejoin="round"
                filter={`url(#${glowId})`}
            />
        </>
    )

    if (!animate) {
        return (
            <svg
                width={size}
                height={size}
                viewBox={`0 0 ${size} ${size}`}
                className="absolute"
                style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}
            >
                {content}
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
            initial={{ scale: 0, rotate: -25, opacity: 0 }}
            animate={{
                scale: [0, 1.4, 0.88, 1.15, 0.95, 1],
                rotate: [-25, 15, -8, 4, 0],
                opacity: [0, 1, 1, 1, 1, 1]
            }}
            transition={{
                duration: 0.5,
                times: [0, 0.3, 0.45, 0.6, 0.8, 1],
                ease: [0.22, 1.4, 0.36, 1]
            }}
        >
            {content}
        </motion.svg>
    )
}

// ============================================
// 放射速度线
// ============================================

function BurstSpeedLines({
    count = 24,
    colors = ['#FF6B6B', '#FFE66D', '#4ECDC4', '#A78BFA', '#F472B6'],
    delay = 0.08
}: {
    count?: number
    colors?: string[]
    delay?: number
}) {
    const lines = useMemo(() => {
        return Array.from({ length: count }).map((_, i) => {
            const angle = (i / count) * Math.PI * 2
            const length = 60 + Math.random() * 120
            const startRadius = 80 + Math.random() * 50
            return {
                id: i,
                angle,
                length,
                startRadius,
                width: 4 + Math.random() * 6,
                delay: delay + Math.random() * 0.1,
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
                        background: `linear-gradient(90deg, ${line.color} 0%, ${line.color}80 50%, transparent 100%)`,
                        transformOrigin: 'left center',
                        transform: `rotate(${line.angle}rad) translateX(${line.startRadius}px)`,
                        borderRadius: line.width / 2,
                    }}
                    initial={{ scaleX: 0, opacity: 0 }}
                    animate={{
                        scaleX: [0, 1.5, 0],
                        opacity: [0, 1, 0]
                    }}
                    transition={{
                        duration: 0.4,
                        delay: line.delay,
                        times: [0, 0.4, 1],
                        ease: 'easeOut',
                    }}
                />
            ))}
        </div>
    )
}

// ============================================
// 彩色爆炸粒子
// ============================================

function ExplosiveParticles({
    count = 50,
    colors = ['#FF6B6B', '#FFE66D', '#4ECDC4', '#A78BFA', '#F472B6', '#FFFFFF'],
    delay = 0.05
}: {
    count?: number
    colors?: string[]
    delay?: number
}) {
    const particles = useMemo(() => {
        return Array.from({ length: count }).map((_, i) => {
            const angle = Math.random() * Math.PI * 2
            const distance = 100 + Math.random() * 250
            return {
                id: i,
                endX: Math.cos(angle) * distance,
                endY: Math.sin(angle) * distance,
                size: 5 + Math.random() * 12,
                delay: delay + Math.random() * 0.2,
                color: colors[Math.floor(Math.random() * colors.length)],
                shape: Math.random() > 0.6 ? 'circle' : (Math.random() > 0.5 ? 'rect' : 'star'),
                rotation: Math.random() * 720,
            }
        })
    }, [count, colors, delay])

    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {particles.map((p) => (
                <motion.div
                    key={p.id}
                    className="absolute flex items-center justify-center"
                    style={{
                        left: '50%',
                        top: '50%',
                        width: p.size,
                        height: p.size,
                        backgroundColor: p.shape !== 'star' ? p.color : 'transparent',
                        borderRadius: p.shape === 'circle' ? '50%' : '3px',
                        boxShadow: `0 0 ${p.size}px ${p.color}`,
                        fontSize: p.shape === 'star' ? p.size : 0,
                        color: p.color,
                    }}
                    initial={{
                        x: 0,
                        y: 0,
                        scale: 0,
                        opacity: 0,
                        rotate: 0,
                    }}
                    animate={{
                        x: p.endX,
                        y: p.endY,
                        scale: [0, 1.5, 1, 0],
                        opacity: [0, 1, 0.9, 0],
                        rotate: p.rotation,
                    }}
                    transition={{
                        duration: 0.55,
                        delay: p.delay,
                        ease: 'easeOut',
                    }}
                >
                    {p.shape === 'star' ? '✦' : null}
                </motion.div>
            ))}
        </div>
    )
}

// ============================================
// 表情包装饰
// ============================================

function EmojiExplosion({
    delay = 0.15
}: {
    delay?: number
}) {
    const emojis = useMemo(() => [
        { id: 0, emoji: '🤣', x: -180, y: -100, size: 55, delay: delay + 0.05, rotation: -15 },
        { id: 1, emoji: '😂', x: 180, y: -90, size: 50, delay: delay + 0.1, rotation: 20 },
        { id: 2, emoji: '😹', x: -200, y: 80, size: 48, delay: delay + 0.15, rotation: -10 },
        { id: 3, emoji: '🤪', x: 190, y: 90, size: 52, delay: delay + 0.2, rotation: 15 },
        { id: 4, emoji: '😆', x: 0, y: -140, size: 45, delay: delay + 0.12, rotation: 0 },
        { id: 5, emoji: '💥', x: -120, y: -130, size: 40, delay: delay + 0.08, rotation: -25 },
        { id: 6, emoji: '💥', x: 130, y: 130, size: 38, delay: delay + 0.18, rotation: 20 },
        { id: 7, emoji: '⚡', x: 0, y: 150, size: 42, delay: delay + 0.22, rotation: 0 },
    ], [delay])

    return (
        <div className="absolute inset-0 pointer-events-none overflow-visible">
            {emojis.map((e) => (
                <motion.div
                    key={e.id}
                    className="absolute select-none"
                    style={{
                        left: `calc(50% + ${e.x}px)`,
                        top: `calc(50% + ${e.y}px)`,
                        fontSize: e.size,
                        filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))',
                    }}
                    initial={{ scale: 0, opacity: 0, rotate: e.rotation - 40, y: 30 }}
                    animate={{
                        scale: [0, 1.5, 1.1, 1],
                        opacity: [0, 1, 1, 1],
                        rotate: [e.rotation - 40, e.rotation + 15, e.rotation - 5, e.rotation],
                        y: [30, -10, 5, 0]
                    }}
                    transition={{
                        duration: 0.45,
                        delay: e.delay,
                        times: [0, 0.4, 0.7, 1],
                        ease: 'easeOut',
                    }}
                >
                    {e.emoji}
                </motion.div>
            ))}
        </div>
    )
}

// ============================================
// 漫画元素：星星、闪电、感叹号
// ============================================

function ComicElements({
    color = '#FFE66D',
    delay = 0.2
}: {
    color?: string
    delay?: number
}) {
    const elements = useMemo(() => [
        { id: 0, type: '★', x: -230, y: -50, size: 35, delay: delay + 0.1 },
        { id: 1, type: '★', x: 230, y: -40, size: 38, delay: delay + 0.15 },
        { id: 2, type: '★', x: -100, y: 150, size: 32, delay: delay + 0.2 },
        { id: 3, type: '★', x: 110, y: -160, size: 30, delay: delay + 0.25 },
        { id: 4, type: '✦', x: -250, y: 100, size: 28, delay: delay + 0.12 },
        { id: 5, type: '✦', x: 250, y: 110, size: 30, delay: delay + 0.18 },
        { id: 6, type: '!', x: -280, y: -20, size: 45, delay: delay + 0.08, isBold: true },
        { id: 7, type: '!', x: 280, y: 30, size: 42, delay: delay + 0.14, isBold: true },
    ], [delay])

    return (
        <div className="absolute inset-0 pointer-events-none overflow-visible">
            {elements.map((el) => (
                <motion.div
                    key={el.id}
                    className="absolute"
                    style={{
                        left: `calc(50% + ${el.x}px)`,
                        top: `calc(50% + ${el.y}px)`,
                        fontSize: el.size,
                        fontWeight: (el as { isBold?: boolean }).isBold ? 900 : 400,
                        color: color,
                        textShadow: `0 0 15px ${color}, 0 0 30px ${color}80`,
                    }}
                    initial={{ scale: 0, opacity: 0, rotate: 0 }}
                    animate={{
                        scale: [0, 1.4, 1],
                        opacity: [0, 1, 1],
                        rotate: [0, 180, 360]
                    }}
                    transition={{
                        duration: 0.5,
                        delay: el.delay,
                        ease: 'easeOut',
                    }}
                >
                    {el.type}
                </motion.div>
            ))}
        </div>
    )
}

// ============================================
// 主组件
// ============================================

export function CandyFunnyBurst({
    text,
    scale = 1,
    gradient = 'linear-gradient(135deg, #FF6B6B 0%, #FFE66D 25%, #4ECDC4 50%, #A78BFA 75%, #F472B6 100%)',
    strokeColor = '#6B21A8',
    outerStrokeColor = '#FFFFFF',
    glowColor = '#F472B6',
    plateColor = '#FFE66D',
    autoPlay = true,
    skipToEnd = false,
    onComplete,
    className = '',
}: CandyFunnyBurstProps) {
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        if (autoPlay || skipToEnd) {
            setIsVisible(true)
        }
    }, [autoPlay, skipToEnd])

    const handleAnimationComplete = useCallback(() => {
        onComplete?.()
    }, [onComplete])

    // 计算尺寸
    const fontSize = 95 * scale
    const plateSize = Math.max(text.length * fontSize * 0.8, fontSize * 3)

    // 静态模式
    if (skipToEnd) {
        return (
            <div
                className={`relative inline-flex items-center justify-center ${className}`}
                style={{
                    minWidth: plateSize + 200,
                    minHeight: plateSize * 0.7,
                }}
            >
                <ComicExplosionPlate
                    size={plateSize}
                    color={plateColor}
                    strokeColor={glowColor}
                    animate={false}
                />

                <div className="relative z-10">
                    {/* 外层白色描边 */}
                    <span
                        style={{
                            position: 'absolute',
                            left: 0,
                            top: 0,
                            fontSize,
                            fontWeight: 900,
                            fontFamily: '"Zcool KuaiLe", "Zcool QingKe HuangYou", "PingFang SC", sans-serif',
                            color: 'transparent',
                            WebkitTextStroke: `14px ${outerStrokeColor}`,
                            letterSpacing: '0.05em',
                            whiteSpace: 'nowrap',
                            zIndex: 1,
                        }}
                    >
                        {text}
                    </span>

                    {/* 内层深色描边 */}
                    <span
                        style={{
                            position: 'absolute',
                            left: 0,
                            top: 0,
                            fontSize,
                            fontWeight: 900,
                            fontFamily: '"Zcool KuaiLe", "Zcool QingKe HuangYou", "PingFang SC", sans-serif',
                            color: 'transparent',
                            WebkitTextStroke: `7px ${strokeColor}`,
                            letterSpacing: '0.05em',
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
                            letterSpacing: '0.05em',
                            whiteSpace: 'nowrap',
                            zIndex: 3,
                            filter: `drop-shadow(0 0 20px ${glowColor}) drop-shadow(0 8px 0 rgba(0,0,0,0.3))`,
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
                minWidth: plateSize + 200,
                minHeight: plateSize * 0.7,
            }}
        >
            <AnimatePresence>
                {isVisible && (
                    <>
                        {/* 爆炸底板 */}
                        <ComicExplosionPlate
                            size={plateSize}
                            color={plateColor}
                            strokeColor={glowColor}
                        />

                        {/* 速度线 */}
                        <BurstSpeedLines
                            count={26}
                            colors={['#FF6B6B', '#FFE66D', '#4ECDC4', '#A78BFA', '#F472B6']}
                            delay={0.06}
                        />

                        {/* 彩色粒子 */}
                        <ExplosiveParticles
                            count={55}
                            colors={['#FF6B6B', '#FFE66D', '#4ECDC4', '#A78BFA', '#F472B6', '#FFF']}
                            delay={0.03}
                        />

                        {/* 表情包装饰 */}
                        <EmojiExplosion delay={0.12} />

                        {/* 漫画元素 */}
                        <ComicElements color={plateColor} delay={0.18} />

                        {/* 主文字 - 极致弹跳 + squash & stretch */}
                        <motion.div
                            className="relative z-10"
                            initial={{
                                opacity: 0,
                                scale: 0.1,
                                y: 100,
                                rotate: -30,
                                scaleX: 1.5,
                                scaleY: 0.5,
                            }}
                            animate={{
                                opacity: [0, 1, 1, 1, 1],
                                scale: [0.1, 1.35, 0.82, 1.18, 0.94, 1],
                                y: [100, -40, 20, -12, 6, 0],
                                rotate: [-30, 15, -10, 6, -3, 0],
                                scaleX: [1.5, 0.75, 1.25, 0.92, 1.05, 1],
                                scaleY: [0.5, 1.35, 0.85, 1.12, 0.96, 1],
                            }}
                            transition={{
                                duration: 0.6,
                                times: [0, 0.25, 0.4, 0.55, 0.75, 1],
                                ease: [0.18, 1.5, 0.32, 1],
                            }}
                            onAnimationComplete={handleAnimationComplete}
                        >
                            {/* 外层白色描边 */}
                            <span
                                style={{
                                    position: 'absolute',
                                    left: 0,
                                    top: 0,
                                    fontSize,
                                    fontWeight: 900,
                                    fontFamily: '"Zcool KuaiLe", "Zcool QingKe HuangYou", "PingFang SC", sans-serif',
                                    color: 'transparent',
                                    WebkitTextStroke: `14px ${outerStrokeColor}`,
                                    letterSpacing: '0.05em',
                                    whiteSpace: 'nowrap',
                                    zIndex: 1,
                                }}
                            >
                                {text}
                            </span>

                            {/* 内层深色描边 */}
                            <span
                                style={{
                                    position: 'absolute',
                                    left: 0,
                                    top: 0,
                                    fontSize,
                                    fontWeight: 900,
                                    fontFamily: '"Zcool KuaiLe", "Zcool QingKe HuangYou", "PingFang SC", sans-serif',
                                    color: 'transparent',
                                    WebkitTextStroke: `7px ${strokeColor}`,
                                    letterSpacing: '0.05em',
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
                                    letterSpacing: '0.05em',
                                    whiteSpace: 'nowrap',
                                    zIndex: 3,
                                    filter: `drop-shadow(0 0 20px ${glowColor}) drop-shadow(0 8px 0 rgba(0,0,0,0.3))`,
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

export default CandyFunnyBurst

