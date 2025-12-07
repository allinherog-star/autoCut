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

  // 根据路径确定当前步骤
  const currentStepIndex = steps.findIndex((step) => pathname?.startsWith(step.path))
  const [currentStep, setCurrentStep] = useState(currentStepIndex >= 0 ? currentStepIndex : 0)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])
  
  // 底部操作栏状态
  const [bottomBarConfig, setBottomBarConfigState] = useState<BottomBarConfig>(defaultBottomBarConfig)
  
  // 目标设备状态（默认手机竖屏）
  const [targetDevice, setTargetDevice] = useState<TargetDevice>('phone')
  const deviceConfig = DEVICE_CONFIGS[targetDevice]

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
    // 只能去已完成的步骤，或者当前步骤已完成时可以去下一步
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
                // 只有当前步骤已完成时，才能进入下一步
                const isAccessible =
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

