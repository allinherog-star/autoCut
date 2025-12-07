'use client'

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Mic,
  Sparkles,
  Play,
  Clock,
  Tag,
  Edit3,
  Trash2,
  ChevronDown,
  ChevronUp,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Palette,
  Save,
  Scissors,
  Smartphone,
  Monitor,
  Type,
  Wand2,
  Zap,
  Check,
  RotateCcw,
  Download,
  Loader2,
  Maximize2,
} from 'lucide-react'
import { Button, Card, Badge, Progress, Slider } from '@/components/ui'
import {
  quickCompose,
  type AnimationEffect,
  type ProgressCallback,
} from '@/lib/video-composer'
import { MediaPreviewModal } from '@/components/media-preview-modal'
import { useEditor, type TargetDevice } from '../layout'
import { VideoPreview, type SubtitleItem } from '@/components/video-preview'
import {
  type EnhancedSubtitleStyle,
  DEFAULT_SUBTITLE_STYLE,
  FONT_OPTIONS,
  TEXT_COLOR_PRESETS,
  BACKGROUND_PRESETS,
  DECORATION_EFFECTS,
  ANIMATION_EFFECTS,
  STYLE_PRESETS,
  PHONE_FONT_SIZES,
  PC_FONT_SIZES,
  getFontSizeName,
  mergeStyles,
} from '@/lib/subtitle-styles'

// ============================================
// 类型定义
// ============================================

// 使用增强版字幕样式
type SubtitleStyle = EnhancedSubtitleStyle

// 默认样式
const defaultSubtitleStyle: SubtitleStyle = DEFAULT_SUBTITLE_STYLE

interface SubtitleLine {
  id: string
  text: string
  startTime: number
  endTime: number
  thumbnailUrl?: string
  style: SubtitleStyle
}

interface VideoSegment {
  id: string
  startTime: number
  endTime: number
  thumbnailUrl: string
  videoUrl: string
  description: string
  labels: string[]
  score: number
  subtitles: SubtitleLine[]
  isExpanded: boolean
}

// ============================================
// 模拟数据
// ============================================

// 使用本地小视频进行测试（770KB）
const SAMPLE_VIDEO_URL = '/test-video.mp4'

const mockSegments: VideoSegment[] = [
  {
    id: '1',
    startTime: 0,
    endTime: 10,
    thumbnailUrl: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=300&h=200&fit=crop',
    videoUrl: SAMPLE_VIDEO_URL,
    description: '主角出场，微笑面对镜头，情绪积极',
    labels: ['开场', '人物', '特写'],
    score: 92,
    subtitles: [
      { id: '1-1', text: '大家好，欢迎来到今天的视频', startTime: 0, endTime: 3, thumbnailUrl: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=120&h=68&fit=crop', style: { ...defaultSubtitleStyle } },
      { id: '1-2', text: '今天我们要聊一个非常有趣的话题', startTime: 3, endTime: 6, thumbnailUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=68&fit=crop', style: { ...defaultSubtitleStyle } },
      { id: '1-3', text: '准备好了吗？让我们开始吧！', startTime: 6, endTime: 10, thumbnailUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&h=68&fit=crop', style: { ...defaultSubtitleStyle } },
    ],
    isExpanded: true,
  },
  {
    id: '2',
    startTime: 12,
    endTime: 28,
    thumbnailUrl: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=300&h=200&fit=crop',
    videoUrl: SAMPLE_VIDEO_URL,
    description: '两人对话场景，表情丰富，有互动',
    labels: ['对话', '双人', '情感'],
    score: 88,
    subtitles: [
      { id: '2-1', text: '这个观点真的很有意思', startTime: 12, endTime: 16, thumbnailUrl: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=120&h=68&fit=crop', style: { ...defaultSubtitleStyle } },
      { id: '2-2', text: '我之前从来没有这样想过', startTime: 16, endTime: 20, thumbnailUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=120&h=68&fit=crop', style: { ...defaultSubtitleStyle } },
      { id: '2-3', text: '你能详细解释一下吗？', startTime: 20, endTime: 24, thumbnailUrl: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=120&h=68&fit=crop', style: { ...defaultSubtitleStyle } },
      { id: '2-4', text: '当然，让我来给你分析', startTime: 24, endTime: 28, thumbnailUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=120&h=68&fit=crop', style: { ...defaultSubtitleStyle } },
    ],
    isExpanded: false,
  },
  {
    id: '3',
    startTime: 35,
    endTime: 52,
    thumbnailUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=300&h=200&fit=crop',
    videoUrl: SAMPLE_VIDEO_URL,
    description: '精彩动作场面，视觉冲击力强',
    labels: ['高潮', '动作', '精彩'],
    score: 95,
    subtitles: [
      { id: '3-1', text: '这一幕太震撼了！', startTime: 35, endTime: 40, thumbnailUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=120&h=68&fit=crop', style: { ...defaultSubtitleStyle } },
      { id: '3-2', text: '你看这个镜头切换得多流畅', startTime: 40, endTime: 46, thumbnailUrl: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=120&h=68&fit=crop', style: { ...defaultSubtitleStyle } },
      { id: '3-3', text: '简直是教科书级别的拍摄手法', startTime: 46, endTime: 52, thumbnailUrl: 'https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=120&h=68&fit=crop', style: { ...defaultSubtitleStyle } },
    ],
    isExpanded: false,
  },
  {
    id: '4',
    startTime: 52,
    endTime: 68,
    thumbnailUrl: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=300&h=200&fit=crop',
    videoUrl: SAMPLE_VIDEO_URL,
    description: '内容总结回顾，情绪收束',
    labels: ['结尾', '总结', '回顾'],
    score: 78,
    subtitles: [
      { id: '4-1', text: '好了，今天的内容就到这里', startTime: 52, endTime: 58, thumbnailUrl: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=120&h=68&fit=crop', style: { ...defaultSubtitleStyle } },
      { id: '4-2', text: '记得点赞关注不迷路哦', startTime: 58, endTime: 63, thumbnailUrl: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=120&h=68&fit=crop', style: { ...defaultSubtitleStyle } },
      { id: '4-3', text: '我们下期再见！', startTime: 63, endTime: 68, thumbnailUrl: 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?w=120&h=68&fit=crop', style: { ...defaultSubtitleStyle } },
    ],
    isExpanded: false,
  },
]

// 标签颜色映射
const labelColorMap: Record<string, string> = {
  '开场': 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
  '结尾': 'bg-purple-500/20 text-purple-400 border border-purple-500/30',
  '高潮': 'bg-rose-500/20 text-rose-400 border border-rose-500/30',
  '人物': 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
  '双人': 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30',
  '对话': 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30',
  '动作': 'bg-orange-500/20 text-orange-400 border border-orange-500/30',
  '特写': 'bg-pink-500/20 text-pink-400 border border-pink-500/30',
  '情感': 'bg-red-500/20 text-red-400 border border-red-500/30',
  '精彩': 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
  '总结': 'bg-teal-500/20 text-teal-400 border border-teal-500/30',
  '回顾': 'bg-violet-500/20 text-violet-400 border border-violet-500/30',
}

// 时间格式化
const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60)
  const secs = Math.max(0, Math.round(seconds % 60))
  return `${mins}:${String(secs).padStart(2, '0')}`
}

// ============================================
// 设备预览配置
// ============================================

// 手机预览框高度 - 模拟真实手机屏幕
// 基于 6.7 英寸手机屏幕比例，预览高度约 560px 能较好模拟真实观感
const PHONE_PREVIEW_HEIGHT = 560

// ============================================
// 增强版下拉选择组件
// ============================================

interface DropdownOption {
  id: string
  name: string
  preview?: string
  description?: string
  value?: string | number
}

interface DropdownGroup {
  label: string
  options: DropdownOption[]
}

const StyleDropdown = ({
  value,
  options,
  groups,
  onChange,
  placeholder = '请选择',
  renderOption,
}: {
  value: string
  options?: DropdownOption[]
  groups?: DropdownGroup[]
  onChange: (value: string) => void
  placeholder?: string
  renderOption?: (option: DropdownOption, isSelected: boolean) => React.ReactNode
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // 点击外部关闭
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // 获取当前选中项
  const allOptions = groups ? groups.flatMap(g => g.options) : (options || [])
  const selectedOption = allOptions.find(opt => (opt.value?.toString() || opt.id) === value)

  // 默认选项渲染
  const defaultRenderOption = (option: DropdownOption, isSelected: boolean) => (
    <div className={`
      flex items-center gap-3 px-3 py-2.5 cursor-pointer rounded-lg transition-all
      ${isSelected 
        ? 'bg-amber-500/20 text-amber-400' 
        : 'hover:bg-surface-700 text-surface-200'
      }
    `}>
      {option.preview && (
        <span className="text-lg flex-shrink-0 w-6 text-center">{option.preview}</span>
      )}
      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm">{option.name}</div>
        {option.description && (
          <div className="text-xs text-surface-500 truncate">{option.description}</div>
        )}
      </div>
      {isSelected && (
        <Check className="w-4 h-4 text-amber-400 flex-shrink-0" />
      )}
    </div>
  )

  const render = renderOption || defaultRenderOption

  return (
    <div ref={dropdownRef} className="relative">
      {/* 触发按钮 */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-full h-10 px-3 flex items-center justify-between gap-2
          bg-surface-800 border rounded-lg text-sm transition-all
          ${isOpen 
            ? 'border-amber-400/50 ring-2 ring-amber-400/10' 
            : 'border-surface-600 hover:border-surface-500'
          }
        `}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {selectedOption?.preview && (
            <span className="text-base flex-shrink-0">{selectedOption.preview}</span>
          )}
          <span className={`truncate ${selectedOption ? 'text-surface-200' : 'text-surface-500'}`}>
            {selectedOption?.name || placeholder}
          </span>
        </div>
        <ChevronDown className={`w-4 h-4 text-surface-400 transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* 下拉菜单 */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 w-full mt-1 py-1 bg-surface-800 border border-surface-600 rounded-xl shadow-xl max-h-[280px] overflow-y-auto"
          >
            {groups ? (
              // 分组渲染
              groups.map((group, idx) => (
                <div key={group.label}>
                  {idx > 0 && <div className="h-px bg-surface-700 my-1" />}
                  <div className="px-3 py-1.5 text-xs font-medium text-surface-500">{group.label}</div>
                  {group.options.map(option => (
                    <div
                      key={option.id}
                      onClick={() => {
                        onChange(option.value?.toString() || option.id)
                        setIsOpen(false)
                      }}
                    >
                      {render(option, (option.value?.toString() || option.id) === value)}
                    </div>
                  ))}
                </div>
              ))
            ) : (
              // 普通列表渲染
              options?.map(option => (
                <div
                  key={option.id}
                  onClick={() => {
                    onChange(option.value?.toString() || option.id)
                    setIsOpen(false)
                  }}
                >
                  {render(option, (option.value?.toString() || option.id) === value)}
                </div>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ============================================
// 字幕样式预览组件 - 下拉选项版
// ============================================

const SubtitleStylePreview = ({
  segment,
  subtitle,
  onStyleChange,
  device,
  deviceConfig,
}: {
  segment: VideoSegment
  subtitle: SubtitleLine
  onStyleChange: (newStyle: Partial<SubtitleStyle>) => void
  device: 'phone' | 'pc'
  deviceConfig: { name: string; description: string; aspectRatio: string; width: number; height: number }
}) => {
  const previewRef = useRef<HTMLDivElement>(null)
  const [isMaximized, setIsMaximized] = useState(false)
  const config = deviceConfig

  // ESC 键关闭最大化弹窗
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMaximized) {
        setIsMaximized(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isMaximized])

  // 生成样式的唯一标识，用于缓存控制
  const styleKey = useMemo(() => {
    const style = subtitle.style
    return JSON.stringify({
      fontSize: style.fontSize,
      fontFamily: style.fontFamily,
      fontWeight: style.fontWeight,
      letterSpacing: style.letterSpacing,
      color: style.color,
      backgroundColor: style.backgroundColor,
      position: style.position,
      alignment: style.alignment,
      hasOutline: style.hasOutline,
      outlineColor: style.outlineColor,
      outlineWidth: style.outlineWidth,
      hasShadow: style.hasShadow,
      shadowColor: style.shadowColor,
      shadowBlur: style.shadowBlur,
      shadowOffsetX: style.shadowOffsetX,
      shadowOffsetY: style.shadowOffsetY,
      decorationId: style.decorationId,
      animationId: style.animationId,
      colorType: style.colorType,
      gradientColors: style.gradientColors,
      gradientAngle: style.gradientAngle,
      marginBottom: style.marginBottom,
    })
  }, [subtitle.style])
  
  // 缓存字幕项，只有样式变化时才重新创建
  // 注意：字体大小使用原始值，VideoPreview 组件会根据容器尺寸自动缩放
  const subtitleItem: SubtitleItem = useMemo(() => ({
    id: subtitle.id,
    text: subtitle.text,
    startTime: subtitle.startTime,
    endTime: subtitle.endTime,
    style: {
      fontSize: subtitle.style.fontSize, // 使用原始字体大小
      color: subtitle.style.color,
      backgroundColor: subtitle.style.backgroundColor,
      position: subtitle.style.position,
      alignment: subtitle.style.alignment,
      hasOutline: subtitle.style.hasOutline,
      // 扩展样式属性
      fontFamily: subtitle.style.fontFamily,
      fontWeight: subtitle.style.fontWeight,
      letterSpacing: subtitle.style.letterSpacing,
      outlineColor: subtitle.style.outlineColor,
      outlineWidth: subtitle.style.outlineWidth,
      hasShadow: subtitle.style.hasShadow,
      shadowColor: subtitle.style.shadowColor,
      shadowBlur: subtitle.style.shadowBlur,
      shadowOffsetX: subtitle.style.shadowOffsetX,
      shadowOffsetY: subtitle.style.shadowOffsetY,
      decorationId: subtitle.style.decorationId,
      animationId: subtitle.style.animationId,
      colorType: subtitle.style.colorType,
      gradientColors: subtitle.style.gradientColors,
      gradientAngle: subtitle.style.gradientAngle,
      backgroundPadding: subtitle.style.backgroundPadding,
      backgroundBorderRadius: subtitle.style.backgroundBorderRadius,
    } as SubtitleItem['style'],
  }), [subtitle.id, subtitle.text, subtitle.startTime, subtitle.endTime, styleKey])

  // 缓存视频预览组件 - 只有样式变化时才重新渲染
  // 传递目标分辨率，让 VideoPreview 内部自动计算缩放比例
  const cachedVideoPreview = useMemo(() => (
    <VideoPreview
      videoUrl={segment.videoUrl}
      subtitles={[subtitleItem]}
      startTime={subtitle.startTime}
      endTime={subtitle.endTime}
      autoPlay={true}
      loop={true}
      showControls={true}
      mode="native"
      objectFit={device === 'phone' ? 'contain' : 'cover'}
      targetWidth={config.width}
      targetHeight={config.height}
      className="w-full h-full"
    />
  ), [segment.videoUrl, subtitleItem, subtitle.startTime, subtitle.endTime, device, config.width, config.height])

  // 应用预设样式
  const applyPreset = (presetId: string) => {
    const preset = STYLE_PRESETS.find(p => p.id === presetId)
    if (preset) {
      onStyleChange(mergeStyles(DEFAULT_SUBTITLE_STYLE, preset.style))
    }
  }

  // 重置为默认样式
  const resetToDefault = () => {
    onStyleChange(DEFAULT_SUBTITLE_STYLE)
  }

  // 获取当前预设名称
  const getCurrentPresetName = () => {
    const preset = STYLE_PRESETS.find(p => {
      // 简单匹配：比较主要样式属性
      return p.style.decorationId === subtitle.style.decorationId &&
             p.style.fontFamily === subtitle.style.fontFamily &&
             p.style.color === subtitle.style.color
    })
    return preset?.name || '选择预设样式'
  }

  return (
    <div className="flex gap-6" onClick={(e) => e.stopPropagation()}>
      {/* 左侧：预览区域 */}
      <div className="flex-[2] min-w-0">
        {/* 当前设备信息 */}
        <div className="flex items-center justify-between mb-4" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-surface-700 rounded-lg">
              {device === 'phone' ? (
                <Smartphone className="w-4 h-4 text-amber-400" />
              ) : (
                <Monitor className="w-4 h-4 text-amber-400" />
              )}
              <span className="text-sm font-medium text-surface-200">{config.name}</span>
              <span className="text-xs text-surface-500">{config.width}×{config.height}</span>
            </div>
            <span className="text-xs text-surface-500">
              在上传页面可修改目标设备
            </span>
          </div>
          {/* 重置按钮 */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              resetToDefault()
            }}
            className="flex items-center gap-1 text-xs text-surface-400 hover:text-amber-400 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>重置样式</span>
          </button>
        </div>

        {/* 预览区域 - 模拟真实设备 */}
        {device === 'phone' ? (
          <div className="flex flex-col items-center">
            {/* 手机模拟器边框 */}
            <div 
              className="relative bg-surface-950 rounded-[3rem] p-2 shadow-2xl"
              style={{ 
                // 手机边框尺寸，预览高度固定以确保比例一致
                height: `${PHONE_PREVIEW_HEIGHT + 16}px`,
              }}
            >
              {/* 顶部刘海 */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2 w-24 h-6 bg-black rounded-full z-10" />
              
              {/* 屏幕区域 */}
              <div 
                ref={previewRef}
                className="relative overflow-hidden rounded-[2.25rem] bg-black group/video"
                style={{ 
                  aspectRatio: config.aspectRatio,
                  height: `${PHONE_PREVIEW_HEIGHT}px`,
                }}
              >
                {cachedVideoPreview}
                {/* 最大化按钮 */}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setIsMaximized(true)
                  }}
                  className="absolute top-3 right-3 p-2 rounded-lg bg-black/60 backdrop-blur-sm text-white opacity-0 group-hover/video:opacity-100 transition-opacity hover:bg-black/80 z-20"
                  title="最大化预览"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            {/* 分辨率标注 */}
            <div className="mt-3 flex items-center gap-2 text-xs text-surface-500">
              <Smartphone className="w-3.5 h-3.5" />
              <span>{config.width}×{config.height}</span>
              <span className="text-surface-600">|</span>
              <span className="text-surface-400">所见即所得</span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col">
            {/* PC 显示器边框 */}
            <div 
              ref={previewRef}
              className="relative rounded-xl overflow-hidden shadow-2xl border-2 border-surface-600 bg-black group/video"
              style={{
                aspectRatio: config.aspectRatio,
                width: '100%',
              }}
            >
              {cachedVideoPreview}
              {/* 最大化按钮 */}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setIsMaximized(true)
                }}
                className="absolute top-3 right-3 p-2 rounded-lg bg-black/60 backdrop-blur-sm text-white opacity-0 group-hover/video:opacity-100 transition-opacity hover:bg-black/80 z-20"
                title="最大化预览"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>
            
            {/* 分辨率标注 */}
            <div className="mt-3 flex items-center gap-2 text-xs text-surface-500">
              <Monitor className="w-3.5 h-3.5" />
              <span>{config.width}×{config.height}</span>
              <span className="text-surface-600">|</span>
              <span className="text-surface-400">所见即所得</span>
            </div>
          </div>
        )}

      </div>

      {/* 最大化预览弹窗 */}
      <AnimatePresence>
        {isMaximized && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
            onClick={() => setIsMaximized(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* 顶部信息栏 */}
              <div className="absolute -top-12 left-0 right-0 flex items-center justify-between">
                <div className="flex items-center gap-3 text-white">
                  {device === 'phone' ? (
                    <>
                      <Smartphone className="w-4 h-4" />
                      <span className="text-sm font-medium">手机竖屏</span>
                    </>
                  ) : (
                    <>
                      <Monitor className="w-4 h-4" />
                      <span className="text-sm font-medium">电脑横屏</span>
                    </>
                  )}
                  <span className="px-2 py-0.5 rounded bg-surface-700 text-xs font-mono">{config.width}×{config.height}</span>
                  <span className="text-xs text-surface-400">{config.description}</span>
                </div>
                <button
                  onClick={() => setIsMaximized(false)}
                  className="px-3 py-1.5 rounded-lg bg-surface-800 text-white text-sm hover:bg-surface-700 transition-colors"
                >
                  ESC 关闭
                </button>
              </div>

              {/* 视频预览 */}
              <div 
                className={`
                  relative overflow-hidden shadow-2xl bg-black
                  ${device === 'phone' 
                    ? 'rounded-[2.5rem] border-[3px] border-surface-500' 
                    : 'rounded-xl border-2 border-surface-600'
                  }
                `}
                style={{
                  aspectRatio: config.aspectRatio,
                  height: device === 'phone' ? 'min(75vh, 650px)' : 'auto',
                  width: device === 'phone' ? 'auto' : 'min(85vw, 1100px)',
                }}
              >
                {cachedVideoPreview}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 右侧：样式控件 - 下拉选项形式 */}
      <div 
        className="flex-1 min-w-[280px] max-w-[320px] bg-surface-900 rounded-xl border border-surface-700 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 space-y-4 max-h-[520px] overflow-y-auto">
          {/* 样式预设 */}
          <div>
            <label className="text-sm text-surface-300 mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>样式预设</span>
            </label>
            <StyleDropdown
              value=""
              placeholder={getCurrentPresetName()}
              groups={[
                {
                  label: '📱 平台风格',
                  options: STYLE_PRESETS.filter(p => p.category === 'platform').map(preset => ({
                    id: preset.id,
                    name: preset.name,
                    preview: preset.preview,
                    description: preset.description,
                  })),
                },
                {
                  label: '🎭 情绪氛围',
                  options: STYLE_PRESETS.filter(p => p.category === 'mood').map(preset => ({
                    id: preset.id,
                    name: preset.name,
                    preview: preset.preview,
                    description: preset.description,
                  })),
                },
                {
                  label: '✨ 创意效果',
                  options: STYLE_PRESETS.filter(p => p.category === 'creative').map(preset => ({
                    id: preset.id,
                    name: preset.name,
                    preview: preset.preview,
                    description: preset.description,
                  })),
                },
              ]}
              onChange={(presetId) => applyPreset(presetId)}
            />
          </div>

          {/* 字体选择 */}
          <div>
            <label className="text-sm text-surface-300 mb-2 flex items-center gap-2">
              <Type className="w-4 h-4 text-amber-400" />
              <span>字体</span>
              <span className="ml-auto text-amber-400 text-xs">{FONT_OPTIONS.find(f => f.family === subtitle.style.fontFamily)?.name || '思源黑体'}</span>
            </label>
            <StyleDropdown
              value={subtitle.style.fontFamily}
              options={FONT_OPTIONS.map(font => ({
                id: font.family,
                name: font.preview, // 预览文字作为主名称
                description: font.name, // 字体名称作为次要描述
                value: font.family,
              }))}
              onChange={(family) => onStyleChange({ fontFamily: family })}
              renderOption={(option, isSelected) => (
                <div className={`
                  flex items-center gap-3 px-3 py-2.5 cursor-pointer rounded-lg transition-all
                  ${isSelected 
                    ? 'bg-amber-500/20 text-amber-400' 
                    : 'hover:bg-surface-700 text-surface-200'
                  }
                `}>
                  {/* 字体预览 - 用当前字体渲染 */}
                  <span 
                    className="text-base flex-shrink-0 w-12 text-center text-surface-300"
                    style={{ fontFamily: `"${option.id}", sans-serif` }}
                  >
                    字幕
                  </span>
                  <div className="flex-1 min-w-0">
                    <div 
                      className="font-medium text-sm"
                      style={{ fontFamily: `"${option.id}", sans-serif` }}
                    >
                      {option.name}
                    </div>
                    <div className="text-xs text-surface-500">
                      {option.description}
                    </div>
                  </div>
                  {isSelected && (
                    <Check className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  )}
                </div>
              )}
            />
          </div>

          {/* 字号选择 - 使用标准字号 */}
          <div>
            <label className="text-sm text-surface-300 mb-2 flex items-center gap-2">
              <Type className="w-4 h-4 text-amber-400" />
              <span>字号</span>
              <span className="ml-auto text-amber-400 text-xs">{getFontSizeName(subtitle.style.fontSize, device)}</span>
            </label>
            <StyleDropdown
              value={subtitle.style.fontSize.toString()}
              groups={(() => {
                const sizes = device === 'phone' ? PHONE_FONT_SIZES : PC_FONT_SIZES
                const categories = [
                  { key: 'small', label: '🔤 小字号' },
                  { key: 'medium', label: '📝 常规字号' },
                  { key: 'large', label: '📢 大字号' },
                  { key: 'xlarge', label: '🎯 特大字号' },
                ]
                return categories
                  .map(cat => ({
                    label: cat.label,
                    options: sizes
                      .filter(s => s.category === cat.key)
                      .map(s => ({
                        id: s.value.toString(),
                        name: s.description, // 描述作为主名称
                        description: s.name, // 原名称作为次要描述
                        value: s.value,
                      })),
                  }))
                  .filter(g => g.options.length > 0)
              })()}
              onChange={(val) => onStyleChange({ fontSize: Number(val) })}
              renderOption={(option, isSelected) => (
                <div className={`
                  flex items-center gap-3 px-3 py-2.5 cursor-pointer rounded-lg transition-all
                  ${isSelected 
                    ? 'bg-amber-500/20 text-amber-400' 
                    : 'hover:bg-surface-700 text-surface-200'
                  }
                `}>
                  {/* 字号预览 - 实际大小示意 */}
                  <span 
                    className="flex-shrink-0 w-10 text-center font-medium text-surface-300"
                    style={{ fontSize: Math.min(20, Math.max(11, (option.value as number) / 4.5)) }}
                  >
                    字
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">{option.name}</div>
                    <div className="text-xs text-surface-500">{option.description}</div>
                  </div>
                  {isSelected && (
                    <Check className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  )}
                </div>
              )}
            />
          </div>

          {/* 字重 */}
          <div>
            <label className="text-sm text-surface-300 mb-2 flex items-center justify-between">
              <span>字重</span>
              <span className="text-amber-400 text-xs">
                {({ 300: '细', 500: '标准', 700: '粗', 900: '特粗' } as Record<number, string>)[subtitle.style.fontWeight] || '标准'}
              </span>
            </label>
            <StyleDropdown
              value={subtitle.style.fontWeight.toString()}
              options={[
                { id: '300', name: '纤细轻盈', value: 300, description: '细' },
                { id: '500', name: '推荐・清晰易读', value: 500, description: '标准' },
                { id: '700', name: '醒目突出', value: 700, description: '粗' },
                { id: '900', name: '强烈冲击', value: 900, description: '特粗' },
              ]}
              onChange={(val) => onStyleChange({ fontWeight: Number(val) })}
              renderOption={(option, isSelected) => (
                <div className={`
                  flex items-center gap-3 px-3 py-2.5 cursor-pointer rounded-lg transition-all
                  ${isSelected 
                    ? 'bg-amber-500/20 text-amber-400' 
                    : 'hover:bg-surface-700 text-surface-200'
                  }
                `}>
                  {/* 字重预览 - 实际粗细示意 */}
                  <span 
                    className="text-base flex-shrink-0 w-10 text-center text-surface-300"
                    style={{ fontWeight: option.value as number }}
                  >
                    字幕
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">{option.name}</div>
                    <div className="text-xs text-surface-500">{option.description}</div>
                  </div>
                  {isSelected && (
                    <Check className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  )}
                </div>
              )}
            />
          </div>

          {/* 文字颜色 */}
          <div>
            <label className="text-sm text-surface-300 mb-2 flex items-center gap-2">
              <Palette className="w-4 h-4 text-amber-400" />
              <span>文字颜色</span>
            </label>
            <div className="flex gap-2">
              <div className="flex-1 grid grid-cols-7 gap-1.5">
                {TEXT_COLOR_PRESETS.slice(0, 7).map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => onStyleChange({ color: preset.value, colorType: 'solid' })}
                    className={`
                      w-7 h-7 rounded-md border-2 transition-all relative
                      ${subtitle.style.color === preset.value 
                        ? 'border-amber-400 scale-110' 
                        : 'border-surface-600 hover:border-surface-500'
                      }
                    `}
                    title={preset.name}
                    style={{ background: preset.type === 'gradient' ? preset.value : preset.value }}
                  >
                    {subtitle.style.color === preset.value && (
                      <Check className="w-3 h-3 text-white absolute inset-0 m-auto drop-shadow-lg" />
                    )}
                  </button>
                ))}
              </div>
              <input
                type="color"
                value={subtitle.style.color.startsWith('#') ? subtitle.style.color : '#FFFFFF'}
                onChange={(e) => onStyleChange({ color: e.target.value, colorType: 'solid' })}
                className="w-7 h-7 rounded-md cursor-pointer border-2 border-surface-600 hover:border-surface-500"
                title="自定义颜色"
              />
            </div>
          </div>

          {/* 背景样式 */}
          <div>
            <label className="text-sm text-surface-300 mb-2 flex items-center justify-between">
              <span>背景样式</span>
              <span className="text-amber-400 text-xs">
                {BACKGROUND_PRESETS.find(p => p.value === subtitle.style.backgroundColor)?.name || '无背景'}
              </span>
            </label>
            <StyleDropdown
              value={subtitle.style.backgroundColor}
              options={BACKGROUND_PRESETS.map(preset => ({
                id: preset.id,
                name: preset.name,
                preview: preset.id === 'transparent' ? '🚫' : preset.id === 'blur' ? '🌫️' : '⬛',
                value: preset.value,
              }))}
              onChange={(val) => onStyleChange({ backgroundColor: val })}
              renderOption={(option, isSelected) => (
                <div className={`
                  flex items-center gap-3 px-3 py-2.5 cursor-pointer rounded-lg transition-all
                  ${isSelected 
                    ? 'bg-amber-500/20 text-amber-400' 
                    : 'hover:bg-surface-700 text-surface-200'
                  }
                `}>
                  <div 
                    className="w-6 h-6 rounded border border-surface-500 flex-shrink-0"
                    style={{ 
                      background: option.value === 'transparent' 
                        ? 'repeating-conic-gradient(#444 0% 25%, #333 0% 50%) 50% / 8px 8px'
                        : option.value as string 
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">{option.name}</div>
                  </div>
                  {isSelected && (
                    <Check className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  )}
                </div>
              )}
            />
          </div>

          {/* 花字效果 */}
          <div>
            <label className="text-sm text-surface-300 mb-2 flex items-center gap-2">
              <Wand2 className="w-4 h-4 text-amber-400" />
              <span>花字效果</span>
              <span className="ml-auto text-amber-400 text-xs">
                {DECORATION_EFFECTS.find(d => d.id === subtitle.style.decorationId)?.name || '无效果'}
              </span>
            </label>
            <StyleDropdown
              value={subtitle.style.decorationId}
              options={DECORATION_EFFECTS.map(effect => ({
                id: effect.id,
                name: effect.name,
                preview: effect.preview,
                description: effect.description,
              }))}
              onChange={(val) => onStyleChange({ decorationId: val })}
            />
          </div>

          {/* 动画效果 */}
          <div>
            <label className="text-sm text-surface-300 mb-2 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>动画效果</span>
              <span className="ml-auto text-amber-400 text-xs">
                {ANIMATION_EFFECTS.find(a => a.id === subtitle.style.animationId)?.name || '无动画'}
              </span>
            </label>
            <StyleDropdown
              value={subtitle.style.animationId}
              options={ANIMATION_EFFECTS.map(animation => ({
                id: animation.id,
                name: animation.name,
                preview: animation.preview,
                description: animation.description,
              }))}
              onChange={(val) => onStyleChange({ animationId: val })}
            />
          </div>

          {/* 位置与对齐 */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-surface-300 mb-2 flex items-center justify-between">
                <span>垂直位置</span>
                <span className="text-amber-400 text-xs">
                  {({ top: '顶部', center: '居中', bottom: '底部' } as Record<string, string>)[subtitle.style.position] || '底部'}
                </span>
              </label>
              <StyleDropdown
                value={subtitle.style.position}
                options={[
                  { id: 'top', name: '顶部', preview: '⬆️' },
                  { id: 'center', name: '居中', preview: '⏺️' },
                  { id: 'bottom', name: '底部', preview: '⬇️' },
                ]}
                onChange={(val) => onStyleChange({ position: val as 'top' | 'center' | 'bottom' })}
              />
            </div>
            <div>
              <label className="text-sm text-surface-300 mb-2 block">水平对齐</label>
              <div className="flex gap-1 h-10">
                <Button
                  variant={subtitle.style.alignment === 'left' ? 'primary' : 'secondary'}
                  size="sm"
                  isIconOnly
                  className="flex-1 h-full"
                  onClick={() => onStyleChange({ alignment: 'left' })}
                >
                  <AlignLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant={subtitle.style.alignment === 'center' ? 'primary' : 'secondary'}
                  size="sm"
                  isIconOnly
                  className="flex-1 h-full"
                  onClick={() => onStyleChange({ alignment: 'center' })}
                >
                  <AlignCenter className="w-4 h-4" />
                </Button>
                <Button
                  variant={subtitle.style.alignment === 'right' ? 'primary' : 'secondary'}
                  size="sm"
                  isIconOnly
                  className="flex-1 h-full"
                  onClick={() => onStyleChange({ alignment: 'right' })}
                >
                  <AlignRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* 边距调整 */}
          <div>
            <label className="text-sm text-surface-300 mb-2 flex items-center justify-between">
              <span>底部边距</span>
              <span className="font-mono text-amber-400 text-xs">{subtitle.style.marginBottom}%</span>
            </label>
            <Slider
              value={[subtitle.style.marginBottom]}
              min={2}
              max={25}
              step={1}
              onValueChange={(v) => onStyleChange({ marginBottom: v[0] })}
            />
          </div>

          {/* 字间距 */}
          <div>
            <label className="text-sm text-surface-300 mb-2 flex items-center justify-between">
              <span>字间距</span>
              <span className="font-mono text-amber-400 text-xs">{subtitle.style.letterSpacing}px</span>
            </label>
            <Slider
              value={[subtitle.style.letterSpacing]}
              min={0}
              max={16}
              step={1}
              onValueChange={(v) => onStyleChange({ letterSpacing: v[0] })}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================
// 字幕推荐页面
// ============================================

export default function SubtitlePage() {
  const { goToNextStep, markStepCompleted, currentStep, setBottomBar, hideBottomBar, targetDevice, deviceConfig } = useEditor()
  const [isGenerating, setIsGenerating] = useState(true)
  const [progress, setProgress] = useState(0)
  const [segments, setSegments] = useState<VideoSegment[]>([])
  const [editingSubtitleId, setEditingSubtitleId] = useState<string | null>(null)
  const [editingText, setEditingText] = useState('')
  
  // 预览状态
  const [previewSegment, setPreviewSegment] = useState<VideoSegment | null>(null)
  const [previewSubtitle, setPreviewSubtitle] = useState<SubtitleLine | null>(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)

  // 字幕样式编辑状态
  const [styleEditingId, setStyleEditingId] = useState<string | null>(null)
  const [styleEditingSegmentId, setStyleEditingSegmentId] = useState<string | null>(null)

  // 导出测试状态
  const [isExporting, setIsExporting] = useState(false)
  const [exportProgress, setExportProgress] = useState(0)
  const [exportMessage, setExportMessage] = useState('')
  const [exportedVideoUrl, setExportedVideoUrl] = useState<string | null>(null)
  const [exportError, setExportError] = useState<string | null>(null)
  const [exportFileSize, setExportFileSize] = useState<string>('')

  const totalSubtitles = segments.reduce((acc, seg) => acc + seg.subtitles.length, 0)

  // 导出测试功能 - 使用完整视频合成系统
  const handleExportTest = async () => {
    if (segments.length === 0) return

    setIsExporting(true)
    setExportProgress(0)
    setExportMessage('准备导出...')
    setExportedVideoUrl(null)
    setExportError(null)

    try {
      const segment = segments[0]
      
      // 转换字幕格式 - 传递完整样式
      const subtitles = segment.subtitles.map((sub) => {
        const style = sub.style
        return {
          text: sub.text,
          startTime: sub.startTime,
          endTime: sub.endTime,
          style: {
            // 字体
            fontSize: style.fontSize,
            fontFamily: style.fontFamily,
            fontWeight: style.fontWeight,
            letterSpacing: style.letterSpacing,
            // 颜色
            color: style.color,
            backgroundColor: style.backgroundColor !== 'transparent' ? style.backgroundColor : undefined,
            backgroundPadding: style.backgroundPadding?.x,
            backgroundRadius: style.backgroundBorderRadius,
            // 位置
            position: style.position,
            alignment: style.alignment,
            marginBottom: style.marginBottom,
            // 描边
            hasOutline: style.hasOutline,
            outlineColor: style.outlineColor,
            outlineWidth: style.outlineWidth,
            // 阴影
            hasShadow: style.hasShadow,
            shadowColor: style.shadowColor,
            shadowBlur: style.shadowBlur,
            shadowOffsetX: style.shadowOffsetX,
            shadowOffsetY: style.shadowOffsetY,
          },
          animation: {
            type: (style.animationId || 'fade') as AnimationEffect['type'],
            enterDuration: 0.3,
            exitDuration: 0.2,
          },
        }
      })

      console.log('[Export] 字幕配置:', subtitles)

      // 进度回调
      const onProgress: ProgressCallback = (progress, message) => {
        setExportProgress(progress)
        setExportMessage(message)
      }

      // 使用完整视频合成系统（支持音频）
      const outputUrl = await quickCompose(
        segment.videoUrl,
        subtitles,
        {
          startTime: segment.startTime,
          endTime: segment.endTime,
          width: 1280,
          height: 720,
          fps: 30,
          keepAudio: true,
        },
        onProgress
      )

      // 获取文件大小
      try {
        const response = await fetch(outputUrl)
        const blob = await response.blob()
        const sizeMB = (blob.size / 1024 / 1024).toFixed(2)
        setExportFileSize(`${sizeMB} MB`)
        console.log('[Export] 导出文件大小:', sizeMB, 'MB')
      } catch (e) {
        console.warn('[Export] 无法获取文件大小:', e)
      }

      setExportedVideoUrl(outputUrl)
      setExportMessage('导出完成！')
      setExportProgress(100)
    } catch (error) {
      console.error('导出失败:', error)
      setExportError(error instanceof Error ? error.message : '导出失败')
    } finally {
      setIsExporting(false)
    }
  }

  // 下载导出的视频
  const handleDownload = () => {
    if (!exportedVideoUrl) return

    const a = document.createElement('a')
    a.href = exportedVideoUrl
    a.download = `subtitle-test-${Date.now()}.mp4`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  // 使用 ref 存储最新的回调函数
  const handleConfirmRef = useRef(() => {
    markStepCompleted(currentStep)
    goToNextStep()
  })

  useEffect(() => {
    handleConfirmRef.current = () => {
      markStepCompleted(currentStep)
      goToNextStep()
    }
  }, [markStepCompleted, currentStep, goToNextStep])

  const handleConfirmSubtitle = useCallback(() => {
    handleConfirmRef.current()
  }, [])

  // 打开片段预览
  const openPreview = (segment: VideoSegment) => {
    setPreviewSegment(segment)
    setPreviewSubtitle(null)
    setIsPreviewOpen(true)
  }

  // 打开字幕子片段预览
  const openSubtitlePreview = (segment: VideoSegment, subtitle: SubtitleLine) => {
    setPreviewSegment(segment)
    setPreviewSubtitle(subtitle)
    setIsPreviewOpen(true)
  }

  // 更新底部操作栏
  useEffect(() => {
    if (!isGenerating && segments.length > 0) {
      setBottomBar({
        show: true,
        icon: <Sparkles className="w-5 h-5 text-amber-400" />,
        title: `已为 ${segments.length} 个片段生成 ${totalSubtitles} 条字幕`,
        description: '确认字幕内容后，继续下一步设置标题',
        primaryButton: {
          text: '确认字幕，继续下一步',
          onClick: handleConfirmSubtitle,
        },
      })
    } else {
      hideBottomBar()
    }
  }, [isGenerating, segments.length, totalSubtitles, setBottomBar, hideBottomBar, handleConfirmSubtitle])

  // 模拟生成过程
  useEffect(() => {
    if (isGenerating) {
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval)
            setIsGenerating(false)
            setSegments(mockSegments)
            return 100
          }
          return prev + Math.random() * 12
        })
      }, 200)
      return () => clearInterval(interval)
    }
  }, [isGenerating])

  // 获取标签颜色
  const getLabelColor = (label: string, index: number) => {
    if (labelColorMap[label]) {
      return labelColorMap[label]
    }
    const defaultColors = [
      'bg-sky-500/20 text-sky-400 border border-sky-500/30',
      'bg-lime-500/20 text-lime-400 border border-lime-500/30',
    ]
    return defaultColors[index % defaultColors.length]
  }

  // 切换片段展开/收起
  const toggleExpand = (segmentId: string) => {
    setSegments((prev) =>
      prev.map((seg) =>
        seg.id === segmentId ? { ...seg, isExpanded: !seg.isExpanded } : seg
      )
    )
  }

  // 开始编辑字幕
  const startEditSubtitle = (subtitleId: string, text: string) => {
    setEditingSubtitleId(subtitleId)
    setEditingText(text)
  }

  // 保存字幕编辑
  const saveSubtitleEdit = (segmentId: string, subtitleId: string) => {
    setSegments((prev) =>
      prev.map((seg) =>
        seg.id === segmentId
          ? {
              ...seg,
              subtitles: seg.subtitles.map((sub) =>
                sub.id === subtitleId ? { ...sub, text: editingText } : sub
              ),
            }
          : seg
      )
    )
    setEditingSubtitleId(null)
    setEditingText('')
  }

  // 删除字幕
  const deleteSubtitle = (segmentId: string, subtitleId: string) => {
    setSegments((prev) =>
      prev.map((seg) =>
        seg.id === segmentId
          ? { ...seg, subtitles: seg.subtitles.filter((sub) => sub.id !== subtitleId) }
          : seg
      )
    )
  }

  // 更新字幕样式
  const updateSubtitleStyle = (segmentId: string, subtitleId: string, newStyle: Partial<SubtitleStyle>) => {
    setSegments((prev) =>
      prev.map((seg) =>
        seg.id === segmentId
          ? {
              ...seg,
              subtitles: seg.subtitles.map((sub) =>
                sub.id === subtitleId ? { ...sub, style: { ...sub.style, ...newStyle } } : sub
              ),
            }
          : seg
      )
    )
  }


  return (
    <div className="flex-1 flex min-h-0 overflow-hidden">
      {/* 左侧片段列表 */}
      <div className="flex-1 flex flex-col overflow-hidden border-r border-surface-800">
        {/* 页面标题 */}
        <div className="flex-shrink-0 px-6 pt-6 pb-4">
          <h1 className="text-2xl font-display font-bold text-surface-100 mb-2">
            字幕推荐
          </h1>
          <p className="text-surface-400">
            AI 按画面切换自动生成字幕，一个画面对应一条字幕
          </p>
        </div>

        {/* 生成进度 */}
        <AnimatePresence>
          {isGenerating && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex-shrink-0 px-6 pb-4"
            >
              <Card variant="glass" className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Mic className="w-5 h-5 text-amber-400 animate-pulse" />
                  <span className="text-surface-200">正在识别语音并生成字幕...</span>
                  <span className="ml-auto font-mono text-amber-400">
                    {Math.round(progress)}%
                  </span>
                </div>
                <Progress value={progress} variant="primary" size="sm" />
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 片段列表 */}
        {!isGenerating && segments.length > 0 && (
          <div className="flex-1 overflow-y-auto px-6 min-h-0 pb-6">
            <div className="space-y-3">
              {segments.map((segment, index) => (
                <motion.div
                  key={segment.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08 }}
                >
                  <Card
                    className={`
                      overflow-hidden transition-all duration-200
                      ${segment.score >= 90 ? 'border-amber-400/30' : ''}
                    `}
                  >
                    {/* 片段头部 */}
                    <div
                      className="p-3 cursor-pointer hover:bg-surface-800/50 transition-colors"
                      onClick={() => toggleExpand(segment.id)}
                    >
                      <div className="flex gap-3 items-start">
                        {/* 缩略图 */}
                        <div
                          className="relative w-28 h-16 rounded-lg overflow-hidden bg-surface-800 flex-shrink-0 group cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation()
                            openPreview(segment)
                          }}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={segment.thumbnailUrl}
                            alt={`片段 ${segment.id}`}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                          {/* 播放按钮 */}
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="w-8 h-8 rounded-full bg-amber-400/90 flex items-center justify-center">
                              <Play className="w-4 h-4 text-surface-950 ml-0.5" />
                            </div>
                          </div>
                          {/* 评分 */}
                          <div
                            className={`
                              absolute top-1.5 left-1.5 px-2 py-0.5 rounded text-xs font-bold backdrop-blur-sm
                              ${segment.score >= 80 ? 'bg-emerald-500/90 text-white' : ''}
                              ${segment.score >= 50 && segment.score < 80 ? 'bg-amber-500/90 text-white' : ''}
                              ${segment.score < 50 ? 'bg-red-500/90 text-white' : ''}
                            `}
                          >
                            {segment.score}分
                          </div>
                          {/* 时间范围 */}
                          <div className="absolute bottom-1 left-1 right-1 px-1 py-0.5 rounded bg-black/70 backdrop-blur-sm text-[10px] font-mono text-white text-center whitespace-nowrap">
                            {formatTime(segment.startTime)}-{formatTime(segment.endTime)} {segment.endTime - segment.startTime}s
                          </div>
                        </div>

                        {/* 片段信息 */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-mono text-surface-400 flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              {formatTime(segment.startTime)} - {formatTime(segment.endTime)}
                            </span>
                            <Badge variant="outline" size="sm">
                              {segment.subtitles.length} 条字幕
                            </Badge>
                          </div>
                          {/* 字幕汇总（自动生成，不可编辑） */}
                          <p className="text-surface-300 text-sm line-clamp-2">
                            {segment.subtitles.map(s => s.text).join(' ｜ ')}
                          </p>
                        </div>

                        {/* 右侧：标签 + 展开/收起按钮 */}
                        <div className="flex-shrink-0 flex flex-col items-end gap-2">
                          {/* 标签 */}
                          <div className="flex gap-1.5 justify-end">
                            {segment.labels.map((label, labelIndex) => (
                              <span
                                key={label}
                                className={`
                                  inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium
                                  ${getLabelColor(label, labelIndex)}
                                `}
                              >
                                <Tag className="w-3 h-3" />
                                {label}
                              </span>
                            ))}
                          </div>
                          {/* 展开/收起按钮 */}
                          <div className="flex items-center gap-1 text-surface-400">
                            <span className="text-xs">{segment.isExpanded ? '收起' : '展开'}</span>
                            {segment.isExpanded ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 字幕编辑区 */}
                    <AnimatePresence>
                      {segment.isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="border-t border-surface-700 bg-surface-800/30 p-4">
                            <div className="flex items-center gap-2 mb-3">
                              <Scissors className="w-4 h-4 text-amber-400" />
                              <span className="text-sm font-medium text-surface-200">
                                画面字幕（{segment.subtitles.length} 个画面）
                              </span>
                            </div>

                            {/* 字幕列表 */}
                            <div className="space-y-2">
                              {segment.subtitles.map((subtitle) => (
                                <div
                                  key={subtitle.id}
                                  className={`
                                    rounded-lg bg-surface-900/50 border group transition-all cursor-pointer
                                    ${styleEditingId === subtitle.id 
                                      ? 'border-amber-400/50 bg-surface-800/50' 
                                      : 'border-surface-700 hover:border-surface-500 hover:bg-surface-800/30'
                                    }
                                  `}
                                  onClick={() => {
                                    // 点击卡片空白区域时切换样式编辑面板
                                    if (styleEditingId === subtitle.id) {
                                      setStyleEditingId(null)
                                      setStyleEditingSegmentId(null)
                                    } else {
                                      setStyleEditingId(subtitle.id)
                                      setStyleEditingSegmentId(segment.id)
                                    }
                                  }}
                                >
                                <div className="flex items-center gap-3 p-2">
                                  {/* 画面缩略图 + 预览 */}
                                  <div
                                    className="relative w-28 h-16 rounded overflow-hidden bg-surface-800 flex-shrink-0 cursor-pointer group/preview"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      openSubtitlePreview(segment, subtitle)
                                    }}
                                  >
                                    {subtitle.thumbnailUrl ? (
                                      // eslint-disable-next-line @next/next/no-img-element
                                      <img
                                        src={subtitle.thumbnailUrl}
                                        alt="画面"
                                        className="w-full h-full object-cover transition-transform duration-200 group-hover/preview:scale-105"
                                      />
                                    ) : (
                                      <div className="w-full h-full bg-surface-700 flex items-center justify-center">
                                        <Scissors className="w-4 h-4 text-surface-500" />
                                      </div>
                                    )}
                                    {/* 播放按钮覆盖层 */}
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/preview:opacity-100 transition-opacity">
                                      <div className="w-6 h-6 rounded-full bg-amber-400 flex items-center justify-center">
                                        <Play className="w-3 h-3 text-surface-950 ml-0.5" />
                                      </div>
                                    </div>
                                    {/* 时间范围 */}
                                    <div className="absolute bottom-0.5 left-0.5 right-0.5 px-1 py-0.5 rounded bg-black/70 text-[10px] font-mono text-white text-center">
                                      {formatTime(subtitle.startTime)}-{formatTime(subtitle.endTime)} {Math.round(subtitle.endTime - subtitle.startTime)}s
                                    </div>
                                  </div>

                                  {/* 字幕内容 */}
                                  {(() => {
                                    const duration = subtitle.endTime - subtitle.startTime
                                    const minChars = Math.floor(duration * 2.5) // 慢速：2.5字/秒
                                    const maxChars = Math.ceil(duration * 4.5)  // 快速：4.5字/秒
                                    const currentChars = subtitle.text.length
                                    const isOverflow = currentChars > maxChars
                                    const isUnderflow = currentChars < minChars
                                    const isWarning = isOverflow || isUnderflow
                                    
                                    return (
                                      <div className="flex-1 min-w-0">
                                        {editingSubtitleId === subtitle.id ? (
                                          <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                                            <input
                                              type="text"
                                              value={editingText}
                                              onChange={(e) => setEditingText(e.target.value)}
                                              className="flex-1 bg-surface-700 border border-amber-400/50 rounded px-2 py-1.5 text-surface-100 text-sm focus:outline-none focus:border-amber-400"
                                              autoFocus
                                              onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                  saveSubtitleEdit(segment.id, subtitle.id)
                                                } else if (e.key === 'Escape') {
                                                  setEditingSubtitleId(null)
                                                }
                                              }}
                                            />
                                            <Button
                                              variant="primary"
                                              size="xs"
                                              isIconOnly
                                              onClick={(e) => {
                                                e.stopPropagation()
                                                saveSubtitleEdit(segment.id, subtitle.id)
                                              }}
                                            >
                                              <Save className="w-3.5 h-3.5" />
                                            </Button>
                                          </div>
                                        ) : (
                                          <div>
                                            <p className="text-surface-200 text-sm leading-relaxed">
                                              {subtitle.text}
                                            </p>
                                            {/* 字数统计 */}
                                            <div className="flex items-center gap-2 mt-1">
                                              <span className={`text-xs ${isWarning ? 'text-amber-400' : 'text-surface-500'}`}>
                                                {currentChars}字
                                              </span>
                                              <span className="text-xs text-surface-600">
                                                建议 {minChars}-{maxChars}字
                                              </span>
                                              {isOverflow && (
                                                <span className="text-xs text-amber-400">字数偏多</span>
                                              )}
                                              {isUnderflow && (
                                                <span className="text-xs text-amber-400">字数偏少</span>
                                              )}
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    )
                                  })()}

                                  {/* 操作按钮 */}
                                  {editingSubtitleId !== subtitle.id && (
                                    <div className="flex items-center gap-1 flex-shrink-0">
                                      {/* 样式按钮 - 始终显示 */}
                                      <Button
                                        variant={styleEditingId === subtitle.id ? 'primary' : 'ghost'}
                                        size="xs"
                                        isIconOnly
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          if (styleEditingId === subtitle.id) {
                                            setStyleEditingId(null)
                                            setStyleEditingSegmentId(null)
                                          } else {
                                            setStyleEditingId(subtitle.id)
                                            setStyleEditingSegmentId(segment.id)
                                          }
                                        }}
                                        title="字幕样式"
                                      >
                                        <Palette className="w-3.5 h-3.5" />
                                      </Button>
                                      {/* 编辑和删除按钮 - 悬停显示 */}
                                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button
                                          variant="ghost"
                                          size="xs"
                                          isIconOnly
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            startEditSubtitle(subtitle.id, subtitle.text)
                                          }}
                                        >
                                          <Edit3 className="w-3.5 h-3.5" />
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="xs"
                                          isIconOnly
                                          className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            deleteSubtitle(segment.id, subtitle.id)
                                          }}
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </Button>
                                      </div>
                                    </div>
                                  )}
                                </div>

                                {/* 字幕样式编辑面板 - 左右布局 */}
                                <AnimatePresence>
                                  {styleEditingId === subtitle.id && (
                                    <motion.div
                                      initial={{ height: 0, opacity: 0 }}
                                      animate={{ height: 'auto', opacity: 1 }}
                                      exit={{ height: 0, opacity: 0 }}
                                      transition={{ duration: 0.2 }}
                                      className="overflow-hidden"
                                    >
                                      <div className="mt-3 p-4 rounded-xl bg-surface-800 border border-surface-700">
                                        <div className="flex items-center justify-between mb-4">
                                          <div className="flex items-center gap-2">
                                            <Palette className="w-4 h-4 text-amber-400" />
                                            <span className="text-sm font-medium text-surface-200">字幕样式编辑</span>
                                          </div>
                                          <Button
                                            variant="primary"
                                            size="xs"
                                            onClick={() => {
                                              setStyleEditingId(null)
                                              setStyleEditingSegmentId(null)
                                            }}
                                          >
                                            完成编辑
                                          </Button>
                                        </div>

                                        {/* 左右布局的预览 + 控件 */}
                                        <SubtitleStylePreview
                                          segment={segment}
                                          subtitle={subtitle}
                                          onStyleChange={(newStyle) => updateSubtitleStyle(segment.id, subtitle.id, newStyle)}
                                          device={targetDevice}
                                          deviceConfig={deviceConfig}
                                        />
                                      </div>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                              ))}
                            </div>

                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 右侧统计面板 */}
      <div className="w-64 p-6 bg-surface-900/50 overflow-y-auto">
        <h2 className="text-lg font-semibold text-surface-100 mb-4">
          字幕概览
        </h2>

        {/* 统计信息 */}
        <div className="space-y-4">
          <Card className="p-4">
            <div className="text-3xl font-bold text-amber-400 mb-1">{segments.length}</div>
            <div className="text-sm text-surface-400">视频片段</div>
          </Card>
          
          <Card className="p-4">
            <div className="text-3xl font-bold text-emerald-400 mb-1">{totalSubtitles}</div>
            <div className="text-sm text-surface-400">字幕总数</div>
          </Card>

          <div className="pt-4 border-t border-surface-700">
            <h3 className="text-sm font-medium text-surface-200 mb-3 flex items-center gap-2">
              <Palette className="w-4 h-4 text-amber-400" />
              样式说明
            </h3>
            <div className="space-y-2">
              <p className="text-xs text-surface-500 leading-relaxed">
                <span className="text-amber-400">点击字幕卡片</span> 可直接打开样式编辑面板，设置字体、颜色、位置等样式。
              </p>
              <p className="text-xs text-surface-500 leading-relaxed">
                <span className="text-surface-400">点击缩略图</span> 可预览该时间段的视频画面。
              </p>
            </div>
          </div>

          {/* 导出测试区域 */}
          {!isGenerating && segments.length > 0 && (
            <div className="pt-4 border-t border-surface-700">
              <h3 className="text-sm font-medium text-surface-200 mb-3 flex items-center gap-2">
                <Download className="w-4 h-4 text-amber-400" />
                导出测试
              </h3>
              
              {/* 导出按钮 */}
              {!isExporting && !exportedVideoUrl && (
                <div>
                  <p className="text-xs text-surface-500 mb-3">
                    测试第一个片段的字幕合成导出效果
                  </p>
                  <Button
                    variant="primary"
                    size="sm"
                    fullWidth
                    leftIcon={<Download className="w-4 h-4" />}
                    onClick={handleExportTest}
                    disabled={isExporting}
                  >
                    测试导出
                  </Button>
                </div>
              )}

              {/* 导出进度 */}
              {isExporting && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 text-amber-400 animate-spin" />
                    <span className="text-sm text-surface-300">{exportMessage}</span>
                  </div>
                  <Progress value={exportProgress} variant="primary" size="sm" />
                  <p className="text-xs text-surface-500 text-center">
                    {Math.round(exportProgress)}%
                  </p>
                </div>
              )}

              {/* 导出错误 */}
              {exportError && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                  <p className="text-sm text-red-400 mb-2">导出失败</p>
                  <p className="text-xs text-surface-500">{exportError}</p>
                  <Button
                    variant="outline"
                    size="xs"
                    className="mt-2"
                    onClick={() => {
                      setExportError(null)
                      setExportProgress(0)
                    }}
                  >
                    重试
                  </Button>
                </div>
              )}

              {/* 导出成功 */}
              {exportedVideoUrl && !isExporting && !exportError && (
                <div className="space-y-3">
                  <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                    <p className="text-sm text-emerald-400 mb-2">🎉 导出成功！</p>
                    <p className="text-xs text-surface-400">
                      字幕已成功合成到视频中
                    </p>
                    {exportFileSize && (
                      <p className="text-xs text-surface-500 mt-1">
                        文件大小: {exportFileSize}
                      </p>
                    )}
                  </div>

                  {/* 预览导出的视频 */}
                  <div className="rounded-lg overflow-hidden bg-surface-800">
                    <video
                      src={exportedVideoUrl}
                      controls
                      className="w-full aspect-video"
                      autoPlay
                      loop
                      playsInline
                      onError={(e) => {
                        console.error('[Video] 播放错误:', e)
                      }}
                      onLoadedData={() => {
                        console.log('[Video] 视频加载完成')
                      }}
                    />
                  </div>

                  {/* 操作按钮 */}
                  <div className="flex gap-2">
                    <Button
                      variant="primary"
                      size="sm"
                      className="flex-1"
                      leftIcon={<Download className="w-4 h-4" />}
                      onClick={handleDownload}
                    >
                      下载视频
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setExportedVideoUrl(null)
                        setExportProgress(0)
                        setExportMessage('')
                      }}
                    >
                      重新导出
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 媒体预览模态框 */}
      <MediaPreviewModal
        isOpen={isPreviewOpen}
        onClose={() => {
          setIsPreviewOpen(false)
          setPreviewSubtitle(null)
        }}
        type="video"
        src={previewSegment?.videoUrl || ''}
        title={
          previewSubtitle
            ? `字幕预览: "${previewSubtitle.text}"`
            : `片段 ${previewSegment?.id} - ${previewSegment?.description || ''}`
        }
        startTime={0}
        endTime={
          previewSubtitle
            ? previewSubtitle.endTime - previewSubtitle.startTime
            : previewSegment
            ? previewSegment.endTime - previewSegment.startTime
            : undefined
        }
      />
    </div>
  )
}
