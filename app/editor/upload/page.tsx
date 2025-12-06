'use client'

import { useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence, Reorder } from 'framer-motion'
import {
  Upload,
  Video,
  ImageIcon,
  Plus,
  X,
  GripVertical,
  Play,
  Pause,
  Clock,
  FileVideo,
  Trash2,
  Sparkles,
  ChevronRight,
  Eye,
} from 'lucide-react'
import { Button, Card, Badge, Progress } from '@/components/ui'
import { MediaPreviewModal } from '@/components/media-preview-modal'
import { useEditor } from '../layout'

// ============================================
// 类型定义
// ============================================

interface MediaFile {
  id: string
  file: File
  name: string
  type: 'video' | 'image'
  size: number
  duration?: number
  thumbnailUrl: string
  uploadProgress: number
  isUploaded: boolean
  isMain: boolean
}

// ============================================
// 上传页面
// ============================================

export default function UploadPage() {
  const { goToNextStep, markStepCompleted, currentStep } = useEditor()
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const addMoreInputRef = useRef<HTMLInputElement>(null)
  
  // 预览状态
  const [previewFile, setPreviewFile] = useState<MediaFile | null>(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)

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

  // 处理文件选择
  const handleFileSelect = useCallback((files: FileList | null) => {
    if (!files) return

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

    // 模拟上传进度
    newFiles.forEach((mediaFile) => {
      simulateUpload(mediaFile.id)
    })
  }, [mediaFiles.length])

  // 模拟上传
  const simulateUpload = (fileId: string) => {
    setIsUploading(true)
    let progress = 0
    const interval = setInterval(() => {
      progress += Math.random() * 15
      if (progress >= 100) {
        progress = 100
        clearInterval(interval)
        setMediaFiles((prev) =>
          prev.map((f) =>
            f.id === fileId ? { ...f, uploadProgress: 100, isUploaded: true } : f
          )
        )
        setIsUploading(false)
      } else {
        setMediaFiles((prev) =>
          prev.map((f) => (f.id === fileId ? { ...f, uploadProgress: progress } : f))
        )
      }
    }, 200)
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

  // 格式化文件大小
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const hasFiles = mediaFiles.length > 0
  const allUploaded = mediaFiles.every((f) => f.isUploaded)

  return (
    <div className="h-full flex flex-col p-6 overflow-y-auto">
      {/* 页面标题 */}
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold text-surface-100 mb-2">
          上传素材
        </h1>
        <p className="text-surface-400">
          上传你的视频或图片素材，可以拖拽调整顺序，AI 将自动添加转场效果
        </p>
      </div>

      {/* 上传区域 */}
      <div className="flex-1 flex flex-col gap-6">
        {/* 拖拽上传区 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
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
              ${isDragging
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
                  <span className="ml-2 text-sm text-surface-500">
                    ({mediaFiles.length} 个文件)
                  </span>
                </h2>
                <Badge variant="info" size="sm">
                  <GripVertical className="w-3 h-3" />
                  拖拽调整顺序
                </Badge>
              </div>

              {/* 可排序列表 */}
              <Reorder.Group
                axis="y"
                values={mediaFiles}
                onReorder={setMediaFiles}
                className="space-y-3"
              >
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
                            <video
                              src={mediaFile.thumbnailUrl}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={mediaFile.thumbnailUrl}
                              alt={mediaFile.name}
                              className="w-full h-full object-cover"
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
                            <p className="text-sm font-medium text-surface-100 truncate">
                              {mediaFile.name}
                            </p>
                            {mediaFile.isMain && (
                              <Badge variant="primary" size="sm">
                                主素材
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-xs text-surface-500">
                            <span>{formatFileSize(mediaFile.size)}</span>
                            {mediaFile.duration && (
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {Math.floor(mediaFile.duration / 60)}:
                                {String(mediaFile.duration % 60).padStart(2, '0')}
                              </span>
                            )}
                          </div>
                          {/* 上传进度 */}
                          {!mediaFile.isUploaded && (
                            <Progress
                              value={mediaFile.uploadProgress}
                              size="sm"
                              variant="primary"
                              className="mt-2"
                            />
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
                            <Button
                              variant="ghost"
                              size="xs"
                              onClick={() => handleSetMain(mediaFile.id)}
                            >
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

        {/* 底部操作区 */}
        {hasFiles && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-auto pt-6 border-t border-surface-800"
          >
            <Card variant="glass" className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-400/10 flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-amber-400" />
                  </div>
                  <div>
                    <p className="font-medium text-surface-100">准备好了？</p>
                    <p className="text-sm text-surface-400">
                      AI 将分析你的 {mediaFiles.length} 个素材，智能提取精华内容
                    </p>
                  </div>
                </div>
                <Button
                  size="lg"
                  disabled={!allUploaded || isUploading}
                  isLoading={isUploading}
                  loadingText="上传中..."
                  rightIcon={<ChevronRight className="w-5 h-5" />}
                  onClick={handleStartAIAnalysis}
                >
                  开始 AI 分析
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </div>

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

