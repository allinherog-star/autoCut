'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  TrendingUp,
  Sparkles,
  RefreshCw,
  Check,
  Copy,
  ChevronRight,
  Flame,
  Eye,
  ThumbsUp,
  MessageSquare,
  Share2,
  Star,
  Zap,
} from 'lucide-react'
import { Button, Card, Badge, Progress, Input } from '@/components/ui'
import { useEditor } from '../layout'

// ============================================
// 类型定义
// ============================================

interface TitleSuggestion {
  id: string
  text: string
  score: number
  tags: string[]
  metrics: {
    clickRate: number
    shareRate: number
    engagement: number
  }
  isSelected: boolean
}

// ============================================
// 模拟数据
// ============================================

const mockTitles: TitleSuggestion[] = [
  {
    id: '1',
    text: '99%的人都不知道的视频剪辑神器，效率提升10倍！',
    score: 95,
    tags: ['数字化', '悬念', '利益点'],
    metrics: { clickRate: 8.5, shareRate: 3.2, engagement: 92 },
    isSelected: false,
  },
  {
    id: '2',
    text: '震惊！这个AI工具让我一天剪10个视频还不累',
    score: 92,
    tags: ['震惊体', '数字化', '共鸣'],
    metrics: { clickRate: 7.8, shareRate: 2.9, engagement: 88 },
    isSelected: false,
  },
  {
    id: '3',
    text: '学会这招，你也能成为视频剪辑大神',
    score: 88,
    tags: ['教程', '利益点', '共鸣'],
    metrics: { clickRate: 6.5, shareRate: 2.4, engagement: 85 },
    isSelected: false,
  },
  {
    id: '4',
    text: '太绝了！这才是2024年视频创作的正确打开方式',
    score: 90,
    tags: ['时效性', '感叹', '趋势'],
    metrics: { clickRate: 7.2, shareRate: 3.0, engagement: 86 },
    isSelected: false,
  },
  {
    id: '5',
    text: '新手必看！3分钟学会专业级视频剪辑',
    score: 85,
    tags: ['新手友好', '数字化', '教程'],
    metrics: { clickRate: 5.8, shareRate: 2.1, engagement: 82 },
    isSelected: false,
  },
]

const hotTrends = [
  { keyword: 'AI神器', heat: 98 },
  { keyword: '效率提升', heat: 95 },
  { keyword: '干货分享', heat: 92 },
  { keyword: '新手必看', heat: 88 },
  { keyword: '免费工具', heat: 85 },
  { keyword: '一键成片', heat: 82 },
]

// ============================================
// 标题推荐页面
// ============================================

export default function TitlePage() {
  const { goToNextStep, markStepCompleted, currentStep, setBottomBar, hideBottomBar } = useEditor()
  const [isGenerating, setIsGenerating] = useState(true)
  const [progress, setProgress] = useState(0)
  const [titles, setTitles] = useState<TitleSuggestion[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [customTitle, setCustomTitle] = useState('')
  const [useCustom, setUseCustom] = useState(false)

  const selectedTitle = titles.find((t) => t.id === selectedId)
  const finalTitle = useCustom ? customTitle : selectedTitle?.text || ''

  // 确认标题并进入下一步
  const handleConfirmTitle = useCallback(() => {
    markStepCompleted(currentStep)
    goToNextStep()
  }, [markStepCompleted, currentStep, goToNextStep])

  // 更新底部操作栏
  useEffect(() => {
    if (!isGenerating) {
      setBottomBar({
        show: true,
        icon: <Sparkles className="w-5 h-5 text-amber-400" />,
        title: finalTitle ? '已选择标题' : '请选择一个标题',
        description: finalTitle 
          ? `"${finalTitle.length > 30 ? finalTitle.slice(0, 30) + '...' : finalTitle}"` 
          : '选择或输入标题后继续',
        primaryButton: {
          text: '确认标题，继续下一步',
          onClick: handleConfirmTitle,
          disabled: !finalTitle,
        },
      })
    } else {
      hideBottomBar()
    }
  }, [isGenerating, finalTitle, setBottomBar, hideBottomBar, handleConfirmTitle])

  // 模拟生成过程
  useEffect(() => {
    if (isGenerating) {
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval)
            setIsGenerating(false)
            setTitles(mockTitles)
            return 100
          }
          return prev + Math.random() * 15
        })
      }, 150)
      return () => clearInterval(interval)
    }
  }, [isGenerating])

  // 选择标题
  const selectTitle = (id: string) => {
    setSelectedId(id)
    setUseCustom(false)
    setTitles((prev) =>
      prev.map((t) => ({ ...t, isSelected: t.id === id }))
    )
  }

  // 重新生成
  const regenerate = () => {
    setIsGenerating(true)
    setProgress(0)
    setTitles([])
    setSelectedId(null)
  }

  // 复制标题
  const copyTitle = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="h-full flex overflow-hidden">
      {/* 左侧标题列表 */}
      <div className="flex-1 flex flex-col overflow-hidden border-r border-surface-800">
        {/* 页面标题 */}
        <div className="flex-shrink-0 px-6 pt-6 pb-4">
          <h1 className="text-2xl font-display font-bold text-surface-100 mb-2">
            标题推荐
          </h1>
          <p className="text-surface-400">
            AI 结合视频内容和平台热点，生成高点击率标题
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
                  <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
                  <span className="text-surface-200">正在生成爆款标题...</span>
                  <span className="ml-auto font-mono text-amber-400">
                    {Math.round(progress)}%
                  </span>
                </div>
                <Progress value={progress} variant="primary" size="sm" />
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 标题列表 */}
        {!isGenerating && (
          <div className="flex-1 overflow-y-auto space-y-3 px-6 min-h-0">
              {titles.map((title, index) => (
                <motion.div
                  key={title.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08 }}
                >
                  <Card
                    isInteractive
                    isSelected={selectedId === title.id}
                    className="p-4"
                    onClick={() => selectTitle(title.id)}
                  >
                    <div className="flex items-start gap-4">
                      {/* 评分 */}
                      <div
                        className={`
                          w-12 h-12 rounded-xl flex flex-col items-center justify-center flex-shrink-0
                          ${title.score >= 90 ? 'bg-success/20 text-success' : ''}
                          ${title.score >= 80 && title.score < 90 ? 'bg-amber-400/20 text-amber-400' : ''}
                          ${title.score < 80 ? 'bg-surface-700 text-surface-400' : ''}
                        `}
                      >
                        <span className="text-lg font-bold">{title.score}</span>
                        <span className="text-[10px]">分</span>
                      </div>

                      {/* 内容 */}
                      <div className="flex-1 min-w-0">
                        <p className="text-surface-100 font-medium mb-2 leading-relaxed">
                          {title.text}
                        </p>

                        {/* 标签 */}
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {title.tags.map((tag) => (
                            <Badge key={tag} variant="outline" size="sm">
                              {tag}
                            </Badge>
                          ))}
                        </div>

                        {/* 预估数据 */}
                        <div className="flex items-center gap-4 text-xs text-surface-500">
                          <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            点击率 {title.metrics.clickRate}%
                          </span>
                          <span className="flex items-center gap-1">
                            <Share2 className="w-3 h-3" />
                            分享率 {title.metrics.shareRate}%
                          </span>
                          <span className="flex items-center gap-1">
                            <ThumbsUp className="w-3 h-3" />
                            互动 {title.metrics.engagement}
                          </span>
                        </div>
                      </div>

                      {/* 选中状态 / 复制 */}
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="xs"
                          isIconOnly
                          onClick={(e) => {
                            e.stopPropagation()
                            copyTitle(title.text)
                          }}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                        {selectedId === title.id && (
                          <div className="w-6 h-6 rounded-full bg-amber-400 flex items-center justify-center">
                            <Check className="w-4 h-4 text-surface-950" />
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}

              {/* 自定义标题 */}
              <Card
                className={`p-4 ${useCustom ? 'border-amber-400/30' : ''}`}
              >
                <p className="text-sm text-surface-400 mb-2">或者自定义标题：</p>
                <div className="flex gap-2">
                  <Input
                    value={customTitle}
                    onChange={(e) => {
                      setCustomTitle(e.target.value)
                      setUseCustom(true)
                      setSelectedId(null)
                    }}
                    placeholder="输入你的创意标题..."
                    className="flex-1"
                  />
                  {useCustom && customTitle && (
                    <div className="w-6 h-6 rounded-full bg-amber-400 flex items-center justify-center flex-shrink-0 self-center">
                      <Check className="w-4 h-4 text-surface-950" />
                    </div>
                  )}
                </div>
              </Card>

              {/* 重新生成 */}
              <Button
                variant="ghost"
                fullWidth
                leftIcon={<RefreshCw className="w-4 h-4" />}
                onClick={regenerate}
                className="mt-2"
              >
                换一批标题
              </Button>
          </div>
        )}
      </div>

      {/* 右侧热点趋势 */}
      <div className="w-80 p-6 bg-surface-900/50 overflow-y-auto">
        <div className="flex items-center gap-2 mb-4">
          <Flame className="w-5 h-5 text-amber-400" />
          <h2 className="text-lg font-semibold text-surface-100">
            实时热点
          </h2>
        </div>

        {/* 热点列表 */}
        <div className="space-y-3 mb-8">
          {hotTrends.map((trend, index) => (
            <motion.div
              key={trend.keyword}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="p-3">
                <div className="flex items-center gap-3">
                  <span
                    className={`
                      w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                      ${index < 3 ? 'bg-amber-400 text-surface-950' : 'bg-surface-700 text-surface-400'}
                    `}
                  >
                    {index + 1}
                  </span>
                  <span className="flex-1 text-surface-200">{trend.keyword}</span>
                  <div className="flex items-center gap-1 text-xs text-surface-500">
                    <TrendingUp className="w-3 h-3 text-success" />
                    {trend.heat}°
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* 标题技巧 */}
        <div className="pt-6 border-t border-surface-700">
          <h3 className="text-sm font-semibold text-surface-200 mb-3 flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            爆款标题技巧
          </h3>
          <div className="space-y-2 text-sm text-surface-400">
            <p>• 使用数字增加可信度 (如: 3招、5分钟)</p>
            <p>• 制造悬念引发好奇 (如: 竟然、居然)</p>
            <p>• 明确利益点 (如: 效率提升10倍)</p>
            <p>• 引发共鸣 (如: 新手必看)</p>
            <p>• 紧跟热点趋势 (如: 2024年)</p>
          </div>
        </div>

        {/* 已选标题预览 */}
        {finalTitle && (
          <div className="mt-6 pt-6 border-t border-surface-700">
            <h3 className="text-sm font-semibold text-surface-200 mb-3">
              当前选择
            </h3>
            <Card variant="glass" className="p-3">
              <p className="text-amber-400 font-medium">{finalTitle}</p>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}

