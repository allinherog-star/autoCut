'use client'

import { useState, createContext, useContext, ReactNode, useCallback, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Upload,
  Wand2,
  Type,
  TrendingUp,
  Music,
  Zap,
  Heart,
  Volume2,
  Scissors,
  Download,
  ChevronLeft,
  ChevronRight,
  Check,
  Home,
  Sparkles,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Button, Progress, Card } from '@/components/ui'
import type { EditingStep } from '@/lib/types'

// ============================================
// 目标设备类型
// ============================================

export type TargetDevice = 'phone' | 'pc'

export interface DeviceInfo {
  id: TargetDevice
  name: string
  description: string
  aspectRatio: string
  width: number
  height: number
}

export const DEVICE_CONFIGS: Record<TargetDevice, DeviceInfo> = {
  phone: {
    id: 'phone',
    name: '手机竖屏',
    description: '抖音/快手/小红书',
    aspectRatio: '9/16',
    width: 1080,
    height: 1920,
  },
  pc: {
    id: 'pc',
    name: '电脑横屏',
    description: 'B站/YouTube',
    aspectRatio: '16/9',
    width: 1920,
    height: 1080,
  },
}

// ============================================
// 视频类型配置
// ============================================

export interface VideoTypeInfo {
  id: string
  name: string
  icon: string
  description: string
  category: 'lifestyle' | 'knowledge' | 'entertainment' | 'commerce'
}

export const VIDEO_TYPES: VideoTypeInfo[] = [
  // 日常记录类
  { id: 'vlog', name: 'Vlog', icon: '📹', description: '记录日常生活', category: 'lifestyle' },
  { id: 'travel', name: '旅游旅拍', icon: '✈️', description: '旅行攻略记录', category: 'lifestyle' },
  { id: 'life-hack', name: '生活小妙招', icon: '💡', description: '实用生活技巧', category: 'lifestyle' },
  
  // 探店体验类
  { id: 'food', name: '美食探店', icon: '🍜', description: '美食推荐分享', category: 'lifestyle' },
  { id: 'hotel', name: '睡寝探店', icon: '🏨', description: '酒店民宿体验', category: 'lifestyle' },
  
  // 时尚生活类
  { id: 'fashion', name: '时尚穿搭', icon: '👗', description: '穿搭分享推荐', category: 'lifestyle' },
  { id: 'fitness', name: '健身减脂', icon: '💪', description: '健身教程分享', category: 'lifestyle' },
  
  // 知识教程类
  { id: 'tutorial', name: '课程教程', icon: '📚', description: '技能教学课程', category: 'knowledge' },
  { id: 'knowledge', name: '知识科普', icon: '🧠', description: '科普知识讲解', category: 'knowledge' },
  { id: 'career', name: '职场攻略', icon: '💼', description: '职场经验分享', category: 'knowledge' },
  { id: 'tools', name: '效率工具', icon: '⚡', description: '工具软件推荐', category: 'knowledge' },
  
  // 种草带货类
  { id: 'recommend', name: '安利种草', icon: '🌱', description: '好物推荐分享', category: 'commerce' },
  { id: 'review', name: '评测对比', icon: '⚖️', description: '产品评测对比', category: 'entertainment' },
  { id: 'deals', name: '优惠带货', icon: '🛒', description: '优惠信息带货', category: 'commerce' },
  
  // 娱乐内容类
  { id: 'movie', name: '影视解说', icon: '🎬', description: '影视作品解读', category: 'entertainment' },
  { id: 'gaming', name: '游戏', icon: '🎮', description: '游戏实况攻略', category: 'entertainment' },
  { id: 'live-clip', name: '直播切片', icon: '📺', description: '直播精彩片段', category: 'entertainment' },
  { id: 'emotion', name: '情感咨询', icon: '💕', description: '情感故事分享', category: 'entertainment' },
]

export const VIDEO_TYPE_CATEGORIES = [
  { id: 'lifestyle', name: '生活日常', icon: '🏠' },
  { id: 'knowledge', name: '知识教程', icon: '📖' },
  { id: 'entertainment', name: '娱乐休闲', icon: '🎯' },
  { id: 'commerce', name: '种草带货', icon: '💰' },
]

// ============================================
// 底部操作栏配置类型
// ============================================

interface BottomBarConfig {
  show: boolean
  icon?: React.ReactNode
  title?: string
  description?: string
  primaryButton?: {
    text: string
    onClick: () => void
    disabled?: boolean
    loading?: boolean
    loadingText?: string
  }
  secondaryButton?: {
    text: string
    onClick: () => void
    icon?: React.ReactNode
  }
}

// ============================================
// 步骤配置
// ============================================

const steps: {
  id: EditingStep
  label: string
  shortLabel: string
  description: string
  icon: React.ElementType
  path: string
}[] = [
  {
    id: 'upload',
    label: '上传素材',
    shortLabel: '上传',
    description: '上传视频、图片等基础素材',
    icon: Upload,
    path: '/editor/upload',
  },
  {
    id: 'understand',
    label: '理解视频',
    shortLabel: '理解',
    description: 'AI 分析内容，智能分割',
    icon: Wand2,
    path: '/editor/understand',
  },
  {
    id: 'subtitle',
    label: '字幕推荐',
    shortLabel: '字幕',
    description: '智能识别语音生成字幕',
    icon: Type,
    path: '/editor/subtitle',
  },
  {
    id: 'title',
    label: '标题推荐',
    shortLabel: '标题',
    description: '生成吸引眼球的标题',
    icon: TrendingUp,
    path: '/editor/title',
  },
  {
    id: 'music',
    label: '音乐卡点',
    shortLabel: '音乐',
    description: '智能配乐和音乐卡点',
    icon: Music,
    path: '/editor/music',
  },
  {
    id: 'effects',
    label: '特效渲染',
    shortLabel: '特效',
    description: '添加动画和视觉效果',
    icon: Zap,
    path: '/editor/effects',
  },
  {
    id: 'emotion',
    label: '情绪增强',
    shortLabel: '情绪',
    description: '关键点情绪渲染',
    icon: Heart,
    path: '/editor/emotion',
  },
  {
    id: 'sync',
    label: '音画同步',
    shortLabel: '同步',
    description: '自动校准对齐',
    icon: Volume2,
    path: '/editor/sync',
  },
  {
    id: 'edit',
    label: '剪辑微调',
    shortLabel: '微调',
    description: '精细调整时间轴',
    icon: Scissors,
    path: '/editor/edit',
  },
  {
    id: 'export',
    label: '导出成片',
    shortLabel: '导出',
    description: '选择分辨率导出',
    icon: Download,
    path: '/editor/export',
  },
]

// ============================================
// Context
// ============================================

interface EditorContextType {
  currentStep: number
  setCurrentStep: (step: number) => void
  completedSteps: number[]
  markStepCompleted: (step: number) => void
  goToNextStep: () => void
  goToPrevStep: () => void
  canGoNext: boolean
  canGoPrev: boolean
  // 底部操作栏
  setBottomBar: (config: BottomBarConfig) => void
  hideBottomBar: () => void
  // 目标设备
  targetDevice: TargetDevice
  setTargetDevice: (device: TargetDevice) => void
  deviceConfig: DeviceInfo
  // 视频类型
  videoType: string | null
  setVideoType: (type: string | null) => void
  videoTypeInfo: VideoTypeInfo | null
}

const EditorContext = createContext<EditorContextType | null>(null)

export function useEditor() {
  const context = useContext(EditorContext)
  if (!context) {
    throw new Error('useEditor must be used within EditorLayout')
  }
  return context
}

// ============================================
// 布局组件
// ============================================

// 默认底部栏配置
const defaultBottomBarConfig: BottomBarConfig = {
  show: false,
}

export default function EditorLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  
  // 测试模式：允许任意切换步骤
  const isTestMode = true // TODO: 正式发布时改为 false 或通过环境变量控制

  // 根据路径确定当前步骤
  const currentStepIndex = steps.findIndex((step) => pathname?.startsWith(step.path))
  const [currentStep, setCurrentStep] = useState(currentStepIndex >= 0 ? currentStepIndex : 0)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])
  
  // 底部操作栏状态
  const [bottomBarConfig, setBottomBarConfigState] = useState<BottomBarConfig>(defaultBottomBarConfig)
  
  // 目标设备状态（默认手机竖屏）
  const [targetDevice, setTargetDevice] = useState<TargetDevice>('phone')
  const deviceConfig = DEVICE_CONFIGS[targetDevice]
  
  // 视频类型状态
  const [videoType, setVideoType] = useState<string | null>(null)
  const videoTypeInfo = VIDEO_TYPES.find(t => t.id === videoType) || null

  const progress = ((currentStep + 1) / steps.length) * 100

  const markStepCompleted = useCallback((step: number) => {
    setCompletedSteps((prev) => {
      if (!prev.includes(step)) {
        return [...prev, step]
      }
      return prev
    })
  }, [])

  const goToNextStep = useCallback(() => {
    if (currentStep < steps.length - 1) {
      // 确保当前步骤标记完成
      setCompletedSteps((prev) => (prev.includes(currentStep) ? prev : [...prev, currentStep]))
      const nextStep = currentStep + 1
      setCurrentStep(nextStep)
      router.push(steps[nextStep].path)
    }
  }, [currentStep, router])

  const goToPrevStep = useCallback(() => {
    if (currentStep > 0) {
      const prevStep = currentStep - 1
      setCurrentStep(prevStep)
      router.push(steps[prevStep].path)
    }
  }, [currentStep, router])

  const goToStep = useCallback((index: number) => {
    // 测试模式下允许任意切换
    if (isTestMode) {
      setCurrentStep(index)
      router.push(steps[index].path)
      return
    }
    
    // 正式模式：只能去已完成的步骤，或者当前步骤已完成时可以去下一步
    const canAccess = index < currentStep || // 可以返回之前的步骤
                     (index === currentStep) || // 可以停留在当前步骤
                     (index === currentStep + 1 && completedSteps.includes(currentStep)) // 当前步骤完成后可以去下一步
    
    if (canAccess) {
      setCurrentStep(index)
      router.push(steps[index].path)
    }
  }, [currentStep, completedSteps, router])

  // 底部操作栏方法
  const setBottomBar = useCallback((config: BottomBarConfig) => {
    setBottomBarConfigState(config)
  }, [])

  const hideBottomBar = useCallback(() => {
    setBottomBarConfigState(defaultBottomBarConfig)
  }, [])

  // 追踪上一次的 pathname，只在真正变化时重置底部栏
  const prevPathnameRef = useRef(pathname)
  
  useEffect(() => {
    // 只在 pathname 真正变化时重置底部栏（跳过初次挂载）
    if (prevPathnameRef.current !== pathname) {
      prevPathnameRef.current = pathname
      setBottomBarConfigState(defaultBottomBarConfig)
    }
  }, [pathname])

  const contextValue: EditorContextType = {
    currentStep,
    setCurrentStep,
    completedSteps,
    markStepCompleted,
    goToNextStep,
    goToPrevStep,
    canGoNext: currentStep < steps.length - 1 && completedSteps.includes(currentStep),
    canGoPrev: currentStep > 0,
    setBottomBar,
    hideBottomBar,
    // 目标设备
    targetDevice,
    setTargetDevice,
    deviceConfig,
    // 视频类型
    videoType,
    setVideoType,
    videoTypeInfo,
  }

  return (
    <EditorContext.Provider value={contextValue}>
      <div className="min-h-screen bg-surface-950 flex flex-col">
        {/* 顶部导航 */}
        <header className="h-16 border-b border-surface-800 flex items-center justify-between px-6 bg-surface-900/80 backdrop-blur-lg sticky top-0 z-50">
          {/* Logo 和返回 */}
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                <Scissors className="w-4 h-4 text-surface-950" />
              </div>
              <span className="font-display font-semibold text-surface-200 group-hover:text-surface-100 transition-colors">
                AutoCut
              </span>
            </Link>
            <div className="h-6 w-px bg-surface-700" />
            <Link href="/">
              <Button variant="ghost" size="sm" leftIcon={<Home className="w-4 h-4" />}>
                返回首页
              </Button>
            </Link>
          </div>

          {/* 进度条 */}
          <div className="flex-1 max-w-md mx-8">
            <div className="flex items-center gap-3">
              <span className="text-xs text-surface-500 font-mono">
                {currentStep + 1}/{steps.length}
              </span>
              <Progress value={progress} size="sm" variant="primary" className="flex-1" />
              <span className="text-xs text-surface-400">
                {steps[currentStep]?.label}
              </span>
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm">
              保存草稿
            </Button>
            <Button variant="primary" size="sm">
              预览视频
            </Button>
          </div>
        </header>

        <div className="flex flex-1 min-h-0 overflow-hidden">
          {/* 左侧步骤导航 */}
          <aside className="w-64 border-r border-surface-800 bg-surface-900/50 flex flex-col">
            <nav className="flex-1 py-4 overflow-y-auto">
              {steps.map((step, index) => {
                const isActive = index === currentStep
                const isCompleted = completedSteps.includes(index)
                // 测试模式下所有步骤都可以访问
                // 正式模式：只有当前步骤已完成时，才能进入下一步
                const isAccessible = isTestMode || // 测试模式下全部可访问
                  index < currentStep || // 可以返回之前的步骤
                  index === currentStep || // 当前步骤
                  (index === currentStep + 1 && completedSteps.includes(currentStep)) // 当前步骤完成后可以去下一步

                return (
                  <button
                    key={step.id}
                    onClick={() => goToStep(index)}
                    disabled={!isAccessible}
                    className={`
                      w-full px-4 py-3 flex items-center gap-3 text-left transition-all duration-200
                      ${isActive ? 'bg-amber-400/10 border-r-2 border-amber-400' : ''}
                      ${isAccessible && !isActive ? 'hover:bg-surface-800' : ''}
                      ${!isAccessible ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
                    `}
                  >
                    {/* 步骤图标 */}
                    <div
                      className={`
                        w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200
                        ${isCompleted ? 'bg-success text-white' : ''}
                        ${isActive && !isCompleted ? 'bg-amber-400 text-surface-950' : ''}
                        ${!isActive && !isCompleted ? 'bg-surface-700 text-surface-400' : ''}
                      `}
                    >
                      <step.icon className="w-4 h-4" />
                    </div>

                    {/* 步骤信息 */}
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm font-medium truncate ${
                          isActive ? 'text-amber-400' : 'text-surface-200'
                        }`}
                      >
                        {step.label}
                      </p>
                      <p className="text-xs text-surface-500 truncate">{step.description}</p>
                    </div>
                  </button>
                )
              })}
            </nav>

          </aside>

          {/* 主内容区域 */}
          <main className="relative flex-1 overflow-hidden flex flex-col">
            <AnimatePresence mode="wait">
              <motion.div
                key={pathname}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="flex-1 min-h-0 overflow-hidden pb-28"
              >
                {children}
              </motion.div>
            </AnimatePresence>

            {/* 共用底部操作栏 */}
            <AnimatePresence>
              {bottomBarConfig.show && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.2 }}
                  className="fixed left-64 right-0 bottom-0 z-30 px-6 py-4 border-t border-surface-800 bg-surface-950"
                >
                  <Card variant="glass" className="p-4">
                    <div className="flex items-center justify-between">
                      {/* 左侧信息区 */}
                      {(bottomBarConfig.icon || bottomBarConfig.title) && (
                        <div className="flex items-center gap-4">
                          {bottomBarConfig.icon && (
                            <div className="w-10 h-10 rounded-xl bg-amber-400/10 flex items-center justify-center">
                              {bottomBarConfig.icon}
                            </div>
                          )}
                          {(bottomBarConfig.title || bottomBarConfig.description) && (
                            <div>
                              {bottomBarConfig.title && (
                                <p className="font-medium text-surface-100">{bottomBarConfig.title}</p>
                              )}
                              {bottomBarConfig.description && (
                                <p className="text-sm text-surface-400">{bottomBarConfig.description}</p>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      {/* 右侧按钮区 */}
                      <div className="flex items-center gap-3 ml-auto">
                        {bottomBarConfig.secondaryButton && (
                          <Button
                            variant="ghost"
                            leftIcon={bottomBarConfig.secondaryButton.icon}
                            onClick={bottomBarConfig.secondaryButton.onClick}
                          >
                            {bottomBarConfig.secondaryButton.text}
                          </Button>
                        )}
                        {bottomBarConfig.primaryButton && (
                          <Button
                            size="lg"
                            rightIcon={<ChevronRight className="w-5 h-5" />}
                            onClick={bottomBarConfig.primaryButton.onClick}
                            disabled={bottomBarConfig.primaryButton.disabled}
                            isLoading={bottomBarConfig.primaryButton.loading}
                            loadingText={bottomBarConfig.primaryButton.loadingText}
                          >
                            {bottomBarConfig.primaryButton.text}
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </main>
        </div>
      </div>
    </EditorContext.Provider>
  )
}

