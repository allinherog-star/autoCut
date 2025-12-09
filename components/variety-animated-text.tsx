'use client'

import { memo, useMemo, useState, useEffect, useCallback, useRef } from 'react'
import { motion, Variants, useAnimation, AnimatePresence } from 'framer-motion'

// 稳定的伪随机数生成器（基于种子）
function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000
  return x - Math.floor(x)
}

// 生成稳定的随机数组
function generateStableRandom(count: number, seed: number = 42) {
  return Array.from({ length: count }, (_, i) => seededRandom(seed + i))
}

// ============================================
// Web 安全色
// ============================================
const COLORS = {
  yellow: '#FFCC00',
  yellowLight: '#FFFF00',
  yellowDark: '#FF9900',
  blue: '#0033CC',
  blueDark: '#000066',
  blueLight: '#3366FF',
  purple: '#6600CC',
  purpleLight: '#9933FF',
  purpleDark: '#330066',
  white: '#FFFFFF',
  pink: '#FF0099',
  cyan: '#00FFFF',
  orange: '#FF6600',
  green: '#00FF66',
  red: '#FF3333',
}

// ============================================
// 动画配置类型
// ============================================

// 入场动画类型
export type EnterAnimation = 
  | 'bounce'      // 弹跳
  | 'pop'         // 爆开
  | 'slide-up'    // 上滑
  | 'slide-down'  // 下滑
  | 'slide-left'  // 左滑
  | 'slide-right' // 右滑
  | 'scale'       // 缩放
  | 'rotate'      // 旋转
  | 'flip-x'      // X轴翻转
  | 'flip-y'      // Y轴翻转
  | 'squash'      // 压扁弹起
  | 'stretch'     // 拉伸弹起
  | 'jelly'       // 果冻效果
  | 'elastic'     // 弹性
  | 'drop'        // 掉落
  | 'rise'        // 升起
  | 'zoom-blur'   // 缩放模糊
  | 'typewriter'  // 打字机（逐字）
  | 'wave'        // 波浪（逐字）
  | 'none'        // 无动画

// 循环动画类型
export type LoopAnimation = 
  | 'pulse'       // 脉冲
  | 'shake'       // 抖动
  | 'swing'       // 摇摆
  | 'bounce'      // 弹跳
  | 'float'       // 漂浮
  | 'glow'        // 发光
  | 'flash'       // 闪烁
  | 'wiggle'      // 扭动
  | 'heartbeat'   // 心跳
  | 'rubber'      // 橡皮
  | 'jello'       // 果冻
  | 'tada'        // 庆祝
  | 'spin'        // 旋转
  | 'rock'        // 摇晃
  | 'none'        // 无循环

// 背景效果
export type BackgroundEffect = 
  | 'radial'      // 放射线
  | 'grid'        // 网格
  | 'dots'        // 圆点
  | 'gradient'    // 渐变
  | 'stars'       // 星星
  | 'none'        // 无背景

// 装饰效果
export type DecorationEffect = 
  | 'confetti'    // 彩纸
  | 'speedlines'  // 速度线
  | 'emojis'      // 表情
  | 'sparkles'    // 闪光
  | 'bubbles'     // 气泡
  | 'none'        // 无装饰

// 缓动类型
export type EasingType = 
  | 'linear'
  | 'easeIn'
  | 'easeOut'
  | 'easeInOut'
  | 'circIn'
  | 'circOut'
  | 'backIn'
  | 'backOut'
  | 'anticipate'

// 完整配置
export interface AnimationConfig {
  // 入场动画
  enter: EnterAnimation
  enterDuration: number      // 0.1 - 2.0
  enterDelay: number         // 0 - 1.0
  enterEasing: EasingType
  
  // 循环动画
  loop: LoopAnimation
  loopDuration: number       // 0.5 - 3.0
  loopDelay: number          // 循环间隔
  
  // 文字逐字动画
  stagger: boolean           // 是否逐字
  staggerDelay: number       // 逐字间隔
  
  // 变形强度
  squashStretch: number      // 0 - 1, 变形强度
  overshoot: number          // 0 - 1, 过冲强度
  
  // 背景效果
  background: BackgroundEffect
  backgroundIntensity: number // 0 - 1
  
  // 装饰效果
  decorations: DecorationEffect[]
  decorationIntensity: number // 0 - 1
  
  // 颜色
  textColor: string
  strokeColor: string
  backgroundColor: string
}

// 默认配置
export const DEFAULT_CONFIG: AnimationConfig = {
  enter: 'bounce',
  enterDuration: 0.5,
  enterDelay: 0,
  enterEasing: 'easeOut',
  loop: 'none',
  loopDuration: 1.5,
  loopDelay: 0,
  stagger: false,
  staggerDelay: 0.05,
  squashStretch: 0.3,
  overshoot: 0.2,
  background: 'none',
  backgroundIntensity: 0.5,
  decorations: ['confetti', 'speedlines'],
  decorationIntensity: 0.7,
  textColor: COLORS.yellow,
  strokeColor: COLORS.blue,
  backgroundColor: COLORS.purpleDark,
}

// ============================================
// 入场动画变体生成器
// ============================================
const getEnterVariants = (
  type: EnterAnimation, 
  duration: number,
  easing: EasingType,
  squashStretch: number,
  overshoot: number,
): Variants => {
  const ss = squashStretch
  const os = overshoot
  
  const baseTransition = {
    duration,
    ease: easing,
  }
  
  switch (type) {
    case 'bounce':
      return {
        hidden: { opacity: 0, scale: 0, y: 50 },
        visible: { 
          opacity: 1, 
          scale: [0, 1 + os * 0.3, 1 - os * 0.1, 1 + os * 0.05, 1],
          y: [50, -20 * os, 10 * os, 0],
          transition: { ...baseTransition, type: 'spring', stiffness: 300, damping: 15 }
        },
      }
    case 'pop':
      return {
        hidden: { opacity: 0, scale: 0 },
        visible: { 
          opacity: 1, 
          scale: [0, 1 + os * 0.4, 1 - os * 0.15, 1],
          transition: { ...baseTransition, type: 'spring', stiffness: 500, damping: 12 }
        },
      }
    case 'slide-up':
      return {
        hidden: { opacity: 0, y: 100 },
        visible: { opacity: 1, y: 0, transition: baseTransition },
      }
    case 'slide-down':
      return {
        hidden: { opacity: 0, y: -100 },
        visible: { opacity: 1, y: 0, transition: baseTransition },
      }
    case 'slide-left':
      return {
        hidden: { opacity: 0, x: 100 },
        visible: { opacity: 1, x: 0, transition: baseTransition },
      }
    case 'slide-right':
      return {
        hidden: { opacity: 0, x: -100 },
        visible: { opacity: 1, x: 0, transition: baseTransition },
      }
    case 'scale':
      return {
        hidden: { opacity: 0, scale: 0 },
        visible: { opacity: 1, scale: 1, transition: baseTransition },
      }
    case 'rotate':
      return {
        hidden: { opacity: 0, scale: 0, rotate: -180 },
        visible: { 
          opacity: 1, 
          scale: 1, 
          rotate: 0,
          transition: { ...baseTransition, type: 'spring', stiffness: 200 }
        },
      }
    case 'flip-x':
      return {
        hidden: { opacity: 0, rotateX: 90 },
        visible: { opacity: 1, rotateX: 0, transition: baseTransition },
      }
    case 'flip-y':
      return {
        hidden: { opacity: 0, rotateY: 90 },
        visible: { opacity: 1, rotateY: 0, transition: baseTransition },
      }
    case 'squash':
      return {
        hidden: { opacity: 0, scaleX: 1 + ss, scaleY: 1 - ss * 0.5 },
        visible: { 
          opacity: 1, 
          scaleX: [1 + ss, 1 - ss * 0.3, 1 + ss * 0.1, 1],
          scaleY: [1 - ss * 0.5, 1 + ss * 0.4, 1 - ss * 0.1, 1],
          transition: baseTransition
        },
      }
    case 'stretch':
      return {
        hidden: { opacity: 0, scaleX: 1 - ss * 0.5, scaleY: 1 + ss },
        visible: { 
          opacity: 1,
          scaleX: [1 - ss * 0.5, 1 + ss * 0.3, 1 - ss * 0.1, 1],
          scaleY: [1 + ss, 1 - ss * 0.3, 1 + ss * 0.1, 1],
          transition: baseTransition
        },
      }
    case 'jelly':
      return {
        hidden: { opacity: 0, scale: 0 },
        visible: { 
          opacity: 1,
          scale: 1,
          scaleX: [0, 1.25, 0.75, 1.15, 0.95, 1.05, 1],
          scaleY: [0, 0.75, 1.25, 0.85, 1.05, 0.95, 1],
          transition: { ...baseTransition, duration: duration * 1.5 }
        },
      }
    case 'elastic':
      return {
        hidden: { opacity: 0, scale: 0.3 },
        visible: { 
          opacity: 1,
          scale: 1,
          transition: { ...baseTransition, type: 'spring', stiffness: 600, damping: 8 }
        },
      }
    case 'drop':
      return {
        hidden: { opacity: 0, y: -200, scale: 0.5 },
        visible: { 
          opacity: 1,
          y: [-200, 20, -10, 5, 0],
          scale: [0.5, 1.1, 0.95, 1],
          transition: { ...baseTransition, type: 'spring', stiffness: 300, damping: 10 }
        },
      }
    case 'rise':
      return {
        hidden: { opacity: 0, y: 100, scale: 0.8 },
        visible: { 
          opacity: 1,
          y: 0,
          scale: 1,
          transition: { ...baseTransition, type: 'spring', stiffness: 200, damping: 15 }
        },
      }
    case 'zoom-blur':
      return {
        hidden: { opacity: 0, scale: 3, filter: 'blur(20px)' },
        visible: { 
          opacity: 1,
          scale: 1,
          filter: 'blur(0px)',
          transition: baseTransition
        },
      }
    default:
      return {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: baseTransition },
      }
  }
}

// ============================================
// 循环动画变体生成器
// ============================================
const getLoopVariants = (type: LoopAnimation, duration: number): Variants => {
  const transition = {
    duration,
    repeat: Infinity,
    ease: 'easeInOut' as const,
  }
  
  switch (type) {
    case 'pulse':
      return {
        animate: {
          scale: [1, 1.05, 1],
          transition,
        },
      }
    case 'shake':
      return {
        animate: {
          x: [0, -5, 5, -5, 5, 0],
          transition: { ...transition, duration: duration * 0.5 },
        },
      }
    case 'swing':
      return {
        animate: {
          rotate: [0, 5, -5, 5, -5, 0],
          transition,
        },
      }
    case 'bounce':
      return {
        animate: {
          y: [0, -15, 0],
          transition,
        },
      }
    case 'float':
      return {
        animate: {
          y: [0, -10, 0],
          x: [0, 3, 0, -3, 0],
          transition,
        },
      }
    case 'glow':
      return {
        animate: {
          filter: [
            'drop-shadow(0 0 5px rgba(255,204,0,0.5))',
            'drop-shadow(0 0 20px rgba(255,204,0,0.8))',
            'drop-shadow(0 0 5px rgba(255,204,0,0.5))',
          ],
          transition,
        },
      }
    case 'flash':
      return {
        animate: {
          opacity: [1, 0.5, 1],
          transition: { ...transition, duration: duration * 0.3 },
        },
      }
    case 'wiggle':
      return {
        animate: {
          rotate: [0, -3, 3, -3, 3, 0],
          transition: { ...transition, duration: duration * 0.5 },
        },
      }
    case 'heartbeat':
      return {
        animate: {
          scale: [1, 1.15, 1, 1.15, 1],
          transition: { ...transition, times: [0, 0.14, 0.28, 0.42, 1] },
        },
      }
    case 'rubber':
      return {
        animate: {
          scaleX: [1, 1.25, 0.75, 1.15, 0.95, 1],
          scaleY: [1, 0.75, 1.25, 0.85, 1.05, 1],
          transition,
        },
      }
    case 'jello':
      return {
        animate: {
          skewX: [0, -5, 4, -3, 2, -1, 0],
          skewY: [0, -5, 4, -3, 2, -1, 0],
          transition,
        },
      }
    case 'tada':
      return {
        animate: {
          scale: [1, 0.9, 1.1, 1.1, 1.1, 1.1, 1.1, 1.1, 1],
          rotate: [0, -3, 3, -3, 3, -3, 3, -3, 0],
          transition,
        },
      }
    case 'spin':
      return {
        animate: {
          rotate: [0, 360],
          transition: { ...transition, ease: 'linear' },
        },
      }
    case 'rock':
      return {
        animate: {
          rotate: [0, 15, -15, 15, -15, 0],
          transition,
        },
      }
    default:
      return {}
  }
}

// ============================================
// 背景效果组件
// ============================================
const BackgroundEffects = memo(function BackgroundEffects({
  type,
  intensity,
  color,
}: {
  type: BackgroundEffect
  intensity: number
  color: string
}) {
  if (type === 'none') return null
  
  switch (type) {
    case 'radial':
      return (
        <motion.div
          className="absolute inset-0 overflow-hidden flex items-center justify-center"
          initial={{ opacity: 0, rotate: -15 }}
          animate={{ opacity: intensity, rotate: 0 }}
          transition={{ duration: 0.4 }}
        >
          <svg 
            viewBox="0 0 400 400" 
            className="absolute"
            style={{
              width: '150%',
              height: '150%',
              minWidth: '100%',
              minHeight: '100%',
            }}
            preserveAspectRatio="xMidYMid slice"
          >
            {Array.from({ length: 20 }).map((_, i) => (
              <motion.polygon
                key={i}
                points="200,200 192,0 208,0"
                fill={i % 2 === 0 ? COLORS.purpleLight : COLORS.purple}
                opacity={i % 2 === 0 ? 0.35 : 0.2}
                style={{
                  transformOrigin: '200px 200px',
                  transform: `rotate(${(360 / 20) * i}deg)`,
                }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.015, duration: 0.25 }}
              />
            ))}
          </svg>
        </motion.div>
      )
    case 'grid':
      return (
        <motion.div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '30px 30px',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: intensity * 0.5 }}
          transition={{ duration: 0.5 }}
        />
      )
    case 'dots':
      return (
        <motion.div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)`,
            backgroundSize: '20px 20px',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: intensity * 0.6 }}
          transition={{ duration: 0.5 }}
        />
      )
    case 'stars':
      // 使用稳定的随机位置
      const starsData = Array.from({ length: 20 }, (_, i) => ({
        left: seededRandom(i * 4 + 500) * 100,
        top: seededRandom(i * 4 + 501) * 100,
        fontSize: 8 + seededRandom(i * 4 + 502) * 12,
        delay: seededRandom(i * 4 + 503) * 2,
        duration: 1 + seededRandom(i * 4 + 504),
        repeatDelay: seededRandom(i * 4 + 505) * 2,
      }))
      return (
        <div className="absolute inset-0 overflow-hidden">
          {starsData.slice(0, Math.floor(20 * intensity)).map((star, i) => (
            <motion.div
              key={i}
              className="absolute text-white"
              style={{
                left: `${star.left}%`,
                top: `${star.top}%`,
                fontSize: star.fontSize,
              }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ 
                opacity: [0, 1, 0],
                scale: [0, 1, 0],
              }}
              transition={{
                delay: star.delay,
                duration: star.duration,
                repeat: Infinity,
                repeatDelay: star.repeatDelay,
              }}
            >
              ✦
            </motion.div>
          ))}
        </div>
      )
    default:
      return null
  }
})

// ============================================
// 装饰效果组件（使用稳定的随机值避免水合错误）
// ============================================
const DecorationEffects = memo(function DecorationEffects({
  types,
  intensity,
  delay = 0.3,
}: {
  types: DecorationEffect[]
  intensity: number
  delay?: number
}) {
  const count = Math.floor(15 * intensity)
  
  // 预生成稳定的随机数据
  const confettiData = useMemo(() => {
    const colors = [COLORS.yellow, COLORS.pink, COLORS.cyan, COLORS.orange, COLORS.green, COLORS.white]
    return Array.from({ length: 20 }, (_, i) => ({
      width: 6 + seededRandom(i * 7 + 1) * 8,
      height: seededRandom(i * 7 + 2) > 0.5 ? 6 + seededRandom(i * 7 + 3) * 8 : 4,
      color: colors[Math.floor(seededRandom(i * 7 + 4) * 6)],
      borderRadius: seededRandom(i * 7 + 5) > 0.5 ? '50%' : '2px',
      x: (seededRandom(i * 7 + 6) - 0.5) * 250,
      y1: (seededRandom(i * 7 + 7) - 0.5) * 200 - 40,
      y2: (seededRandom(i * 7 + 8) - 0.5) * 200,
      rotate: seededRandom(i * 7 + 9) * 360,
      delayOffset: seededRandom(i * 7 + 10) * 0.3,
    }))
  }, [])
  
  const speedlinesData = useMemo(() => {
    const colors = [COLORS.yellow, COLORS.pink, COLORS.cyan, COLORS.white]
    return Array.from({ length: 12 }, (_, i) => {
      const angle = seededRandom(i * 5 + 100) * 360
      return {
        angle,
        width: 60 + seededRandom(i * 5 + 101) * 100,
        height: 2 + seededRandom(i * 5 + 102) * 4,
        color: colors[Math.floor(seededRandom(i * 5 + 103) * 4)],
        distance: 80 + seededRandom(i * 5 + 104) * 60,
        delayOffset: seededRandom(i * 5 + 105) * 0.3,
      }
    })
  }, [])
  
  const emojiSizes = useMemo(() => [28, 32, 26, 30, 24], [])
  
  const sparklesData = useMemo(() => {
    return Array.from({ length: 10 }, (_, i) => ({
      left: 20 + seededRandom(i * 4 + 200) * 60,
      top: 20 + seededRandom(i * 4 + 201) * 60,
      fontSize: 12 + seededRandom(i * 4 + 202) * 16,
      delayOffset: seededRandom(i * 4 + 203) * 0.5,
      repeatDelay: 0.5 + seededRandom(i * 4 + 204),
    }))
  }, [])
  
  const bubblesData = useMemo(() => {
    return Array.from({ length: 15 }, (_, i) => ({
      left: seededRandom(i * 6 + 300) * 100,
      size: 8 + seededRandom(i * 6 + 301) * 20,
      yOffset: -300 - seededRandom(i * 6 + 302) * 100,
      xOffset: (seededRandom(i * 6 + 303) - 0.5) * 50,
      delayOffset: seededRandom(i * 6 + 304) * 1,
      duration: 2 + seededRandom(i * 6 + 305) * 2,
      repeatDelay: seededRandom(i * 6 + 306) * 2,
    }))
  }, [])
  
  return (
    <>
      {types.includes('confetti') && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {confettiData.slice(0, count).map((p, i) => (
            <motion.div
              key={`confetti-${i}`}
              className="absolute left-1/2 top-1/2"
              style={{
                width: p.width,
                height: p.height,
                background: p.color,
                borderRadius: p.borderRadius,
              }}
              initial={{ opacity: 0, scale: 0, x: 0, y: 0, rotate: 0 }}
              animate={{ 
                opacity: [0, 1, 1, 0],
                scale: [0, 1, 1, 0.5],
                x: p.x,
                y: [p.y1, p.y2],
                rotate: p.rotate,
              }}
              transition={{ delay: delay + p.delayOffset, duration: 1, ease: 'easeOut' }}
            />
          ))}
        </div>
      )}
      
      {types.includes('speedlines') && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {speedlinesData.slice(0, Math.floor(count * 0.8)).map((line, i) => (
            <motion.div
              key={`line-${i}`}
              className="absolute left-1/2 top-1/2"
              style={{
                width: line.width,
                height: line.height,
                background: `linear-gradient(90deg, ${line.color} 0%, transparent 100%)`,
                transformOrigin: 'left center',
                borderRadius: 4,
              }}
              initial={{ opacity: 0, scale: 0, rotate: line.angle, x: 0, y: 0 }}
              animate={{ 
                opacity: [0, 1, 0],
                scale: [0, 1, 1.1],
                x: Math.cos(line.angle * Math.PI / 180) * line.distance,
                y: Math.sin(line.angle * Math.PI / 180) * line.distance,
              }}
              transition={{ delay: delay + line.delayOffset, duration: 0.5, ease: 'easeOut' }}
            />
          ))}
        </div>
      )}
      
      {types.includes('emojis') && (
        <div className="absolute inset-0 pointer-events-none">
          {['😂', '🤣', '😆', '🎉', '⭐'].map((emoji, i) => {
            const positions = [
              { x: -120, y: -50 },
              { x: 120, y: -50 },
              { x: -110, y: 50 },
              { x: 110, y: 50 },
              { x: 0, y: -70 },
            ]
            return (
              <motion.div
                key={i}
                className="absolute left-1/2 top-1/2"
                style={{ fontSize: emojiSizes[i] }}
                initial={{ opacity: 0, x: positions[i].x * 1.5, y: positions[i].y * 1.5, scale: 0 }}
                animate={{ 
                  opacity: intensity,
                  x: positions[i].x,
                  y: positions[i].y,
                  scale: [0, 1.2, 1],
                }}
                transition={{ delay: delay + 0.1 + i * 0.05, duration: 0.4, type: 'spring' }}
              >
                {emoji}
              </motion.div>
            )
          })}
        </div>
      )}
      
      {types.includes('sparkles') && (
        <div className="absolute inset-0 pointer-events-none">
          {sparklesData.slice(0, Math.floor(count * 0.6)).map((s, i) => (
            <motion.div
              key={`sparkle-${i}`}
              className="absolute"
              style={{
                left: `${s.left}%`,
                top: `${s.top}%`,
                fontSize: s.fontSize,
                color: COLORS.yellow,
              }}
              initial={{ opacity: 0, scale: 0, rotate: 0 }}
              animate={{ 
                opacity: [0, 1, 0],
                scale: [0, 1, 0],
                rotate: [0, 180],
              }}
              transition={{
                delay: delay + s.delayOffset,
                duration: 0.6,
                repeat: Infinity,
                repeatDelay: s.repeatDelay,
              }}
            >
              ✨
            </motion.div>
          ))}
        </div>
      )}
      
      {types.includes('bubbles') && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {bubblesData.slice(0, count).map((b, i) => (
            <motion.div
              key={`bubble-${i}`}
              className="absolute rounded-full"
              style={{
                left: `${b.left}%`,
                bottom: -20,
                width: b.size,
                height: b.size,
                background: `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.8), rgba(255,255,255,0.2))`,
                border: '1px solid rgba(255,255,255,0.3)',
              }}
              initial={{ opacity: 0, y: 0 }}
              animate={{ 
                opacity: [0, intensity * 0.7, 0],
                y: b.yOffset,
                x: b.xOffset,
              }}
              transition={{
                delay: delay + b.delayOffset,
                duration: b.duration,
                repeat: Infinity,
                repeatDelay: b.repeatDelay,
              }}
            />
          ))}
        </div>
      )}
    </>
  )
})

// ============================================
// 多层文字组件
// ============================================
interface TextLayerProps {
  text: string
  fontSize: number
  textColor: string
  strokeColor: string
  config: AnimationConfig
}

const TextLayer = memo(function TextLayer({
  text,
  fontSize,
  textColor,
  strokeColor,
  config,
}: TextLayerProps) {
  const controls = useAnimation()
  
  const enterVariants = useMemo(() => 
    getEnterVariants(
      config.enter, 
      config.enterDuration, 
      config.enterEasing,
      config.squashStretch,
      config.overshoot,
    ), [config]
  )
  
  const loopVariants = useMemo(() => 
    getLoopVariants(config.loop, config.loopDuration), [config.loop, config.loopDuration]
  )
  
  useEffect(() => {
    const animate = async () => {
      await controls.start('visible')
      if (config.loop !== 'none') {
        controls.start('animate')
      }
    }
    animate()
  }, [controls, config.loop])
  
  // 逐字动画
  if (config.stagger && (config.enter === 'typewriter' || config.enter === 'wave')) {
    return (
      <div className="relative z-10 flex">
        {text.split('').map((char, i) => (
          <motion.span
            key={i}
            initial={{ opacity: 0, y: config.enter === 'wave' ? 20 : 0 }}
            animate={{ 
              opacity: 1, 
              y: 0,
            }}
            transition={{
              delay: config.enterDelay + i * config.staggerDelay,
              duration: config.enterDuration,
            }}
            style={{
              fontFamily: '"Noto Sans SC", "SimHei", sans-serif',
              fontWeight: 900,
              fontSize: `${fontSize}px`,
              background: `linear-gradient(180deg, ${COLORS.yellowLight} 0%, ${textColor} 40%, ${COLORS.yellowDark} 100%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              filter: `drop-shadow(0 0 6px rgba(255, 204, 0, 0.5))`,
              textShadow: `
                -3px -3px 0 ${strokeColor},
                3px -3px 0 ${strokeColor},
                -3px 3px 0 ${strokeColor},
                3px 3px 0 ${strokeColor},
                -4px 0 0 ${COLORS.white},
                4px 0 0 ${COLORS.white},
                0 -4px 0 ${COLORS.white},
                0 4px 0 ${COLORS.white}
              `,
            }}
          >
            {char === ' ' ? '\u00A0' : char}
          </motion.span>
        ))}
      </div>
    )
  }
  
  return (
    <motion.div 
      className="relative z-10"
      initial="hidden"
      animate={controls}
      variants={enterVariants}
      transition={{ delay: config.enterDelay }}
    >
      <motion.div variants={loopVariants}>
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
              transform: 'translate(4px, 4px)',
              whiteSpace: 'nowrap',
              filter: 'blur(3px)',
            }}
          >
            {text}
          </span>
          
          {/* 外描边 */}
          <span
            className="absolute"
            style={{
              fontFamily: '"Noto Sans SC", "SimHei", sans-serif',
              fontWeight: 900,
              fontSize: `${fontSize}px`,
              color: 'transparent',
              WebkitTextStroke: `10px ${COLORS.blueDark}`,
              whiteSpace: 'nowrap',
            }}
          >
            {text}
          </span>
          
          {/* 中描边 */}
          <span
            className="absolute"
            style={{
              fontFamily: '"Noto Sans SC", "SimHei", sans-serif',
              fontWeight: 900,
              fontSize: `${fontSize}px`,
              color: 'transparent',
              WebkitTextStroke: `7px ${COLORS.white}`,
              whiteSpace: 'nowrap',
            }}
          >
            {text}
          </span>
          
          {/* 内描边 */}
          <span
            className="absolute"
            style={{
              fontFamily: '"Noto Sans SC", "SimHei", sans-serif',
              fontWeight: 900,
              fontSize: `${fontSize}px`,
              color: 'transparent',
              WebkitTextStroke: `4px ${strokeColor}`,
              whiteSpace: 'nowrap',
            }}
          >
            {text}
          </span>
          
          {/* 填充层 */}
          <span
            className="relative"
            style={{
              fontFamily: '"Noto Sans SC", "SimHei", sans-serif',
              fontWeight: 900,
              fontSize: `${fontSize}px`,
              background: `linear-gradient(180deg, ${COLORS.yellowLight} 0%, ${textColor} 40%, ${COLORS.yellowDark} 100%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              whiteSpace: 'nowrap',
              display: 'inline-block',
              filter: `drop-shadow(0 0 6px rgba(255, 204, 0, 0.5))`,
            }}
          >
            {text}
          </span>
        </div>
      </motion.div>
    </motion.div>
  )
})

// ============================================
// 主组件
// ============================================
export interface VarietyAnimatedTextProps {
  text: string
  config?: Partial<AnimationConfig>
  fontSize?: number
  className?: string
}

export const VarietyAnimatedText = memo(function VarietyAnimatedText({
  text,
  config: userConfig,
  fontSize = 56,
  className = '',
}: VarietyAnimatedTextProps) {
  const config = useMemo(() => ({
    ...DEFAULT_CONFIG,
    ...userConfig,
  }), [userConfig])
  
  return (
    <div 
      className={`relative w-full h-full min-h-[300px] overflow-hidden flex items-center justify-center ${className}`}
      style={{ 
        background: `linear-gradient(135deg, ${config.backgroundColor} 0%, ${COLORS.purpleDark} 50%, ${COLORS.blueDark} 100%)`,
      }}
    >
      {/* 背景效果 */}
      <BackgroundEffects 
        type={config.background} 
        intensity={config.backgroundIntensity}
        color={config.backgroundColor}
      />
      
      {/* 装饰效果 */}
      <DecorationEffects 
        types={config.decorations}
        intensity={config.decorationIntensity}
        delay={config.enterDelay + config.enterDuration * 0.5}
      />
      
      {/* 文字 */}
      <TextLayer
        text={text}
        fontSize={fontSize}
        textColor={config.textColor}
        strokeColor={config.strokeColor}
        config={config}
      />
    </div>
  )
})

// ============================================
// 预设配置
// ============================================
export const ANIMATION_PRESETS: Record<string, Partial<AnimationConfig>> = {
  '弹跳入场': {
    enter: 'bounce',
    enterDuration: 0.6,
    loop: 'none',
    decorations: ['confetti', 'speedlines'],
  },
  '爆开出现': {
    enter: 'pop',
    enterDuration: 0.4,
    overshoot: 0.4,
    decorations: ['confetti', 'emojis'],
  },
  '果冻弹跳': {
    enter: 'jelly',
    enterDuration: 0.8,
    loop: 'jello',
    loopDuration: 2,
    decorations: ['sparkles'],
  },
  '压扁弹起': {
    enter: 'squash',
    squashStretch: 0.5,
    loop: 'rubber',
    decorations: ['speedlines'],
  },
  '拉伸弹起': {
    enter: 'stretch',
    squashStretch: 0.5,
    loop: 'pulse',
    decorations: ['confetti'],
  },
  '弹性出现': {
    enter: 'elastic',
    enterDuration: 0.8,
    loop: 'bounce',
    loopDuration: 1.5,
    decorations: ['emojis', 'sparkles'],
  },
  '掉落砸下': {
    enter: 'drop',
    enterDuration: 0.6,
    decorations: ['speedlines', 'confetti'],
  },
  '旋转入场': {
    enter: 'rotate',
    enterDuration: 0.6,
    loop: 'swing',
    decorations: ['sparkles'],
  },
  '翻转出现': {
    enter: 'flip-x',
    enterDuration: 0.5,
    loop: 'rock',
    decorations: ['emojis'],
  },
  '缩放模糊': {
    enter: 'zoom-blur',
    enterDuration: 0.4,
    loop: 'glow',
    decorations: ['sparkles', 'bubbles'],
  },
  '打字机效果': {
    enter: 'typewriter',
    stagger: true,
    staggerDelay: 0.08,
    loop: 'none',
    decorations: [],
  },
  '波浪出现': {
    enter: 'wave',
    stagger: true,
    staggerDelay: 0.05,
    loop: 'float',
    decorations: ['bubbles'],
  },
  '心跳跳动': {
    enter: 'pop',
    loop: 'heartbeat',
    loopDuration: 1,
    decorations: ['sparkles', 'emojis'],
  },
  '狂欢庆祝': {
    enter: 'elastic',
    loop: 'tada',
    loopDuration: 1.5,
    decorations: ['confetti', 'emojis', 'sparkles'],
  },
  '闪烁发光': {
    enter: 'scale',
    loop: 'flash',
    loopDuration: 0.5,
    decorations: ['sparkles'],
  },
  '持续摇晃': {
    enter: 'bounce',
    loop: 'shake',
    loopDuration: 0.8,
    decorations: ['speedlines'],
  },
}

export default VarietyAnimatedText

