'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Heart,
  Sparkles,
  ChevronRight,
  Play,
  Volume2,
  Smile,
  Frown,
  Meh,
  Zap,
  Music,
  AlertTriangle,
  PartyPopper,
  CloudRain,
} from 'lucide-react'
import { Button, Card, Badge, Slider, Switch } from '@/components/ui'
import { useEditor } from '../layout'

// ============================================
// 类型定义
// ============================================

interface EmotionPoint {
  id: string
  time: number
  emotion: 'happy' | 'sad' | 'excited' | 'calm' | 'tense' | 'neutral'
  intensity: number
  suggestion: string
  effects: string[]
}

interface EmotionPreset {
  emotion: 'happy' | 'sad' | 'excited' | 'calm' | 'tense' | 'neutral'
  label: string
  icon: React.ElementType
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
    emotion: 'tense',
    label: '紧张',
    icon: AlertTriangle,
    color: '#ef4444',
    soundEffects: ['心跳声', '低频嗡鸣', '时钟滴答'],
    visualEffects: ['闪烁', '暗角', '抖动'],
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
    emotion: 'calm',
    label: '平静',
    icon: CloudRain,
    color: '#8b5cf6',
    soundEffects: ['自然白噪音', '风声', '流水声'],
    visualEffects: ['柔光', '渐变', '慢放'],
  },
  {
    emotion: 'neutral',
    label: '中性',
    icon: Meh,
    color: '#71717a',
    soundEffects: ['无'],
    visualEffects: ['无'],
  },
]

const mockEmotionPoints: EmotionPoint[] = [
  {
    id: '1',
    time: 5,
    emotion: 'happy',
    intensity: 80,
    suggestion: '开场欢迎，情绪积极',
    effects: ['欢呼声', '星星动效'],
  },
  {
    id: '2',
    time: 25,
    emotion: 'excited',
    intensity: 95,
    suggestion: '高潮片段，需要强化兴奋感',
    effects: ['震撼鼓点', '闪光效果'],
  },
  {
    id: '3',
    time: 40,
    emotion: 'tense',
    intensity: 70,
    suggestion: '悬念铺垫，制造紧张氛围',
    effects: ['心跳声', '暗角效果'],
  },
  {
    id: '4',
    time: 55,
    emotion: 'happy',
    intensity: 90,
    suggestion: '揭晓答案，释放情绪',
    effects: ['掌声', '彩带'],
  },
]

// ============================================
// 情绪增强页面
// ============================================

export default function EmotionPage() {
  const { goToNextStep } = useEditor()
  const [emotionPoints, setEmotionPoints] = useState<EmotionPoint[]>(mockEmotionPoints)
  const [selectedPoint, setSelectedPoint] = useState<EmotionPoint | null>(null)
  const [autoEnhance, setAutoEnhance] = useState(true)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [visualEnabled, setVisualEnabled] = useState(true)
  const [globalIntensity, setGlobalIntensity] = useState(75)

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${String(secs).padStart(2, '0')}`
  }

  const getPresetByEmotion = (emotion: EmotionPoint['emotion']) =>
    emotionPresets.find((p) => p.emotion === emotion)!

  const updatePointIntensity = (id: string, intensity: number) => {
    setEmotionPoints((prev) =>
      prev.map((p) => (p.id === id ? { ...p, intensity } : p))
    )
  }

  return (
    <div className="h-full flex overflow-hidden">
      {/* 左侧情绪时间线 */}
      <div className="flex-1 flex flex-col p-6 overflow-hidden border-r border-surface-800">
        {/* 页面标题 */}
        <div className="mb-6">
          <h1 className="text-2xl font-display font-bold text-surface-100 mb-2">
            情绪增强
          </h1>
          <p className="text-surface-400">
            AI 识别视频情绪节点，添加音效和视觉效果增强感染力
          </p>
        </div>

        {/* 全局控制 */}
        <Card className="p-4 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <span className="font-medium text-surface-100">AI 自动情绪增强</span>
            </div>
            <Switch checked={autoEnhance} onCheckedChange={setAutoEnhance} />
          </div>
          <div className="grid grid-cols-2 gap-4">
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

        {/* 情绪节点列表 */}
        <div className="flex-1 overflow-y-auto space-y-3">
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
                      </div>
                      <p className="text-sm text-surface-200 mb-2">
                        {point.suggestion}
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {point.effects.map((effect) => (
                          <Badge key={effect} variant="secondary" size="sm">
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

                  {/* 强度滑块 */}
                  {selectedPoint?.id === point.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-4 pt-4 border-t border-surface-700"
                    >
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-surface-400">情绪强度</span>
                        <span className="text-amber-400">{point.intensity}%</span>
                      </div>
                      <Slider
                        value={[point.intensity]}
                        onValueChange={(v) => updatePointIntensity(point.id, v[0])}
                        max={100}
                      />
                    </motion.div>
                  )}
                </Card>
              </motion.div>
            )
          })}
        </div>

        {/* 下一步 */}
        <div className="mt-6 pt-6 border-t border-surface-800">
          <Button
            size="lg"
            fullWidth
            rightIcon={<ChevronRight className="w-5 h-5" />}
            onClick={goToNextStep}
          >
            确认情绪增强，继续下一步
          </Button>
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
                <div>
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
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}

