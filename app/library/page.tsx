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
} from 'lucide-react'
import { Button, Card, Badge, Spinner, Progress } from '@/components/ui'
import { MediaPreviewModal } from '@/components/media-preview-modal'
import {
  getMediaList,
  deleteMedia,
  uploadMedia,
  type Media,
  type MediaType,
  type MediaListResponse,
} from '@/lib/api/media'

// ============================================
// 类型定义
// ============================================

type MediaTypeFilter = 'ALL' | MediaType
type ViewMode = 'grid' | 'list'

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
      })

      if (response.success && response.data) {
        setMediaList(response.data.items)
        setPagination(response.data.pagination)
      } else {
        setError(response.error || '加载失败')
      }

      setLoading(false)
    },
    [typeFilter, searchQuery]
  )

  // 初始加载
  useEffect(() => {
    loadMedia()
  }, [loadMedia])

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

  // 类型筛选按钮
  const filterButtons: { type: MediaTypeFilter; label: string; icon: typeof Video }[] = [
    { type: 'ALL', label: '全部', icon: FolderOpen },
    { type: 'VIDEO', label: '视频', icon: Video },
    { type: 'IMAGE', label: '图片', icon: ImageIcon },
    { type: 'AUDIO', label: '音乐', icon: Music },
    { type: 'SOUND_EFFECT', label: '音效', icon: Volume2 },
    { type: 'FANCY_TEXT', label: '花字', icon: Type },
    { type: 'FONT', label: '字体', icon: Type },
    { type: 'STICKER', label: '表情', icon: Smile },
    { type: 'EFFECT', label: '特效', icon: Sparkles },
    { type: 'TRANSITION', label: '转场', icon: Layers },
    { type: 'TEMPLATE', label: '模版', icon: LayoutTemplate },
  ]

  // 统计信息
  const stats = {
    total: pagination?.total || 0,
    videos: mediaList.filter((m) => m.type === 'VIDEO').length,
    images: mediaList.filter((m) => m.type === 'IMAGE').length,
    audio: mediaList.filter((m) => m.type === 'AUDIO').length,
  }

  return (
    <main
      className="min-h-screen bg-surface-950"
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

      {/* 导航栏 */}
      <nav className="sticky top-0 z-40 bg-surface-950/80 backdrop-blur-xl border-b border-surface-800">
        <div className="max-w-7xl mx-auto px-6 py-4">
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
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-400/20 flex items-center justify-center">
                  <FolderOpen className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-surface-100">素材库</h1>
                  <p className="text-xs text-surface-500">{stats.total} 个素材</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                isIconOnly
                onClick={() => loadMedia()}
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
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Upload className="w-4 h-4" />}
                onClick={() => fileInputRef.current?.click()}
              >
                上传素材
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* 工具栏 */}
      <div className="sticky top-[73px] z-30 bg-surface-900/80 backdrop-blur-xl border-b border-surface-800">
        <div className="max-w-7xl mx-auto px-6 py-3">
          <div className="flex items-center justify-between gap-4">
            {/* 搜索框 */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
              <input
                type="text"
                placeholder="搜索素材..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 pl-10 pr-4 bg-surface-800 border border-surface-700 rounded-lg text-sm text-surface-100 placeholder:text-surface-500 focus:outline-none focus:border-amber-400/50"
              />
            </div>

            {/* 类型筛选 */}
            <div className="flex items-center gap-1 bg-surface-800 rounded-lg p-1">
              {filterButtons.map(({ type, label, icon: Icon }) => (
                <button
                  key={type}
                  onClick={() => setTypeFilter(type)}
                  className={`
                    flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all
                    ${
                      typeFilter === type
                        ? 'bg-amber-400 text-surface-950'
                        : 'text-surface-400 hover:text-surface-200 hover:bg-surface-700'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </div>

            {/* 视图切换 */}
            <div className="flex items-center gap-1 bg-surface-800 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-surface-700 text-surface-100'
                    : 'text-surface-500 hover:text-surface-300'
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'list'
                    ? 'bg-surface-700 text-surface-100'
                    : 'text-surface-500 hover:text-surface-300'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>

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
      </div>

      {/* 上传进度 */}
      {uploadingFiles.length > 0 && (
        <div className="max-w-7xl mx-auto px-6 py-4">
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
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* 错误提示 */}
        {error && (
          <div className="flex items-center gap-2 p-4 mb-6 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* 加载状态 */}
        {loading && mediaList.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24">
            <Spinner size="lg" />
            <p className="mt-4 text-surface-500">加载中...</p>
          </div>
        ) : mediaList.length === 0 ? (
          /* 空状态 */
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-24 h-24 rounded-3xl bg-surface-800 flex items-center justify-center mb-6">
              <FolderOpen className="w-12 h-12 text-surface-600" />
            </div>
            <h2 className="text-xl font-semibold text-surface-200 mb-2">素材库为空</h2>
            <p className="text-surface-500 mb-6">上传你的第一个素材开始吧</p>
            <Button
              variant="primary"
              leftIcon={<Upload className="w-4 h-4" />}
              onClick={() => fileInputRef.current?.click()}
            >
              上传素材
            </Button>
          </div>
        ) : viewMode === 'grid' ? (
          /* 网格视图 */
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {mediaList.map((media) => {
              const Icon = getMediaIcon(media.type)
              const isSelected = selectedIds.includes(media.id)

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
                  <div className="relative aspect-video bg-surface-800">
                    {media.type === 'VIDEO' || media.type === 'IMAGE' ? (
                      media.thumbnailPath || media.path ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={media.thumbnailPath || media.path}
                          alt={media.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Icon className="w-8 h-8 text-surface-600" />
                        </div>
                      )
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-500/20 to-pink-500/20">
                        <Music className="w-8 h-8 text-purple-400" />
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
                        variant={
                          media.type === 'VIDEO'
                            ? 'primary'
                            : media.type === 'IMAGE'
                              ? 'success'
                              : 'info'
                        }
                        size="sm"
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
                    <div className="w-16 h-10 rounded-lg overflow-hidden bg-surface-800 flex-shrink-0">
                      {media.type === 'VIDEO' || media.type === 'IMAGE' ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={media.thumbnailPath || media.path}
                          alt={media.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Music className="w-5 h-5 text-purple-400" />
                        </div>
                      )}
                    </div>

                    {/* 信息 */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-surface-100 truncate">{media.name}</p>
                      <div className="flex items-center gap-3 text-xs text-surface-500">
                        <Badge
                          variant={
                            media.type === 'VIDEO'
                              ? 'primary'
                              : media.type === 'IMAGE'
                                ? 'success'
                                : 'info'
                          }
                          size="sm"
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
    </main>
  )
}

