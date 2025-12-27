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
  | 'screen-crack'       // 屏幕裂纹（锤击碎屏）
  | 'none'

// ============================================
// 综艺边框花字组件 - 经典综艺节目效果
// ============================================

interface VarietyFrameTextProps {
  text: string
  scale?: number
  frameColor?: string
  sunColor?: string
  textGradient?: string
  strokeColor?: string
  outerStrokeColor?: string
  className?: string
}

const VarietyFrameText = memo(function VarietyFrameText({
  text,
  scale = 1,
  frameColor = '#CC0000',       // Web安全红色
  sunColor = '#FFCC00',         // Web安全黄色
  textGradient = 'linear-gradient(180deg, #FFFFFF 0%, #CCCCFF 30%, #9999FF 50%, #6666CC 70%, #333399 100%)',  // 白到蓝紫渐变
  strokeColor = '#6633CC',      // Web安全蓝紫色描边
  outerStrokeColor = '#CC0000', // Web安全红色外描边
  className = '',
}: VarietyFrameTextProps) {
  const fontSize = 56 * scale
  const strokeWidth = 5 * scale
  const outerStrokeWidth = 3 * scale
  const framePadding = { x: 24 * scale, y: 14 * scale }
  const sunSize = 52 * scale

  return (
    <motion.div
      className={`relative inline-flex items-center ${className}`}
      initial={{ opacity: 0, scale: 0.3, y: -30 }}
      animate={{ 
        opacity: 1, 
        scale: [0.3, 1.15, 0.95, 1.05, 1],
        y: [-30, 5, -2, 0],
      }}
      transition={{
        duration: 0.5,
        times: [0, 0.35, 0.55, 0.75, 1],
        type: 'spring',
        stiffness: 500,
        damping: 15,
      }}
    >
      {/* 红色边框容器 */}
      <div
        className="relative flex items-center"
        style={{
          border: `${4 * scale}px solid ${frameColor}`,
          borderRadius: `${4 * scale}px`,
          padding: `${framePadding.y}px ${framePadding.x}px`,
          background: 'rgba(0,0,0,0.1)',
        }}
      >
        {/* 左侧太阳装饰 */}
        <motion.div
          className="absolute flex items-center justify-center"
          style={{
            left: -sunSize * 0.35,
            top: '50%',
            transform: 'translateY(-50%)',
            width: sunSize,
            height: sunSize,
            zIndex: 10,
          }}
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 400, damping: 12 }}
        >
          {/* 太阳爆炸形状 - 使用Web安全色 */}
          <svg viewBox="0 0 100 100" width={sunSize} height={sunSize}>
            <defs>
              <linearGradient id="sunGradientSafe" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFFF00" />
                <stop offset="50%" stopColor="#FFCC00" />
                <stop offset="100%" stopColor="#FF9900" />
              </linearGradient>
              <filter id="sunGlowSafe">
                <feGaussianBlur stdDeviation="2" result="blur" />
                <feFlood floodColor="#FFCC00" floodOpacity="0.7" />
                <feComposite in2="blur" operator="in" />
                <feMerge>
                  <feMergeNode />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            {/* 爆炸形状 - 尖角太阳 */}
            <motion.path
              d="M50 5 L58 30 L85 25 L65 45 L90 50 L65 55 L85 75 L58 70 L50 95 L42 70 L15 75 L35 55 L10 50 L35 45 L15 25 L42 30 Z"
              fill="url(#sunGradientSafe)"
              filter="url(#sunGlowSafe)"
              stroke="#CC6600"
              strokeWidth="2"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.3 }}
            />
            {/* 笑脸 */}
            <circle cx="40" cy="42" r="5" fill="#333333" />
            <circle cx="60" cy="42" r="5" fill="#333333" />
            <path
              d="M35 58 Q50 72 65 58"
              fill="none"
              stroke="#333333"
              strokeWidth="4"
              strokeLinecap="round"
            />
          </svg>
        </motion.div>

        {/* 文字容器 */}
        <div 
          className="relative"
          style={{ 
            marginLeft: sunSize * 0.4,
            paddingRight: 8 * scale,
          }}
        >
          {/* 多层文字效果 - 从下到上依次叠加 */}
          
          {/* 第四层：阴影效果（最底层） */}
          <span
            className="absolute"
            style={{
              fontFamily: '"Noto Sans SC", sans-serif',
              fontWeight: 900,
              fontSize: `${fontSize}px`,
              color: '#000000',
              opacity: 0.3,
              transform: `translate(${3 * scale}px, ${3 * scale}px)`,
              whiteSpace: 'nowrap',
              filter: `blur(${2 * scale}px)`,
            }}
          >
            {text}
          </span>

          {/* 第三层：红色外描边 */}
          <span
            className="absolute"
            style={{
              fontFamily: '"Noto Sans SC", sans-serif',
              fontWeight: 900,
              fontSize: `${fontSize}px`,
              color: 'transparent',
              WebkitTextStroke: `${strokeWidth + outerStrokeWidth * 2}px ${outerStrokeColor}`,
              whiteSpace: 'nowrap',
            }}
          >
            {text}
          </span>

          {/* 第二层：蓝紫色描边 */}
          <span
            className="absolute"
            style={{
              fontFamily: '"Noto Sans SC", sans-serif',
              fontWeight: 900,
              fontSize: `${fontSize}px`,
              color: 'transparent',
              WebkitTextStroke: `${strokeWidth}px ${strokeColor}`,
              whiteSpace: 'nowrap',
            }}
          >
            {text}
          </span>

          {/* 第一层：白色渐变填充（最顶层） */}
          <span
            className="relative"
            style={{
              fontFamily: '"Noto Sans SC", sans-serif',
              fontWeight: 900,
              fontSize: `${fontSize}px`,
              background: textGradient,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              whiteSpace: 'nowrap',
              display: 'inline-block',
            }}
          >
            {text}
          </span>
        </div>
      </div>

      {/* 底部白色装饰线 */}
      <motion.div
        className="absolute"
        style={{
          bottom: -10 * scale,
          left: sunSize * 0.5,
          right: 8 * scale,
          height: 4 * scale,
          background: 'linear-gradient(90deg, #FFFFFF 0%, #FFFFFF 60%, rgba(255,255,255,0.5) 85%, rgba(255,255,255,0) 100%)',
          borderRadius: 2 * scale,
          transformOrigin: 'left',
        }}
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: 1, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.3, ease: 'easeOut' }}
      />

      {/* 底部红色小圆点装饰 */}
      <motion.div
        className="absolute"
        style={{
          bottom: -12 * scale,
          left: sunSize * 0.25,
          width: 10 * scale,
          height: 10 * scale,
          borderRadius: '50%',
          background: outerStrokeColor,
          boxShadow: `0 0 ${4 * scale}px ${outerStrokeColor}`,
        }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.35, type: 'spring', stiffness: 500 }}
      />
    </motion.div>
  )
})

// ============================================
// 综艺边框花字导出组件
// ============================================

export { VarietyFrameText }

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
// 背景特效组件 - 屏幕裂纹（锤击碎屏效果）- 超真实版
// ============================================

const ScreenCrack = memo(function ScreenCrack({ color, intensity = 1 }: { color: string; intensity?: number }) {
  // 生成真实的蜘蛛网状裂纹路径
  const generateRealisticCrack = useCallback((
    startAngle: number, 
    maxLength: number, 
    depth: number = 0,
    startX: number = 0,
    startY: number = 0
  ): { main: string; branches: string[] } => {
    const points: { x: number; y: number }[] = [{ x: startX, y: startY }]
    const branches: string[] = []
    let currentAngle = startAngle
    let currentX = startX
    let currentY = startY
    
    // 裂纹段数随深度减少
    const segments = Math.max(3, Math.floor(randomInRange(6, 10) - depth * 2))
    // 总长度随深度减少
    const totalLength = maxLength * Math.pow(0.6, depth)
    
    for (let i = 0; i < segments; i++) {
      // 每段长度不均匀，模拟真实玻璃裂纹
      const segRatio = randomInRange(0.08, 0.2)
      const segLength = totalLength * segRatio
      
      // 角度变化：越远离中心，变化越小
      const distFromCenter = Math.sqrt(currentX * currentX + currentY * currentY)
      const angleVariation = randomInRange(-35, 35) * (1 - distFromCenter / 300)
      currentAngle += angleVariation
      
      // 添加微小的锯齿感
      const jitter = randomInRange(-3, 3)
      currentX += Math.cos((currentAngle * Math.PI) / 180) * segLength + jitter
      currentY += Math.sin((currentAngle * Math.PI) / 180) * segLength + jitter
      
      points.push({ x: currentX, y: currentY })
      
      // 在某些点产生分支（概率随深度降低）
      if (depth < 3 && i > 1 && Math.random() < (0.4 - depth * 0.1)) {
        const branchAngle = currentAngle + randomInRange(-70, 70)
        const branchResult = generateRealisticCrack(
          branchAngle,
          totalLength * 0.5,
          depth + 1,
          currentX,
          currentY
        )
        branches.push(branchResult.main)
        branches.push(...branchResult.branches)
      }
    }
    
    // 生成平滑的贝塞尔曲线路径
    let path = `M ${points[0].x} ${points[0].y}`
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1]
      const curr = points[i]
      // 使用二次贝塞尔曲线使裂纹更自然
      const cpX = (prev.x + curr.x) / 2 + randomInRange(-5, 5)
      const cpY = (prev.y + curr.y) / 2 + randomInRange(-5, 5)
      path += ` Q ${cpX} ${cpY} ${curr.x} ${curr.y}`
    }
    
    return { main: path, branches }
  }, [])

  // 生成同心圆裂纹（玻璃碎裂的特征）
  const generateConcentricCracks = useCallback((radius: number): string[] => {
    const paths: string[] = []
    const segments = Math.floor(randomInRange(8, 14))
    
    // 在圆周上生成不连续的弧线
    for (let i = 0; i < segments; i++) {
      const startAngle = (360 / segments) * i + randomInRange(-10, 10)
      const arcLength = randomInRange(15, 35) // 弧度
      const endAngle = startAngle + arcLength
      
      const startRad = (startAngle * Math.PI) / 180
      const endRad = (endAngle * Math.PI) / 180
      
      const x1 = Math.cos(startRad) * radius
      const y1 = Math.sin(startRad) * radius
      const x2 = Math.cos(endRad) * radius
      const y2 = Math.sin(endRad) * radius
      
      // 弧线有微小波动
      const midAngle = (startAngle + endAngle) / 2
      const midRad = (midAngle * Math.PI) / 180
      const midRadius = radius + randomInRange(-8, 8)
      const mx = Math.cos(midRad) * midRadius
      const my = Math.sin(midRad) * midRadius
      
      paths.push(`M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`)
    }
    
    return paths
  }, [])

  // 生成所有裂纹数据
  const crackData = useMemo(() => {
    const mainCracks: { path: string; width: number; delay: number; glow: number }[] = []
    const allBranches: { path: string; width: number; delay: number }[] = []
    const concentricCracks: { path: string; radius: number; delay: number }[] = []
    
    // 主放射裂纹（12-16条）
    const mainCount = Math.floor(randomInRange(12, 16) * intensity)
    for (let i = 0; i < mainCount; i++) {
      const baseAngle = (360 / mainCount) * i
      const angle = baseAngle + randomInRange(-8, 8)
      const length = randomInRange(150, 250) * intensity
      
      const result = generateRealisticCrack(angle, length, 0)
      
      mainCracks.push({
        path: result.main,
        width: randomInRange(2.5, 4.5),
        delay: i * 0.015,
        glow: randomInRange(8, 15),
      })
      
      result.branches.forEach((branch, j) => {
        allBranches.push({
          path: branch,
          width: randomInRange(1, 2.5),
          delay: i * 0.015 + 0.08 + j * 0.02,
        })
      })
    }
    
    // 同心圆裂纹（3-4圈）
    const circleCount = Math.floor(randomInRange(3, 5) * intensity)
    for (let i = 0; i < circleCount; i++) {
      const radius = 40 + i * 45
      const paths = generateConcentricCracks(radius)
      paths.forEach((path, j) => {
        concentricCracks.push({
          path,
          radius,
          delay: 0.15 + i * 0.05 + j * 0.01,
        })
      })
    }
    
    return { mainCracks, allBranches, concentricCracks }
  }, [intensity, generateRealisticCrack, generateConcentricCracks])

  // 生成真实的不规则碎片
  const shards = useMemo(() => {
    const count = Math.floor(25 * intensity)
    return Array.from({ length: count }, (_, i) => {
      const angle = randomInRange(0, 360)
      const distance = randomInRange(60, 200)
      
      // 生成不规则多边形碎片
      const vertices = Math.floor(randomInRange(4, 7))
      const size = randomInRange(8, 25)
      const points: string[] = []
      
      for (let v = 0; v < vertices; v++) {
        const vAngle = (360 / vertices) * v + randomInRange(-20, 20)
        const vRadius = size * randomInRange(0.5, 1)
        const vx = 50 + Math.cos((vAngle * Math.PI) / 180) * vRadius * (100 / size)
        const vy = 50 + Math.sin((vAngle * Math.PI) / 180) * vRadius * (100 / size)
        points.push(`${vx}% ${vy}%`)
      }
      
      return {
        angle,
        distance,
        size,
        clipPath: `polygon(${points.join(', ')})`,
        rotation: randomInRange(-180, 180),
        rotationSpeed: randomInRange(-360, 360),
        delay: randomInRange(0.05, 0.2),
        gravity: randomInRange(50, 150), // 模拟重力
        opacity: randomInRange(0.7, 1),
      }
    })
  }, [intensity])

  // 灰尘/微粒效果
  const dustParticles = useMemo(() => {
    return Array.from({ length: Math.floor(40 * intensity) }, () => ({
      angle: randomInRange(0, 360),
      distance: randomInRange(30, 180),
      size: randomInRange(2, 6),
      delay: randomInRange(0, 0.3),
      duration: randomInRange(0.8, 1.5),
    }))
  }, [intensity])

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
      {/* 冲击瞬间的屏幕变形效果 */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(circle at center, transparent 0%, rgba(0,0,0,0.3) 100%)`,
        }}
        initial={{ scale: 1 }}
        animate={{
          scale: [1, 1.02, 0.99, 1],
        }}
        transition={{
          duration: 0.15,
          ease: 'easeOut',
        }}
      />

      {/* 冲击闪光 - 多层 */}
      <motion.div
        className="absolute"
        style={{
          width: '100px',
          height: '100px',
          background: `radial-gradient(circle, #FFFFFF 0%, ${color} 30%, transparent 70%)`,
          filter: 'blur(5px)',
        }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{
          scale: [0, 3, 2],
          opacity: [0, 1, 0],
        }}
        transition={{
          duration: 0.2,
          ease: 'easeOut',
        }}
      />
      
      {/* 冲击波纹 - 多层扩散 */}
      {[0, 1, 2].map((i) => (
        <motion.div
          key={`wave-${i}`}
          className="absolute rounded-full"
          style={{
            width: '40px',
            height: '40px',
            border: `${3 - i}px solid`,
            borderColor: i === 0 ? '#FFFFFF' : color,
            boxShadow: `0 0 ${20 - i * 5}px ${color}`,
          }}
          initial={{ scale: 0, opacity: 1 }}
          animate={{
            scale: [0, 6 + i * 2, 10 + i * 3],
            opacity: [1, 0.6, 0],
          }}
          transition={{
            duration: 0.4 + i * 0.1,
            delay: i * 0.05,
            ease: 'easeOut',
          }}
        />
      ))}

      {/* 中心凹陷效果 */}
      <motion.div
        className="absolute"
        style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: `radial-gradient(circle, rgba(0,0,0,0.5) 0%, transparent 70%)`,
          boxShadow: `inset 0 0 30px rgba(0,0,0,0.8)`,
        }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{
          scale: [0, 1.5, 1],
          opacity: [0, 0.8, 0.4],
        }}
        transition={{
          duration: 0.3,
          ease: 'easeOut',
        }}
      />
      
      {/* 裂纹 SVG */}
      <svg
        className="absolute"
        width="600"
        height="600"
        viewBox="-300 -300 600 600"
        style={{ overflow: 'visible' }}
      >
        {/* 定义发光滤镜 */}
        <defs>
          <filter id="crack-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feFlood floodColor={color} floodOpacity="0.8" />
            <feComposite in2="blur" operator="in" />
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="crack-glow-strong" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feFlood floodColor="#FFFFFF" floodOpacity="0.9" />
            <feComposite in2="blur" operator="in" />
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* 同心圆裂纹 */}
        {crackData.concentricCracks.map((crack, i) => (
          <motion.path
            key={`concentric-${i}`}
            d={crack.path}
            fill="none"
            stroke={color}
            strokeWidth={randomInRange(1.5, 2.5)}
            strokeLinecap="round"
            filter="url(#crack-glow)"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{
              pathLength: [0, 1],
              opacity: [0, 0.7, 0.5],
            }}
            transition={{
              duration: 0.15,
              delay: crack.delay,
              ease: 'easeOut',
            }}
          />
        ))}
        
        {/* 主裂纹 - 带高亮边缘 */}
        {crackData.mainCracks.map((crack, i) => (
          <g key={`main-group-${i}`}>
            {/* 外层发光 */}
            <motion.path
              d={crack.path}
              fill="none"
              stroke={color}
              strokeWidth={crack.width + 4}
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ opacity: 0.3 }}
              filter="url(#crack-glow)"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{
                pathLength: [0, 1],
                opacity: [0, 0.3],
              }}
              transition={{
                duration: 0.2,
                delay: crack.delay,
                ease: 'easeOut',
              }}
            />
            {/* 主裂纹线 */}
            <motion.path
              d={crack.path}
              fill="none"
              stroke="#FFFFFF"
              strokeWidth={crack.width}
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#crack-glow-strong)"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{
                pathLength: [0, 1],
                opacity: [0, 1, 0.85],
              }}
              transition={{
                duration: 0.18,
                delay: crack.delay,
                ease: [0.22, 1, 0.36, 1],
              }}
            />
            {/* 内部深色线 - 模拟裂纹深度 */}
            <motion.path
              d={crack.path}
              fill="none"
              stroke="rgba(0,0,0,0.6)"
              strokeWidth={crack.width * 0.4}
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{
                pathLength: [0, 1],
                opacity: [0, 0.6],
              }}
              transition={{
                duration: 0.18,
                delay: crack.delay + 0.02,
                ease: 'easeOut',
              }}
            />
          </g>
        ))}
        
        {/* 分支裂纹 */}
        {crackData.allBranches.map((branch, i) => (
          <motion.path
            key={`branch-${i}`}
            d={branch.path}
            fill="none"
            stroke="#FFFFFF"
            strokeWidth={branch.width}
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ opacity: 0.7 }}
            filter="url(#crack-glow)"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{
              pathLength: [0, 1],
              opacity: [0, 0.7, 0.5],
            }}
            transition={{
              duration: 0.15,
              delay: branch.delay,
              ease: 'easeOut',
            }}
          />
        ))}
      </svg>
      
      {/* 真实碎片飞溅 - 带重力和旋转 */}
      {shards.map((shard, i) => (
        <motion.div
          key={`shard-${i}`}
          className="absolute"
          style={{
            width: `${shard.size}px`,
            height: `${shard.size}px`,
            background: `linear-gradient(135deg, #FFFFFF 0%, ${color} 40%, rgba(0,0,0,0.3) 100%)`,
            clipPath: shard.clipPath,
            boxShadow: `0 0 ${shard.size / 2}px ${color}, inset 0 0 ${shard.size / 4}px rgba(255,255,255,0.5)`,
          }}
          initial={{
            x: 0,
            y: 0,
            rotate: 0,
            scale: 0,
            opacity: 0,
          }}
          animate={{
            x: [0, Math.cos((shard.angle * Math.PI) / 180) * shard.distance],
            y: [0, Math.sin((shard.angle * Math.PI) / 180) * shard.distance + shard.gravity],
            rotate: [0, shard.rotation + shard.rotationSpeed],
            scale: [0, 1.3, 1, 0.8],
            opacity: [0, shard.opacity, shard.opacity * 0.8, 0],
          }}
          transition={{
            duration: 0.8,
            delay: shard.delay,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
        />
      ))}

      {/* 灰尘微粒 */}
      {dustParticles.map((dust, i) => (
        <motion.div
          key={`dust-${i}`}
          className="absolute rounded-full"
          style={{
            width: `${dust.size}px`,
            height: `${dust.size}px`,
            background: `radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.2) 100%)`,
          }}
          initial={{
            x: 0,
            y: 0,
            scale: 0,
            opacity: 0,
          }}
          animate={{
            x: Math.cos((dust.angle * Math.PI) / 180) * dust.distance,
            y: Math.sin((dust.angle * Math.PI) / 180) * dust.distance + 30,
            scale: [0, 1, 0.5],
            opacity: [0, 0.8, 0],
          }}
          transition={{
            duration: dust.duration,
            delay: dust.delay,
            ease: 'easeOut',
          }}
        />
      ))}
      
      {/* 持续的裂纹闪烁效果 */}
      <motion.div
        className="absolute"
        style={{
          width: '500px',
          height: '500px',
          background: `radial-gradient(circle, ${color}20 0%, transparent 50%)`,
        }}
        animate={{
          scale: [1, 1.05, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 0.4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* 边缘暗角效果 */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(circle, transparent 30%, rgba(0,0,0,0.4) 100%)`,
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.5, 0.3] }}
        transition={{ duration: 0.5 }}
      />
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
    // ========== 史诗级冲击系列 ==========
    case 'hammer-smash-in':
      // 锤击碎屏：从远处快速冲来，重重锤击屏幕 - 超真实版
      return {
        hidden: { 
          opacity: 0, 
          scale: 0.02, 
          y: -200,
          filter: 'blur(80px) brightness(0.3)',
          rotateX: 45,
          rotateZ: randomInRange(-15, 15),
        },
        visible: {
          opacity: [0, 0.5, 1, 1, 1, 1, 1],
          // 关键：冲击时的压缩和反弹
          scale: [0.02, 0.15, 0.5, 1.8, 0.75, 1.2, 0.9, 1.05, 1],
          y: [-200, -80, -20, 15, -8, 5, -2, 0],
          // 冲击时的形变 - 水平拉伸
          scaleX: [1, 1, 1, 1.3, 0.85, 1.1, 0.95, 1],
          scaleY: [1, 1, 1, 0.7, 1.15, 0.92, 1.05, 1],
          filter: [
            'blur(80px) brightness(0.3)', 
            'blur(40px) brightness(0.6)', 
            'blur(15px) brightness(1)', 
            'blur(0px) brightness(4)', // 冲击瞬间闪白
            'blur(2px) brightness(1.5)',
            'blur(0px) brightness(1.2)',
            'blur(0px) brightness(1)'
          ],
          rotateX: [45, 20, 5, -8, 3, -2, 0],
          rotateZ: [randomInRange(-15, 15), randomInRange(-8, 8), randomInRange(-3, 3), 0],
          transition: {
            ...commonTransition,
            duration: 0.6,
            times: [0, 0.15, 0.35, 0.45, 0.55, 0.7, 0.85, 0.95, 1],
            ease: [0.16, 1, 0.3, 1], // 极速冲入 + 弹性反弹
          },
        },
        exit: { 
          opacity: 0, 
          scale: 2.5, 
          y: -50,
          filter: 'blur(40px) brightness(3)', 
          transition: { duration: 0.15, ease: 'easeIn' } 
        },
      }

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

    // ========== 🎯 全新情绪动效动画 ==========
    
    // 棒棒哒 - 糖果弹跳
    case 'candy-bounce-in':
      return {
        hidden: { opacity: 0, scale: 0, y: 80, rotate: -20 },
        visible: {
          opacity: 1,
          scale: [0, 1.4, 0.8, 1.15, 0.95, 1.05, 1],
          y: [80, -30, 15, -10, 5, 0],
          rotate: [randomInRange(-30, 30), randomInRange(-15, 15), randomInRange(-5, 5), 0],
          transition: {
            ...commonTransition,
            times: [0, 0.25, 0.4, 0.55, 0.7, 0.85, 1],
            type: 'spring',
            stiffness: 450,
            damping: 12,
          },
        },
        exit: { opacity: 0, scale: 0, y: -50, rotate: 20, transition: { duration: 0.25 } },
      }

    // 太棒了 - 金色爆发
    case 'golden-explosion-in':
      return {
        hidden: { opacity: 0, scale: 0, filter: 'brightness(5) blur(20px)' },
        visible: {
          opacity: [0, 1, 1, 1],
          scale: [0, 2, 0.75, 1.15, 1],
          filter: ['brightness(5) blur(20px)', 'brightness(2.5) blur(5px)', 'brightness(1.5) blur(0px)', 'brightness(1) blur(0px)'],
          transition: {
            ...commonTransition,
            duration: 0.5,
            times: [0, 0.3, 0.6, 0.8, 1],
            ease: [0.34, 1.56, 0.64, 1],
          },
        },
        exit: { opacity: 0, scale: 1.5, filter: 'brightness(3)', transition: { duration: 0.2 } },
      }

    // 牛逼 - 火焰爆发
    case 'fire-explosion-in':
      return {
        hidden: { opacity: 0, scale: 0.1, y: 100, filter: 'brightness(3)' },
        visible: {
          opacity: 1,
          scale: [0.1, 2.2, 0.7, 1.25, 0.95, 1.1, 1],
          y: [100, -20, 10, -5, 0],
          filter: ['brightness(3)', 'brightness(2)', 'brightness(1.3)', 'brightness(1)'],
          transition: {
            ...commonTransition,
            duration: 0.45,
            times: [0, 0.2, 0.4, 0.55, 0.7, 0.85, 1],
            type: 'spring',
            stiffness: 700,
            damping: 10,
          },
        },
        exit: { opacity: 0, scale: 2, y: -30, filter: 'brightness(2)', transition: { duration: 0.15 } },
      }

    // 厉害了 - 力量冲击
    case 'power-slam-in':
      return {
        hidden: { opacity: 0, scale: 3, y: -100, filter: 'blur(15px)' },
        visible: {
          opacity: 1,
          scale: [3, 0.7, 1.3, 0.9, 1.1, 1],
          y: [-100, 10, -5, 0],
          filter: ['blur(15px)', 'blur(0px)'],
          transition: {
            ...commonTransition,
            duration: 0.4,
            times: [0, 0.25, 0.45, 0.65, 0.85, 1],
            ease: [0.25, 0.1, 0.25, 1],
          },
        },
        exit: { opacity: 0, scale: 0.5, y: 50, transition: { duration: 0.15 } },
      }

    // 太绝了 - 魔法闪耀
    case 'magic-sparkle-in':
      return {
        hidden: { opacity: 0, scale: 0.5, rotate: -10, filter: 'brightness(0.5)' },
        visible: {
          opacity: [0, 0.5, 1, 0.8, 1],
          scale: [0.5, 1.3, 0.9, 1.1, 1],
          rotate: [randomInRange(-15, 15), randomInRange(-5, 5), 0],
          filter: ['brightness(0.5)', 'brightness(2)', 'brightness(1.5)', 'brightness(1)'],
          transition: {
            ...commonTransition,
            duration: 0.55,
            times: [0, 0.3, 0.5, 0.75, 1],
          },
        },
        exit: { opacity: 0, scale: 1.3, filter: 'brightness(2)', transition: { duration: 0.25 } },
      }

    // 无情 - 冷酷冲击
    case 'cold-slam-in':
      return {
        hidden: { opacity: 0, scale: 2, x: 100 },
        visible: {
          opacity: 1,
          scale: [2, 0.8, 1.15, 1],
          x: [100, -10, 5, 0],
          transition: {
            ...commonTransition,
            duration: 0.35,
            times: [0, 0.35, 0.7, 1],
            type: 'spring',
            stiffness: 800,
            damping: 18,
          },
        },
        exit: { opacity: 0, scale: 0.5, x: -50, transition: { duration: 0.15 } },
      }

    // 卧槽 - 震惊爆发
    case 'shock-explosion-in':
      return {
        hidden: { opacity: 0, scale: 0, rotate: randomInRange(-30, 30) },
        visible: {
          opacity: 1,
          scale: [0, 2.5, 0.6, 1.4, 0.85, 1.15, 1],
          rotate: [randomInRange(-40, 40), randomInRange(-20, 20), randomInRange(-8, 8), 0],
          transition: {
            ...commonTransition,
            duration: 0.5,
            times: [0, 0.15, 0.3, 0.45, 0.6, 0.8, 1],
            type: 'spring',
            stiffness: 600,
            damping: 10,
          },
        },
        exit: { opacity: 0, scale: 0, rotate: 45, transition: { duration: 0.15 } },
      }

    // 我的天 - 从天而降
    case 'sky-drop-in':
      return {
        hidden: { opacity: 0, y: -150, scale: 0.5 },
        visible: {
          opacity: 1,
          y: [-150, 20, -10, 5, 0],
          scale: [0.5, 1.3, 0.9, 1.1, 1],
          transition: {
            ...commonTransition,
            duration: 0.55,
            times: [0, 0.35, 0.55, 0.75, 1],
            type: 'spring',
            stiffness: 400,
            damping: 12,
          },
        },
        exit: { opacity: 0, y: -80, scale: 0.5, transition: { duration: 0.25 } },
      }

    // 不会吧 - 困惑弹出
    case 'confusion-pop-in':
      return {
        hidden: { opacity: 0, scale: 0, rotate: 15 },
        visible: {
          opacity: 1,
          scale: [0, 1.3, 0.85, 1.1, 1],
          rotate: [15, -10, 5, -3, 0],
          transition: {
            ...commonTransition,
            times: [0, 0.3, 0.5, 0.7, 1],
            type: 'spring',
            stiffness: 400,
            damping: 15,
          },
        },
        exit: { opacity: 0, scale: 0, rotate: -15, transition: { duration: 0.2 } },
      }

    // 真的假的 - 怀疑滑入
    case 'doubt-slide-in':
      return {
        hidden: { opacity: 0, x: -80, rotate: -10 },
        visible: {
          opacity: 1,
          x: [-80, 10, -5, 0],
          rotate: [-10, 5, -2, 0],
          transition: {
            ...commonTransition,
            times: [0, 0.4, 0.7, 1],
            type: 'spring',
            stiffness: 350,
            damping: 18,
          },
        },
        exit: { opacity: 0, x: 50, rotate: 10, transition: { duration: 0.2 } },
      }

    // 什么 - 惊叹爆发
    case 'exclaim-burst-in':
      return {
        hidden: { opacity: 0, scale: 0.1, rotate: randomInRange(-20, 20) },
        visible: {
          opacity: 1,
          scale: [0.1, 2, 0.7, 1.3, 1],
          rotate: [randomInRange(-30, 30), randomInRange(-10, 10), 0],
          transition: {
            ...commonTransition,
            duration: 0.4,
            times: [0, 0.25, 0.5, 0.75, 1],
            type: 'spring',
            stiffness: 700,
            damping: 12,
          },
        },
        exit: { opacity: 0, scale: 2.5, transition: { duration: 0.15 } },
      }

    // 好可爱 - 可爱弹跳
    case 'cute-bounce-in':
      return {
        hidden: { opacity: 0, scale: 0, y: 60 },
        visible: {
          opacity: 1,
          scale: [0, 1.35, 0.85, 1.15, 0.95, 1.05, 1],
          y: [60, -25, 12, -8, 4, 0],
          transition: {
            ...commonTransition,
            times: [0, 0.2, 0.35, 0.5, 0.65, 0.8, 1],
            type: 'spring',
            stiffness: 400,
            damping: 10,
          },
        },
        exit: { opacity: 0, scale: 0, y: -40, transition: { duration: 0.25 } },
      }

    // 萌萌哒 - 萌系弹出
    case 'moe-pop-in':
      return {
        hidden: { opacity: 0, scale: 0, rotate: -15 },
        visible: {
          opacity: 1,
          scale: [0, 1.4, 0.8, 1.15, 1],
          rotate: [randomInRange(-20, 20), randomInRange(-8, 8), 0],
          transition: {
            ...commonTransition,
            times: [0, 0.3, 0.5, 0.75, 1],
            type: 'spring',
            stiffness: 450,
            damping: 12,
          },
        },
        exit: { opacity: 0, scale: 0, rotate: 15, transition: { duration: 0.2 } },
      }

    // 太甜了 - 甜蜜洒落
    case 'sweet-rain-in':
      return {
        hidden: { opacity: 0, y: -80, scale: 0.6 },
        visible: {
          opacity: 1,
          y: [-80, 15, -8, 4, 0],
          scale: [0.6, 1.2, 0.9, 1.1, 1],
          transition: {
            ...commonTransition,
            times: [0, 0.35, 0.55, 0.75, 1],
            type: 'spring',
            stiffness: 350,
            damping: 15,
          },
        },
        exit: { opacity: 0, y: 50, scale: 0.6, transition: { duration: 0.25 } },
      }

    // 爱你 - 心形爆发
    case 'heart-burst-in':
      return {
        hidden: { opacity: 0, scale: 0 },
        visible: {
          opacity: 1,
          scale: [0, 1.5, 0.75, 1.2, 0.9, 1.1, 1],
          transition: {
            ...commonTransition,
            times: [0, 0.2, 0.35, 0.5, 0.65, 0.8, 1],
            ease: 'easeOut',
          },
        },
        exit: { opacity: 0, scale: 1.5, filter: 'blur(10px)', transition: { duration: 0.3 } },
      }

    // 笑死我了 - 笑到抖动
    case 'laugh-shake-in':
      return {
        hidden: { opacity: 0, y: 100, rotate: randomInRange(-25, 25) },
        visible: {
          opacity: 1,
          y: [100, -20, 10, -5, 0],
          rotate: [randomInRange(-35, 35), randomInRange(-15, 15), randomInRange(-5, 5), 0],
          transition: {
            ...commonTransition,
            times: [0, 0.3, 0.5, 0.75, 1],
            type: 'spring',
            stiffness: 400,
            damping: 10,
          },
        },
        exit: { opacity: 0, y: -50, rotate: 20, transition: { duration: 0.2 } },
      }

    // 绷不住了 - 崩溃入场
    case 'collapse-in':
      return {
        hidden: { opacity: 0, scale: 1.5, y: -50 },
        visible: {
          opacity: 1,
          scale: [1.5, 0.8, 1.2, 0.95, 1.05, 1],
          y: [-50, 15, -8, 4, 0],
          rotate: [0, randomInRange(-10, 10), randomInRange(-5, 5), 0],
          transition: {
            ...commonTransition,
            times: [0, 0.2, 0.4, 0.6, 0.8, 1],
            type: 'spring',
            stiffness: 350,
            damping: 12,
          },
        },
        exit: { opacity: 0, scale: 0.5, y: 30, transition: { duration: 0.2 } },
      }

    // 阴吹丝汀 - 故障弹出
    case 'glitch-pop-in':
      return {
        hidden: { opacity: 0, scale: 0.8, x: -20 },
        visible: {
          opacity: [0, 1, 0.8, 1, 0.9, 1],
          scale: [0.8, 1.1, 0.95, 1.05, 1],
          x: [-20, 10, -5, 3, 0],
          transition: {
            ...commonTransition,
            times: [0, 0.25, 0.4, 0.6, 0.8, 1],
          },
        },
        exit: { opacity: 0, scale: 0.8, x: 20, transition: { duration: 0.2 } },
      }

    // 累了 - 疲惫下落
    case 'tired-drop-in':
      return {
        hidden: { opacity: 0, y: -40, scale: 0.9 },
        visible: {
          opacity: [0, 0.7, 1],
          y: [-40, 5, 0],
          scale: [0.9, 1.02, 1],
          transition: {
            ...commonTransition,
            duration: 0.7,
            times: [0, 0.5, 1],
            ease: 'easeOut',
          },
        },
        exit: { opacity: 0, y: 30, transition: { duration: 0.3 } },
      }

    // 超燃 - 火焰爆发
    case 'fire-burst-in':
      return {
        hidden: { opacity: 0, scale: 0, y: 80, filter: 'brightness(3)' },
        visible: {
          opacity: 1,
          scale: [0, 2.5, 0.65, 1.35, 0.9, 1.15, 1],
          y: [80, -15, 8, -4, 0],
          filter: ['brightness(3)', 'brightness(2)', 'brightness(1.4)', 'brightness(1)'],
          transition: {
            ...commonTransition,
            duration: 0.45,
            times: [0, 0.2, 0.35, 0.5, 0.65, 0.8, 1],
            type: 'spring',
            stiffness: 650,
            damping: 10,
          },
        },
        exit: { opacity: 0, scale: 2, filter: 'brightness(2)', transition: { duration: 0.15 } },
      }

    // 无敌 - 王者降临
    case 'king-descend-in':
      return {
        hidden: { opacity: 0, y: -120, scale: 0.3, filter: 'brightness(3)' },
        visible: {
          opacity: 1,
          y: [-120, 10, -5, 0],
          scale: [0.3, 1.4, 0.9, 1.1, 1],
          filter: ['brightness(3)', 'brightness(1.8)', 'brightness(1.2)', 'brightness(1)'],
          transition: {
            ...commonTransition,
            duration: 0.55,
            times: [0, 0.4, 0.7, 0.9, 1],
            ease: [0.34, 1.56, 0.64, 1],
          },
        },
        exit: { opacity: 0, y: -60, scale: 0.5, transition: { duration: 0.25 } },
      }

    // 高能 - 能量爆发
    case 'energy-burst-in':
      return {
        hidden: { opacity: 0, scale: 0, filter: 'brightness(4) blur(15px)' },
        visible: {
          opacity: 1,
          scale: [0, 2.2, 0.7, 1.3, 1],
          filter: ['brightness(4) blur(15px)', 'brightness(2) blur(5px)', 'brightness(1.3) blur(0px)', 'brightness(1) blur(0px)'],
          transition: {
            ...commonTransition,
            duration: 0.4,
            times: [0, 0.25, 0.5, 0.75, 1],
            type: 'spring',
            stiffness: 700,
            damping: 12,
          },
        },
        exit: { opacity: 0, scale: 2, filter: 'brightness(2)', transition: { duration: 0.15 } },
      }

    // 扎心了 - 心碎入场
    case 'heartbreak-in':
      return {
        hidden: { opacity: 0, scale: 1.3, y: -30 },
        visible: {
          opacity: [0, 0.8, 1],
          scale: [1.3, 0.9, 1.05, 1],
          y: [-30, 8, -3, 0],
          transition: {
            ...commonTransition,
            duration: 0.6,
            times: [0, 0.4, 0.7, 1],
            ease: 'easeOut',
          },
        },
        exit: { opacity: 0, scale: 0.8, y: 20, transition: { duration: 0.3 } },
      }

    // 难了 - 沉重下落
    case 'heavy-drop-in':
      return {
        hidden: { opacity: 0, y: -60 },
        visible: {
          opacity: [0, 0.6, 1],
          y: [-60, 8, 0],
          transition: {
            ...commonTransition,
            duration: 0.7,
            times: [0, 0.5, 1],
            ease: [0.4, 0, 0.2, 1],
          },
        },
        exit: { opacity: 0, y: 40, transition: { duration: 0.35 } },
      }

    // 服了 - 翻白眼入场
    case 'eye-roll-in':
      return {
        hidden: { opacity: 0, y: 40, rotate: 10 },
        visible: {
          opacity: 1,
          y: [40, -10, 5, 0],
          rotate: [10, -5, 2, 0],
          transition: {
            ...commonTransition,
            times: [0, 0.4, 0.7, 1],
            type: 'spring',
            stiffness: 300,
            damping: 18,
          },
        },
        exit: { opacity: 0, y: -30, rotate: -10, transition: { duration: 0.25 } },
      }

    // 下头 - 向下滑落
    case 'fall-down-in':
      return {
        hidden: { opacity: 0, y: -50 },
        visible: {
          opacity: [0, 1, 0.9, 1],
          y: [-50, 15, -5, 0],
          scale: [1, 0.95, 1.02, 1],
          transition: {
            ...commonTransition,
            duration: 0.55,
            times: [0, 0.45, 0.75, 1],
            ease: 'easeOut',
          },
        },
        exit: { opacity: 0, y: 50, transition: { duration: 0.3 } },
      }

    // 破防了 - 破裂入场
    case 'crack-break-in':
      return {
        hidden: { opacity: 0, scale: 1.2 },
        visible: {
          opacity: [0, 0.7, 1, 0.85, 1],
          scale: [1.2, 0.85, 1.1, 0.95, 1],
          transition: {
            ...commonTransition,
            duration: 0.55,
            times: [0, 0.3, 0.5, 0.75, 1],
          },
        },
        exit: { opacity: 0, scale: 0.8, transition: { duration: 0.25 } },
      }

    // 综艺边框 - 弹性入场
    case 'variety-frame-in':
      return {
        hidden: { opacity: 0, scale: 0.3, y: -30 },
        visible: {
          opacity: 1,
          scale: [0.3, 1.15, 0.95, 1.05, 1],
          y: [-30, 5, -2, 0],
          transition: {
            ...commonTransition,
            duration: 0.5,
            times: [0, 0.35, 0.55, 0.75, 1],
            type: 'spring',
            stiffness: 500,
            damping: 15,
          },
        },
        exit: { opacity: 0, scale: 0.8, y: 20, transition: { duration: 0.2 } },
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
    // 碎裂震动 - 模拟屏幕被锤碎后的不稳定震动（超真实版）
    case 'crack-shake':
      return {
        animate: {
          // 不规则的微震动，模拟结构不稳定
          x: [-3, 4, -2, 5, -4, 2, -1, 3, 0],
          y: [-2, 3, -4, 2, -1, 3, -2, 1, 0],
          // 轻微的倾斜，像要倒塌
          rotate: [-0.8, 1.2, -0.5, 0.8, -1, 0.6, -0.3, 0.4, 0],
          // 呼吸感的缩放
          scale: [1, 1.015, 0.99, 1.02, 0.995, 1.01, 1],
          // 裂纹闪烁效果
          filter: [
            'brightness(1) contrast(1)',
            'brightness(1.15) contrast(1.05)',
            'brightness(0.98) contrast(1)',
            'brightness(1.1) contrast(1.02)',
            'brightness(1) contrast(1)',
          ],
          transition: {
            duration: 0.25,
            repeat: Infinity,
            repeatDelay: 0.15,
            ease: 'easeInOut',
          },
        },
      }

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

    // ========== 🎯 全新情绪动效循环动画 ==========
    
    // 棒棒哒 - 可爱摇摆
    case 'cute-wiggle':
      return {
        animate: {
          rotate: [-8, 8, -8],
          y: [-3, 3, -3],
          scale: [1, 1.03, 1, 1.02, 1],
          transition: {
            duration: 0.4,
            repeat: Infinity,
            repeatType: 'reverse',
            ease: 'easeInOut',
          },
        },
      }

    // 太棒了 - 金光闪烁
    case 'golden-shimmer':
      return {
        animate: {
          filter: ['brightness(1)', 'brightness(1.6)', 'brightness(1.2)', 'brightness(1.4)', 'brightness(1)'],
          scale: [1, 1.04, 1, 1.03, 1],
          transition: {
            duration: 0.8,
            repeat: Infinity,
            ease: 'easeInOut',
          },
        },
      }

    // 牛逼 - 火焰闪烁
    case 'fire-flicker':
      return {
        animate: {
          x: [-3, 3, -2, 4, -3, 2, 0],
          y: [-2, 2, -1, 3, -2, 1, 0],
          scale: [1, 1.04, 1, 1.03, 1.02, 1],
          filter: ['brightness(1)', 'brightness(1.3)', 'brightness(1.1)', 'brightness(1.2)', 'brightness(1)'],
          transition: {
            duration: 0.25,
            repeat: Infinity,
            ease: 'linear',
          },
        },
      }

    // 太绝了 - 魔法发光
    case 'magic-glow':
      return {
        animate: {
          filter: ['brightness(1)', 'brightness(1.4)', 'brightness(1.1)', 'brightness(1.3)', 'brightness(1)'],
          scale: [1, 1.03, 1, 1.02, 1],
          transition: {
            duration: 1.2,
            repeat: Infinity,
            ease: 'easeInOut',
          },
        },
      }

    // 无情 - 冷酷脉动
    case 'cold-pulse':
      return {
        animate: {
          scale: [1, 1.05, 1],
          filter: ['brightness(1)', 'brightness(1.2)', 'brightness(1)'],
          transition: {
            duration: 0.6,
            repeat: Infinity,
            ease: 'easeInOut',
          },
        },
      }

    // 卧槽 - 震惊颤抖
    case 'shock-tremble':
      return {
        animate: {
          x: [-5, 6, -4, 5, -6, 4, -3, 5, 0],
          y: [-3, 4, -2, 3, -4, 2, 0],
          rotate: [-2, 3, -1, 2, -3, 1, 0],
          scale: [1, 1.03, 0.98, 1.02, 1],
          transition: {
            duration: 0.2,
            repeat: Infinity,
            ease: 'linear',
          },
        },
      }

    // 我的天 - 浮动抖动
    case 'float-shake':
      return {
        animate: {
          y: [-4, 4, -4],
          rotate: [-3, 3, -3],
          transition: {
            duration: 0.5,
            repeat: Infinity,
            repeatType: 'reverse',
            ease: 'easeInOut',
          },
        },
      }

    // 不会吧 - 摇摆抖动
    case 'wobble-shake':
      return {
        animate: {
          rotate: [-5, 5, -3, 4, -5],
          x: [-2, 2, -1, 2, -2],
          transition: {
            duration: 0.4,
            repeat: Infinity,
            repeatType: 'reverse',
          },
        },
      }

    // 真的假的 - 倾斜抖动
    case 'tilt-shake':
      return {
        animate: {
          rotate: [-4, 4, -2, 3, -4],
          transition: {
            duration: 0.5,
            repeat: Infinity,
            repeatType: 'reverse',
          },
        },
      }

    // 好可爱 - 可爱漂浮
    case 'cute-float':
      return {
        animate: {
          y: [-5, 5, -5],
          rotate: [-3, 3, -3],
          scale: [1, 1.02, 1],
          transition: {
            duration: 0.6,
            repeat: Infinity,
            repeatType: 'reverse',
            ease: 'easeInOut',
          },
        },
      }

    // 萌萌哒 - 萌系摇摆
    case 'moe-wiggle':
      return {
        animate: {
          rotate: [-10, 10, -10],
          y: [-3, 3, -3],
          transition: {
            duration: 0.35,
            repeat: Infinity,
            repeatType: 'reverse',
          },
        },
      }

    // 太甜了 - 甜蜜弹跳
    case 'sweet-bounce':
      return {
        animate: {
          y: [-4, 4, -4],
          scale: [1, 1.03, 1],
          transition: {
            duration: 0.45,
            repeat: Infinity,
            repeatType: 'reverse',
            ease: 'easeInOut',
          },
        },
      }

    // 爱你 - 强力心跳
    case 'heartbeat-strong':
      return {
        animate: {
          scale: [1, 1.15, 1, 1.2, 1],
          filter: ['brightness(1)', 'brightness(1.3)', 'brightness(1)', 'brightness(1.4)', 'brightness(1)'],
          transition: {
            duration: 0.6,
            repeat: Infinity,
            times: [0, 0.25, 0.5, 0.75, 1],
          },
        },
      }

    // 笑死我了 - 笑到颤抖
    case 'laugh-tremor':
      return {
        animate: {
          x: [-4, 5, -3, 6, -5, 4, 0],
          y: [-2, 3, -1, 4, -3, 2, 0],
          rotate: [-6, 8, -4, 6, -8, 5, 0],
          transition: {
            duration: 0.18,
            repeat: Infinity,
            ease: 'linear',
          },
        },
      }

    // 绷不住了 - 剧烈摇摆
    case 'wobble-intense':
      return {
        animate: {
          rotate: [-12, 12, -8, 10, -12],
          y: [-4, 4, -2, 3, -4],
          transition: {
            duration: 0.25,
            repeat: Infinity,
            repeatType: 'reverse',
          },
        },
      }

    // 阴吹丝汀 - 轻微故障
    case 'subtle-glitch':
      return {
        animate: {
          x: [0, -2, 0, 2, 0, -1, 0],
          opacity: [1, 0.9, 1, 0.95, 1],
          transition: {
            duration: 0.3,
            repeat: Infinity,
            repeatDelay: 0.8,
          },
        },
      }

    // 累了 - 缓慢摇摆
    case 'sway-slow':
      return {
        animate: {
          rotate: [-2, 2, -2],
          y: [-2, 2, -2],
          transition: {
            duration: 1.2,
            repeat: Infinity,
            repeatType: 'reverse',
            ease: 'easeInOut',
          },
        },
      }

    // 超燃 - 火焰舞动
    case 'flame-dance':
      return {
        animate: {
          x: [-4, 4, -3, 5, -4, 3, 0],
          y: [-3, 3, -2, 4, -3, 2, 0],
          scale: [1, 1.05, 1, 1.04, 1.02, 1],
          filter: ['brightness(1)', 'brightness(1.4)', 'brightness(1.1)', 'brightness(1.3)', 'brightness(1)'],
          transition: {
            duration: 0.22,
            repeat: Infinity,
            ease: 'linear',
          },
        },
      }

    // 无敌 - 王冠发光
    case 'crown-glow':
      return {
        animate: {
          filter: ['brightness(1)', 'brightness(1.5)', 'brightness(1.2)', 'brightness(1.4)', 'brightness(1)'],
          scale: [1, 1.04, 1, 1.03, 1],
          transition: {
            duration: 1,
            repeat: Infinity,
            ease: 'easeInOut',
          },
        },
      }

    // 高能 - 电流脉动
    case 'electric-pulse':
      return {
        animate: {
          filter: ['brightness(1)', 'brightness(1.5)', 'brightness(1)', 'brightness(1.3)', 'brightness(1)'],
          scale: [1, 1.06, 1, 1.04, 1],
          x: [-2, 2, -1, 2, 0],
          transition: {
            duration: 0.35,
            repeat: Infinity,
            ease: 'linear',
          },
        },
      }

    // 扎心了 - 悲伤脉动
    case 'sad-pulse':
      return {
        animate: {
          scale: [1, 0.98, 1, 0.99, 1],
          opacity: [1, 0.9, 1, 0.95, 1],
          transition: {
            duration: 1,
            repeat: Infinity,
            ease: 'easeInOut',
          },
        },
      }

    // 难了 - 忧郁摇摆
    case 'melancholy-sway':
      return {
        animate: {
          rotate: [-2, 2, -2],
          y: [-1, 2, -1],
          transition: {
            duration: 1.5,
            repeat: Infinity,
            repeatType: 'reverse',
            ease: 'easeInOut',
          },
        },
      }

    // 服了 - 恼怒抖动
    case 'annoyed-shake':
      return {
        animate: {
          x: [-2, 2, -2],
          rotate: [-1, 1, -1],
          transition: {
            duration: 0.5,
            repeat: Infinity,
            repeatType: 'reverse',
          },
        },
      }

    // 下头 - 失望抖动
    case 'disappointed-shake':
      return {
        animate: {
          y: [0, 2, 0],
          rotate: [-1, 1, -1],
          transition: {
            duration: 0.6,
            repeat: Infinity,
            repeatType: 'reverse',
          },
        },
      }

    // 破防了 - 脆弱抖动
    case 'vulnerable-shake':
      return {
        animate: {
          x: [-2, 2, -1, 2, -2],
          scale: [1, 0.99, 1, 0.995, 1],
          transition: {
            duration: 0.4,
            repeat: Infinity,
            repeatType: 'reverse',
          },
        },
      }

    // 综艺边框 - 轻微弹跳
    case 'subtle-bounce':
      return {
        animate: {
          y: [0, -3, 0],
          scale: [1, 1.02, 1],
          transition: {
            duration: 1.5,
            repeat: Infinity,
            repeatType: 'reverse',
            ease: 'easeInOut',
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
    // 史诗级冲击系列 - 屏幕裂纹
    'hammer-smash': 'screen-crack',         // 锤击碎屏
    'epic-impact': 'screen-crack',          // 毁天灭地
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
    
    // ========== 🎯 全新情绪动效背景映射 ==========
    // 赞美夸赞系列
    'praise-bangbangda': 'rainbow-burst',   // 棒棒哒 - 彩虹爆发
    'praise-taibangle': 'sparkle-field',    // 太棒了 - 星光场
    'praise-niubi': 'fire-aura',            // 牛逼 - 火焰光环
    'praise-lihai': 'explosion-lines',      // 厉害了 - 爆炸集中线
    'praise-taijiule': 'sparkle-field',     // 太绝了 - 星光场
    'praise-wuqing': 'speed-lines',         // 无情 - 速度线
    // 震惊反应系列
    'shock-wocao': 'radial-burst',          // 卧槽 - 放射光芒
    'shock-wodetian': 'shockwave',          // 我的天 - 冲击波
    'shock-buhuiba': 'radial-burst',        // 不会吧 - 放射光芒
    'shock-zhende': 'radial-burst',         // 真的假的 - 放射光芒
    'shock-shenme': 'explosion-lines',      // 什么 - 爆炸集中线
    // 可爱萌系列
    'cute-haokekei': 'heart-burst',         // 好可爱 - 心形爆发
    'cute-mengmengda': 'sparkle-field',     // 萌萌哒 - 星光场
    'cute-taitianle': 'heart-burst',        // 太甜了 - 心形爆发
    'cute-aini': 'heart-burst',             // 爱你 - 心形爆发
    // 搞笑爆笑系列
    'funny-xiaosile': 'comic-bubble',       // 笑死我了 - 漫画对话框
    'funny-bengbuzhule': 'comic-bubble',    // 绷不住了 - 漫画对话框
    'funny-yinchui': 'speed-lines',         // 阴吹丝汀 - 速度线
    'funny-leile': 'glow-aura',             // 累了 - 光晕
    // 超燃系列
    'fire-chaoran': 'fire-aura',            // 超燃 - 火焰光环
    'fire-wudi': 'sparkle-field',           // 无敌 - 星光场
    'fire-gaoneng': 'explosion-lines',      // 高能 - 爆炸集中线
    // 扎心系列
    'sad-zhaxin': 'glow-aura',              // 扎心了 - 光晕
    'sad-nanle': 'glow-aura',               // 难了 - 光晕
    // 吐槽系列
    'roast-wule': 'glow-aura',              // 服了 - 光晕
    'roast-xiatou': 'speed-lines',          // 下头 - 速度线
    'roast-emole': 'glow-aura',             // 破防了 - 光晕
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
  if (animationType.includes('hammer') || animationType.includes('smash')) {
    return { type: 'screen-crack', color: colors.primary, intensity: 1.3 }
  }
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
    case 'screen-crack':
      return <ScreenCrack color={effectConfig.color} intensity={effectConfig.intensity || 1.2} />
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
      // 史诗级冲击系列 - 大量火花和碎片
      'hammer-smash': { type: 'fire', count: 50, spread: 200 },       // 锤击火花爆发
      'epic-impact': { type: 'fire', count: 60, spread: 220 },        // 毁灭级火花
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
  
  const decoItems = decoration?.items
  const emojis = (decoItems?.length ?? 0) > 0
    ? decoItems!
    : DECORATION_EMOJIS[preset.emotion].slice(0, 6)

  const decorationElements = useMemo(() => {
    if (!decoration) return []
    
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
  }, [emojis, decoration?.position, textLength])
  
  if (!decoration) return null

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
