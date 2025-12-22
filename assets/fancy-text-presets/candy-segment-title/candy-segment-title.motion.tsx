'use client'

/**
 * 软糖分段标题特效 - Candy Segment Title
 * 
 * 《一见你就笑》综艺分段标题效果:
 * - 适用于【本期主题】【游戏环节名称】等
 * - 斜切平行四边形底板设计
 * - 软糖质感渐变文字 + 多层描边
 * - 从侧边滑入 + 弹跳定位
 * - 底板动态闪光装饰
 * - 时长 1.8 秒
 */

import React, { useEffect, useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// ============================================
// 类型定义
// ============================================

export interface CandySegmentTitleProps {
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
    /** 底板颜色 */
    bannerColor?: string
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
// 斜切底板 SVG
// ============================================

function SkewedBanner({
    width,
    height,
    color = '#7C4DFF',
    animate = true,
}: {
    width: number
    height: number
    color?: string
    animate?: boolean
}) {
    const skewAmount = height * 0.35
    const gradientId = `segmentBannerGrad-${width}`
    const glowId = `segmentBannerGlow-${width}`

    // 平行四边形路径
    const path = `
        M ${skewAmount},0
        L ${width},0
        L ${width - skewAmount},${height}
        L 0,${height}
        Z
    `

    if (!animate) {
        return (
            <svg
                width={width}
                height={height}
                viewBox={`0 0 ${width} ${height}`}
                className="absolute"
                style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}
            >
                <defs>
                    <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#FFFFFF" stopOpacity={0.3} />
                        <stop offset="50%" stopColor={color} />
                        <stop offset="100%" stopColor={color} />
                    </linearGradient>
                    <filter id={glowId} x="-20%" y="-30%" width="140%" height="160%">
                        <feGaussianBlur stdDeviation="5" result="blur" />
                        <feMerge>
                            <feMergeNode in="blur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>
                <path
                    d={path}
                    fill={`url(#${gradientId})`}
                    stroke="#FFFFFF"
                    strokeWidth={4}
                    strokeLinejoin="round"
                    filter={`url(#${glowId})`}
                />
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
                duration: 0.4,
                times: [0, 0.5, 0.75, 1],
                ease: [0.34, 1.56, 0.64, 1]
            }}
        >
            <defs>
                <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FFFFFF" stopOpacity={0.3} />
                    <stop offset="50%" stopColor={color} />
                    <stop offset="100%" stopColor={color} />
                </linearGradient>
                <filter id={glowId} x="-20%" y="-30%" width="140%" height="160%">
                    <feGaussianBlur stdDeviation="5" result="blur" />
                    <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
            </defs>
            <path
                d={path}
                fill={`url(#${gradientId})`}
                stroke="#FFFFFF"
                strokeWidth={4}
                strokeLinejoin="round"
                filter={`url(#${glowId})`}
            />
        </motion.svg>
    )
}

// ============================================
// 闪光扫过效果
// ============================================

function ShineEffect({
    width,
    height,
    delay = 0.3
}: {
    width: number
    height: number
    delay?: number
}) {
    return (
        <motion.div
            className="absolute overflow-hidden"
            style={{
                left: '50%',
                top: '50%',
                width: width,
                height: height,
                transform: 'translate(-50%, -50%) skewX(-15deg)',
            }}
        >
            <motion.div
                className="absolute"
                style={{
                    width: 60,
                    height: height * 1.5,
                    background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.6) 50%, transparent 100%)',
                    top: '-25%',
                }}
                initial={{ left: '-80px' }}
                animate={{ left: `${width + 80}px` }}
                transition={{
                    duration: 0.6,
                    delay: delay,
                    ease: 'easeInOut',
                }}
            />
        </motion.div>
    )
}

// ============================================
// 角落装饰星星
// ============================================

function CornerStars({
    color = '#FFD600',
    delay = 0.2
}: {
    color?: string
    delay?: number
}) {
    const stars = useMemo(() => [
        { id: 0, x: -200, y: -25, size: 24, delay: delay + 0.1 },
        { id: 1, x: 200, y: -25, size: 26, delay: delay + 0.15 },
        { id: 2, x: -220, y: 25, size: 20, delay: delay + 0.2 },
        { id: 3, x: 220, y: 25, size: 22, delay: delay + 0.25 },
    ], [delay])

    return (
        <div className="absolute inset-0 pointer-events-none overflow-visible">
            {stars.map((s) => (
                <motion.div
                    key={s.id}
                    className="absolute"
                    style={{
                        left: `calc(50% + ${s.x}px)`,
                        top: `calc(50% + ${s.y}px)`,
                        fontSize: s.size,
                        color: color,
                        filter: `drop-shadow(0 0 8px ${color})`,
                    }}
                    initial={{ scale: 0, opacity: 0, rotate: 0 }}
                    animate={{
                        scale: [0, 1.3, 1],
                        opacity: [0, 1, 1],
                        rotate: [0, 180, 360]
                    }}
                    transition={{
                        duration: 0.5,
                        delay: s.delay,
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
// 速度线（水平方向）
// ============================================

function HorizontalSpeedLines({
    count = 8,
    color = '#FFFFFF',
    delay = 0.05
}: {
    count?: number
    color?: string
    delay?: number
}) {
    const lines = useMemo(() => {
        return Array.from({ length: count }).map((_, i) => ({
            id: i,
            y: (i - count / 2) * 12 + (Math.random() - 0.5) * 8,
            length: 50 + Math.random() * 80,
            width: 2 + Math.random() * 3,
            delay: delay + Math.random() * 0.1,
            startX: -300 - Math.random() * 100,
        }))
    }, [count, delay])

    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {lines.map((line) => (
                <motion.div
                    key={line.id}
                    className="absolute"
                    style={{
                        left: '50%',
                        top: `calc(50% + ${line.y}px)`,
                        width: line.length,
                        height: line.width,
                        background: `linear-gradient(90deg, transparent 0%, ${color} 30%, ${color} 70%, transparent 100%)`,
                        borderRadius: line.width / 2,
                    }}
                    initial={{ x: line.startX, opacity: 0 }}
                    animate={{
                        x: [line.startX, 0, 50],
                        opacity: [0, 0.8, 0]
                    }}
                    transition={{
                        duration: 0.35,
                        delay: line.delay,
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

export function CandySegmentTitle({
    text,
    scale = 1,
    gradient = 'linear-gradient(180deg, #E6D5FF 0%, #B388FF 40%, #7C4DFF 70%, #651FFF 100%)',
    strokeColor = '#4A148C',
    outerStrokeColor = '#FFFFFF',
    bannerColor = '#7C4DFF',
    accentColor = '#FFD600',
    autoPlay = true,
    skipToEnd = false,
    onComplete,
    className = '',
}: CandySegmentTitleProps) {
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
    const fontSize = 64 * scale
    const bannerWidth = text.length * fontSize * 0.9 + 120
    const bannerHeight = fontSize * 1.6

    // 静态模式
    if (skipToEnd) {
        return (
            <div
                className={`relative inline-flex items-center justify-center ${className}`}
                style={{
                    minWidth: bannerWidth + 100,
                    minHeight: bannerHeight + 60,
                }}
            >
                <SkewedBanner
                    width={bannerWidth}
                    height={bannerHeight}
                    color={bannerColor}
                    animate={false}
                />

                <div className="relative z-10">
                    <span
                        style={{
                            position: 'absolute',
                            left: 0,
                            top: 0,
                            fontSize,
                            fontWeight: 900,
                            fontFamily: '"Zcool KuaiLe", "Zcool QingKe HuangYou", "PingFang SC", sans-serif',
                            color: 'transparent',
                            WebkitTextStroke: `10px ${outerStrokeColor}`,
                            letterSpacing: '0.08em',
                            whiteSpace: 'nowrap',
                            zIndex: 1,
                        }}
                    >
                        {text}
                    </span>

                    <span
                        style={{
                            position: 'absolute',
                            left: 0,
                            top: 0,
                            fontSize,
                            fontWeight: 900,
                            fontFamily: '"Zcool KuaiLe", "Zcool QingKe HuangYou", "PingFang SC", sans-serif',
                            color: 'transparent',
                            WebkitTextStroke: `5px ${strokeColor}`,
                            letterSpacing: '0.08em',
                            whiteSpace: 'nowrap',
                            zIndex: 2,
                        }}
                    >
                        {text}
                    </span>

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
                            letterSpacing: '0.08em',
                            whiteSpace: 'nowrap',
                            zIndex: 3,
                            filter: `drop-shadow(0 4px 0 rgba(0,0,0,0.25))`,
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
                minWidth: bannerWidth + 100,
                minHeight: bannerHeight + 60,
            }}
        >
            <AnimatePresence>
                {isVisible && (
                    <>
                        {/* 速度线 */}
                        <HorizontalSpeedLines count={10} color={bannerColor} delay={0} />

                        {/* 斜切底板 */}
                        <SkewedBanner
                            width={bannerWidth}
                            height={bannerHeight}
                            color={bannerColor}
                        />

                        {/* 闪光扫过 */}
                        <ShineEffect width={bannerWidth} height={bannerHeight} delay={0.5} />

                        {/* 角落星星 */}
                        <CornerStars color={accentColor} delay={0.25} />

                        {/* 主文字 */}
                        <motion.div
                            className="relative z-10"
                            initial={{
                                opacity: 0,
                                x: -120,
                                scale: 0.8,
                            }}
                            animate={{
                                opacity: [0, 1, 1],
                                x: [-120, 15, -5, 0],
                                scale: [0.8, 1.08, 0.96, 1],
                            }}
                            transition={{
                                duration: 0.5,
                                times: [0, 0.5, 0.75, 1],
                                ease: [0.25, 1.2, 0.5, 1],
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
                                    WebkitTextStroke: `10px ${outerStrokeColor}`,
                                    letterSpacing: '0.08em',
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
                                    WebkitTextStroke: `5px ${strokeColor}`,
                                    letterSpacing: '0.08em',
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
                                    letterSpacing: '0.08em',
                                    whiteSpace: 'nowrap',
                                    zIndex: 3,
                                    filter: `drop-shadow(0 4px 0 rgba(0,0,0,0.25))`,
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

export default CandySegmentTitle

