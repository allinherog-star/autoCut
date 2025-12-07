'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  AlertCircle,
  Loader2,
  Zap,
} from 'lucide-react'
import { Button, Spinner } from '@/components/ui'
import {
  WebCodecsPlayer,
  type SubtitleItem as BaseSubtitleItem,
  type PlayerState,
  type VideoInfo,
} from '@/lib/webcodecs-player'
import {
  type EnhancedSubtitleStyle,
  DECORATION_EFFECTS,
  ANIMATION_EFFECTS,
  styleToCSS,
} from '@/lib/subtitle-styles'

// 扩展的字幕样式
export interface ExtendedSubtitleStyle {
  fontSize: number
  color: string
  backgroundColor: string
  position: 'top' | 'center' | 'bottom'
  alignment: 'left' | 'center' | 'right'
  hasOutline: boolean
  // 扩展属性
  fontFamily?: string
  fontWeight?: number
  letterSpacing?: number
  outlineColor?: string
  outlineWidth?: number
  hasShadow?: boolean
  shadowColor?: string
  shadowBlur?: number
  shadowOffsetX?: number
  shadowOffsetY?: number
  decorationId?: string
  animationId?: string
  colorType?: 'solid' | 'gradient'
  gradientColors?: string[]
  gradientAngle?: number
  backgroundPadding?: { x: number; y: number }
  backgroundBorderRadius?: number
}

// 扩展的字幕项
export interface SubtitleItem {
  id: string
  text: string
  startTime: number
  endTime: number
  style: ExtendedSubtitleStyle
}

// 重新导出类型供外部使用
export type { PlayerState }

// ============================================
// 增强字幕叠加组件
// ============================================

function EnhancedSubtitleOverlay({ subtitle, scale = 1 }: { subtitle: SubtitleItem; scale?: number }) {
  const style = subtitle.style
  // 确保 scale 是有效值
  const safeScale = scale > 0 ? scale : 1
  
  // 获取动画配置
  const decoration = DECORATION_EFFECTS.find(d => d.id === style.decorationId)
  
  // 构建动画变体 - 增强版，更明显的动画效果
  const getAnimationVariants = () => {
    const animId = style.animationId || 'fade'
    
    switch (animId) {
      case 'slide-up':
        return {
          initial: { opacity: 0, y: 50 },
          animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
          exit: { opacity: 0, y: -30, transition: { duration: 0.3 } },
        }
      case 'slide-down':
        return {
          initial: { opacity: 0, y: -50 },
          animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
          exit: { opacity: 0, y: 30, transition: { duration: 0.3 } },
        }
      case 'zoom':
        return {
          initial: { opacity: 0, scale: 0.3 },
          animate: { opacity: 1, scale: 1, transition: { duration: 0.35, ease: 'backOut' } },
          exit: { opacity: 0, scale: 0.7, transition: { duration: 0.25 } },
        }
      case 'bounce':
        return {
          initial: { opacity: 0, scale: 0.2, y: 60 },
          animate: { 
            opacity: 1, 
            scale: 1, 
            y: 0,
            transition: { type: 'spring', bounce: 0.6, duration: 0.6 }
          },
          exit: { opacity: 0, scale: 0.5, transition: { duration: 0.2 } },
        }
      case 'shake':
        return {
          initial: { opacity: 0, x: -30, rotate: -5 },
          animate: { 
            opacity: 1, 
            x: [0, -8, 8, -6, 6, -3, 3, 0],
            rotate: [0, -3, 3, -2, 2, 0],
            transition: { 
              x: { duration: 0.6 },
              rotate: { duration: 0.6 },
              opacity: { duration: 0.2 }
            }
          },
          exit: { opacity: 0, x: 20, transition: { duration: 0.2 } },
        }
      case 'flip':
        return {
          initial: { opacity: 0, rotateX: 90, scale: 0.8 },
          animate: { 
            opacity: 1, 
            rotateX: 0, 
            scale: 1,
            transition: { duration: 0.5, ease: 'easeOut' }
          },
          exit: { opacity: 0, rotateX: -60, scale: 0.9, transition: { duration: 0.3 } },
        }
      case 'pulse':
        return {
          initial: { opacity: 0, scale: 0.9 },
          animate: { 
            opacity: 1,
            scale: [1, 1.08, 1, 1.05, 1],
            transition: { 
              opacity: { duration: 0.3 },
              scale: { repeat: Infinity, duration: 1.8, ease: 'easeInOut' }
            }
          },
          exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } },
        }
      case 'glitch':
        return {
          initial: { opacity: 0, x: -15, skewX: -10 },
          animate: { 
            opacity: [0, 1, 0.8, 1],
            x: [0, -3, 3, -2, 2, 0],
            skewX: [0, -2, 2, -1, 1, 0],
            filter: [
              'hue-rotate(0deg)',
              'hue-rotate(90deg)',
              'hue-rotate(-90deg)',
              'hue-rotate(45deg)',
              'hue-rotate(0deg)'
            ],
            transition: { 
              opacity: { duration: 0.1 },
              x: { repeat: Infinity, duration: 0.4, repeatDelay: 1.5 },
              skewX: { repeat: Infinity, duration: 0.4, repeatDelay: 1.5 },
              filter: { repeat: Infinity, duration: 0.4, repeatDelay: 1.5 }
            }
          },
          exit: { opacity: 0, x: 10, transition: { duration: 0.15 } },
        }
      case 'swing':
        return {
          initial: { opacity: 0, rotate: -15, originY: 0 },
          animate: { 
            opacity: 1,
            rotate: [0, 12, -10, 8, -5, 3, 0],
            transition: { 
              opacity: { duration: 0.2 },
              rotate: { duration: 0.8, ease: 'easeOut' }
            }
          },
          exit: { opacity: 0, rotate: 5, transition: { duration: 0.2 } },
        }
      case 'typewriter':
        return {
          initial: { opacity: 0, width: 0 },
          animate: { 
            opacity: 1,
            width: 'auto',
            transition: { duration: 0.8, ease: 'linear' }
          },
          exit: { opacity: 0, transition: { duration: 0.2 } },
        }
      default: // fade
        return {
          initial: { opacity: 0, y: 15 },
          animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
          exit: { opacity: 0, y: -10, transition: { duration: 0.2 } },
        }
    }
  }
  
  // 构建 CSS 样式（应用缩放比例）
  const buildCssStyle = (): React.CSSProperties => {
    // 缩放后的字体大小
    const scaledFontSize = Math.round(style.fontSize * safeScale)
    const scaledLetterSpacing = style.letterSpacing ? Math.round(style.letterSpacing * safeScale) : undefined
    
    const css: React.CSSProperties = {
      fontSize: `${scaledFontSize}px`,
      fontFamily: style.fontFamily ? `"${style.fontFamily}", "Noto Sans SC", sans-serif` : undefined,
      fontWeight: style.fontWeight,
      letterSpacing: scaledLetterSpacing ? `${scaledLetterSpacing}px` : undefined,
      lineHeight: 1.4,
      maxWidth: '90%',
    }

    // 文字颜色/渐变
    if (style.colorType === 'gradient' && style.gradientColors && style.gradientColors.length >= 2) {
      const angle = style.gradientAngle ?? 90
      css.background = `linear-gradient(${angle}deg, ${style.gradientColors.join(', ')})`
      css.WebkitBackgroundClip = 'text'
      css.WebkitTextFillColor = 'transparent'
      css.backgroundClip = 'text'
    } else {
      css.color = style.color
    }

    // 背景（缩放 padding 和 borderRadius）
    if (style.backgroundColor && style.backgroundColor !== 'transparent') {
      css.backgroundColor = style.backgroundColor
      if (style.backgroundPadding) {
        const paddingY = Math.round(style.backgroundPadding.y * safeScale)
        const paddingX = Math.round(style.backgroundPadding.x * safeScale)
        css.padding = `${paddingY}px ${paddingX}px`
      } else {
        const defaultPadding = Math.round(6 * safeScale)
        css.padding = `${defaultPadding}px ${Math.round(12 * safeScale)}px`
      }
      if (style.backgroundBorderRadius) {
        css.borderRadius = `${Math.round(style.backgroundBorderRadius * safeScale)}px`
      } else {
        css.borderRadius = `${Math.round(4 * safeScale)}px`
      }
    } else {
      const defaultPadding = Math.round(6 * safeScale)
      css.padding = `${defaultPadding}px ${Math.round(12 * safeScale)}px`
    }

    // 构建 text-shadow（缩放所有像素值）
    const shadows: string[] = []
    
    // 描边效果
    if (style.hasOutline && style.outlineWidth) {
      const ow = Math.round(style.outlineWidth * safeScale)
      const oc = style.outlineColor || '#000000'
      shadows.push(
        `${-ow}px ${-ow}px 0 ${oc}`,
        `${ow}px ${-ow}px 0 ${oc}`,
        `${-ow}px ${ow}px 0 ${oc}`,
        `${ow}px ${ow}px 0 ${oc}`,
        `0 ${-ow}px 0 ${oc}`,
        `0 ${ow}px 0 ${oc}`,
        `${-ow}px 0 0 ${oc}`,
        `${ow}px 0 0 ${oc}`
      )
    } else if (style.hasOutline) {
      // 默认描边
      const ow = Math.round(2 * safeScale)
      shadows.push(
        `${-ow}px ${-ow}px 0 #000`,
        `${ow}px ${-ow}px 0 #000`,
        `${-ow}px ${ow}px 0 #000`,
        `${ow}px ${ow}px 0 #000`
      )
    }

    // 阴影效果
    if (style.hasShadow) {
      const sx = Math.round((style.shadowOffsetX ?? 2) * safeScale)
      const sy = Math.round((style.shadowOffsetY ?? 2) * safeScale)
      const sb = Math.round((style.shadowBlur ?? 4) * safeScale)
      const sc = style.shadowColor || 'rgba(0,0,0,0.8)'
      shadows.push(`${sx}px ${sy}px ${sb}px ${sc}`)
    }

    // 花字效果（注意：花字效果的 textShadow 需要特殊处理）
    if (decoration?.textShadow && safeScale !== 1) {
      // 对花字效果的 textShadow 进行缩放
      const scaledDecorationShadow = decoration.textShadow.replace(
        /(-?\d+(?:\.\d+)?)(px)/g,
        (_, num) => `${Math.round(parseFloat(num) * safeScale)}px`
      )
      shadows.push(scaledDecorationShadow)
    } else if (decoration?.textShadow) {
      shadows.push(decoration.textShadow)
    }

    if (shadows.length > 0) {
      css.textShadow = shadows.join(', ')
    }

    // 花字效果的其他样式
    if (decoration?.border) css.border = decoration.border
    if (decoration?.filter) css.filter = decoration.filter

    return css
  }

  const variants = getAnimationVariants()
  const cssStyle = buildCssStyle()

  // 计算位置
  const getPositionClass = () => {
    const posClasses = []
    
    // 垂直位置
    switch (style.position) {
      case 'top':
        posClasses.push('top-4')
        break
      case 'center':
        // 使用 inset-y-0 配合 items-center 实现垂直居中
        posClasses.push('inset-y-0 items-center')
        break
      case 'bottom':
      default:
        posClasses.push('bottom-20')
        break
    }
    
    // 水平对齐
    switch (style.alignment) {
      case 'left':
        posClasses.push('justify-start')
        break
      case 'right':
        posClasses.push('justify-end')
        break
      case 'center':
      default:
        posClasses.push('justify-center')
        break
    }
    
    return posClasses.join(' ')
  }

  // 获取动画类名（用于持续动画效果）
  const getAnimationClassName = () => {
    const animId = style.animationId || 'none'
    switch (animId) {
      case 'pulse':
        return 'subtitle-pulse'
      case 'glitch':
        return 'subtitle-glitch'
      case 'swing':
        return 'subtitle-swing'
      default:
        return ''
    }
  }

  return (
    <motion.div
      initial={variants.initial}
      animate={variants.animate}
      exit={variants.exit}
      className={`
        absolute left-0 right-0 px-4 flex pointer-events-none z-10
        ${getPositionClass()}
      `}
    >
      <motion.span
        className={`leading-relaxed text-center ${getAnimationClassName()}`}
        style={cssStyle}
        // 为 span 添加额外的动画效果
        animate={style.animationId === 'pulse' ? {
          scale: [1, 1.03, 1],
          transition: { repeat: Infinity, duration: 1.5 }
        } : style.animationId === 'swing' ? {
          rotate: [0, 3, -3, 2, -2, 0],
          transition: { repeat: Infinity, duration: 2, ease: 'easeInOut' }
        } : undefined}
      >
        {subtitle.text}
      </motion.span>
    </motion.div>
  )
}

// ============================================
// 类型定义
// ============================================

export interface VideoPreviewProps {
  /** 视频 URL */
  videoUrl: string
  /** 字幕列表 */
  subtitles?: SubtitleItem[]
  /** 片段开始时间（秒） */
  startTime?: number
  /** 片段结束时间（秒） */
  endTime?: number
  /** 是否自动播放 */
  autoPlay?: boolean
  /** 是否循环播放 */
  loop?: boolean
  /** 是否显示控制条 */
  showControls?: boolean
  /** 容器类名 */
  className?: string
  /** 预览模式：webcodecs（高性能）或 native（兼容） */
  mode?: 'webcodecs' | 'native' | 'auto'
  /** 视频填充模式：cover（裁剪填满）或 contain（完整显示） */
  objectFit?: 'cover' | 'contain'
  /** 目标分辨率宽度（用于计算字幕缩放比例） */
  targetWidth?: number
  /** 目标分辨率高度（用于计算字幕缩放比例） */
  targetHeight?: number
  /** 时间更新回调 */
  onTimeUpdate?: (time: number) => void
  /** 播放状态变化回调 */
  onStateChange?: (state: PlayerState) => void
}

// ============================================
// 格式化时间
// ============================================

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${String(secs).padStart(2, '0')}`
}

// ============================================
// 原生视频播放器组件（兼容模式）
// ============================================

function NativeVideoPreview({
  videoUrl,
  subtitles = [],
  startTime = 0,
  endTime,
  autoPlay = false,
  loop = true,
  showControls = true,
  className = '',
  objectFit = 'cover',
  targetWidth = 1080,
  targetHeight = 1920,
  onTimeUpdate,
}: Omit<VideoPreviewProps, 'mode'>) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const isMountedRef = useRef(true)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(startTime)
  const [duration, setDuration] = useState(0)
  const [isMuted, setIsMuted] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [currentSubtitle, setCurrentSubtitle] = useState<SubtitleItem | null>(null)
  // 循环计数器 - 用于在视频循环时重置字幕动画
  const [loopCount, setLoopCount] = useState(0)
  // 容器尺寸缩放比例
  const [containerScale, setContainerScale] = useState(1)

  // 组件卸载时设置标志
  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])

  // 监听容器尺寸变化，计算缩放比例
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const updateScale = () => {
      if (!isMountedRef.current) return
      const containerWidth = container.offsetWidth
      // 根据容器和目标分辨率计算缩放比例
      // 使用宽度比例，确保字幕在不同尺寸下保持一致的视觉效果
      if (containerWidth > 0 && targetWidth > 0) {
        const scale = containerWidth / targetWidth
        setContainerScale(scale)
      }
    }

    // 延迟执行以确保 DOM 已完全渲染
    const timer = setTimeout(updateScale, 50)
    
    // 使用 ResizeObserver 监听容器尺寸变化
    let resizeObserver: ResizeObserver | null = null
    try {
      resizeObserver = new ResizeObserver(() => {
        // 使用 requestAnimationFrame 避免过于频繁的更新
        requestAnimationFrame(updateScale)
      })
      resizeObserver.observe(container)
    } catch (e) {
      // ResizeObserver 不支持时的降级处理
      console.warn('ResizeObserver not supported')
    }

    return () => {
      clearTimeout(timer)
      resizeObserver?.disconnect()
    }
  }, [targetWidth])

  // 计算实际播放时长
  const clipDuration = endTime ? endTime - startTime : duration - startTime

  // 处理时间更新
  const handleTimeUpdate = useCallback(() => {
    const video = videoRef.current
    if (!video) return

    const time = video.currentTime
    setCurrentTime(time)
    onTimeUpdate?.(time)

    // 检查是否超出范围
    if (endTime && time >= endTime) {
      if (loop) {
        video.currentTime = startTime
        // 增加循环计数器，确保字幕动画重新播放
        setLoopCount(prev => prev + 1)
        // 安全地尝试播放
        const playPromise = video.play()
        if (playPromise !== undefined) {
          playPromise.catch(() => {
            // 忽略播放错误（如用户未交互）
          })
        }
      } else {
        video.pause()
        setIsPlaying(false)
      }
    }

    // 更新当前字幕
    const subtitle = subtitles.find(
      (sub) => time >= sub.startTime && time <= sub.endTime
    )
    setCurrentSubtitle(subtitle || null)
  }, [endTime, loop, startTime, subtitles, onTimeUpdate])

  // 初始化
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    setIsLoading(true)
    setHasError(false)

    const handleLoadedMetadata = () => {
      if (!isMountedRef.current) return
      console.log('[VideoPreview] 视频元数据加载完成', {
        duration: video.duration,
        startTime,
        endTime,
      })
      setDuration(video.duration)
      video.currentTime = startTime
      setIsLoading(false)
    }

    const handleCanPlay = () => {
      if (!isMountedRef.current) return
      console.log('[VideoPreview] 视频可以播放')
      setIsLoading(false)
      if (autoPlay) {
        const playPromise = video.play()
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              if (isMountedRef.current) setIsPlaying(true)
            })
            .catch((err) => {
              console.warn('[VideoPreview] 自动播放失败:', err)
              if (isMountedRef.current) setIsPlaying(false)
            })
        }
      }
    }

    const handleEnded = () => {
      if (!isMountedRef.current) return
      if (loop) {
        video.currentTime = startTime
        // 增加循环计数器，确保字幕动画重新播放
        setLoopCount(prev => prev + 1)
        const playPromise = video.play()
        if (playPromise !== undefined) {
          playPromise.catch(() => {
            // 忽略播放错误
          })
        }
      } else {
        setIsPlaying(false)
      }
    }

    const handleError = (e: Event) => {
      if (!isMountedRef.current) return
      const videoEl = e.target as HTMLVideoElement
      const error = videoEl?.error
      console.error('[VideoPreview] 视频加载错误:', error?.message || '未知错误')
      setIsLoading(false)
      setHasError(true)
    }

    const handleWaiting = () => {
      setIsLoading(true)
    }

    const handlePlaying = () => {
      setIsLoading(false)
      setIsPlaying(true)
    }

    video.addEventListener('loadedmetadata', handleLoadedMetadata)
    video.addEventListener('canplay', handleCanPlay)
    video.addEventListener('timeupdate', handleTimeUpdate)
    video.addEventListener('ended', handleEnded)
    video.addEventListener('error', handleError)
    video.addEventListener('waiting', handleWaiting)
    video.addEventListener('playing', handlePlaying)

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata)
      video.removeEventListener('canplay', handleCanPlay)
      video.removeEventListener('timeupdate', handleTimeUpdate)
      video.removeEventListener('ended', handleEnded)
      video.removeEventListener('error', handleError)
      video.removeEventListener('waiting', handleWaiting)
      video.removeEventListener('playing', handlePlaying)
    }
  }, [videoUrl, startTime, endTime, autoPlay, loop, handleTimeUpdate])

  // 播放/暂停
  const togglePlay = () => {
    const video = videoRef.current
    if (!video) return

    if (isPlaying) {
      video.pause()
      setIsPlaying(false)
    } else {
      const playPromise = video.play()
      if (playPromise !== undefined) {
        playPromise
          .then(() => setIsPlaying(true))
          .catch(() => setIsPlaying(false))
      }
    }
  }

  // 重置
  const handleReset = () => {
    const video = videoRef.current
    if (!video) return
    video.currentTime = startTime
    setCurrentTime(startTime)
    // 增加循环计数器，确保字幕动画重新播放
    setLoopCount(prev => prev + 1)
  }

  // 进度条点击
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current
    if (!video) return

    const rect = e.currentTarget.getBoundingClientRect()
    const percent = (e.clientX - rect.left) / rect.width
    const newTime = startTime + percent * (duration - startTime)
    video.currentTime = newTime
    setCurrentTime(newTime)
  }

  const progress = clipDuration > 0 ? ((currentTime - startTime) / clipDuration) * 100 : 0

  return (
    <div ref={containerRef} className={`relative overflow-hidden rounded-lg bg-surface-900 ${className}`}>
      {/* 视频 */}
      <video
        ref={videoRef}
        src={videoUrl}
        className={`w-full h-full ${objectFit === 'contain' ? 'object-contain' : 'object-cover'}`}
        muted={isMuted}
        playsInline
        preload="auto"
      />

      {/* 字幕叠加 - 增强版渲染（自动缩放） */}
      <AnimatePresence mode="wait">
        {currentSubtitle && (
          <EnhancedSubtitleOverlay 
            key={`${currentSubtitle.id}-${currentSubtitle.style.animationId}-loop${loopCount}-scale${containerScale.toFixed(3)}`} 
            subtitle={currentSubtitle}
            scale={containerScale}
          />
        )}
      </AnimatePresence>

      {/* 加载状态 */}
      {isLoading && !hasError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 z-10">
          <Spinner size="lg" className="mb-2" />
          <span className="text-white/80 text-sm">加载中...</span>
        </div>
      )}

      {/* 错误状态 */}
      {hasError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 z-10">
          <AlertCircle className="w-8 h-8 text-red-400 mb-2" />
          <span className="text-white/80 text-sm">视频加载失败</span>
        </div>
      )}

      {/* 控制条 */}
      {showControls && !isLoading && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
          {/* 进度条 */}
          <div
            className="w-full h-1 bg-white/20 rounded-full cursor-pointer mb-2 group"
            onClick={handleProgressClick}
          >
            <div
              className="h-full bg-amber-400 rounded-full relative"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>

          {/* 控制按钮 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="xs"
                isIconOnly
                onClick={togglePlay}
                className="text-white hover:bg-white/20"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
              </Button>
              <Button
                variant="ghost"
                size="xs"
                isIconOnly
                onClick={handleReset}
                className="text-white hover:bg-white/20"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="xs"
                isIconOnly
                onClick={() => setIsMuted(!isMuted)}
                className="text-white hover:bg-white/20"
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </Button>
              <span className="text-xs text-white/80 font-mono">
                {formatTime(currentTime - startTime)} / {formatTime(clipDuration)}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <span className="text-[10px] text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded">
                实时预览
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ============================================
// WebCodecs 播放器组件
// ============================================

function WebCodecsVideoPreview({
  videoUrl,
  subtitles = [],
  startTime = 0,
  endTime,
  autoPlay = false,
  loop = true,
  showControls = true,
  className = '',
  onTimeUpdate,
  onStateChange,
}: Omit<VideoPreviewProps, 'mode'>) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const playerRef = useRef<WebCodecsPlayer | null>(null)

  const [state, setState] = useState<PlayerState>('idle')
  const [currentTime, setCurrentTime] = useState(startTime)
  const [duration, setDuration] = useState(0)
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null)
  const [loadProgress, setLoadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  // 初始化播放器
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const player = new WebCodecsPlayer(canvas, videoUrl, {
      onStateChange: (newState) => {
        setState(newState)
        onStateChange?.(newState)
      },
      onTimeUpdate: (time) => {
        setCurrentTime(time)
        onTimeUpdate?.(time)
      },
      onDurationChange: (dur) => {
        setDuration(endTime || dur)
      },
      onProgress: (loaded, total) => {
        setLoadProgress(Math.round((loaded / total) * 100))
      },
      onError: (err) => {
        setError(err.message)
      },
    })

    playerRef.current = player

    // 加载视频
    player.load().then((info) => {
      setVideoInfo(info)
      if (endTime) {
        player.setClipRange(startTime, endTime)
      }
      player.setSubtitles(subtitles)
      if (autoPlay) {
        player.play()
      }
    }).catch((err) => {
      setError(err.message)
    })

    return () => {
      player.destroy()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoUrl])

  // 更新字幕
  useEffect(() => {
    playerRef.current?.setSubtitles(subtitles)
  }, [subtitles])

  // 更新播放范围
  useEffect(() => {
    if (endTime) {
      playerRef.current?.setClipRange(startTime, endTime)
    }
  }, [startTime, endTime])

  // 播放/暂停
  const togglePlay = () => {
    const player = playerRef.current
    if (!player) return

    if (state === 'playing') {
      player.pause()
    } else {
      player.play()
    }
  }

  // 重置
  const handleReset = () => {
    playerRef.current?.seek(startTime)
  }

  // 进度条点击
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const player = playerRef.current
    if (!player) return

    const rect = e.currentTarget.getBoundingClientRect()
    const percent = (e.clientX - rect.left) / rect.width
    const newTime = startTime + percent * (duration - startTime)
    player.seek(newTime)
  }

  const progress = duration > 0 ? ((currentTime - startTime) / (duration - startTime)) * 100 : 0
  const isPlaying = state === 'playing'
  const isLoading = state === 'loading' || state === 'idle'

  return (
    <div ref={containerRef} className={`relative overflow-hidden rounded-lg bg-black ${className}`}>
      {/* Canvas */}
      <canvas
        ref={canvasRef}
        className="w-full h-full object-contain"
        style={{
          aspectRatio: videoInfo ? `${videoInfo.width} / ${videoInfo.height}` : '16 / 9',
        }}
      />

      {/* 加载状态 */}
      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 z-20">
          <Loader2 className="w-8 h-8 text-amber-400 animate-spin mb-3" />
          <p className="text-white text-sm mb-2">加载视频中...</p>
          {loadProgress > 0 && (
            <div className="w-32 h-1.5 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-400 transition-all"
                style={{ width: `${loadProgress}%` }}
              />
            </div>
          )}
        </div>
      )}

      {/* 错误状态 */}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 z-20">
          <AlertCircle className="w-8 h-8 text-red-400 mb-3" />
          <p className="text-white text-sm mb-2">加载失败</p>
          <p className="text-white/60 text-xs">{error}</p>
        </div>
      )}

      {/* 控制条 */}
      {showControls && !isLoading && !error && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
          {/* 进度条 */}
          <div
            className="w-full h-1 bg-white/20 rounded-full cursor-pointer mb-2 group"
            onClick={handleProgressClick}
          >
            <div
              className="h-full bg-amber-400 rounded-full relative"
              style={{ width: `${Math.min(100, progress)}%` }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>

          {/* 控制按钮 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="xs"
                isIconOnly
                onClick={togglePlay}
                className="text-white hover:bg-white/20"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
              </Button>
              <Button
                variant="ghost"
                size="xs"
                isIconOnly
                onClick={handleReset}
                className="text-white hover:bg-white/20"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
              <span className="text-xs text-white/80 font-mono">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-400" />
              <span className="text-[10px] text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded">
                WebCodecs
              </span>
              {videoInfo && (
                <span className="text-[10px] text-white/40 ml-1">
                  {videoInfo.width}×{videoInfo.height}
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ============================================
// 主组件：自动选择模式
// ============================================

export function VideoPreview({
  mode = 'auto',
  ...props
}: VideoPreviewProps) {
  // 目前 WebCodecs 实现较复杂，暂时默认使用 Native 模式
  // WebCodecs 模式需要进一步调试 MP4Box 集成
  const useNative = mode === 'native' || mode === 'auto'
  
  if (useNative) {
    return <NativeVideoPreview {...props} />
  }
  
  // 仅当明确指定 webcodecs 模式时才使用
  return <WebCodecsVideoPreview {...props} />
}

// ============================================
// 字幕叠加预览组件（用于编辑时的实时预览）
// ============================================

export interface SubtitlePreviewProps {
  /** 视频 URL */
  videoUrl: string
  /** 当前字幕 */
  subtitle: SubtitleItem
  /** 容器类名 */
  className?: string
}

export function SubtitlePreview({
  videoUrl,
  subtitle,
  className = '',
}: SubtitlePreviewProps) {
  return (
    <VideoPreview
      videoUrl={videoUrl}
      subtitles={[subtitle]}
      startTime={subtitle.startTime}
      endTime={subtitle.endTime}
      autoPlay={true}
      loop={true}
      showControls={true}
      mode="auto"
      className={className}
    />
  )
}

