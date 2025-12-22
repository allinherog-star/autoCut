'use client'

/**
 * 《一见你就笑》综艺花字套件 - 共享特效组件
 * 
 * 统一舞台模型 (Stage Model):
 * 舞台中心 (0,0)
 * ├── Plate Layer      - 底板层 (背景装饰/色块)
 * ├── Impact FX Layer  - 冲击特效层 (速度线/粒子/闪光)
 * ├── Text Layer       - 文字层 (多层描边渐变文字)
 * └── Emoji / Comic Layer - 表情漫画层 (emoji/漫画符号)
 * 
 * 视觉风格：
 * - 色彩极其鲜艳明快 (亮黄 #FFE135、蓝紫 #7C3AED、粉红 #FF6B9D)
 * - 卡通漫画风，手绘感爆炸图形
 * - 粗体圆角手写感字体，白色描边+阴影，立体软糖效果
 * - 弹跳感 squash & stretch 动画
 */

import React, { useMemo } from 'react'
import { motion, Variants } from 'framer-motion'

// ============================================
// 颜色主题
// ============================================

export const COMEDY_COLORS = {
    // 主色系
    sunYellow: '#FFE135',       // 阳光黄
    hotPink: '#FF6B9D',         // 热粉色
    electricBlue: '#00D4FF',    // 电光蓝
    popPurple: '#7C3AED',       // 流行紫
    limeGreen: '#7CFC00',       // 青柠绿
    orangeBurst: '#FF8C00',     // 橙色爆发
    
    // 辅助色
    white: '#FFFFFF',
    softWhite: '#FFF8E7',
    darkOutline: '#2D1B4E',
    
    // 渐变集合
    gradients: {
        sunrise: 'linear-gradient(180deg, #FFE135 0%, #FF8C00 50%, #FF6B9D 100%)',
        candy: 'linear-gradient(135deg, #FF6B9D 0%, #7C3AED 50%, #00D4FF 100%)',
        electric: 'linear-gradient(180deg, #00D4FF 0%, #7C3AED 100%)',
        lime: 'linear-gradient(180deg, #7CFC00 0%, #FFE135 100%)',
        sunset: 'linear-gradient(180deg, #FF6B9D 0%, #FFE135 100%)',
    }
} as const

// ============================================
// 类型定义
// ============================================

export interface BaseEffectProps {
    delay?: number
    scale?: number
    color?: string
}

// ============================================
// Plate Layer 组件
// ============================================

/**
 * 漫画风爆炸底板
 */
export function ComicBurstPlate({
    size = 400,
    color = COMEDY_COLORS.sunYellow,
    spikes = 16,
    animate = true,
    delay = 0,
}: {
    size?: number
    color?: string
    spikes?: number
    animate?: boolean
    delay?: number
}) {
    const points = useMemo(() => {
        const pts: string[] = []
        for (let i = 0; i < spikes * 2; i++) {
            const angle = (i / (spikes * 2)) * Math.PI * 2
            const radius = i % 2 === 0 ? size * 0.5 : size * 0.35
            const x = size / 2 + Math.cos(angle) * radius
            const y = size / 2 + Math.sin(angle) * radius
            pts.push(`${x},${y}`)
        }
        return pts.join(' ')
    }, [size, spikes])

    const content = (
        <polygon
            points={points}
            fill={color}
            stroke="#FFFFFF"
            strokeWidth={4}
            filter="url(#plateGlow)"
        />
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
                <defs>
                    <filter id="plateGlow" x="-50%" y="-50%" width="200%" height="200%">
                        <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#000" floodOpacity="0.3" />
                    </filter>
                </defs>
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
            initial={{ scale: 0, rotate: -30, opacity: 0 }}
            animate={{
                scale: [0, 1.3, 0.9, 1.05, 1],
                rotate: [-30, 15, -5, 0],
                opacity: [0, 1, 1, 1, 1]
            }}
            transition={{
                duration: 0.6,
                delay,
                times: [0, 0.35, 0.55, 0.75, 1],
                ease: [0.34, 1.56, 0.64, 1]
            }}
        >
            <defs>
                <filter id="plateGlow" x="-50%" y="-50%" width="200%" height="200%">
                    <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#000" floodOpacity="0.3" />
                </filter>
            </defs>
            {content}
        </motion.svg>
    )
}

/**
 * 圆角矩形底板 (用于姓名条)
 */
export function RoundedRectPlate({
    width = 500,
    height = 100,
    color = COMEDY_COLORS.sunYellow,
    borderColor = COMEDY_COLORS.white,
    borderWidth = 4,
    animate = true,
    delay = 0,
}: {
    width?: number
    height?: number
    color?: string
    borderColor?: string
    borderWidth?: number
    animate?: boolean
    delay?: number
}) {
    const radius = height * 0.4

    if (!animate) {
        return (
            <svg
                width={width}
                height={height}
                viewBox={`0 0 ${width} ${height}`}
                className="absolute"
                style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}
            >
                <rect
                    x={borderWidth / 2}
                    y={borderWidth / 2}
                    width={width - borderWidth}
                    height={height - borderWidth}
                    rx={radius}
                    ry={radius}
                    fill={color}
                    stroke={borderColor}
                    strokeWidth={borderWidth}
                    filter="url(#rectShadow)"
                />
                <defs>
                    <filter id="rectShadow" x="-20%" y="-20%" width="140%" height="140%">
                        <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#000" floodOpacity="0.25" />
                    </filter>
                </defs>
            </svg>
        )
    }

    return (
        <motion.svg
            width={width}
            height={height}
            viewBox={`0 0 ${width} ${height}`}
            className="absolute"
            style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{
                scaleX: [0, 1.15, 0.95, 1],
                opacity: [0, 1, 1, 1]
            }}
            transition={{
                duration: 0.5,
                delay,
                times: [0, 0.4, 0.7, 1],
                ease: [0.34, 1.56, 0.64, 1]
            }}
        >
            <defs>
                <filter id="rectShadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#000" floodOpacity="0.25" />
                </filter>
            </defs>
            <rect
                x={borderWidth / 2}
                y={borderWidth / 2}
                width={width - borderWidth}
                height={height - borderWidth}
                rx={radius}
                ry={radius}
                fill={color}
                stroke={borderColor}
                strokeWidth={borderWidth}
                filter="url(#rectShadow)"
            />
        </motion.svg>
    )
}

// ============================================
// Impact FX Layer 组件
// ============================================

/**
 * 速度线/集中线效果
 */
export function SpeedLines({
    count = 20,
    color = COMEDY_COLORS.white,
    length = 200,
    delay = 0.1,
}: {
    count?: number
    color?: string
    length?: number
    delay?: number
}) {
    const lines = useMemo(() => {
        return Array.from({ length: count }).map((_, i) => {
            const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.3
            const startDist = 60 + Math.random() * 30
            const lineLength = length * (0.6 + Math.random() * 0.4)
            return {
                id: i,
                angle,
                startDist,
                length: lineLength,
                width: 2 + Math.random() * 4,
                delay: delay + Math.random() * 0.15,
            }
        })
    }, [count, length, delay])

    return (
        <div className="absolute inset-0 pointer-events-none overflow-visible">
            {lines.map((line) => (
                <motion.div
                    key={line.id}
                    className="absolute"
                    style={{
                        left: '50%',
                        top: '50%',
                        width: line.length,
                        height: line.width,
                        backgroundColor: color,
                        borderRadius: line.width / 2,
                        transformOrigin: 'left center',
                        transform: `rotate(${line.angle * 180 / Math.PI}deg) translateX(${line.startDist}px)`,
                        boxShadow: `0 0 10px ${color}80`,
                    }}
                    initial={{ scaleX: 0, opacity: 0 }}
                    animate={{
                        scaleX: [0, 1, 0.8, 0],
                        opacity: [0, 1, 0.6, 0],
                    }}
                    transition={{
                        duration: 0.5,
                        delay: line.delay,
                        ease: 'easeOut',
                    }}
                />
            ))}
        </div>
    )
}

/**
 * 彩色粒子/星星飞散
 */
export function ColorfulParticles({
    count = 25,
    colors = [COMEDY_COLORS.sunYellow, COMEDY_COLORS.hotPink, COMEDY_COLORS.electricBlue, COMEDY_COLORS.popPurple],
    delay = 0.15,
    spread = 180,
}: {
    count?: number
    colors?: string[]
    delay?: number
    spread?: number
}) {
    const particles = useMemo(() => {
        return Array.from({ length: count }).map((_, i) => {
            const angle = Math.random() * Math.PI * 2
            const distance = spread * (0.4 + Math.random() * 0.6)
            const shapes = ['circle', 'star', 'diamond'] as const
            return {
                id: i,
                endX: Math.cos(angle) * distance,
                endY: Math.sin(angle) * distance,
                size: 6 + Math.random() * 12,
                delay: delay + Math.random() * 0.2,
                color: colors[Math.floor(Math.random() * colors.length)],
                shape: shapes[Math.floor(Math.random() * shapes.length)],
                rotation: Math.random() * 720,
            }
        })
    }, [count, colors, delay, spread])

    const renderShape = (shape: string, size: number, color: string) => {
        switch (shape) {
            case 'star':
                return <span style={{ color, fontSize: size * 1.5 }}>★</span>
            case 'diamond':
                return (
                    <div
                        style={{
                            width: size,
                            height: size,
                            backgroundColor: color,
                            transform: 'rotate(45deg)',
                        }}
                    />
                )
            default:
                return (
                    <div
                        style={{
                            width: size,
                            height: size,
                            backgroundColor: color,
                            borderRadius: '50%',
                        }}
                    />
                )
        }
    }

    return (
        <div className="absolute inset-0 pointer-events-none overflow-visible">
            {particles.map((p) => (
                <motion.div
                    key={p.id}
                    className="absolute flex items-center justify-center"
                    style={{
                        left: '50%',
                        top: '50%',
                        filter: `drop-shadow(0 0 4px ${p.color})`,
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
                        scale: [0, 1.5, 1, 0.3],
                        opacity: [0, 1, 0.8, 0],
                        rotate: p.rotation,
                    }}
                    transition={{
                        duration: 0.6,
                        delay: p.delay,
                        ease: 'easeOut',
                    }}
                >
                    {renderShape(p.shape, p.size, p.color)}
                </motion.div>
            ))}
        </div>
    )
}

/**
 * 闪光爆发效果
 */
export function FlashBurst({
    color = COMEDY_COLORS.white,
    delay = 0,
    size = 600,
}: {
    color?: string
    delay?: number
    size?: number
}) {
    return (
        <motion.div
            className="absolute rounded-full"
            style={{
                left: '50%',
                top: '50%',
                width: size,
                height: size,
                background: `radial-gradient(circle, ${color} 0%, ${color}80 20%, ${color}00 70%)`,
                transform: 'translate(-50%, -50%)',
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{
                scale: [0, 1.5, 2],
                opacity: [0, 0.9, 0],
            }}
            transition={{
                duration: 0.4,
                delay,
                ease: 'easeOut',
            }}
        />
    )
}

// ============================================
// Emoji / Comic Layer 组件
// ============================================

/**
 * 漫画表情符号装饰
 */
export function ComicEmojis({
    emojis = ['😂', '🤣', '✨', '💥', '⚡', '🌟'],
    positions = 'auto',
    delay = 0.3,
    scale = 1,
}: {
    emojis?: string[]
    positions?: 'auto' | Array<{ x: number; y: number; rotation?: number }>
    delay?: number
    scale?: number
}) {
    const items = useMemo(() => {
        if (positions === 'auto') {
            // 自动分布在四周
            const autoPositions = [
                { x: -220, y: -80, rotation: -15 },
                { x: 220, y: -60, rotation: 20 },
                { x: -200, y: 80, rotation: -10 },
                { x: 200, y: 70, rotation: 15 },
                { x: -80, y: -130, rotation: 5 },
                { x: 80, y: -120, rotation: -8 },
            ]
            return emojis.slice(0, autoPositions.length).map((emoji, i) => ({
                id: i,
                emoji,
                ...autoPositions[i],
                size: (38 + Math.random() * 16) * scale,
                delay: delay + i * 0.05,
            }))
        }
        return emojis.map((emoji, i) => ({
            id: i,
            emoji,
            ...(positions[i] || { x: 0, y: 0, rotation: 0 }),
            size: (40 + Math.random() * 12) * scale,
            delay: delay + i * 0.05,
        }))
    }, [emojis, positions, delay, scale])

    return (
        <div className="absolute inset-0 pointer-events-none overflow-visible">
            {items.map((e) => (
                <motion.div
                    key={e.id}
                    className="absolute select-none"
                    style={{
                        left: `calc(50% + ${e.x}px)`,
                        top: `calc(50% + ${e.y}px)`,
                        fontSize: e.size,
                        filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.3))',
                        transform: `translate(-50%, -50%)`,
                    }}
                    initial={{
                        scale: 0,
                        opacity: 0,
                        rotate: (e.rotation || 0) - 40,
                        y: 30
                    }}
                    animate={{
                        scale: [0, 1.4, 0.9, 1.1, 1],
                        opacity: [0, 1, 1, 1, 1],
                        rotate: [(e.rotation || 0) - 40, (e.rotation || 0) + 15, (e.rotation || 0) - 5, (e.rotation || 0)],
                        y: [30, -10, 5, 0]
                    }}
                    transition={{
                        duration: 0.55,
                        delay: e.delay,
                        times: [0, 0.4, 0.6, 0.8, 1],
                        ease: [0.34, 1.56, 0.64, 1],
                    }}
                >
                    {e.emoji}
                </motion.div>
            ))}
        </div>
    )
}

/**
 * 漫画风格感叹符号
 */
export function ComicSymbols({
    symbols = ['!', '?', '★', '♪'],
    color = COMEDY_COLORS.sunYellow,
    strokeColor = COMEDY_COLORS.darkOutline,
    delay = 0.25,
}: {
    symbols?: string[]
    color?: string
    strokeColor?: string
    delay?: number
}) {
    const items = useMemo(() => {
        const positions = [
            { x: -180, y: -100, rotation: -20, size: 42 },
            { x: 180, y: -90, rotation: 25, size: 38 },
            { x: -160, y: 90, rotation: -15, size: 36 },
            { x: 160, y: 85, rotation: 18, size: 40 },
        ]
        return symbols.slice(0, positions.length).map((symbol, i) => ({
            id: i,
            symbol,
            ...positions[i],
            delay: delay + i * 0.06,
        }))
    }, [symbols, delay])

    return (
        <div className="absolute inset-0 pointer-events-none overflow-visible">
            {items.map((s) => (
                <motion.div
                    key={s.id}
                    className="absolute select-none font-black"
                    style={{
                        left: `calc(50% + ${s.x}px)`,
                        top: `calc(50% + ${s.y}px)`,
                        fontSize: s.size,
                        color: color,
                        WebkitTextStroke: `3px ${strokeColor}`,
                        textShadow: `3px 3px 0 ${strokeColor}`,
                        fontFamily: '"Comic Sans MS", "Chalkboard SE", cursive',
                        transform: 'translate(-50%, -50%)',
                    }}
                    initial={{
                        scale: 0,
                        opacity: 0,
                        rotate: s.rotation - 30,
                    }}
                    animate={{
                        scale: [0, 1.5, 0.85, 1.1, 1],
                        opacity: [0, 1, 1, 1, 1],
                        rotate: [s.rotation - 30, s.rotation + 20, s.rotation - 8, s.rotation],
                    }}
                    transition={{
                        duration: 0.5,
                        delay: s.delay,
                        times: [0, 0.3, 0.5, 0.75, 1],
                        ease: [0.34, 1.56, 0.64, 1],
                    }}
                >
                    {s.symbol}
                </motion.div>
            ))}
        </div>
    )
}

// ============================================
// Text Layer 组件
// ============================================

/**
 * 综艺软糖风格文字 (多层描边 + 渐变)
 */
export function CandyText({
    text,
    fontSize = 80,
    gradient = COMEDY_COLORS.gradients.sunrise,
    innerStrokeColor = COMEDY_COLORS.white,
    outerStrokeColor = COMEDY_COLORS.darkOutline,
    innerStrokeWidth = 6,
    outerStrokeWidth = 12,
    animate = true,
    delay = 0.15,
    entranceType = 'bounce',
}: {
    text: string
    fontSize?: number
    gradient?: string
    innerStrokeColor?: string
    outerStrokeColor?: string
    innerStrokeWidth?: number
    outerStrokeWidth?: number
    animate?: boolean
    delay?: number
    entranceType?: 'bounce' | 'pop' | 'slide' | 'rotate'
}) {
    const fontFamily = '"Zcool KuaiLe", "Zcool QingKe HuangYou", "PingFang SC", "Microsoft YaHei", sans-serif'

    const getEntranceAnimation = () => {
        switch (entranceType) {
            case 'pop':
                return {
                    initial: { scale: 0, opacity: 0 },
                    animate: {
                        scale: [0, 1.35, 0.85, 1.1, 1],
                        opacity: [0, 1, 1, 1, 1]
                    },
                    transition: {
                        duration: 0.6,
                        delay,
                        times: [0, 0.3, 0.5, 0.75, 1],
                        ease: [0.34, 1.56, 0.64, 1]
                    }
                }
            case 'slide':
                return {
                    initial: { x: -100, opacity: 0, scaleX: 0.8 },
                    animate: {
                        x: ['-100px', '20px', '-5px', '0px'],
                        opacity: [0, 1, 1, 1],
                        scaleX: [0.8, 1.1, 0.95, 1]
                    },
                    transition: {
                        duration: 0.5,
                        delay,
                        ease: [0.34, 1.56, 0.64, 1]
                    }
                }
            case 'rotate':
                return {
                    initial: { scale: 0.3, opacity: 0, rotate: -25 },
                    animate: {
                        scale: [0.3, 1.2, 0.9, 1],
                        opacity: [0, 1, 1, 1],
                        rotate: [-25, 10, -3, 0]
                    },
                    transition: {
                        duration: 0.55,
                        delay,
                        ease: [0.34, 1.56, 0.64, 1]
                    }
                }
            default: // bounce
                return {
                    initial: { y: 60, scale: 0.5, opacity: 0 },
                    animate: {
                        y: [60, -20, 8, -3, 0],
                        scale: [0.5, 1.15, 0.92, 1.05, 1],
                        opacity: [0, 1, 1, 1, 1]
                    },
                    transition: {
                        duration: 0.65,
                        delay,
                        times: [0, 0.35, 0.55, 0.75, 1],
                        ease: [0.34, 1.56, 0.64, 1]
                    }
                }
        }
    }

    const baseStyle: React.CSSProperties = {
        fontSize,
        fontWeight: 900,
        fontFamily,
        letterSpacing: '0.05em',
        whiteSpace: 'nowrap',
    }

    const textLayers = (
        <>
            {/* Layer 1: 外层深色描边 (最底) */}
            <span
                style={{
                    ...baseStyle,
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    color: 'transparent',
                    WebkitTextStroke: `${outerStrokeWidth}px ${outerStrokeColor}`,
                    zIndex: 1,
                }}
            >
                {text}
            </span>

            {/* Layer 2: 内层白色描边 */}
            <span
                style={{
                    ...baseStyle,
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    color: 'transparent',
                    WebkitTextStroke: `${innerStrokeWidth}px ${innerStrokeColor}`,
                    zIndex: 2,
                }}
            >
                {text}
            </span>

            {/* Layer 3: 渐变填充文字 (最顶) */}
            <span
                style={{
                    ...baseStyle,
                    position: 'relative',
                    background: gradient,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    zIndex: 3,
                    filter: `drop-shadow(3px 3px 0 ${outerStrokeColor})`,
                }}
            >
                {text}
            </span>
        </>
    )

    if (!animate) {
        return (
            <div className="relative z-10">
                {textLayers}
            </div>
        )
    }

    const entranceAnim = getEntranceAnimation()

    return (
        <motion.div
            className="relative z-10"
            initial={entranceAnim.initial}
            animate={entranceAnim.animate}
            transition={entranceAnim.transition}
        >
            {textLayers}
        </motion.div>
    )
}

/**
 * 逐字弹入动画文字
 */
export function PerCharacterText({
    text,
    fontSize = 80,
    gradient = COMEDY_COLORS.gradients.sunrise,
    innerStrokeColor = COMEDY_COLORS.white,
    outerStrokeColor = COMEDY_COLORS.darkOutline,
    staggerDelay = 0.06,
    baseDelay = 0.2,
}: {
    text: string
    fontSize?: number
    gradient?: string
    innerStrokeColor?: string
    outerStrokeColor?: string
    staggerDelay?: number
    baseDelay?: number
}) {
    const fontFamily = '"Zcool KuaiLe", "Zcool QingKe HuangYou", "PingFang SC", "Microsoft YaHei", sans-serif'

    const characters = text.split('')

    const charVariants: Variants = {
        hidden: {
            y: 50,
            scale: 0,
            opacity: 0,
            rotate: -15,
        },
        visible: (i: number) => ({
            y: 0,
            scale: 1,
            opacity: 1,
            rotate: 0,
            transition: {
                delay: baseDelay + i * staggerDelay,
                duration: 0.45,
                ease: [0.34, 1.56, 0.64, 1],
            },
        }),
    }

    const baseStyle: React.CSSProperties = {
        fontSize,
        fontWeight: 900,
        fontFamily,
        letterSpacing: '0.02em',
        display: 'inline-block',
    }

    return (
        <div className="relative z-10 flex">
            {characters.map((char, i) => (
                <motion.span
                    key={i}
                    custom={i}
                    variants={charVariants}
                    initial="hidden"
                    animate="visible"
                    style={{ display: 'inline-block', position: 'relative' }}
                >
                    {/* 外描边 */}
                    <span
                        style={{
                            ...baseStyle,
                            position: 'absolute',
                            left: 0,
                            top: 0,
                            color: 'transparent',
                            WebkitTextStroke: `10px ${outerStrokeColor}`,
                        }}
                    >
                        {char === ' ' ? '\u00A0' : char}
                    </span>
                    {/* 内描边 */}
                    <span
                        style={{
                            ...baseStyle,
                            position: 'absolute',
                            left: 0,
                            top: 0,
                            color: 'transparent',
                            WebkitTextStroke: `5px ${innerStrokeColor}`,
                        }}
                    >
                        {char === ' ' ? '\u00A0' : char}
                    </span>
                    {/* 填充 */}
                    <span
                        style={{
                            ...baseStyle,
                            background: gradient,
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                            filter: `drop-shadow(2px 2px 0 ${outerStrokeColor})`,
                        }}
                    >
                        {char === ' ' ? '\u00A0' : char}
                    </span>
                </motion.span>
            ))}
        </div>
    )
}

// ============================================
// Loop 动画效果
// ============================================

/**
 * 呼吸/脉冲循环动画包装器
 */
export function PulseLoop({
    children,
    intensity = 0.05,
    duration = 1.2,
}: {
    children: React.ReactNode
    intensity?: number
    duration?: number
}) {
    return (
        <motion.div
            animate={{
                scale: [1, 1 + intensity, 1],
            }}
            transition={{
                duration,
                repeat: Infinity,
                repeatType: 'reverse',
                ease: 'easeInOut',
            }}
        >
            {children}
        </motion.div>
    )
}

/**
 * 轻微摇晃循环动画
 */
export function WobbleLoop({
    children,
    angle = 2,
    duration = 0.8,
}: {
    children: React.ReactNode
    angle?: number
    duration?: number
}) {
    return (
        <motion.div
            animate={{
                rotate: [-angle, angle, -angle],
            }}
            transition={{
                duration,
                repeat: Infinity,
                ease: 'easeInOut',
            }}
        >
            {children}
        </motion.div>
    )
}

export default {
    COMEDY_COLORS,
    ComicBurstPlate,
    RoundedRectPlate,
    SpeedLines,
    ColorfulParticles,
    FlashBurst,
    ComicEmojis,
    ComicSymbols,
    CandyText,
    PerCharacterText,
    PulseLoop,
    WobbleLoop,
}

