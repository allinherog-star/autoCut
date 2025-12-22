'use client'

/**
 * 霓虹脉冲旋风特效 - Neon Pulse Swirl
 * 
 * 震撼登场综艺花字效果:
 * - 适用于【超绝重磅】【震撼来袭】【终极大招】等高能瞬间
 * - 霓虹涡旋底板 + 旋转扩散动画
 * - 脉冲光环 + 多层发光效果
 * - 闪电飞散 + 星芒粒子
 * - 文字旋入 + 弹性缩放
 * - 时长 1.4 秒
 * 
 * 统一舞台模型:
 * 舞台中心 (0,0)
 * ├── Plate Layer (涡旋底板 + 脉冲光环)
 * ├── Impact FX Layer (闪电 + 星芒粒子)
 * ├── Text Layer (三层描边文字)
 * └── Emoji / Comic Layer (装饰图标)
 */

import React, { useEffect, useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// ============================================
// 类型定义
// ============================================

export interface NeonPulseSwirlProps {
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
    /** 涡旋颜色 */
    swirlColor?: string
    /** 闪电颜色 */
    lightningColor?: string
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
// 涡旋底板组件
// ============================================

function SwirlPlate({
    size,
    color = '#00FFFF',
    animate = true,
}: {
    size: number
    color?: string
    animate?: boolean
}) {
    const arms = 6
    const spiralPath = useMemo(() => {
        let d = ''
        for (let arm = 0; arm < arms; arm++) {
            const baseAngle = (arm / arms) * Math.PI * 2
            const points = 30
            for (let i = 0; i < points; i++) {
                const t = i / points
                const radius = 20 + t * (size * 0.4)
                const angle = baseAngle + t * Math.PI * 1.5
                const x = size / 2 + Math.cos(angle) * radius
                const y = size / 2 + Math.sin(angle) * radius
                const width = 8 - t * 5
                d += `M${x - width / 2},${y} L${x + width / 2},${y} `
            }
        }
        return d
    }, [size])

    const gradientId = `swirlGrad-${size}`
    const glowId = `swirlGlow-${size}`

    const content = (
        <>
            <defs>
                <radialGradient id={gradientId} cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor={color} stopOpacity={0.9} />
                    <stop offset="60%" stopColor={color} stopOpacity={0.4} />
                    <stop offset="100%" stopColor={color} stopOpacity={0} />
                </radialGradient>
                <filter id={glowId} x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="15" result="blur" />
                    <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
            </defs>
            {/* 中心发光圆 */}
            <circle
                cx={size / 2}
                cy={size / 2}
                r={size * 0.35}
                fill={`url(#${gradientId})`}
                filter={`url(#${glowId})`}
            />
            {/* 涡旋臂 */}
            {Array.from({ length: arms }).map((_, i) => {
                const angle = (i / arms) * Math.PI * 2
                return (
                    <g key={i}>
                        {Array.from({ length: 20 }).map((_, j) => {
                            const t = j / 20
                            const radius = 30 + t * (size * 0.38)
                            const armAngle = angle + t * Math.PI * 1.2
                            const x = size / 2 + Math.cos(armAngle) * radius
                            const y = size / 2 + Math.sin(armAngle) * radius
                            const opacity = 0.8 - t * 0.6
                            const dotSize = 6 - t * 4
                            return (
                                <circle
                                    key={j}
                                    cx={x}
                                    cy={y}
                                    r={dotSize}
                                    fill={color}
                                    opacity={opacity}
                                />
                            )
                        })}
                    </g>
                )
            })}
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
            initial={{ scale: 0, rotate: -180, opacity: 0 }}
            animate={{
                scale: [0, 1.2, 1],
                rotate: [-180, 30, 0],
                opacity: [0, 1, 1]
            }}
            transition={{
                duration: 0.6,
                times: [0, 0.6, 1],
                ease: [0.16, 1, 0.3, 1]
            }}
        >
            {content}
        </motion.svg>
    )
}

// ============================================
// 脉冲光环组件
// ============================================

function PulseRings({
    count = 3,
    color = '#00FFFF',
    delay = 0.1
}: {
    count?: number
    color?: string
    delay?: number
}) {
    return (
        <div className="absolute inset-0 pointer-events-none">
            {Array.from({ length: count }).map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute rounded-full"
                    style={{
                        left: '50%',
                        top: '50%',
                        width: 100,
                        height: 100,
                        border: `3px solid ${color}`,
                        boxShadow: `0 0 20px ${color}, inset 0 0 20px ${color}40`,
                        transform: 'translate(-50%, -50%)',
                    }}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{
                        scale: [0.5, 2.5 + i * 0.5, 3 + i * 0.5],
                        opacity: [0, 0.8, 0]
                    }}
                    transition={{
                        duration: 0.8,
                        delay: delay + i * 0.15,
                        ease: 'easeOut',
                    }}
                />
            ))}
        </div>
    )
}

// ============================================
// 闪电飞散组件
// ============================================

function LightningBolts({
    count = 8,
    color = '#FFFF00',
    delay = 0.15
}: {
    count?: number
    color?: string
    delay?: number
}) {
    const bolts = useMemo(() => {
        return Array.from({ length: count }).map((_, i) => {
            const angle = (i / count) * Math.PI * 2 + Math.random() * 0.3
            const distance = 150 + Math.random() * 100
            return {
                id: i,
                angle,
                distance,
                length: 40 + Math.random() * 60,
                delay: delay + Math.random() * 0.15,
            }
        })
    }, [count, delay])

    // 生成闪电 SVG 路径
    const generateLightningPath = (length: number) => {
        let d = 'M0,0'
        let x = 0
        let y = 0
        const segments = 5
        for (let i = 0; i < segments; i++) {
            const segmentLength = length / segments
            y += segmentLength
            x += (Math.random() - 0.5) * 20
            d += ` L${x},${y}`
        }
        return d
    }

    return (
        <div className="absolute inset-0 pointer-events-none overflow-visible">
            {bolts.map((bolt) => (
                <motion.svg
                    key={bolt.id}
                    width={60}
                    height={bolt.length + 20}
                    viewBox={`-30 0 60 ${bolt.length + 20}`}
                    className="absolute"
                    style={{
                        left: '50%',
                        top: '50%',
                        transformOrigin: 'center top',
                        transform: `rotate(${bolt.angle * 180 / Math.PI}deg)`,
                    }}
                    initial={{ opacity: 0, y: 0 }}
                    animate={{
                        opacity: [0, 1, 1, 0],
                        y: [0, bolt.distance * 0.5, bolt.distance, bolt.distance]
                    }}
                    transition={{
                        duration: 0.5,
                        delay: bolt.delay,
                        times: [0, 0.2, 0.7, 1],
                        ease: 'easeOut',
                    }}
                >
                    <path
                        d={generateLightningPath(bolt.length)}
                        stroke={color}
                        strokeWidth={3}
                        fill="none"
                        filter="url(#lightningGlow)"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                    <defs>
                        <filter id="lightningGlow" x="-50%" y="-50%" width="200%" height="200%">
                            <feGaussianBlur stdDeviation="3" result="blur" />
                            <feMerge>
                                <feMergeNode in="blur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>
                </motion.svg>
            ))}
        </div>
    )
}

// ============================================
// 星芒粒子组件
// ============================================

function StarburstParticles({
    count = 30,
    colors = ['#00FFFF', '#FF00FF', '#FFFF00', '#FFFFFF'],
    delay = 0.1
}: {
    count?: number
    colors?: string[]
    delay?: number
}) {
    const particles = useMemo(() => {
        return Array.from({ length: count }).map((_, i) => {
            const angle = Math.random() * Math.PI * 2
            const distance = 120 + Math.random() * 180
            return {
                id: i,
                endX: Math.cos(angle) * distance,
                endY: Math.sin(angle) * distance,
                size: 3 + Math.random() * 8,
                delay: delay + Math.random() * 0.25,
                color: colors[Math.floor(Math.random() * colors.length)],
                isStar: Math.random() > 0.5,
                rotation: Math.random() * 540,
            }
        })
    }, [count, colors, delay])

    return (
        <div className="absolute inset-0 pointer-events-none overflow-visible">
            {particles.map((p) => (
                <motion.div
                    key={p.id}
                    className="absolute flex items-center justify-center"
                    style={{
                        left: '50%',
                        top: '50%',
                        width: p.size,
                        height: p.size,
                        color: p.color,
                        fontSize: p.isStar ? p.size * 1.5 : 0,
                        backgroundColor: p.isStar ? 'transparent' : p.color,
                        borderRadius: p.isStar ? 0 : '50%',
                        boxShadow: `0 0 ${p.size * 2}px ${p.color}`,
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
                        scale: [0, 1.5, 1, 0.5],
                        opacity: [0, 1, 0.8, 0],
                        rotate: p.rotation,
                    }}
                    transition={{
                        duration: 0.7,
                        delay: p.delay,
                        ease: 'easeOut',
                    }}
                >
                    {p.isStar ? '✦' : null}
                </motion.div>
            ))}
        </div>
    )
}

// ============================================
// 装饰图标组件
// ============================================

function DecorativeIcons({
    delay = 0.3
}: {
    delay?: number
}) {
    const icons = useMemo(() => [
        { id: 0, icon: '⚡', x: -200, y: -100, size: 48, delay: delay + 0.05, rotation: -15 },
        { id: 1, icon: '💥', x: 200, y: -80, size: 52, delay: delay + 0.1, rotation: 20 },
        { id: 2, icon: '✨', x: -180, y: 100, size: 45, delay: delay + 0.15, rotation: -10 },
        { id: 3, icon: '🔥', x: 180, y: 90, size: 50, delay: delay + 0.2, rotation: 15 },
        { id: 4, icon: '💫', x: 0, y: -150, size: 42, delay: delay + 0.08, rotation: 0 },
        { id: 5, icon: '⭐', x: -240, y: 0, size: 40, delay: delay + 0.12, rotation: -20 },
        { id: 6, icon: '⭐', x: 240, y: 10, size: 38, delay: delay + 0.18, rotation: 25 },
    ], [delay])

    return (
        <div className="absolute inset-0 pointer-events-none overflow-visible">
            {icons.map((e) => (
                <motion.div
                    key={e.id}
                    className="absolute select-none"
                    style={{
                        left: `calc(50% + ${e.x}px)`,
                        top: `calc(50% + ${e.y}px)`,
                        fontSize: e.size,
                        filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.8))',
                    }}
                    initial={{ scale: 0, opacity: 0, rotate: e.rotation - 60, y: 40 }}
                    animate={{
                        scale: [0, 1.4, 1],
                        opacity: [0, 1, 1],
                        rotate: [e.rotation - 60, e.rotation + 10, e.rotation],
                        y: [40, -5, 0]
                    }}
                    transition={{
                        duration: 0.5,
                        delay: e.delay,
                        times: [0, 0.6, 1],
                        ease: 'backOut',
                    }}
                >
                    {e.icon}
                </motion.div>
            ))}
        </div>
    )
}

// ============================================
// 主组件
// ============================================

export function NeonPulseSwirl({
    text,
    scale = 1,
    gradient = 'linear-gradient(135deg, #00FFFF 0%, #FF00FF 50%, #FFFF00 100%)',
    strokeColor = '#FF00FF',
    outerStrokeColor = '#001144',
    glowColor = '#00FFFF',
    swirlColor = '#00FFFF',
    lightningColor = '#FFFF00',
    autoPlay = true,
    skipToEnd = false,
    onComplete,
    className = '',
}: NeonPulseSwirlProps) {
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
    const fontSize = 90 * scale
    const plateSize = Math.max(text.length * fontSize * 0.85, fontSize * 3.5)

    // 静态模式
    if (skipToEnd) {
        return (
            <div
                className={`relative inline-flex items-center justify-center ${className}`}
                style={{
                    minWidth: plateSize + 250,
                    minHeight: plateSize * 0.75,
                }}
            >
                <SwirlPlate
                    size={plateSize}
                    color={swirlColor}
                    animate={false}
                />

                <div className="relative z-10">
                    {/* 外层深色描边 */}
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
                            letterSpacing: '0.05em',
                            whiteSpace: 'nowrap',
                            zIndex: 1,
                        }}
                    >
                        {text}
                    </span>

                    {/* 内层亮色描边 */}
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
                            filter: `drop-shadow(0 0 25px ${glowColor}) drop-shadow(0 0 50px ${glowColor}50)`,
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
                minWidth: plateSize + 250,
                minHeight: plateSize * 0.75,
            }}
        >
            <AnimatePresence>
                {isVisible && (
                    <>
                        {/* --- Plate Layer --- */}
                        {/* 涡旋底板 */}
                        <SwirlPlate
                            size={plateSize}
                            color={swirlColor}
                        />

                        {/* 脉冲光环 */}
                        <PulseRings
                            count={4}
                            color={glowColor}
                            delay={0.15}
                        />

                        {/* --- Impact FX Layer --- */}
                        {/* 闪电飞散 */}
                        <LightningBolts
                            count={10}
                            color={lightningColor}
                            delay={0.2}
                        />

                        {/* 星芒粒子 */}
                        <StarburstParticles
                            count={40}
                            colors={[glowColor, lightningColor, strokeColor, '#FFFFFF']}
                            delay={0.1}
                        />

                        {/* --- Emoji / Comic Layer --- */}
                        <DecorativeIcons delay={0.35} />

                        {/* --- Text Layer --- */}
                        {/* 主文字 - 旋入 + 弹性缩放 */}
                        <motion.div
                            className="relative z-10"
                            initial={{
                                opacity: 0,
                                scale: 0.2,
                                rotate: -45,
                            }}
                            animate={{
                                opacity: [0, 1, 1, 1],
                                scale: [0.2, 1.25, 0.9, 1],
                                rotate: [-45, 10, -5, 0],
                            }}
                            transition={{
                                duration: 0.7,
                                times: [0, 0.4, 0.7, 1],
                                ease: [0.22, 1.2, 0.36, 1],
                            }}
                            onAnimationComplete={handleAnimationComplete}
                        >
                            {/* 外层深色描边 */}
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
                                    letterSpacing: '0.05em',
                                    whiteSpace: 'nowrap',
                                    zIndex: 1,
                                }}
                            >
                                {text}
                            </span>

                            {/* 内层亮色描边 */}
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
                                    letterSpacing: '0.05em',
                                    whiteSpace: 'nowrap',
                                    zIndex: 2,
                                }}
                            >
                                {text}
                            </span>

                            {/* 渐变填充文字 */}
                            <motion.span
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
                                    filter: `drop-shadow(0 0 25px ${glowColor}) drop-shadow(0 0 50px ${glowColor}50)`,
                                }}
                                animate={{
                                    filter: [
                                        `drop-shadow(0 0 25px ${glowColor}) drop-shadow(0 0 50px ${glowColor}50)`,
                                        `drop-shadow(0 0 40px ${glowColor}) drop-shadow(0 0 80px ${glowColor}80)`,
                                        `drop-shadow(0 0 25px ${glowColor}) drop-shadow(0 0 50px ${glowColor}50)`,
                                    ]
                                }}
                                transition={{
                                    duration: 1,
                                    delay: 0.5,
                                    repeat: Infinity,
                                    repeatType: 'reverse',
                                }}
                            >
                                {text}
                            </motion.span>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    )
}

export default NeonPulseSwirl
