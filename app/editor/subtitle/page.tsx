'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
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
} from 'lucide-react'
import { Button, Card, Badge, Progress, Switch, Slider, Tabs } from '@/components/ui'
import { MediaPreviewModal } from '@/components/media-preview-modal'
import { useEditor } from '../layout'
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
    endTime: 12,
    thumbnailUrl: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=300&h=200&fit=crop',
    videoUrl: SAMPLE_VIDEO_URL,
    description: '主角出场，微笑面对镜头，情绪积极',
    labels: ['开场', '人物', '特写'],
    score: 92,
    subtitles: [
      { id: '1-1', text: '大家好，欢迎来到今天的视频', startTime: 0, endTime: 4, thumbnailUrl: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=120&h=68&fit=crop', style: { ...defaultSubtitleStyle } },
      { id: '1-2', text: '今天我们要聊一个非常有趣的话题', startTime: 4, endTime: 8, thumbnailUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=68&fit=crop', style: { ...defaultSubtitleStyle } },
      { id: '1-3', text: '准备好了吗？让我们开始吧！', startTime: 8, endTime: 12, thumbnailUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&h=68&fit=crop', style: { ...defaultSubtitleStyle } },
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

type DevicePreset = 'phone' | 'pc'

interface DeviceConfig {
  name: string
  icon: typeof Smartphone
  aspectRatio: string // CSS aspect-ratio
  width: number // 真实分辨率宽度
  height: number // 真实分辨率高度
  previewHeight: string // 预览框高度（使用固定高度确保舒适观看）
  fontScale: number // 字体缩放比例（相对于 PC）
}

const devicePresets: Record<DevicePreset, DeviceConfig> = {
  phone: {
    name: '手机竖屏',
    icon: Smartphone,
    aspectRatio: '9/16',
    width: 1080,
    height: 1920,
    previewHeight: '380px', // 适中预览尺寸
    fontScale: 1.0,
  },
  pc: {
    name: 'PC横屏',
    icon: Monitor,
    aspectRatio: '16/9',
    width: 1920,
    height: 1080,
    previewHeight: '320px',
    fontScale: 1.0,
  },
}

// ============================================
// 颜色选择器组件
// ============================================

const ColorPicker = ({
  value,
  onChange,
  presets,
  label,
}: {
  value: string
  onChange: (color: string) => void
  presets: typeof TEXT_COLOR_PRESETS
  label: string
}) => {
  const [showCustom, setShowCustom] = useState(false)
  
  return (
    <div>
      <label className="text-sm text-surface-300 mb-3 block">{label}</label>
      <div className="grid grid-cols-6 gap-2">
        {presets.slice(0, 12).map((preset) => (
          <button
            key={preset.id}
            onClick={() => onChange(preset.value)}
            className={`
              w-8 h-8 rounded-lg border-2 transition-all relative overflow-hidden
              ${value === preset.value 
                ? 'border-amber-400 scale-110 shadow-lg' 
                : 'border-surface-600 hover:border-surface-500'
              }
            `}
            title={preset.name}
            style={{
              background: preset.type === 'gradient' ? preset.value : preset.value,
            }}
          >
            {value === preset.value && (
              <Check className="w-4 h-4 text-white absolute inset-0 m-auto drop-shadow-lg" />
            )}
          </button>
        ))}
      </div>
      {/* 自定义颜色 */}
      <div className="mt-3 flex items-center gap-2">
        <button
          onClick={() => setShowCustom(!showCustom)}
          className="text-xs text-surface-400 hover:text-surface-200 underline"
        >
          自定义颜色
        </button>
        {showCustom && (
          <input
            type="color"
            value={value.startsWith('#') ? value : '#FFFFFF'}
            onChange={(e) => onChange(e.target.value)}
            className="w-8 h-6 rounded cursor-pointer"
          />
        )}
      </div>
    </div>
  )
}

// ============================================
// 字幕样式预览组件 - 增强版
// ============================================

const SubtitleStylePreview = ({
  segment,
  subtitle,
  onStyleChange,
}: {
  segment: VideoSegment
  subtitle: SubtitleLine
  onStyleChange: (newStyle: Partial<SubtitleStyle>) => void
}) => {
  const [device, setDevice] = useState<DevicePreset>('pc')
  const [activeTab, setActiveTab] = useState<string>('presets')
  const previewRef = useRef<HTMLDivElement>(null)
  const [previewScale, setPreviewScale] = useState(1)
  const config = devicePresets[device]

  // 计算预览区域相对于真实分辨率的缩放比例
  useEffect(() => {
    const updateScale = () => {
      if (previewRef.current) {
        const previewWidth = previewRef.current.offsetWidth
        const scale = previewWidth / config.width
        setPreviewScale(scale)
      }
    }

    updateScale()
    window.addEventListener('resize', updateScale)
    const timer = setTimeout(updateScale, 100)
    
    return () => {
      window.removeEventListener('resize', updateScale)
      clearTimeout(timer)
    }
  }, [device, config.width])

  // 根据缩放比例调整字体大小
  const scaledFontSize = Math.round(subtitle.style.fontSize * previewScale)
  
  // 创建用于预览的字幕项（转换为旧格式以兼容 VideoPreview）
  const subtitleItem: SubtitleItem = {
    id: subtitle.id,
    text: subtitle.text,
    startTime: subtitle.startTime,
    endTime: subtitle.endTime,
    style: {
      fontSize: scaledFontSize,
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
  }

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

  // 样式标签页内容
  const tabContent = {
    presets: (
      <div className="space-y-4">
        {/* 预设分类 */}
        {(['platform', 'mood', 'creative'] as const).map((category) => {
          const categoryNames = {
            platform: '📱 平台风格',
            mood: '🎭 情绪氛围',
            creative: '✨ 创意效果',
          }
          const presets = STYLE_PRESETS.filter(p => p.category === category)
          
          return (
            <div key={category}>
              <h4 className="text-xs text-surface-400 mb-2 font-medium">
                {categoryNames[category]}
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {presets.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => applyPreset(preset.id)}
                    className="group relative p-3 rounded-xl bg-surface-700/50 hover:bg-surface-700 border border-surface-600 hover:border-amber-400/50 transition-all text-left"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{preset.preview}</span>
                      <span className="text-sm font-medium text-surface-200 group-hover:text-amber-400">
                        {preset.name}
                      </span>
                    </div>
                    <p className="text-[10px] text-surface-500 line-clamp-1">
                      {preset.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    ),
    font: (
      <div className="space-y-5">
        {/* 字体选择 */}
        <div>
          <label className="text-sm text-surface-300 mb-3 block">字体</label>
          <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
            {FONT_OPTIONS.map((font) => (
              <button
                key={font.family}
                onClick={() => onStyleChange({ fontFamily: font.family })}
                className={`
                  w-full p-3 rounded-lg border transition-all text-left
                  ${subtitle.style.fontFamily === font.family
                    ? 'border-amber-400 bg-amber-400/10'
                    : 'border-surface-600 hover:border-surface-500 bg-surface-700/30'
                  }
                `}
              >
                <span 
                  className="text-lg text-surface-200 block"
                  style={{ fontFamily: `"${font.family}", sans-serif` }}
                >
                  {font.preview}
                </span>
                <span className="text-xs text-surface-500">{font.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 字重 */}
        <div>
          <label className="text-sm text-surface-300 mb-3 flex items-center justify-between">
            <span>字重</span>
            <span className="font-mono text-amber-400">{subtitle.style.fontWeight}</span>
          </label>
          <div className="flex gap-2">
            {[300, 400, 500, 700, 900].map((weight) => (
              <Button
                key={weight}
                variant={subtitle.style.fontWeight === weight ? 'primary' : 'secondary'}
                size="xs"
                className="flex-1"
                onClick={() => onStyleChange({ fontWeight: weight })}
              >
                {weight === 300 && '细'}
                {weight === 400 && '常规'}
                {weight === 500 && '中'}
                {weight === 700 && '粗'}
                {weight === 900 && '黑'}
              </Button>
            ))}
          </div>
        </div>

        {/* 字号 */}
        <div>
          <label className="text-sm text-surface-300 mb-3 flex items-center justify-between">
            <span>字号</span>
            <span className="font-mono text-amber-400">{subtitle.style.fontSize}px</span>
          </label>
          <Slider
            value={[subtitle.style.fontSize]}
            min={device === 'phone' ? 48 : 36}
            max={device === 'phone' ? 120 : 96}
            step={4}
            onValueChange={(v) => onStyleChange({ fontSize: v[0] })}
          />
        </div>

        {/* 字间距 */}
        <div>
          <label className="text-sm text-surface-300 mb-3 flex items-center justify-between">
            <span>字间距</span>
            <span className="font-mono text-amber-400">{subtitle.style.letterSpacing}px</span>
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
    ),
    color: (
      <div className="space-y-5">
        {/* 文字颜色 */}
        <ColorPicker
          value={subtitle.style.color}
          onChange={(color) => onStyleChange({ color, colorType: 'solid' })}
          presets={TEXT_COLOR_PRESETS}
          label="文字颜色"
        />

        {/* 渐变开关 */}
        <div className="flex items-center justify-between py-3 px-4 bg-surface-700/50 rounded-xl">
          <label className="text-sm text-surface-200">使用渐变色</label>
          <Switch
            checked={subtitle.style.colorType === 'gradient'}
            onCheckedChange={(checked) => onStyleChange({ 
              colorType: checked ? 'gradient' : 'solid',
              gradientColors: checked ? ['#FFD700', '#FF6B6B'] : undefined,
              gradientAngle: 90,
            })}
          />
        </div>

        {subtitle.style.colorType === 'gradient' && (
          <div>
            <label className="text-sm text-surface-300 mb-3 flex items-center justify-between">
              <span>渐变角度</span>
              <span className="font-mono text-amber-400">{subtitle.style.gradientAngle || 90}°</span>
            </label>
            <Slider
              value={[subtitle.style.gradientAngle || 90]}
              min={0}
              max={360}
              step={15}
              onValueChange={(v) => onStyleChange({ gradientAngle: v[0] })}
            />
          </div>
        )}

        {/* 背景 */}
        <div>
          <label className="text-sm text-surface-300 mb-3 block">背景样式</label>
          <div className="grid grid-cols-3 gap-2">
            {BACKGROUND_PRESETS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => onStyleChange({ backgroundColor: preset.value })}
                className={`
                  p-2 rounded-lg border text-xs transition-all
                  ${subtitle.style.backgroundColor === preset.value
                    ? 'border-amber-400 bg-amber-400/10 text-amber-400'
                    : 'border-surface-600 hover:border-surface-500 text-surface-400'
                  }
                `}
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    ),
    effects: (
      <div className="space-y-5">
        {/* 花字效果 */}
        <div>
          <label className="text-sm text-surface-300 mb-3 flex items-center gap-2">
            <Wand2 className="w-4 h-4 text-amber-400" />
            <span>花字效果</span>
          </label>
          <div className="grid grid-cols-2 gap-2 max-h-[180px] overflow-y-auto pr-2">
            {DECORATION_EFFECTS.map((effect) => (
              <button
                key={effect.id}
                onClick={() => onStyleChange({ decorationId: effect.id })}
                className={`
                  p-2 rounded-lg border transition-all text-left
                  ${subtitle.style.decorationId === effect.id
                    ? 'border-amber-400 bg-amber-400/10'
                    : 'border-surface-600 hover:border-surface-500 bg-surface-700/30'
                  }
                `}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{effect.preview}</span>
                  <span className="text-xs text-surface-200">{effect.name}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 动画效果 */}
        <div>
          <label className="text-sm text-surface-300 mb-3 flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            <span>动画效果</span>
          </label>
          <div className="grid grid-cols-2 gap-2 max-h-[180px] overflow-y-auto pr-2">
            {ANIMATION_EFFECTS.map((animation) => (
              <button
                key={animation.id}
                onClick={() => onStyleChange({ animationId: animation.id })}
                className={`
                  p-2 rounded-lg border transition-all text-left
                  ${subtitle.style.animationId === animation.id
                    ? 'border-amber-400 bg-amber-400/10'
                    : 'border-surface-600 hover:border-surface-500 bg-surface-700/30'
                  }
                `}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{animation.preview}</span>
                  <span className="text-xs text-surface-200">{animation.name}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    ),
    position: (
      <div className="space-y-5">
        {/* 垂直位置 */}
        <div>
          <label className="text-sm text-surface-300 mb-3 block">垂直位置</label>
          <div className="flex gap-2">
            {(['top', 'center', 'bottom'] as const).map((pos) => (
              <Button
                key={pos}
                variant={subtitle.style.position === pos ? 'primary' : 'secondary'}
                size="sm"
                className="flex-1"
                onClick={() => onStyleChange({ position: pos })}
              >
                {pos === 'top' && '顶部'}
                {pos === 'center' && '居中'}
                {pos === 'bottom' && '底部'}
              </Button>
            ))}
          </div>
        </div>

        {/* 水平对齐 */}
        <div>
          <label className="text-sm text-surface-300 mb-3 block">水平对齐</label>
          <div className="flex gap-2">
            <Button
              variant={subtitle.style.alignment === 'left' ? 'primary' : 'secondary'}
              size="sm"
              isIconOnly
              className="flex-1"
              onClick={() => onStyleChange({ alignment: 'left' })}
            >
              <AlignLeft className="w-5 h-5" />
            </Button>
            <Button
              variant={subtitle.style.alignment === 'center' ? 'primary' : 'secondary'}
              size="sm"
              isIconOnly
              className="flex-1"
              onClick={() => onStyleChange({ alignment: 'center' })}
            >
              <AlignCenter className="w-5 h-5" />
            </Button>
            <Button
              variant={subtitle.style.alignment === 'right' ? 'primary' : 'secondary'}
              size="sm"
              isIconOnly
              className="flex-1"
              onClick={() => onStyleChange({ alignment: 'right' })}
            >
              <AlignRight className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* 边距 */}
        <div>
          <label className="text-sm text-surface-300 mb-3 flex items-center justify-between">
            <span>底部边距</span>
            <span className="font-mono text-amber-400">{subtitle.style.marginBottom}%</span>
          </label>
          <Slider
            value={[subtitle.style.marginBottom]}
            min={2}
            max={25}
            step={1}
            onValueChange={(v) => onStyleChange({ marginBottom: v[0] })}
          />
        </div>
      </div>
    ),
  }

  return (
    <div className="flex gap-6">
      {/* 左侧：预览区域 */}
      <div className="flex-[2] min-w-0">
        {/* 设备切换 */}
        <div className="flex items-center gap-3 mb-4">
          <span className="text-sm text-surface-300 font-medium">预览设备:</span>
          <div className="flex gap-1 p-1 bg-surface-700 rounded-xl">
            {(Object.keys(devicePresets) as DevicePreset[]).map((key) => {
              const preset = devicePresets[key]
              const Icon = preset.icon
              const isActive = device === key
              return (
                <button
                  key={key}
                  onClick={() => setDevice(key)}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
                    ${isActive 
                      ? 'bg-amber-500 text-white shadow-lg' 
                      : 'text-surface-400 hover:text-surface-200 hover:bg-surface-600'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  <span>{preset.name}</span>
                </button>
              )
            })}
          </div>
          {/* 重置按钮 */}
          <button
            onClick={resetToDefault}
            className="ml-auto flex items-center gap-1 text-xs text-surface-400 hover:text-amber-400 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>重置样式</span>
          </button>
        </div>

        {/* 预览区域 */}
        {device === 'phone' ? (
          <div className="flex justify-center">
            <div 
              ref={previewRef}
              className="relative overflow-hidden rounded-2xl shadow-2xl border-2 border-surface-600"
              style={{ 
                aspectRatio: config.aspectRatio,
                height: config.previewHeight,
              }}
            >
              <VideoPreview
                videoUrl={segment.videoUrl}
                subtitles={[subtitleItem]}
                startTime={subtitle.startTime}
                endTime={subtitle.endTime}
                autoPlay={true}
                loop={true}
                showControls={true}
                mode="native"
                className="w-full h-full"
              />
              <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-sm text-xs text-white font-medium z-30 pointer-events-none flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5" />
                <span>手机竖屏 9:16</span>
              </div>
              <div className="absolute top-3 right-3 px-2 py-1 rounded-lg bg-black/60 backdrop-blur-sm text-[10px] text-white/80 font-mono z-30 pointer-events-none">
                {config.width}×{config.height}
              </div>
            </div>
          </div>
        ) : (
          <div 
            ref={previewRef}
            className="relative rounded-xl overflow-hidden shadow-2xl border-2 border-surface-600 mx-auto"
            style={{
              aspectRatio: config.aspectRatio,
              height: config.previewHeight,
              maxWidth: '100%',
            }}
          >
            <VideoPreview
              videoUrl={segment.videoUrl}
              subtitles={[subtitleItem]}
              startTime={subtitle.startTime}
              endTime={subtitle.endTime}
              autoPlay={true}
              loop={true}
              showControls={true}
              mode="native"
              className="w-full h-full"
            />
            <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-sm text-xs text-white font-medium z-30 pointer-events-none flex items-center gap-1.5">
              <Monitor className="w-3.5 h-3.5" />
              <span>PC横屏 16:9</span>
            </div>
            <div className="absolute top-3 right-3 px-2 py-1 rounded-lg bg-black/60 backdrop-blur-sm text-[10px] text-white/80 font-mono z-30 pointer-events-none">
              {config.width}×{config.height}
            </div>
          </div>
        )}

      </div>

      {/* 右侧：样式控件 */}
      <div className="flex-1 min-w-[280px] max-w-[320px] bg-surface-900 rounded-xl border border-surface-700 overflow-hidden">
        {/* 标签页导航 */}
        <div className="flex border-b border-surface-700 bg-surface-800/50">
          {[
            { id: 'presets', icon: Sparkles, label: '预设' },
            { id: 'font', icon: Type, label: '字体' },
            { id: 'color', icon: Palette, label: '颜色' },
            { id: 'effects', icon: Wand2, label: '效果' },
            { id: 'position', icon: AlignCenter, label: '位置' },
          ].map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex-1 py-2.5 px-1 text-center transition-all border-b-2
                  ${isActive 
                    ? 'border-amber-400 text-amber-400 bg-surface-800' 
                    : 'border-transparent text-surface-500 hover:text-surface-300'
                  }
                `}
              >
                <Icon className="w-4 h-4 mx-auto mb-0.5" />
                <span className="text-[10px]">{tab.label}</span>
              </button>
            )
          })}
        </div>

        {/* 标签页内容 */}
        <div className="p-4 max-h-[450px] overflow-y-auto">
          {tabContent[activeTab as keyof typeof tabContent]}
        </div>
      </div>
    </div>
  )
}

// ============================================
// 字幕推荐页面
// ============================================

export default function SubtitlePage() {
  const { goToNextStep, markStepCompleted, currentStep, setBottomBar, hideBottomBar } = useEditor()
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

  const totalSubtitles = segments.reduce((acc, seg) => acc + seg.subtitles.length, 0)

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
                                  className="rounded-lg bg-surface-900/50 border border-surface-700 group hover:border-surface-600 transition-colors"
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
                                          <div className="flex gap-2">
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
                                              onClick={() => saveSubtitleEdit(segment.id, subtitle.id)}
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
                                          onClick={() => startEditSubtitle(subtitle.id, subtitle.text)}
                                        >
                                          <Edit3 className="w-3.5 h-3.5" />
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="xs"
                                          isIconOnly
                                          className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                                          onClick={() => deleteSubtitle(segment.id, subtitle.id)}
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
            <p className="text-xs text-surface-500 leading-relaxed">
              点击每条字幕右侧的 <span className="text-amber-400">调色板按钮</span> 可单独设置该字幕的样式，包括字体大小、位置、对齐和描边效果。
            </p>
          </div>
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
