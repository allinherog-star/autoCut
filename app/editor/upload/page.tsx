'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { motion, AnimatePresence, Reorder } from 'framer-motion'
import {
  Upload,
  Video,
  ImageIcon,
  Plus,
  GripVertical,
  Play,
  Clock,
  Trash2,
  Sparkles,
  Eye,
  Smartphone,
  Monitor,
  Check,
  FolderOpen,
  AlertCircle,
} from 'lucide-react'
import { Button, Card, Badge, Progress } from '@/components/ui'
import { MediaPreviewModal } from '@/components/media-preview-modal'
import { MediaLibraryPanel } from '@/components/media-library-panel'
import { useEditor, DEVICE_CONFIGS, VIDEO_TYPES, type TargetDevice } from '../layout'
import { uploadMedia, type Media } from '@/lib/api/media'
import { MediaThumb } from '@/components/media-thumb'

// ============================================
// 类型定义
// ============================================

interface MediaFile {
  id: string
  file?: File // 新上传的文件
  media?: Media // 从素材库选择的
  name: string
  type: 'video' | 'image'
  size: number
  duration?: number
  thumbnailUrl: string
  uploadProgress: number
  isUploaded: boolean
  isMain: boolean
  error?: string
}

// ============================================
// 上传页面
// ============================================

export default function UploadPage() {
  const {
    goToNextStep,
    markStepCompleted,
    currentStep,
    setBottomBar,
    hideBottomBar,
    targetDevice,
    setTargetDevice,
    deviceConfig,
    videoType,
    setVideoType,
    videoTypeInfo,
  } = useEditor()
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const addMoreInputRef = useRef<HTMLInputElement>(null)

  // 预览状态
  const [previewFile, setPreviewFile] = useState<MediaFile | null>(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)

  // 素材库面板状态
  const [showLibrary, setShowLibrary] = useState(false)

  const hasFiles = mediaFiles.length > 0
  const allUploaded = mediaFiles.every((f) => f.isUploaded)
  const hasErrors = mediaFiles.some((f) => f.error)

  // 触发文件选择
  const triggerFileSelect = () => {
    fileInputRef.current?.click()
  }

  // 触发添加更多
  const triggerAddMore = () => {
    addMoreInputRef.current?.click()
  }

  // 打开预览
  const openPreview = (file: MediaFile) => {
    setPreviewFile(file)
    setIsPreviewOpen(true)
  }

  // 关闭预览
  const closePreview = () => {
    setIsPreviewOpen(false)
    setPreviewFile(null)
  }

  // 开始AI分析（完成当前步骤并进入下一步）
  const handleStartAIAnalysis = () => {
    markStepCompleted(currentStep)
    goToNextStep()
  }

  // 真实上传文件
  const uploadFile = async (mediaFile: MediaFile) => {
    if (!mediaFile.file) return

    const response = await uploadMedia(mediaFile.file, (progress) => {
      setMediaFiles((prev) =>
        prev.map((f) => (f.id === mediaFile.id ? { ...f, uploadProgress: progress } : f))
      )
    })

    if (response.success && response.data) {
      const uploaded = response.data
      setMediaFiles((prev) =>
        prev.map((f) =>
          f.id === mediaFile.id
            ? {
                ...f,
                uploadProgress: 100,
                isUploaded: true,
                media: uploaded,
                thumbnailUrl: uploaded.path,
              }
            : f
        )
      )
    } else {
      setMediaFiles((prev) =>
        prev.map((f) =>
          f.id === mediaFile.id
            ? { ...f, error: response.error || '上传失败', uploadProgress: 0 }
            : f
        )
      )
    }
  }

  // 处理文件选择
  const handleFileSelect = useCallback(
    async (files: FileList | null) => {
      if (!files) return

      setIsUploading(true)

      const newFiles: MediaFile[] = Array.from(files).map((file, index) => ({
        id: `${Date.now()}-${index}`,
        file,
        name: file.name,
        type: file.type.startsWith('video/') ? 'video' : 'image',
        size: file.size,
        thumbnailUrl: URL.createObjectURL(file),
        uploadProgress: 0,
        isUploaded: false,
        isMain: mediaFiles.length === 0 && index === 0,
      }))

      setMediaFiles((prev) => [...prev, ...newFiles])

      // 真实上传文件
      for (const mediaFile of newFiles) {
        await uploadFile(mediaFile)
      }

      setIsUploading(false)
    },
    [mediaFiles.length]
  )

  // 从素材库选择素材
  const handleLibrarySelect = (media: Media) => {
    // 检查是否已经添加
    const exists = mediaFiles.some((f) => f.media?.id === media.id)
    if (exists) return

    const newFile: MediaFile = {
      id: `lib-${media.id}`,
      media,
      name: media.name,
      type: media.type === 'VIDEO' ? 'video' : 'image',
      size: media.size,
      duration: media.duration || undefined,
      thumbnailUrl: media.thumbnailPath || media.path,
      uploadProgress: 100,
      isUploaded: true,
      isMain: mediaFiles.length === 0,
    }

    setMediaFiles((prev) => [...prev, newFile])
  }

  // 拖拽事件
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      handleFileSelect(e.dataTransfer.files)
    },
    [handleFileSelect]
  )

  // 删除文件
  const handleRemoveFile = (id: string) => {
    setMediaFiles((prev) => {
      const updated = prev.filter((f) => f.id !== id)
      // 如果删除的是主素材，将第一个设为主素材
      if (updated.length > 0 && !updated.some((f) => f.isMain)) {
        updated[0].isMain = true
      }
      return updated
    })
  }

  // 设置主素材
  const handleSetMain = (id: string) => {
    setMediaFiles((prev) =>
      prev.map((f) => ({
        ...f,
        isMain: f.id === id,
      }))
    )
  }

  // 重试上传
  const handleRetry = async (mediaFile: MediaFile) => {
    if (!mediaFile.file) return
    setMediaFiles((prev) =>
      prev.map((f) => (f.id === mediaFile.id ? { ...f, error: undefined, uploadProgress: 0 } : f))
    )
    await uploadFile(mediaFile)
  }

  // 格式化文件大小
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  // 更新底部操作栏
  useEffect(() => {
    if (hasFiles) {
      const typeDesc = videoTypeInfo ? `（${videoTypeInfo.name}）` : ''
      setBottomBar({
        show: true,
        icon: <Sparkles className="w-5 h-5 text-amber-400" />,
        title: '准备好了？',
        description: `AI 将分析你的 ${mediaFiles.length} 个${typeDesc}素材，智能提取精华内容`,
        primaryButton: {
          text: '开始 AI 分析',
          onClick: handleStartAIAnalysis,
          disabled: !allUploaded || isUploading || hasErrors,
          loading: isUploading,
          loadingText: '上传中...',
        },
      })
    } else {
      hideBottomBar()
    }
  }, [hasFiles, mediaFiles.length, allUploaded, isUploading, hasErrors, videoTypeInfo])

  return (
    <div className="flex-1 flex min-h-0 overflow-hidden">
      {/* 主内容区 */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {/* 页面标题 */}
        <div className="flex-shrink-0 px-6 pt-6 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-display font-bold text-surface-100 mb-2">上传素材</h1>
              <p className="text-surface-400">
                上传你的视频或图片素材，或从素材库选择，AI 将自动添加转场效果
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowLibrary(!showLibrary)}
              className={showLibrary ? 'border-amber-400 text-amber-400' : ''}
            >
              <FolderOpen className="w-4 h-4 mr-2" />
              素材库
            </Button>
          </div>
        </div>

        {/* 上传区域 - 可滚动 */}
        <div className="flex-1 flex flex-col gap-6 px-6 overflow-y-auto min-h-0">
          {/* 目标设备选择 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="p-5">
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <h3 className="text-base font-semibold text-surface-100 mb-1">选择目标平台</h3>
                  <p className="text-sm text-surface-500">
                    根据发布平台选择，后续预览和导出都会使用此设置
                  </p>
                </div>

                {/* 设备选择按钮组 */}
                <div className="flex gap-3">
                  {(Object.keys(DEVICE_CONFIGS) as TargetDevice[]).map((deviceId) => {
                    const config = DEVICE_CONFIGS[deviceId]
                    const isActive = targetDevice === deviceId
                    const Icon = deviceId === 'phone' ? Smartphone : Monitor

                    return (
                      <button
                        key={deviceId}
                        onClick={() => setTargetDevice(deviceId)}
                        className={`
                          relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all min-w-[140px]
                          ${
                            isActive
                              ? 'border-amber-400 bg-amber-400/10'
                              : 'border-surface-700 bg-surface-800/50 hover:border-surface-600 hover:bg-surface-800'
                          }
                        `}
                      >
                        {/* 选中标记 */}
                        {isActive && (
                          <div className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-amber-400 flex items-center justify-center">
                            <Check className="w-3 h-3 text-surface-950" />
                          </div>
                        )}

                        {/* 设备图标 */}
                        <div
                          className={`
                          w-12 h-12 rounded-xl flex items-center justify-center
                          ${isActive ? 'bg-amber-400/20 text-amber-400' : 'bg-surface-700 text-surface-400'}
                        `}
                        >
                          <Icon className="w-6 h-6" />
                        </div>

                        {/* 设备信息 */}
                        <div className="text-center">
                          <p
                            className={`text-sm font-medium ${isActive ? 'text-amber-400' : 'text-surface-200'}`}
                          >
                            {config.name}
                          </p>
                          <p className="text-xs text-surface-500 mt-0.5">{config.description}</p>
                          <p className="text-xs text-surface-600 mt-1 font-mono">
                            {config.width}×{config.height}
                          </p>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            </Card>
          </motion.div>

          {/* 视频类型选择 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.05 }}
          >
            <Card className="p-5">
              <div className="flex items-start gap-6 mb-5">
                <div className="flex-1">
                  <h3 className="text-base font-semibold text-surface-100 mb-1">选择视频类型</h3>
                  <p className="text-sm text-surface-500">
                    AI 将根据类型优化剪辑风格、字幕样式和推荐效果
                  </p>
                </div>
                {/* 已选类型显示 */}
                {videoTypeInfo && (
                  <div className="flex items-center gap-2.5 px-4 py-2 bg-gradient-to-r from-amber-400/20 to-amber-500/10 rounded-xl border border-amber-400/40">
                    <span className="text-xl">{videoTypeInfo.icon}</span>
                    <span className="text-sm font-semibold text-amber-400">{videoTypeInfo.name}</span>
                  </div>
                )}
              </div>

              {/* 类型选择 - 平铺网格 */}
              <div className="flex flex-wrap gap-2.5">
                {VIDEO_TYPES.map((type) => {
                  const isSelected = videoType === type.id
                  return (
                    <button
                      key={type.id}
                      onClick={() => setVideoType(isSelected ? null : type.id)}
                      className={`
                        group relative flex items-center gap-2.5 px-4 py-2.5 rounded-xl border-2 transition-all duration-200
                        ${
                          isSelected
                            ? 'border-amber-400 bg-gradient-to-br from-amber-400/15 to-amber-500/5 shadow-lg shadow-amber-400/10'
                            : 'border-surface-700 bg-surface-800/60 hover:border-surface-500 hover:bg-surface-800 hover:shadow-md'
                        }
                      `}
                    >
                      {/* 选中标记 */}
                      {isSelected && (
                        <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-amber-400 flex items-center justify-center shadow-lg">
                          <Check className="w-3 h-3 text-surface-950" />
                        </div>
                      )}
                      {/* 图标 */}
                      <span
                        className={`text-xl transition-transform duration-200 ${isSelected ? 'scale-110' : 'group-hover:scale-105'}`}
                      >
                        {type.icon}
                      </span>
                      {/* 名称 */}
                      <span
                        className={`text-sm font-medium transition-colors ${isSelected ? 'text-amber-400' : 'text-surface-200 group-hover:text-surface-100'}`}
                      >
                        {type.name}
                      </span>
                    </button>
                  )
                })}
              </div>
            </Card>
          </motion.div>

          {/* 拖拽上传区 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
          >
            {/* 隐藏的文件输入 */}
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*,image/*"
              multiple
              className="hidden"
              onChange={(e) => handleFileSelect(e.target.files)}
            />

            {/* 上传区域 */}
            <div
              className={`
                relative block w-full border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer
                transition-all duration-300
                ${
                  isDragging
                    ? 'border-amber-400 bg-amber-400/10'
                    : 'border-surface-600 hover:border-surface-500 hover:bg-surface-800/50'
                }
              `}
              onClick={triggerFileSelect}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="flex flex-col items-center pointer-events-none">
                <div
                  className={`
                    w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-colors duration-300
                    ${isDragging ? 'bg-amber-400 text-surface-950' : 'bg-surface-700 text-surface-400'}
                  `}
                >
                  <Upload className="w-8 h-8" />
                </div>
                <p className="text-lg font-medium text-surface-200 mb-2">
                  {isDragging ? '松开鼠标上传文件' : '拖拽文件到此处上传'}
                </p>
                <p className="text-sm text-surface-500 mb-4">
                  支持 MP4, MOV, AVI, WebM, JPG, PNG 等格式
                </p>
                <span className="inline-flex items-center justify-center gap-1.5 h-8 px-3 text-sm font-medium rounded-md bg-transparent text-amber-400 border border-amber-400/50 hover:bg-amber-400/10 hover:border-amber-400 transition-all">
                  <Plus className="w-4 h-4" />
                  选择文件
                </span>
              </div>

              {/* 拖拽高亮效果 */}
              <AnimatePresence>
                {isDragging && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-amber-400/5 rounded-2xl pointer-events-none"
                  />
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* 已上传文件列表 */}
          <AnimatePresence>
            {hasFiles && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex-1"
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-surface-100">
                    已上传素材
                    <span className="ml-2 text-sm text-surface-500">({mediaFiles.length} 个文件)</span>
                  </h2>
                  <Badge variant="info" size="sm">
                    <GripVertical className="w-3 h-3" />
                    拖拽调整顺序
                  </Badge>
                </div>

                {/* 可排序列表 */}
                <Reorder.Group axis="y" values={mediaFiles} onReorder={setMediaFiles} className="space-y-3">
                  {mediaFiles.map((mediaFile, index) => (
                    <Reorder.Item
                      key={mediaFile.id}
                      value={mediaFile}
                      className="cursor-grab active:cursor-grabbing"
                    >
                      <Card
                        className={`
                          p-4 transition-all duration-200
                          ${mediaFile.isMain ? 'border-amber-400/50 shadow-glow-amber' : ''}
                          ${mediaFile.error ? 'border-red-500/50' : ''}
                        `}
                      >
                        <div className="flex items-center gap-4">
                          {/* 拖拽手柄 */}
                          <div className="text-surface-500 hover:text-surface-300">
                            <GripVertical className="w-5 h-5" />
                          </div>

                          {/* 序号 */}
                          <div className="w-8 h-8 rounded-lg bg-surface-700 flex items-center justify-center text-sm font-mono text-surface-300">
                            {index + 1}
                          </div>

                          {/* 缩略图 */}
                          <div
                            className="relative w-24 h-14 rounded-lg overflow-hidden bg-surface-800 flex-shrink-0 cursor-pointer group/thumb"
                            onClick={() => openPreview(mediaFile)}
                          >
                            {mediaFile.type === 'video' ? (
                              <video src={mediaFile.thumbnailUrl} className="w-full h-full object-cover" />
                            ) : (
                              <MediaThumb
                                src={mediaFile.thumbnailUrl}
                                alt={mediaFile.name}
                                width={96}
                                height={56}
                                className="w-full h-full object-cover"
                                sizes="96px"
                                quality={80}
                                fallback={
                                  <div className="w-full h-full flex items-center justify-center">
                                    <ImageIcon className="w-6 h-6 text-surface-500" />
                                  </div>
                                }
                              />
                            )}
                            {/* 预览按钮覆盖层 */}
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover/thumb:opacity-100 transition-opacity">
                              <Play className="w-6 h-6 text-white" />
                            </div>
                            {/* 类型标识 */}
                            <div className="absolute bottom-1 right-1 w-5 h-5 rounded bg-black/60 flex items-center justify-center">
                              {mediaFile.type === 'video' ? (
                                <Video className="w-3 h-3 text-white" />
                              ) : (
                                <ImageIcon className="w-3 h-3 text-white" />
                              )}
                            </div>
                          </div>

                          {/* 文件信息 */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="text-sm font-medium text-surface-100 truncate">{mediaFile.name}</p>
                              {mediaFile.isMain && (
                                <Badge variant="primary" size="sm">
                                  主素材
                                </Badge>
                              )}
                              {mediaFile.media && (
                                <Badge variant="info" size="sm">
                                  素材库
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-3 text-xs text-surface-500">
                              <span>{formatFileSize(mediaFile.size)}</span>
                              {mediaFile.duration && (
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {Math.floor(mediaFile.duration / 60)}:
                                  {String(Math.floor(mediaFile.duration % 60)).padStart(2, '0')}
                                </span>
                              )}
                            </div>
                            {/* 上传进度 */}
                            {!mediaFile.isUploaded && !mediaFile.error && (
                              <Progress value={mediaFile.uploadProgress} size="sm" variant="primary" className="mt-2" />
                            )}
                            {/* 错误信息 */}
                            {mediaFile.error && (
                              <div className="flex items-center gap-2 mt-2 text-xs text-red-400">
                                <AlertCircle className="w-3 h-3" />
                                {mediaFile.error}
                                <button
                                  onClick={() => handleRetry(mediaFile)}
                                  className="underline hover:text-red-300"
                                >
                                  重试
                                </button>
                              </div>
                            )}
                          </div>

                          {/* 操作按钮 */}
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="xs"
                              isIconOnly
                              onClick={() => openPreview(mediaFile)}
                              className="text-surface-400 hover:text-amber-400"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            {!mediaFile.isMain && (
                              <Button variant="ghost" size="xs" onClick={() => handleSetMain(mediaFile.id)}>
                                设为主素材
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="xs"
                              isIconOnly
                              onClick={() => handleRemoveFile(mediaFile.id)}
                              className="text-surface-400 hover:text-error"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    </Reorder.Item>
                  ))}
                </Reorder.Group>

                {/* 添加更多 */}
                <input
                  ref={addMoreInputRef}
                  type="file"
                  accept="video/*,image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => handleFileSelect(e.target.files)}
                />
                <Card
                  isInteractive
                  className="mt-4 p-4 border-dashed cursor-pointer hover:border-amber-400/50"
                  onClick={triggerAddMore}
                >
                  <div className="flex items-center justify-center gap-2 text-surface-400">
                    <Plus className="w-5 h-5" />
                    <span>添加更多素材</span>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* 素材库面板 */}
      <AnimatePresence>
        {showLibrary && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 400, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex-shrink-0 border-l border-surface-700 overflow-hidden"
          >
            <MediaLibraryPanel
              onSelect={handleLibrarySelect}
              selectedIds={mediaFiles.filter((f) => f.media).map((f) => f.media!.id)}
              className="h-full rounded-none border-0"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* 媒体预览模态框 */}
      <MediaPreviewModal
        isOpen={isPreviewOpen}
        onClose={closePreview}
        type={previewFile?.type || 'video'}
        src={previewFile?.thumbnailUrl || ''}
        title={previewFile?.name}
      />
    </div>
  )
}
