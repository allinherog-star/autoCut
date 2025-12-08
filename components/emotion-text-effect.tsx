'use client'

import { useState, useEffect, useMemo, useCallback, memo, useRef } from 'react'
import { motion, AnimatePresence, Variants } from 'framer-motion'
import {
  EmotionTextStyle,
  EmotionType,
  EMOTION_TEXT_PRESETS,
  DECORATION_EMOJIS,
  EMOTION_COLORS,
  randomInRange,
  presetToCSS,
  getEmotionLabel,
} from '@/lib/emotion-text-effects'

// ============================================
// 类型定义
// ============================================

interface EmotionTextEffectProps {
  /** 要显示的文字 */
  text: string
  /** 预设样式 ID 或预设对象 */
  preset: string | EmotionTextStyle
  /** 是否显示 */
  visible?: boolean
  /** 缩放比例 */
  scale?: number
  /** 动画完成回调 */
  onAnimationComplete?: () => void
  /** 额外的 CSS 类名 */
  className?: string
}

interface CharacterProps {
  char: string
  index: number
  preset: EmotionTextStyle
  scale: number
  totalChars: number
}

interface DecorationProps {
  preset: EmotionTextStyle
  textLength: number
}

// ============================================
// 背景特效类型
// ============================================

type BackgroundEffectType = 
  | 'explosion-lines'    // 爆炸集中线
  | 'radial-burst'       // 放射光芒
  | 'comic-bubble'       // 漫画对话框
  | 'glow-aura'          // 发光光晕
  | 'shockwave'          // 冲击波
  | 'fire-aura'          // 火焰光环
  | 'heart-burst'        // 心形爆发
  | 'sparkle-field'      // 星光场
  | 'glitch-bg'          // 故障背景
  | 'rainbow-burst'      // 彩虹爆发
  | 'speed-lines'        // 速度线
  | 'none'

// ============================================
// 背景特效组件 - 爆炸集中线
// ============================================

const ExplosionLines = memo(function ExplosionLines({ color, intensity = 1 }: { color: string; intensity?: number }) {
  const lines = useMemo(() => {
    const count = Math.floor(24 * intensity)
    return Array.from({ length: count }, (_, i) => ({
      angle: (360 / count) * i + randomInRange(-5, 5),
      length: randomInRange(80, 150) * intensity,
      width: randomInRange(2, 6),
      delay: randomInRange(0, 0.15),
    }))
  }, [intensity])

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
      {lines.map((line, i) => (
        <motion.div
          key={i}
          className="absolute origin-center"
          style={{
            width: `${line.width}px`,
            height: `${line.length}px`,
            background: `linear-gradient(to top, ${color} 0%, transparent 100%)`,
            transform: `rotate(${line.angle}deg)`,
            transformOrigin: 'bottom center',
          }}
          initial={{ scaleY: 0, opacity: 0 }}
          animate={{
            scaleY: [0, 1, 0.8],
            opacity: [0, 1, 0.6],
          }}
          transition={{
            duration: 0.4,
            delay: line.delay,
            ease: 'easeOut',
          }}
        />
      ))}
    </div>
  )
})

// ============================================
// 背景特效组件 - 放射光芒
// ============================================

const RadialBurst = memo(function RadialBurst({ colors, intensity = 1 }: { colors: string[]; intensity?: number }) {
  const rays = useMemo(() => {
    const count = Math.floor(16 * intensity)
    return Array.from({ length: count }, (_, i) => ({
      angle: (360 / count) * i,
      color: colors[i % colors.length],
      scale: randomInRange(0.8, 1.2),
    }))
  }, [colors, intensity])

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <motion.div
        className="absolute"
        style={{
          width: '300%',
          height: '300%',
          background: `conic-gradient(from 0deg, ${rays.map((r, i) => `${r.color} ${(i / rays.length) * 100}%`).join(', ')}, ${rays[0]?.color || colors[0]} 100%)`,
          maskImage: 'radial-gradient(circle, transparent 20%, black 21%, black 70%, transparent 71%)',
          WebkitMaskImage: 'radial-gradient(circle, transparent 20%, black 21%, black 70%, transparent 71%)',
        }}
        initial={{ rotate: 0, scale: 0, opacity: 0 }}
        animate={{
          rotate: 360,
          scale: 1,
          opacity: [0, 0.7, 0.5],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'linear',
          opacity: { duration: 0.5 },
        }}
      />
    </div>
  )
})

// ============================================
// 背景特效组件 - 漫画对话框
// ============================================

const ComicBubble = memo(function ComicBubble({ color, borderColor }: { color: string; borderColor: string }) {
  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center pointer-events-none"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', stiffness: 500, damping: 20 }}
    >
      <svg
        viewBox="0 0 200 120"
        className="absolute w-[140%] h-[200%]"
        style={{ filter: 'drop-shadow(4px 4px 0px rgba(0,0,0,0.3))' }}
      >
        {/* 爆炸形状 */}
        <motion.path
          d="M100,10 L115,35 L145,25 L135,50 L165,55 L140,70 L160,95 L125,85 L100,110 L75,85 L40,95 L60,70 L35,55 L65,50 L55,25 L85,35 Z"
          fill={color}
          stroke={borderColor}
          strokeWidth="4"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.3 }}
        />
      </svg>
    </motion.div>
  )
})

// ============================================
// 背景特效组件 - 发光光晕
// ============================================

const GlowAura = memo(function GlowAura({ color, pulseSpeed = 1.5 }: { color: string; pulseSpeed?: number }) {
  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center pointer-events-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* 外层光晕 */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: '200%',
          height: '150%',
          background: `radial-gradient(ellipse, ${color}40 0%, ${color}20 30%, transparent 70%)`,
        }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.6, 0.9, 0.6],
        }}
        transition={{
          duration: pulseSpeed,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      {/* 内层光晕 */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: '150%',
          height: '100%',
          background: `radial-gradient(ellipse, ${color}60 0%, transparent 60%)`,
        }}
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.8, 1, 0.8],
        }}
        transition={{
          duration: pulseSpeed * 0.7,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    </motion.div>
  )
})

// ============================================
// 背景特效组件 - 冲击波
// ============================================

const Shockwave = memo(function Shockwave({ color }: { color: string }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: '50px',
            height: '50px',
            border: `3px solid ${color}`,
            boxShadow: `0 0 20px ${color}`,
          }}
          initial={{ scale: 0, opacity: 1 }}
          animate={{
            scale: [0, 8],
            opacity: [1, 0],
          }}
          transition={{
            duration: 1,
            delay: i * 0.2,
            repeat: Infinity,
            repeatDelay: 0.4,
            ease: 'easeOut',
          }}
        />
      ))}
    </div>
  )
})

// ============================================
// 背景特效组件 - 火焰光环
// ============================================

const FireAura = memo(function FireAura() {
  const flames = useMemo(() => {
    return Array.from({ length: 20 }, (_, i) => ({
      angle: (360 / 20) * i,
      size: randomInRange(20, 40),
      delay: randomInRange(0, 0.5),
      duration: randomInRange(0.5, 1),
    }))
  }, [])

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      {flames.map((flame, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{
            width: `${flame.size}px`,
            height: `${flame.size * 1.5}px`,
            background: 'linear-gradient(to top, #FF6B35, #FFE66D, transparent)',
            borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
            transform: `rotate(${flame.angle}deg) translateY(-60px)`,
            transformOrigin: 'center 80px',
            filter: 'blur(2px)',
          }}
          animate={{
            scale: [0.8, 1.2, 0.8],
            opacity: [0.6, 1, 0.6],
          }}
          transition={{
            duration: flame.duration,
            delay: flame.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  )
})

// ============================================
// 背景特效组件 - 心形爆发
// ============================================

const HeartBurst = memo(function HeartBurst({ color }: { color: string }) {
  const hearts = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => ({
      angle: (360 / 12) * i,
      size: randomInRange(15, 30),
      delay: randomInRange(0, 0.3),
      distance: randomInRange(60, 100),
    }))
  }, [])

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      {hearts.map((heart, i) => (
        <motion.div
          key={i}
          className="absolute text-2xl"
          style={{
            fontSize: `${heart.size}px`,
            color: color,
            textShadow: `0 0 10px ${color}`,
          }}
          initial={{
            x: 0,
            y: 0,
            scale: 0,
            opacity: 0,
          }}
          animate={{
            x: Math.cos((heart.angle * Math.PI) / 180) * heart.distance,
            y: Math.sin((heart.angle * Math.PI) / 180) * heart.distance,
            scale: [0, 1.2, 1],
            opacity: [0, 1, 0.8],
          }}
          transition={{
            duration: 0.6,
            delay: heart.delay,
            ease: 'easeOut',
          }}
        >
          ❤️
        </motion.div>
      ))}
    </div>
  )
})

// ============================================
// 背景特效组件 - 星光场
// ============================================

const SparkleField = memo(function SparkleField({ color }: { color: string }) {
  const sparkles = useMemo(() => {
    return Array.from({ length: 30 }, (_, i) => ({
      x: randomInRange(-150, 150),
      y: randomInRange(-80, 80),
      size: randomInRange(4, 12),
      delay: randomInRange(0, 1),
      duration: randomInRange(0.5, 1.5),
    }))
  }, [])

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      {sparkles.map((sparkle, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{
            left: '50%',
            top: '50%',
            width: `${sparkle.size}px`,
            height: `${sparkle.size}px`,
          }}
          initial={{ x: sparkle.x, y: sparkle.y, scale: 0, opacity: 0 }}
          animate={{
            scale: [0, 1, 0],
            opacity: [0, 1, 0],
            rotate: [0, 180],
          }}
          transition={{
            duration: sparkle.duration,
            delay: sparkle.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <svg viewBox="0 0 24 24" fill={color}>
            <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z" />
          </svg>
        </motion.div>
      ))}
    </div>
  )
})

// ============================================
// 背景特效组件 - 速度线
// ============================================

const SpeedLines = memo(function SpeedLines({ color, direction = 'left' }: { color: string; direction?: 'left' | 'right' }) {
  const lines = useMemo(() => {
    return Array.from({ length: 15 }, (_, i) => ({
      y: randomInRange(-100, 100),
      width: randomInRange(100, 300),
      height: randomInRange(2, 6),
      delay: randomInRange(0, 0.3),
      opacity: randomInRange(0.3, 0.8),
    }))
  }, [])

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
      {lines.map((line, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{
            width: `${line.width}px`,
            height: `${line.height}px`,
            background: `linear-gradient(to ${direction}, transparent, ${color})`,
            top: '50%',
            [direction]: '-100px',
            transform: `translateY(${line.y}px)`,
            opacity: line.opacity,
          }}
          initial={{ x: direction === 'left' ? 200 : -200 }}
          animate={{ x: direction === 'left' ? -400 : 400 }}
          transition={{
            duration: 0.4,
            delay: line.delay,
            repeat: Infinity,
            repeatDelay: 0.5,
            ease: 'linear',
          }}
        />
      ))}
    </div>
  )
})

// ============================================
// 背景特效组件 - 彩虹爆发
// ============================================

const RainbowBurst = memo(function RainbowBurst() {
  const colors = ['#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF', '#4B0082', '#9400D3']
  
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      {colors.map((color, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: '100%',
            height: '100%',
            border: `4px solid ${color}`,
            opacity: 0.6,
          }}
          initial={{ scale: 0 }}
          animate={{
            scale: [0, 1.5 + i * 0.3],
            opacity: [0.8, 0],
          }}
          transition={{
            duration: 1,
            delay: i * 0.08,
            repeat: Infinity,
            repeatDelay: 0.5,
            ease: 'easeOut',
          }}
        />
      ))}
    </div>
  )
})

// ============================================
// 粒子系统组件
// ============================================

type ParticleType = 'star' | 'circle' | 'heart' | 'fire' | 'sparkle' | 'confetti'

interface ParticleSystemProps {
  type: ParticleType
  color: string
  count?: number
  spread?: number
}

const ParticleSystem = memo(function ParticleSystem({ 
  type, 
  color, 
  count = 20,
  spread = 100 
}: ParticleSystemProps) {
  const particles = useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      x: randomInRange(-spread, spread),
      y: randomInRange(-spread * 0.6, spread * 0.6),
      size: randomInRange(8, 20),
      delay: randomInRange(0, 0.5),
      duration: randomInRange(1, 2),
      rotation: randomInRange(0, 360),
    }))
  }, [count, spread])

  const getParticleContent = (particleType: ParticleType, size: number) => {
    switch (particleType) {
      case 'star':
        return (
          <svg viewBox="0 0 24 24" width={size} height={size} fill={color}>
            <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z" />
          </svg>
        )
      case 'heart':
        return <span style={{ fontSize: size, color }}>❤️</span>
      case 'fire':
        return <span style={{ fontSize: size }}>🔥</span>
      case 'sparkle':
        return <span style={{ fontSize: size }}>✨</span>
      case 'confetti':
        return (
          <div
            style={{
              width: size,
              height: size * 0.4,
              background: color,
              borderRadius: '2px',
            }}
          />
        )
      case 'circle':
      default:
        return (
          <div
            style={{
              width: size,
              height: size,
              background: color,
              borderRadius: '50%',
              boxShadow: `0 0 ${size}px ${color}`,
            }}
          />
        )
    }
  }

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      {particles.map((particle, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{
            left: '50%',
            top: '50%',
          }}
          initial={{
            x: 0,
            y: 0,
            scale: 0,
            opacity: 0,
            rotate: particle.rotation,
          }}
          animate={{
            x: particle.x,
            y: particle.y,
            scale: [0, 1, 0.8],
            opacity: [0, 1, 0],
            rotate: particle.rotation + randomInRange(-180, 180),
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            repeatDelay: randomInRange(0.5, 1.5),
            ease: 'easeOut',
          }}
        >
          {getParticleContent(type, particle.size)}
        </motion.div>
      ))}
    </div>
  )
})

// ============================================
// 文字特效层组件
// ============================================

interface TextEffectLayerProps {
  text: string
  preset: EmotionTextStyle
  scale: number
  layerType: 'shadow' | 'outline' | 'main' | 'glow'
}

const TextEffectLayer = memo(function TextEffectLayer({
  text,
  preset,
  scale,
  layerType,
}: TextEffectLayerProps) {
  const getLayerStyle = (): React.CSSProperties => {
    const baseStyle: React.CSSProperties = {
      fontFamily: `"${preset.text.fontFamily}", "Noto Sans SC", sans-serif`,
      fontWeight: preset.text.fontWeight,
      fontSize: `${preset.text.fontSize * scale}px`,
      lineHeight: 1.2,
      whiteSpace: 'nowrap',
    }

    switch (layerType) {
      case 'shadow':
        return {
          ...baseStyle,
          color: 'transparent',
          WebkitTextStroke: `${8 * scale}px rgba(0,0,0,0.5)`,
          filter: 'blur(4px)',
          transform: 'translate(4px, 4px)',
        }
      case 'outline':
        return {
          ...baseStyle,
          color: 'transparent',
          WebkitTextStroke: `${(preset.text.stroke?.width || 4) * scale}px ${preset.text.stroke?.color || '#000'}`,
        }
      case 'glow':
        return {
          ...baseStyle,
          color: preset.text.color,
          filter: `blur(${8 * scale}px)`,
          opacity: 0.6,
        }
      case 'main':
      default:
        const mainStyle: React.CSSProperties = { ...baseStyle }
        if (preset.text.gradient) {
          mainStyle.background = preset.text.gradient
          mainStyle.WebkitBackgroundClip = 'text'
          mainStyle.WebkitTextFillColor = 'transparent'
          mainStyle.backgroundClip = 'text'
        } else {
          mainStyle.color = preset.text.color
        }
        if (preset.text.shadow) {
          mainStyle.textShadow = preset.text.shadow
        }
        return mainStyle
    }
  }

  return (
    <span className="absolute inset-0 flex items-center justify-center" style={getLayerStyle()}>
      {text}
    </span>
  )
})

// ============================================
// 动画变体定义
// ============================================

const getAnimationVariants = (preset: EmotionTextStyle, index: number, totalChars: number): Variants => {
  const staggerDelay = preset.layout.stagger ? index * (preset.layout.staggerDelay / 1000) : 0
  const animationType = preset.animation.enter

  const commonTransition = {
    delay: staggerDelay,
    duration: preset.animation.duration / 1000,
  }

  switch (animationType) {
    // ========== 综艺爆款系列 ==========
    case 'variety-boom-in':
      return {
        hidden: { opacity: 0, scale: 0, filter: 'blur(30px) brightness(3)' },
        visible: {
          opacity: 1,
          scale: [0, 1.6, 0.85, 1.2, 1],
          filter: ['blur(30px) brightness(3)', 'blur(0px) brightness(1.5)', 'blur(0px) brightness(1)'],
          transition: {
            ...commonTransition,
            times: [0, 0.25, 0.45, 0.7, 1],
            type: 'spring',
            stiffness: 800,
            damping: 12,
          },
        },
        exit: { opacity: 0, scale: 2, filter: 'blur(20px)', transition: { duration: 0.15 } },
      }

    case 'golden-flash-in':
      return {
        hidden: { opacity: 0, scale: 0.3, filter: 'brightness(3)' },
        visible: {
          opacity: [0, 1, 0.8, 1],
          scale: [0.3, 1.3, 0.95, 1],
          filter: ['brightness(3)', 'brightness(1.8)', 'brightness(1.2)', 'brightness(1)'],
          transition: {
            ...commonTransition,
            times: [0, 0.35, 0.65, 1],
          },
        },
        exit: { opacity: 0, scale: 0.5, filter: 'brightness(2)', transition: { duration: 0.2 } },
      }

    case 'super-scale-in':
      return {
        hidden: { opacity: 0, scale: 0 },
        visible: {
          opacity: 1,
          scale: [0, 2.5, 0.8, 1.25, 1],
          transition: {
            ...commonTransition,
            times: [0, 0.2, 0.45, 0.7, 1],
            type: 'spring',
            stiffness: 900,
            damping: 10,
          },
        },
        exit: { opacity: 0, scale: 3, transition: { duration: 0.15 } },
      }

    case 'shock-wave-in':
      return {
        hidden: { opacity: 0, scale: 0.2, rotate: -20 },
        visible: {
          opacity: 1,
          scale: [0.2, 1.5, 0.85, 1.15, 1],
          rotate: [randomInRange(-30, 30), randomInRange(-10, 10), 0],
          transition: {
            ...commonTransition,
            times: [0, 0.3, 0.55, 0.75, 1],
            type: 'spring',
            stiffness: 600,
            damping: 15,
          },
        },
        exit: { opacity: 0, scale: 0, rotate: 45, transition: { duration: 0.2 } },
      }

    case 'laugh-bounce-in':
      return {
        hidden: { opacity: 0, y: 100, rotate: -30 },
        visible: {
          opacity: 1,
          y: [100, -25, 12, -6, 0],
          rotate: [randomInRange(-40, 40), randomInRange(-20, 20), 0],
          transition: {
            ...commonTransition,
            times: [0, 0.35, 0.55, 0.75, 1],
            type: 'spring',
            stiffness: 400,
            damping: 12,
          },
        },
        exit: { opacity: 0, y: -50, rotate: 30, transition: { duration: 0.25 } },
      }

    case 'heart-explosion-in':
      return {
        hidden: { opacity: 0, scale: 0 },
        visible: {
          opacity: 1,
          scale: [0, 1.6, 0.8, 1.25, 0.95, 1.08, 1],
          transition: {
            ...commonTransition,
            times: [0, 0.2, 0.35, 0.5, 0.65, 0.8, 1],
          },
        },
        exit: { opacity: 0, scale: 1.5, filter: 'blur(10px)', transition: { duration: 0.3 } },
      }

    case 'comic-explosion-in':
      return {
        hidden: { opacity: 0, scale: 0, rotate: -45 },
        visible: {
          opacity: 1,
          scale: [0, 2, 0.7, 1.3, 1],
          rotate: [randomInRange(-60, 60), randomInRange(-15, 15)],
          transition: {
            ...commonTransition,
            times: [0, 0.2, 0.4, 0.65, 1],
            type: 'spring',
            stiffness: 500,
            damping: 12,
          },
        },
        exit: { opacity: 0, scale: 0, rotate: 90, transition: { duration: 0.15 } },
      }

    case 'punch-impact-in':
      return {
        hidden: { opacity: 0, scale: 4, x: 150 },
        visible: {
          opacity: 1,
          scale: [4, 0.75, 1.2, 1],
          x: [150, -15, 8, 0],
          transition: {
            ...commonTransition,
            times: [0, 0.3, 0.6, 1],
            type: 'spring',
            stiffness: 800,
            damping: 15,
          },
        },
        exit: { opacity: 0, scale: 0.5, x: -50, transition: { duration: 0.15 } },
      }

    case 'climax-burst-in':
      return {
        hidden: { opacity: 0, scale: 0, filter: 'brightness(3)' },
        visible: {
          opacity: 1,
          scale: [0, 1.8, 0.8, 1.2, 1],
          filter: ['brightness(3)', 'brightness(1.5)', 'brightness(1)'],
          transition: {
            ...commonTransition,
            times: [0, 0.25, 0.5, 0.75, 1],
            type: 'spring',
            stiffness: 700,
            damping: 12,
          },
        },
        exit: { opacity: 0, scale: 2, transition: { duration: 0.15 } },
      }

    // ========== 标准动画 ==========
    case 'bouncy-pop':
      return {
        hidden: { opacity: 0, scale: 0, y: 50 },
        visible: {
          opacity: 1,
          scale: [0, 1.3, 0.85, 1.1, 1],
          y: [50, -15, 8, 0],
          transition: {
            ...commonTransition,
            times: [0, 0.35, 0.55, 0.75, 1],
            type: 'spring',
            stiffness: 500,
            damping: 15,
          },
        },
        exit: { opacity: 0, scale: 0, transition: { duration: 0.2 } },
      }

    case 'explosion-in':
      return {
        hidden: { opacity: 0, scale: 4, filter: 'blur(25px)' },
        visible: {
          opacity: 1,
          scale: [4, 0.8, 1.2, 1],
          filter: ['blur(25px)', 'blur(0px)'],
          transition: {
            ...commonTransition,
            times: [0, 0.35, 0.65, 1],
            type: 'spring',
            stiffness: 600,
            damping: 25,
          },
        },
        exit: { opacity: 0, scale: 0.5, transition: { duration: 0.2 } },
      }

    case 'zoom-shake':
      return {
        hidden: { opacity: 0, scale: 0.1 },
        visible: {
          opacity: 1,
          scale: [0.1, 1.5, 0.85, 1.2, 1],
          transition: {
            ...commonTransition,
            times: [0, 0.25, 0.45, 0.7, 1],
            type: 'spring',
            stiffness: 800,
            damping: 10,
          },
        },
        exit: { opacity: 0, scale: 2, transition: { duration: 0.2 } },
      }

    default:
      return {
        hidden: { opacity: 0, y: 30, scale: 0.8 },
        visible: {
          opacity: 1,
          y: 0,
          scale: 1,
          transition: {
            ...commonTransition,
            type: 'spring',
            stiffness: 400,
            damping: 20,
          },
        },
        exit: { opacity: 0, y: -20, transition: { duration: 0.2 } },
      }
  }
}

// 循环动画变体
const getLoopVariants = (loopType: string | undefined): Variants => {
  switch (loopType) {
    case 'intense-shake':
      return {
        animate: {
          x: [-5, 5, -5, 5, -3, 3, 0],
          y: [-3, 3, -3, 3, 0],
          scale: [1, 1.03, 1, 1.03, 1],
          transition: {
            duration: 0.2,
            repeat: Infinity,
          },
        },
      }

    case 'golden-glow':
      return {
        animate: {
          filter: ['brightness(1)', 'brightness(1.5)', 'brightness(1)'],
          scale: [1, 1.05, 1],
          transition: {
            duration: 1,
            repeat: Infinity,
            ease: 'easeInOut',
          },
        },
      }

    case 'power-pulse':
      return {
        animate: {
          scale: [1, 1.1, 1, 1.06, 1],
          filter: ['brightness(1)', 'brightness(1.4)', 'brightness(1)'],
          transition: {
            duration: 0.5,
            repeat: Infinity,
            ease: 'easeInOut',
          },
        },
      }

    case 'heartbeat-glow':
      return {
        animate: {
          scale: [1, 1.12, 1, 1.18, 1],
          filter: ['brightness(1)', 'brightness(1.3)', 'brightness(1)', 'brightness(1.4)', 'brightness(1)'],
          transition: {
            duration: 0.7,
            repeat: Infinity,
            times: [0, 0.25, 0.5, 0.75, 1],
          },
        },
      }

    case 'comic-vibrate':
      return {
        animate: {
          x: [-4, 4, -4, 4, 0],
          y: [-2, 2, -2, 2, 0],
          rotate: [-3, 3, -3, 3, 0],
          transition: {
            duration: 0.12,
            repeat: Infinity,
          },
        },
      }

    case 'fire-shake':
      return {
        animate: {
          x: [-4, 4, -4, 4, 0],
          y: [-2, 2, -2, 2, 0],
          transition: {
            duration: 0.12,
            repeat: Infinity,
          },
        },
      }

    case 'impact-shake':
      return {
        animate: {
          x: [-6, 6, -4, 4, -2, 2, 0],
          scale: [1, 1.04, 1, 1.02, 1],
          transition: {
            duration: 0.25,
            repeat: Infinity,
            repeatDelay: 0.4,
          },
        },
      }

    case 'climax-pulse':
      return {
        animate: {
          scale: [1, 1.08, 1, 1.05, 1],
          filter: ['brightness(1)', 'brightness(1.3)', 'brightness(1)'],
          transition: {
            duration: 0.4,
            repeat: Infinity,
          },
        },
      }

    case 'happy-wiggle':
      return {
        animate: {
          rotate: [-6, 6, -6],
          y: [-4, 4, -4],
          transition: {
            duration: 0.35,
            repeat: Infinity,
            repeatType: 'reverse',
          },
        },
      }

    default:
      return {}
  }
}

// ============================================
// 根据预设获取背景效果配置
// ============================================

function getBackgroundEffect(preset: EmotionTextStyle): {
  type: BackgroundEffectType
  color: string
  colors?: string[]
  intensity?: number
} {
  const emotion = preset.emotion
  const animationType = preset.animation.enter
  const presetId = preset.id
  const colors = EMOTION_COLORS[emotion]

  // 首先根据预设 ID 精确匹配 - 确保每个预设有独特的背景
  const presetBackgroundMap: Record<string, BackgroundEffectType> = {
    // 综艺爆款系列 - 6种不同背景
    'variety-boom': 'explosion-lines',      // 爆炸集中线
    'variety-highlight': 'sparkle-field',   // 星光场
    'variety-super': 'shockwave',           // 冲击波
    'variety-wow': 'radial-burst',          // 放射光芒
    'variety-laugh': 'comic-bubble',        // 漫画对话框
    'variety-awkward': 'speed-lines',       // 速度线
    // 心动系列 - 4种
    'love-explosion': 'heart-burst',        // 心形爆发
    'love-sweet': 'glow-aura',              // 粉色光晕
    'love-hearts': 'heart-burst',           // 心形爆发
    'love-sparkle': 'sparkle-field',        // 星光场
    // 漫画系列 - 3种
    'comic-boom': 'comic-bubble',           // 漫画对话框
    'comic-action': 'speed-lines',          // 速度线
    'comic-punch': 'explosion-lines',       // 爆炸集中线
    // 闪耀系列 - 2种
    'sparkle-magic': 'sparkle-field',       // 星光场
    'sparkle-rainbow': 'rainbow-burst',     // 彩虹爆发
    // 戏剧系列 - 2种
    'drama-reveal': 'radial-burst',         // 放射光芒
    'drama-climax': 'shockwave',            // 冲击波
    // 吐槽系列 - 2种
    'roast-mode': 'comic-bubble',           // 漫画对话框
    'cringe-alert': 'radial-burst',         // 放射光芒
    // 开心系列 - 2种
    'happy-bounce': 'sparkle-field',        // 星光场
    'happy-rainbow': 'rainbow-burst',       // 彩虹爆发
    // 激动系列 - 2种
    'excited-explosion': 'explosion-lines', // 爆炸集中线
    'excited-zoom': 'shockwave',            // 冲击波
    // 惊讶系列 - 1种
    'surprised-pop': 'radial-burst',        // 放射光芒
    // 愤怒系列 - 1种
    'angry-rage': 'fire-aura',              // 火焰光环
    // 悲伤系列 - 1种
    'sad-rain': 'glow-aura',                // 蓝色光晕
    // 害怕系列 - 1种
    'scared-tremble': 'glow-aura',          // 暗色光晕
    // 困惑系列 - 1种
    'confused-spin': 'radial-burst',        // 放射光芒
    // 酷炫系列 - 2种
    'cool-neon': 'glow-aura',               // 霓虹光晕
    'cool-glitch': 'speed-lines',           // 速度线（故障感）
    // 搞笑系列 - 2种
    'funny-wobble': 'comic-bubble',         // 漫画对话框
    'funny-cartoon': 'comic-bubble',        // 漫画对话框
  }

  // 如果有精确匹配，使用它
  if (presetBackgroundMap[presetId]) {
    const type = presetBackgroundMap[presetId]
    return { 
      type, 
      color: colors.primary, 
      colors: [colors.primary, colors.secondary, colors.accent],
      intensity: type === 'explosion-lines' ? 1.2 : 1
    }
  }

  // 否则根据动画类型匹配
  if (animationType.includes('boom') || animationType.includes('explosion')) {
    return { type: 'explosion-lines', color: colors.primary, intensity: 1.2 }
  }
  if (animationType.includes('punch') || animationType.includes('impact')) {
    return { type: 'speed-lines', color: colors.primary }
  }
  if (animationType.includes('heart') || animationType.includes('sweet')) {
    return { type: 'heart-burst', color: colors.primary }
  }
  if (animationType.includes('comic') || animationType.includes('laugh')) {
    return { type: 'comic-bubble', color: colors.secondary, colors: [colors.primary, colors.secondary] }
  }
  if (animationType.includes('climax') || animationType.includes('super') || animationType.includes('zoom')) {
    return { type: 'shockwave', color: colors.primary }
  }
  if (animationType.includes('golden') || animationType.includes('sparkle') || animationType.includes('bouncy')) {
    return { type: 'sparkle-field', color: colors.primary }
  }
  if (animationType.includes('rainbow')) {
    return { type: 'rainbow-burst', color: colors.primary }
  }
  if (animationType.includes('shock') || animationType.includes('wave')) {
    return { type: 'radial-burst', color: colors.primary, colors: [colors.primary, colors.secondary, colors.accent] }
  }

  // 最后根据情绪选择默认效果
  const emotionDefaultMap: Record<EmotionType, BackgroundEffectType> = {
    happy: 'sparkle-field',
    excited: 'explosion-lines',
    surprised: 'radial-burst',
    love: 'heart-burst',
    angry: 'fire-aura',
    sad: 'glow-aura',
    scared: 'glow-aura',
    confused: 'radial-burst',
    cool: 'speed-lines',
    funny: 'comic-bubble',
  }

  return { 
    type: emotionDefaultMap[emotion] || 'glow-aura', 
    color: colors.primary,
    colors: [colors.primary, colors.secondary, colors.accent]
  }
}

// ============================================
// 背景效果渲染器
// ============================================

const BackgroundEffectRenderer = memo(function BackgroundEffectRenderer({
  preset,
}: {
  preset: EmotionTextStyle
}) {
  const effectConfig = useMemo(() => getBackgroundEffect(preset), [preset])
  const colors = EMOTION_COLORS[preset.emotion]

  switch (effectConfig.type) {
    case 'explosion-lines':
      return <ExplosionLines color={effectConfig.color} intensity={effectConfig.intensity} />
    case 'radial-burst':
      return <RadialBurst colors={effectConfig.colors || [colors.primary, colors.secondary]} intensity={1} />
    case 'comic-bubble':
      return <ComicBubble color={colors.secondary} borderColor={colors.primary} />
    case 'glow-aura':
      return <GlowAura color={effectConfig.color} />
    case 'shockwave':
      return <Shockwave color={effectConfig.color} />
    case 'fire-aura':
      return <FireAura />
    case 'heart-burst':
      return <HeartBurst color={effectConfig.color} />
    case 'sparkle-field':
      return <SparkleField color={effectConfig.color} />
    case 'speed-lines':
      return <SpeedLines color={effectConfig.color} />
    case 'rainbow-burst':
      return <RainbowBurst />
    default:
      return null
  }
})

// ============================================
// 粒子效果渲染器
// ============================================

const ParticleEffectRenderer = memo(function ParticleEffectRenderer({
  preset,
}: {
  preset: EmotionTextStyle
}) {
  const emotion = preset.emotion
  const presetId = preset.id
  const colors = EMOTION_COLORS[emotion]

  // 根据预设 ID 和情绪选择粒子类型
  const particleConfig = useMemo(() => {
    // 首先根据预设 ID 精确匹配 - 确保每个预设有独特的粒子效果
    const presetParticleMap: Record<string, { type: ParticleType; count: number; spread: number }> = {
      // 综艺爆款系列 - 不同粒子类型和数量
      'variety-boom': { type: 'fire', count: 35, spread: 160 },       // 火花爆发
      'variety-highlight': { type: 'sparkle', count: 30, spread: 140 }, // 闪耀星光
      'variety-super': { type: 'star', count: 40, spread: 170 },     // 超多星星
      'variety-wow': { type: 'star', count: 32, spread: 150 },       // 惊讶星星
      'variety-laugh': { type: 'confetti', count: 35, spread: 150 }, // 彩色纸屑
      'variety-awkward': { type: 'circle', count: 18, spread: 100 }, // 少量圆点
      // 心动系列 - 心形为主
      'love-explosion': { type: 'heart', count: 30, spread: 140 },   // 满屏爱心
      'love-sweet': { type: 'heart', count: 22, spread: 120 },       // 温柔爱心
      'love-hearts': { type: 'heart', count: 28, spread: 135 },      // 浪漫爱心
      'love-sparkle': { type: 'sparkle', count: 25, spread: 130 },   // 闪耀爱情
      // 漫画系列 - 星星和火花
      'comic-boom': { type: 'star', count: 32, spread: 150 },        // 漫画星星
      'comic-action': { type: 'star', count: 25, spread: 130 },      // 动作线星星
      'comic-punch': { type: 'fire', count: 30, spread: 140 },       // 打击火花
      // 闪耀系列 - 闪光效果
      'sparkle-magic': { type: 'sparkle', count: 35, spread: 150 },  // 魔法闪耀
      'sparkle-rainbow': { type: 'sparkle', count: 32, spread: 145 }, // 彩虹闪耀
      // 戏剧系列 - 星星为主
      'drama-reveal': { type: 'sparkle', count: 25, spread: 130 },   // 揭晓闪光
      'drama-climax': { type: 'star', count: 35, spread: 160 },      // 高潮星星
      // 吐槽系列 - 彩纸
      'roast-mode': { type: 'confetti', count: 25, spread: 130 },    // 吐槽纸屑
      'cringe-alert': { type: 'circle', count: 20, spread: 115 },    // 尴尬圆点
      // 开心系列 - 闪光
      'happy-bounce': { type: 'sparkle', count: 28, spread: 135 },   // 开心闪耀
      'happy-rainbow': { type: 'sparkle', count: 32, spread: 145 },  // 彩虹闪耀
      // 激动系列 - 火花和星星
      'excited-explosion': { type: 'fire', count: 32, spread: 150 }, // 激动火花
      'excited-zoom': { type: 'star', count: 28, spread: 140 },      // 冲击星星
      // 惊讶系列
      'surprised-pop': { type: 'star', count: 26, spread: 135 },     // 惊讶星星
      // 愤怒系列
      'angry-rage': { type: 'fire', count: 30, spread: 140 },        // 愤怒火焰
      // 悲伤系列
      'sad-rain': { type: 'circle', count: 20, spread: 120 },        // 泪滴圆点
      // 害怕系列
      'scared-tremble': { type: 'circle', count: 15, spread: 100 },  // 颤抖圆点
      // 困惑系列
      'confused-spin': { type: 'circle', count: 22, spread: 125 },   // 困惑圆点
      // 搞笑系列
      'funny-wobble': { type: 'confetti', count: 32, spread: 145 },  // 搞笑纸屑
      'funny-cartoon': { type: 'confetti', count: 28, spread: 140 }, // 漫画纸屑
      // 酷炫系列
      'cool-neon': { type: 'circle', count: 22, spread: 125 },       // 霓虹圆点
      'cool-glitch': { type: 'circle', count: 20, spread: 115 },     // 故障圆点
    }

    if (presetParticleMap[presetId]) {
      return {
        ...presetParticleMap[presetId],
        color: colors.accent,
      }
    }

    // 否则根据情绪选择默认配置
    switch (emotion) {
      case 'love':
        return { type: 'heart' as ParticleType, color: colors.primary, count: 20, spread: 120 }
      case 'excited':
        return { type: 'fire' as ParticleType, color: colors.accent, count: 28, spread: 140 }
      case 'surprised':
        return { type: 'star' as ParticleType, color: colors.accent, count: 25, spread: 130 }
      case 'angry':
        return { type: 'fire' as ParticleType, color: colors.primary, count: 22, spread: 120 }
      case 'happy':
        return { type: 'sparkle' as ParticleType, color: colors.primary, count: 25, spread: 130 }
      case 'funny':
        return { type: 'confetti' as ParticleType, color: colors.secondary, count: 28, spread: 135 }
      case 'cool':
        return { type: 'circle' as ParticleType, color: colors.accent, count: 20, spread: 120 }
      default:
        return { type: 'circle' as ParticleType, color: colors.primary, count: 18, spread: 110 }
    }
  }, [emotion, presetId, colors])

  return (
    <ParticleSystem
      type={particleConfig.type}
      color={particleConfig.color}
      count={particleConfig.count}
      spread={particleConfig.spread}
    />
  )
})

// ============================================
// 子组件：单个字符
// ============================================

const Character = memo(function Character({ char, index, preset, scale, totalChars }: CharacterProps) {
  const randomStyle = useMemo(() => {
    const { layout } = preset
    const rotation = randomInRange(layout.randomRotation.min, layout.randomRotation.max)
    const offsetX = randomInRange(-layout.randomOffset.x, layout.randomOffset.x)
    const offsetY = randomInRange(-layout.randomOffset.y, layout.randomOffset.y)
    const charScale = randomInRange(layout.randomScale.min, layout.randomScale.max)

    return {
      rotate: rotation,
      x: offsetX * scale,
      y: offsetY * scale,
      scale: charScale,
    }
  }, [preset, scale])

  const variants = useMemo(
    () => getAnimationVariants(preset, index, totalChars),
    [preset, index, totalChars]
  )

  const loopVariants = useMemo(
    () => getLoopVariants(preset.animation.loop),
    [preset.animation.loop]
  )

  const textStyle = useMemo(() => presetToCSS(preset, scale), [preset, scale])

  if (char === ' ') {
    return <span style={{ width: '0.3em', display: 'inline-block' }}>&nbsp;</span>
  }

  return (
    <motion.span
      style={{
        ...textStyle,
        display: 'inline-block',
        position: 'relative',
        ...randomStyle,
      }}
      variants={variants}
      initial="hidden"
      animate={['visible', preset.animation.loop ? 'animate' : '']}
      exit="exit"
      {...(preset.animation.loop && loopVariants)}
    >
      {char}
    </motion.span>
  )
})

// ============================================
// 子组件：装饰元素
// ============================================

const Decoration = memo(function Decoration({ preset, textLength }: DecorationProps) {
  const { decoration } = preset
  
  if (!decoration) return null

  const emojis = decoration.items.length > 0 
    ? decoration.items 
    : DECORATION_EMOJIS[preset.emotion].slice(0, 6)

  const decorationElements = useMemo(() => {
    return emojis.map((emoji, i) => {
      let x = 0, y = 0
      const spread = textLength * 14 + 80

      switch (decoration.position) {
        case 'around':
          const angle = (i / emojis.length) * Math.PI * 2 + Math.random() * 0.3
          x = Math.cos(angle) * (spread * (0.7 + Math.random() * 0.5))
          y = Math.sin(angle) * (50 + Math.random() * 30)
          break
        case 'above':
          x = (i - emojis.length / 2) * 45 + randomInRange(-12, 12)
          y = -60 - Math.random() * 35
          break
        case 'below':
          x = (i - emojis.length / 2) * 45 + randomInRange(-12, 12)
          y = 60 + Math.random() * 35
          break
        case 'random':
          x = randomInRange(-spread, spread)
          y = randomInRange(-70, 70)
          break
      }

      return { 
        emoji, 
        x, 
        y, 
        delay: i * 0.06,
        size: 1.5 + Math.random() * 1,
        rotation: randomInRange(-25, 25),
      }
    })
  }, [emojis, decoration.position, textLength])

  return (
    <>
      {decorationElements.map(({ emoji, x, y, delay, size, rotation }, i) => (
        <motion.span
          key={i}
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            fontSize: `${size}rem`,
            pointerEvents: 'none',
            zIndex: 10,
            transformOrigin: 'center',
            filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.3))',
          }}
          initial={{ 
            opacity: 0, 
            scale: 0, 
            x, 
            y,
            rotate: rotation - 45,
          }}
          animate={{
            opacity: 1,
            scale: [0, 1.3, 1],
            x,
            y: decoration.animated ? [y, y - 15, y] : y,
            rotate: rotation,
          }}
          transition={{
            delay,
            duration: 0.5,
            type: 'spring',
            stiffness: 400,
            damping: 15,
            y: decoration.animated ? {
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            } : undefined,
          }}
        >
          {emoji}
        </motion.span>
      ))}
    </>
  )
})

// ============================================
// 主组件：情绪文字特效
// ============================================

export function EmotionTextEffect({
  text,
  preset: presetProp,
  visible = true,
  scale = 1,
  onAnimationComplete,
  className = '',
}: EmotionTextEffectProps) {
  const preset = useMemo(() => {
    if (typeof presetProp === 'string') {
      return EMOTION_TEXT_PRESETS.find(p => p.id === presetProp) || EMOTION_TEXT_PRESETS[0]
    }
    return presetProp
  }, [presetProp])

  const characters = useMemo(() => text.split(''), [text])

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: preset.layout.stagger ? preset.layout.staggerDelay / 1000 : 0,
        delayChildren: 0.1,
      },
    },
    exit: {
      opacity: 0,
      transition: {
        staggerChildren: 0.02,
        staggerDirection: -1,
      },
    },
  }

  return (
    <AnimatePresence mode="wait">
      {visible && (
        <motion.div
          className={`relative inline-flex items-center justify-center ${className}`}
          style={{ minHeight: `${preset.text.fontSize * scale * 1.5}px` }}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onAnimationComplete={onAnimationComplete}
        >
          {/* 背景特效层 */}
          <BackgroundEffectRenderer preset={preset} />
          
          {/* 粒子效果层 */}
          <ParticleEffectRenderer preset={preset} />
          
          {/* 装饰元素层 */}
          <Decoration preset={preset} textLength={text.length} />
          
          {/* 文字层 - 多层叠加效果 */}
          <div className="relative z-20 flex items-center justify-center">
            {/* 阴影层 */}
            <div className="absolute inset-0 flex items-center justify-center opacity-30">
              {characters.map((char, index) => (
                <Character
                  key={`shadow-${index}-${char}`}
                  char={char}
                  index={index}
                  preset={preset}
                  scale={scale}
                  totalChars={characters.length}
                />
              ))}
            </div>
            
            {/* 主文字层 */}
            {characters.map((char, index) => (
              <Character
                key={`main-${index}-${char}`}
                char={char}
                index={index}
                preset={preset}
                scale={scale}
                totalChars={characters.length}
              />
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ============================================
// 预设选择器组件
// ============================================

interface PresetSelectorProps {
  selectedPreset: string
  onSelect: (presetId: string) => void
  emotionFilter?: EmotionType
}

export function EmotionPresetSelector({ selectedPreset, onSelect, emotionFilter }: PresetSelectorProps) {
  const filteredPresets = useMemo(() => {
    if (emotionFilter) {
      return EMOTION_TEXT_PRESETS.filter(p => p.emotion === emotionFilter)
    }
    return EMOTION_TEXT_PRESETS
  }, [emotionFilter])

  const groupedPresets = useMemo(() => {
    const groups: Record<EmotionType, EmotionTextStyle[]> = {} as Record<EmotionType, EmotionTextStyle[]>
    filteredPresets.forEach(preset => {
      if (!groups[preset.emotion]) {
        groups[preset.emotion] = []
      }
      groups[preset.emotion].push(preset)
    })
    return groups
  }, [filteredPresets])

  return (
    <div className="space-y-4">
      {Object.entries(groupedPresets).map(([emotion, presets]) => (
        <div key={emotion}>
          <h4 className="text-sm font-medium text-surface-400 mb-2 flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: EMOTION_COLORS[emotion as EmotionType].primary }}
            />
            {getEmotionLabel(emotion as EmotionType)}
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {presets.map(preset => (
              <button
                key={preset.id}
                onClick={() => onSelect(preset.id)}
                className={`
                  p-3 rounded-lg border text-left transition-all
                  ${selectedPreset === preset.id
                    ? 'border-amber-500 bg-amber-500/10'
                    : 'border-surface-700 hover:border-surface-500 bg-surface-800/50'
                  }
                `}
              >
                <div className="text-sm font-medium text-surface-200">
                  {preset.name}
                </div>
                <div className="text-xs text-surface-500 mt-1">
                  {preset.description}
                </div>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

// ============================================
// 情绪文字预览组件
// ============================================

interface EmotionTextPreviewProps {
  presetId: string
  previewText?: string
}

export function EmotionTextPreview({ presetId, previewText = '太棒了！' }: EmotionTextPreviewProps) {
  const [key, setKey] = useState(0)

  const replay = useCallback(() => {
    setKey(k => k + 1)
  }, [])

  return (
    <div className="relative">
      <div
        className="h-48 flex items-center justify-center bg-surface-900/80 rounded-xl border border-surface-700 overflow-hidden cursor-pointer"
        onClick={replay}
      >
        <EmotionTextEffect
          key={key}
          text={previewText}
          preset={presetId}
          scale={0.7}
        />
      </div>
      
      <p className="text-xs text-surface-500 text-center mt-2">
        点击预览区域重新播放动画
      </p>
    </div>
  )
}

export default EmotionTextEffect
