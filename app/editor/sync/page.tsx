'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Volume2,
  Video,
  Type,
  Sparkles,
  ChevronRight,
  Check,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Clock,
  Wand2,
} from 'lucide-react'
import { Button, Card, Badge, Progress } from '@/components/ui'
import { useEditor } from '../layout'

// ============================================
// 类型定义
// ============================================

interface SyncTask {
  id: string
  name: string
  description: string
  icon: React.ElementType
  status: 'pending' | 'processing' | 'completed' | 'error'
  progress: number
  details?: string
}

// ============================================
// 音画同步页面
// ============================================

export default function SyncPage() {
  const { goToNextStep, markStepCompleted, currentStep, setBottomBar, hideBottomBar } = useEditor()
  const [tasks, setTasks] = useState<SyncTask[]>([
    {
      id: 'audio-video',
      name: '音视频同步',
      description: '校准视频画面与音频轨道的时间对齐',
      icon: Video,
      status: 'pending',
      progress: 0,
    },
    {
      id: 'subtitle-sync',
      name: '字幕同步',
      description: '确保字幕与语音完全对应',
      icon: Type,
      status: 'pending',
      progress: 0,
    },
    {
      id: 'music-beat',
      name: '音乐卡点',
      description: '将画面切换与音乐节奏对齐',
      icon: Volume2,
      status: 'pending',
      progress: 0,
    },
    {
      id: 'lip-sync',
      name: '口型对齐',
      description: '检测人物说话并对齐口型与语音',
      icon: Wand2,
      status: 'pending',
      progress: 0,
    },
  ])
  const [isRunning, setIsRunning] = useState(false)
  const [currentTask, setCurrentTask] = useState(0)

  const allCompleted = tasks.every((t) => t.status === 'completed')
  const completedCount = tasks.filter((t) => t.status === 'completed').length

  // 确认同步并进入下一步
  const handleConfirmSync = useCallback(() => {
    markStepCompleted(currentStep)
    goToNextStep()
  }, [markStepCompleted, currentStep, goToNextStep])

  // 更新底部操作栏
  useEffect(() => {
    if (allCompleted) {
      setBottomBar({
        show: true,
        icon: <CheckCircle2 className="w-5 h-5 text-success" />,
        title: '音画同步完成！',
        description: '所有轨道已完成校准，可以进入下一步精细调整',
        primaryButton: {
          text: '继续下一步',
          onClick: handleConfirmSync,
        },
        secondaryButton: {
          text: '重新同步',
          onClick: runSync,
          icon: <RefreshCw className="w-4 h-4" />,
        },
      })
    } else if (isRunning) {
      setBottomBar({
        show: true,
        icon: <Loader2 className="w-5 h-5 text-amber-400 animate-spin" />,
        title: `正在处理 ${completedCount + 1}/${tasks.length}`,
        description: '音画同步进行中，请稍候...',
        primaryButton: {
          text: '继续下一步',
          onClick: handleConfirmSync,
          disabled: true,
        },
      })
    } else {
      hideBottomBar()
    }
  }, [allCompleted, isRunning, completedCount, tasks.length, setBottomBar, hideBottomBar, handleConfirmSync])

  // 运行同步任务
  const runSync = () => {
    setIsRunning(true)
    setCurrentTask(0)
    setTasks((prev) =>
      prev.map((t) => ({ ...t, status: 'pending', progress: 0 }))
    )
  }

  // 模拟任务进度
  useEffect(() => {
    if (!isRunning) return
    if (currentTask >= tasks.length) {
      setIsRunning(false)
      return
    }

    // 开始当前任务
    setTasks((prev) =>
      prev.map((t, i) =>
        i === currentTask ? { ...t, status: 'processing' } : t
      )
    )

    const interval = setInterval(() => {
      setTasks((prev) => {
        let taskCompleted = false
        const newTasks = prev.map((t, i) => {
          if (i !== currentTask) return t
          const newProgress = t.progress + Math.random() * 15
          if (newProgress >= 100) {
            taskCompleted = true
            return {
              ...t,
              status: 'completed' as const,
              progress: 100,
              details: getSyncDetails(t.id),
            }
          }
          return { ...t, progress: Math.min(newProgress, 100) }
        })
        
        // 如果任务完成，在下一个微任务中切换到下一个任务
        if (taskCompleted) {
          setTimeout(() => {
            setCurrentTask((prev) => prev + 1)
          }, 0)
        }
        
        return newTasks
      })
    }, 200)

    return () => {
      clearInterval(interval)
    }
  }, [isRunning, currentTask, tasks.length])

  const getSyncDetails = (taskId: string): string => {
    switch (taskId) {
      case 'audio-video':
        return '已校准 12 个切点，延迟补偿 +15ms'
      case 'subtitle-sync':
        return '已同步 28 条字幕，平均偏差 <50ms'
      case 'music-beat':
        return '识别到 45 个节拍点，已对齐 38 个'
      case 'lip-sync':
        return '检测到 3 个说话片段，已完成口型对齐'
      default:
        return '同步完成'
    }
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 p-6 overflow-hidden">
      {/* 页面标题 */}
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold text-surface-100 mb-2">
          音画同步
        </h1>
        <p className="text-surface-400">
          AI 自动校准视频、音频、字幕轨道，确保完美同步
        </p>
      </div>

      {/* 同步状态卡片 */}
      <div className="flex-1">
        {!isRunning && !allCompleted && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card variant="glass" className="p-8 text-center mb-8">
              <div className="w-20 h-20 rounded-2xl bg-amber-400/10 mx-auto mb-6 flex items-center justify-center">
                <Sparkles className="w-10 h-10 text-amber-400" />
              </div>
              <h2 className="text-xl font-semibold text-surface-100 mb-2">
                准备进行音画同步
              </h2>
              <p className="text-surface-400 mb-6 max-w-md mx-auto">
                AI 将自动分析并校准所有音视频轨道，确保画面、声音、字幕完美对齐
              </p>
              <Button
                size="lg"
                leftIcon={<Wand2 className="w-5 h-5" />}
                onClick={runSync}
              >
                开始智能同步
              </Button>
            </Card>
          </motion.div>
        )}

        {/* 任务列表 */}
        <div className="space-y-4">
          {tasks.map((task, index) => {
            const Icon = task.icon
            const isActive = task.status === 'processing'
            const isCompleted = task.status === 'completed'

            return (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card
                  className={`
                    p-4 transition-all duration-300
                    ${isActive ? 'border-amber-400/50 shadow-glow-amber' : ''}
                    ${isCompleted ? 'border-success/30' : ''}
                  `}
                >
                  <div className="flex items-center gap-4">
                    {/* 状态图标 */}
                    <div
                      className={`
                        w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-all
                        ${task.status === 'pending' ? 'bg-surface-700 text-surface-400' : ''}
                        ${task.status === 'processing' ? 'bg-amber-400/20 text-amber-400' : ''}
                        ${task.status === 'completed' ? 'bg-success/20 text-success' : ''}
                        ${task.status === 'error' ? 'bg-error/20 text-error' : ''}
                      `}
                    >
                      {task.status === 'processing' ? (
                        <Loader2 className="w-6 h-6 animate-spin" />
                      ) : task.status === 'completed' ? (
                        <CheckCircle2 className="w-6 h-6" />
                      ) : task.status === 'error' ? (
                        <AlertCircle className="w-6 h-6" />
                      ) : (
                        <Icon className="w-6 h-6" />
                      )}
                    </div>

                    {/* 任务信息 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-surface-100">
                          {task.name}
                        </h3>
                        {task.status === 'completed' && (
                          <Badge variant="success" size="sm">
                            <Check className="w-3 h-3" />
                            完成
                          </Badge>
                        )}
                        {task.status === 'processing' && (
                          <Badge variant="primary" size="sm">
                            处理中
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-surface-400">
                        {task.details || task.description}
                      </p>
                      {/* 进度条 */}
                      {(task.status === 'processing' || task.status === 'completed') && (
                        <Progress
                          value={task.progress}
                          variant={task.status === 'completed' ? 'success' : 'primary'}
                          size="sm"
                          className="mt-2"
                        />
                      )}
                    </div>

                    {/* 进度百分比 */}
                    {task.status === 'processing' && (
                      <span className="text-lg font-mono font-bold text-amber-400">
                        {Math.round(task.progress)}%
                      </span>
                    )}
                  </div>
                </Card>
              </motion.div>
            )
          })}
        </div>

      </div>

      {/* 同步统计 */}
      {(isRunning || allCompleted) && (
        <div className="mt-6 pt-6 border-t border-surface-800">
          <div className="grid grid-cols-4 gap-4">
            <Card className="p-4 text-center">
              <p className="text-2xl font-bold text-amber-400">{completedCount}/{tasks.length}</p>
              <p className="text-sm text-surface-400">任务完成</p>
            </Card>
            <Card className="p-4 text-center">
              <p className="text-2xl font-bold text-surface-100">12</p>
              <p className="text-sm text-surface-400">切点校准</p>
            </Card>
            <Card className="p-4 text-center">
              <p className="text-2xl font-bold text-surface-100">28</p>
              <p className="text-sm text-surface-400">字幕同步</p>
            </Card>
            <Card className="p-4 text-center">
              <p className="text-2xl font-bold text-surface-100">&lt;50ms</p>
              <p className="text-sm text-surface-400">平均偏差</p>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}

