'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutTemplate,
  Video,
  ImageIcon,
  Search,
  RefreshCw,
  AlertCircle,
  ArrowLeft,
  Layers,
  X,
  Home,
  ChevronRight,
  Star,
  Heart,
  Play,
  Download,
  Eye,
  Sparkles,
  Upload,
  Lightbulb,
  Wand2,
  RotateCcw,
  Bookmark,
} from 'lucide-react'
import { Button, Card, Badge, Spinner, Input } from '@/components/ui'
import { TemplateTypeSidebar, TEMPLATE_TYPE_CONFIG, type TemplateType } from '@/components/template-type-sidebar'
import { SubcategoryTags, type ExtraDimension } from '@/components/subcategory-tags'
import { FANCY_TEXT_USAGE_ICONS, DIMENSION_ICONS, DIMENSION_COLORS } from '@/lib/icons'
import { FancyTextRenderer, FancyTextPreviewCard } from '@/components/fancy-text-renderer'
import {
  FANCY_TEXT_TEMPLATE_PRESETS,
  USAGE_LABELS,
  VISUAL_STYLE_PRESETS,
} from '@/lib/fancy-text/presets'
import type { FancyTextTemplate, FancyTextUsage, ColorValue } from '@/lib/fancy-text/types'
import { loadPresets, getPreset, type PresetRegistryItem } from '@/lib/fancy-text-presets/registry'
import { convertPresetToTemplate } from '@/lib/fancy-text-presets/converter'
import { addFavorite, removeFavorite, batchCheckFavorites } from '@/lib/api/favorites'

// ============================================
// 类型定义
// ============================================

// 模版来源
type TemplateSource = 'all' | 'system' | 'user' | 'favorite' | 'ai' | 'creative'

// 模版来源配置
const SOURCE_TABS: Array<{ id: TemplateSource; name: string; icon: typeof Layers; showFor?: TemplateType[] }> = [
  { id: 'all', name: '全部', icon: Layers },
  { id: 'system', name: '系统模版', icon: Star },
  { id: 'user', name: '我的模版', icon: Upload },
  { id: 'favorite', name: '我的收藏', icon: Bookmark },
  { id: 'ai', name: 'AI模版', icon: Wand2, showFor: ['VIDEO', 'IMAGE'] },
  { id: 'creative', name: '我的想法', icon: Lightbulb, showFor: ['FANCY_TEXT'] },
]


// ============================================
// 工具函数
// ============================================

function formatNumber(num: number): string {
  if (num >= 10000) return `${(num / 10000).toFixed(1)}w`
  if (num >= 1000) return `${(num / 1000).toFixed(1)}k`
  return String(num)
}

// ============================================
// 模版库页面
// ============================================

export default function TemplatesPage() {
  const router = useRouter()

  // 状态
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 动态加载的花字模版
  const [fancyTextTemplates, setFancyTextTemplates] = useState<FancyTextTemplate[]>([])
  const [presetRegistry, setPresetRegistry] = useState<PresetRegistryItem[]>([])

  // 视图状态
  const [typeFilter, setTypeFilter] = useState<TemplateType>('FANCY_TEXT')
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryTags, setCategoryTags] = useState<string[]>([])
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [templateSource, setTemplateSource] = useState<TemplateSource>('all')

  // 花字用途维度（仅花字模版时显示）
  const fancyTextUsageDimension: ExtraDimension = useMemo(() => ({
    id: 'FANCY_TEXT_USAGE',
    name: '用途',
    icon: DIMENSION_ICONS['FANCY_TEXT_USAGE'],
    color: DIMENSION_COLORS['FANCY_TEXT_USAGE'],
    tags: (Object.entries(USAGE_LABELS) as [FancyTextUsage, typeof USAGE_LABELS[FancyTextUsage]][]).map(([usage, config]) => {
      const iconConfig = FANCY_TEXT_USAGE_ICONS[usage]
      return {
        id: `usage:${usage}`,
        name: config.label,
        icon: iconConfig?.icon,
        iconColor: iconConfig?.color,
        count: fancyTextTemplates.filter((t: FancyTextTemplate) => t.usage === usage).length,
      }
    }),
  }), [fancyTextTemplates])

  // 类型计数
  const [typeCounts, setTypeCounts] = useState<Record<string, number>>({
    VIDEO: 3,
    IMAGE: 2,
    FANCY_TEXT: 0,
  })

  // 预览状态
  const [previewTemplate, setPreviewTemplate] = useState<FancyTextTemplate | null>(null)
  const [previewKey, setPreviewKey] = useState(0)
  const [previewText, setPreviewText] = useState('')
  const [previewColor, setPreviewColor] = useState<ColorValue | undefined>(undefined)
  const [isModalReady, setIsModalReady] = useState(false)

  // 更新预览状态时重置 modal ready 状态
  useEffect(() => {
    if (previewTemplate) {
      setPreviewText(previewTemplate.globalParams.text)
      setPreviewColor(previewTemplate.globalParams.color)
      setIsModalReady(false)
    }
  }, [previewTemplate])

  // 收藏状态
  const [favoriteMap, setFavoriteMap] = useState<Record<string, boolean>>({})

  // 获取当前类型配置
  const currentTypeConfig = TEMPLATE_TYPE_CONFIG.find((c) => c.type === typeFilter)

  // 从 categoryTags 中提取用途筛选
  const selectedUsages = useMemo(() => {
    return categoryTags
      .filter(tag => tag.startsWith('usage:'))
      .map(tag => tag.replace('usage:', '') as FancyTextUsage)
  }, [categoryTags])

  // 过滤后的花字模版
  const filteredFancyTextTemplates = useMemo(() => {
    let templates = fancyTextTemplates

    // 按用途筛选
    if (selectedUsages.length > 0) {
      templates = templates.filter((t: FancyTextTemplate) => t.usage && selectedUsages.includes(t.usage))
    }

    // 按搜索词筛选
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      templates = templates.filter(
        (t: FancyTextTemplate) =>
          t.name.toLowerCase().includes(query) ||
          t.description.toLowerCase().includes(query) ||
          t.visualStyles.some((s: string) => s.toLowerCase().includes(query))
      )
    }

    // 按收藏筛选
    if (templateSource === 'favorite') {
      templates = templates.filter((t: FancyTextTemplate) => favoriteMap[`TEMPLATE:${t.id}`])
    }

    return templates
  }, [fancyTextTemplates, selectedUsages, searchQuery, templateSource, favoriteMap])

  // 获取可用的 Source Tabs
  const availableSourceTabs = SOURCE_TABS.filter(
    tab => !tab.showFor || tab.showFor.includes(typeFilter)
  )

  // 加载花字预设
  useEffect(() => {
    const loadFancyTextPresets = async () => {
      setLoading(true)
      try {
        const registry = await loadPresets()
        setPresetRegistry(registry)

        // 加载每个预设并转换为模版
        const templates: FancyTextTemplate[] = []
        for (const item of registry) {
          const preset = await getPreset(item)
          if (preset) {
            templates.push(convertPresetToTemplate(preset))
          }
        }

        setFancyTextTemplates(templates)
        setTypeCounts(prev => ({ ...prev, FANCY_TEXT: templates.length }))
      } catch (err) {
        console.error('Failed to load fancy text presets:', err)
        setError('加载花字模版失败')
      } finally {
        setLoading(false)
      }
    }
    loadFancyTextPresets()
  }, [])

  // 初始化收藏状态
  useEffect(() => {
    if (fancyTextTemplates.length === 0) return
    const checkFavorites = async () => {
      const items = fancyTextTemplates.map((t: FancyTextTemplate) => ({
        targetId: t.id,
        targetType: 'TEMPLATE' as const,
      }))
      const result = await batchCheckFavorites(items)
      if (result.success && result.data) {
        setFavoriteMap(result.data.favoriteMap)
      }
    }
    checkFavorites()
  }, [fancyTextTemplates])

  // 切换收藏
  const toggleFavorite = async (templateId: string) => {
    const key = `TEMPLATE:${templateId}`
    const isFavorite = favoriteMap[key]

    if (isFavorite) {
      const result = await removeFavorite(templateId, 'TEMPLATE')
      if (result.success) {
        setFavoriteMap(prev => ({ ...prev, [key]: false }))
      }
    } else {
      const result = await addFavorite(templateId, 'TEMPLATE')
      if (result.success) {
        setFavoriteMap(prev => ({ ...prev, [key]: true }))
      }
    }
  }

  return (
    <div className="h-screen flex flex-col bg-surface-950">
      {/* 顶部导航栏 */}
      <header className="flex-shrink-0 bg-surface-900/80 backdrop-blur-xl border-b border-surface-800 z-40">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                isIconOnly
                onClick={() => router.push('/')}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>

              {/* 面包屑导航 */}
              <nav className="flex items-center gap-2 text-sm">
                <button
                  onClick={() => router.push('/')}
                  className="flex items-center gap-1.5 text-surface-400 hover:text-surface-200 transition-colors"
                >
                  <Home className="w-4 h-4" />
                  <span>首页</span>
                </button>
                <ChevronRight className="w-4 h-4 text-surface-600" />
                <span className="flex items-center gap-1.5 text-surface-200">
                  <LayoutTemplate className="w-4 h-4 text-rose-400" />
                  <span className="font-medium">模版库</span>
                </span>
                {typeFilter !== 'ALL' && currentTypeConfig && (
                  <>
                    <ChevronRight className="w-4 h-4 text-surface-600" />
                    <span className={`flex items-center gap-1.5 ${currentTypeConfig.color}`}>
                      <currentTypeConfig.icon className="w-4 h-4" />
                      <span className="font-medium">{currentTypeConfig.label}</span>
                    </span>
                  </>
                )}
              </nav>
            </div>

            <div className="flex items-center gap-3">
              {/* 搜索框 */}
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
                <input
                  type="text"
                  placeholder="搜索模版..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-9 pl-9 pr-4 bg-surface-800 border border-surface-700 rounded-lg text-sm text-surface-100 placeholder:text-surface-500 focus:outline-none focus:border-rose-400/50"
                />
              </div>

              <Button
                variant="ghost"
                size="sm"
                isIconOnly
                onClick={() => setLoading(true)}
                disabled={loading}
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* 主内容区 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 左侧侧边栏 - 模版大类 */}
        <TemplateTypeSidebar
          selectedType={typeFilter}
          onTypeChange={(type) => {
            setTypeFilter(type)
            setCategoryTags([])
            // 重置 source 如果当前 source 不可用
            if (type !== 'FANCY_TEXT' && templateSource === 'creative') {
              setTemplateSource('all')
            }
            if (type !== 'VIDEO' && type !== 'IMAGE' && templateSource === 'ai') {
              setTemplateSource('all')
            }
          }}
          counts={typeCounts}
          collapsed={sidebarCollapsed}
          onCollapsedChange={setSidebarCollapsed}
        />

        {/* 右侧内容区 */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* 工具栏 - 标签筛选 */}
          <div className="flex-shrink-0 px-4 py-3 bg-surface-900/30 border-b border-surface-800/50">
            <div className="flex items-center justify-between gap-4">
              {/* 二级分类标签（花字类型时显示用途维度） */}
              <div className="flex-1 min-w-0">
                <SubcategoryTags
                  selectedTags={categoryTags}
                  onTagsChange={setCategoryTags}
                  extraDimensions={typeFilter === 'FANCY_TEXT' ? [fancyTextUsageDimension] : []}
                />
              </div>
            </div>
          </div>

          {/* 模版来源页签 */}
          <div className="flex-shrink-0 bg-surface-900/50 border-b border-surface-800">
            <div className="flex items-center px-4">
              {availableSourceTabs.map((tab) => {
                const TabIcon = tab.icon
                const isActive = templateSource === tab.id
                return (
                  <button
                    key={tab.id}
                    onClick={() => setTemplateSource(tab.id)}
                    className={`
                      relative flex items-center gap-2 px-5 py-3 text-sm font-medium transition-all duration-200
                      ${isActive
                        ? 'text-rose-400'
                        : 'text-surface-400 hover:text-surface-200'
                      }
                    `}
                  >
                    <TabIcon className="w-4 h-4" />
                    <span>{tab.name}</span>
                    {/* 底部激活指示器 */}
                    {isActive && (
                      <motion.div
                        layoutId="template-source-tab-indicator"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-rose-400 rounded-t-full"
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      />
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* 内容区 */}
          <div className="flex-1 overflow-y-auto p-4">
            {/* 错误提示 */}
            {error && (
              <div className="flex items-center gap-2 p-4 mb-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                {error}
              </div>
            )}

            {/* 花字模版展示 */}
            {typeFilter === 'FANCY_TEXT' && templateSource !== 'creative' && (
              <div className="space-y-6">
                {/* 标题 */}
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-surface-100 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-pink-400" />
                    花字模版
                    <Badge variant="default" size="sm" className="bg-pink-500/20 text-pink-400 border-0">
                      {filteredFancyTextTemplates.length} 个
                    </Badge>
                  </h3>
                </div>

                {/* 模版网格 */}
                {filteredFancyTextTemplates.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-24 text-center">
                    <div className="w-24 h-24 rounded-3xl bg-pink-400/15 flex items-center justify-center mb-6">
                      <Sparkles className="w-12 h-12 text-pink-400" />
                    </div>
                    <h2 className="text-xl font-semibold text-surface-200 mb-2">
                      {templateSource === 'favorite' ? '暂无收藏的模版' : '没有找到匹配的模版'}
                    </h2>
                    <p className="text-surface-500">
                      {templateSource === 'favorite' ? '收藏你喜欢的模版，方便随时使用' : '尝试调整筛选条件或搜索词'}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {filteredFancyTextTemplates.map((template) => {
                      const isFavorite = favoriteMap[`TEMPLATE:${template.id}`]
                      const usageConfig = template.usage ? USAGE_LABELS[template.usage] : null

                      return (
                        <motion.div
                          key={template.id}
                          layout
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="relative group"
                        >
                          <FancyTextPreviewCard
                            template={template}
                            scale={0.35}
                            onClick={() => {
                              setPreviewTemplate(template)
                              setPreviewText(template.globalParams.text)
                              setPreviewColor(undefined) // 重置为默认颜色
                              setPreviewKey(k => k + 1)
                            }}
                          />

                          {/* 收藏按钮 */}
                          <button
                            className={`
                              absolute top-2 right-2 z-10 w-8 h-8 rounded-lg flex items-center justify-center transition-all
                              ${isFavorite
                                ? 'bg-rose-500 text-white'
                                : 'bg-black/50 text-white opacity-0 group-hover:opacity-100'
                              }
                            `}
                            onClick={(e) => {
                              e.stopPropagation()
                              toggleFavorite(template.id)
                            }}
                          >
                            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
                          </button>

                          {/* 用途标签 */}
                          {usageConfig && (
                            <div className="absolute top-2 left-2 z-10">
                              <Badge
                                variant="default"
                                size="sm"
                                className="bg-surface-900/80 text-surface-300 border-0 backdrop-blur-sm"
                              >
                                {usageConfig.icon} {usageConfig.label}
                              </Badge>
                            </div>
                          )}
                        </motion.div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}

            {/* 灵感创意 Tab */}
            {typeFilter === 'FANCY_TEXT' && templateSource === 'creative' && (
              <div className="space-y-6">
                <div className="text-center py-12">
                  <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center mx-auto mb-6">
                    <Lightbulb className="w-12 h-12 text-purple-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-surface-100 mb-3">我的想法</h2>
                  <p className="text-surface-400 max-w-md mx-auto mb-8">
                    通过选择字体风格、视觉风格、动画效果等参数，AI 将为你生成独特的花字模版
                  </p>
                  <Button
                    variant="primary"
                    size="lg"
                    leftIcon={<Wand2 className="w-5 h-5" />}
                    onClick={() => {
                      // TODO: 打开我的想法编辑器
                      alert('我的想法功能即将上线！')
                    }}
                  >
                    开始创作
                  </Button>
                </div>

                {/* 风格预览 */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {VISUAL_STYLE_PRESETS.slice(0, 8).map((style) => (
                    <Card
                      key={style.preset}
                      className="p-4 text-center hover:border-purple-500/50 cursor-pointer transition-all"
                      onClick={() => alert(`选择 ${style.label} 风格`)}
                    >
                      <span className="text-3xl">{style.emoji}</span>
                      <p className="text-sm font-medium text-surface-200 mt-2">{style.label}</p>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* AI 模版 Tab */}
            {(typeFilter === 'VIDEO' || typeFilter === 'IMAGE') && templateSource === 'ai' && (
              <div className="text-center py-12">
                <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center mx-auto mb-6">
                  <Wand2 className="w-12 h-12 text-cyan-400" />
                </div>
                <h2 className="text-2xl font-bold text-surface-100 mb-3">AI 生成模版</h2>
                <p className="text-surface-400 max-w-md mx-auto mb-8">
                  上传参考图片或视频，输入提示词，AI 将为你生成专属的{typeFilter === 'VIDEO' ? '视频' : '图片'}模版
                </p>
                <Button
                  variant="primary"
                  size="lg"
                  leftIcon={<Wand2 className="w-5 h-5" />}
                  onClick={() => alert('AI 生成功能即将上线！')}
                >
                  开始生成
                </Button>
              </div>
            )}

            {/* 其他类型的占位 */}
            {(typeFilter === 'VIDEO' || typeFilter === 'IMAGE' || typeFilter === 'ALL') && templateSource !== 'ai' && (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className={`w-24 h-24 rounded-3xl ${currentTypeConfig?.bgColor || 'bg-surface-800'} flex items-center justify-center mb-6`}>
                  {currentTypeConfig ? (
                    <currentTypeConfig.icon className={`w-12 h-12 ${currentTypeConfig.color}`} />
                  ) : (
                    <LayoutTemplate className="w-12 h-12 text-surface-600" />
                  )}
                </div>
                <h2 className="text-xl font-semibold text-surface-200 mb-2">
                  {templateSource === 'user' ? '暂无我的模版' : '敬请期待'}
                </h2>
                <p className="text-surface-500">
                  {typeFilter === 'VIDEO' ? '视频模版' : typeFilter === 'IMAGE' ? '图片模版' : '更多模版'}功能即将上线
                </p>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* 模版预览弹窗 */}
      <AnimatePresence>
        {previewTemplate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setPreviewTemplate(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-5xl bg-surface-900 rounded-2xl overflow-hidden border border-surface-700 flex flex-col md:flex-row"
              style={{ height: 'min(600px, 85vh)' }}
              onClick={(e) => e.stopPropagation()}
              onAnimationComplete={() => setIsModalReady(true)}
            >
              {/* 左侧预览区域 */}
              <div
                className="flex-1 relative bg-black/50 overflow-hidden flex items-center justify-center min-h-[300px]"
                style={{
                  background: `
                    radial-gradient(ellipse at center, ${(previewColor?.type === 'solid' ? previewColor.value : previewTemplate.globalParams.color.type === 'solid' ? previewTemplate.globalParams.color.value : '#FFD700') + '15'
                    } 0%, transparent 70%), 
                    linear-gradient(180deg, #1a1a2e 0%, #0d0d15 100%)
                  `,
                }}
              >
                {/* 网格背景 */}
                <div
                  className="absolute inset-0 opacity-15"
                  style={{
                    backgroundImage: `
                      linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
                      linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
                    `,
                    backgroundSize: '40px 40px',
                  }}
                />

                {/* 花字渲染 */}
                <div className="relative z-10 w-full px-8 flex justify-center">
                  <FancyTextRenderer
                    key={previewKey}
                    template={previewTemplate}
                    text={previewText || undefined}
                    color={previewColor}
                    scale={previewTemplate.renderer === 'canvas' ? 0.45 : 1}
                    autoPlay={isModalReady}
                    showDecorations={true}
                  />
                </div>
              </div>

              {/* 右侧控制面板 */}
              <div className="w-full md:w-80 bg-surface-900 border-t md:border-t-0 md:border-l border-surface-800 flex flex-col">
                {/* 顶部标题栏 */}
                <div className="px-5 py-4 border-b border-surface-800 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-pink-500/20 flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-pink-400" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-surface-100">{previewTemplate.name}</h3>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    isIconOnly
                    className="h-7 w-7 -mr-1"
                    onClick={() => setPreviewTemplate(null)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                {/* 控制区域 */}
                <div className="flex-1 overflow-y-auto p-5 space-y-6">
                  {/* 文本输入 */}
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-surface-400 uppercase tracking-wider">
                      文字内容
                    </label>
                    <Input
                      value={previewText}
                      onChange={(e) => setPreviewText(e.target.value)}
                      placeholder="输入文字..."
                      className="bg-surface-800/50 border-surface-700 focus:border-pink-500/50"
                    />
                  </div>

                  {/* 颜色选择 */}
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-surface-400 uppercase tracking-wider">
                      颜色
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        '#FFD700', '#FF4500', '#FF69B4', '#00FFFF', '#FFFFFF',
                        '#FF0000', '#9B59B6', '#4ECDC4', '#FFE135', '#00FF00',
                      ].map((c) => (
                        <button
                          key={c}
                          onClick={() => setPreviewColor({ type: 'solid', value: c })}
                          className={`
                             w-7 h-7 rounded-full border-2 transition-all
                             ${previewColor?.value === c ? 'border-white scale-110 shadow-lg' : 'border-transparent hover:scale-105 hover:border-white/30'}
                           `}
                          style={{ background: c }}
                        />
                      ))}
                      {/* 自定义颜色 */}
                      <div className="relative w-7 h-7 rounded-full overflow-hidden border-2 border-dashed border-surface-600 flex items-center justify-center cursor-pointer hover:border-surface-400">
                        <div className="w-full h-full bg-gradient-conic from-red-500 via-green-500 via-blue-500 to-red-500"
                          style={{ background: 'conic-gradient(red, yellow, lime, aqua, blue, magenta, red)' }} />
                        <input
                          type="color"
                          className="absolute inset-0 opacity-0 cursor-pointer"
                          onChange={(e) => setPreviewColor({ type: 'solid', value: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>

                  {/* 收藏按钮 */}
                  <button
                    onClick={() => toggleFavorite(previewTemplate.id)}
                    className="flex items-center gap-2 text-xs text-surface-400 hover:text-rose-400 transition-colors"
                  >
                    <Heart className={`w-3.5 h-3.5 ${favoriteMap[`TEMPLATE:${previewTemplate.id}`] ? 'fill-current text-rose-400' : ''}`} />
                    {favoriteMap[`TEMPLATE:${previewTemplate.id}`] ? '已收藏' : '收藏模版'}
                  </button>
                </div>

                {/* 底部操作栏 */}
                <div className="p-5 border-t border-surface-800 space-y-2.5">
                  <Button
                    variant="ghost"
                    size="md"
                    className="w-full border border-surface-700 hover:bg-surface-800 flex items-center justify-center gap-2"
                    onClick={() => setPreviewKey(k => k + 1)}
                  >
                    <RotateCcw className="w-4 h-4 flex-shrink-0" />
                    <span>预览一下</span>
                  </Button>
                  <Button
                    variant="primary"
                    size="md"
                    className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 border-0 flex items-center justify-center gap-2"
                    onClick={() => alert('保存素材功能开发中...')}
                  >
                    <Download className="w-4 h-4 flex-shrink-0" />
                    <span>保存为素材</span>
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
