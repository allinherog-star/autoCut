'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FolderOpen,
  Video,
  ImageIcon,
  Music,
  Search,
  Trash2,
  Upload,
  RefreshCw,
  Clock,
  HardDrive,
  Check,
  AlertCircle,
  ArrowLeft,
  Plus,
  Grid,
  List,
  MoreVertical,
  Edit2,
  Download,
  Scissors,
  Type,
  Sparkles,
  Smile,
  Wand2,
  LayoutTemplate,
  Volume2,
  Layers,
  Filter,
  X,
  Tag,
  Home,
  ChevronRight,
} from 'lucide-react'
import { Button, Card, Badge, Spinner, Progress } from '@/components/ui'
import { MediaPreviewModal } from '@/components/media-preview-modal'
import { MediaTypeSidebar, MEDIA_TYPE_CONFIG, type MediaTypeFilter } from '@/components/media-type-sidebar'
import { SubcategoryTags } from '@/components/subcategory-tags'
import { UserTagModal } from '@/components/user-tag-modal'
import {
  getMediaList,
  deleteMedia,
  uploadMedia,
  type Media,
  type MediaType,
  type MediaListResponse,
  type MediaSource,
} from '@/lib/api/media'
import { getAllCategories, type CategoryTag } from '@/lib/api/categories'
import { EMOTION_TEXT_PRESETS, presetToCSS, type EmotionTextStyle } from '@/lib/emotion-text-effects'
import { 
  STICKER_PRESETS, 
  STICKER_CATEGORY_CONFIG, 
  stickerToCSS, 
  STICKER_ANIMATIONS_CSS,
  type StickerCategory,
  type StickerPreset,
} from '@/lib/sticker-presets'

// ============================================
// 类型定义
// ============================================

type ViewMode = 'grid' | 'list'

// 素材库来源配置
const SOURCE_TABS = [
  { id: 'all' as MediaSource, name: '全部', icon: Layers },
  { id: 'system' as MediaSource, name: '系统素材', icon: FolderOpen },
  { id: 'user' as MediaSource, name: '我的素材', icon: Upload },
]

interface UploadingFile {
  id: string
  file: File
  name: string
  progress: number
  error?: string
}

// ============================================
// 工具函数
// ============================================

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
}

function formatDuration(seconds: number | null): string {
  if (!seconds) return ''
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${String(secs).padStart(2, '0')}`
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function getMediaIcon(type: Media['type']) {
  switch (type) {
    case 'VIDEO':
      return Video
    case 'IMAGE':
      return ImageIcon
    case 'AUDIO':
      return Music
    case 'SOUND_EFFECT':
      return Volume2
    case 'FANCY_TEXT':
      return Type
    case 'FONT':
      return Type
    case 'STICKER':
      return Smile
    case 'EFFECT':
      return Sparkles
    case 'TRANSITION':
      return Layers
    case 'TEMPLATE':
      return LayoutTemplate
    default:
      return FolderOpen
  }
}

function getMediaTypeName(type: Media['type']): string {
  switch (type) {
    case 'VIDEO':
      return '视频'
    case 'IMAGE':
      return '图片'
    case 'AUDIO':
      return '音乐'
    case 'SOUND_EFFECT':
      return '音效'
    case 'FANCY_TEXT':
      return '花字'
    case 'FONT':
      return '字体'
    case 'STICKER':
      return '表情'
    case 'EFFECT':
      return '特效'
    case 'TRANSITION':
      return '转场'
    case 'TEMPLATE':
      return '模版'
    default:
      return '未知'
  }
}

// ============================================
// 素材库页面
// ============================================

export default function LibraryPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 状态
  const [mediaList, setMediaList] = useState<Media[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState<MediaListResponse['pagination'] | null>(null)

  // 视图状态
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [typeFilter, setTypeFilter] = useState<MediaTypeFilter>('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryTags, setCategoryTags] = useState<string[]>([])
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mediaSource, setMediaSource] = useState<MediaSource>('all')

  // 类型计数
  const [typeCounts, setTypeCounts] = useState<Record<string, number>>({})

  // 上传状态
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([])
  const [isDragging, setIsDragging] = useState(false)

  // 选择状态
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  // 删除确认状态
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  // 预览状态
  const [previewMedia, setPreviewMedia] = useState<Media | null>(null)

  // 用户标签管理
  const [showTagModal, setShowTagModal] = useState(false)
  const [userTags, setUserTags] = useState<CategoryTag[]>([])

  // 获取当前类型配置
  const currentTypeConfig = MEDIA_TYPE_CONFIG.find((c) => c.type === typeFilter)

  // 加载素材列表
  const loadMedia = useCallback(
    async (page: number = 1) => {
      setLoading(true)
      setError(null)

      const response = await getMediaList({
        page,
        limit: 24,
        type: typeFilter === 'ALL' ? undefined : typeFilter,
        search: searchQuery || undefined,
        categories: categoryTags.length > 0 ? categoryTags : undefined,
        source: mediaSource,
      })

      if (response.success && response.data) {
        setMediaList(response.data.items)
        setPagination(response.data.pagination)
      } else {
        setError(response.error || '加载失败')
      }

      setLoading(false)
    },
    [typeFilter, searchQuery, categoryTags, mediaSource]
  )

  // 加载类型计数
  const loadTypeCounts = useCallback(async () => {
    // 获取所有类型的计数
    const counts: Record<string, number> = {}
    
    // 并行获取各类型的数量
    const types: MediaType[] = ['VIDEO', 'IMAGE', 'AUDIO', 'SOUND_EFFECT', 'FANCY_TEXT', 'FONT', 'STICKER', 'EFFECT', 'TRANSITION', 'TEMPLATE']
    
    await Promise.all(
      types.map(async (type) => {
        const response = await getMediaList({ type, limit: 1, source: mediaSource })
        if (response.success && response.data) {
          counts[type] = response.data.pagination.total
        }
      })
    )
    
    // 花字类型特殊处理：系统素材来源于代码预设
    if (mediaSource === 'system' || mediaSource === 'all') {
      const dbCount = counts['FANCY_TEXT'] || 0
      counts['FANCY_TEXT'] = mediaSource === 'system' 
        ? EMOTION_TEXT_PRESETS.length 
        : dbCount + EMOTION_TEXT_PRESETS.length
    }
    
    // 表情类型特殊处理：系统素材来源于代码预设
    if (mediaSource === 'system' || mediaSource === 'all') {
      const dbCount = counts['STICKER'] || 0
      counts['STICKER'] = mediaSource === 'system' 
        ? STICKER_PRESETS.length 
        : dbCount + STICKER_PRESETS.length
    }
    
    setTypeCounts(counts)
  }, [mediaSource])

  // 加载用户自定义标签
  const loadUserTags = useCallback(async () => {
    const response = await getAllCategories()
    if (response.success && response.data) {
      const allTags = response.data.dimensions.flatMap((d) => d.tags)
      setUserTags(allTags.filter((t) => !t.isSystem))
    }
  }, [])

  // 初始加载
  useEffect(() => {
    loadMedia()
  }, [loadMedia])

  // 加载计数
  useEffect(() => {
    loadTypeCounts()
  }, [loadTypeCounts])

  // 加载用户标签
  useEffect(() => {
    loadUserTags()
  }, [loadUserTags])

  // 上传文件
  const handleUpload = async (files: FileList | null) => {
    if (!files) return

    const newUploads: UploadingFile[] = Array.from(files).map((file, index) => ({
      id: `upload-${Date.now()}-${index}`,
      file,
      name: file.name,
      progress: 0,
    }))

    setUploadingFiles((prev) => [...prev, ...newUploads])

    for (const upload of newUploads) {
      const response = await uploadMedia(upload.file, (progress) => {
        setUploadingFiles((prev) =>
          prev.map((u) => (u.id === upload.id ? { ...u, progress } : u))
        )
      })

      if (response.success) {
        setUploadingFiles((prev) => prev.filter((u) => u.id !== upload.id))
        loadMedia() // 刷新列表
        loadTypeCounts() // 刷新计数
      } else {
        setUploadingFiles((prev) =>
          prev.map((u) =>
            u.id === upload.id ? { ...u, error: response.error || '上传失败' } : u
          )
        )
      }
    }
  }

  // 删除素材
  const handleDelete = async (id: string) => {
    setDeleting(true)
    const response = await deleteMedia(id)

    if (response.success) {
      setMediaList((prev) => prev.filter((m) => m.id !== id))
      setSelectedIds((prev) => prev.filter((i) => i !== id))
      setDeleteId(null)
      loadTypeCounts() // 刷新计数
    } else {
      setError(response.error || '删除失败')
    }

    setDeleting(false)
  }

  // 批量删除
  const handleBatchDelete = async () => {
    for (const id of selectedIds) {
      await deleteMedia(id)
    }
    setSelectedIds([])
    loadMedia()
    loadTypeCounts()
  }

  // 拖拽处理
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    handleUpload(e.dataTransfer.files)
  }

  // 选择切换
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  // 统计信息
  const stats = {
    total: pagination?.total || 0,
    videos: mediaList.filter((m) => m.type === 'VIDEO').length,
    images: mediaList.filter((m) => m.type === 'IMAGE').length,
    audio: mediaList.filter((m) => m.type === 'AUDIO').length,
  }

  return (
    <div
      className="h-screen flex flex-col bg-surface-950"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* 拖拽上传遮罩 */}
      <AnimatePresence>
        {isDragging && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-surface-950/90 flex items-center justify-center"
          >
            <div className="text-center">
              <div className="w-24 h-24 rounded-3xl bg-amber-400/20 flex items-center justify-center mx-auto mb-6">
                <Upload className="w-12 h-12 text-amber-400" />
              </div>
              <h2 className="text-2xl font-semibold text-surface-100 mb-2">松开上传文件</h2>
              <p className="text-surface-400">支持视频、图片、音频文件</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
                  <FolderOpen className="w-4 h-4 text-amber-400" />
                  <span className="font-medium">素材库</span>
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
                  placeholder="搜索素材..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-9 pl-9 pr-4 bg-surface-800 border border-surface-700 rounded-lg text-sm text-surface-100 placeholder:text-surface-500 focus:outline-none focus:border-amber-400/50"
                />
              </div>

              <Button
                variant="ghost"
                size="sm"
                isIconOnly
                onClick={() => {
                  loadMedia()
                  loadTypeCounts()
                }}
                disabled={loading}
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*,image/*,audio/*"
                multiple
                className="hidden"
                onChange={(e) => handleUpload(e.target.files)}
              />
              {/* 只有"我的素材"才显示上传按钮 */}
              {mediaSource === 'user' && (
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<Upload className="w-4 h-4" />}
                  onClick={() => fileInputRef.current?.click()}
                >
                  上传素材
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* 主内容区 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 左侧侧边栏 - 素材大类 */}
        <MediaTypeSidebar
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
          {/* 工具栏 - 二级分类标签（在上面） */}
          <div className="flex-shrink-0 px-4 py-3 bg-surface-900/30 border-b border-surface-800/50">
            <div className="flex items-center justify-between gap-4">
              {/* 二级分类标签 */}
              <div className="flex-1 min-w-0">
                <SubcategoryTags
                  selectedTags={categoryTags}
                  onTagsChange={setCategoryTags}
                />
              </div>

{/* 管理标签按钮暂时隐藏
              <button
                onClick={() => setShowTagModal(true)}
                className="flex-shrink-0 flex items-center gap-2 px-3 py-1.5 text-sm text-surface-400 hover:text-surface-200 hover:bg-surface-800 rounded-lg transition-colors"
              >
                <Tag className="w-4 h-4" />
                <span>管理标签</span>
                {userTags.length > 0 && (
                  <span className="px-1.5 py-0.5 text-xs bg-surface-700 rounded-full">
                    {userTags.length}
                  </span>
                )}
              </button>
              */}
            </div>
          </div>

          {/* 素材来源页签 - Tab 样式（在下面） */}
          <div className="flex-shrink-0 bg-surface-900/50 border-b border-surface-800">
            <div className="flex items-center px-4">
              {SOURCE_TABS.map((tab) => {
                const TabIcon = tab.icon
                const isActive = mediaSource === tab.id
                return (
                  <button
                    key={tab.id}
                    onClick={() => setMediaSource(tab.id)}
                    className={`
                      relative flex items-center gap-2 px-5 py-3 text-sm font-medium transition-all duration-200
                      ${isActive 
                        ? 'text-amber-400' 
                        : 'text-surface-400 hover:text-surface-200'
                      }
                    `}
                  >
                    <TabIcon className="w-4 h-4" />
                    <span>{tab.name}</span>
                    {/* 底部激活指示器 */}
                    {isActive && (
                      <motion.div
                        layoutId="source-tab-indicator"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-400 rounded-t-full"
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      />
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="flex-shrink-0 px-4 py-2 bg-surface-900/20">

            {/* 批量操作栏 */}
            {selectedIds.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between mt-3 p-3 bg-amber-400/10 border border-amber-400/30 rounded-lg"
              >
                <span className="text-sm text-amber-400">已选择 {selectedIds.length} 个素材</span>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="xs" onClick={() => setSelectedIds([])}>
                    取消选择
                  </Button>
                  <Button
                    variant="ghost"
                    size="xs"
                    className="text-red-400 hover:text-red-300"
                    onClick={handleBatchDelete}
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    批量删除
                  </Button>
                </div>
              </motion.div>
            )}
          </div>

          {/* 上传进度 */}
          {uploadingFiles.length > 0 && (
            <div className="flex-shrink-0 px-4 py-3 border-b border-surface-800">
              <Card className="p-4">
                <h3 className="text-sm font-medium text-surface-100 mb-3">上传中...</h3>
                <div className="space-y-3">
                  {uploadingFiles.map((upload) => (
                    <div key={upload.id} className="flex items-center gap-3">
                      <div className="flex-1">
                        <p className="text-sm text-surface-200 truncate">{upload.name}</p>
                        {upload.error ? (
                          <p className="text-xs text-red-400">{upload.error}</p>
                        ) : (
                          <Progress value={upload.progress} size="sm" variant="primary" className="mt-1" />
                        )}
                      </div>
                      <span className="text-xs text-surface-500">{upload.progress}%</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {/* 内容区 */}
          <div className="flex-1 overflow-y-auto p-4">
            {/* 错误提示 */}
            {error && (
              <div className="flex items-center gap-2 p-4 mb-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                {error}
              </div>
            )}

            {/* 花字系统预设 - 当选择花字类型且来源是系统素材时显示 */}
            {typeFilter === 'FANCY_TEXT' && (mediaSource === 'system' || mediaSource === 'all') ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-surface-100 flex items-center gap-2">
                    <Type className="w-5 h-5 text-cyan-400" />
                    系统花字预设
                    <Badge variant="default" size="sm" className="bg-cyan-500/20 text-cyan-400 border-0">
                      {EMOTION_TEXT_PRESETS.length} 个
                    </Badge>
                  </h3>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {EMOTION_TEXT_PRESETS.map((preset) => (
                    <motion.div
                      key={preset.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="relative group rounded-xl overflow-hidden border border-surface-700 hover:border-cyan-500/50 transition-all cursor-pointer bg-surface-800/50"
                    >
                      {/* 预览区域 */}
                      <div className="relative aspect-video bg-gradient-to-br from-surface-900 via-surface-800 to-surface-900 flex items-center justify-center p-4 overflow-hidden">
                        {/* 网格背景 */}
                        <div className="absolute inset-0 bg-grid opacity-20" />
                        {/* 花字预览 */}
                        <div 
                          style={{
                            ...presetToCSS(preset, 0.35),
                            maxWidth: '100%',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                          className="relative z-10"
                        >
                          花字
                        </div>
                        {/* 类型标签 */}
                        <div className="absolute top-2 right-2">
                          <Badge variant="default" size="sm" className="bg-cyan-500/20 text-cyan-400 border-0">
                            <Type className="w-3 h-3" />
                          </Badge>
                        </div>
                      </div>
                      {/* 信息 */}
                      <div className="p-3 bg-surface-850">
                        <p className="text-sm font-medium text-surface-200 truncate" title={preset.name}>
                          {preset.name}
                        </p>
                        <p className="text-xs text-surface-500 mt-0.5 truncate">{preset.description}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            ) : typeFilter === 'STICKER' && (mediaSource === 'system' || mediaSource === 'all') ? (
              /* 表情系统预设 - 当选择表情类型且来源是系统素材时显示 */
              <div className="space-y-4">
                {/* 注入动画样式 */}
                <style dangerouslySetInnerHTML={{ __html: STICKER_ANIMATIONS_CSS }} />
                
                {/* 标题 */}
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-surface-100 flex items-center gap-2">
                    <Smile className="w-5 h-5 text-yellow-400" />
                    系统表情预设
                    <Badge variant="default" size="sm" className="bg-yellow-500/20 text-yellow-400 border-0">
                      {STICKER_PRESETS.length} 个
                    </Badge>
                  </h3>
                </div>

                {/* 平铺展示所有表情 */}
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12 gap-3">
                  {STICKER_PRESETS.map((sticker) => (
                    <motion.div
                      key={sticker.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      whileHover={{ scale: 1.08 }}
                      className="relative group rounded-xl overflow-hidden border border-surface-700 hover:border-yellow-500/50 transition-all cursor-pointer bg-surface-800/50"
                    >
                      {/* 预览区域 */}
                      <div className="relative aspect-square bg-gradient-to-br from-surface-900 via-surface-850 to-surface-900 flex items-center justify-center p-2 overflow-hidden">
                        {/* 网格背景 */}
                        <div className="absolute inset-0 bg-grid opacity-10" />
                        {/* 表情预览 */}
                        <span 
                          style={stickerToCSS(sticker, 0.55)}
                          className="relative z-10"
                        >
                          {sticker.content.value}
                        </span>
                      </div>
                      {/* 信息 - 悬浮显示 */}
                      <div className="absolute inset-x-0 bottom-0 p-1.5 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                        <p className="text-[10px] font-medium text-white truncate text-center">
                          {sticker.name}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            ) : loading && mediaList.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24">
                <Spinner size="lg" />
                <p className="mt-4 text-surface-500">加载中...</p>
              </div>
            ) : mediaList.length === 0 ? (
              /* 空状态 */
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className={`w-24 h-24 rounded-3xl ${currentTypeConfig?.bgColor || 'bg-surface-800'} flex items-center justify-center mb-6`}>
                  {currentTypeConfig ? (
                    <currentTypeConfig.icon className={`w-12 h-12 ${currentTypeConfig.color}`} />
                  ) : (
                    <FolderOpen className="w-12 h-12 text-surface-600" />
                  )}
                </div>
                <h2 className="text-xl font-semibold text-surface-200 mb-2">
                  {mediaSource === 'system' 
                    ? '暂无系统素材' 
                    : mediaSource === 'user'
                    ? '暂无我的素材'
                    : typeFilter === 'ALL' 
                    ? '素材库为空' 
                    : `暂无${currentTypeConfig?.label}素材`}
                </h2>
                <p className="text-surface-500 mb-6">
                  {mediaSource === 'system'
                    ? '系统素材将在后续版本中提供'
                    : mediaSource === 'user'
                    ? '上传你的第一个素材开始吧'
                    : typeFilter === 'ALL' 
                    ? '上传你的第一个素材开始吧'
                    : `上传或导入${currentTypeConfig?.label}素材`}
                </p>
                {mediaSource === 'user' && (
                  <Button
                    variant="primary"
                    leftIcon={<Upload className="w-4 h-4" />}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    上传素材
                  </Button>
                )}
              </div>
            ) : viewMode === 'grid' ? (
              /* 网格视图 */
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {mediaList.map((media) => {
                  const Icon = getMediaIcon(media.type)
                  const isSelected = selectedIds.includes(media.id)
                  const typeConfig = MEDIA_TYPE_CONFIG.find((c) => c.type === media.type)

                  return (
                    <motion.div
                      key={media.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={`
                        relative group rounded-xl overflow-hidden border-2 transition-all cursor-pointer
                        ${
                          isSelected
                            ? 'border-amber-400 shadow-lg shadow-amber-400/20'
                            : 'border-transparent hover:border-surface-600'
                        }
                      `}
                      onClick={() => setPreviewMedia(media)}
                    >
                      {/* 缩略图 */}
                      <div className="relative aspect-video bg-surface-800 overflow-hidden">
                        {media.type === 'VIDEO' || media.type === 'IMAGE' ? (
                          media.thumbnailPath || media.path ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={media.thumbnailPath || media.path}
                              alt=""
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                // 图片加载失败时隐藏图片，显示默认图标
                                const target = e.target as HTMLImageElement
                                target.style.display = 'none'
                                const parent = target.parentElement
                                if (parent) {
                                  parent.innerHTML = `<div class="w-full h-full flex items-center justify-center"><svg class="w-8 h-8 text-surface-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg></div>`
                                }
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Icon className="w-8 h-8 text-surface-600" />
                            </div>
                          )
                        ) : (
                          <div className={`w-full h-full flex items-center justify-center ${typeConfig?.bgColor || 'bg-surface-800'}`}>
                            <Icon className={`w-8 h-8 ${typeConfig?.color || 'text-surface-500'}`} />
                          </div>
                        )}

                        {/* 选择框 */}
                        <button
                          className={`
                            absolute top-2 left-2 w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all
                            ${
                              isSelected
                                ? 'bg-amber-400 border-amber-400'
                                : 'bg-surface-900/60 border-surface-500 opacity-0 group-hover:opacity-100'
                            }
                          `}
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleSelect(media.id)
                          }}
                        >
                          {isSelected && <Check className="w-4 h-4 text-surface-950" />}
                        </button>

                        {/* 类型标识 */}
                        <div className="absolute top-2 right-2">
                          <Badge
                            variant="default"
                            size="sm"
                            className={`${typeConfig?.bgColor} ${typeConfig?.color} border-0`}
                          >
                            <Icon className="w-3 h-3" />
                          </Badge>
                        </div>

                        {/* 时长 */}
                        {media.duration && (
                          <div className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/70 rounded text-xs text-white font-mono">
                            {formatDuration(media.duration)}
                          </div>
                        )}

                        {/* 悬浮操作 */}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <Button
                            variant="ghost"
                            size="xs"
                            isIconOnly
                            className="bg-surface-800/80 hover:bg-red-500/80 text-white"
                            onClick={(e) => {
                              e.stopPropagation()
                              setDeleteId(media.id)
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      {/* 信息 */}
                      <div className="p-2 bg-surface-850">
                        <p className="text-xs font-medium text-surface-200 truncate" title={media.name}>
                          {media.name}
                        </p>
                        <p className="text-xs text-surface-500 mt-0.5">{formatFileSize(media.size)}</p>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            ) : (
              /* 列表视图 */
              <div className="space-y-2">
                {mediaList.map((media) => {
                  const Icon = getMediaIcon(media.type)
                  const isSelected = selectedIds.includes(media.id)
                  const typeConfig = MEDIA_TYPE_CONFIG.find((c) => c.type === media.type)

                  return (
                    <Card
                      key={media.id}
                      className={`p-4 transition-all cursor-pointer ${
                        isSelected ? 'border-amber-400' : ''
                      }`}
                      onClick={() => setPreviewMedia(media)}
                    >
                      <div className="flex items-center gap-4">
                        {/* 选择框 */}
                        <button
                          className={`
                            w-5 h-5 rounded border-2 flex items-center justify-center transition-all
                            ${
                              isSelected
                                ? 'bg-amber-400 border-amber-400'
                                : 'border-surface-600 hover:border-surface-400'
                            }
                          `}
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleSelect(media.id)
                          }}
                        >
                          {isSelected && <Check className="w-3 h-3 text-surface-950" />}
                        </button>

                        {/* 缩略图 */}
                        <div className={`w-16 h-10 rounded-lg overflow-hidden flex-shrink-0 ${typeConfig?.bgColor || 'bg-surface-800'}`}>
                          {media.type === 'VIDEO' || media.type === 'IMAGE' ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={media.thumbnailPath || media.path}
                              alt=""
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement
                                target.style.display = 'none'
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Icon className={`w-5 h-5 ${typeConfig?.color || 'text-surface-500'}`} />
                            </div>
                          )}
                        </div>

                        {/* 信息 */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-surface-100 truncate">{media.name}</p>
                          <div className="flex items-center gap-3 text-xs text-surface-500">
                            <Badge
                              variant="default"
                              size="sm"
                              className={`${typeConfig?.bgColor} ${typeConfig?.color} border-0`}
                            >
                              <Icon className="w-3 h-3 mr-1" />
                              {getMediaTypeName(media.type)}
                            </Badge>
                            <span>{formatFileSize(media.size)}</span>
                            {media.duration && <span>{formatDuration(media.duration)}</span>}
                          </div>
                        </div>

                        {/* 时间 */}
                        <div className="text-xs text-surface-500">{formatDate(media.createdAt)}</div>

                        {/* 操作 */}
                        <Button
                          variant="ghost"
                          size="xs"
                          isIconOnly
                          className="text-surface-500 hover:text-red-400"
                          onClick={(e) => {
                            e.stopPropagation()
                            setDeleteId(media.id)
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </Card>
                  )
                })}
              </div>
            )}

            {/* 分页 */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-8">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page <= 1}
                  onClick={() => loadMedia(pagination.page - 1)}
                >
                  上一页
                </Button>
                <span className="text-sm text-surface-400">
                  第 {pagination.page} 页，共 {pagination.totalPages} 页
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => loadMedia(pagination.page + 1)}
                >
                  下一页
                </Button>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* 删除确认弹窗 */}
      <AnimatePresence>
        {deleteId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center"
            onClick={() => setDeleteId(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-surface-800 rounded-xl p-6 max-w-sm mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <h4 className="text-lg font-semibold text-surface-100 mb-2">确认删除？</h4>
              <p className="text-sm text-surface-400 mb-4">删除后将无法恢复，确定要删除这个素材吗？</p>
              <div className="flex gap-3">
                <Button variant="ghost" className="flex-1" onClick={() => setDeleteId(null)}>
                  取消
                </Button>
                <Button
                  variant="primary"
                  className="flex-1 bg-red-500 hover:bg-red-600"
                  onClick={() => handleDelete(deleteId)}
                  disabled={deleting}
                >
                  {deleting ? <Spinner size="sm" /> : '删除'}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 预览弹窗 */}
      <MediaPreviewModal
        isOpen={!!previewMedia}
        onClose={() => setPreviewMedia(null)}
        type={previewMedia?.type === 'VIDEO' ? 'video' : 'image'}
        src={previewMedia?.path || ''}
        title={previewMedia?.name}
      />

      {/* 用户标签管理弹窗 */}
      <UserTagModal
        isOpen={showTagModal}
        onClose={() => setShowTagModal(false)}
        onTagCreated={loadUserTags}
        userTags={userTags}
      />
    </div>
  )
}
