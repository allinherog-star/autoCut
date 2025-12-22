'use client'

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { motion, AnimatePresence, useAnimationControls, Variants } from 'framer-motion'
import { CanvasFancyTextPlayer } from '@/components/canvas-fancy-text-player'

import { loadPresetComponent } from '@/assets/fancy-text-presets'
import type {
  FancyTextTemplate,
  FancyTextGlobalParams,
  CharacterParams,
  EntranceAnimation,
  LoopAnimation,
  ExitAnimation,
  ColorValue,
  DecorationConfig,
} from '@/lib/fancy-text/types'
import { ENTRANCE_ANIMATIONS, LOOP_ANIMATIONS, EXIT_ANIMATIONS } from '@/lib/fancy-text/animations'

// ============================================
// 类型定义
// ============================================

interface FancyTextRendererProps {
  template: FancyTextTemplate
  text?: string // 覆盖模版文字
  color?: ColorValue // 覆盖模版颜色
  scale?: number // 缩放比例
  autoPlay?: boolean // 自动播放动画
  skipToEnd?: boolean // 跳过动画直接显示最终帧
  loop?: boolean // 循环播放
  showDecorations?: boolean // 显示装饰
  clipOverflow?: boolean // 是否裁剪溢出内容（预览卡片使用）
  className?: string
  onAnimationComplete?: () => void
}

// ============================================
// 工具函数
// ============================================

/** 将颜色值转换为 CSS */
function colorToCSS(color: ColorValue): string {
  if (color.type === 'solid') {
    return color.value
  }
  return color.value // 渐变直接返回
}

/** 生成文字渐变 CSS */
function getTextGradientStyle(color: ColorValue): React.CSSProperties {
  if (color.type === 'solid') {
    return { color: color.value }
  }
  return {
    background: color.value,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  }
}

/** 生成阴影 CSS */
function getShadowStyle(params: FancyTextGlobalParams): string {
  const shadows: string[] = []

  if (params.shadow.enabled) {
    shadows.push(
      `${params.shadow.offsetX}px ${params.shadow.offsetY}px ${params.shadow.blur}px ${params.shadow.color}`
    )
  }

  if (params.glow.enabled) {
    shadows.push(
      `0 0 ${params.glow.blur}px ${params.glow.color}`,
      `0 0 ${params.glow.blur * 2}px ${params.glow.color}`
    )
  }

  return shadows.join(', ') || 'none'
}

/** 生成描边 CSS */
function getStrokeStyle(params: FancyTextGlobalParams): string {
  if (!params.stroke.enabled) return 'none'
  return `${params.stroke.width}px ${params.stroke.color}`
}

/** 缓动函数映射 */
const EASING_MAP: Record<string, string | number[]> = {
  linear: 'linear',
  ease: 'easeInOut',
  'ease-in': 'easeIn',
  'ease-out': 'easeOut',
  'ease-in-out': 'easeInOut',
  bounce: [0.68, -0.55, 0.265, 1.55],
  elastic: [0.68, -0.6, 0.32, 1.6],
  spring: [0.175, 0.885, 0.32, 1.275],
}

/** 获取入场动画变体 */
function getEntranceVariants(
  type: EntranceAnimation,
  duration: number,
  easing: string,
  delay: number = 0
): Variants {
  const animDef = ENTRANCE_ANIMATIONS[type]
  if (!animDef || type === 'none') {
    return {
      hidden: { opacity: 1 },
      visible: { opacity: 1 },
    }
  }

  const keyframes = animDef.keyframes
  const firstFrame = keyframes[0]?.properties || {}
  const lastFrame = keyframes[keyframes.length - 1]?.properties || {}

  return {
    hidden: {
      opacity: firstFrame.opacity ?? 0,
      scale: firstFrame.scale ?? 1,
      x: firstFrame.translateX ?? 0,
      y: firstFrame.translateY ?? 0,
      rotate: firstFrame.rotation ?? 0,
      filter: firstFrame.blur ? `blur(${firstFrame.blur}px)` : 'blur(0px)',
      scaleX: firstFrame.scaleX ?? 1,
      scaleY: firstFrame.scaleY ?? 1,
      skewX: firstFrame.skewX ?? 0,
    },
    visible: {
      opacity: lastFrame.opacity ?? 1,
      scale: lastFrame.scale ?? 1,
      x: lastFrame.translateX ?? 0,
      y: lastFrame.translateY ?? 0,
      rotate: lastFrame.rotation ?? 0,
      filter: lastFrame.blur ? `blur(${lastFrame.blur}px)` : 'blur(0px)',
      scaleX: lastFrame.scaleX ?? 1,
      scaleY: lastFrame.scaleY ?? 1,
      skewX: lastFrame.skewX ?? 0,
      transition: {
        duration,
        delay,
        ease: EASING_MAP[easing] || 'easeOut',
      },
    },
  }
}

/** 获取循环动画变体 */
function getLoopVariants(
  type: LoopAnimation,
  duration: number
): Variants {
  const animDef = LOOP_ANIMATIONS[type]
  if (!animDef || type === 'none') {
    return {}
  }

  switch (type) {
    case 'breath-glow':
      return {
        animate: {
          opacity: [1, 0.7, 1],
          transition: { duration, repeat: Infinity, ease: 'easeInOut' },
        },
      }
    case 'neon-flicker':
      return {
        animate: {
          opacity: [1, 0.8, 1, 0.9, 0.7, 1, 0.85, 1],
          transition: { duration, repeat: Infinity },
        },
      }
    case 'q-bounce':
      return {
        animate: {
          scaleY: [1, 0.95, 1.05, 0.98, 1],
          scaleX: [1, 1.05, 0.95, 1.02, 1],
          transition: { duration, repeat: Infinity, ease: 'easeInOut' },
        },
      }
    case 'float':
      return {
        animate: {
          y: [0, -10, 0],
          transition: { duration, repeat: Infinity, ease: 'easeInOut' },
        },
      }
    case 'pulse':
      return {
        animate: {
          scale: [1, 1.05, 1],
          transition: { duration, repeat: Infinity, ease: 'easeInOut' },
        },
      }
    case 'swing':
      return {
        animate: {
          rotate: [0, 5, 0, -5, 0],
          transition: { duration, repeat: Infinity, ease: 'easeInOut' },
        },
      }
    case 'shake':
      return {
        animate: {
          x: [0, -5, 5, -5, 5, -3, 3, -2, 2, -1, 0],
          transition: { duration, repeat: Infinity },
        },
      }
    case 'rotate':
      return {
        animate: {
          rotate: [0, 360],
          transition: { duration, repeat: Infinity, ease: 'linear' },
        },
      }
    case 'sparkle':
      return {
        animate: {
          opacity: [1, 0.8, 1, 0.9, 1],
          transition: { duration, repeat: Infinity },
        },
      }
    default:
      return {}
  }
}

// ============================================
// 装饰组件
// ============================================

interface DecorationProps {
  config: DecorationConfig
  textBounds: { width: number; height: number }
}

function Decoration({ config, textBounds }: DecorationProps) {
  if (!config.enabled) return null

  const { type, position, color, size = 20, count = 5, items } = config

  switch (type) {
    case 'sparkle':
      return (
        <div className="absolute inset-0 pointer-events-none overflow-visible">
          {Array.from({ length: count }).map((_, i) => (
            <motion.span
              key={i}
              className="absolute text-yellow-400"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                fontSize: size * (0.5 + Math.random() * 0.5),
              }}
              animate={{
                opacity: [0, 1, 0],
                scale: [0, 1, 0],
              }}
              transition={{
                duration: 1 + Math.random(),
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            >
              ✨
            </motion.span>
          ))}
        </div>
      )

    case 'emoji':
      if (!items?.length) return null
      return (
        <div className="absolute inset-0 pointer-events-none overflow-visible">
          {items.slice(0, count).map((emoji, i) => {
            const angle = (i / count) * Math.PI * 2
            const radius = Math.max(textBounds.width, textBounds.height) * 0.6
            return (
              <motion.span
                key={i}
                className="absolute"
                style={{
                  left: `calc(50% + ${Math.cos(angle) * radius}px)`,
                  top: `calc(50% + ${Math.sin(angle) * radius}px)`,
                  fontSize: size,
                  transform: 'translate(-50%, -50%)',
                }}
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 10, -10, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
              >
                {emoji}
              </motion.span>
            )
          })}
        </div>
      )

    case 'star-burst':
      return (
        <div className="absolute inset-0 pointer-events-none overflow-visible">
          {Array.from({ length: count }).map((_, i) => {
            const angle = (i / count) * Math.PI * 2
            const radius = Math.max(textBounds.width, textBounds.height) * 0.5
            return (
              <motion.div
                key={i}
                className="absolute w-2 h-2 rounded-full"
                style={{
                  backgroundColor: color || '#FFD700',
                  left: '50%',
                  top: '50%',
                }}
                animate={{
                  x: [0, Math.cos(angle) * radius],
                  y: [0, Math.sin(angle) * radius],
                  opacity: [0, 1, 0],
                  scale: [0, 1, 0.5],
                }}
                transition={{
                  duration: 0.6,
                  delay: i * 0.05,
                }}
              />
            )
          })}
        </div>
      )

    case 'confetti':
      return (
        <div className="absolute inset-0 pointer-events-none overflow-visible">
          {Array.from({ length: count * 2 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-3 rounded-sm"
              style={{
                backgroundColor: ['#FF6B6B', '#FFE66D', '#4ECDC4', '#FF69B4', '#00D2FF'][i % 5],
                left: `${Math.random() * 100}%`,
                top: '-10%',
              }}
              animate={{
                y: [0, textBounds.height + 50],
                x: [0, (Math.random() - 0.5) * 100],
                rotate: [0, 360 * (Math.random() > 0.5 ? 1 : -1)],
                opacity: [1, 1, 0],
              }}
              transition={{
                duration: 2 + Math.random(),
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>
      )

    default:
      return null
  }
}

// ============================================
// 单字符组件
// ============================================

interface CharacterRendererProps {
  char: string
  index: number
  globalParams: FancyTextGlobalParams
  charParams?: CharacterParams
  scale: number
  entranceType: EntranceAnimation
  loopType: LoopAnimation
  isVisible: boolean
}

function CharacterRenderer({
  char,
  index,
  globalParams,
  charParams,
  scale,
  entranceType,
  loopType,
  isVisible,
}: CharacterRendererProps) {
  const controls = useAnimationControls()

  // 字符参数
  const offsetX = (charParams?.offsetX || 0) * scale
  const offsetY = (charParams?.offsetY || 0) * scale
  const charScale = charParams?.scale || 1
  const rotation = charParams?.rotation || 0
  const fontSizeMultiplier = charParams?.fontSizeMultiplier || 1
  const entranceDelay = charParams?.entranceDelay || index * 0.05

  // 动画变体
  const entranceVariants = useMemo(
    () => getEntranceVariants(
      entranceType,
      globalParams.animation.entranceDuration,
      globalParams.animation.entranceEasing,
      entranceDelay
    ),
    [entranceType, globalParams.animation.entranceDuration, globalParams.animation.entranceEasing, entranceDelay]
  )

  const loopVariants = useMemo(
    () => getLoopVariants(loopType, globalParams.animation.loopDuration),
    [loopType, globalParams.animation.loopDuration]
  )

  // 播放循环动画
  useEffect(() => {
    if (isVisible && loopType !== 'none') {
      const timer = setTimeout(() => {
        controls.start('animate')
      }, (globalParams.animation.entranceDuration + entranceDelay + globalParams.animation.loopDelay) * 1000)
      return () => clearTimeout(timer)
    }
  }, [isVisible, loopType, controls, globalParams.animation, entranceDelay])

  // 计算样式
  const fontSize = globalParams.fontSize * scale * fontSizeMultiplier
  const textStyle: React.CSSProperties = {
    ...getTextGradientStyle(charParams?.colorOverride
      ? { type: 'solid', value: charParams.colorOverride }
      : globalParams.color
    ),
    fontFamily: globalParams.fontFamily,
    fontSize,
    fontWeight: globalParams.fontWeight,
    letterSpacing: globalParams.letterSpacing * scale,
    lineHeight: globalParams.lineHeight,
    textShadow: getShadowStyle(globalParams),
    WebkitTextStroke: getStrokeStyle(globalParams),
    display: 'inline-block',
    whiteSpace: 'pre',
  }

  return (
    <motion.span
      style={{
        ...textStyle,
        x: offsetX,
        y: offsetY,
        rotate: rotation,
        scale: charScale,
      }}
      initial="hidden"
      animate={isVisible ? ['visible', 'animate'] : 'hidden'}
      variants={{ ...entranceVariants, ...loopVariants }}
    >
      {char}
    </motion.span>
  )
}

// ============================================
// React 组件动态渲染器
// ============================================

interface ReactComponentRendererProps {
  templateId: string
  text: string
  scale: number
  autoPlay: boolean
  skipToEnd?: boolean  // 跳过动画直接显示最终帧
  clipOverflow?: boolean  // 是否裁剪溢出内容（预览卡片使用）
  template: FancyTextTemplate
  className?: string
  onAnimationComplete?: () => void
}

function ReactComponentRenderer({
  templateId,
  text,
  scale,
  autoPlay,
  skipToEnd = false,
  clipOverflow = false,
  template,
  className = '',
  onAnimationComplete,
}: ReactComponentRendererProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [Component, setComponent] = useState<React.ComponentType<any> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function loadComponent() {
      try {
        setLoading(true)
        setError(null)
        const loaded = await loadPresetComponent(templateId)
        if (!cancelled) {
          setComponent(() => loaded)
        }
      } catch (err) {
        if (!cancelled) {
          console.error(`Failed to load component for ${templateId}:`, err)
          setError(`加载组件失败: ${templateId}`)
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadComponent()
    return () => { cancelled = true }
  }, [templateId])

  if (loading) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error || !Component) {
    return (
      <div className={`flex items-center justify-center text-red-400 text-sm ${className}`}>
        {error || '组件未找到'}
      </div>
    )
  }

  // 从 template 获取颜色配置
  const colorPreset = template.colorPresets?.[0]
  const gradient = colorPreset?.gradient || template.globalParams.color.value
  const strokeColor = colorPreset?.strokeColor || template.globalParams.stroke.color
  const glowColor = colorPreset?.glowColor || template.globalParams.glow.color

  return (
    <div className={className} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: clipOverflow ? 'hidden' : 'visible' }}>
      <Component
        text={text}
        scale={scale}
        gradient={gradient}
        strokeColor={strokeColor}
        glowColor={glowColor}
        autoPlay={autoPlay}
        skipToEnd={skipToEnd}
        onComplete={onAnimationComplete}
      />
    </div>
  )
}

// ============================================
// 主组件
// ============================================

export function FancyTextRenderer({
  template,
  text,
  scale = 1,
  autoPlay = true,
  skipToEnd = false,
  loop = false,
  showDecorations = true,
  clipOverflow = false,
  className = '',
  onAnimationComplete,
}: FancyTextRendererProps) {
  // Canvas 渲染逻辑
  if (template.renderer === 'canvas' && template.canvasPresetId) {
    let scene = null
    const displayText = text || template.globalParams.text

    if (scene) {
      return (
        <div className={className} style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
          <div style={{ transform: `scale(${scale})`, transformOrigin: 'center center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CanvasFancyTextPlayer
              scene={scene}
              autoPlay={autoPlay}
              loop={loop}
              showControls={false}
              className="w-full h-full"
              onComplete={onAnimationComplete}
            />
          </div>
        </div>
      )
    }
  }

  // React 组件渲染逻辑 (动态加载 motion.tsx)
  if (template.renderer === 'react' && template.id) {
    return (
      <ReactComponentRenderer
        templateId={template.id}
        text={text || template.globalParams.text}
        scale={scale}
        autoPlay={autoPlay}
        skipToEnd={skipToEnd}
        clipOverflow={clipOverflow}
        template={template}
        className={className}
        onAnimationComplete={onAnimationComplete}
      />
    )
  }

  const [isVisible, setIsVisible] = useState(autoPlay)

  // 监听 autoPlay 变化
  useEffect(() => {
    if (autoPlay) {
      setIsVisible(true)
    }
  }, [autoPlay])

  const [textBounds, setTextBounds] = useState({ width: 0, height: 0 })
  const containerRef = useRef<HTMLDivElement>(null)

  const displayText = text || template.globalParams.text
  const { globalParams, perCharacter } = template

  // 测量文字尺寸
  useEffect(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      setTextBounds({ width: rect.width, height: rect.height })
    }
  }, [displayText, scale])

  // 整体样式
  const containerStyle: React.CSSProperties = {
    transform: `rotate(${globalParams.rotation}deg) skewX(${globalParams.skewX}deg) skewY(${globalParams.skewY}deg)`,
    position: 'relative',
    display: 'inline-block',
  }

  // 非逐字模式的样式
  const textStyle: React.CSSProperties = {
    ...getTextGradientStyle(globalParams.color),
    fontFamily: globalParams.fontFamily,
    fontSize: globalParams.fontSize * scale,
    fontWeight: globalParams.fontWeight,
    letterSpacing: globalParams.letterSpacing * scale,
    lineHeight: globalParams.lineHeight,
    textShadow: getShadowStyle(globalParams),
    WebkitTextStroke: getStrokeStyle(globalParams),
    whiteSpace: 'nowrap',
  }

  // 入场动画
  const entranceVariants = useMemo(
    () => getEntranceVariants(
      globalParams.animation.entrance,
      globalParams.animation.entranceDuration,
      globalParams.animation.entranceEasing,
      globalParams.animation.entranceDelay
    ),
    [globalParams.animation]
  )

  // 循环动画
  const loopVariants = useMemo(
    () => getLoopVariants(globalParams.animation.loop, globalParams.animation.loopDuration),
    [globalParams.animation.loop, globalParams.animation.loopDuration]
  )

  // 重播功能
  const replay = useCallback(() => {
    setIsVisible(false)
    requestAnimationFrame(() => {
      setIsVisible(true)
    })
  }, [])

  // 暴露重播方法
  useEffect(() => {
    if ((window as any).__fancyTextReplay) {
      (window as any).__fancyTextReplay[template.id] = replay
    }
  }, [replay, template.id])

  return (
    <div
      ref={containerRef}
      className={`fancy-text-renderer ${className}`}
      style={containerStyle}
    >
      {/* 装饰层（后面） */}
      {showDecorations && globalParams.decorations
        .filter(d => d.position === 'behind')
        .map((decoration, i) => (
          <Decoration key={i} config={decoration} textBounds={textBounds} />
        ))
      }

      {/* 文字层 */}
      <AnimatePresence mode="wait">
        {isVisible && (
          perCharacter.enabled ? (
            // 逐字渲染模式
            <div className="inline-flex">
              {displayText.split('').map((char, index) => (
                <CharacterRenderer
                  key={`${char}-${index}`}
                  char={char}
                  index={index}
                  globalParams={globalParams}
                  charParams={perCharacter.characters[index]}
                  scale={scale}
                  entranceType={globalParams.animation.entrance}
                  loopType={globalParams.animation.loop}
                  isVisible={isVisible}
                />
              ))}
            </div>
          ) : (
            // 整体渲染模式
            <motion.span
              style={textStyle}
              initial="hidden"
              animate="visible"
              variants={entranceVariants}
              onAnimationComplete={() => {
                onAnimationComplete?.()
              }}
            >
              <motion.span
                variants={loopVariants}
                animate={globalParams.animation.loop !== 'none' ? 'animate' : undefined}
              >
                {displayText}
              </motion.span>
            </motion.span>
          )
        )}
      </AnimatePresence>

      {/* 装饰层（前面） */}
      {showDecorations && globalParams.decorations
        .filter(d => d.position === 'around' || d.position === 'front')
        .map((decoration, i) => (
          <Decoration key={`front-${i}`} config={decoration} textBounds={textBounds} />
        ))
      }
    </div>
  )
}

// ============================================
// 花字预览卡片
// ============================================

interface FancyTextPreviewCardProps {
  template: FancyTextTemplate
  text?: string
  scale?: number
  className?: string
  onClick?: () => void
  onHover?: (isHovering: boolean) => void
}

export function FancyTextPreviewCard({
  template,
  text,
  scale,
  className = '',
  onClick,
  onHover,
}: FancyTextPreviewCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [previewKey, setPreviewKey] = useState(0)

  const handleMouseEnter = () => {
    setIsHovered(true)
    setPreviewKey(k => k + 1)
    onHover?.(true)
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
    onHover?.(false)
  }

  const displayText = text || template.globalParams.text

  // 智能计算默认缩放比例
  const effectiveScale = scale ?? (template.renderer === 'canvas' ? 0.15 : template.renderer === 'react' ? 0.25 : 0.4)

  return (
    <motion.div
      className={`
        relative rounded-xl overflow-hidden border border-surface-700 
        hover:border-amber-500/50 transition-all cursor-pointer bg-surface-800/50
        ${className}
      `}
      whileHover={{ scale: 1.02 }}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* 预览区域 */}
      <div
        className="relative aspect-video flex items-center justify-center p-4 overflow-hidden"
        style={{
          background: `
            radial-gradient(ellipse at center, ${template.globalParams.color.type === 'solid'
              ? template.globalParams.color.value + '15'
              : '#FFD70015'
            } 0%, transparent 70%), 
            linear-gradient(135deg, #1a1a2e 0%, #0d0d15 100%)
          `,
        }}
      >
        {/* 网格背景 */}
        <div
          className="absolute inset-0 opacity-15"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
            `,
            backgroundSize: '20px 20px',
          }}
        />

        {/* 花字预览 */}
        <div className="relative z-10 w-full h-full flex items-center justify-center overflow-hidden">
          {isHovered ? (
            <FancyTextRenderer
              key={previewKey}
              template={template}
              text={displayText.slice(0, 6)}
              scale={effectiveScale}
              autoPlay={true}
              showDecorations={true}
              clipOverflow={true}
            />
          ) : (
            // 静态预览 - 显示动画最终帧状态
            template.renderer === 'react' ? (
              // React 组件预设 - 跳过动画直接显示最终态
              <FancyTextRenderer
                key={`static-${previewKey}`}
                template={template}
                text={displayText.slice(0, 6)}
                scale={effectiveScale}
                autoPlay={false}
                skipToEnd={true}  // 直接显示最终帧
                showDecorations={true}
                clipOverflow={true}
              />
            ) : template.renderer === 'canvas' ? (
              // Canvas 静态预览
              <FancyTextRenderer
                key={`static-${previewKey}`}
                template={template}
                text={displayText.slice(0, 6)}
                scale={effectiveScale}
                autoPlay={false}
                showDecorations={true}
              />
            ) : (
              // 普通 CSS 预览
              <span
                style={{
                  ...getTextGradientStyle(template.globalParams.color),
                  fontFamily: template.globalParams.fontFamily,
                  fontSize: template.globalParams.fontSize * effectiveScale,
                  fontWeight: template.globalParams.fontWeight,
                  letterSpacing: template.globalParams.letterSpacing * effectiveScale,
                  textShadow: getShadowStyle(template.globalParams),
                  WebkitTextStroke: getStrokeStyle(template.globalParams),
                }}
              >
                {displayText.slice(0, 6)}
              </span>
            )
          )}
        </div>

        {/* 悬浮时显示动画播放中提示 */}
        {isHovered && (
          <div className="absolute top-2 left-2 z-20">
            <span className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium rounded-full bg-amber-500/30 text-amber-300 backdrop-blur-sm">
              <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse" />
              播放中
            </span>
          </div>
        )}

        {/* 时长标签 */}
        <div className="absolute bottom-2 right-2 z-20">
          <span className="text-xs text-surface-400 bg-black/50 px-1.5 py-0.5 rounded">
            {template.globalParams.totalDuration}s
          </span>
        </div>
      </div>

      {/* 信息 */}
      <div className="p-3 bg-surface-850">
        <p className="text-sm font-medium text-surface-200 truncate" title={template.name}>
          {template.name}
        </p>
        <p className="text-xs text-surface-500 mt-0.5 truncate">{template.description}</p>
        <div className="flex items-center gap-2 mt-2 text-xs text-surface-600">
          <span>🎬 {template.globalParams.animation.entrance.replace(/-/g, ' ')}</span>
          {template.globalParams.animation.loop !== 'none' && (
            <span>🔄 {template.globalParams.animation.loop}</span>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default FancyTextRenderer





