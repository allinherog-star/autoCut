'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Heart,
  Sparkles,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Smile,
  Frown,
  Zap,
  Music,
  AlertTriangle,
  PartyPopper,
  Flame,
  Ghost,
  HelpCircle,
  Star,
  Laugh,
  RefreshCw,
  Eye,
  Wand2,
  Type,
  RotateCcw,
  Maximize2,
  Monitor,
} from 'lucide-react'
import { Button, Card, Badge, Slider, Switch, Tabs, TabsList, TabsTrigger } from '@/components/ui'
import { useEditor } from '../layout'
import { 
  EmotionTextEffect, 
} from '@/components/emotion-text-effect'
import {
  EmotionType,
  EMOTION_TEXT_PRESETS,
  EMOTION_COLORS,
  getEmotionLabel,
  getPresetById,
} from '@/lib/emotion-text-effects'
import { VarietyAnimatedText, ANIMATION_PRESETS } from '@/components/variety-animated-text'
import { FunnyText } from '@/components/variety-text-system'

// ============================================
// 类型定义
// ============================================

interface EmotionPoint {
  id: string
  time: number
  duration: number // 持续时间（秒）
  emotion: EmotionType
  intensity: number
  suggestion: string
  effects: string[]
  textEffect?: string // 文字特效预设 ID
  customText?: string // 自定义文字
  varietyEffect?: string // 综艺花字特效类型: 'animated' | 'funny-yellow' | 'funny-pink' | 'funny-rainbow'
}

interface EmotionPreset {
  emotion: EmotionType
  label: string
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>
  color: string
  soundEffects: string[]
  visualEffects: string[]
}

// ============================================
// 模拟数据
// ============================================

const emotionPresets: EmotionPreset[] = [
  {
    emotion: 'happy',
    label: '欢乐',
    icon: Smile,
    color: '#22c55e',
    soundEffects: ['欢呼声', '笑声', '掌声'],
    visualEffects: ['彩带', '星星', '发光'],
  },
  {
    emotion: 'excited',
    label: '激动',
    icon: PartyPopper,
    color: '#fbbf24',
    soundEffects: ['震撼鼓点', '升调音效', '爆炸声'],
    visualEffects: ['闪光', '震动', '粒子'],
  },
  {
    emotion: 'love',
    label: '心动',
    icon: Heart,
    color: '#ec4899',
    soundEffects: ['浪漫旋律', '心跳声', '叹息'],
    visualEffects: ['爱心', '粉色泡泡', '柔光'],
  },
  {
    emotion: 'surprised',
    label: '惊讶',
    icon: AlertTriangle,
    color: '#8b5cf6',
    soundEffects: ['惊叹声', '音效升调', '弹簧声'],
    visualEffects: ['放大', '问号', '感叹号'],
  },
  {
    emotion: 'angry',
    label: '生气',
    icon: Flame,
    color: '#ef4444',
    soundEffects: ['低频震动', '爆裂声', '怒吼'],
    visualEffects: ['火焰', '抖动', '红色滤镜'],
  },
  {
    emotion: 'sad',
    label: '悲伤',
    icon: Frown,
    color: '#3b82f6',
    soundEffects: ['钢琴弱音', '雨声', '叹息'],
    visualEffects: ['模糊', '去饱和', '慢动作'],
  },
  {
    emotion: 'scared',
    label: '害怕',
    icon: Ghost,
    color: '#6b7280',
    soundEffects: ['惊悚音效', '心跳加速', '尖叫'],
    visualEffects: ['暗角', '闪烁', '抖动'],
  },
  {
    emotion: 'confused',
    label: '困惑',
    icon: HelpCircle,
    color: '#f59e0b',
    soundEffects: ['问号音效', '滑稽声', '疑惑'],
    visualEffects: ['旋转', '问号', '晕眩'],
  },
  {
    emotion: 'cool',
    label: '酷炫',
    icon: Star,
    color: '#06b6d4',
    soundEffects: ['电子音', '合成器', '低音'],
    visualEffects: ['霓虹', '故障', '闪光'],
  },
  {
    emotion: 'funny',
    label: '搞笑',
    icon: Laugh,
    color: '#a855f7',
    soundEffects: ['笑声', '滑稽音效', '弹跳声'],
    visualEffects: ['夸张变形', '漫画效果', '彩色'],
  },
]

const mockEmotionPoints: EmotionPoint[] = [
  {
    id: '1',
    time: 2,
    duration: 3,
    emotion: 'happy',
    intensity: 80,
    suggestion: '开场欢迎，情绪积极',
    effects: ['欢呼声', '星星动效'],
    textEffect: 'happy-bounce',
    customText: '好开心呀！',
  },
  {
    id: '2',
    time: 6,
    duration: 2.5,
    emotion: 'excited',
    intensity: 95,
    suggestion: '高潮片段，需要强化兴奋感',
    effects: ['震撼鼓点', '闪光效果'],
    textEffect: 'excited-explosion',
    customText: '太棒了！！！',
  },
  {
    id: '3',
    time: 10,
    duration: 2,
    emotion: 'surprised',
    intensity: 70,
    suggestion: '意外转折，制造惊讶效果',
    effects: ['惊叹声', '放大效果'],
    textEffect: 'surprised-pop',
    customText: '什么？！',
  },
  {
    id: '4',
    time: 14,
    duration: 3,
    emotion: 'love',
    intensity: 85,
    suggestion: '温馨感人场景',
    effects: ['浪漫旋律', '爱心漂浮'],
    textEffect: 'love-hearts',
    customText: '好感动～',
  },
  {
    id: '5',
    time: 18,
    duration: 2.5,
    emotion: 'funny',
    intensity: 90,
    suggestion: '搞笑片段，增强喜剧效果',
    effects: ['笑声', '漫画效果'],
    textEffect: 'funny-wobble',
    customText: '笑死我了哈哈！',
  },
  {
    id: '6',
    time: 22,
    duration: 3,
    emotion: 'funny',
    intensity: 95,
    suggestion: '综艺花字效果演示',
    effects: ['彩纸', '速度线', '表情飞入'],
    varietyEffect: 'animated',
    customText: '一见你就笑',
  },
  {
    id: '7',
    time: 26,
    duration: 2.5,
    emotion: 'excited',
    intensity: 88,
    suggestion: '爆笑大字效果',
    effects: ['弹跳动画', '彩色粒子'],
    varietyEffect: 'funny-rainbow',
    customText: '绝了绝了',
  },
]

// ============================================
// 视频预览与特效合成组件
// ============================================

interface VideoPreviewWithEffectsProps {
  emotionPoints: EmotionPoint[]
  selectedPointId: string | null
  onSelectPoint: (point: EmotionPoint) => void
}

function VideoPreviewWithEffects({ 
  emotionPoints, 
  selectedPointId,
  onSelectPoint,
}: VideoPreviewWithEffectsProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isMuted, setIsMuted] = useState(true)
  const [activeEffect, setActiveEffect] = useState<EmotionPoint | null>(null)
  const [effectKey, setEffectKey] = useState(0)

  // 处理时间更新
  const handleTimeUpdate = useCallback(() => {
    const video = videoRef.current
    if (!video) return

    const time = video.currentTime
    setCurrentTime(time)

    // 查找当前时间应该显示的情绪特效
    const effect = emotionPoints.find(
      (point) => time >= point.time && time <= point.time + point.duration
    )
    
    if (effect?.id !== activeEffect?.id) {
      setActiveEffect(effect || null)
      if (effect) {
        setEffectKey(k => k + 1) // 重新触发动画
      }
    }
  }, [emotionPoints, activeEffect])

  // 视频初始化
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleLoadedMetadata = () => {
      setDuration(video.duration)
    }

    const handleEnded = () => {
      video.currentTime = 0
      video.play()
    }

    video.addEventListener('loadedmetadata', handleLoadedMetadata)
    video.addEventListener('timeupdate', handleTimeUpdate)
    video.addEventListener('ended', handleEnded)

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata)
      video.removeEventListener('timeupdate', handleTimeUpdate)
      video.removeEventListener('ended', handleEnded)
    }
  }, [handleTimeUpdate])

  // 播放/暂停
  const togglePlay = () => {
    const video = videoRef.current
    if (!video) return

    if (isPlaying) {
      video.pause()
      setIsPlaying(false)
    } else {
      video.play().then(() => setIsPlaying(true)).catch(() => {})
    }
  }

  // 重置
  const handleReset = () => {
    const video = videoRef.current
    if (!video) return
    video.currentTime = 0
    setCurrentTime(0)
    setActiveEffect(null)
  }

  // 跳转到指定时间
  const seekTo = (time: number) => {
    const video = videoRef.current
    if (!video) return
    video.currentTime = time
    setCurrentTime(time)
  }

  // 进度条点击
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const percent = (e.clientX - rect.left) / rect.width
    const newTime = percent * duration
    seekTo(newTime)
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  // 格式化时间
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${String(secs).padStart(2, '0')}`
  }

  return (
    <div className="space-y-4">
      {/* 视频预览区域 */}
      <div className="relative aspect-video bg-black rounded-xl overflow-hidden">
        {/* 视频 */}
        <video
          ref={videoRef}
          src="/test-video.mp4"
          className="w-full h-full object-cover"
          muted={isMuted}
          playsInline
          preload="auto"
        />

        {/* 情绪文字特效叠加层 */}
        <AnimatePresence mode="wait">
          {activeEffect && activeEffect.customText && (
            <motion.div
              key={`effect-${activeEffect.id}-${effectKey}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none z-10"
            >
              {/* 综艺花字特效 */}
              {activeEffect.varietyEffect === 'animated' && (
                <div className="w-full h-full">
                  <VarietyAnimatedText
                    text={activeEffect.customText}
                    fontSize={48}
                    config={ANIMATION_PRESETS['狂欢庆祝']}
                  />
                </div>
              )}
              {activeEffect.varietyEffect === 'funny-yellow' && (
                <div className="w-full h-full">
                  <FunnyText text={activeEffect.customText} variant="yellow" scale={0.8} />
                </div>
              )}
              {activeEffect.varietyEffect === 'funny-pink' && (
                <div className="w-full h-full">
                  <FunnyText text={activeEffect.customText} variant="pink" scale={0.8} />
                </div>
              )}
              {activeEffect.varietyEffect === 'funny-rainbow' && (
                <div className="w-full h-full">
                  <FunnyText text={activeEffect.customText} variant="rainbow" scale={0.8} />
                </div>
              )}
              {/* 原有花字特效 */}
              {!activeEffect.varietyEffect && activeEffect.textEffect && (
                <EmotionTextEffect
                  text={activeEffect.customText}
                  preset={activeEffect.textEffect}
                  scale={0.7}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* 当前特效标签 */}
        <AnimatePresence>
          {activeEffect && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-4 left-4 z-20"
            >
              <Badge 
                variant="outline" 
                className="bg-black/60 backdrop-blur-sm"
                style={{ 
                  borderColor: EMOTION_COLORS[activeEffect.emotion].primary,
                  color: EMOTION_COLORS[activeEffect.emotion].primary,
                }}
              >
                <Wand2 className="w-3 h-3 mr-1" />
                {getEmotionLabel(activeEffect.emotion)} · {
                  activeEffect.varietyEffect 
                    ? `综艺花字 (${activeEffect.varietyEffect})` 
                    : getPresetById(activeEffect.textEffect || '')?.name
                }
              </Badge>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 控制条 */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-4">
          {/* 时间轴 - 显示情绪节点标记 */}
          <div
            className="relative w-full h-2 bg-white/20 rounded-full cursor-pointer mb-3 group"
            onClick={handleProgressClick}
          >
            {/* 情绪节点标记 */}
            {emotionPoints.map((point) => {
              const startPercent = (point.time / duration) * 100
              const widthPercent = (point.duration / duration) * 100
              const colors = EMOTION_COLORS[point.emotion]
              
              return (
                <div
                  key={point.id}
                  className="absolute h-full rounded-full cursor-pointer transition-all hover:brightness-125"
                  style={{
                    left: `${startPercent}%`,
                    width: `${widthPercent}%`,
                    backgroundColor: `${colors.primary}80`,
                    boxShadow: selectedPointId === point.id ? `0 0 8px ${colors.primary}` : 'none',
                  }}
                  onClick={(e) => {
                    e.stopPropagation()
                    seekTo(point.time)
                    onSelectPoint(point)
                  }}
                  title={`${point.customText} (${formatTime(point.time)})`}
                />
              )
            })}
            
            {/* 播放进度 */}
            <div
              className="absolute h-full bg-white/60 rounded-full pointer-events-none"
              style={{ width: `${progress}%` }}
            />
            
            {/* 播放头 */}
            <div
              className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
              style={{ left: `calc(${progress}% - 8px)` }}
            />
          </div>

          {/* 控制按钮 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                isIconOnly
                onClick={togglePlay}
                className="text-white hover:bg-white/20"
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                isIconOnly
                onClick={handleReset}
                className="text-white hover:bg-white/20"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                isIconOnly
                onClick={() => setIsMuted(!isMuted)}
                className="text-white hover:bg-white/20"
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </Button>
              <span className="text-sm text-white/80 font-mono">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                <Monitor className="w-3 h-3 mr-1" />
                实时预览
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* 快速跳转按钮 */}
      <div className="flex flex-wrap gap-2">
        <span className="text-xs text-surface-500 self-center mr-2">快速跳转:</span>
        {emotionPoints.map((point) => {
          const preset = emotionPresets.find(p => p.emotion === point.emotion)
          const Icon = preset?.icon || Smile
          const isActive = selectedPointId === point.id
          
          return (
            <Button
              key={point.id}
              variant={isActive ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => {
                seekTo(point.time)
                onSelectPoint(point)
              }}
              className={isActive ? '' : 'hover:bg-surface-800'}
            >
              <Icon className="w-3 h-3 mr-1" />
              {formatTime(point.time)}
            </Button>
          )
        })}
      </div>
    </div>
  )
}

// ============================================
// 情绪增强页面
// ============================================

export default function EmotionPage() {
  const { goToNextStep, markStepCompleted, currentStep, setBottomBar } = useEditor()
  const [emotionPoints, setEmotionPoints] = useState<EmotionPoint[]>(mockEmotionPoints)
  const [selectedPoint, setSelectedPoint] = useState<EmotionPoint | null>(null)
  const [autoEnhance, setAutoEnhance] = useState(true)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [visualEnabled, setVisualEnabled] = useState(true)
  const [textEffectEnabled, setTextEffectEnabled] = useState(true)
  const [globalIntensity, setGlobalIntensity] = useState(75)
  const [activeTab, setActiveTab] = useState('preview')
  const [previewKey, setPreviewKey] = useState(0)

  // 确认情绪增强并进入下一步
  const handleConfirmEmotion = useCallback(() => {
    markStepCompleted(currentStep)
    goToNextStep()
  }, [markStepCompleted, currentStep, goToNextStep])

  // 更新底部操作栏
  useEffect(() => {
    setBottomBar({
      show: true,
      icon: <Heart className="w-5 h-5 text-amber-400" />,
      title: `已配置 ${emotionPoints.length} 个情绪节点`,
      description: `整体强度 ${globalIntensity}%，音效${soundEnabled ? '开启' : '关闭'}，视效${visualEnabled ? '开启' : '关闭'}，文字特效${textEffectEnabled ? '开启' : '关闭'}`,
      primaryButton: {
        text: '确认情绪增强，继续下一步',
        onClick: handleConfirmEmotion,
      },
    })
  }, [emotionPoints.length, globalIntensity, soundEnabled, visualEnabled, textEffectEnabled, setBottomBar, handleConfirmEmotion])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${String(secs).padStart(2, '0')}`
  }

  const getPresetByEmotion = (emotion: EmotionType) =>
    emotionPresets.find((p) => p.emotion === emotion)!

  const updatePointIntensity = (id: string, intensity: number) => {
    setEmotionPoints((prev) =>
      prev.map((p) => (p.id === id ? { ...p, intensity } : p))
    )
  }

  const updatePointTextEffect = (id: string, textEffect: string) => {
    setEmotionPoints((prev) =>
      prev.map((p) => (p.id === id ? { ...p, textEffect } : p))
    )
    setPreviewKey(k => k + 1)
  }

  const updatePointCustomText = (id: string, customText: string) => {
    setEmotionPoints((prev) =>
      prev.map((p) => (p.id === id ? { ...p, customText } : p))
    )
  }

  // 重播动画
  const replayAnimation = () => {
    setPreviewKey(k => k + 1)
  }

  // 处理选择情绪节点
  const handleSelectPoint = (point: EmotionPoint) => {
    setSelectedPoint(point)
  }

  return (
    <div className="flex-1 flex min-h-0 overflow-hidden">
      {/* 左侧内容区 */}
      <div className="flex-1 flex flex-col overflow-hidden border-r border-surface-800">
        {/* 页面标题 */}
        <div className="flex-shrink-0 px-6 pt-6 pb-4">
          <h1 className="text-2xl font-display font-bold text-surface-100 mb-2">
            情绪增强
          </h1>
          <p className="text-surface-400">
            AI 识别视频情绪节点，添加音效、视觉效果和花字特效增强感染力
          </p>
        </div>

        {/* 全局控制 */}
        <Card className="flex-shrink-0 mx-6 mb-4 p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <span className="font-medium text-surface-100">AI 自动情绪增强</span>
            </div>
            <Switch checked={autoEnhance} onCheckedChange={setAutoEnhance} />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-surface-400 flex items-center gap-2">
                <Volume2 className="w-4 h-4" />
                音效增强
              </span>
              <Switch checked={soundEnabled} onCheckedChange={setSoundEnabled} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-surface-400 flex items-center gap-2">
                <Zap className="w-4 h-4" />
                视觉效果
              </span>
              <Switch checked={visualEnabled} onCheckedChange={setVisualEnabled} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-surface-400 flex items-center gap-2">
                <Type className="w-4 h-4" />
                文字特效
              </span>
              <Switch checked={textEffectEnabled} onCheckedChange={setTextEffectEnabled} />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-surface-400">整体强度</span>
              <span className="text-amber-400">{globalIntensity}%</span>
            </div>
            <Slider
              value={[globalIntensity]}
              onValueChange={(v) => setGlobalIntensity(v[0])}
              max={100}
            />
          </div>
        </Card>

        {/* 标签页切换 */}
        <div className="px-6 mb-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full">
              <TabsTrigger value="preview" leftIcon={<Monitor className="w-4 h-4" />}>
                视频预览
              </TabsTrigger>
              <TabsTrigger value="timeline" leftIcon={<Zap className="w-4 h-4" />}>
                时间线
              </TabsTrigger>
              <TabsTrigger value="texteffects" leftIcon={<Wand2 className="w-4 h-4" />}>
                花字特效库
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* 内容区域 */}
        <div className="flex-1 overflow-y-auto px-6 min-h-0">
          {activeTab === 'preview' ? (
            // 视频预览视图
            <div className="space-y-4 pb-4">
              <VideoPreviewWithEffects
                emotionPoints={emotionPoints}
                selectedPointId={selectedPoint?.id || null}
                onSelectPoint={handleSelectPoint}
              />

              {/* 选中节点的详细编辑 */}
              {selectedPoint && (
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {(() => {
                        const preset = getPresetByEmotion(selectedPoint.emotion)
                        const Icon = preset.icon
                        return (
                          <>
                            <div
                              className="w-10 h-10 rounded-xl flex items-center justify-center"
                              style={{ backgroundColor: `${preset.color}20` }}
                            >
                              <Icon className="w-5 h-5" style={{ color: preset.color }} />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-surface-100">
                                  {formatTime(selectedPoint.time)}
                                </span>
                                <Badge
                                  variant="outline"
                                  size="sm"
                                  style={{ borderColor: preset.color, color: preset.color }}
                                >
                                  {preset.label}
                                </Badge>
                              </div>
                              <p className="text-sm text-surface-400">
                                {selectedPoint.suggestion}
                              </p>
                            </div>
                          </>
                        )
                      })()}
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={replayAnimation}
                    >
                      <RefreshCw className="w-4 h-4 mr-1" />
                      重播动画
                    </Button>
                  </div>

                  {/* 文字特效编辑 */}
                  {textEffectEnabled && (
                    <div className="space-y-4">
                      {/* 预览 */}
                      {selectedPoint.customText && (selectedPoint.textEffect || selectedPoint.varietyEffect) && (
                        <div className="bg-surface-900/50 rounded-lg flex items-center justify-center min-h-[120px] overflow-hidden">
                          {selectedPoint.varietyEffect === 'animated' ? (
                            <div key={previewKey} className="w-full h-full min-h-[150px]">
                              <VarietyAnimatedText
                                text={selectedPoint.customText}
                                fontSize={36}
                                config={ANIMATION_PRESETS['狂欢庆祝']}
                              />
                            </div>
                          ) : selectedPoint.varietyEffect?.startsWith('funny-') ? (
                            <div key={previewKey} className="w-full h-full min-h-[150px]">
                              <FunnyText 
                                text={selectedPoint.customText} 
                                variant={selectedPoint.varietyEffect.replace('funny-', '') as 'yellow' | 'pink' | 'cyan' | 'rainbow'} 
                                scale={0.6} 
                              />
                            </div>
                          ) : selectedPoint.textEffect ? (
                            <EmotionTextEffect
                              key={previewKey}
                              text={selectedPoint.customText}
                              preset={selectedPoint.textEffect}
                              scale={0.6}
                            />
                          ) : null}
                        </div>
                      )}

                      {/* 自定义文字输入 */}
                      <div>
                        <label className="text-sm text-surface-400 mb-2 block">显示文字</label>
                        <input
                          type="text"
                          value={selectedPoint.customText || ''}
                          onChange={(e) => updatePointCustomText(selectedPoint.id, e.target.value)}
                          placeholder="输入要显示的文字..."
                          className="w-full px-3 py-2 bg-surface-800 border border-surface-700 rounded-lg text-sm text-surface-100 placeholder:text-surface-500 focus:border-amber-500 focus:outline-none"
                        />
                      </div>

                      {/* 综艺花字特效选择 */}
                      <div>
                        <label className="text-sm text-surface-400 mb-2 block">🎬 综艺花字特效</label>
                        <div className="grid grid-cols-2 gap-2 mb-4">
                          {[
                            { id: 'animated', name: '🎉 狂欢庆祝', desc: '弹跳+彩纸+表情飞入' },
                            { id: 'funny-yellow', name: '💛 经典黄', desc: '综艺明黄色大字' },
                            { id: 'funny-pink', name: '💗 可爱粉', desc: '可爱粉色大字' },
                            { id: 'funny-rainbow', name: '🌈 彩虹色', desc: '多彩渐变大字' },
                          ].map(effect => (
                            <button
                              key={effect.id}
                              onClick={() => {
                                setEmotionPoints(prev => 
                                  prev.map(p => p.id === selectedPoint.id 
                                    ? { ...p, varietyEffect: effect.id, textEffect: undefined } 
                                    : p
                                  )
                                )
                                setPreviewKey(k => k + 1)
                              }}
                              className={`
                                p-3 rounded-lg border text-left transition-all
                                ${selectedPoint.varietyEffect === effect.id
                                  ? 'border-amber-500 bg-amber-500/10'
                                  : 'border-surface-700 hover:border-surface-500 bg-surface-800/50'
                                }
                              `}
                            >
                              <div className="font-medium text-surface-200 text-sm">
                                {effect.name}
                              </div>
                              <div className="text-xs text-surface-500 mt-1">
                                {effect.desc}
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* 原有特效选择 */}
                      <div>
                        <label className="text-sm text-surface-400 mb-2 block">✨ 情绪文字特效</label>
                        <div className="grid grid-cols-3 gap-2">
                          {EMOTION_TEXT_PRESETS
                            .filter(p => p.emotion === selectedPoint.emotion)
                            .map(preset => (
                              <button
                                key={preset.id}
                                onClick={() => {
                                  setEmotionPoints(prev => 
                                    prev.map(p => p.id === selectedPoint.id 
                                      ? { ...p, textEffect: preset.id, varietyEffect: undefined } 
                                      : p
                                    )
                                  )
                                  setPreviewKey(k => k + 1)
                                }}
                                className={`
                                  p-3 rounded-lg border text-left transition-all
                                  ${selectedPoint.textEffect === preset.id && !selectedPoint.varietyEffect
                                    ? 'border-amber-500 bg-amber-500/10'
                                    : 'border-surface-700 hover:border-surface-500 bg-surface-800/50'
                                  }
                                `}
                              >
                                <div className="font-medium text-surface-200 text-sm">
                                  {preset.name}
                                </div>
                                <div className="text-xs text-surface-500 mt-1">
                                  {preset.description}
                                </div>
                              </button>
                            ))}
                        </div>
                      </div>

                      {/* 强度滑块 */}
                      <div>
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span className="text-surface-400">情绪强度</span>
                          <span className="text-amber-400">{selectedPoint.intensity}%</span>
                        </div>
                        <Slider
                          value={[selectedPoint.intensity]}
                          onValueChange={(v) => updatePointIntensity(selectedPoint.id, v[0])}
                          max={100}
                        />
                      </div>
                    </div>
                  )}
                </Card>
              )}
            </div>
          ) : activeTab === 'timeline' ? (
            // 时间线视图
            <div className="space-y-3 pb-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-semibold text-surface-100">
                  识别到 {emotionPoints.length} 个情绪节点
                </h2>
              </div>

              {emotionPoints.map((point, index) => {
                const preset = getPresetByEmotion(point.emotion)
                const Icon = preset.icon

                return (
                  <motion.div
                    key={point.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card
                      isInteractive
                      isSelected={selectedPoint?.id === point.id}
                      className="p-4"
                      onClick={() => setSelectedPoint(point)}
                    >
                      <div className="flex items-start gap-4">
                        {/* 情绪图标 */}
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: `${preset.color}20` }}
                        >
                          <Icon className="w-6 h-6" style={{ color: preset.color }} />
                        </div>

                        {/* 信息 */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-mono text-surface-500">
                              {formatTime(point.time)}
                            </span>
                            <Badge
                              variant="outline"
                              size="sm"
                              style={{
                                borderColor: preset.color,
                                color: preset.color,
                              }}
                            >
                              {preset.label}
                            </Badge>
                            <span
                              className="text-xs px-1.5 py-0.5 rounded"
                              style={{
                                backgroundColor: `${preset.color}20`,
                                color: preset.color,
                              }}
                            >
                              {point.intensity}%
                            </span>
                            {(point.textEffect || point.varietyEffect) && (
                              <Badge variant="default" size="sm">
                                <Wand2 className="w-3 h-3 mr-1" />
                                {point.varietyEffect ? '综艺花字' : '花字'}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-surface-200 mb-2">
                            {point.suggestion}
                          </p>
                          {point.customText && (
                            <div className="text-xs text-surface-400 italic mb-2">
                              &quot;{point.customText}&quot;
                            </div>
                          )}
                          <div className="flex flex-wrap gap-1.5">
                            {point.effects.map((effect) => (
                              <Badge key={effect} variant="default" size="sm">
                                {effect}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        {/* 预览按钮 */}
                        <Button variant="ghost" size="sm" isIconOnly>
                          <Play className="w-4 h-4" />
                        </Button>
                      </div>
                    </Card>
                  </motion.div>
                )
              })}
            </div>
          ) : (
            // 花字特效库视图
            <div className="space-y-6 pb-4">
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-surface-100 mb-2">
                  花字特效库
                </h2>
                <p className="text-sm text-surface-400">
                  灵感来源于&quot;一见你就笑&quot;等综艺节目的可爱花字效果
                </p>
              </div>

              {/* 按情绪分类展示 */}
              {Object.entries(
                EMOTION_TEXT_PRESETS.reduce((acc, preset) => {
                  if (!acc[preset.emotion]) acc[preset.emotion] = []
                  acc[preset.emotion].push(preset)
                  return acc
                }, {} as Record<EmotionType, typeof EMOTION_TEXT_PRESETS>)
              ).map(([emotion, presets]) => {
                const emotionPreset = getPresetByEmotion(emotion as EmotionType)
                const Icon = emotionPreset?.icon || Smile
                const colors = EMOTION_COLORS[emotion as EmotionType]

                return (
                  <div key={emotion} className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${colors.primary}20` }}
                      >
                        <Icon className="w-4 h-4" style={{ color: colors.primary }} />
                      </div>
                      <span className="font-medium text-surface-200">
                        {getEmotionLabel(emotion as EmotionType)}
                      </span>
                      <Badge variant="default" size="sm">
                        {presets.length} 个效果
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      {presets.map(preset => (
                        <Card key={preset.id} className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-surface-200">
                              {preset.name}
                            </h4>
                            <Button variant="ghost" size="sm" isIconOnly>
                              <Eye className="w-4 h-4" />
                            </Button>
                          </div>
                          <p className="text-xs text-surface-500 mb-3">
                            {preset.description}
                          </p>
                          
                          {/* 预览区域 */}
                          <div 
                            className="h-20 bg-surface-900/50 rounded-lg flex items-center justify-center overflow-hidden cursor-pointer"
                            onClick={() => setPreviewKey(k => k + 1)}
                          >
                            <EmotionTextEffect
                              key={`${preset.id}-${previewKey}`}
                              text={getEmotionLabel(emotion as EmotionType)}
                              preset={preset.id}
                              scale={0.5}
                            />
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* 右侧情绪预设 */}
      <div className="w-80 p-6 bg-surface-900/50 overflow-y-auto">
        <h2 className="text-lg font-semibold text-surface-100 mb-4">
          情绪预设库
        </h2>

        <div className="space-y-4">
          {emotionPresets.map((preset) => {
            const Icon = preset.icon
            const colors = EMOTION_COLORS[preset.emotion]
            
            return (
              <Card key={preset.emotion} className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${preset.color}20` }}
                  >
                    <Icon className="w-5 h-5" style={{ color: preset.color }} />
                  </div>
                  <span
                    className="font-medium"
                    style={{ color: preset.color }}
                  >
                    {preset.label}
                  </span>
                </div>

                {/* 音效 */}
                <div className="mb-3">
                  <p className="text-xs text-surface-500 mb-1.5 flex items-center gap-1">
                    <Music className="w-3 h-3" />
                    音效
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {preset.soundEffects.map((effect) => (
                      <Badge key={effect} variant="outline" size="sm">
                        {effect}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* 视觉效果 */}
                <div className="mb-3">
                  <p className="text-xs text-surface-500 mb-1.5 flex items-center gap-1">
                    <Zap className="w-3 h-3" />
                    视觉效果
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {preset.visualEffects.map((effect) => (
                      <Badge key={effect} variant="outline" size="sm">
                        {effect}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* 文字特效数量 */}
                <div>
                  <p className="text-xs text-surface-500 mb-1.5 flex items-center gap-1">
                    <Wand2 className="w-3 h-3" />
                    花字特效
                  </p>
                  <Badge variant="default" size="sm">
                    {EMOTION_TEXT_PRESETS.filter(p => p.emotion === preset.emotion).length} 个样式
                  </Badge>
                </div>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
