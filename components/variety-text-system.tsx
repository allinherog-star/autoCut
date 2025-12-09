'use client'

import { memo, useMemo, useEffect, useState, ReactNode } from 'react'
import { motion, Variants } from 'framer-motion'

// 稳定的伪随机数生成器
function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000
  return x - Math.floor(x)
}

// ============================================
// Web 安全色配置
// ============================================
const COLORS = {
  // 主色调 - 明黄系
  yellow: '#FFCC00',
  yellowLight: '#FFFF00',
  yellowDark: '#FF9900',
  
  // 蓝紫系
  blue: '#0033CC',
  blueDark: '#000066',
  blueLight: '#3366FF',
  purple: '#6600CC',
  purpleLight: '#9933FF',
  purpleDark: '#330066',
  
  // 辅助色
  white: '#FFFFFF',
  pink: '#FF0099',
  cyan: '#00FFFF',
  orange: '#FF6600',
  green: '#00FF66',
  red: '#FF3333',
  
  // 背景色
  bgPurple: 'linear-gradient(135deg, #6600CC 0%, #330066 50%, #000066 100%)',
  bgBlue: 'linear-gradient(135deg, #0033CC 0%, #000066 50%, #330066 100%)',
  bgPink: 'linear-gradient(135deg, #FF0099 0%, #6600CC 50%, #330066 100%)',
}

// 表情包和装饰元素
const EMOJIS = {
  laugh: ['😂', '🤣', '😆', '😹', '🤪'],
  celebrate: ['🎉', '🎊', '✨', '💫', '⭐'],
  reaction: ['💥', '❗', '⚡', '🔥', '💯'],
  cute: ['🌟', '💖', '🌈', '🎀', '🍭'],
}

// ============================================
// 通用装饰组件
// ============================================

// 放射线背景
const RadialBurst = memo(function RadialBurst({ 
  color1 = COLORS.purpleLight, 
  color2 = COLORS.purple,
  rayCount = 16,
}: { 
  color1?: string
  color2?: string
  rayCount?: number 
}) {
  return (
    <motion.div
      className="absolute inset-0 overflow-hidden"
      initial={{ opacity: 0, rotate: -15 }}
      animate={{ opacity: 1, rotate: 0 }}
      transition={{ duration: 0.4 }}
    >
      <svg viewBox="0 0 400 400" className="w-full h-full">
        {Array.from({ length: rayCount }).map((_, i) => (
          <motion.polygon
            key={i}
            points="200,200 190,0 210,0"
            fill={i % 2 === 0 ? color1 : color2}
            opacity={i % 2 === 0 ? 0.4 : 0.25}
            style={{
              transformOrigin: '200px 200px',
              transform: `rotate(${(360 / rayCount) * i}deg)`,
            }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: i * 0.015, duration: 0.25 }}
          />
        ))}
      </svg>
    </motion.div>
  )
})

// 速度线
const SpeedLines = memo(function SpeedLines({ 
  count = 12,
  colors = [COLORS.yellow, COLORS.pink, COLORS.cyan, COLORS.white],
}: {
  count?: number
  colors?: string[]
}) {
  const lines = useMemo(() => 
    Array.from({ length: count }).map((_, i) => ({
      id: i,
      angle: seededRandom(i * 6 + 1) * 360,
      length: 60 + seededRandom(i * 6 + 2) * 100,
      width: 2 + seededRandom(i * 6 + 3) * 4,
      delay: seededRandom(i * 6 + 4) * 0.3,
      color: colors[Math.floor(seededRandom(i * 6 + 5) * colors.length)],
      distance: 80 + seededRandom(i * 6 + 6) * 60,
    })), [count, colors]
  )
  
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {lines.map((line) => (
        <motion.div
          key={line.id}
          className="absolute left-1/2 top-1/2"
          style={{
            width: line.length,
            height: line.width,
            background: `linear-gradient(90deg, ${line.color} 0%, transparent 100%)`,
            transformOrigin: 'left center',
            borderRadius: line.width,
            filter: 'blur(0.5px)',
          }}
          initial={{ opacity: 0, scale: 0, rotate: line.angle, x: 0, y: 0 }}
          animate={{ 
            opacity: [0, 1, 0],
            scale: [0, 1, 1.1],
            x: Math.cos(line.angle * Math.PI / 180) * line.distance,
            y: Math.sin(line.angle * Math.PI / 180) * line.distance,
          }}
          transition={{ delay: 0.4 + line.delay, duration: 0.5, ease: 'easeOut' }}
        />
      ))}
    </div>
  )
})

// 彩纸粒子
const Confetti = memo(function Confetti({ count = 20 }: { count?: number }) {
  const confettiColors = [COLORS.yellow, COLORS.pink, COLORS.cyan, COLORS.orange, COLORS.green, COLORS.white]
  const particles = useMemo(() =>
    Array.from({ length: count }).map((_, i) => ({
      id: i,
      x: (seededRandom(i * 7 + 100) - 0.5) * 250,
      y: (seededRandom(i * 7 + 101) - 0.5) * 180,
      rotation: seededRandom(i * 7 + 102) * 360,
      size: 5 + seededRandom(i * 7 + 103) * 8,
      color: confettiColors[Math.floor(seededRandom(i * 7 + 104) * 6)],
      delay: seededRandom(i * 7 + 105) * 0.3,
      shape: seededRandom(i * 7 + 106) > 0.5 ? 'rect' : 'circle',
    })), [count]
  )
  
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute left-1/2 top-1/2"
          style={{
            width: p.size,
            height: p.shape === 'rect' ? p.size * 0.5 : p.size,
            background: p.color,
            borderRadius: p.shape === 'circle' ? '50%' : '2px',
          }}
          initial={{ opacity: 0, scale: 0, x: 0, y: 0, rotate: 0 }}
          animate={{ 
            opacity: [0, 1, 1, 0],
            scale: [0, 1, 1, 0.5],
            x: p.x,
            y: [0, p.y - 40, p.y],
            rotate: p.rotation,
          }}
          transition={{ delay: 0.5 + p.delay, duration: 1, ease: 'easeOut' }}
        />
      ))}
    </div>
  )
})

// 飞入表情
const FlyingEmojis = memo(function FlyingEmojis({ 
  emojis = EMOJIS.laugh,
  positions = 'around',
}: {
  emojis?: string[]
  positions?: 'around' | 'top' | 'sides'
}) {
  const emojiData = useMemo(() => {
    const basePositions = positions === 'around' ? [
      { startX: -180, startY: -80, endX: -100, endY: -50 },
      { startX: 180, startY: -80, endX: 100, endY: -50 },
      { startX: -180, startY: 80, endX: -100, endY: 50 },
      { startX: 180, startY: 80, endX: 100, endY: 50 },
      { startX: 0, startY: -120, endX: 0, endY: -70 },
    ] : positions === 'top' ? [
      { startX: -80, startY: -120, endX: -60, endY: -60 },
      { startX: 80, startY: -120, endX: 60, endY: -60 },
      { startX: 0, startY: -140, endX: 0, endY: -70 },
    ] : [
      { startX: -180, startY: 0, endX: -120, endY: 0 },
      { startX: 180, startY: 0, endX: 120, endY: 0 },
    ]
    
    return basePositions.map((pos, i) => ({
      ...pos,
      emoji: emojis[i % emojis.length],
      delay: 0.15 + i * 0.05,
      size: 24 + seededRandom(i + 200) * 12,
    }))
  }, [emojis, positions])
  
  return (
    <div className="absolute inset-0 pointer-events-none">
      {emojiData.map((e, i) => (
        <motion.div
          key={i}
          className="absolute left-1/2 top-1/2"
          style={{ fontSize: e.size, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}
          initial={{ opacity: 0, x: e.startX, y: e.startY, scale: 0, rotate: -20 }}
          animate={{ 
            opacity: 1,
            x: e.endX,
            y: e.endY,
            scale: [0, 1.2, 1],
            rotate: [-20, 5, 0],
          }}
          transition={{ delay: e.delay, duration: 0.4, type: 'spring', stiffness: 300, damping: 15 }}
        >
          {e.emoji}
        </motion.div>
      ))}
    </div>
  )
})

// 漫画装饰元素（星星、闪电、感叹号）
const ComicDecorations = memo(function ComicDecorations() {
  const decorations = [
    { type: '⭐', x: -130, y: -40, size: 20, delay: 0.6 },
    { type: '⚡', x: 130, y: -30, size: 22, delay: 0.65 },
    { type: '❗', x: -120, y: 40, size: 18, delay: 0.7 },
    { type: '💥', x: 125, y: 35, size: 20, delay: 0.75 },
    { type: '✨', x: 0, y: -80, size: 16, delay: 0.8 },
  ]
  
  return (
    <div className="absolute inset-0 pointer-events-none">
      {decorations.map((d, i) => (
        <motion.div
          key={i}
          className="absolute left-1/2 top-1/2"
          style={{ fontSize: d.size, x: d.x, y: d.y }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: [0, 1.3, 1] }}
          transition={{ delay: d.delay, duration: 0.3, type: 'spring' }}
        >
          {d.type}
        </motion.div>
      ))}
    </div>
  )
})

// ============================================
// 爆炸形状底板
// ============================================
const ExplosionPlate = memo(function ExplosionPlate({ 
  color = COLORS.yellow,
  width = 280,
  height = 100,
}: {
  color?: string
  width?: number
  height?: number
}) {
  return (
    <motion.div
      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
      style={{ width, height }}
      initial={{ opacity: 0, scale: 0, rotate: -5 }}
      animate={{ 
        opacity: 1,
        scale: [0, 1.1, 0.95, 1],
        rotate: [-5, 3, -1, 0],
      }}
      transition={{ delay: 0.3, duration: 0.4, type: 'spring', stiffness: 400, damping: 12 }}
    >
      <svg viewBox="0 0 120 60" className="w-full h-full" preserveAspectRatio="none">
        <defs>
          <linearGradient id="plateGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={COLORS.yellowLight} />
            <stop offset="50%" stopColor={color} />
            <stop offset="100%" stopColor={COLORS.yellowDark} />
          </linearGradient>
          <filter id="plateShadow">
            <feDropShadow dx="2" dy="4" stdDeviation="3" floodColor="#000" floodOpacity="0.35" />
          </filter>
        </defs>
        <path
          d="M10,30 Q5,20 15,15 Q10,10 20,8 Q18,3 30,5 Q35,0 45,3 Q55,0 65,3 Q75,0 85,5 Q95,2 100,8 Q108,5 110,15 Q118,18 115,30 Q120,40 110,45 Q115,52 100,52 Q105,58 90,57 Q85,62 70,58 Q60,63 50,58 Q40,62 30,57 Q20,60 15,52 Q5,55 8,45 Q0,40 10,30 Z"
          fill="url(#plateGrad)"
          stroke={COLORS.orange}
          strokeWidth="2"
          filter="url(#plateShadow)"
        />
      </svg>
    </motion.div>
  )
})

// ============================================
// 多层文字组件（通用）
// ============================================
interface MultiLayerTextProps {
  text: string
  fontSize?: number
  gradient?: string
  strokeColor?: string
  outerStrokeColor?: string
  strokeWidth?: number
  outerStrokeWidth?: number
  delay?: number
  animationType?: 'bounce' | 'pop' | 'slide' | 'squash'
}

const MultiLayerText = memo(function MultiLayerText({
  text,
  fontSize = 48,
  gradient = `linear-gradient(180deg, ${COLORS.yellowLight} 0%, ${COLORS.yellow} 40%, ${COLORS.yellowDark} 100%)`,
  strokeColor = COLORS.blue,
  outerStrokeColor = COLORS.white,
  strokeWidth = 5,
  outerStrokeWidth = 3,
  delay = 0.5,
  animationType = 'bounce',
}: MultiLayerTextProps) {
  
  const getAnimation = () => {
    switch (animationType) {
      case 'bounce':
        return {
          initial: { opacity: 0, scale: 0, y: 30 },
          animate: { 
            opacity: 1,
            scale: [0, 1.2, 0.9, 1.05, 0.98, 1],
            y: [30, -10, 5, -2, 0],
          },
          transition: { delay, duration: 0.5, type: 'spring', stiffness: 350, damping: 12 }
        }
      case 'pop':
        return {
          initial: { opacity: 0, scale: 0 },
          animate: { 
            opacity: 1,
            scale: [0, 1.3, 0.85, 1.1, 1],
          },
          transition: { delay, duration: 0.4, type: 'spring', stiffness: 500, damping: 10 }
        }
      case 'slide':
        return {
          initial: { opacity: 0, x: -50, scale: 0.8 },
          animate: { 
            opacity: 1,
            x: 0,
            scale: 1,
          },
          transition: { delay, duration: 0.4, type: 'spring', stiffness: 300, damping: 20 }
        }
      case 'squash':
        return {
          initial: { opacity: 0, scaleX: 1.5, scaleY: 0.5 },
          animate: { 
            opacity: 1,
            scaleX: [1.5, 0.8, 1.1, 0.95, 1],
            scaleY: [0.5, 1.3, 0.9, 1.05, 1],
          },
          transition: { delay, duration: 0.5, ease: 'easeOut' }
        }
      default:
        return {
          initial: { opacity: 0, scale: 0 },
          animate: { opacity: 1, scale: 1 },
          transition: { delay, duration: 0.3 }
        }
    }
  }
  
  const anim = getAnimation()
  
  return (
    <motion.div 
      className="relative z-10"
      initial={anim.initial}
      animate={anim.animate}
      transition={anim.transition}
    >
      <div className="relative">
        {/* 阴影层 */}
        <span
          className="absolute"
          style={{
            fontFamily: '"Noto Sans SC", "SimHei", sans-serif',
            fontWeight: 900,
            fontSize: `${fontSize}px`,
            color: '#000',
            opacity: 0.35,
            transform: `translate(4px, 4px)`,
            whiteSpace: 'nowrap',
            filter: 'blur(3px)',
          }}
        >
          {text}
        </span>
        
        {/* 外描边 - 深蓝 */}
        <span
          className="absolute"
          style={{
            fontFamily: '"Noto Sans SC", "SimHei", sans-serif',
            fontWeight: 900,
            fontSize: `${fontSize}px`,
            color: 'transparent',
            WebkitTextStroke: `${strokeWidth + outerStrokeWidth * 2}px ${COLORS.blueDark}`,
            whiteSpace: 'nowrap',
          }}
        >
          {text}
        </span>
        
        {/* 中描边 - 白色 */}
        <span
          className="absolute"
          style={{
            fontFamily: '"Noto Sans SC", "SimHei", sans-serif',
            fontWeight: 900,
            fontSize: `${fontSize}px`,
            color: 'transparent',
            WebkitTextStroke: `${strokeWidth + outerStrokeWidth}px ${outerStrokeColor}`,
            whiteSpace: 'nowrap',
          }}
        >
          {text}
        </span>
        
        {/* 内描边 - 深蓝 */}
        <span
          className="absolute"
          style={{
            fontFamily: '"Noto Sans SC", "SimHei", sans-serif',
            fontWeight: 900,
            fontSize: `${fontSize}px`,
            color: 'transparent',
            WebkitTextStroke: `${strokeWidth}px ${strokeColor}`,
            whiteSpace: 'nowrap',
          }}
        >
          {text}
        </span>
        
        {/* 填充层 - 渐变 */}
        <span
          className="relative"
          style={{
            fontFamily: '"Noto Sans SC", "SimHei", sans-serif',
            fontWeight: 900,
            fontSize: `${fontSize}px`,
            background: gradient,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            whiteSpace: 'nowrap',
            display: 'inline-block',
            filter: `drop-shadow(0 0 6px rgba(255, 255, 0, 0.5))`,
          }}
        >
          {text}
        </span>
      </div>
    </motion.div>
  )
})

// ============================================
// 模板1: 节目主标题
// ============================================
export interface MainTitleProps {
  text: string
  scale?: number
}

export const MainTitle = memo(function MainTitle({ 
  text = '一见你就笑',
  scale = 1,
}: MainTitleProps) {
  return (
    <div 
      className="relative w-full h-full min-h-[350px] overflow-hidden flex items-center justify-center"
      style={{ background: COLORS.bgPurple }}
    >
      {/* 镜头推近效果 */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        initial={{ scale: 1.4, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
      >
        <RadialBurst rayCount={20} />
        <SpeedLines count={14} />
        <Confetti count={25} />
        <FlyingEmojis emojis={EMOJIS.laugh} positions="around" />
        <ComicDecorations />
        <ExplosionPlate width={320 * scale} height={110 * scale} />
        <MultiLayerText 
          text={text} 
          fontSize={56 * scale} 
          animationType="bounce"
          delay={0.45}
        />
      </motion.div>
      
      {/* 角落装饰 */}
      {['🎬', '📺', '🎭', '🎪'].map((emoji, i) => (
        <motion.div
          key={i}
          className="absolute text-2xl"
          style={{
            top: i < 2 ? 16 : 'auto',
            bottom: i >= 2 ? 16 : 'auto',
            left: i % 2 === 0 ? 16 : 'auto',
            right: i % 2 === 1 ? 16 : 'auto',
          }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1 + i * 0.1, duration: 0.3 }}
        >
          {emoji}
        </motion.div>
      ))}
    </div>
  )
})

// ============================================
// 模板2: 分段标题
// ============================================
export interface SectionTitleProps {
  title: string
  subtitle?: string
  scale?: number
}

export const SectionTitle = memo(function SectionTitle({ 
  title = '本期主题',
  subtitle,
  scale = 1,
}: SectionTitleProps) {
  return (
    <div 
      className="relative w-full h-full min-h-[280px] overflow-hidden flex items-center justify-center"
      style={{ background: COLORS.bgBlue }}
    >
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        initial={{ scale: 1.2, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      >
        <RadialBurst color1={COLORS.blueLight} color2={COLORS.blue} rayCount={14} />
        <SpeedLines count={10} colors={[COLORS.cyan, COLORS.white, COLORS.yellow]} />
        <FlyingEmojis emojis={EMOJIS.celebrate} positions="top" />
        
        {/* 装饰条 */}
        <motion.div
          className="absolute"
          style={{
            width: 250 * scale,
            height: 6 * scale,
            background: `linear-gradient(90deg, transparent 0%, ${COLORS.cyan} 20%, ${COLORS.cyan} 80%, transparent 100%)`,
            top: '35%',
            borderRadius: 3,
          }}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.25, duration: 0.3, ease: 'easeOut' }}
        />
        
        <div className="flex flex-col items-center gap-2">
          <MultiLayerText 
            text={title} 
            fontSize={44 * scale}
            gradient={`linear-gradient(180deg, ${COLORS.white} 0%, ${COLORS.cyan} 50%, ${COLORS.blueLight} 100%)`}
            strokeColor={COLORS.blueDark}
            animationType="pop"
            delay={0.35}
          />
          {subtitle && (
            <motion.div
              className="text-white/80 text-lg font-medium"
              style={{ fontSize: 18 * scale }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.3 }}
            >
              {subtitle}
            </motion.div>
          )}
        </div>
        
        {/* 底部装饰条 */}
        <motion.div
          className="absolute"
          style={{
            width: 200 * scale,
            height: 4 * scale,
            background: `linear-gradient(90deg, transparent 0%, ${COLORS.yellow} 20%, ${COLORS.yellow} 80%, transparent 100%)`,
            bottom: '32%',
            borderRadius: 2,
          }}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.5, duration: 0.3, ease: 'easeOut' }}
        />
      </motion.div>
    </div>
  )
})

// ============================================
// 模板3: 嘉宾姓名条
// ============================================
export interface GuestNameProps {
  name: string
  title?: string
  scale?: number
}

export const GuestName = memo(function GuestName({ 
  name = '张三',
  title = '特邀嘉宾',
  scale = 1,
}: GuestNameProps) {
  return (
    <div 
      className="relative w-full h-full min-h-[180px] overflow-hidden flex items-center justify-center"
      style={{ background: 'transparent' }}
    >
      <motion.div
        className="relative flex items-center gap-4"
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.4, type: 'spring', stiffness: 200, damping: 20 }}
      >
        {/* 左侧装饰 */}
        <motion.div
          className="flex items-center gap-1"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.3 }}
        >
          <span style={{ fontSize: 28 * scale }}>⭐</span>
        </motion.div>
        
        {/* 姓名卡片 */}
        <motion.div
          className="relative"
          style={{
            background: `linear-gradient(135deg, ${COLORS.yellow} 0%, ${COLORS.yellowDark} 100%)`,
            padding: `${12 * scale}px ${24 * scale}px`,
            borderRadius: 12 * scale,
            boxShadow: `0 4px 20px rgba(0,0,0,0.3), inset 0 2px 0 rgba(255,255,255,0.3)`,
            border: `3px solid ${COLORS.white}`,
          }}
          initial={{ scale: 0, rotate: -10 }}
          animate={{ scale: [0, 1.1, 1], rotate: [-10, 3, 0] }}
          transition={{ delay: 0.2, duration: 0.4, type: 'spring' }}
        >
          {/* 姓名 */}
          <div className="relative">
            <span
              style={{
                fontFamily: '"Noto Sans SC", sans-serif',
                fontWeight: 900,
                fontSize: 36 * scale,
                color: COLORS.blueDark,
                textShadow: '0 2px 0 rgba(255,255,255,0.5)',
                letterSpacing: '0.05em',
              }}
            >
              {name}
            </span>
          </div>
          
          {/* 身份标签 */}
          {title && (
            <motion.div
              className="absolute -bottom-3 left-1/2 -translate-x-1/2"
              style={{
                background: COLORS.pink,
                padding: `${4 * scale}px ${12 * scale}px`,
                borderRadius: 20 * scale,
                border: `2px solid ${COLORS.white}`,
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
              }}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.3 }}
            >
              <span
                style={{
                  fontFamily: '"Noto Sans SC", sans-serif',
                  fontWeight: 700,
                  fontSize: 14 * scale,
                  color: COLORS.white,
                  whiteSpace: 'nowrap',
                }}
              >
                {title}
              </span>
            </motion.div>
          )}
        </motion.div>
        
        {/* 右侧装饰 */}
        <motion.div
          className="flex items-center gap-1"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.3 }}
        >
          <span style={{ fontSize: 28 * scale }}>✨</span>
        </motion.div>
      </motion.div>
      
      {/* 粒子效果 */}
      <Confetti count={12} />
    </div>
  )
})

// ============================================
// 模板4: 爆笑大字
// ============================================
export interface FunnyTextProps {
  text: string
  variant?: 'yellow' | 'pink' | 'cyan' | 'rainbow'
  scale?: number
}

export const FunnyText = memo(function FunnyText({ 
  text = '笑死我了',
  variant = 'yellow',
  scale = 1,
}: FunnyTextProps) {
  const getVariantColors = () => {
    switch (variant) {
      case 'pink':
        return {
          bg: COLORS.bgPink,
          gradient: `linear-gradient(180deg, ${COLORS.white} 0%, #FFCCFF 40%, ${COLORS.pink} 100%)`,
          strokeColor: '#990066',
          emojis: EMOJIS.cute,
        }
      case 'cyan':
        return {
          bg: COLORS.bgBlue,
          gradient: `linear-gradient(180deg, ${COLORS.white} 0%, #CCFFFF 40%, ${COLORS.cyan} 100%)`,
          strokeColor: '#006666',
          emojis: EMOJIS.celebrate,
        }
      case 'rainbow':
        return {
          bg: 'linear-gradient(135deg, #FF0099 0%, #FFCC00 25%, #00FF66 50%, #00CCFF 75%, #9933FF 100%)',
          gradient: `linear-gradient(90deg, ${COLORS.red} 0%, ${COLORS.yellow} 25%, ${COLORS.green} 50%, ${COLORS.cyan} 75%, ${COLORS.purple} 100%)`,
          strokeColor: COLORS.white,
          emojis: ['🌈', '✨', '💫', '🎉', '💖'],
        }
      default:
        return {
          bg: COLORS.bgPurple,
          gradient: `linear-gradient(180deg, ${COLORS.yellowLight} 0%, ${COLORS.yellow} 40%, ${COLORS.yellowDark} 100%)`,
          strokeColor: COLORS.blue,
          emojis: EMOJIS.laugh,
        }
    }
  }
  
  const colors = getVariantColors()
  
  return (
    <div 
      className="relative w-full h-full min-h-[300px] overflow-hidden flex items-center justify-center"
      style={{ background: colors.bg }}
    >
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        initial={{ scale: 1.3, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      >
        <RadialBurst rayCount={18} />
        <SpeedLines count={16} />
        <Confetti count={30} />
        <FlyingEmojis emojis={colors.emojis} positions="around" />
        
        {/* Squash & Stretch 动画文字 */}
        <MultiLayerText 
          text={text} 
          fontSize={64 * scale}
          gradient={colors.gradient}
          strokeColor={colors.strokeColor}
          animationType="squash"
          delay={0.35}
        />
        
        {/* 震动效果 */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          animate={{
            x: [0, -2, 2, -1, 1, 0],
            y: [0, 1, -1, 2, -2, 0],
          }}
          transition={{ delay: 0.5, duration: 0.3, ease: 'easeOut' }}
        />
      </motion.div>
    </div>
  )
})

// ============================================
// 综合展示组件
// ============================================
export interface VarietyTextSystemProps {
  type: 'main-title' | 'section-title' | 'guest-name' | 'funny-text'
  text: string
  subtitle?: string
  title?: string
  variant?: 'yellow' | 'pink' | 'cyan' | 'rainbow'
  scale?: number
}

export const VarietyTextSystem = memo(function VarietyTextSystem({
  type,
  text,
  subtitle,
  title,
  variant,
  scale = 1,
}: VarietyTextSystemProps) {
  switch (type) {
    case 'main-title':
      return <MainTitle text={text} scale={scale} />
    case 'section-title':
      return <SectionTitle title={text} subtitle={subtitle} scale={scale} />
    case 'guest-name':
      return <GuestName name={text} title={title} scale={scale} />
    case 'funny-text':
      return <FunnyText text={text} variant={variant} scale={scale} />
    default:
      return null
  }
})

export default VarietyTextSystem

