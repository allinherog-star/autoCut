'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Wand2,
  Play,
  Pause,
  Check,
  X,
  RefreshCw,
  Tag,
  Clock,
  Sparkles,
  ChevronRight,
  Eye,
  EyeOff,
  Undo2,
  Filter,
  Star,
  AlertCircle,
  Video,
} from 'lucide-react'
import { Button, Card, Badge, Progress, Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui'
import { MediaPreviewModal } from '@/components/media-preview-modal'
import { useEditor } from '../layout'

// ============================================
// 类型定义
// ============================================

interface VideoSegment {
  id: string
  startTime: number
  endTime: number
  thumbnailUrl: string
  videoUrl: string // 视频源URL
  labels: string[]
  score: number // AI 评分 0-100
  isSelected: boolean
  isDiscarded: boolean
  description: string
}

// ============================================
// 模拟数据
// ============================================

// 示例视频URL (使用公开的测试视频)
const SAMPLE_VIDEO_URL = 'https://www.w3schools.com/html/mov_bbb.mp4'

const mockSegments: VideoSegment[] = [
  {
    id: '1',
    startTime: 0,
    endTime: 12,
    thumbnailUrl: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=300&h=200&fit=crop',
    videoUrl: SAMPLE_VIDEO_URL,
    labels: ['开场', '人物', '特写'],
    score: 92,
    isSelected: true,
    isDiscarded: false,
    description: '主角出场，微笑面对镜头，情绪积极',
  },
  {
    id: '2',
    startTime: 12,
    endTime: 28,
    thumbnailUrl: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=300&h=200&fit=crop',
    videoUrl: SAMPLE_VIDEO_URL,
    labels: ['对话', '双人', '情感'],
    score: 88,
    isSelected: true,
    isDiscarded: false,
    description: '两人对话场景，表情丰富，有互动',
  },
  {
    id: '3',
    startTime: 28,
    endTime: 35,
    thumbnailUrl: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=300&h=200&fit=crop',
    videoUrl: SAMPLE_VIDEO_URL,
    labels: ['过渡', '空镜'],
    score: 45,
    isSelected: false,
    isDiscarded: true,
    description: '空镜过渡，画面单调，建议剔除',
  },
  {
    id: '4',
    startTime: 35,
    endTime: 52,
    thumbnailUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=300&h=200&fit=crop',
    videoUrl: SAMPLE_VIDEO_URL,
    labels: ['高潮', '动作', '精彩'],
    score: 95,
    isSelected: true,
    isDiscarded: false,
    description: '精彩动作场面，视觉冲击力强',
  },
  {
    id: '5',
    startTime: 52,
    endTime: 68,
    thumbnailUrl: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=300&h=200&fit=crop',
    videoUrl: SAMPLE_VIDEO_URL,
    labels: ['结尾', '总结', '回顾'],
    score: 78,
    isSelected: true,
    isDiscarded: false,
    description: '内容总结回顾，情绪收束',
  },
  {
    id: '6',
    startTime: 68,
    endTime: 75,
    thumbnailUrl: 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=300&h=200&fit=crop',
    videoUrl: SAMPLE_VIDEO_URL,
    labels: ['模糊', '抖动'],
    score: 25,
    isSelected: false,
    isDiscarded: true,
    description: '画面抖动模糊，质量较差',
  },
]

// ============================================
// 视频理解页面
// ============================================

export default function UnderstandPage() {
  const { goToNextStep, markStepCompleted, currentStep } = useEditor()
  const [isAnalyzing, setIsAnalyzing] = useState(true)
  const [analysisProgress, setAnalysisProgress] = useState(0)
  const [segments, setSegments] = useState<VideoSegment[]>([])
  const [activeTab, setActiveTab] = useState('all')
  const [playingId, setPlayingId] = useState<string | null>(null)
  
  // 预览状态
  const [previewSegment, setPreviewSegment] = useState<VideoSegment | null>(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)

  // 打开预览
  const openPreview = (segment: VideoSegment) => {
    setPreviewSegment(segment)
    setIsPreviewOpen(true)
  }

  // 关闭预览
  const closePreview = () => {
    setIsPreviewOpen(false)
    setPreviewSegment(null)
  }

  // 完成当前步骤并进入下一步
  const handleGoToNextStep = () => {
    markStepCompleted(currentStep)
    goToNextStep()
  }

  // 模拟分析过程
  useEffect(() => {
    if (isAnalyzing) {
      const interval = setInterval(() => {
        setAnalysisProgress((prev) => {
          const newProgress = prev + Math.random() * 8
          if (newProgress >= 100) {
            clearInterval(interval)
            setIsAnalyzing(false)
            setSegments(mockSegments)
            return 100
          }
          return Math.min(newProgress, 100) // 确保不超过100
        })
      }, 200)
      return () => clearInterval(interval)
    }
  }, [isAnalyzing])

  // 切换片段选中状态
  const toggleSegment = (id: string) => {
    setSegments((prev) =>
      prev.map((seg) =>
        seg.id === id
          ? { ...seg, isSelected: !seg.isSelected, isDiscarded: seg.isSelected }
          : seg
      )
    )
  }

  // 恢复被剔除的片段
  const restoreSegment = (id: string) => {
    setSegments((prev) =>
      prev.map((seg) =>
        seg.id === id ? { ...seg, isSelected: true, isDiscarded: false } : seg
      )
    )
  }

  // 格式化时间
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${String(secs).padStart(2, '0')}`
  }

  // 标签颜色映射
  const labelColorMap: Record<string, string> = {
    // 场景类型
    '开场': 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
    '结尾': 'bg-purple-500/20 text-purple-400 border border-purple-500/30',
    '高潮': 'bg-rose-500/20 text-rose-400 border border-rose-500/30',
    '过渡': 'bg-slate-500/20 text-slate-400 border border-slate-500/30',
    // 内容类型
    '人物': 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
    '双人': 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30',
    '对话': 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30',
    '动作': 'bg-orange-500/20 text-orange-400 border border-orange-500/30',
    '特写': 'bg-pink-500/20 text-pink-400 border border-pink-500/30',
    '空镜': 'bg-gray-500/20 text-gray-400 border border-gray-500/30',
    // 情感类型
    '情感': 'bg-red-500/20 text-red-400 border border-red-500/30',
    '精彩': 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
    '总结': 'bg-teal-500/20 text-teal-400 border border-teal-500/30',
    '回顾': 'bg-violet-500/20 text-violet-400 border border-violet-500/30',
    // 质量类型
    '模糊': 'bg-red-600/20 text-red-500 border border-red-600/30',
    '抖动': 'bg-red-600/20 text-red-500 border border-red-600/30',
  }

  // 获取标签颜色
  const getLabelColor = (label: string, index: number) => {
    if (labelColorMap[label]) {
      return labelColorMap[label]
    }
    // 默认颜色循环
    const defaultColors = [
      'bg-sky-500/20 text-sky-400 border border-sky-500/30',
      'bg-lime-500/20 text-lime-400 border border-lime-500/30',
      'bg-fuchsia-500/20 text-fuchsia-400 border border-fuchsia-500/30',
      'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
    ]
    return defaultColors[index % defaultColors.length]
  }

  // 筛选片段
  const filteredSegments = segments.filter((seg) => {
    if (activeTab === 'selected') return seg.isSelected
    if (activeTab === 'discarded') return seg.isDiscarded
    return true
  })

  const selectedCount = segments.filter((s) => s.isSelected).length
  const discardedCount = segments.filter((s) => s.isDiscarded).length

  return (
    <div className="h-full flex flex-col p-6 overflow-hidden">
      {/* 页面标题 */}
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold text-surface-100 mb-2">
          理解视频
        </h1>
        <p className="text-surface-400">
          AI 正在分析视频内容，自动识别并标记有价值的片段
        </p>
      </div>

      {/* 分析进度 */}
      <AnimatePresence>
        {isAnalyzing && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-6"
          >
            <Card variant="glass" className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-amber-400/10 flex items-center justify-center">
                  <Wand2 className="w-6 h-6 text-amber-400 animate-pulse" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-surface-100">AI 正在分析视频...</p>
                  <p className="text-sm text-surface-400">
                    正在识别场景、人物、情感和关键内容
                  </p>
                </div>
                <span className="text-2xl font-mono font-bold text-amber-400">
                  {Math.round(analysisProgress)}%
                </span>
              </div>
              <Progress value={analysisProgress} variant="primary" size="md" />

              {/* 分析步骤 */}
              <div className="mt-4 grid grid-cols-4 gap-4">
                {[
                  { label: '场景分割', done: analysisProgress > 25 },
                  { label: '内容识别', done: analysisProgress > 50 },
                  { label: '质量评估', done: analysisProgress > 75 },
                  { label: '智能推荐', done: analysisProgress >= 100 },
                ].map((step, index) => (
                  <div key={step.label} className="flex items-center gap-2">
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center ${
                        step.done
                          ? 'bg-success text-white'
                          : 'bg-surface-700 text-surface-500'
                      }`}
                    >
                      {step.done ? (
                        <Check className="w-3 h-3" />
                      ) : (
                        <span className="text-xs">{index + 1}</span>
                      )}
                    </div>
                    <span
                      className={`text-sm ${
                        step.done ? 'text-surface-200' : 'text-surface-500'
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 分析结果 */}
      <AnimatePresence>
        {!isAnalyzing && segments.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1 flex flex-col overflow-hidden"
          >
            {/* 统计信息和标签切换 - 一行显示 */}
            <div className="flex items-center gap-4 mb-4">
              <Badge variant="success" size="lg">
                <Check className="w-3.5 h-3.5" />
                分析完成
              </Badge>
              <span className="text-surface-400">
                共识别 {segments.length} 个片段
              </span>
              
              {/* 标签切换 */}
              <Tabs value={activeTab} onValueChange={setActiveTab} className="ml-auto">
                <TabsList>
                  <TabsTrigger value="all">
                    全部片段 ({segments.length})
                  </TabsTrigger>
                  <TabsTrigger value="selected">
                    已选中 ({selectedCount})
                  </TabsTrigger>
                  <TabsTrigger value="discarded">
                    已剔除 ({discardedCount})
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* 片段列表 - 填充完整宽度，留出底部操作栏空间 */}
            <div className="flex-1 overflow-y-auto pr-2 pb-4">
              <div className="space-y-4">
                {filteredSegments.map((segment, index) => (
                  <motion.div
                    key={segment.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card
                      className={`
                        transition-all duration-200 overflow-hidden
                        ${segment.isSelected ? 'border-amber-400/50 shadow-glow-amber' : ''}
                        ${segment.isDiscarded ? 'opacity-60' : ''}
                      `}
                    >
                      <div className="relative p-4">
                        {/* 右上角标签 */}
                        <div className="absolute top-3 right-3 flex flex-wrap gap-1.5 justify-end max-w-[200px]">
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

                        <div className="flex gap-4">
                          {/* 左侧缩略图 */}
                          <div 
                            className="relative w-48 h-28 rounded-xl overflow-hidden bg-surface-800 flex-shrink-0 group cursor-pointer"
                            onClick={() => openPreview(segment)}
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={segment.thumbnailUrl}
                              alt={`片段 ${segment.id}`}
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                            {/* 渐变遮罩 */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                            {/* 播放按钮 */}
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <div className="w-10 h-10 rounded-full bg-amber-400/90 flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                                <Play className="w-5 h-5 text-surface-950 ml-0.5" />
                              </div>
                            </div>
                            {/* AI 评分 */}
                            <div
                              className={`
                                absolute top-2 left-2 px-2.5 py-1 rounded-md text-xs font-bold backdrop-blur-sm
                                ${segment.score >= 80 ? 'bg-emerald-500/90 text-white' : ''}
                                ${segment.score >= 50 && segment.score < 80 ? 'bg-amber-500/90 text-white' : ''}
                                ${segment.score < 50 ? 'bg-red-500/90 text-white' : ''}
                              `}
                            >
                              {segment.score}分
                            </div>
                            {/* 时长 */}
                            <div className="absolute bottom-2 right-2 px-2 py-1 rounded-md bg-black/70 backdrop-blur-sm text-xs font-mono text-white">
                              {formatTime(segment.endTime - segment.startTime)}
                            </div>
                          </div>

                          {/* 中间内容区 */}
                          <div className="flex-1 min-w-0 py-1">
                            <div className="flex items-center gap-3 mb-1">
                              <span className="text-sm font-mono text-surface-400">
                                {formatTime(segment.startTime)} - {formatTime(segment.endTime)}
                              </span>
                              {segment.isDiscarded && (
                                <Badge variant="error" size="sm">
                                  <AlertCircle className="w-3 h-3" />
                                  AI 建议剔除
                                </Badge>
                              )}
                            </div>
                            <p className="text-surface-100 font-medium text-sm line-clamp-2">
                              {segment.description}
                            </p>
                          </div>

                          {/* 右侧：操作按钮 */}
                          <div className="flex-shrink-0 flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                leftIcon={<Video className="w-4 h-4" />}
                                onClick={() => openPreview(segment)}
                              >
                                预览
                              </Button>
                              {segment.isDiscarded ? (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  leftIcon={<Undo2 className="w-4 h-4" />}
                                  onClick={() => restoreSegment(segment.id)}
                                >
                                  恢复
                                </Button>
                              ) : (
                                <Button
                                  variant={segment.isSelected ? 'primary' : 'secondary'}
                                  size="sm"
                                  leftIcon={
                                    segment.isSelected ? (
                                      <Check className="w-4 h-4" />
                                    ) : (
                                      <Eye className="w-4 h-4" />
                                    )
                                  }
                                  onClick={() => toggleSegment(segment.id)}
                                >
                                  {segment.isSelected ? '已选中' : '选择'}
                                </Button>
                              )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>

          </motion.div>
        )}
      </AnimatePresence>

      {/* 底部操作区 - 固定在底部 */}
      {!isAnalyzing && segments.length > 0 && (
        <div className="flex-shrink-0 pt-4 border-t border-surface-800 bg-surface-950">
          <Card variant="glass" className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-amber-400/10 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <p className="font-medium text-surface-100">
                    已选择 {selectedCount} 个精华片段
                  </p>
                  <p className="text-sm text-surface-400">
                    预计时长{' '}
                    {formatTime(
                      segments
                        .filter((s) => s.isSelected)
                        .reduce((acc, s) => acc + (s.endTime - s.startTime), 0)
                    )}
                    ，下一步将为你生成字幕
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  leftIcon={<RefreshCw className="w-4 h-4" />}
                  onClick={() => {
                    setIsAnalyzing(true)
                    setAnalysisProgress(0)
                    setSegments([])
                  }}
                >
                  重新分析
                </Button>
                <Button
                  size="lg"
                  rightIcon={<ChevronRight className="w-5 h-5" />}
                  onClick={handleGoToNextStep}
                  disabled={selectedCount === 0}
                >
                  继续下一步
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* 媒体预览模态框 */}
      <MediaPreviewModal
        isOpen={isPreviewOpen}
        onClose={closePreview}
        type="video"
        src={previewSegment?.videoUrl || ''}
        title={`片段 ${previewSegment?.id} - ${previewSegment?.description || ''}`}
        startTime={0}
        endTime={previewSegment ? previewSegment.endTime - previewSegment.startTime : undefined}
      />
    </div>
  )
}

