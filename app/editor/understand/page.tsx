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
} from 'lucide-react'
import { Button, Card, Badge, Progress, Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui'
import { useEditor } from '../layout'

// ============================================
// 类型定义
// ============================================

interface VideoSegment {
  id: string
  startTime: number
  endTime: number
  thumbnailUrl: string
  labels: string[]
  score: number // AI 评分 0-100
  isSelected: boolean
  isDiscarded: boolean
  description: string
}

// ============================================
// 模拟数据
// ============================================

const mockSegments: VideoSegment[] = [
  {
    id: '1',
    startTime: 0,
    endTime: 12,
    thumbnailUrl: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=300&h=200&fit=crop',
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
  const { goToNextStep } = useEditor()
  const [isAnalyzing, setIsAnalyzing] = useState(true)
  const [analysisProgress, setAnalysisProgress] = useState(0)
  const [segments, setSegments] = useState<VideoSegment[]>([])
  const [activeTab, setActiveTab] = useState('all')
  const [playingId, setPlayingId] = useState<string | null>(null)

  // 模拟分析过程
  useEffect(() => {
    if (isAnalyzing) {
      const interval = setInterval(() => {
        setAnalysisProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval)
            setIsAnalyzing(false)
            setSegments(mockSegments)
            return 100
          }
          return prev + Math.random() * 8
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
            {/* 统计信息 */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <Badge variant="success" size="lg">
                  <Check className="w-3.5 h-3.5" />
                  分析完成
                </Badge>
                <span className="text-surface-400">
                  共识别 {segments.length} 个片段
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="primary">
                  <Star className="w-3 h-3" />
                  已选 {selectedCount} 个
                </Badge>
                <Badge variant="outline">
                  <EyeOff className="w-3 h-3" />
                  已剔除 {discardedCount} 个
                </Badge>
              </div>
            </div>

            {/* 标签切换 */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
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

            {/* 片段列表 */}
            <div className="flex-1 overflow-y-auto pr-2 space-y-3">
              {filteredSegments.map((segment, index) => (
                <motion.div
                  key={segment.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card
                    className={`
                      p-4 transition-all duration-200
                      ${segment.isSelected ? 'border-amber-400/30' : ''}
                      ${segment.isDiscarded ? 'opacity-60' : ''}
                    `}
                  >
                    <div className="flex gap-4">
                      {/* 缩略图 */}
                      <div className="relative w-40 h-24 rounded-lg overflow-hidden bg-surface-800 flex-shrink-0 group">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={segment.thumbnailUrl}
                          alt={`片段 ${segment.id}`}
                          className="w-full h-full object-cover"
                        />
                        {/* 播放按钮 */}
                        <button
                          className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() =>
                            setPlayingId(playingId === segment.id ? null : segment.id)
                          }
                        >
                          {playingId === segment.id ? (
                            <Pause className="w-8 h-8 text-white" />
                          ) : (
                            <Play className="w-8 h-8 text-white" />
                          )}
                        </button>
                        {/* 时间标签 */}
                        <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/70 text-xs font-mono text-white">
                          {formatTime(segment.endTime - segment.startTime)}
                        </div>
                        {/* AI 评分 */}
                        <div
                          className={`
                            absolute top-1 left-1 px-1.5 py-0.5 rounded text-xs font-bold
                            ${segment.score >= 80 ? 'bg-success text-white' : ''}
                            ${segment.score >= 50 && segment.score < 80 ? 'bg-warning text-surface-950' : ''}
                            ${segment.score < 50 ? 'bg-error text-white' : ''}
                          `}
                        >
                          {segment.score}分
                        </div>
                      </div>

                      {/* 信息区 */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-mono text-surface-500">
                                {formatTime(segment.startTime)} - {formatTime(segment.endTime)}
                              </span>
                              {segment.isDiscarded && (
                                <Badge variant="error" size="sm">
                                  <AlertCircle className="w-3 h-3" />
                                  AI 建议剔除
                                </Badge>
                              )}
                            </div>
                            <p className="text-surface-200 text-sm line-clamp-1">
                              {segment.description}
                            </p>
                          </div>
                        </div>

                        {/* 标签 */}
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {segment.labels.map((label) => (
                            <Badge key={label} variant="secondary" size="sm">
                              <Tag className="w-3 h-3" />
                              {label}
                            </Badge>
                          ))}
                        </div>

                        {/* 操作按钮 */}
                        <div className="flex items-center gap-2">
                          {segment.isDiscarded ? (
                            <Button
                              variant="outline"
                              size="xs"
                              leftIcon={<Undo2 className="w-3.5 h-3.5" />}
                              onClick={() => restoreSegment(segment.id)}
                            >
                              恢复片段
                            </Button>
                          ) : (
                            <>
                              <Button
                                variant={segment.isSelected ? 'primary' : 'secondary'}
                                size="xs"
                                leftIcon={
                                  segment.isSelected ? (
                                    <Check className="w-3.5 h-3.5" />
                                  ) : (
                                    <Eye className="w-3.5 h-3.5" />
                                  )
                                }
                                onClick={() => toggleSegment(segment.id)}
                              >
                                {segment.isSelected ? '已选中' : '选择'}
                              </Button>
                              {segment.isSelected && (
                                <Button
                                  variant="ghost"
                                  size="xs"
                                  leftIcon={<X className="w-3.5 h-3.5" />}
                                  onClick={() => toggleSegment(segment.id)}
                                  className="text-surface-400 hover:text-error"
                                >
                                  剔除
                                </Button>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* 底部操作区 */}
            <div className="mt-6 pt-6 border-t border-surface-800">
              <Card variant="glass" className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-amber-400/10 flex items-center justify-center">
                      <Sparkles className="w-6 h-6 text-amber-400" />
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
                      onClick={goToNextStep}
                      disabled={selectedCount === 0}
                    >
                      继续下一步
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

