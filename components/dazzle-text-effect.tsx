'use client'

/**
 * 炫字效果渲染组件
 * 
 * 用于在综艺节目中展示各种炫酷的文字特效
 * 支持入场动画、循环动画、装饰元素等
 */

import React, { useEffect, useState, useRef, useMemo } from 'react'
import { motion, AnimatePresence, Variants } from 'framer-motion'
import {
  DazzleTextPreset,
  getDazzlePresetById,
  dazzlePresetToCSS,
  DAZZLE_ALL_ANIMATIONS_CSS,
  DAZZLE_CATEGORY_CONFIG,
  type DazzleTextCategory,
  type EnterAnimation,
  type LoopAnimation,
} from '@/lib/dazzle-text-presets'

// ============================================
// 类型定义
// ============================================

interface DazzleTextEffectProps {
  /** 显示的文字 */
  text: string
  /** 预设 ID 或预设配置 */
  preset: string | DazzleTextPreset
  /** 缩放比例 */
  scale?: number
  /** 是否自动播放动画 */
  autoPlay?: boolean
  /** 是否显示装饰 */
  showDecorations?: boolean
  /** 动画完成回调 */
  onAnimationComplete?: () => void
  /** 自定义类名 */
  className?: string
}

// ============================================
// 入场动画变体
// ============================================

const getEnterVariants = (animation: EnterAnimation, duration: number): Variants => {
  const baseDuration = duration / 1000

  switch (animation) {
    case 'slam_down':
      return {
        hidden: { 
          y: '-200%', 
          scale: 2, 
          rotate: -10, 
          opacity: 0 
        },
        visible: { 
          y: 0, 
          scale: 1, 
          rotate: 0, 
          opacity: 1,
          transition: {
            type: 'spring',
            stiffness: 300,
            damping: 20,
            duration: baseDuration,
          }
        }
      }
    case 'zoom_bounce':
      return {
        hidden: { 
          scale: 0, 
          rotate: -15, 
          opacity: 0 
        },
        visible: { 
          scale: 1, 
          rotate: 0, 
          opacity: 1,
          transition: {
            type: 'spring',
            stiffness: 400,
            damping: 15,
            duration: baseDuration,
          }
        }
      }
    case 'explode_in':
      return {
        hidden: { 
          scale: 0, 
          opacity: 0,
          filter: 'blur(20px)'
        },
        visible: { 
          scale: 1, 
          opacity: 1,
          filter: 'blur(0px)',
          transition: {
            type: 'spring',
            stiffness: 500,
            damping: 25,
            duration: baseDuration,
          }
        }
      }
    case 'slide_bounce':
      return {
        hidden: { 
          x: '-150%', 
          rotate: -20, 
          opacity: 0 
        },
        visible: { 
          x: 0, 
          rotate: 0, 
          opacity: 1,
          transition: {
            type: 'spring',
            stiffness: 350,
            damping: 18,
            duration: baseDuration,
          }
        }
      }
    case 'wave_in':
      return {
        hidden: { 
          y: '100%', 
          scaleY: 0, 
          opacity: 0 
        },
        visible: { 
          y: 0, 
          scaleY: 1, 
          opacity: 1,
          transition: {
            type: 'spring',
            stiffness: 300,
            damping: 20,
            duration: baseDuration,
          }
        }
      }
    case 'spin_in':
      return {
        hidden: { 
          rotate: -720, 
          scale: 0, 
          opacity: 0 
        },
        visible: { 
          rotate: 0, 
          scale: 1, 
          opacity: 1,
          transition: {
            type: 'spring',
            stiffness: 200,
            damping: 15,
            duration: baseDuration,
          }
        }
      }
    case 'pop_spring':
      return {
        hidden: { 
          scale: 0, 
          y: 50, 
          opacity: 0 
        },
        visible: { 
          scale: 1, 
          y: 0, 
          opacity: 1,
          transition: {
            type: 'spring',
            stiffness: 600,
            damping: 12,
            duration: baseDuration,
          }
        }
      }
    case 'flash_in':
      return {
        hidden: { 
          opacity: 0, 
          scale: 1.5,
          filter: 'brightness(3)'
        },
        visible: { 
          opacity: 1, 
          scale: 1,
          filter: 'brightness(1)',
          transition: {
            duration: baseDuration,
            ease: [0.4, 0, 0.2, 1],
          }
        }
      }
    case 'grow_shake':
      return {
        hidden: { 
          scaleX: 0, 
          opacity: 0 
        },
        visible: { 
          scaleX: 1, 
          opacity: 1,
          transition: {
            type: 'spring',
            stiffness: 400,
            damping: 15,
            duration: baseDuration,
          }
        }
      }
    case 'bounce_sequence':
      return {
        hidden: { 
          y: 100, 
          opacity: 0 
        },
        visible: { 
          y: 0, 
          opacity: 1,
          transition: {
            type: 'spring',
            stiffness: 500,
            damping: 20,
            duration: baseDuration,
          }
        }
      }
    case 'roll_in':
      return {
        hidden: { 
          x: '-100%', 
          rotate: -360, 
          opacity: 0 
        },
        visible: { 
          x: 0, 
          rotate: 0, 
          opacity: 1,
          transition: {
            type: 'spring',
            stiffness: 200,
            damping: 20,
            duration: baseDuration,
          }
        }
      }
    case 'scatter_gather':
      return {
        hidden: { 
          scale: 3, 
          opacity: 0,
          filter: 'blur(30px)'
        },
        visible: { 
          scale: 1, 
          opacity: 1,
          filter: 'blur(0px)',
          transition: {
            duration: baseDuration,
            ease: [0.4, 0, 0.2, 1],
          }
        }
      }
    default:
      return {
        hidden: { opacity: 0, scale: 0.8 },
        visible: { 
          opacity: 1, 
          scale: 1,
          transition: { duration: baseDuration }
        }
      }
  }
}

// ============================================
// 循环动画配置
// ============================================

const getLoopAnimation = (animation: LoopAnimation, duration: number) => {
  if (animation === 'none') return undefined

  const baseDuration = duration / 1000

  switch (animation) {
    case 'pulse':
      return {
        scale: [1, 1.08, 1],
        transition: {
          duration: baseDuration,
          repeat: Infinity,
          ease: 'easeInOut',
        }
      }
    case 'shake':
      return {
        x: [0, -3, 3, -3, 0],
        rotate: [0, -1, 1, -1, 0],
        transition: {
          duration: baseDuration,
          repeat: Infinity,
          ease: 'easeInOut',
        }
      }
    case 'float':
      return {
        y: [0, -8, 0],
        rotate: [-1, 1, -1],
        transition: {
          duration: baseDuration,
          repeat: Infinity,
          ease: 'easeInOut',
        }
      }
    case 'glow':
      return {
        filter: [
          'drop-shadow(0 0 15px currentColor)',
          'drop-shadow(0 0 30px currentColor) drop-shadow(0 0 60px currentColor)',
          'drop-shadow(0 0 15px currentColor)',
        ],
        transition: {
          duration: baseDuration,
          repeat: Infinity,
          ease: 'easeInOut',
        }
      }
    case 'breathe':
      return {
        scale: [1, 1.03, 1],
        opacity: [1, 0.95, 1],
        transition: {
          duration: baseDuration,
          repeat: Infinity,
          ease: 'easeInOut',
        }
      }
    case 'wiggle':
      return {
        rotate: [0, -3, 3, -3, 0],
        transition: {
          duration: baseDuration,
          repeat: Infinity,
          ease: 'easeInOut',
        }
      }
    case 'bounce':
      return {
        y: [0, -10, 0],
        transition: {
          duration: baseDuration,
          repeat: Infinity,
          ease: 'easeInOut',
        }
      }
    case 'rotate':
      return {
        rotate: [0, 360],
        transition: {
          duration: baseDuration,
          repeat: Infinity,
          ease: 'linear',
        }
      }
    case 'flash':
      return {
        opacity: [1, 0.7, 1, 0.7, 1],
        transition: {
          duration: baseDuration,
          repeat: Infinity,
          ease: 'easeInOut',
        }
      }
    case 'jelly':
      return {
        scaleX: [1, 0.95, 1.05, 0.98, 1],
        scaleY: [1, 1.05, 0.95, 1.02, 1],
        transition: {
          duration: baseDuration,
          repeat: Infinity,
          ease: 'easeInOut',
        }
      }
    case 'swing':
      return {
        rotate: [-5, 5, -5],
        transition: {
          duration: baseDuration,
          repeat: Infinity,
          ease: 'easeInOut',
        }
      }
    default:
      return undefined
  }
}

// ============================================
// 装饰元素组件
// ============================================

interface DecorationProps {
  preset: DazzleTextPreset
  scale: number
  isAnimating: boolean
}

const Decorations: React.FC<DecorationProps> = ({ preset, scale, isAnimating }) => {
  const decorations = preset.decorations.filter(d => d.enabled)
  
  if (decorations.length === 0) return null

  return (
    <>
      {decorations.map((deco, index) => {
        if (deco.type === 'emoji' && deco.items) {
          return (
            <div key={index} className="absolute inset-0 pointer-events-none overflow-visible">
              {deco.items.slice(0, deco.count || 4).map((emoji, i) => {
                const positions = getDecorationPositions(deco.position, i, deco.count || 4)
                return (
                  <motion.span
                    key={i}
                    className="absolute"
                    style={{
                      fontSize: `${(deco.size || 40) * scale}px`,
                      ...positions,
                    }}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={isAnimating ? {
                      opacity: 1,
                      scale: 1,
                      y: deco.animated ? [0, -10, 0] : 0,
                    } : { opacity: 0, scale: 0 }}
                    transition={{
                      delay: 0.2 + i * 0.1,
                      duration: 0.4,
                      y: deco.animated ? {
                        duration: 2,
                        repeat: Infinity,
                        ease: 'easeInOut',
                        delay: i * 0.3,
                      } : undefined,
                    }}
                  >
                    {emoji}
                  </motion.span>
                )
              })}
            </div>
          )
        }

        if (deco.type === 'sparkle' && deco.items) {
          return (
            <div key={index} className="absolute inset-0 pointer-events-none overflow-visible">
              {deco.items.slice(0, deco.count || 6).map((sparkle, i) => {
                const angle = (360 / (deco.count || 6)) * i
                const distance = 80 * scale
                return (
                  <motion.span
                    key={i}
                    className="absolute"
                    style={{
                      fontSize: `${24 * scale}px`,
                      left: '50%',
                      top: '50%',
                      transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(-${distance}px)`,
                    }}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={isAnimating ? {
                      opacity: [0, 1, 0.5, 1],
                      scale: [0, 1.2, 0.8, 1],
                      rotate: deco.animated ? [0, 180, 360] : 0,
                    } : { opacity: 0, scale: 0 }}
                    transition={{
                      delay: 0.3 + i * 0.05,
                      duration: deco.animated ? 2 : 0.5,
                      repeat: deco.animated ? Infinity : 0,
                      ease: 'easeInOut',
                    }}
                  >
                    {sparkle}
                  </motion.span>
                )
              })}
            </div>
          )
        }

        if (deco.type === 'explosion') {
          return (
            <motion.div
              key={index}
              className="absolute inset-0 pointer-events-none"
              style={{
                background: `radial-gradient(circle, ${deco.color || '#FFD700'}40 0%, transparent 70%)`,
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={isAnimating ? {
                scale: [0, 1.5, 1.2],
                opacity: [0, 0.8, 0.4],
              } : { scale: 0, opacity: 0 }}
              transition={{
                duration: 0.6,
                times: [0, 0.4, 1],
              }}
            />
          )
        }

        if (deco.type === 'speed_lines') {
          return (
            <div key={index} className="absolute inset-0 pointer-events-none overflow-hidden">
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute"
                  style={{
                    left: '50%',
                    top: '50%',
                    width: '200%',
                    height: '3px',
                    background: `linear-gradient(90deg, transparent, ${deco.color || '#FFF'}, transparent)`,
                    transform: `translate(-50%, -50%) rotate(${(360 / 8) * i}deg)`,
                    transformOrigin: 'center',
                  }}
                  initial={{ scaleX: 0, opacity: 0 }}
                  animate={isAnimating ? {
                    scaleX: [0, 1, 0],
                    opacity: [0, 0.7, 0],
                  } : { scaleX: 0, opacity: 0 }}
                  transition={{
                    duration: 0.8,
                    delay: i * 0.02,
                    repeat: deco.animated ? Infinity : 0,
                    repeatDelay: 0.5,
                  }}
                />
              ))}
            </div>
          )
        }

        if (deco.type === 'confetti') {
          return (
            <div key={index} className="absolute inset-0 pointer-events-none overflow-hidden">
              {[...Array(deco.count || 15)].map((_, i) => {
                const colors = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3', '#F38181', '#AA96DA', '#FCBAD3']
                return (
                  <motion.div
                    key={i}
                    className="absolute"
                    style={{
                      left: `${10 + Math.random() * 80}%`,
                      top: '-20px',
                      width: `${8 + Math.random() * 8}px`,
                      height: `${8 + Math.random() * 8}px`,
                      backgroundColor: colors[i % colors.length],
                      borderRadius: Math.random() > 0.5 ? '50%' : '2px',
                    }}
                    initial={{ y: 0, opacity: 0, rotate: 0 }}
                    animate={isAnimating ? {
                      y: [0, 300 * scale],
                      opacity: [0, 1, 1, 0],
                      rotate: [0, 360 * (Math.random() > 0.5 ? 1 : -1)],
                      x: [0, (Math.random() - 0.5) * 100],
                    } : { y: 0, opacity: 0 }}
                    transition={{
                      duration: 2 + Math.random(),
                      delay: Math.random() * 0.5,
                      repeat: deco.animated ? Infinity : 0,
                      repeatDelay: Math.random(),
                    }}
                  />
                )
              })}
            </div>
          )
        }

        if (deco.type === 'lightning') {
          return (
            <motion.div
              key={index}
              className="absolute inset-0 pointer-events-none"
              initial={{ opacity: 0 }}
              animate={isAnimating ? {
                opacity: [0, 1, 0.3, 1, 0, 1, 0],
              } : { opacity: 0 }}
              transition={{
                duration: 0.5,
                repeat: deco.animated ? Infinity : 0,
                repeatDelay: 1,
              }}
            >
              <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
                <path
                  d="M50 0 L60 35 L80 35 L40 60 L50 45 L30 45 Z"
                  fill={deco.color || '#FFD700'}
                  filter="url(#glow)"
                />
                <defs>
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                    <feMerge>
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                </defs>
              </svg>
            </motion.div>
          )
        }

        return null
      })}
    </>
  )
}

// 获取装饰元素位置
function getDecorationPositions(
  position: string, 
  index: number, 
  total: number
): React.CSSProperties {
  switch (position) {
    case 'above':
      return {
        top: '-30%',
        left: `${20 + (60 / total) * index}%`,
        transform: 'translate(-50%, 0)',
      }
    case 'below':
      return {
        bottom: '-30%',
        left: `${20 + (60 / total) * index}%`,
        transform: 'translate(-50%, 0)',
      }
    case 'left':
      return {
        left: '-20%',
        top: `${20 + (60 / total) * index}%`,
        transform: 'translate(0, -50%)',
      }
    case 'right':
      return {
        right: '-20%',
        top: `${20 + (60 / total) * index}%`,
        transform: 'translate(0, -50%)',
      }
    case 'corners': {
      const corners = [
        { top: '-15%', left: '-10%' },
        { top: '-15%', right: '-10%' },
        { bottom: '-15%', left: '-10%' },
        { bottom: '-15%', right: '-10%' },
      ]
      return corners[index % 4]
    }
    case 'around': {
      const angle = (360 / total) * index - 90
      const rad = angle * (Math.PI / 180)
      const distance = 60
      return {
        left: `calc(50% + ${Math.cos(rad) * distance}px)`,
        top: `calc(50% + ${Math.sin(rad) * distance}px)`,
        transform: 'translate(-50%, -50%)',
      }
    }
    case 'random':
    default: {
      // 使用固定种子生成伪随机位置
      const seed = index * 137.508
      const x = (Math.sin(seed) * 0.5 + 0.5) * 80 + 10
      const y = (Math.cos(seed * 2) * 0.5 + 0.5) * 80 + 10
      return {
        left: `${x}%`,
        top: `${y}%`,
        transform: 'translate(-50%, -50%)',
      }
    }
  }
}

// ============================================
// 主组件
// ============================================

export const DazzleTextEffect: React.FC<DazzleTextEffectProps> = ({
  text,
  preset: presetProp,
  scale = 1,
  autoPlay = true,
  showDecorations = true,
  onAnimationComplete,
  className = '',
}) => {
  const [isAnimating, setIsAnimating] = useState(false)
  const [hasEntered, setHasEntered] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // 获取预设配置
  const preset = useMemo(() => {
    if (typeof presetProp === 'string') {
      return getDazzlePresetById(presetProp)
    }
    return presetProp
  }, [presetProp])

  // 自动播放
  useEffect(() => {
    if (autoPlay && preset) {
      setIsAnimating(true)
    }
  }, [autoPlay, preset])

  // 入场动画完成后设置 hasEntered
  const handleAnimationComplete = () => {
    setHasEntered(true)
    onAnimationComplete?.()
  }

  if (!preset) {
    return (
      <div className={`text-red-500 ${className}`}>
        预设不存在: {typeof presetProp === 'string' ? presetProp : 'unknown'}
      </div>
    )
  }

  // 获取样式
  const textStyle = dazzlePresetToCSS(preset, scale)
  const enterVariants = getEnterVariants(preset.animation.enter, preset.animation.enterDuration)
  const loopAnimation = hasEntered ? getLoopAnimation(
    preset.animation.loop, 
    preset.animation.loopDuration || 1000
  ) : undefined

  // 类别配置
  const categoryConfig = DAZZLE_CATEGORY_CONFIG[preset.category]

  return (
    <>
      {/* 注入动画样式 */}
      <style dangerouslySetInnerHTML={{ __html: DAZZLE_ALL_ANIMATIONS_CSS }} />
      
      <div 
        ref={containerRef}
        className={`relative inline-block ${className}`}
      >
        {/* 装饰元素 */}
        {showDecorations && (
          <Decorations preset={preset} scale={scale} isAnimating={isAnimating} />
        )}

        {/* 主文字 */}
        <motion.div
          className="relative z-10"
          style={textStyle}
          variants={enterVariants}
          initial="hidden"
          animate={isAnimating ? (hasEntered ? loopAnimation : 'visible') : 'hidden'}
          onAnimationComplete={handleAnimationComplete}
        >
          {/* 逐字动画 */}
          {preset.animation.stagger ? (
            <span className="inline-flex">
              {text.split('').map((char, index) => (
                <motion.span
                  key={index}
                  style={{ display: 'inline-block' }}
                  initial={{ opacity: 0, y: 50, scale: 0 }}
                  animate={isAnimating ? { 
                    opacity: 1, 
                    y: 0, 
                    scale: 1,
                  } : { opacity: 0, y: 50, scale: 0 }}
                  transition={{
                    delay: index * (preset.animation.stagger / 1000),
                    type: 'spring',
                    stiffness: 500,
                    damping: 20,
                  }}
                >
                  {char === ' ' ? '\u00A0' : char}
                </motion.span>
              ))}
            </span>
          ) : (
            text
          )}
        </motion.div>
      </div>
    </>
  )
}

// ============================================
// 炫字预览卡片组件
// ============================================

interface DazzlePreviewCardProps {
  preset: DazzleTextPreset
  scale?: number
  onClick?: () => void
  className?: string
}

export const DazzlePreviewCard: React.FC<DazzlePreviewCardProps> = ({
  preset,
  scale = 0.35,
  onClick,
  className = '',
}) => {
  const [isHovered, setIsHovered] = useState(false)
  const categoryConfig = DAZZLE_CATEGORY_CONFIG[preset.category]
  
  // 静态样式预览
  const previewStyle = dazzlePresetToCSS(preset, scale)
  
  // 预览文字
  const previewText = preset.name.replace(/[^\u4e00-\u9fa5a-zA-Z0-9]/g, '').slice(0, 4) || '炫字'

  return (
    <motion.div
      className={`
        relative group rounded-xl overflow-hidden border border-surface-700 
        hover:border-surface-500 transition-all cursor-pointer bg-surface-800/50
        ${className}
      `}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ scale: 1.03 }}
    >
      {/* 预览区域 */}
      <div 
        className="relative aspect-video flex items-center justify-center p-4 overflow-hidden"
        style={{
          background: `
            radial-gradient(ellipse at center, ${preset.color.primary}15 0%, transparent 70%), 
            linear-gradient(135deg, #1a1a2e 0%, #0d0d15 100%)
          `,
        }}
      >
        {/* 网格背景 */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
            `,
            backgroundSize: '20px 20px',
          }}
        />
        
        {/* 静态文字预览 */}
        <div 
          className="relative z-10 text-center"
          style={{
            ...previewStyle,
            maxWidth: '100%',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {previewText}
        </div>

        {/* 类别标签 */}
        <div className="absolute top-2 right-2">
          <span 
            className={`
              inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full
              ${categoryConfig.bgColor} ${categoryConfig.color}
            `}
          >
            <span>{categoryConfig.icon}</span>
            <span>{categoryConfig.label}</span>
          </span>
        </div>

        {/* 悬浮播放提示 */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-white text-xs">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z"/>
            </svg>
            预览动效
          </div>
        </div>
      </div>
      
      {/* 信息 */}
      <div className="p-3 bg-surface-850">
        <p className="text-sm font-medium text-surface-200 truncate" title={preset.name}>
          {preset.name}
        </p>
        <p className="text-xs text-surface-500 mt-0.5 truncate">{preset.description}</p>
        <div className="flex items-center gap-2 mt-2">
          <span className="text-xs text-surface-600">
            ⏱️ {(preset.duration / 1000).toFixed(1)}s
          </span>
          <span className="text-xs text-surface-600">
            🎬 {preset.animation.enter.replace(/_/g, ' ')}
          </span>
        </div>
      </div>
    </motion.div>
  )
}

export default DazzleTextEffect















