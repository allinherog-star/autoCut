'use client'

/**
 * 分段标题花字 - Segment Title Pop
 * 
 * 《一见你就笑》风格分段/环节标题特效
 * 
 * 统一舞台模型:
 * 舞台中心 (0,0)
 * ├── Plate Layer      - 圆角矩形色块底板
 * ├── Impact FX Layer  - 弹性缩放 + 星星粒子
 * ├── Text Layer       - 整体弹入 (squash & stretch)
 * └── Emoji Layer      - 小型装饰图标
 * 
 * 动画时长: 1.2s
 * 适用场景: 【本期主题】【游戏环节】【惩罚时刻】等
 */

import React, { useEffect, useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    COMEDY_COLORS,
    ColorfulParticles,
    CandyText,
    PulseLoop,
    WobbleLoop,
} from './shared-fx-components'

// ============================================
// 类型定义
// ============================================

export interface SegmentTitlePopProps {
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
// 装饰角标组件
// ============================================

function CornerBadges({
    color = COMEDY_COLORS.hotPink,
    delay = 0.3,
}: {
    color?: string
    delay?: number
}) {
    const badges = useMemo(() => [
        { id: 0, x: -1, y: -1, icon: '▶', rotation: -45 },
        { id: 1, x: 1, y: -1, icon: '◀', rotation: 45 },
        { id: 2, x: -1, y: 1, icon: '▶', rotation: -135 },
        { id: 3, x: 1, y: 1, icon: '◀', rotation: 135 },
    ], [])

    return (
        <div className="absolute inset-0 pointer-events-none">
            {badges.map((b, i) => (
                <motion.div
                    key={b.id}
                    className="absolute"
                    style={{
                        left: b.x > 0 ? 'auto' : 0,
                        right: b.x > 0 ? 0 : 'auto',
                        top: b.y < 0 ? 0 : 'auto',
                        bottom: b.y > 0 ? 0 : 'auto',
                        fontSize: 24,
                        color: color,
                        transform: `rotate(${b.rotation}deg)`,
                        filter: `drop-shadow(0 0 4px ${color})`,
                    }}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{
                        scale: [0, 1.4, 1],
                        opacity: [0, 1, 1]
                    }}
                    transition={{
                        duration: 0.35,
                        delay: delay + i * 0.05,
                        ease: [0.34, 1.56, 0.64, 1],
                    }}
                >
                    {b.icon}
                </motion.div>
            ))}
        </div>
    )
}

// ============================================
// 环节装饰标签
// ============================================

function SegmentLabel({
    text = '本期主题',
    color = COMEDY_COLORS.popPurple,
    delay = 0.1,
}: {
    text?: string
    color?: string
    delay?: number
}) {
    return (
        <motion.div
            className="absolute -top-8 left-1/2 transform -translate-x-1/2 px-4 py-1 rounded-full"
            style={{
                backgroundColor: color,
                color: COMEDY_COLORS.white,
                fontSize: 16,
                fontWeight: 700,
                fontFamily: '"PingFang SC", "Microsoft YaHei", sans-serif',
                boxShadow: `0 3px 10px ${color}60`,
                border: `2px solid ${COMEDY_COLORS.white}`,
            }}
            initial={{ y: 20, scale: 0.5, opacity: 0 }}
            animate={{
                y: [20, -5, 0],
                scale: [0.5, 1.15, 1],
                opacity: [0, 1, 1]
            }}
            transition={{
                duration: 0.45,
                delay,
                ease: [0.34, 1.56, 0.64, 1],
            }}
        >
            {text}
        </motion.div>
    )
}

// ============================================
// 动态底板
// ============================================

function AnimatedPlate({
    width,
    height,
    color,
    borderColor,
    delay = 0,
}: {
    width: number
    height: number
    color: string
    borderColor: string
    delay?: number
}) {
    const radius = height * 0.35

    return (
        <motion.div
            className="absolute"
            style={{
                left: '50%',
                top: '50%',
                width,
                height,
                backgroundColor: color,
                borderRadius: radius,
                border: `4px solid ${borderColor}`,
                boxShadow: `0 6px 20px rgba(0,0,0,0.25), inset 0 2px 0 rgba(255,255,255,0.3)`,
                transform: 'translate(-50%, -50%)',
            }}
            initial={{
                scaleX: 0,
                scaleY: 0.6,
                opacity: 0,
            }}
            animate={{
                scaleX: [0, 1.15, 0.92, 1.05, 1],
                scaleY: [0.6, 1.2, 0.9, 1.05, 1],
                opacity: [0, 1, 1, 1, 1],
            }}
            transition={{
                duration: 0.55,
                delay,
                times: [0, 0.3, 0.5, 0.75, 1],
                ease: [0.34, 1.56, 0.64, 1],
            }}
        />
    )
}

// ============================================
// 小星星装饰
// ============================================

function TinyStars({
    count = 8,
    colors = [COMEDY_COLORS.sunYellow, COMEDY_COLORS.hotPink, COMEDY_COLORS.electricBlue],
    spread = 150,
    delay = 0.35,
}: {
    count?: number
    colors?: string[]
    spread?: number
    delay?: number
}) {
    const stars = useMemo(() => {
        return Array.from({ length: count }).map((_, i) => {
            const angle = (i / count) * Math.PI * 2 + Math.random() * 0.5
            const distance = spread * (0.6 + Math.random() * 0.4)
            return {
                id: i,
                x: Math.cos(angle) * distance,
                y: Math.sin(angle) * distance,
                size: 14 + Math.random() * 10,
                color: colors[i % colors.length],
                delay: delay + i * 0.04,
                rotation: Math.random() * 360,
            }
        })
    }, [count, colors, spread, delay])

    return (
        <div className="absolute inset-0 pointer-events-none overflow-visible">
            {stars.map((s) => (
                <motion.div
                    key={s.id}
                    className="absolute select-none"
                    style={{
                        left: `calc(50% + ${s.x}px)`,
                        top: `calc(50% + ${s.y}px)`,
                        fontSize: s.size,
                        color: s.color,
                        transform: 'translate(-50%, -50%)',
                        filter: `drop-shadow(0 0 4px ${s.color})`,
                    }}
                    initial={{
                        scale: 0,
                        opacity: 0,
                        rotate: s.rotation - 180,
                    }}
                    animate={{
                        scale: [0, 1.4, 1],
                        opacity: [0, 1, 1],
                        rotate: [s.rotation - 180, s.rotation + 30, s.rotation],
                    }}
                    transition={{
                        duration: 0.4,
                        delay: s.delay,
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

export function SegmentTitlePop({
    text,
    scale = 1,
    gradient = COMEDY_COLORS.gradients.candy,
    innerStrokeColor = COMEDY_COLORS.white,
    outerStrokeColor = COMEDY_COLORS.darkOutline,
    plateColor = COMEDY_COLORS.popPurple,
    plateBorderColor = COMEDY_COLORS.white,
    autoPlay = true,
    skipToEnd = false,
    onComplete,
    className = '',
}: SegmentTitlePopProps) {
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        if (autoPlay || skipToEnd) {
            setIsVisible(true)
        }
    }, [autoPlay, skipToEnd])

    const handleAnimationComplete = useCallback(() => {
        setTimeout(() => {
            onComplete?.()
        }, 1200)
    }, [onComplete])

    // 计算尺寸
    const fontSize = 72 * scale
    const plateWidth = Math.max(text.length * fontSize * 0.8 + 80, 300)
    const plateHeight = fontSize * 1.8

    // 静态模式
    if (skipToEnd) {
        return (
            <div
                className={`relative inline-flex items-center justify-center ${className}`}
                style={{
                    minWidth: plateWidth + 100,
                    minHeight: plateHeight + 60,
                    paddingTop: 30,
                }}
            >
                {/* Static Plate */}
                <div
                    className="absolute"
                    style={{
                        left: '50%',
                        top: '50%',
                        width: plateWidth,
                        height: plateHeight,
                        backgroundColor: plateColor,
                        borderRadius: plateHeight * 0.35,
                        border: `4px solid ${plateBorderColor}`,
                        boxShadow: '0 6px 20px rgba(0,0,0,0.25)',
                        transform: 'translate(-50%, -50%)',
                    }}
                />

                {/* Static Text */}
                <CandyText
                    text={text}
                    fontSize={fontSize}
                    gradient={gradient}
                    innerStrokeColor={innerStrokeColor}
                    outerStrokeColor={outerStrokeColor}
                    animate={false}
                />
            </div>
        )
    }

    return (
        <div
            className={`relative inline-flex items-center justify-center ${className}`}
            style={{
                minWidth: plateWidth + 100,
                minHeight: plateHeight + 60,
                paddingTop: 30,
            }}
        >
            <AnimatePresence>
                {isVisible && (
                    <>
                        {/* === Plate Layer === */}
                        <AnimatedPlate
                            width={plateWidth}
                            height={plateHeight}
                            color={plateColor}
                            borderColor={plateBorderColor}
                            delay={0}
                        />

                        {/* 角标装饰 */}
                        <div
                            className="absolute"
                            style={{
                                left: '50%',
                                top: '50%',
                                width: plateWidth - 20,
                                height: plateHeight - 20,
                                transform: 'translate(-50%, -50%)',
                            }}
                        >
                            <CornerBadges color={COMEDY_COLORS.sunYellow} delay={0.35} />
                        </div>

                        {/* === Impact FX Layer === */}
                        <ColorfulParticles
                            count={20}
                            colors={[COMEDY_COLORS.sunYellow, COMEDY_COLORS.hotPink, COMEDY_COLORS.electricBlue]}
                            delay={0.2}
                            spread={120}
                        />

                        <TinyStars
                            count={10}
                            colors={[COMEDY_COLORS.sunYellow, COMEDY_COLORS.white]}
                            spread={160}
                            delay={0.3}
                        />

                        {/* === Emoji Layer === */}
                        {/* 小型装饰 emoji */}
                        <motion.div
                            className="absolute select-none"
                            style={{
                                left: 'calc(50% - 180px)',
                                top: 'calc(50% - 10px)',
                                fontSize: 32,
                            }}
                            initial={{ scale: 0, opacity: 0, x: 20 }}
                            animate={{
                                scale: [0, 1.3, 1],
                                opacity: [0, 1, 1],
                                x: [20, -5, 0]
                            }}
                            transition={{ duration: 0.4, delay: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
                        >
                            🎬
                        </motion.div>

                        <motion.div
                            className="absolute select-none"
                            style={{
                                right: 'calc(50% - 180px)',
                                top: 'calc(50% - 10px)',
                                fontSize: 32,
                            }}
                            initial={{ scale: 0, opacity: 0, x: -20 }}
                            animate={{
                                scale: [0, 1.3, 1],
                                opacity: [0, 1, 1],
                                x: [-20, 5, 0]
                            }}
                            transition={{ duration: 0.4, delay: 0.45, ease: [0.34, 1.56, 0.64, 1] }}
                        >
                            🎯
                        </motion.div>

                        {/* === Text Layer === */}
                        <motion.div
                            className="relative z-10"
                            onAnimationComplete={handleAnimationComplete}
                        >
                            <WobbleLoop angle={1.5} duration={1.2}>
                                <CandyText
                                    text={text}
                                    fontSize={fontSize}
                                    gradient={gradient}
                                    innerStrokeColor={innerStrokeColor}
                                    outerStrokeColor={outerStrokeColor}
                                    entranceType="pop"
                                    delay={0.15}
                                />
                            </WobbleLoop>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    )
}

export default SegmentTitlePop










