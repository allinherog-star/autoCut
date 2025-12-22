'use client'

/**
 * 软糖嘉宾姓名条特效 - Candy Guest Name Tag
 * 
 * 《一见你就笑》综艺嘉宾姓名条效果:
 * - 适用于【姓名 + 身份介绍】格式
 * - 圆角胶囊形底板 + 分区设计
 * - 软糖质感渐变文字 + 多层描边
 * - 从左侧滑入 + 弹跳定位
 * - 可爱表情装饰（笑脸/星星）
 * - 时长 1.5 秒
 */

import React, { useEffect, useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// ============================================
// 类型定义
// ============================================

export interface CandyGuestNameProps {
    /** 显示的文字内容，支持用 丨 或 | 分隔姓名和身份 */
    text: string
    /** 缩放比例 (默认: 1) */
    scale?: number
    /** 渐变填充 */
    gradient?: string
    /** 内描边颜色 */
    strokeColor?: string
    /** 外描边颜色 */
    outerStrokeColor?: string
    /** 主背景色 */
    primaryBg?: string
    /** 次背景色 */
    secondaryBg?: string
    /** 装饰强调色 */
    accentColor?: string
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
// 解析文字内容
// ============================================

function parseNameAndTitle(text: string): { name: string; title: string } {
    // 支持多种分隔符
    const separators = ['丨', '|', '｜', '-', '—', '·']
    for (const sep of separators) {
        if (text.includes(sep)) {
            const parts = text.split(sep)
            return {
                name: parts[0].trim(),
                title: parts.slice(1).join(sep).trim()
            }
        }
    }
    // 没有分隔符，整个作为姓名
    return { name: text, title: '' }
}

// ============================================
// 圆角胶囊底板
// ============================================

function CapsuleBanner({
    width,
    height,
    primaryColor = '#FF69B4',
    secondaryColor = '#FFB6C1',
    nameWidth,
    animate = true,
}: {
    width: number
    height: number
    primaryColor?: string
    secondaryColor?: string
    nameWidth: number
    animate?: boolean
}) {
    const radius = height / 2
    const gradientId = `guestNameGrad-${width}`
    const glowId = `guestNameGlow-${width}`

    const content = (
        <>
            <defs>
                <linearGradient id={`${gradientId}-primary`} x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#FFFFFF" stopOpacity={0.4} />
                    <stop offset="50%" stopColor={primaryColor} />
                    <stop offset="100%" stopColor={primaryColor} />
                </linearGradient>
                <linearGradient id={`${gradientId}-secondary`} x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#FFFFFF" stopOpacity={0.3} />
                    <stop offset="50%" stopColor={secondaryColor} />
                    <stop offset="100%" stopColor={secondaryColor} />
                </linearGradient>
                <filter id={glowId} x="-20%" y="-40%" width="140%" height="180%">
                    <feGaussianBlur stdDeviation="4" result="blur" />
                    <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
            </defs>
            
            {/* 整体外框 - 圆角矩形 */}
            <rect
                x={2}
                y={2}
                width={width - 4}
                height={height - 4}
                rx={radius - 2}
                ry={radius - 2}
                fill={`url(#${gradientId}-secondary)`}
                stroke="#FFFFFF"
                strokeWidth={3}
                filter={`url(#${glowId})`}
            />
            
            {/* 姓名区域 - 左侧圆角矩形 */}
            <rect
                x={4}
                y={4}
                width={nameWidth}
                height={height - 8}
                rx={radius - 4}
                ry={radius - 4}
                fill={`url(#${gradientId}-primary)`}
            />
        </>
    )

    if (!animate) {
        return (
            <svg
                width={width}
                height={height}
                viewBox={`0 0 ${width} ${height}`}
                className="absolute"
                style={{ left: 0, top: '50%', transform: 'translateY(-50%)' }}
            >
                {content}
            </svg>
        )
    }

    return (
        <motion.svg
            width={width}
            height={height}
            viewBox={`0 0 ${width} ${height}`}
            className="absolute"
            style={{ left: 0, top: '50%', transform: 'translateY(-50%)' }}
            initial={{ scaleX: 0, opacity: 0, originX: 0 }}
            animate={{
                scaleX: [0, 1.08, 0.97, 1],
                opacity: [0, 1, 1, 1]
            }}
            transition={{
                duration: 0.4,
                times: [0, 0.55, 0.8, 1],
                ease: [0.34, 1.56, 0.64, 1]
            }}
        >
            {content}
        </motion.svg>
    )
}

// ============================================
// 表情装饰
// ============================================

function EmojiDecorations({
    rightEdge,
    height,
    delay = 0.3
}: {
    rightEdge: number
    height: number
    delay?: number
}) {
    const decorations = useMemo(() => [
        { id: 0, emoji: '😆', x: rightEdge + 20, y: -5, size: 32, delay: delay + 0.1 },
        { id: 1, emoji: '✨', x: rightEdge + 55, y: 5, size: 24, delay: delay + 0.15 },
        { id: 2, emoji: '⭐', x: -35, y: -8, size: 26, delay: delay + 0.2 },
    ], [rightEdge, delay])

    return (
        <div className="absolute inset-0 pointer-events-none overflow-visible">
            {decorations.map((d) => (
                <motion.div
                    key={d.id}
                    className="absolute"
                    style={{
                        left: d.x,
                        top: `calc(50% + ${d.y}px)`,
                        fontSize: d.size,
                        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
                    }}
                    initial={{ scale: 0, opacity: 0, rotate: -20 }}
                    animate={{
                        scale: [0, 1.3, 1],
                        opacity: [0, 1, 1],
                        rotate: [-20, 10, 0]
                    }}
                    transition={{
                        duration: 0.4,
                        delay: d.delay,
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
// 闪光粒子
// ============================================

function SparkleParticles({
    count = 12,
    width,
    height,
    color = '#FFFF00',
    delay = 0.2
}: {
    count?: number
    width: number
    height: number
    color?: string
    delay?: number
}) {
    const particles = useMemo(() => {
        return Array.from({ length: count }).map((_, i) => ({
            id: i,
            x: Math.random() * width,
            y: height / 2 + (Math.random() - 0.5) * height * 1.5,
            size: 3 + Math.random() * 5,
            delay: delay + Math.random() * 0.3,
        }))
    }, [count, width, height, delay])

    return (
        <div className="absolute inset-0 pointer-events-none overflow-visible">
            {particles.map((p) => (
                <motion.div
                    key={p.id}
                    className="absolute rounded-full"
                    style={{
                        left: p.x,
                        top: p.y,
                        width: p.size,
                        height: p.size,
                        backgroundColor: color,
                        boxShadow: `0 0 ${p.size * 2}px ${color}`,
                    }}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{
                        scale: [0, 1.2, 0],
                        opacity: [0, 1, 0]
                    }}
                    transition={{
                        duration: 0.5,
                        delay: p.delay,
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

export function CandyGuestName({
    text,
    scale = 1,
    gradient = 'linear-gradient(180deg, #FFF0F5 0%, #FFB6C1 40%, #FF69B4 70%, #DB7093 100%)',
    strokeColor = '#C71585',
    outerStrokeColor = '#FFFFFF',
    primaryBg = '#FF69B4',
    secondaryBg = '#FFB6C1',
    accentColor = '#FFFF00',
    autoPlay = true,
    skipToEnd = false,
    onComplete,
    className = '',
}: CandyGuestNameProps) {
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        if (autoPlay || skipToEnd) {
            setIsVisible(true)
        }
    }, [autoPlay, skipToEnd])

    const handleAnimationComplete = useCallback(() => {
        onComplete?.()
    }, [onComplete])

    // 解析姓名和身份
    const { name, title } = parseNameAndTitle(text)

    // 计算尺寸
    const nameFontSize = 48 * scale
    const titleFontSize = 36 * scale
    const nameWidth = name.length * nameFontSize * 0.85 + 40
    const titleWidth = title ? title.length * titleFontSize * 0.7 + 30 : 0
    const totalWidth = nameWidth + titleWidth + 20
    const bannerHeight = nameFontSize * 1.5

    // 静态模式
    if (skipToEnd) {
        return (
            <div
                className={`relative inline-flex items-center ${className}`}
                style={{
                    minWidth: totalWidth + 80,
                    minHeight: bannerHeight + 30,
                }}
            >
                <CapsuleBanner
                    width={totalWidth}
                    height={bannerHeight}
                    primaryColor={primaryBg}
                    secondaryColor={secondaryBg}
                    nameWidth={nameWidth}
                    animate={false}
                />

                {/* 姓名文字 */}
                <div
                    className="relative z-10"
                    style={{
                        position: 'absolute',
                        left: nameWidth / 2,
                        top: '50%',
                        transform: 'translate(-50%, -50%)',
                    }}
                >
                    <span
                        style={{
                            position: 'absolute',
                            left: '50%',
                            top: '50%',
                            transform: 'translate(-50%, -50%)',
                            fontSize: nameFontSize,
                            fontWeight: 900,
                            fontFamily: '"Zcool KuaiLe", "PingFang SC", sans-serif',
                            color: 'transparent',
                            WebkitTextStroke: `8px ${outerStrokeColor}`,
                            whiteSpace: 'nowrap',
                            zIndex: 1,
                        }}
                    >
                        {name}
                    </span>
                    <span
                        style={{
                            position: 'absolute',
                            left: '50%',
                            top: '50%',
                            transform: 'translate(-50%, -50%)',
                            fontSize: nameFontSize,
                            fontWeight: 900,
                            fontFamily: '"Zcool KuaiLe", "PingFang SC", sans-serif',
                            color: 'transparent',
                            WebkitTextStroke: `4px ${strokeColor}`,
                            whiteSpace: 'nowrap',
                            zIndex: 2,
                        }}
                    >
                        {name}
                    </span>
                    <span
                        style={{
                            position: 'relative',
                            fontSize: nameFontSize,
                            fontWeight: 900,
                            fontFamily: '"Zcool KuaiLe", "PingFang SC", sans-serif',
                            background: gradient,
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                            whiteSpace: 'nowrap',
                            zIndex: 3,
                            filter: 'drop-shadow(0 2px 0 rgba(0,0,0,0.2))',
                        }}
                    >
                        {name}
                    </span>
                </div>

                {/* 身份文字 */}
                {title && (
                    <div
                        className="relative z-10"
                        style={{
                            position: 'absolute',
                            left: nameWidth + titleWidth / 2 + 10,
                            top: '50%',
                            transform: 'translate(-50%, -50%)',
                        }}
                    >
                        <span
                            style={{
                                fontSize: titleFontSize,
                                fontWeight: 700,
                                fontFamily: '"Zcool KuaiLe", "PingFang SC", sans-serif',
                                color: '#FFFFFF',
                                textShadow: `0 2px 4px rgba(0,0,0,0.3), 0 0 10px ${primaryBg}`,
                                whiteSpace: 'nowrap',
                            }}
                        >
                            {title}
                        </span>
                    </div>
                )}
            </div>
        )
    }

    return (
        <div
            className={`relative inline-flex items-center ${className}`}
            style={{
                minWidth: totalWidth + 80,
                minHeight: bannerHeight + 30,
            }}
        >
            <AnimatePresence>
                {isVisible && (
                    <>
                        {/* 闪光粒子 */}
                        <SparkleParticles
                            count={15}
                            width={totalWidth}
                            height={bannerHeight}
                            color={accentColor}
                            delay={0.15}
                        />

                        {/* 圆角底板 */}
                        <CapsuleBanner
                            width={totalWidth}
                            height={bannerHeight}
                            primaryColor={primaryBg}
                            secondaryColor={secondaryBg}
                            nameWidth={nameWidth}
                        />

                        {/* 表情装饰 */}
                        <EmojiDecorations
                            rightEdge={totalWidth}
                            height={bannerHeight}
                            delay={0.35}
                        />

                        {/* 姓名文字 */}
                        <motion.div
                            className="relative z-10"
                            style={{
                                position: 'absolute',
                                left: nameWidth / 2,
                                top: '50%',
                                transform: 'translate(-50%, -50%)',
                            }}
                            initial={{ opacity: 0, x: -50, scale: 0.7 }}
                            animate={{
                                opacity: [0, 1, 1],
                                x: [-50, 8, 0],
                                scale: [0.7, 1.1, 1],
                            }}
                            transition={{
                                duration: 0.45,
                                delay: 0.15,
                                times: [0, 0.6, 1],
                                ease: [0.25, 1.2, 0.5, 1],
                            }}
                        >
                            <span
                                style={{
                                    position: 'absolute',
                                    left: '50%',
                                    top: '50%',
                                    transform: 'translate(-50%, -50%)',
                                    fontSize: nameFontSize,
                                    fontWeight: 900,
                                    fontFamily: '"Zcool KuaiLe", "PingFang SC", sans-serif',
                                    color: 'transparent',
                                    WebkitTextStroke: `8px ${outerStrokeColor}`,
                                    whiteSpace: 'nowrap',
                                    zIndex: 1,
                                }}
                            >
                                {name}
                            </span>
                            <span
                                style={{
                                    position: 'absolute',
                                    left: '50%',
                                    top: '50%',
                                    transform: 'translate(-50%, -50%)',
                                    fontSize: nameFontSize,
                                    fontWeight: 900,
                                    fontFamily: '"Zcool KuaiLe", "PingFang SC", sans-serif',
                                    color: 'transparent',
                                    WebkitTextStroke: `4px ${strokeColor}`,
                                    whiteSpace: 'nowrap',
                                    zIndex: 2,
                                }}
                            >
                                {name}
                            </span>
                            <span
                                style={{
                                    position: 'relative',
                                    fontSize: nameFontSize,
                                    fontWeight: 900,
                                    fontFamily: '"Zcool KuaiLe", "PingFang SC", sans-serif',
                                    background: gradient,
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    backgroundClip: 'text',
                                    whiteSpace: 'nowrap',
                                    zIndex: 3,
                                    filter: 'drop-shadow(0 2px 0 rgba(0,0,0,0.2))',
                                }}
                            >
                                {name}
                            </span>
                        </motion.div>

                        {/* 身份文字 */}
                        {title && (
                            <motion.div
                                className="relative z-10"
                                style={{
                                    position: 'absolute',
                                    left: nameWidth + titleWidth / 2 + 10,
                                    top: '50%',
                                    transform: 'translate(-50%, -50%)',
                                }}
                                initial={{ opacity: 0, x: -30 }}
                                animate={{
                                    opacity: [0, 1],
                                    x: [-30, 0],
                                }}
                                transition={{
                                    duration: 0.35,
                                    delay: 0.35,
                                    ease: 'easeOut',
                                }}
                                onAnimationComplete={handleAnimationComplete}
                            >
                                <span
                                    style={{
                                        fontSize: titleFontSize,
                                        fontWeight: 700,
                                        fontFamily: '"Zcool KuaiLe", "PingFang SC", sans-serif',
                                        color: '#FFFFFF',
                                        textShadow: `0 2px 4px rgba(0,0,0,0.3), 0 0 10px ${primaryBg}`,
                                        whiteSpace: 'nowrap',
                                    }}
                                >
                                    {title}
                                </span>
                            </motion.div>
                        )}
                    </>
                )}
            </AnimatePresence>
        </div>
    )
}

export default CandyGuestName

