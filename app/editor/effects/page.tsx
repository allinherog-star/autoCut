'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  Zap,
  Type,
  Sparkles,
  ChevronRight,
  Play,
  Pause,
  Check,
  Star,
  Layers,
  Wand2,
} from 'lucide-react'
import { Button, Card, Badge, Tabs, TabsList, TabsTrigger, Switch } from '@/components/ui'
import { useEditor } from '../layout'

// ============================================
// 类型定义
// ============================================

interface EffectPreset {
  id: string
  name: string
  category: 'title' | 'subtitle' | 'transition' | 'filter'
  thumbnailUrl: string
  isPopular: boolean
  isPremium: boolean
}

// ============================================
// 模拟数据
// ============================================

const titleEffects: EffectPreset[] = [
  { id: 't1', name: '弹跳入场', category: 'title', thumbnailUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&h=120&fit=crop', isPopular: true, isPremium: false },
  { id: 't2', name: '文字打字机', category: 'title', thumbnailUrl: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=200&h=120&fit=crop', isPopular: true, isPremium: false },
  { id: 't3', name: '霓虹闪烁', category: 'title', thumbnailUrl: 'https://images.unsplash.com/photo-1550684376-efcbd6e3f031?w=200&h=120&fit=crop', isPopular: false, isPremium: true },
  { id: 't4', name: '故障效果', category: 'title', thumbnailUrl: 'https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?w=200&h=120&fit=crop', isPopular: true, isPremium: false },
  { id: 't5', name: '3D旋转', category: 'title', thumbnailUrl: 'https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?w=200&h=120&fit=crop', isPopular: false, isPremium: true },
  { id: 't6', name: '渐变发光', category: 'title', thumbnailUrl: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=200&h=120&fit=crop', isPopular: true, isPremium: false },
]

const subtitleEffects: EffectPreset[] = [
  { id: 's1', name: '逐字高亮', category: 'subtitle', thumbnailUrl: 'https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=200&h=120&fit=crop', isPopular: true, isPremium: false },
  { id: 's2', name: '波浪动效', category: 'subtitle', thumbnailUrl: 'https://images.unsplash.com/photo-1557682224-5b8590cd9ec5?w=200&h=120&fit=crop', isPopular: false, isPremium: false },
  { id: 's3', name: '关键词弹出', category: 'subtitle', thumbnailUrl: 'https://images.unsplash.com/photo-1557682260-96773eb01377?w=200&h=120&fit=crop', isPopular: true, isPremium: false },
  { id: 's4', name: '气泡对话', category: 'subtitle', thumbnailUrl: 'https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?w=200&h=120&fit=crop', isPopular: false, isPremium: true },
]

const transitionEffects: EffectPreset[] = [
  { id: 'tr1', name: '渐隐渐显', category: 'transition', thumbnailUrl: 'https://images.unsplash.com/photo-1618556450991-2f1af64e8191?w=200&h=120&fit=crop', isPopular: true, isPremium: false },
  { id: 'tr2', name: '滑动切换', category: 'transition', thumbnailUrl: 'https://images.unsplash.com/photo-1620121692029-d088224ddc74?w=200&h=120&fit=crop', isPopular: true, isPremium: false },
  { id: 'tr3', name: '缩放转场', category: 'transition', thumbnailUrl: 'https://images.unsplash.com/photo-1620503374956-c942862f0372?w=200&h=120&fit=crop', isPopular: false, isPremium: false },
  { id: 'tr4', name: '闪白过渡', category: 'transition', thumbnailUrl: 'https://images.unsplash.com/photo-1614729939124-032d1e6c9945?w=200&h=120&fit=crop', isPopular: true, isPremium: false },
  { id: 'tr5', name: '画中画', category: 'transition', thumbnailUrl: 'https://images.unsplash.com/photo-1614851099511-773084f6911d?w=200&h=120&fit=crop', isPopular: false, isPremium: true },
]

const filterEffects: EffectPreset[] = [
  { id: 'f1', name: '电影感', category: 'filter', thumbnailUrl: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=200&h=120&fit=crop', isPopular: true, isPremium: false },
  { id: 'f2', name: '复古胶片', category: 'filter', thumbnailUrl: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=200&h=120&fit=crop', isPopular: true, isPremium: false },
  { id: 'f3', name: '清新日系', category: 'filter', thumbnailUrl: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=200&h=120&fit=crop', isPopular: false, isPremium: false },
  { id: 'f4', name: '高对比度', category: 'filter', thumbnailUrl: 'https://images.unsplash.com/photo-1518893494013-4ce5d2350337?w=200&h=120&fit=crop', isPopular: false, isPremium: false },
]

// ============================================
// 特效渲染页面
// ============================================

export default function EffectsPage() {
  const { goToNextStep, markStepCompleted, currentStep, setBottomBar, hideBottomBar } = useEditor()
  const [activeTab, setActiveTab] = useState('title')
  const [selectedEffects, setSelectedEffects] = useState<Record<string, string>>({
    title: 't1',
    subtitle: 's1',
    transition: 'tr1',
    filter: 'f1',
  })
  const [autoApply, setAutoApply] = useState(true)
  const [previewPlaying, setPreviewPlaying] = useState(false)

  // 计算已选择的特效数量
  const selectedCount = Object.values(selectedEffects).filter(Boolean).length

  // 确认特效并进入下一步
  const handleConfirmEffects = useCallback(() => {
    markStepCompleted(currentStep)
    goToNextStep()
  }, [markStepCompleted, currentStep, goToNextStep])

  // 更新底部操作栏
  useEffect(() => {
    setBottomBar({
      show: true,
      icon: <Sparkles className="w-5 h-5 text-amber-400" />,
      title: `已选择 ${selectedCount} 种特效`,
      description: '标题动画 · 字幕动效 · 转场特效 · 滤镜效果',
      primaryButton: {
        text: '应用特效，继续下一步',
        onClick: handleConfirmEffects,
      },
    })
  }, [selectedCount, setBottomBar, handleConfirmEffects])

  const getEffectsByTab = () => {
    switch (activeTab) {
      case 'title': return titleEffects
      case 'subtitle': return subtitleEffects
      case 'transition': return transitionEffects
      case 'filter': return filterEffects
      default: return []
    }
  }

  const selectEffect = (id: string) => {
    setSelectedEffects((prev) => ({
      ...prev,
      [activeTab]: id,
    }))
  }

  const effects = getEffectsByTab()

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
      {/* 页面标题 */}
      <div className="p-6 border-b border-surface-800">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold text-surface-100 mb-2">
              特效渲染
            </h1>
            <p className="text-surface-400">
              添加标题动画、字幕动效、转场特效和滤镜，让视频更吸睛
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-surface-400">AI 自动应用</span>
              <Switch checked={autoApply} onCheckedChange={setAutoApply} />
            </div>
            <Button
              variant="outline"
              leftIcon={previewPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              onClick={() => setPreviewPlaying(!previewPlaying)}
            >
              {previewPlaying ? '暂停预览' : '预览效果'}
            </Button>
          </div>
        </div>
      </div>

      {/* 标签切换 */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
        <div className="px-6 pt-4">
          <TabsList>
            <TabsTrigger value="title" className="flex items-center gap-2">
              <Type className="w-4 h-4" />
              标题动画
              {selectedEffects.title && (
                <Check className="w-3 h-3 text-success" />
              )}
            </TabsTrigger>
            <TabsTrigger value="subtitle" className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              字幕动效
              {selectedEffects.subtitle && (
                <Check className="w-3 h-3 text-success" />
              )}
            </TabsTrigger>
            <TabsTrigger value="transition" className="flex items-center gap-2">
              <Layers className="w-4 h-4" />
              转场特效
              {selectedEffects.transition && (
                <Check className="w-3 h-3 text-success" />
              )}
            </TabsTrigger>
            <TabsTrigger value="filter" className="flex items-center gap-2">
              <Wand2 className="w-4 h-4" />
              滤镜效果
              {selectedEffects.filter && (
                <Check className="w-3 h-3 text-success" />
              )}
            </TabsTrigger>
          </TabsList>
        </div>

        {/* 特效列表 */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {effects.map((effect, index) => (
              <motion.div
                key={effect.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card
                  isInteractive
                  isSelected={selectedEffects[activeTab] === effect.id}
                  className="overflow-hidden group"
                  onClick={() => selectEffect(effect.id)}
                >
                  {/* 缩略图 */}
                  <div className="relative aspect-video">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={effect.thumbnailUrl}
                      alt={effect.name}
                      className="w-full h-full object-cover"
                    />
                    {/* 播放按钮 */}
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                        <Play className="w-5 h-5 text-white" />
                      </div>
                    </div>
                    {/* 选中标记 */}
                    {selectedEffects[activeTab] === effect.id && (
                      <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-amber-400 flex items-center justify-center">
                        <Check className="w-4 h-4 text-surface-950" />
                      </div>
                    )}
                    {/* 标签 */}
                    <div className="absolute top-2 left-2 flex gap-1">
                      {effect.isPopular && (
                        <Badge variant="primary" size="sm">
                          <Star className="w-3 h-3" />
                          热门
                        </Badge>
                      )}
                      {effect.isPremium && (
                        <Badge
                          variant="outline"
                          size="sm"
                          className="border-amber-400/30 bg-gradient-to-r from-amber-400/20 to-fuchsia-500/20 text-amber-200"
                        >
                          <Sparkles className="w-3 h-3" />
                          高级
                        </Badge>
                      )}
                    </div>
                  </div>
                  {/* 名称 */}
                  <div className="p-3">
                    <p className="text-sm font-medium text-surface-100 text-center">
                      {effect.name}
                    </p>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </Tabs>
    </div>
  )
}

