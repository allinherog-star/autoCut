'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Type,
  Mic,
  Sparkles,
  Check,
  ChevronRight,
  Edit3,
  TrendingUp,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Palette,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { Button, Card, Badge, Progress, Switch, Slider } from '@/components/ui'
import { useEditor } from '../layout'

// ============================================
// 类型定义
// ============================================

interface SubtitleItem {
  id: string
  text: string
  startTime: number
  endTime: number
  isEditing: boolean
  hasVoice: boolean
  hotKeywords: string[]
}

interface SubtitleStyle {
  fontFamily: string
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

const mockSubtitles: SubtitleItem[] = [
  {
    id: '1',
    text: '大家好，欢迎来到今天的视频',
    startTime: 0,
    endTime: 3,
    isEditing: false,
    hasVoice: true,
    hotKeywords: [],
  },
  {
    id: '2',
    text: '今天我们要聊一个非常火爆的话题',
    startTime: 3,
    endTime: 6,
    isEditing: false,
    hasVoice: true,
    hotKeywords: ['火爆'],
  },
  {
    id: '3',
    text: '关于如何快速提升视频创作效率',
    startTime: 6,
    endTime: 9,
    isEditing: false,
    hasVoice: true,
    hotKeywords: ['视频创作', '效率'],
  },
  {
    id: '4',
    text: '这个方法真的太绝了！',
    startTime: 9,
    endTime: 11,
    isEditing: false,
    hasVoice: true,
    hotKeywords: ['绝了'],
  },
  {
    id: '5',
    text: '记得点赞关注不迷路',
    startTime: 50,
    endTime: 53,
    isEditing: false,
    hasVoice: true,
    hotKeywords: ['点赞', '关注'],
  },
]

const hotKeywords = [
  '太绝了', '神器', '必看', '干货', '秒懂', '震惊',
  '涨知识', '学会了', '收藏', '转发', '关注', 'YYDS',
]

// ============================================
// 字幕推荐页面
// ============================================

export default function SubtitlePage() {
  const { goToNextStep, markStepCompleted, currentStep, setBottomBar, hideBottomBar } = useEditor()
  const [isGenerating, setIsGenerating] = useState(true)
  const [progress, setProgress] = useState(0)
  const [subtitles, setSubtitles] = useState<SubtitleItem[]>([])
  const [style, setStyle] = useState<SubtitleStyle>({
    fontFamily: 'default',
    fontSize: 24,
    color: '#FFFFFF',
    backgroundColor: 'rgba(0,0,0,0.6)',
    position: 'bottom',
    alignment: 'center',
    hasOutline: true,
  })
  const [autoKeywords, setAutoKeywords] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  // 使用 ref 存储最新的回调函数，避免 useEffect 依赖循环
  const handleConfirmRef = useRef(() => {
    markStepCompleted(currentStep)
    goToNextStep()
  })
  
  // 更新 ref 中的函数
  useEffect(() => {
    handleConfirmRef.current = () => {
      markStepCompleted(currentStep)
      goToNextStep()
    }
  }, [markStepCompleted, currentStep, goToNextStep])

  // 稳定的回调函数，始终调用 ref 中的最新函数
  const handleConfirmSubtitle = useCallback(() => {
    handleConfirmRef.current()
  }, [])

  // 更新底部操作栏
  useEffect(() => {
    if (!isGenerating) {
      setBottomBar({
        show: true,
        icon: <Sparkles className="w-5 h-5 text-amber-400" />,
        title: `已生成 ${subtitles.length} 条字幕`,
        description: '确认字幕样式后，继续下一步设置标题',
        primaryButton: {
          text: '确认字幕，继续下一步',
          onClick: handleConfirmSubtitle,
        },
      })
    } else {
      hideBottomBar()
    }
  }, [isGenerating, subtitles.length, setBottomBar, hideBottomBar, handleConfirmSubtitle])

  // 模拟生成过程
  useEffect(() => {
    if (isGenerating) {
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval)
            setIsGenerating(false)
            setSubtitles(mockSubtitles)
            return 100
          }
          return prev + Math.random() * 12
        })
      }, 200)
      return () => clearInterval(interval)
    }
  }, [isGenerating])

  // 编辑字幕
  const updateSubtitle = (id: string, text: string) => {
    setSubtitles((prev) =>
      prev.map((s) => (s.id === id ? { ...s, text } : s))
    )
  }

  // 格式化时间
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${String(secs).padStart(2, '0')}`
  }

  return (
    <div className="h-full flex overflow-hidden">
      {/* 左侧字幕列表 */}
      <div className="flex-1 flex flex-col overflow-hidden border-r border-surface-800">
        {/* 页面标题 */}
        <div className="flex-shrink-0 px-6 pt-6 pb-4">
          <h1 className="text-2xl font-display font-bold text-surface-100 mb-2">
            字幕推荐
          </h1>
          <p className="text-surface-400">
            AI 自动识别语音生成字幕，并推荐热门关键词优化
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
                  <span className="text-surface-200">正在识别语音...</span>
                  <span className="ml-auto font-mono text-amber-400">
                    {Math.round(progress)}%
                  </span>
                </div>
                <Progress value={progress} variant="primary" size="sm" />
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 字幕列表 */}
        {!isGenerating && (
          <div className="flex-1 overflow-y-auto space-y-2 px-6 min-h-0">
              {subtitles.map((subtitle, index) => (
                <motion.div
                  key={subtitle.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card
                    className={`
                      p-3 cursor-pointer transition-all duration-200
                      ${expandedId === subtitle.id ? 'border-amber-400/30' : ''}
                    `}
                    onClick={() =>
                      setExpandedId(expandedId === subtitle.id ? null : subtitle.id)
                    }
                  >
                    <div className="flex items-start gap-3">
                      {/* 时间码 */}
                      <span className="text-xs font-mono text-surface-500 pt-1 w-20 flex-shrink-0">
                        {formatTime(subtitle.startTime)} - {formatTime(subtitle.endTime)}
                      </span>

                      {/* 字幕内容 */}
                      <div className="flex-1 min-w-0">
                        {expandedId === subtitle.id ? (
                          <input
                            type="text"
                            value={subtitle.text}
                            onChange={(e) => updateSubtitle(subtitle.id, e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full bg-surface-700 border border-surface-600 rounded px-2 py-1 text-surface-100 text-sm focus:border-amber-400 focus:outline-none"
                          />
                        ) : (
                          <p className="text-surface-200 text-sm">
                            {subtitle.text}
                          </p>
                        )}

                        {/* 热词标签 */}
                        {subtitle.hotKeywords.length > 0 && (
                          <div className="flex gap-1.5 mt-2">
                            {subtitle.hotKeywords.map((keyword) => (
                              <Badge
                                key={keyword}
                                variant="primary"
                                size="sm"
                                className="text-xs"
                              >
                                <TrendingUp className="w-3 h-3" />
                                {keyword}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* 状态指示 */}
                      <div className="flex items-center gap-2">
                        {subtitle.hasVoice && (
                          <Mic className="w-4 h-4 text-success" />
                        )}
                        {expandedId === subtitle.id ? (
                          <ChevronUp className="w-4 h-4 text-surface-500" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-surface-500" />
                        )}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
          </div>
        )}
      </div>

      {/* 右侧样式配置 */}
      <div className="w-80 p-6 bg-surface-900/50 overflow-y-auto">
        <h2 className="text-lg font-semibold text-surface-100 mb-4">
          字幕样式
        </h2>

        {/* 预览区域 */}
        <Card className="mb-6 overflow-hidden">
          <div className="relative h-40 bg-surface-800 flex items-end justify-center p-4">
            <div
              className={`
                px-4 py-2 rounded-lg text-center max-w-[90%]
              `}
              style={{
                backgroundColor: style.backgroundColor,
                fontSize: `${style.fontSize * 0.6}px`,
              }}
            >
              <span
                className={`${style.hasOutline ? 'drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]' : ''}`}
                style={{ color: style.color }}
              >
                今天我们要聊一个非常<span className="text-amber-400">火爆</span>的话题
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

          {/* 热词高亮 */}
          <div className="pt-4 border-t border-surface-700">
            <div className="flex items-center justify-between mb-4">
              <div>
                <label className="text-sm text-surface-200 block">
                  热词自动高亮
                </label>
                <span className="text-xs text-surface-500">
                  自动识别并高亮流量关键词
                </span>
              </div>
              <Switch
                checked={autoKeywords}
                onCheckedChange={setAutoKeywords}
              />
            </div>

            {autoKeywords && (
              <div className="flex flex-wrap gap-1.5">
                {hotKeywords.slice(0, 8).map((keyword) => (
                  <Badge key={keyword} variant="outline" size="sm">
                    {keyword}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

