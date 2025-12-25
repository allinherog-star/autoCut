'use client'

/**
 * 节目主标题花字 - Show Title Burst
 * 
 * 《一见你就笑》风格节目主标题特效
 * 
 * 统一舞台模型:
 * 舞台中心 (0,0)
 * ├── Plate Layer      - 漫画爆炸底板 (亮黄色爆炸形状)
 * ├── Impact FX Layer  - 闪光 + 速度线 + 彩色粒子
 * ├── Text Layer       - 逐字弹入动画 (软糖效果)
 * └── Emoji Layer      - 笑脸/星星装饰
 * 
 * 动画时长: 1.8s
 * 适用场景: 节目名称、片头标题
 */

import React, { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    COMEDY_COLORS,
    ComicBurstPlate,
    SpeedLines,
    ColorfulParticles,
    FlashBurst,
    ComicEmojis,
    ComicSymbols,
    PerCharacterText,
    PulseLoop,
} from './shared-fx-components'

// ============================================
// 类型定义
// ============================================

export interface ShowTitleBurstProps {
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
    /** 粒子颜色组 */
    particleColors?: string[]
    /** 是否自动播放 */
    autoPlay?: boolean
    /** 跳过动画直接显示最终状态 */
    skipToEnd?: boolean
    /** 动画完成回调 */
    onComplete?: () => void
    /** 额外的 CSS 类名 */
    className?: string
}

// ============================================
// 静态渲染组件 (skipToEnd)
// ============================================

function StaticShowTitle({
    text,
    fontSize,
    plateSize,
    gradient,
    innerStrokeColor,
    outerStrokeColor,
    plateColor,
}: {
    text: string
    fontSize: number
    plateSize: number
    gradient: string
    innerStrokeColor: string
    outerStrokeColor: string
    plateColor: string
}) {
    const fontFamily = '"Zcool KuaiLe", "Zcool QingKe HuangYou", "PingFang SC", "Microsoft YaHei", sans-serif'

    return (
        <>
            {/* Plate Layer */}
            <ComicBurstPlate
                size={plateSize}
                color={plateColor}
                spikes={18}
                animate={false}
            />

            {/* Text Layer */}
            <div className="relative z-10">
                {/* 外描边 */}
                <span
                    style={{
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        fontSize,
                        fontWeight: 900,
                        fontFamily,
                        color: 'transparent',
                        WebkitTextStroke: `12px ${outerStrokeColor}`,
                        letterSpacing: '0.05em',
                        whiteSpace: 'nowrap',
                        zIndex: 1,
                    }}
                >
                    {text}
                </span>
                {/* 内描边 */}
                <span
                    style={{
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        fontSize,
                        fontWeight: 900,
                        fontFamily,
                        color: 'transparent',
                        WebkitTextStroke: `6px ${innerStrokeColor}`,
                        letterSpacing: '0.05em',
                        whiteSpace: 'nowrap',
                        zIndex: 2,
                    }}
                >
                    {text}
                </span>
                {/* 渐变填充 */}
                <span
                    style={{
                        position: 'relative',
                        fontSize,
                        fontWeight: 900,
                        fontFamily,
                        background: gradient,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        letterSpacing: '0.05em',
                        whiteSpace: 'nowrap',
                        zIndex: 3,
                        filter: `drop-shadow(3px 3px 0 ${outerStrokeColor})`,
                    }}
                >
                    {text}
                </span>
            </div>

            {/* Static Emojis */}
            <div className="absolute inset-0 pointer-events-none overflow-visible">
                {[
                    { emoji: '😂', x: -200, y: -90, rotation: -12, size: 48 },
                    { emoji: '🤣', x: 200, y: -70, rotation: 15, size: 52 },
                    { emoji: '✨', x: -180, y: 90, rotation: -8, size: 44 },
                    { emoji: '⭐', x: 180, y: 80, rotation: 10, size: 46 },
                ].map((e, i) => (
                    <div
                        key={i}
                        className="absolute select-none"
                        style={{
                            left: `calc(50% + ${e.x}px)`,
                            top: `calc(50% + ${e.y}px)`,
                            fontSize: e.size,
                            transform: `translate(-50%, -50%) rotate(${e.rotation}deg)`,
                            filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.3))',
                        }}
                    >
                        {e.emoji}
                    </div>
                ))}
            </div>
        </>
    )
}

// ============================================
// 主组件
// ============================================

export function ShowTitleBurst({
    text,
    scale = 1,
    gradient = COMEDY_COLORS.gradients.sunrise,
    innerStrokeColor = COMEDY_COLORS.white,
    outerStrokeColor = COMEDY_COLORS.darkOutline,
    plateColor = COMEDY_COLORS.sunYellow,
    particleColors = [COMEDY_COLORS.sunYellow, COMEDY_COLORS.hotPink, COMEDY_COLORS.electricBlue, COMEDY_COLORS.popPurple],
    autoPlay = true,
    skipToEnd = false,
    onComplete,
    className = '',
}: ShowTitleBurstProps) {
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        if (autoPlay || skipToEnd) {
            setIsVisible(true)
        }
    }, [autoPlay, skipToEnd])

    const handleAnimationComplete = useCallback(() => {
        // 延迟调用，确保所有动画完成
        setTimeout(() => {
            onComplete?.()
        }, 1800)
    }, [onComplete])

    // 计算尺寸
    const fontSize = 95 * scale
    const plateSize = Math.max(text.length * fontSize * 0.75, fontSize * 3.5)

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
                <StaticShowTitle
                    text={text}
                    fontSize={fontSize}
                    plateSize={plateSize}
                    gradient={gradient}
                    innerStrokeColor={innerStrokeColor}
                    outerStrokeColor={outerStrokeColor}
                    plateColor={plateColor}
                />
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
                        {/* === Plate Layer === */}
                        <ComicBurstPlate
                            size={plateSize}
                            color={plateColor}
                            spikes={18}
                            delay={0}
                        />

                        {/* === Impact FX Layer === */}
                        {/* 闪光爆发 */}
                        <FlashBurst
                            color={COMEDY_COLORS.white}
                            delay={0.05}
                            size={plateSize * 1.5}
                        />

                        {/* 速度线 */}
                        <SpeedLines
                            count={24}
                            color={COMEDY_COLORS.white}
                            length={180}
                            delay={0.1}
                        />

                        {/* 彩色粒子 */}
                        <ColorfulParticles
                            count={35}
                            colors={particleColors}
                            delay={0.15}
                            spread={200}
                        />

                        {/* === Emoji / Comic Layer === */}
                        <ComicEmojis
                            emojis={['😂', '🤣', '✨', '⭐', '💥', '🌟']}
                            delay={0.4}
                            scale={scale}
                        />

                        <ComicSymbols
                            symbols={['!', '!', '★', '♪']}
                            color={COMEDY_COLORS.sunYellow}
                            strokeColor={COMEDY_COLORS.darkOutline}
                            delay={0.45}
                        />

                        {/* === Text Layer === */}
                        <motion.div
                            onAnimationComplete={handleAnimationComplete}
                        >
                            <PulseLoop intensity={0.03} duration={1.5}>
                                <PerCharacterText
                                    text={text}
                                    fontSize={fontSize}
                                    gradient={gradient}
                                    innerStrokeColor={innerStrokeColor}
                                    outerStrokeColor={outerStrokeColor}
                                    staggerDelay={0.08}
                                    baseDelay={0.25}
                                />
                            </PulseLoop>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    )
}

export default ShowTitleBurst








