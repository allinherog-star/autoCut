'use client'

import { memo, useMemo, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// 稳定的伪随机数生成器
function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000
  return x - Math.floor(x)
}

// Web 安全色配置
const COLORS = {
  // 主色调
  yellow: '#FFCC00',        // 明黄色
  yellowLight: '#FFFF00',   // 亮黄
  yellowDark: '#FF9900',    // 深黄
  
  // 描边色
  blue: '#0033CC',          // 深蓝描边
  blueDark: '#000066',      // 更深蓝
  white: '#FFFFFF',
  
  // 背景渐变色
  purple: '#6600CC',        // 紫色
  purpleLight: '#9933FF',   // 亮紫
  purpleDark: '#330066',    // 深紫
  blueLight: '#3366FF',     // 亮蓝
  
  // 速度线/装饰色
  pink: '#FF0099',
  cyan: '#00FFFF',
  orange: '#FF6600',
  green: '#00FF66',
  red: '#FF0033',
}

// 表情包图标
const EMOJIS = ['😂', '🤣', '😆', '🎉', '⭐', '💥', '✨', '🌟']

// 彩纸粒子颜色
const CONFETTI_COLORS = [
  COLORS.yellow,
  COLORS.pink,
  COLORS.cyan,
  COLORS.orange,
  COLORS.green,
  COLORS.white,
]

interface VarietyComedyTextProps {
  text: string
  scale?: number
  onAnimationComplete?: () => void
}

// 放射线背景组件
const RadialBurst = memo(function RadialBurst({ scale }: { scale: number }) {
  const rayCount = 24
  
  return (
    <motion.div
      className="absolute inset-0 overflow-hidden"
      initial={{ opacity: 0, scale: 0.5, rotate: -30 }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <svg viewBox="0 0 400 400" className="w-full h-full">
        <defs>
          <linearGradient id="burstGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={COLORS.purpleLight} stopOpacity="0.8" />
            <stop offset="50%" stopColor={COLORS.purple} stopOpacity="0.6" />
            <stop offset="100%" stopColor={COLORS.blueLight} stopOpacity="0.4" />
          </linearGradient>
        </defs>
        {Array.from({ length: rayCount }).map((_, i) => {
          const angle = (360 / rayCount) * i
          const isAlternate = i % 2 === 0
          return (
            <motion.polygon
              key={i}
              points="200,200 180,0 220,0"
              fill={isAlternate ? COLORS.purpleLight : COLORS.purple}
              opacity={isAlternate ? 0.5 : 0.3}
              style={{
                transformOrigin: '200px 200px',
                transform: `rotate(${angle}deg)`,
              }}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: i * 0.02, duration: 0.3 }}
            />
          )
        })}
      </svg>
    </motion.div>
  )
})

// 速度线组件
const SpeedLines = memo(function SpeedLines({ scale }: { scale: number }) {
  const lines = useMemo(() => 
    Array.from({ length: 16 }).map((_, i) => ({
      id: i,
      angle: seededRandom(i * 6 + 1) * 360,
      length: 80 + seededRandom(i * 6 + 2) * 120,
      width: 2 + seededRandom(i * 6 + 3) * 4,
      delay: seededRandom(i * 6 + 4) * 0.3,
      color: CONFETTI_COLORS[Math.floor(seededRandom(i * 6 + 5) * CONFETTI_COLORS.length)],
      distance: 100 + seededRandom(i * 6 + 6) * 80,
    })), []
  )
  
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {lines.map((line) => (
        <motion.div
          key={line.id}
          className="absolute"
          style={{
            left: '50%',
            top: '50%',
            width: line.length * scale,
            height: line.width * scale,
            background: `linear-gradient(90deg, ${line.color} 0%, transparent 100%)`,
            transformOrigin: 'left center',
            borderRadius: line.width * scale,
            filter: 'blur(1px)',
          }}
          initial={{ 
            opacity: 0,
            scale: 0,
            rotate: line.angle,
            x: 0,
            y: 0,
          }}
          animate={{ 
            opacity: [0, 1, 0],
            scale: [0, 1, 1.2],
            x: Math.cos(line.angle * Math.PI / 180) * line.distance * scale,
            y: Math.sin(line.angle * Math.PI / 180) * line.distance * scale,
          }}
          transition={{ 
            delay: 0.5 + line.delay,
            duration: 0.6,
            ease: 'easeOut',
          }}
        />
      ))}
    </div>
  )
})

// 彩纸粒子组件
const Confetti = memo(function Confetti({ scale }: { scale: number }) {
  const particles = useMemo(() =>
    Array.from({ length: 30 }).map((_, i) => ({
      id: i,
      x: (seededRandom(i * 7 + 100) - 0.5) * 300,
      y: (seededRandom(i * 7 + 101) - 0.5) * 200,
      rotation: seededRandom(i * 7 + 102) * 360,
      size: 6 + seededRandom(i * 7 + 103) * 10,
      color: CONFETTI_COLORS[Math.floor(seededRandom(i * 7 + 104) * CONFETTI_COLORS.length)],
      delay: seededRandom(i * 7 + 105) * 0.4,
      shape: seededRandom(i * 7 + 106) > 0.5 ? 'rect' : 'circle',
    })), []
  )
  
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute"
          style={{
            left: '50%',
            top: '50%',
            width: p.size * scale,
            height: p.shape === 'rect' ? p.size * 0.6 * scale : p.size * scale,
            background: p.color,
            borderRadius: p.shape === 'circle' ? '50%' : '2px',
          }}
          initial={{ 
            opacity: 0,
            scale: 0,
            x: 0,
            y: 0,
            rotate: 0,
          }}
          animate={{ 
            opacity: [0, 1, 1, 0],
            scale: [0, 1, 1, 0.5],
            x: p.x * scale,
            y: [0, p.y * scale - 50, p.y * scale],
            rotate: p.rotation,
          }}
          transition={{ 
            delay: 0.6 + p.delay,
            duration: 1.2,
            ease: 'easeOut',
          }}
        />
      ))}
    </div>
  )
})

// 飞入表情包组件
const FlyingEmojis = memo(function FlyingEmojis({ scale }: { scale: number }) {
  const emojis = useMemo(() => [
    { emoji: '😂', startX: -200, startY: -100, endX: -120, endY: -60, delay: 0.2, size: 36 },
    { emoji: '🤣', startX: 200, startY: -80, endX: 130, endY: -50, delay: 0.25, size: 32 },
    { emoji: '😆', startX: -180, startY: 100, endX: -110, endY: 55, delay: 0.3, size: 28 },
    { emoji: '🎉', startX: 180, startY: 90, endX: 120, endY: 50, delay: 0.35, size: 30 },
    { emoji: '⭐', startX: 0, startY: -150, endX: 0, endY: -75, delay: 0.15, size: 24 },
    { emoji: '✨', startX: -150, startY: 0, endX: -140, endY: 0, delay: 0.4, size: 22 },
    { emoji: '✨', startX: 150, startY: 0, endX: 140, endY: 0, delay: 0.45, size: 22 },
  ], [])
  
  return (
    <div className="absolute inset-0 pointer-events-none">
      {emojis.map((e, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{
            left: '50%',
            top: '50%',
            fontSize: e.size * scale,
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
          }}
          initial={{ 
            opacity: 0,
            x: e.startX * scale,
            y: e.startY * scale,
            scale: 0,
            rotate: -30,
          }}
          animate={{ 
            opacity: 1,
            x: e.endX * scale,
            y: e.endY * scale,
            scale: [0, 1.3, 1],
            rotate: [-30, 10, 0],
          }}
          transition={{ 
            delay: e.delay,
            duration: 0.5,
            type: 'spring',
            stiffness: 300,
            damping: 15,
          }}
        >
          {e.emoji}
        </motion.div>
      ))}
    </div>
  )
})

// 爆炸形状底板组件
const ExplosionPlate = memo(function ExplosionPlate({ scale }: { scale: number }) {
  // 波浪边缘的爆炸形状路径
  const explosionPath = `
    M 50,5 
    Q 60,15 70,8 Q 80,18 90,12 Q 95,25 100,20
    Q 105,35 110,30 Q 112,45 115,42
    Q 115,55 118,55 Q 115,70 118,72
    Q 112,80 115,85 Q 105,88 110,95
    Q 95,95 100,105 Q 85,102 90,112
    Q 75,108 80,118 Q 65,112 70,120
    Q 55,115 60,125 Q 45,118 50,128
    Q 40,120 35,125 Q 30,115 25,120
    Q 22,108 15,115 Q 15,100 8,105
    Q 10,90 2,95 Q 5,80 -2,85
    Q 2,70 -3,72 Q 2,58 -3,55
    Q 5,45 0,42 Q 8,35 5,28
    Q 15,25 12,18 Q 25,20 22,12
    Q 35,15 33,8 Q 45,12 50,5
    Z
  `
  
  return (
    <motion.div
      className="absolute"
      style={{
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
        width: 320 * scale,
        height: 160 * scale,
      }}
      initial={{ opacity: 0, scale: 0, rotate: -10 }}
      animate={{ 
        opacity: 1,
        scale: [0, 1.15, 0.95, 1.02, 1],
        rotate: [-10, 5, -2, 0],
      }}
      transition={{ 
        delay: 0.4,
        duration: 0.5,
        type: 'spring',
        stiffness: 400,
        damping: 12,
      }}
    >
      <svg viewBox="-10 0 130 130" className="w-full h-full" preserveAspectRatio="none">
        <defs>
          <linearGradient id="plateGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={COLORS.yellowLight} />
            <stop offset="50%" stopColor={COLORS.yellow} />
            <stop offset="100%" stopColor={COLORS.yellowDark} />
          </linearGradient>
          <filter id="plateShadow">
            <feDropShadow dx="3" dy="5" stdDeviation="4" floodColor="#000000" floodOpacity="0.4" />
          </filter>
          {/* 手绘纹理 */}
          <filter id="roughTexture">
            <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="3" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="2" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
        <path
          d={explosionPath}
          fill="url(#plateGradient)"
          stroke={COLORS.orange}
          strokeWidth="3"
          filter="url(#plateShadow)"
        />
        {/* 内发光效果 */}
        <path
          d={explosionPath}
          fill="none"
          stroke={COLORS.white}
          strokeWidth="2"
          opacity="0.5"
          transform="scale(0.92) translate(5, 5)"
        />
      </svg>
    </motion.div>
  )
})

// 主文字组件
const MainText = memo(function MainText({ text, scale }: { text: string; scale: number }) {
  const fontSize = 52 * scale
  const strokeWidth = 6 * scale
  const outerStrokeWidth = 4 * scale
  
  return (
    <motion.div
      className="relative z-10"
      initial={{ opacity: 0, scale: 0, y: 30 }}
      animate={{ 
        opacity: 1,
        scale: [0, 1.25, 0.9, 1.08, 0.98, 1],
        y: [30, -15, 5, -3, 0],
      }}
      transition={{ 
        delay: 0.55,
        duration: 0.6,
        type: 'spring',
        stiffness: 350,
        damping: 10,
      }}
    >
      {/* 多层文字效果 */}
      <div className="relative">
        {/* 第五层：深色阴影 */}
        <span
          className="absolute"
          style={{
            fontFamily: '"Noto Sans SC", "SimHei", sans-serif',
            fontWeight: 900,
            fontSize: `${fontSize}px`,
            color: '#000000',
            opacity: 0.4,
            transform: `translate(${5 * scale}px, ${5 * scale}px)`,
            whiteSpace: 'nowrap',
            filter: `blur(${3 * scale}px)`,
          }}
        >
          {text}
        </span>
        
        {/* 第四层：深蓝外描边 */}
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
        
        {/* 第三层：白色中描边 */}
        <span
          className="absolute"
          style={{
            fontFamily: '"Noto Sans SC", "SimHei", sans-serif',
            fontWeight: 900,
            fontSize: `${fontSize}px`,
            color: 'transparent',
            WebkitTextStroke: `${strokeWidth + outerStrokeWidth}px ${COLORS.white}`,
            whiteSpace: 'nowrap',
          }}
        >
          {text}
        </span>
        
        {/* 第二层：深蓝内描边 */}
        <span
          className="absolute"
          style={{
            fontFamily: '"Noto Sans SC", "SimHei", sans-serif',
            fontWeight: 900,
            fontSize: `${fontSize}px`,
            color: 'transparent',
            WebkitTextStroke: `${strokeWidth}px ${COLORS.blue}`,
            whiteSpace: 'nowrap',
          }}
        >
          {text}
        </span>
        
        {/* 第一层：明黄色渐变填充 + 内发光 */}
        <span
          className="relative"
          style={{
            fontFamily: '"Noto Sans SC", "SimHei", sans-serif',
            fontWeight: 900,
            fontSize: `${fontSize}px`,
            background: `linear-gradient(180deg, ${COLORS.yellowLight} 0%, ${COLORS.yellow} 40%, ${COLORS.yellowDark} 100%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            whiteSpace: 'nowrap',
            display: 'inline-block',
            filter: `drop-shadow(0 0 ${4 * scale}px rgba(255, 255, 0, 0.6))`,
          }}
        >
          {text}
        </span>
      </div>
    </motion.div>
  )
})

// 主组件
export const VarietyComedyText = memo(function VarietyComedyText({
  text,
  scale = 1,
  onAnimationComplete,
}: VarietyComedyTextProps) {
  const [isVisible, setIsVisible] = useState(true)
  
  useEffect(() => {
    const timer = setTimeout(() => {
      onAnimationComplete?.()
    }, 2500)
    return () => clearTimeout(timer)
  }, [onAnimationComplete])
  
  return (
    <div 
      className="relative w-full h-full min-h-[300px] overflow-hidden"
      style={{
        background: `radial-gradient(ellipse at center, ${COLORS.purpleLight} 0%, ${COLORS.purple} 40%, ${COLORS.purpleDark} 100%)`,
      }}
    >
      {/* 镜头推近动画容器 */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        initial={{ scale: 1.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        {/* 放射线背景 */}
        <RadialBurst scale={scale} />
        
        {/* 速度线 */}
        <SpeedLines scale={scale} />
        
        {/* 彩纸粒子 */}
        <Confetti scale={scale} />
        
        {/* 飞入表情包 */}
        <FlyingEmojis scale={scale} />
        
        {/* 爆炸形状底板 */}
        <ExplosionPlate scale={scale} />
        
        {/* 主文字 */}
        <MainText text={text} scale={scale} />
      </motion.div>
      
      {/* 角落装饰 */}
      <motion.div
        className="absolute top-4 left-4 text-2xl"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1, duration: 0.3 }}
      >
        🎬
      </motion.div>
      <motion.div
        className="absolute top-4 right-4 text-2xl"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.1, duration: 0.3 }}
      >
        📺
      </motion.div>
      <motion.div
        className="absolute bottom-4 left-4 text-2xl"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.2, duration: 0.3 }}
      >
        🌈
      </motion.div>
      <motion.div
        className="absolute bottom-4 right-4 text-2xl"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.3, duration: 0.3 }}
      >
        💫
      </motion.div>
    </div>
  )
})

export default VarietyComedyText

