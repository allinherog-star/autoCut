'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutTemplate,
  Video,
  ImageIcon,
  Search,
  Upload,
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
} from 'lucide-react'
import { Button, Card, Badge, Spinner, Progress } from '@/components/ui'
import { TemplateTypeSidebar, TEMPLATE_TYPE_CONFIG, type TemplateType } from '@/components/template-type-sidebar'
import { SubcategoryTags } from '@/components/subcategory-tags'

// ============================================
// 类型定义
// ============================================

type ViewMode = 'grid' | 'list'

// 模版来源
type TemplateSource = 'all' | 'system' | 'user'

// 模版来源配置
const SOURCE_TABS = [
  { id: 'all' as TemplateSource, name: '全部', icon: Layers },
  { id: 'system' as TemplateSource, name: '官方模版', icon: Star },
  { id: 'user' as TemplateSource, name: '我的模版', icon: Upload },
]

// 模版数据类型
interface Template {
  id: string
  name: string
  description: string
  type: TemplateType
  thumbnail: string
  previewUrl?: string
  duration?: number
  likes: number
  views: number
  downloads: number
  isSystem: boolean
  isFavorite: boolean
  createdAt: string
  tags: string[]
}

// ============================================
// 模拟数据
// ============================================

const MOCK_TEMPLATES: Template[] = [
  // 视频模版
  {
    id: 'v1',
    name: '抖音热门开场',
    description: '适合抖音短视频的炫酷开场效果，3秒抓住观众眼球',
    type: 'VIDEO',
    thumbnail: '/api/placeholder/400/225',
    duration: 3,
    likes: 2345,
    views: 45678,
    downloads: 1234,
    isSystem: true,
    isFavorite: false,
    createdAt: '2024-12-01',
    tags: ['抖音', '开场', '炫酷'],
  },
  {
    id: 'v2',
    name: 'Vlog 片头模版',
    description: '清新文艺风格的 Vlog 片头，展示标题和日期',
    type: 'VIDEO',
    thumbnail: '/api/placeholder/400/225',
    duration: 5,
    likes: 1892,
    views: 32145,
    downloads: 876,
    isSystem: true,
    isFavorite: true,
    createdAt: '2024-11-28',
    tags: ['Vlog', '文艺', '清新'],
  },
  {
    id: 'v3',
    name: '产品展示模版',
    description: '专业的产品展示模版，支持多角度展示',
    type: 'VIDEO',
    thumbnail: '/api/placeholder/400/225',
    duration: 15,
    likes: 987,
    views: 18234,
    downloads: 543,
    isSystem: true,
    isFavorite: false,
    createdAt: '2024-11-25',
    tags: ['产品', '电商', '展示'],
  },
  // 图片模版
  {
    id: 'i1',
    name: '小红书封面',
    description: '小红书爆款封面设计，多种文字布局',
    type: 'IMAGE',
    thumbnail: '/api/placeholder/400/500',
    likes: 3456,
    views: 67890,
    downloads: 2345,
    isSystem: true,
    isFavorite: true,
    createdAt: '2024-12-05',
    tags: ['小红书', '封面', '爆款'],
  },
  {
    id: 'i2',
    name: '朋友圈九宫格',
    description: '微信朋友圈九宫格拼图模版',
    type: 'IMAGE',
    thumbnail: '/api/placeholder/400/400',
    likes: 2134,
    views: 45321,
    downloads: 1567,
    isSystem: true,
    isFavorite: false,
    createdAt: '2024-11-30',
    tags: ['朋友圈', '九宫格', '拼图'],
  },
  // 花字模版
  {
    id: 'f1',
    name: '综艺弹幕花字',
    description: '仿综艺节目风格的弹幕花字效果',
    type: 'FANCY_TEXT',
    thumbnail: '/api/placeholder/400/225',
    duration: 2,
    likes: 4567,
    views: 89012,
    downloads: 3456,
    isSystem: true,
    isFavorite: true,
    createdAt: '2024-12-03',
    tags: ['综艺', '弹幕', '搞笑'],
  },
  {
    id: 'f2',
    name: '文艺引用花字',
    description: '适合引用名言、歌词的文艺花字',
    type: 'FANCY_TEXT',
    thumbnail: '/api/placeholder/400/225',
    duration: 3,
    likes: 2345,
    views: 34567,
    downloads: 1234,
    isSystem: true,
    isFavorite: false,
    createdAt: '2024-11-29',
    tags: ['文艺', '引用', '名言'],
  },
  // 花字模版（炫酷风格）
  {
    id: 'd1',
    name: '抖音热点炫字',
    description: '配合抖音热点话题的炫酷文字效果',
    type: 'FANCY_TEXT',
    thumbnail: '/api/placeholder/400/225',
    duration: 2,
    likes: 5678,
    views: 123456,
    downloads: 4567,
    isSystem: true,
    isFavorite: true,
    createdAt: '2024-12-06',
    tags: ['抖音', '热点', '炫酷'],
  },
  {
    id: 'd2',
    name: '霓虹发光炫字',
    description: '赛博朋克风格的霓虹发光文字',
    type: 'FANCY_TEXT',
    thumbnail: '/api/placeholder/400/225',
    duration: 3,
    likes: 3456,
    views: 67890,
    downloads: 2345,
    isSystem: true,
    isFavorite: false,
    createdAt: '2024-12-02',
    tags: ['霓虹', '赛博朋克', '发光'],
  },
]

// ============================================
// 工具函数
// ============================================

function formatNumber(num: number): string {
  if (num >= 10000) return `${(num / 10000).toFixed(1)}w`
  if (num >= 1000) return `${(num / 1000).toFixed(1)}k`
  return String(num)
}

function formatDuration(seconds: number | undefined): string {
  if (!seconds) return ''
  if (seconds < 60) return `${seconds}秒`
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return secs > 0 ? `${mins}分${secs}秒` : `${mins}分钟`
}

function getTemplateIcon(type: TemplateType) {
  switch (type) {
    case 'VIDEO':
      return Video
    case 'IMAGE':
      return ImageIcon
    case 'FANCY_TEXT':
      return Sparkles
    default:
      return LayoutTemplate
  }
}

// ============================================
// 模版库页面
// ============================================

export default function TemplatesPage() {
  const router = useRouter()

  // 状态
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 视图状态
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [typeFilter, setTypeFilter] = useState<TemplateType>('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryTags, setCategoryTags] = useState<string[]>([])
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [templateSource, setTemplateSource] = useState<TemplateSource>('all')

  // 类型计数
  const [typeCounts, setTypeCounts] = useState<Record<string, number>>({})

  // 预览状态
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null)

  // 获取当前类型配置
  const currentTypeConfig = TEMPLATE_TYPE_CONFIG.find((c) => c.type === typeFilter)

  // 加载模版列表（模拟）
  const loadTemplates = useCallback(async () => {
    setLoading(true)
    setError(null)

    // 模拟加载延迟
    await new Promise((resolve) => setTimeout(resolve, 500))

    // 根据筛选条件过滤
    let filtered = MOCK_TEMPLATES

    // 类型筛选
    if (typeFilter !== 'ALL') {
      filtered = filtered.filter((t) => t.type === typeFilter)
    }

    // 来源筛选
    if (templateSource === 'system') {
      filtered = filtered.filter((t) => t.isSystem)
    } else if (templateSource === 'user') {
      filtered = filtered.filter((t) => !t.isSystem)
    }

    // 搜索筛选
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (t) =>
          t.name.toLowerCase().includes(query) ||
          t.description.toLowerCase().includes(query) ||
          t.tags.some((tag) => tag.toLowerCase().includes(query))
      )
    }

    setTemplates(filtered)
    setLoading(false)
  }, [typeFilter, templateSource, searchQuery, categoryTags])

  // 计算类型计数
  const calculateCounts = useCallback(() => {
    const counts: Record<string, number> = {}
    
    TEMPLATE_TYPE_CONFIG.forEach((config) => {
      if (config.type === 'ALL') return
      counts[config.type] = MOCK_TEMPLATES.filter((t) => t.type === config.type).length
    })
    
    setTypeCounts(counts)
  }, [])

  // 初始加载
  useEffect(() => {
    loadTemplates()
    calculateCounts()
  }, [loadTemplates, calculateCounts])

  // 切换收藏
  const toggleFavorite = (id: string) => {
    setTemplates((prev) =>
      prev.map((t) => (t.id === id ? { ...t, isFavorite: !t.isFavorite } : t))
    )
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
                onClick={() => loadTemplates()}
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
            setCategoryTags([]) // 切换大类时清空细分分类
          }}
          counts={typeCounts}
          collapsed={sidebarCollapsed}
          onCollapsedChange={setSidebarCollapsed}
        />

        {/* 右侧内容区 */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* 工具栏 - 二级分类标签 */}
          <div className="flex-shrink-0 px-4 py-3 bg-surface-900/30 border-b border-surface-800/50">
            <div className="flex items-center justify-between gap-4">
              {/* 二级分类标签 */}
              <div className="flex-1 min-w-0">
                <SubcategoryTags
                  selectedTags={categoryTags}
                  onTagsChange={setCategoryTags}
                />
              </div>
            </div>
          </div>

          {/* 模版来源页签 */}
          <div className="flex-shrink-0 bg-surface-900/50 border-b border-surface-800">
            <div className="flex items-center px-4">
              {SOURCE_TABS.map((tab) => {
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

            {loading && templates.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24">
                <Spinner size="lg" />
                <p className="mt-4 text-surface-500">加载中...</p>
              </div>
            ) : templates.length === 0 ? (
              /* 空状态 */
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className={`w-24 h-24 rounded-3xl ${currentTypeConfig?.bgColor || 'bg-surface-800'} flex items-center justify-center mb-6`}>
                  {currentTypeConfig ? (
                    <currentTypeConfig.icon className={`w-12 h-12 ${currentTypeConfig.color}`} />
                  ) : (
                    <LayoutTemplate className="w-12 h-12 text-surface-600" />
                  )}
                </div>
                <h2 className="text-xl font-semibold text-surface-200 mb-2">
                  {templateSource === 'system' 
                    ? '暂无官方模版' 
                    : templateSource === 'user'
                    ? '暂无我的模版'
                    : typeFilter === 'ALL' 
                    ? '模版库为空' 
                    : `暂无${currentTypeConfig?.label}`}
                </h2>
                <p className="text-surface-500 mb-6">
                  {templateSource === 'user'
                    ? '创建你的第一个模版开始吧'
                    : '敬请期待更多精彩模版'}
                </p>
              </div>
            ) : (
              /* 网格视图 */
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {templates.map((template) => {
                  const Icon = getTemplateIcon(template.type)
                  const typeConfig = TEMPLATE_TYPE_CONFIG.find((c) => c.type === template.type)

                  return (
                    <motion.div
                      key={template.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="relative group rounded-xl overflow-hidden border border-surface-700 hover:border-rose-500/50 transition-all cursor-pointer bg-surface-800/50"
                      onClick={() => setPreviewTemplate(template)}
                    >
                      {/* 缩略图 */}
                      <div className="relative aspect-video bg-surface-800 overflow-hidden">
                        <div className={`w-full h-full flex items-center justify-center ${typeConfig?.bgColor || 'bg-surface-800'}`}>
                          <Icon className={`w-12 h-12 ${typeConfig?.color || 'text-surface-500'} opacity-50`} />
                        </div>

                        {/* 收藏按钮 */}
                        <button
                          className={`
                            absolute top-2 right-2 w-8 h-8 rounded-lg flex items-center justify-center transition-all
                            ${template.isFavorite
                              ? 'bg-rose-500 text-white'
                              : 'bg-black/50 text-white opacity-0 group-hover:opacity-100'
                            }
                          `}
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleFavorite(template.id)
                          }}
                        >
                          <Heart className={`w-4 h-4 ${template.isFavorite ? 'fill-current' : ''}`} />
                        </button>

                        {/* 类型标识 */}
                        <div className="absolute top-2 left-2">
                          <Badge
                            variant="default"
                            size="sm"
                            className={`${typeConfig?.bgColor} ${typeConfig?.color} border-0`}
                          >
                            <Icon className="w-3 h-3" />
                          </Badge>
                        </div>

                        {/* 时长 */}
                        {template.duration && (
                          <div className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/70 rounded text-xs text-white font-mono">
                            {formatDuration(template.duration)}
                          </div>
                        )}

                        {/* 悬浮预览按钮 */}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm"
                          >
                            <Play className="w-4 h-4 mr-1.5" />
                            预览
                          </Button>
                        </div>
                      </div>

                      {/* 信息 */}
                      <div className="p-3 bg-surface-850">
                        <p className="text-sm font-medium text-surface-200 truncate" title={template.name}>
                          {template.name}
                        </p>
                        <p className="text-xs text-surface-500 mt-1 line-clamp-1">{template.description}</p>
                        
                        {/* 统计数据 */}
                        <div className="flex items-center gap-3 mt-2 text-xs text-surface-500">
                          <span className="flex items-center gap-1">
                            <Heart className="w-3 h-3" />
                            {formatNumber(template.likes)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {formatNumber(template.views)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Download className="w-3 h-3" />
                            {formatNumber(template.downloads)}
                          </span>
                        </div>

                        {/* 标签 */}
                        <div className="flex flex-wrap gap-1 mt-2">
                          {template.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="px-1.5 py-0.5 text-[10px] bg-surface-700 text-surface-400 rounded"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
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
              className="relative w-full max-w-4xl bg-surface-900 rounded-2xl overflow-hidden border border-surface-700"
              onClick={(e) => e.stopPropagation()}
            >
              {/* 顶部工具栏 */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-surface-800">
                <div className="flex items-center gap-3">
                  {(() => {
                    const Icon = getTemplateIcon(previewTemplate.type)
                    const typeConfig = TEMPLATE_TYPE_CONFIG.find((c) => c.type === previewTemplate.type)
                    return (
                      <div 
                        className={`w-10 h-10 rounded-xl flex items-center justify-center ${typeConfig?.bgColor}`}
                      >
                        <Icon className={`w-5 h-5 ${typeConfig?.color}`} />
                      </div>
                    )
                  })()}
                  <div>
                    <h3 className="text-lg font-semibold text-surface-100">{previewTemplate.name}</h3>
                    <p className="text-sm text-surface-400">{previewTemplate.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleFavorite(previewTemplate.id)}
                  >
                    <Heart className={`w-4 h-4 mr-1.5 ${previewTemplate.isFavorite ? 'fill-rose-400 text-rose-400' : ''}`} />
                    {previewTemplate.isFavorite ? '已收藏' : '收藏'}
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                  >
                    <Download className="w-4 h-4 mr-1.5" />
                    使用模版
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    isIconOnly
                    onClick={() => setPreviewTemplate(null)}
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              {/* 预览区域 */}
              <div 
                className="relative aspect-video flex items-center justify-center overflow-hidden bg-surface-950"
              >
                {(() => {
                  const Icon = getTemplateIcon(previewTemplate.type)
                  const typeConfig = TEMPLATE_TYPE_CONFIG.find((c) => c.type === previewTemplate.type)
                  return (
                    <div className="text-center">
                      <Icon className={`w-24 h-24 mx-auto ${typeConfig?.color} opacity-30`} />
                      <p className="mt-4 text-surface-500">模版预览区域</p>
                    </div>
                  )
                })()}
              </div>

              {/* 底部信息 */}
              <div className="px-6 py-4 border-t border-surface-800 bg-surface-850">
                <div className="grid grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-surface-500">类型</span>
                    <p className="text-surface-200 mt-0.5">
                      {TEMPLATE_TYPE_CONFIG.find((c) => c.type === previewTemplate.type)?.label}
                    </p>
                  </div>
                  <div>
                    <span className="text-surface-500">时长</span>
                    <p className="text-surface-200 mt-0.5">
                      {previewTemplate.duration ? formatDuration(previewTemplate.duration) : '-'}
                    </p>
                  </div>
                  <div>
                    <span className="text-surface-500">下载量</span>
                    <p className="text-surface-200 mt-0.5">{formatNumber(previewTemplate.downloads)}</p>
                  </div>
                  <div>
                    <span className="text-surface-500">标签</span>
                    <p className="text-surface-200 mt-0.5">{previewTemplate.tags.join('、')}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

