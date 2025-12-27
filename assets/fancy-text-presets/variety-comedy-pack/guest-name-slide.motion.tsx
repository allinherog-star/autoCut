'use client'

/**
 * 嘉宾姓名条花字 - Guest Name Slide
 * 
 * 《一见你就笑》风格嘉宾介绍条特效
 * 
 * 统一舞台模型:
 * 舞台中心 (0,0)
 * ├── Plate Layer      - 横向滑入圆角条
 * ├── Impact FX Layer  - 闪光条纹 + 小星星
 * ├── Text Layer       - 姓名 + 身份标签 (分层滑入)
 * └── Emoji Layer      - 头像占位 + 小表情
 * 
 * 动画时长: 1.0s
 * 适用场景: 嘉宾出场介绍、主持人姓名条
 */

import React, { useEffect, useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    COMEDY_COLORS,
} from './shared-fx-components'

// ============================================
// 类型定义
// ============================================

export interface GuestNameSlideProps {
    /** 嘉宾姓名 (Legacy) */
    name?: string
    /** 文本内容 (Standard) */
    text?: string
    /** 身份/职位介绍 (可选) */
    title?: string
    /** 缩放比例 (默认: 1) */
    scale?: number
    /** 姓名渐变色 */
    nameGradient?: string
    /** 身份标签背景色 */
    titleBgColor?: string
    /** 底板颜色 */
    plateColor?: string
    /** 边框颜色 */
    borderColor?: string
    /** 装饰条颜色 */
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
// 装饰闪光条
// ============================================

function ShineStripes({
    width,
    color = COMEDY_COLORS.white,
    delay = 0.3,
}: {
    width: number
    color?: string
    delay?: number
}) {
    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-full">
            {[0, 1, 2].map((i) => (
                <motion.div
                    key={i}
                    className="absolute"
                    style={{
                        top: 0,
                        bottom: 0,
                        width: 40,
                        background: `linear-gradient(90deg, transparent 0%, ${color}40 50%, transparent 100%)`,
                        transform: 'skewX(-20deg)',
                    }}
                    initial={{ left: -60 }}
                    animate={{ left: width + 60 }}
                    transition={{
                        duration: 0.6,
                        delay: delay + i * 0.12,
                        ease: 'easeOut',
                    }}
                />
            ))}
        </div>
    )
}

// ============================================
// 头像占位框
// ============================================

function AvatarPlaceholder({
    size = 70,
    color = COMEDY_COLORS.hotPink,
    borderColor = COMEDY_COLORS.white,
    delay = 0.15,
    animate = true,
}: {
    size?: number
    color?: string
    borderColor?: string
    delay?: number
    animate?: boolean
}) {
    const content = (
        <div
            className="flex items-center justify-center"
            style={{
                width: size,
                height: size,
                borderRadius: '50%',
                backgroundColor: color,
                border: `3px solid ${borderColor}`,
                boxShadow: '0 3px 10px rgba(0,0,0,0.2)',
                fontSize: size * 0.5,
            }}
        >
            😄
        </div>
    )

    if (!animate) return content

    return (
        <motion.div
            initial={{ scale: 0, opacity: 0, rotate: -20 }}
            animate={{
                scale: [0, 1.3, 0.9, 1.1, 1],
                opacity: [0, 1, 1, 1, 1],
                rotate: [-20, 10, -5, 0],
            }}
            transition={{
                duration: 0.5,
                delay,
                times: [0, 0.35, 0.55, 0.75, 1],
                ease: [0.34, 1.56, 0.64, 1],
            }}
        >
            {content}
        </motion.div>
    )
}

// ============================================
// 身份标签
// ============================================

function TitleBadge({
    text,
    bgColor = COMEDY_COLORS.popPurple,
    textColor = COMEDY_COLORS.white,
    delay = 0.4,
    animate = true,
}: {
    text: string
    bgColor?: string
    textColor?: string
    delay?: number
    animate?: boolean
}) {
    const content = (
        <div
            className="px-4 py-1.5 rounded-full"
            style={{
                backgroundColor: bgColor,
                color: textColor,
                fontSize: 18,
                fontWeight: 700,
                fontFamily: '"PingFang SC", "Microsoft YaHei", sans-serif',
                boxShadow: `0 2px 8px ${bgColor}50`,
                whiteSpace: 'nowrap',
            }}
        >
            {text}
        </div>
    )

    if (!animate) return content

    return (
        <motion.div
            initial={{ x: 30, scale: 0.7, opacity: 0 }}
            animate={{
                x: [30, -8, 3, 0],
                scale: [0.7, 1.1, 0.95, 1],
                opacity: [0, 1, 1, 1],
            }}
            transition={{
                duration: 0.45,
                delay,
                ease: [0.34, 1.56, 0.64, 1],
            }}
        >
            {content}
        </motion.div>
    )
}

// ============================================
// 小星星装饰
// ============================================

function MiniStars({
    positions,
    delay = 0.5,
}: {
    positions: Array<{ x: number; y: number }>
    delay?: number
}) {
    const colors = [COMEDY_COLORS.sunYellow, COMEDY_COLORS.hotPink, COMEDY_COLORS.electricBlue]

    return (
        <div className="absolute inset-0 pointer-events-none overflow-visible">
            {positions.map((pos, i) => (
                <motion.div
                    key={i}
                    className="absolute select-none"
                    style={{
                        left: pos.x,
                        top: pos.y,
                        fontSize: 16 + Math.random() * 8,
                        color: colors[i % colors.length],
                        filter: `drop-shadow(0 0 3px ${colors[i % colors.length]})`,
                    }}
                    initial={{ scale: 0, opacity: 0, rotate: -60 }}
                    animate={{
                        scale: [0, 1.5, 1],
                        opacity: [0, 1, 1],
                        rotate: [-60, 20, 0],
                    }}
                    transition={{
                        duration: 0.35,
                        delay: delay + i * 0.06,
                        ease: [0.34, 1.56, 0.64, 1],
                    }}
                >
                    ✦
                </motion.div>
            ))}
        </div>
    )
}

// ============================================
// 主组件
// ============================================

export function GuestNameSlide({
    name: nameProp,
    text,
    title,
    scale = 1,
    nameGradient = COMEDY_COLORS.gradients.sunset,
    titleBgColor = COMEDY_COLORS.popPurple,
    plateColor = COMEDY_COLORS.sunYellow,
    borderColor = COMEDY_COLORS.white,
    accentColor = COMEDY_COLORS.hotPink,
    autoPlay = true,
    skipToEnd = false,
    onComplete,
    className = '',
}: GuestNameSlideProps) {
    const name = nameProp || text || ''

    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        if (autoPlay || skipToEnd) {
            setIsVisible(true)
        }
    }, [autoPlay, skipToEnd])

    const handleAnimationComplete = useCallback(() => {
        setTimeout(() => {
            onComplete?.()
        }, 1000)
    }, [onComplete])

    // 计算尺寸
    const nameFontSize = 48 * scale
    const avatarSize = 70 * scale
    const plateWidth = Math.max(name.length * nameFontSize * 0.8 + avatarSize + 120, 350)
    const plateHeight = 90 * scale

    const fontFamily = '"Zcool KuaiLe", "Zcool QingKe HuangYou", "PingFang SC", "Microsoft YaHei", sans-serif'

    // 星星位置
    const starPositions = useMemo(() => [
        { x: -20, y: -15 },
        { x: plateWidth - 30, y: -10 },
        { x: plateWidth / 2, y: -20 },
        { x: 30, y: plateHeight + 5 },
        { x: plateWidth - 50, y: plateHeight + 8 },
    ], [plateWidth, plateHeight])

    // 静态模式
    if (skipToEnd) {
        return (
            <div
                className={`relative inline-flex items-center ${className}`}
                style={{
                    minWidth: plateWidth + 60,
                    minHeight: plateHeight + 40,
                }}
            >
                {/* Static Plate */}
                <div
                    className="absolute flex items-center"
                    style={{
                        left: '50%',
                        top: '50%',
                        width: plateWidth,
                        height: plateHeight,
                        backgroundColor: plateColor,
                        borderRadius: plateHeight / 2,
                        border: `4px solid ${borderColor}`,
                        boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                        transform: 'translate(-50%, -50%)',
                        paddingLeft: 12,
                        paddingRight: 20,
                        gap: 16,
                    }}
                >
                    {/* Avatar */}
                    <AvatarPlaceholder
                        size={avatarSize}
                        color={accentColor}
                        borderColor={borderColor}
                        animate={false}
                    />

                    {/* Name & Title */}
                    <div className="flex flex-col gap-1">
                        {/* Name */}
                        <span
                            style={{
                                fontSize: nameFontSize,
                                fontWeight: 900,
                                fontFamily,
                                background: nameGradient,
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text',
                                letterSpacing: '0.02em',
                                whiteSpace: 'nowrap',
                                filter: `drop-shadow(2px 2px 0 ${COMEDY_COLORS.darkOutline})`,
                            }}
                        >
                            {name}
                        </span>

                        {/* Title Badge */}
                        {title && (
                            <TitleBadge
                                text={title}
                                bgColor={titleBgColor}
                                animate={false}
                            />
                        )}
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div
            className={`relative inline-flex items-center ${className}`}
            style={{
                minWidth: plateWidth + 60,
                minHeight: plateHeight + 40,
            }}
        >
            <AnimatePresence>
                {isVisible && (
                    <>
                        {/* === Plate Layer === */}
                        <motion.div
                            className="absolute flex items-center"
                            style={{
                                left: '50%',
                                top: '50%',
                                width: plateWidth,
                                height: plateHeight,
                                backgroundColor: plateColor,
                                borderRadius: plateHeight / 2,
                                border: `4px solid ${borderColor}`,
                                boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                                paddingLeft: 12,
                                paddingRight: 20,
                                gap: 16,
                            }}
                            initial={{
                                x: '-150%',
                                y: '-50%',
                                scaleX: 0.7,
                                opacity: 0,
                            }}
                            animate={{
                                x: ['-150%', '-45%', '-52%', '-50%'],
                                y: '-50%',
                                scaleX: [0.7, 1.05, 0.98, 1],
                                opacity: [0, 1, 1, 1],
                            }}
                            transition={{
                                duration: 0.55,
                                times: [0, 0.5, 0.75, 1],
                                ease: [0.34, 1.56, 0.64, 1],
                            }}
                            onAnimationComplete={handleAnimationComplete}
                        >
                            {/* === Shine Effect === */}
                            <ShineStripes
                                width={plateWidth}
                                color={COMEDY_COLORS.white}
                                delay={0.4}
                            />

                            {/* Avatar */}
                            <AvatarPlaceholder
                                size={avatarSize}
                                color={accentColor}
                                borderColor={borderColor}
                                delay={0.25}
                            />

                            {/* Name & Title Container */}
                            <div className="flex flex-col gap-1 relative z-10">
                                {/* Name with staggered entrance */}
                                <motion.span
                                    style={{
                                        fontSize: nameFontSize,
                                        fontWeight: 900,
                                        fontFamily,
                                        background: nameGradient,
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                        backgroundClip: 'text',
                                        letterSpacing: '0.02em',
                                        whiteSpace: 'nowrap',
                                        filter: `drop-shadow(2px 2px 0 ${COMEDY_COLORS.darkOutline})`,
                                    }}
                                    initial={{ x: 40, opacity: 0, scale: 0.8 }}
                                    animate={{
                                        x: [40, -5, 2, 0],
                                        opacity: [0, 1, 1, 1],
                                        scale: [0.8, 1.08, 0.97, 1],
                                    }}
                                    transition={{
                                        duration: 0.5,
                                        delay: 0.2,
                                        ease: [0.34, 1.56, 0.64, 1],
                                    }}
                                >
                                    {name}
                                </motion.span>

                                {/* Title Badge */}
                                {title && (
                                    <TitleBadge
                                        text={title}
                                        bgColor={titleBgColor}
                                        delay={0.35}
                                    />
                                )}
                            </div>
                        </motion.div>

                        {/* === Impact FX Layer === */}
                        <MiniStars positions={starPositions} delay={0.5} />

                        {/* === Emoji Layer === */}
                        {/* 小装饰表情 */}
                        <motion.div
                            className="absolute select-none"
                            style={{
                                left: `calc(50% + ${plateWidth / 2 + 20}px)`,
                                top: 'calc(50% - 30px)',
                                fontSize: 28,
                            }}
                            initial={{ scale: 0, opacity: 0, x: -20 }}
                            animate={{
                                scale: [0, 1.4, 1],
                                opacity: [0, 1, 1],
                                x: [-20, 5, 0],
                            }}
                            transition={{
                                duration: 0.4,
                                delay: 0.55,
                                ease: [0.34, 1.56, 0.64, 1],
                            }}
                        >
                            ✨
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    )
}

export default GuestNameSlide
















