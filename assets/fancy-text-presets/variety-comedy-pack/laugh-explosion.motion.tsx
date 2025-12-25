'use client'

/**
 * 爆笑大字花字 - Laugh Explosion
 * 
 * 《一见你就笑》风格爆笑反应大字特效
 * 
 * 统一舞台模型:
 * 舞台中心 (0,0)
 * ├── Plate Layer      - 漫画爆炸云底板
 * ├── Impact FX Layer  - 极速线 + 震动波 + 彩色碎片
 * ├── Text Layer       - 超强弹性 squash & stretch
 * └── Emoji Layer      - 大笑表情 + 眼泪特效
 * 
 * 动画时长: 1.5s
 * 适用场景: 【笑死我了】【绝了】【好会玩】【太离谱】等
 */

import React, { useEffect, useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    COMEDY_COLORS,
    SpeedLines,
    ColorfulParticles,
    FlashBurst,
    CandyText,
    WobbleLoop,
} from './shared-fx-components'

// ============================================
// 类型定义
// ============================================

export interface LaughExplosionProps {
    /** 显示的文字内容 */
    text: string
    /** 缩放比例 (默认: 1) */
    scale?: number
    /** 主色调渐变 */
    gradient?: string
    /** 内描边颜色 */
    innerStrokeColor?: string
    /** 外描边颜色 */
    outerStrokeColor?: string
    /** 底板颜色 */
    plateColor?: string
    /** 底板边框颜色 */
    plateBorderColor?: string
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
// 漫画爆炸云底板
// ============================================

function ExplosionCloud({
    width = 400,
    height = 200,
    color = COMEDY_COLORS.sunYellow,
    borderColor = COMEDY_COLORS.white,
    animate = true,
    delay = 0,
}: {
    width?: number
    height?: number
    color?: string
    borderColor?: string
    animate?: boolean
    delay?: number
}) {
    // 生成爆炸云形状的 SVG 路径
    const cloudPath = useMemo(() => {
        const cx = width / 2
        const cy = height / 2
        const spikes = 14
        const outerRadius = Math.min(width, height) * 0.48
        const innerRadius = outerRadius * 0.7

        let d = ''
        for (let i = 0; i < spikes * 2; i++) {
            const angle = (i / (spikes * 2)) * Math.PI * 2 - Math.PI / 2
            const isOuter = i % 2 === 0
            const radius = isOuter ? outerRadius : innerRadius
            // 添加一些随机性让它看起来更手绘
            const jitter = isOuter ? (Math.random() - 0.5) * 15 : (Math.random() - 0.5) * 10
            const x = cx + Math.cos(angle) * (radius + jitter) * (width / height)
            const y = cy + Math.sin(angle) * (radius + jitter)
            d += i === 0 ? `M${x},${y}` : ` Q${cx + Math.cos(angle - 0.1) * (radius * 0.85) * (width / height)},${cy + Math.sin(angle - 0.1) * (radius * 0.85)} ${x},${y}`
        }
        d += ' Z'
        return d
    }, [width, height])

    const content = (
        <svg
            width={width}
            height={height}
            viewBox={`0 0 ${width} ${height}`}
            className="absolute"
            style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}
        >
            <defs>
                <filter id="cloudShadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="6" stdDeviation="8" floodColor="#000" floodOpacity="0.3" />
                </filter>
            </defs>
            <path
                d={cloudPath}
                fill={color}
                stroke={borderColor}
                strokeWidth={5}
                filter="url(#cloudShadow)"
            />
        </svg>
    )

    if (!animate) return content

    return (
        <motion.div
            initial={{ scale: 0, rotate: -15, opacity: 0 }}
            animate={{
                scale: [0, 1.4, 0.85, 1.15, 1],
                rotate: [-15, 8, -4, 2, 0],
                opacity: [0, 1, 1, 1, 1]
            }}
            transition={{
                duration: 0.6,
                delay,
                times: [0, 0.3, 0.5, 0.75, 1],
                ease: [0.34, 1.56, 0.64, 1]
            }}
        >
            {content}
        </motion.div>
    )
}

// ============================================
// 震动波效果
// ============================================

function ShockWaves({
    count = 3,
    color = COMEDY_COLORS.sunYellow,
    delay = 0.2,
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
                        border: `4px solid ${color}`,
                        transform: 'translate(-50%, -50%)',
                        boxShadow: `0 0 15px ${color}60`,
                    }}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{
                        scale: [0.5, 2 + i * 0.6, 3 + i * 0.8],
                        opacity: [0, 0.7, 0]
                    }}
                    transition={{
                        duration: 0.7,
                        delay: delay + i * 0.1,
                        ease: 'easeOut',
                    }}
                />
            ))}
        </div>
    )
}

// ============================================
// 笑哭表情特效
// ============================================

function LaughingEmojis({
    delay = 0.4,
    scale = 1,
}: {
    delay?: number
    scale?: number
}) {
    const emojis = useMemo(() => [
        { id: 0, emoji: '🤣', x: -200, y: -60, size: 60, rotation: -20, delay: delay },
        { id: 1, emoji: '😂', x: 200, y: -50, size: 65, rotation: 25, delay: delay + 0.08 },
        { id: 2, emoji: '😹', x: -180, y: 70, size: 50, rotation: -15, delay: delay + 0.12 },
        { id: 3, emoji: '💀', x: 180, y: 60, size: 52, rotation: 18, delay: delay + 0.16 },
        { id: 4, emoji: '😭', x: 0, y: -100, size: 48, rotation: 0, delay: delay + 0.1 },
    ].map(e => ({ ...e, size: e.size * scale, x: e.x * scale, y: e.y * scale })), [delay, scale])

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
                        transform: 'translate(-50%, -50%)',
                        filter: 'drop-shadow(3px 3px 6px rgba(0,0,0,0.3))',
                    }}
                    initial={{
                        scale: 0,
                        opacity: 0,
                        rotate: e.rotation - 60,
                        y: 40
                    }}
                    animate={{
                        scale: [0, 1.6, 0.8, 1.2, 1],
                        opacity: [0, 1, 1, 1, 1],
                        rotate: [e.rotation - 60, e.rotation + 25, e.rotation - 10, e.rotation],
                        y: [40, -15, 8, 0]
                    }}
                    transition={{
                        duration: 0.6,
                        delay: e.delay,
                        times: [0, 0.35, 0.55, 0.75, 1],
                        ease: [0.34, 1.56, 0.64, 1],
                    }}
                >
                    {e.emoji}
                </motion.div>
            ))}
        </div>
    )
}

// ============================================
// 眼泪粒子特效
// ============================================

function TearDrops({
    count = 12,
    delay = 0.5,
}: {
    count?: number
    delay?: number
}) {
    const tears = useMemo(() => {
        return Array.from({ length: count }).map((_, i) => {
            const angle = Math.random() * Math.PI - Math.PI / 2 // 主要向上
            const distance = 100 + Math.random() * 120
            return {
                id: i,
                startX: (Math.random() - 0.5) * 100,
                startY: (Math.random() - 0.5) * 60,
                endX: Math.cos(angle) * distance + (Math.random() - 0.5) * 50,
                endY: Math.sin(angle) * distance - 50,
                size: 12 + Math.random() * 10,
                delay: delay + Math.random() * 0.2,
            }
        })
    }, [count, delay])

    return (
        <div className="absolute inset-0 pointer-events-none overflow-visible">
            {tears.map((t) => (
                <motion.div
                    key={t.id}
                    className="absolute"
                    style={{
                        left: '50%',
                        top: '50%',
                        fontSize: t.size,
                    }}
                    initial={{
                        x: t.startX,
                        y: t.startY,
                        scale: 0,
                        opacity: 0,
                    }}
                    animate={{
                        x: t.endX,
                        y: t.endY,
                        scale: [0, 1, 0.8, 0],
                        opacity: [0, 1, 0.8, 0],
                    }}
                    transition={{
                        duration: 0.8,
                        delay: t.delay,
                        ease: 'easeOut',
                    }}
                >
                    💧
                </motion.div>
            ))}
        </div>
    )
}

// ============================================
// 漫画动作线
// ============================================

function ActionLines({
    color = '#FFFFFF',
    delay = 0.1,
}: {
    color?: string
    delay?: number
}) {
    const lines = useMemo(() => {
        return Array.from({ length: 16 }).map((_, i) => {
            const angle = (i / 16) * Math.PI * 2
            return {
                id: i,
                angle,
                length: 80 + Math.random() * 50,
                offset: 80 + Math.random() * 30,
                width: 3 + Math.random() * 4,
                delay: delay + Math.random() * 0.1,
            }
        })
    }, [delay])

    return (
        <div className="absolute inset-0 pointer-events-none overflow-visible">
            {lines.map((l) => (
                <motion.div
                    key={l.id}
                    className="absolute"
                    style={{
                        left: '50%',
                        top: '50%',
                        width: l.length,
                        height: l.width,
                        backgroundColor: color,
                        borderRadius: l.width / 2,
                        transformOrigin: 'left center',
                        transform: `rotate(${l.angle * 180 / Math.PI}deg) translateX(${l.offset}px)`,
                        boxShadow: `0 0 8px ${color}`,
                    }}
                    initial={{ scaleX: 0, opacity: 0 }}
                    animate={{
                        scaleX: [0, 1.2, 0],
                        opacity: [0, 1, 0],
                    }}
                    transition={{
                        duration: 0.4,
                        delay: l.delay,
                        ease: 'easeOut',
                    }}
                />
            ))}
        </div>
    )
}

// ============================================
// 主组件
// ============================================

export function LaughExplosion({
    text,
    scale = 1,
    gradient = COMEDY_COLORS.gradients.sunrise,
    innerStrokeColor = COMEDY_COLORS.white,
    outerStrokeColor = COMEDY_COLORS.darkOutline,
    plateColor = COMEDY_COLORS.sunYellow,
    plateBorderColor = COMEDY_COLORS.white,
    autoPlay = true,
    skipToEnd = false,
    onComplete,
    className = '',
}: LaughExplosionProps) {
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        if (autoPlay || skipToEnd) {
            setIsVisible(true)
        }
    }, [autoPlay, skipToEnd])

    const handleAnimationComplete = useCallback(() => {
        setTimeout(() => {
            onComplete?.()
        }, 1500)
    }, [onComplete])

    // 计算尺寸
    const fontSize = 100 * scale
    const cloudWidth = Math.max(text.length * fontSize * 0.75 + 100, 400)
    const cloudHeight = fontSize * 2

    // 静态模式
    if (skipToEnd) {
        return (
            <div
                className={`relative inline-flex items-center justify-center ${className}`}
                style={{
                    minWidth: cloudWidth + 200,
                    minHeight: cloudHeight + 150,
                }}
            >
                {/* Static Cloud */}
                <ExplosionCloud
                    width={cloudWidth}
                    height={cloudHeight}
                    color={plateColor}
                    borderColor={plateBorderColor}
                    animate={false}
                />

                {/* Static Text */}
                <CandyText
                    text={text}
                    fontSize={fontSize}
                    gradient={gradient}
                    innerStrokeColor={innerStrokeColor}
                    outerStrokeColor={outerStrokeColor}
                    innerStrokeWidth={8}
                    outerStrokeWidth={14}
                    animate={false}
                />

                {/* Static Emojis */}
                <div className="absolute inset-0 pointer-events-none overflow-visible">
                    {[
                        { emoji: '🤣', x: -180, y: -50, rotation: -15, size: 55 },
                        { emoji: '😂', x: 180, y: -40, rotation: 20, size: 58 },
                    ].map((e, i) => (
                        <div
                            key={i}
                            className="absolute select-none"
                            style={{
                                left: `calc(50% + ${e.x * scale}px)`,
                                top: `calc(50% + ${e.y * scale}px)`,
                                fontSize: e.size * scale,
                                transform: `translate(-50%, -50%) rotate(${e.rotation}deg)`,
                                filter: 'drop-shadow(3px 3px 6px rgba(0,0,0,0.3))',
                            }}
                        >
                            {e.emoji}
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div
            className={`relative inline-flex items-center justify-center ${className}`}
            style={{
                minWidth: cloudWidth + 200,
                minHeight: cloudHeight + 150,
            }}
        >
            <AnimatePresence>
                {isVisible && (
                    <>
                        {/* === Impact FX Layer (底层) === */}
                        {/* 闪光爆发 */}
                        <FlashBurst
                            color={COMEDY_COLORS.white}
                            delay={0}
                            size={cloudWidth * 1.8}
                        />

                        {/* 震动波 */}
                        <ShockWaves
                            count={4}
                            color={COMEDY_COLORS.sunYellow}
                            delay={0.1}
                        />

                        {/* 动作线 */}
                        <ActionLines
                            color={COMEDY_COLORS.white}
                            delay={0.08}
                        />

                        {/* 速度线 */}
                        <SpeedLines
                            count={28}
                            color={COMEDY_COLORS.white}
                            length={200}
                            delay={0.12}
                        />

                        {/* 彩色碎片 */}
                        <ColorfulParticles
                            count={40}
                            colors={[COMEDY_COLORS.sunYellow, COMEDY_COLORS.hotPink, COMEDY_COLORS.electricBlue, COMEDY_COLORS.limeGreen]}
                            delay={0.15}
                            spread={250}
                        />

                        {/* === Plate Layer === */}
                        <ExplosionCloud
                            width={cloudWidth}
                            height={cloudHeight}
                            color={plateColor}
                            borderColor={plateBorderColor}
                            delay={0.05}
                        />

                        {/* === Emoji Layer === */}
                        <LaughingEmojis delay={0.35} scale={scale} />

                        {/* 眼泪粒子 */}
                        <TearDrops count={15} delay={0.5} />

                        {/* === Text Layer === */}
                        {/* 超强弹性文字动画 */}
                        <motion.div
                            className="relative z-20"
                            initial={{
                                scale: 0,
                                rotate: -20,
                                opacity: 0,
                            }}
                            animate={{
                                scale: [0, 1.6, 0.7, 1.25, 0.9, 1.05, 1],
                                rotate: [-20, 15, -8, 5, -2, 0],
                                opacity: [0, 1, 1, 1, 1, 1, 1],
                            }}
                            transition={{
                                duration: 0.75,
                                delay: 0.15,
                                times: [0, 0.25, 0.4, 0.55, 0.7, 0.85, 1],
                                ease: [0.34, 1.56, 0.64, 1],
                            }}
                            onAnimationComplete={handleAnimationComplete}
                        >
                            <WobbleLoop angle={2.5} duration={0.6}>
                                <CandyText
                                    text={text}
                                    fontSize={fontSize}
                                    gradient={gradient}
                                    innerStrokeColor={innerStrokeColor}
                                    outerStrokeColor={outerStrokeColor}
                                    innerStrokeWidth={8}
                                    outerStrokeWidth={14}
                                    animate={false}
                                />
                            </WobbleLoop>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    )
}

export default LaughExplosion










