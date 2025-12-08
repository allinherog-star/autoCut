'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FolderOpen,
  Video,
  ImageIcon,
  Music,
  Search,
  Trash2,
  Plus,
  RefreshCw,
  Clock,
  HardDrive,
  X,
  Check,
  AlertCircle,
  Type,
  Sparkles,
  Smile,
  LayoutTemplate,
  Volume2,
  Layers,
} from 'lucide-react'
import { Button, Card, Badge, Spinner } from '@/components/ui'
import {
  getMediaList,
  deleteMedia,
  type Media,
  type MediaListResponse,
} from '@/lib/api/media'

// ============================================
// 类型定义
// ============================================

type MediaTypeFilter = 'ALL' | Media['type']

interface MediaLibraryPanelProps {
  onSelect?: (media: Media) => void
  selectedIds?: string[]
  className?: string
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

// ============================================
// 组件
// ============================================

export function MediaLibraryPanel({
  onSelect,
  selectedIds = [],
  className = '',
}: MediaLibraryPanelProps) {
  // 状态
  const [mediaList, setMediaList] = useState<Media[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState<MediaListResponse['pagination'] | null>(null)

  // 筛选状态
  const [typeFilter, setTypeFilter] = useState<MediaTypeFilter>('ALL')
  const [searchQuery, setSearchQuery] = useState('')

  // 删除确认状态
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  // 加载素材列表
  const loadMedia = useCallback(async (page: number = 1) => {
    setLoading(true)
    setError(null)

    const response = await getMediaList({
      page,
      limit: 20,
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
  }, [typeFilter, searchQuery])

  // 初始加载
  useEffect(() => {
    loadMedia()
  }, [loadMedia])

  // 删除素材
  const handleDelete = async (id: string) => {
    setDeleting(true)
    const response = await deleteMedia(id)

    if (response.success) {
      setMediaList((prev) => prev.filter((m) => m.id !== id))
      setDeleteId(null)
    } else {
      setError(response.error || '删除失败')
    }

    setDeleting(false)
  }

  // 选择素材
  const handleSelect = (media: Media) => {
    onSelect?.(media)
  }

  // 类型筛选按钮
  const filterButtons: { type: MediaTypeFilter; label: string; icon: typeof Video }[] = [
    { type: 'ALL', label: '全部', icon: FolderOpen },
    { type: 'VIDEO', label: '视频', icon: Video },
    { type: 'IMAGE', label: '图片', icon: ImageIcon },
    { type: 'AUDIO', label: '音频', icon: Music },
  ]

  return (
    <Card className={`flex flex-col h-full ${className}`}>
      {/* 头部 */}
      <div className="flex-shrink-0 p-4 border-b border-surface-700">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-surface-100 flex items-center gap-2">
            <FolderOpen className="w-5 h-5 text-amber-400" />
            素材库
          </h3>
          <Button
            variant="ghost"
            size="xs"
            isIconOnly
            onClick={() => loadMedia()}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        {/* 搜索框 */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
          <input
            type="text"
            placeholder="搜索素材..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-9 pl-9 pr-3 bg-surface-800 border border-surface-600 rounded-lg text-sm text-surface-100 placeholder:text-surface-500 focus:outline-none focus:border-amber-400/50"
          />
        </div>

        {/* 类型筛选 */}
        <div className="flex gap-1">
          {filterButtons.map(({ type, label, icon: Icon }) => (
            <button
              key={type}
              onClick={() => setTypeFilter(type)}
              className={`
                flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors
                ${typeFilter === type
                  ? 'bg-amber-400/20 text-amber-400'
                  : 'text-surface-400 hover:text-surface-200 hover:bg-surface-700'
                }
              `}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* 内容区 */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* 错误提示 */}
        {error && (
          <div className="flex items-center gap-2 p-3 mb-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* 加载状态 */}
        {loading && mediaList.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Spinner size="lg" />
            <p className="mt-3 text-sm text-surface-500">加载中...</p>
          </div>
        ) : mediaList.length === 0 ? (
          /* 空状态 */
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-surface-700 flex items-center justify-center mb-4">
              <FolderOpen className="w-8 h-8 text-surface-500" />
            </div>
            <p className="text-surface-400 mb-2">素材库为空</p>
            <p className="text-sm text-surface-500">上传素材后将显示在这里</p>
          </div>
        ) : (
          /* 素材网格 */
          <div className="grid grid-cols-2 gap-3">
            <AnimatePresence mode="popLayout">
              {mediaList.map((media) => {
                const Icon = getMediaIcon(media.type)
                const isSelected = selectedIds.includes(media.id)

                return (
                  <motion.div
                    key={media.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className={`
                      relative group rounded-xl overflow-hidden border-2 transition-all cursor-pointer
                      ${isSelected
                        ? 'border-amber-400 shadow-glow-amber'
                        : 'border-transparent hover:border-surface-600'
                      }
                    `}
                    onClick={() => handleSelect(media)}
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

                      {/* 类型标识 */}
                      <div className="absolute top-2 left-2">
                        <Badge
                          variant={media.type === 'VIDEO' ? 'primary' : media.type === 'IMAGE' ? 'success' : 'info'}
                          size="sm"
                        >
                          <Icon className="w-3 h-3" />
                        </Badge>
                      </div>

                      {/* 时长 (视频/音频) */}
                      {media.duration && (
                        <div className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/70 rounded text-xs text-white font-mono">
                          {formatDuration(media.duration)}
                        </div>
                      )}

                      {/* 选中标记 */}
                      {isSelected && (
                        <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-amber-400 flex items-center justify-center">
                          <Check className="w-4 h-4 text-surface-950" />
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
                      <div className="flex items-center gap-2 mt-1 text-xs text-surface-500">
                        <span className="flex items-center gap-1">
                          <HardDrive className="w-3 h-3" />
                          {formatFileSize(media.size)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDate(media.createdAt)}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        )}

        {/* 分页信息 */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-4 pt-4 border-t border-surface-700">
            <Button
              variant="ghost"
              size="xs"
              disabled={pagination.page <= 1}
              onClick={() => loadMedia(pagination.page - 1)}
            >
              上一页
            </Button>
            <span className="text-sm text-surface-400">
              {pagination.page} / {pagination.totalPages}
            </span>
            <Button
              variant="ghost"
              size="xs"
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
            className="absolute inset-0 bg-black/60 flex items-center justify-center z-50"
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
              <p className="text-sm text-surface-400 mb-4">
                删除后将无法恢复，确定要删除这个素材吗？
              </p>
              <div className="flex gap-3">
                <Button
                  variant="ghost"
                  className="flex-1"
                  onClick={() => setDeleteId(null)}
                >
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
    </Card>
  )
}

export default MediaLibraryPanel

