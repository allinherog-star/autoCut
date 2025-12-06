'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Mic,
  Sparkles,
  Play,
  Check,
  Clock,
  Tag,
  Edit3,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Type,
  Palette,
  Save,
} from 'lucide-react'
import { Button, Card, Badge, Progress, Switch, Slider } from '@/components/ui'
import { MediaPreviewModal } from '@/components/media-preview-modal'
import { useEditor } from '../layout'

// ============================================
// 类型定义
// ============================================

interface SubtitleLine {
  id: string
  text: string
  startTime: number
  endTime: number
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

interface SubtitleStyle {
  fontSize: number
  color: string
  backgroundColor: string
  position: 'top' | 'center' | 'bottom'
  alignment: 'left' | 'center' | 'right'
  hasOutline: boolean
}

// ============================================
// 模拟数据
// ============================================

const SAMPLE_VIDEO_URL = 'https://www.w3schools.com/html/mov_bbb.mp4'

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
      { id: '1-1', text: '大家好，欢迎来到今天的视频', startTime: 0, endTime: 4 },
      { id: '1-2', text: '今天我们要聊一个非常有趣的话题', startTime: 4, endTime: 8 },
      { id: '1-3', text: '准备好了吗？让我们开始吧！', startTime: 8, endTime: 12 },
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
      { id: '2-1', text: '这个观点真的很有意思', startTime: 12, endTime: 16 },
      { id: '2-2', text: '我之前从来没有这样想过', startTime: 16, endTime: 20 },
      { id: '2-3', text: '你能详细解释一下吗？', startTime: 20, endTime: 24 },
      { id: '2-4', text: '当然，让我来给你分析', startTime: 24, endTime: 28 },
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
      { id: '3-1', text: '这一幕太震撼了！', startTime: 35, endTime: 40 },
      { id: '3-2', text: '你看这个镜头切换', startTime: 40, endTime: 45 },
      { id: '3-3', text: '简直是教科书级别的拍摄', startTime: 45, endTime: 52 },
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
      { id: '4-1', text: '好了，今天的内容就到这里', startTime: 52, endTime: 58 },
      { id: '4-2', text: '记得点赞关注不迷路', startTime: 58, endTime: 63 },
      { id: '4-3', text: '我们下期再见！', startTime: 63, endTime: 68 },
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
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)

  // 字幕样式
  const [style, setStyle] = useState<SubtitleStyle>({
    fontSize: 24,
    color: '#FFFFFF',
    backgroundColor: 'rgba(0,0,0,0.6)',
    position: 'bottom',
    alignment: 'center',
    hasOutline: true,
  })

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

  // 打开预览
  const openPreview = (segment: VideoSegment) => {
    setPreviewSegment(segment)
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

  // 格式化时间
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${String(secs).padStart(2, '0')}`
  }

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

  // 添加新字幕
  const addSubtitle = (segmentId: string) => {
    setSegments((prev) =>
      prev.map((seg) => {
        if (seg.id === segmentId) {
          const lastSubtitle = seg.subtitles[seg.subtitles.length - 1]
          const newStartTime = lastSubtitle ? lastSubtitle.endTime : seg.startTime
          const newEndTime = Math.min(newStartTime + 4, seg.endTime)
          const newSubtitle: SubtitleLine = {
            id: `${segmentId}-${Date.now()}`,
            text: '新字幕内容',
            startTime: newStartTime,
            endTime: newEndTime,
          }
          return { ...seg, subtitles: [...seg.subtitles, newSubtitle] }
        }
        return seg
      })
    )
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
            AI 为每个视频片段自动生成字幕，你可以编辑或添加新字幕
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
                          {/* 时长 */}
                          <div className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded bg-black/70 backdrop-blur-sm text-xs font-mono text-white">
                            {formatTime(segment.endTime - segment.startTime)}
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
                          <p className="text-surface-100 font-medium text-sm line-clamp-2">
                            {segment.description}
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
                              <Type className="w-4 h-4 text-amber-400" />
                              <span className="text-sm font-medium text-surface-200">
                                字幕列表
                              </span>
                            </div>

                            {/* 字幕列表 */}
                            <div className="space-y-2">
                              {segment.subtitles.map((subtitle) => (
                                <div
                                  key={subtitle.id}
                                  className="flex items-start gap-3 p-2.5 rounded-lg bg-surface-900/50 border border-surface-700 group"
                                >
                                  {/* 时间码 */}
                                  <span className="text-xs font-mono text-surface-500 pt-1.5 w-24 flex-shrink-0">
                                    {formatTime(subtitle.startTime)} - {formatTime(subtitle.endTime)}
                                  </span>

                                  {/* 字幕内容 */}
                                  <div className="flex-1 min-w-0">
                                    {editingSubtitleId === subtitle.id ? (
                                      <div className="flex gap-2">
                                        <input
                                          type="text"
                                          value={editingText}
                                          onChange={(e) => setEditingText(e.target.value)}
                                          className="flex-1 bg-surface-700 border border-amber-400/50 rounded px-2 py-1 text-surface-100 text-sm focus:outline-none focus:border-amber-400"
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
                                      <p className="text-surface-200 text-sm leading-relaxed">
                                        {subtitle.text}
                                      </p>
                                    )}
                                  </div>

                                  {/* 操作按钮 */}
                                  {editingSubtitleId !== subtitle.id && (
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
                                  )}
                                </div>
                              ))}
                            </div>

                            {/* 添加字幕按钮 */}
                            <Button
                              variant="ghost"
                              size="sm"
                              leftIcon={<Plus className="w-4 h-4" />}
                              className="mt-3 w-full border border-dashed border-surface-600 hover:border-amber-400/50"
                              onClick={() => addSubtitle(segment.id)}
                            >
                              添加字幕
                            </Button>
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

      {/* 右侧样式配置 */}
      <div className="w-80 p-6 bg-surface-900/50 overflow-y-auto">
        <h2 className="text-lg font-semibold text-surface-100 mb-4 flex items-center gap-2">
          <Palette className="w-5 h-5 text-amber-400" />
          字幕样式
        </h2>

        {/* 预览区域 */}
        <Card className="mb-6 overflow-hidden">
          <div className="relative h-36 bg-surface-800 flex items-end justify-center p-4">
            {/* 模拟视频背景 */}
            <div className="absolute inset-0 bg-gradient-to-br from-surface-700 to-surface-900" />
            {/* 字幕预览 */}
            <div
              className={`
                relative px-4 py-2 rounded-lg text-center max-w-[90%]
                ${style.position === 'top' ? 'self-start' : ''}
                ${style.position === 'center' ? 'self-center' : ''}
                ${style.position === 'bottom' ? 'self-end' : ''}
              `}
              style={{
                backgroundColor: style.backgroundColor,
                fontSize: `${style.fontSize * 0.6}px`,
                textAlign: style.alignment,
              }}
            >
              <span
                className={`${style.hasOutline ? 'drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]' : ''}`}
                style={{ color: style.color }}
              >
                这是字幕预览效果
              </span>
            </div>
          </div>
        </Card>

        {/* 样式选项 */}
        <div className="space-y-6">
          {/* 字体大小 */}
          <div>
            <label className="text-sm text-surface-300 mb-2 block">
              字体大小: {style.fontSize}px
            </label>
            <Slider
              value={[style.fontSize]}
              min={16}
              max={48}
              step={2}
              onValueChange={(v) => setStyle({ ...style, fontSize: v[0] })}
            />
          </div>

          {/* 位置 */}
          <div>
            <label className="text-sm text-surface-300 mb-2 block">位置</label>
            <div className="flex gap-2">
              {(['top', 'center', 'bottom'] as const).map((pos) => (
                <Button
                  key={pos}
                  variant={style.position === pos ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => setStyle({ ...style, position: pos })}
                >
                  {pos === 'top' && '顶部'}
                  {pos === 'center' && '居中'}
                  {pos === 'bottom' && '底部'}
                </Button>
              ))}
            </div>
          </div>

          {/* 对齐 */}
          <div>
            <label className="text-sm text-surface-300 mb-2 block">对齐</label>
            <div className="flex gap-2">
              <Button
                variant={style.alignment === 'left' ? 'primary' : 'secondary'}
                size="sm"
                isIconOnly
                onClick={() => setStyle({ ...style, alignment: 'left' })}
              >
                <AlignLeft className="w-4 h-4" />
              </Button>
              <Button
                variant={style.alignment === 'center' ? 'primary' : 'secondary'}
                size="sm"
                isIconOnly
                onClick={() => setStyle({ ...style, alignment: 'center' })}
              >
                <AlignCenter className="w-4 h-4" />
              </Button>
              <Button
                variant={style.alignment === 'right' ? 'primary' : 'secondary'}
                size="sm"
                isIconOnly
                onClick={() => setStyle({ ...style, alignment: 'right' })}
              >
                <AlignRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* 描边 */}
          <div className="flex items-center justify-between">
            <label className="text-sm text-surface-300">文字描边</label>
            <Switch
              checked={style.hasOutline}
              onCheckedChange={(checked) =>
                setStyle({ ...style, hasOutline: checked })
              }
            />
          </div>

          {/* 统计信息 */}
          <div className="pt-4 border-t border-surface-700">
            <h3 className="text-sm font-medium text-surface-200 mb-3">统计</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-surface-400">
                <span>视频片段</span>
                <span className="text-surface-200">{segments.length} 个</span>
              </div>
              <div className="flex justify-between text-surface-400">
                <span>字幕总数</span>
                <span className="text-surface-200">{totalSubtitles} 条</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 媒体预览模态框 */}
      <MediaPreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        type="video"
        src={previewSegment?.videoUrl || ''}
        title={`片段 ${previewSegment?.id} - ${previewSegment?.description || ''}`}
        startTime={0}
        endTime={previewSegment ? previewSegment.endTime - previewSegment.startTime : undefined}
      />
    </div>
  )
}
